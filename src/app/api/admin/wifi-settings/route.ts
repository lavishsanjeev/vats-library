import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

const WIFI_PASSWORD_KEY = 'WIFI_PASSWORD';

export async function GET() {
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

        // Get WiFi password from settings
        const setting = await prisma.settings.findUnique({
            where: { key: WIFI_PASSWORD_KEY },
        });

        return NextResponse.json({ password: setting?.value || '' });
    } catch (error) {
        console.error('Error fetching WiFi password:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

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

        const { password } = await req.json();

        if (!password || typeof password !== 'string') {
            return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
        }

        // Upsert WiFi password
        await prisma.settings.upsert({
            where: { key: WIFI_PASSWORD_KEY },
            update: { value: password },
            create: { key: WIFI_PASSWORD_KEY, value: password },
        });

        // Get all active members
        const activeMembers = await prisma.user.findMany({
            where: {
                membership: {
                    status: 'ACTIVE',
                    expiryDate: {
                        gt: new Date()
                    }
                }
            },
            include: {
                membership: true
            }
        });

        // Send email notifications to active members
        if (activeMembers.length > 0) {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            // Send emails concurrently
            const emailPromises = activeMembers.map(async (member) => {
                try {
                    await transporter.sendMail({
                        from: process.env.SMTP_EMAIL,
                        to: member.email,
                        subject: 'WiFi Password Updated - Vats Library',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #2563eb;">WiFi Password Updated</h2>
                                <p>Hello ${member.name},</p>
                                <p>The WiFi password for Vats Library has been updated. Please use the new password below to connect your devices.</p>
                                
                                <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                    <h3 style="color: #1e40af; margin-top: 0; display: flex; align-items: center;">
                                        📶 New WiFi Password
                                    </h3>
                                    <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
                                        <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e293b; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                                            ${password}
                                        </p>
                                    </div>
                                    <p style="margin-top: 15px; font-size: 13px; color: #64748b;">
                                        ⚠️ This password is effective immediately. You may need to reconnect your devices.
                                    </p>
                                </div>
                                
                                <p style="color: #64748b; font-size: 14px;">If you have any questions, please contact the library administration.</p>
                            </div>
                        `,
                    });
                    console.log(`WiFi password email sent to: ${member.email}`);
                } catch (emailError) {
                    console.error(`Failed to send email to ${member.email}:`, emailError);
                }
            });

            // Wait for all emails to be sent (but don't fail if some fail)
            await Promise.allSettled(emailPromises);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving WiFi password:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
