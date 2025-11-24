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
                subject: 'Membership Approved - Vats Library',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #16a34a;">Membership Approved!</h2>
                        <p>Hello ${payment.user.name},</p>
                        <p>Your payment of <strong>₹${payment.amount}</strong> has been verified and your membership is now <strong>ACTIVE</strong>.</p>
                        <p>You can now access the library 24/7. Your digital pass is available in your dashboard.</p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Go to Dashboard</a>
                    </div>
                `,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
