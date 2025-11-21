import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Search, Users, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminPage({
    searchParams,
}: {
    searchParams: { search?: string };
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
    const searchQuery = searchParams.search || '';
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
            (u) =>
                u.membership?.status === 'ACTIVE' &&
                u.membership.expiryDate &&
                new Date(u.membership.expiryDate) > new Date()
        ).length,
        inactive: users.filter(
            (u) =>
                !u.membership ||
                u.membership.status === 'INACTIVE' ||
                (u.membership.expiryDate && new Date(u.membership.expiryDate) <= new Date())
        ).length,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                <p className="text-muted-foreground mb-8">
                    Manage library members and memberships
                </p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Members</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <Users className="h-10 w-10 text-primary opacity-50" />
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Members</p>
                                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-600 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Inactive Members</p>
                                <p className="text-3xl font-bold mt-1 text-muted-foreground">
                                    {stats.inactive}
                                </p>
                            </div>
                            <XCircle className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <form method="GET" className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by name, email, or member ID..."
                                defaultValue={searchQuery}
                                className="w-full h-10 pl-10 pr-4 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 rounded-md font-medium transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Members Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-sm">Member</th>
                                    <th className="text-left p-4 font-semibold text-sm">Member ID</th>
                                    <th className="text-left p-4 font-semibold text-sm">Status</th>
                                    <th className="text-left p-4 font-semibold text-sm">Expiry Date</th>
                                    <th className="text-left p-4 font-semibold text-sm">Last Payment</th>
                                    <th className="text-left p-4 font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((member) => {
                                    const isActive =
                                        member.membership?.status === 'ACTIVE' &&
                                        member.membership.expiryDate &&
                                        new Date(member.membership.expiryDate) > new Date();

                                    return (
                                        <tr key={member.id} className="hover:bg-secondary/50">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium">{member.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <code className="text-xs bg-secondary px-2 py-1 rounded">
                                                    {member.id.slice(-8).toUpperCase()}
                                                </code>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {isActive ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-3 w-3" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {member.membership?.expiryDate
                                                    ? new Date(member.membership.expiryDate).toLocaleDateString(
                                                        'en-IN'
                                                    )
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {member.payments[0]
                                                    ? `₹${member.payments[0].amount} on ${new Date(
                                                        member.payments[0].createdAt
                                                    ).toLocaleDateString('en-IN')}`
                                                    : 'No payments'}
                                            </td>
                                            <td className="p-4">
                                                <form action="/api/admin/toggle-membership" method="POST">
                                                    <input type="hidden" name="userId" value={member.id} />
                                                    <button
                                                        type="submit"
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        {isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No members found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
