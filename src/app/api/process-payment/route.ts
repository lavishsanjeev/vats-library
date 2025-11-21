import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { paymentToken } = body;

        // MOCK VERIFICATION: In a real app, we would verify the token with Google/PSP here.
        // For this demo, we assume if we got a token, the UPI payment was successful.

        console.log("Processing payment for user:", userId);
        console.log("Payment Token:", paymentToken);

        // 1. Ensure User exists in our DB
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: user.emailAddresses[0].emailAddress,
                    name: `${user.firstName} ${user.lastName}`,
                },
            });
        }

        // 2. Create Payment Record
        const payment = await prisma.payment.create({
            data: {
                userId: dbUser.id,
                amount: 100.00,
                status: 'SUCCESS',
                method: 'GPAY_UPI',
                transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            },
        });

        // 3. Update or Create Membership
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(startDate.getDate() + 30); // 30 days validity

        await prisma.membership.upsert({
            where: { userId: dbUser.id },
            update: {
                status: 'ACTIVE',
                startDate: startDate,
                expiryDate: expiryDate,
            },
            create: {
                userId: dbUser.id,
                status: 'ACTIVE',
                startDate: startDate,
                expiryDate: expiryDate,
            },
        });

        return NextResponse.json({ success: true, paymentId: payment.id });
    } catch (error) {
        console.error('[PAYMENT_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
