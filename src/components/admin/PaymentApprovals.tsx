'use client';

import { useState } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Payment {
    id: string;
    amount: number;
    transactionId: string | null;
    createdAt: Date;
    user: {
        name: string | null;
        email: string;
    };
}

export default function PaymentApprovals({ payments }: { payments: Payment[] }) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (paymentId: string, action: 'approve' | 'reject') => {
        setProcessingId(paymentId);
        try {
            const endpoint = action === 'approve'
                ? '/api/admin/approve-payment'
                : '/api/admin/reject-payment';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId }),
            });

            if (!response.ok) throw new Error('Action failed');

            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to process request');
        } finally {
            setProcessingId(null);
        }
    };

    if (payments.length === 0) return null;

    return (
        <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-8">
            <div className="p-6 border-b border-white/10 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Pending Payment Approvals</h2>
                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
                    {payments.length} Pending
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <p className="font-medium text-white">{payment.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{payment.user.email}</p>
                                </td>
                                <td className="p-4">
                                    <code className={`px-2 py-1 rounded text-sm font-mono ${payment.transactionId?.startsWith('CASH-')
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-white/10'
                                        }`}>
                                        {payment.transactionId?.startsWith('CASH-') ? 'CASH PAYMENT' : payment.transactionId}
                                    </code>
                                </td>
                                <td className="p-4 font-bold text-white">₹{payment.amount}</td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleAction(payment.id, 'approve')}
                                            disabled={!!processingId}
                                            className="relative p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50 overflow-hidden group"
                                            title="Approve"
                                        >
                                            {processingId === payment.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-shimmer"
                                                    style={{ backgroundSize: '200% 100%' }} />
                                            )}
                                            {processingId === payment.id ? (
                                                <div className="h-4 w-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                            ) : (
                                                <Check className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleAction(payment.id, 'reject')}
                                            disabled={!!processingId}
                                            className="relative p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50 overflow-hidden group"
                                            title="Reject"
                                        >
                                            {processingId === payment.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/30 to-transparent animate-shimmer"
                                                    style={{ backgroundSize: '200% 100%' }} />
                                            )}
                                            {processingId === payment.id ? (
                                                <div className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                            ) : (
                                                <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
