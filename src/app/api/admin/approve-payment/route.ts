import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { getInvoiceHtml } from '@/lib/invoice-template';
import { generateInvoicePdf } from '@/lib/invoice-generator';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Admin
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!dbUser || dbUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { paymentId } = await req.json();

        // Update Payment Status
        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'SUCCESS' },
            include: { user: true },
        });

        // Activate Membership
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + 30); // 30 Days Validity

        await prisma.membership.upsert({
            where: { userId: payment.userId },
            update: {
                status: 'ACTIVE',
                startDate,
                expiryDate,
            },
            create: {
                userId: payment.userId,
                status: 'ACTIVE',
                startDate,
                expiryDate,
            },
        });

        // Get WiFi password from settings
        const wifiSetting = await prisma.settings.findUnique({
            where: { key: 'WIFI_PASSWORD' },
        });

        // Generate Invoice
        let pdfBuffer: Buffer | null = null;
        try {
            const invoiceHtml = getInvoiceHtml({
                invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                userName: payment.user.name || 'Valued Member',
                userEmail: payment.user.email,
                userClerkId: payment.user.clerkId,
                amount: payment.amount,
                periodStart: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                periodEnd: expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            });
            pdfBuffer = await generateInvoicePdf(invoiceHtml);
        } catch (err) {
            console.error('Error generating invoice PDF:', err);
            // Continue without invoice if generation fails, but log it
        }

        // Send Email to User
        if (payment.user.email) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            // 1. Send Membership Approval & WiFi Email
            await transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: payment.user.email,
                subject: 'Membership Approved - Vats Library',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #16a34a;">Membership Approved!</h2>
                        <p>Hello ${payment.user.name},</p>
                        <p>Your payment of <strong>₹${payment.amount}</strong> has been verified and your membership is now <strong>ACTIVE</strong>.</p>
                        <p>You can now access the library 24/7. Your digital pass is available in your dashboard.</p>
                        
                        ${wifiSetting?.value ? `
                        <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <h3 style="color: #1e40af; margin-top: 0; display: flex; align-items: center;">
                                📶 WiFi Access Details
                            </h3>
                            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
                                <p style="margin: 5px 0; color: #64748b; font-size: 14px;">WiFi Password:</p>
                                <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e293b; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                                    ${wifiSetting.value}
                                </p>
                            </div>
                            <p style="margin-top: 15px; font-size: 13px; color: #64748b;">
                                💡 Connect to the library WiFi network using this password for high-speed internet access.
                            </p>
                        </div>
                        ` : ''}
                        
                        <p>You will receive a separate email with your invoice shortly.</p>

                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
                    </div>
                `,
            });

            // 2. Send Invoice Email
            if (pdfBuffer) {
                await transporter.sendMail({
                    from: process.env.SMTP_EMAIL,
                    to: payment.user.email,
                    subject: 'Invoice - Vats Library',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #4f46e5;">Payment Invoice</h2>
                            <p>Hello ${payment.user.name},</p>
                            <p>Please find attached the invoice for your recent membership payment.</p>
                            <p>Thank you for choosing Vats Library!</p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: 'Invoice.pdf',
                            content: pdfBuffer,
                            contentType: 'application/pdf',
                        },
                    ],
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
