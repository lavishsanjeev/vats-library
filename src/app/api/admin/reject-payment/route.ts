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
            data: { status: 'FAILED' },
            include: { user: true },
        });

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

            await transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: payment.user.email,
                subject: 'Payment Verification Failed - Vats Library',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #dc2626;">Payment Rejected</h2>
                        <p>Hello ${payment.user.name},</p>
                        <p>We could not verify your payment of <strong>₹${payment.amount}</strong> with Transaction ID: <code>${payment.transactionId}</code>.</p>
                        <p>If you believe this is a mistake, please contact the admin or try submitting again with the correct details.</p>
                    </div>
                `,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Rejection error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
