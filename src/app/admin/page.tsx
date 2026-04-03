import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Search, Users, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import PaymentApprovals from '@/components/admin/PaymentApprovals';
import WiFiSettings from '@/components/admin/WiFiSettings';

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>;
}) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect('/sign-in');
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    // Get all users with their memberships
    const { search } = await searchParams;
    const searchQuery = search || '';
    const users = await prisma.user.findMany({
        where: searchQuery
            ? {
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { email: { contains: searchQuery, mode: 'insensitive' } },
                    { id: { contains: searchQuery, mode: 'insensitive' } },
                ],
            }
            : {},
        include: {
            membership: true,
            payments: {
                orderBy: { createdAt: 'desc' },
                take: 1,
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    const stats = {
        total: users.length,
        active: users.filter(
            (u: typeof users[0]) =>
                u.membership?.status === 'ACTIVE' &&
                u.membership.expiryDate &&
                new Date(u.membership.expiryDate) > new Date()
        ).length,
        inactive: users.filter(
            (u: typeof users[0]) =>
                !u.membership ||
                u.membership.status === 'INACTIVE' ||
                (u.membership.expiryDate && new Date(u.membership.expiryDate) <= new Date())
        ).length,
    };

    // Calculate Monthly Revenue
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true,
        },
        where: {
            status: 'SUCCESS',
            createdAt: {
                gte: currentMonthStart,
            },
        },
    });

    // Get pending payments
    const pendingPayments = await prisma.payment.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen p-4 md:p-8 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage library members and monitor activity
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-white/5">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium">System Operational</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:bg-card/80">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="h-24 w-24" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                        <p className="text-4xl font-bold mt-2">{stats.total}</p>
                        <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" />
                        </div>
                    </div>

                    <div className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:bg-card/80">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle className="h-24 w-24 text-green-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Active Memberships</p>
                        <p className="text-4xl font-bold mt-2 text-green-500">{stats.active}</p>
                        <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:bg-card/80">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <XCircle className="h-24 w-24 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Inactive / Expired</p>
                        <p className="text-4xl font-bold mt-2 text-muted-foreground">{stats.inactive}</p>
                        <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-red-500 transition-all duration-500"
                                style={{ width: `${stats.total ? (stats.inactive / stats.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:bg-card/80">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <IndianRupee className="h-24 w-24 text-yellow-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                        <p className="text-4xl font-bold mt-2 text-yellow-500">₹{monthlyRevenue._sum.amount || 0}</p>
                        <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 w-full" />
                        </div>
                    </div>
                </div>

                {/* WiFi Settings Section */}
                <WiFiSettings />

                {/* Payment Approvals Section */}
                <PaymentApprovals payments={pendingPayments} />

                {/* Search & Filter */}
                <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <form method="GET" className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search members by name, email, or ID..."
                                defaultValue={searchQuery}
                                className="w-full h-12 pl-12 pr-4 bg-background/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all flex items-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </form>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold px-1">Member Directory</h2>

                    {/* Mobile View (Cards) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {users.map((member: any) => {
                            const isActive =
                                member.membership?.status === 'ACTIVE' &&
                                member.membership.expiryDate &&
                                new Date(member.membership.expiryDate) > new Date();

                            return (
                                <div key={member.id} className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{member.name}</h3>
                                            <p className="text-sm text-muted-foreground break-all">{member.email}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm py-3 border-y border-white/5">
                                        <div>
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">ID</p>
                                            <p className="font-mono text-xs mt-1">{member.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Expires</p>
                                            <p className="mt-1">
                                                {member.membership?.expiryDate
                                                    ? new Date(member.membership.expiryDate).toLocaleDateString('en-IN')
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Last Payment</p>
                                            <p className="mt-1">
                                                {member.payments[0]
                                                    ? `₹${member.payments[0].amount} • ${new Date(member.payments[0].createdAt).toLocaleDateString('en-IN')}`
                                                    : 'No history'}
                                            </p>
                                        </div>
                                    </div>

                                    <form action="/api/admin/toggle-membership" method="POST" className="w-full">
                                        <input type="hidden" name="userId" value={member.id} />
                                        <button
                                            type="submit"
                                            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${isActive
                                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                                                }`}
                                        >
                                            {isActive ? 'Deactivate Membership' : 'Activate Membership'}
                                        </button>
                                    </form>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="text-left p-5 font-semibold text-sm text-muted-foreground">Member Details</th>
                                        <th className="text-left p-5 font-semibold text-sm text-muted-foreground">Status</th>
                                        <th className="text-left p-5 font-semibold text-sm text-muted-foreground">Membership Info</th>
                                        <th className="text-left p-5 font-semibold text-sm text-muted-foreground">Last Payment</th>
                                        <th className="text-right p-5 font-semibold text-sm text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((member: any) => {
                                        const isActive =
                                            member.membership?.status === 'ACTIVE' &&
                                            member.membership.expiryDate &&
                                            new Date(member.membership.expiryDate) > new Date();

                                        return (
                                            <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                            {member.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{member.name}</p>
                                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                                            <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {member.id.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${isActive
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                        <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-sm">
                                                        <p className="text-muted-foreground text-xs">Expires On</p>
                                                        <p className="font-medium mt-0.5">
                                                            {member.membership?.expiryDate
                                                                ? new Date(member.membership.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : 'No active plan'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-sm">
                                                        {member.payments[0] ? (
                                                            <>
                                                                <p className="font-medium">₹{member.payments[0].amount}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {new Date(member.payments[0].createdAt).toLocaleDateString('en-IN')}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <span className="text-muted-foreground italic">No payments</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <form action="/api/admin/toggle-membership" method="POST">
                                                        <input type="hidden" name="userId" value={member.id} />
                                                        <button
                                                            type="submit"
                                                            className={`text-sm font-medium hover:underline transition-all ${isActive ? 'text-red-400' : 'text-green-400'
                                                                }`}
                                                        >
                                                            {isActive ? 'Deactivate' : 'Activate Access'}
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-20 bg-card/30 border border-white/10 rounded-2xl">
                            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold">No members found</h3>
                            <p className="text-muted-foreground">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
