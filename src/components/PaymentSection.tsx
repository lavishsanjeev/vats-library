'use client';

import { useState } from 'react';
import UPIPayment from '@/components/UPIPayment';
import CashPayment from '@/components/CashPayment';

export default function PaymentSection() {
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('UPI');

    return (
        <div className="space-y-4">
            {/* Payment Method Toggle */}
            <div className="flex p-1 bg-secondary/50 border border-border rounded-xl">
                <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentMethod === 'UPI'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Scan & Pay
                </button>
                <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${paymentMethod === 'CASH'
                            ? 'bg-green-600 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Cash Payment
                </button>
            </div>

            {paymentMethod === 'UPI' ? (
                <>
                    <UPIPayment />
                    <p className="text-xs text-muted-foreground text-center">
                        Scan QR to Pay & Verify
                    </p>
                </>
            ) : (
                <CashPayment />
            )}
        </div>
    );
}
