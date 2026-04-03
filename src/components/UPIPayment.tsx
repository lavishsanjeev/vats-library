'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Loader2, Send, ScanLine, ShieldCheck, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UPIPayment() {
    const router = useRouter();
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [qrSize, setQrSize] = useState(220);

    // Admin UPI Details
    const upiId = process.env.NEXT_PUBLIC_ADMIN_UPI || 'vatssachin2002@okicici';
    const amount = '100';
    const name = 'Vats Library';

    // UPI Intent Link
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

    // Handle responsive QR code size
    useEffect(() => {
        const handleResize = () => {
            setQrSize(window.innerWidth < 768 ? 180 : 220);
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
        <div className="w-full max-w-md mx-auto relative group">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-4 ring-1 ring-white/10">
                        <Smartphone className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                        Scan & Pay
                    </h3>
                    <p className="text-gray-400 text-sm">Use any UPI app to complete payment</p>
                </div>

                {/* QR Code Card - Custom Design */}
                <div className="flex justify-center mb-8 relative">
                    <div className="relative p-6 bg-[#FDE047] rounded-3xl shadow-2xl transform transition-transform hover:scale-105 duration-300 w-full max-w-[280px]">
                        {/* Library Quote */}
                        <div className="absolute top-5 left-0 w-full text-center">
                            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest">"Please Keep The Library Clean"</p>
                        </div>

                        <div className="mt-8 mb-2 flex justify-center">
                            <QRCodeCanvas
                                value={upiUrl}
                                size={qrSize}
                                level="H"
                                includeMargin={false}
                                bgColor="#FDE047"
                                fgColor="#000000"
                                imageSettings={{
                                    src: "https://cdn-icons-png.flaticon.com/512/10103/10103286.png", // Generic UPI icon
                                    x: undefined,
                                    y: undefined,
                                    height: 40,
                                    width: 40,
                                    excavate: true,
                                }}
                            />
                        </div>

                        {/* Branding Footer */}
                        <div className="flex items-center justify-center gap-3 mt-4 opacity-90">
                            <div className="flex flex-col items-center">
                                <span className="text-black font-extrabold text-lg tracking-tighter leading-none">VATS</span>
                                <span className="text-black/70 text-[0.6rem] font-bold tracking-widest uppercase leading-none">LIBRARY</span>
                            </div>
                            <div className="h-6 w-px bg-black/20" />
                            <div className="flex flex-col">
                                <span className="text-black font-bold text-sm leading-none">UPI</span>
                                <span className="text-[0.5rem] text-black/60 leading-none">PAYMENTS</span>
                            </div>
                        </div>

                        {/* Corner Accents (Subtle) */}
                        <div className="absolute top-0 left-0 w-full h-full rounded-3xl border-[3px] border-white/20 pointer-events-none" />
                    </div>
                </div>

                {/* UPI ID Display */}
                <div className="relative group/copy cursor-pointer" onClick={copyToClipboard}>
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4 mb-6 hover:bg-white/10 transition-colors">
                        <div className="text-left overflow-hidden">
                            <p className="text-xs text-gray-400 mb-1">UPI ID</p>
                            <p className="text-sm font-mono text-white truncate">{upiId}</p>
                        </div>
                        <div className={`p-2 rounded-lg transition-all duration-300 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 group-hover/copy:text-white'}`}>
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </div>
                    </div>
                    {copied && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs py-1 px-3 rounded-full animate-fade-in-up">
                            Copied!
                        </div>
                    )}
                </div>

                {/* Amount Display */}
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Amount</p>
                        <div className="flex items-baseline justify-center gap-1 text-white">
                            <span className="text-lg font-medium text-gray-400">₹</span>
                            <span className="text-4xl font-bold tracking-tight">{amount}</span>
                        </div>
                    </div>
                </div>

                {/* Transaction ID Form */}
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="space-y-2">
                        <label htmlFor="txnId" className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                            <ScanLine className="h-4 w-4 text-primary" />
                            Transaction Details
                        </label>
                        <div className="relative">
                            <input
                                id="txnId"
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="Enter 12-digit Transaction ID / UTR"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !transactionId}
                        className="w-full bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Verifying Payment...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-5 w-5" />
                                <span>Submit for Verification</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Secure Payment Gateway
                </div>
            </div>
        </div>
    );
}
