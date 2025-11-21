import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DigitalPass from '@/components/DigitalPass';
import GPayButton from '@/components/GPayButton';
import DashboardRedirect from '@/components/DashboardRedirect';
import { Calendar, CreditCard, IndianRupee } from 'lucide-react';

export default async function DashboardPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect('/sign-in');
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
            membership: true,
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
        },
    });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                email: user.emailAddresses[0].emailAddress,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member',
            },
            include: {
                membership: true,
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
    }

    const membership = dbUser.membership;
    const hasActiveMembership = membership?.status === 'ACTIVE' &&
        membership.expiryDate &&
        new Date(membership.expiryDate) > new Date();

    return (
        <div className="container mx-auto px-4 py-8">
            <DashboardRedirect />
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
                <p className="text-muted-foreground mb-8">
                    Welcome back, {dbUser.name}!
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Membership Status & Pass */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Membership Status</h2>

                            {hasActiveMembership && membership ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse" />
                                        <span className="font-semibold">Active</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Start Date</p>
                                            <p className="font-semibold">
                                                {new Date(membership.startDate!).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Expires On</p>
                                            <p className="font-semibold">
                                                {new Date(membership.expiryDate!).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="h-3 w-3 bg-muted-foreground rounded-full" />
                                        <span className="font-semibold">No Active Membership</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Purchase a membership to access the library 24/7.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {hasActiveMembership ? 'Renew Membership' : 'Activate Membership'}
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Monthly Pass</span>
                                        <span className="text-2xl font-bold text-primary">₹100</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Valid for 30 days from payment date
                                    </p>
                                </div>
                                <GPayButton />
                                <p className="text-xs text-muted-foreground text-center">
                                    Secure payment via Google Pay (UPI)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Digital Pass & Payment History */}
                    <div className="space-y-6">
                        {hasActiveMembership && membership ? (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Your Digital Pass</h2>
                                <DigitalPass
                                    memberName={dbUser.name || 'Member'}
                                    memberId={dbUser.id.slice(-8).toUpperCase()}
                                    fullId={dbUser.id}
                                    expiryDate={membership.expiryDate!}
                                    status={membership.status}
                                />
                            </div>
                        ) : (
                            <div className="bg-card border border-border rounded-lg p-8 text-center">
                                <div className="text-muted-foreground mb-4">
                                    <Calendar className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">No Active Pass</p>
                                    <p className="text-sm mt-2">
                                        Purchase a membership to get your digital library pass
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Payment History */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment History</h2>
                            {dbUser.payments.length > 0 ? (
                                <div className="space-y-3">
                                    {dbUser.payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-full">
                                                    <CreditCard className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">Monthly Membership</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold flex items-center gap-1">
                                                    <IndianRupee className="h-3 w-3" />
                                                    {payment.amount}
                                                </p>
                                                <p className={`text-xs ${payment.status === 'SUCCESS'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {payment.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No payment history yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
