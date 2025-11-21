import { prisma } from '@/lib/prisma';
import { CheckCircle2, XCircle, Calendar, User, Hash } from 'lucide-react';
import Link from 'next/link';

interface VerifyPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            membership: true,
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Invalid Pass</h1>
                        <p className="text-gray-500 mt-2">
                            No member found with this ID.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="block w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    const membership = user.membership;
    const isActive = membership?.status === 'ACTIVE';
    const isExpired = membership?.expiryDate ? new Date(membership.expiryDate) < new Date() : true;
    const isValid = isActive && !isExpired;

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">
                {/* Header Status */}
                <div className={`px-8 py-10 text-center ${isValid ? 'bg-green-600' : 'bg-red-600'}`}>
                    <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                        {isValid ? (
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        ) : (
                            <XCircle className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        {isValid ? 'Verified Member' : 'Invalid / Expired'}
                    </h1>
                    <p className="text-white/80 mt-2 font-medium">
                        {isValid ? 'Access Granted' : 'Access Denied'}
                    </p>
                </div>

                {/* Member Details */}
                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</p>
                                <p className="text-lg font-bold text-gray-900">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Hash className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Member ID</p>
                                <p className="text-lg font-mono font-bold text-gray-900">
                                    {user.id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>

                        {membership && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Valid From</p>
                                    <p className="font-semibold text-gray-900">
                                        {membership.startDate ? new Date(membership.startDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit'
                                        }) : '-'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Expires On</p>
                                    <p className={`font-semibold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                        {membership.expiryDate ? new Date(membership.expiryDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit'
                                        }) : '-'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">
                            Verified by Vats Library System
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                            {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
