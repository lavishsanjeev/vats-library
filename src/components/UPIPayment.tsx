'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UPIPayment() {
    const router = useRouter();
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrSize, setQrSize] = useState(200);

    // Admin UPI Details
    const upiId = process.env.NEXT_PUBLIC_ADMIN_UPI || '9813995755@fam';
    const amount = '100';
    const name = 'Vats Library';

    // UPI Intent Link
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

    // Handle responsive QR code size
    useEffect(() => {
        const handleResize = () => {
            setQrSize(window.innerWidth < 768 ? 160 : 200);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/payment/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transactionId,
                    amount: 100,
                    method: 'UPI_MANUAL'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.details || data.error || 'Failed to submit payment');
            }

            alert('Payment submitted successfully! Admin will verify shortly.');
            setTransactionId('');
            router.refresh();
        } catch (error) {
            console.error('Payment submission error:', error);
            alert(error instanceof Error ? error.message : 'Failed to submit payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Scan to Pay</h3>
                <p className="text-gray-400 text-xs md:text-sm">Scan the QR code with any UPI app</p>
            </div>

            {/* QR Code Section */}
            <div className="flex justify-center mb-4 md:mb-6">
                <div className="p-3 md:p-4 bg-white rounded-xl shadow-lg">
                    <QRCodeCanvas
                        value={upiUrl}
                        size={qrSize}
                        level="H"
                        includeMargin={true}
                    />
                </div>
            </div>

            {/* UPI ID Display */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 mb-6">
                <div className="text-left">
                    <p className="text-xs text-gray-400">UPI ID</p>
                    <p className="text-sm font-mono text-white">{upiId}</p>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Copy UPI ID"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                    )}
                </button>
            </div>

            {/* Amount Display */}
            <div className="text-center mb-8">
                <p className="text-gray-400 text-sm mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-white">₹{amount}</p>
            </div>

            {/* Transaction ID Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="txnId" className="block text-sm font-medium text-gray-300 mb-1.5">
                        Enter Transaction ID / UTR
                    </label>
                    <input
                        id="txnId"
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 3245xxxxxxxx"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || !transactionId}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                            style={{ backgroundSize: '200% 100%' }} />
                    )}
                    {isSubmitting ? (
                        <>
                            <div className="relative flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span className="animate-pulse">Verifying...</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            Submit for Verification
                        </>
                    )}
                </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-4">
                *Admin will verify your payment and activate membership within 24 hours.
            </p>
        </div>
    );
}
