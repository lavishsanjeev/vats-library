'use client';

import { useState } from 'react';
import UPIPayment from '@/components/UPIPayment';
import CashPayment from '@/components/CashPayment';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function PaymentPage() {
    const { user, isLoaded } = useUser();
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');

    if (isLoaded && !user) {
        redirect('/sign-in?redirect_url=/payment');
    }

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center px-4 py-20 md:p-4 relative overflow-hidden w-full">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-grid-white opacity-10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Complete Membership</h1>
                    <p className="text-gray-400">Choose your preferred payment method.</p>
                </div>

                {/* Payment Method Toggle */}
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-8">
                    <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentMethod === 'UPI'
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Scan & Pay
                    </button>
                    <button
                        onClick={() => setPaymentMethod('CASH')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentMethod === 'CASH'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Cash Payment
                    </button>
                </div>

                {paymentMethod === 'UPI' ? <UPIPayment /> : <CashPayment />}

                <div className="mt-8 text-center">
                    <a href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
