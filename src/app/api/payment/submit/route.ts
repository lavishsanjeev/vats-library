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
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to: process.env.ADMIN_EMAIL,
            subject: `New Payment Verification: ${dbUser.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">New Payment Submitted</h2>
                    <p style="font-size: 16px; color: #333;">A new payment request has been submitted for verification.</p>
                    
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>User:</strong> ${dbUser.name}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${dbUser.email}</p>
                        <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amount}</p>
                        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${transactionId}</span></p>
                    </div>

                    <p style="color: #64748b; font-size: 14px;">Please check your bank account for this transaction and approve the membership in the admin dashboard.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, payment });
    } catch (error) {
        console.error('Payment submission error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
