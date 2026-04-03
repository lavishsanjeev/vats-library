import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId, amount, method } = await req.json();

        if (!transactionId) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        // Check if transaction ID already exists
        const existingPayment = await prisma.payment.findUnique({
            where: { transactionId },
        });

        if (existingPayment) {
            return NextResponse.json({ error: 'Transaction ID already submitted' }, { status: 400 });
        }

        // Check if user already has a pending payment
        // First get the user's database ID using Clerk ID
        const userRecord = await prisma.user.findUnique({
            where: { clerkId: userId }
        });

        if (userRecord) {
            const pendingPayment = await prisma.payment.findFirst({
                where: {
                    userId: userRecord.id,
                    status: 'PENDING'
                }
            });

            if (pendingPayment) {
                return NextResponse.json({
                    error: 'You already have a pending payment request. Please wait for admin approval.'
                }, { status: 400 });
            }
        }

        // Ensure user exists in DB
        const dbUser = await prisma.user.upsert({
            where: { clerkId: userId },
            update: {
                email: user.emailAddresses[0].emailAddress, // Update email if changed
            },
            create: {
                clerkId: userId,
                email: user.emailAddresses[0].emailAddress,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
                role: 'STUDENT',
            },
        });

        // Create Payment Record
        const payment = await prisma.payment.create({
            data: {
                userId: dbUser.id,
                amount: parseFloat(amount),
                currency: 'INR',
                status: 'PENDING',
                method: method || 'UPI_MANUAL',
                transactionId,
            },
        });

        // Send Email to Admin
        try {
            // Fetch all admins
            const admins = await prisma.user.findMany({
                where: { role: 'ADMIN' },
                select: { email: true }
            });

            const adminEmails = admins.map(a => a.email);

            if (adminEmails.length === 0) {
                console.warn('⚠️ No admins found to send notification email to.');
            } else {
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.SMTP_EMAIL,
                        pass: process.env.SMTP_PASSWORD,
                    },
                });

                const submissionTime = new Date().toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });

                const mailOptions = {
                    from: process.env.SMTP_EMAIL,
                    to: adminEmails, // Send to all admins
                    subject: `🔔 New Payment Request - ${dbUser.name}`,
                    html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 New Payment Request</h2>
                        </div>
                        
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                            <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Action Required</p>
                            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">A new payment has been submitted and requires your verification.</p>
                        </div>

                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Payment Details</h3>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">User Name:</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${dbUser.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${dbUser.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount:</td>
                                    <td style="padding: 8px 0; color: #16a34a; font-weight: 700; font-size: 18px;">₹${amount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Transaction ID:</td>
                                    <td style="padding: 8px 0;">
                                        <span style="font-family: 'Courier New', monospace; background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 13px; font-weight: 600;">${transactionId}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Payment Method:</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${method || 'UPI_MANUAL'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Submitted:</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${submissionTime}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
                               style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 0 8px 10px 8px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);">
                                ✅ Go to Admin Panel
                            </a>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                                💡 <strong>Next Steps:</strong><br>
                                1. Verify the transaction in your bank account<br>
                                2. Go to the admin panel to approve or reject this payment<br>
                                3. User will be notified automatically via email
                            </p>
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                Vats Library Management System<br>
                                This is an automated notification email
                            </p>
                        </div>
                    </div>
                `,
                };

                await transporter.sendMail(mailOptions);
                console.log(`✅ Admin notification sent successfully to: ${adminEmails.join(', ')}`);
            }
        } catch (emailError) {
            console.error('❌ Failed to send admin notification:', emailError);
            // Don't fail the payment submission if email fails
        }

        return NextResponse.json({ success: true, payment });
    } catch (error) {
        console.error('Payment submission error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
