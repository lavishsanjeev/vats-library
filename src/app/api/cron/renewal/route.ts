import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
    try {
        // Check for a secret key to prevent unauthorized access (optional but recommended)
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        // Simple protection: require a key 'vats-library-cron'
        if (key !== 'vats-library-cron') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find users with inactive membership
        const inactiveMemberships = await prisma.membership.findMany({
            where: {
                status: 'INACTIVE',
            },
            include: {
                user: true,
            },
        });

        if (inactiveMemberships.length === 0) {
            return NextResponse.json({ message: 'No inactive memberships found' });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        let emailCount = 0;

        for (const membership of inactiveMemberships) {
            if (!membership.user.email) continue;

            const mailOptions = {
                from: process.env.SMTP_EMAIL,
                to: membership.user.email,
                subject: '📚 Vats Library - Membership Renewal Reminder',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
                            <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Membership Expired</h2>
                        </div>
                        
                        <p style="color: #333; font-size: 16px;">Hello <strong>${membership.user.name || 'Member'}</strong>,</p>
                        
                        <p style="color: #555; line-height: 1.6;">
                            We noticed that your membership at <strong>Vats Library</strong> is currently <strong>Inactive</strong>.
                            To continue enjoying our 24/7 study facilities, high-speed WiFi, and comfortable environment, please renew your membership.
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/payment" 
                               style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);">
                                🔄 Renew Now
                            </a>
                        </div>

                        <p style="color: #777; font-size: 14px; text-align: center;">
                            If you have already paid, please ignore this email or contact the admin.
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                Vats Library Management System
                            </p>
                        </div>
                    </div>
                `,
            };

            try {
                await transporter.sendMail(mailOptions);
                emailCount++;
                console.log(`✅ Renewal email sent to: ${membership.user.email}`);
            } catch (error) {
                console.error(`❌ Failed to send email to ${membership.user.email}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sent renewal emails to ${emailCount} inactive members`,
            totalInactive: inactiveMemberships.length
        });

    } catch (error) {
        console.error('Renewal cron error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
