import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if requester is admin
        const admin = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const formData = await req.formData();
        const targetUserId = formData.get('userId') as string;

        if (!targetUserId) {
            return new NextResponse("Missing userId", { status: 400 });
        }

        // Get target user's membership
        const membership = await prisma.membership.findUnique({
            where: { userId: targetUserId },
        });

        if (!membership) {
            // Create inactive membership
            await prisma.membership.create({
                data: {
                    userId: targetUserId,
                    status: 'INACTIVE',
                },
            });
        } else {
            // Toggle status
            const newStatus = membership.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const updates: any = { status: newStatus };

            if (newStatus === 'ACTIVE' && !membership.expiryDate) {
                // If activating and no expiry, set 30 days from now
                const startDate = new Date();
                const expiryDate = new Date();
                expiryDate.setDate(startDate.getDate() + 30);
                updates.startDate = startDate;
                updates.expiryDate = expiryDate;
            }

            await prisma.membership.update({
                where: { userId: targetUserId },
                data: updates,
            });
        }

        return NextResponse.redirect(new URL('/admin', req.url));
    } catch (error) {
        console.error('[ADMIN_TOGGLE_ERROR]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
