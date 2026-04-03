'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Send, Loader2 } from 'lucide-react';

export default function CashPayment() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/payment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionId: `CASH-${Date.now()}`, // Generate a unique ID for cash payments
                    amount: 100,
                    method: 'CASH'
                }),
            });

            let data;
            const responseText = await response.text();

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON response:', responseText);
                throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
            }

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to submit payment');
            }

            alert('Cash payment request submitted! Please pay ₹100 to the admin at the library desk.');
            router.refresh();
        } catch (error) {
            console.error('Payment submission error:', error);
            alert(error instanceof Error ? error.message : 'Failed to submit payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-xl text-center">
            <div className="mb-6">
                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Banknote className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pay with Cash</h3>
                <p className="text-gray-400 text-sm">
                    Submit a request and pay ₹100 at the library desk.
                    <br />
                    Your membership will be activated after admin approval.
                </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-sm mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-white">₹100</p>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        Submit Cash Request
                    </>
                )}
            </button>
        </div>
    );
}
