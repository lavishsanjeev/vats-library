'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Download, Wifi } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useRef, useState, useEffect } from 'react';

interface DigitalPassProps {
    memberName: string;
    memberId: string;
    fullId: string;
    expiryDate: Date;
    status: string;
}

export default function DigitalPass({
    memberName,
    memberId,
    fullId,
    expiryDate,
    status,
}: DigitalPassProps) {
    const passRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [qrValue, setQrValue] = useState('');

    useEffect(() => {
        // Generate the full verification URL
        // Ensure we are on the client to access window
        if (typeof window !== 'undefined') {
            setQrValue(`${window.location.origin}/verify/${fullId}`);
        }
    }, [fullId]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    };

    const handleDownload = async () => {
        if (!passRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(passRef.current, {
                scale: 3, // Higher quality
                backgroundColor: null,
                logging: false,
                useCORS: true,
                // ignoreElements: (element) => element.tagName === 'STYLE', // Optional: might help with some CSS issues
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `VatsLibrary-Pass-${memberId}.png`;
            link.click();
        } catch (error) {
            console.error('Error generating pass:', error);
            alert(`Failed to generate pass. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const isActive = status === 'ACTIVE';
    const isExpired = new Date() > new Date(expiryDate);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Card Container */}
            <div className="relative group perspective-1000">
                <div
                    ref={passRef}
                    id="digital-pass"
                    className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                            backgroundSize: '20px 20px'
                        }}></div>
                    </div>

                    {/* Gold/Premium Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 opacity-80" style={{
                        background: 'linear-gradient(to right, #ca8a04, #facc15, #ca8a04)'
                    }}></div>

                    {/* Card Content */}
                    <div className="relative h-full p-6 flex flex-col justify-between" style={{ color: '#ffffff' }}>
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold tracking-wider text-transparent bg-clip-text" style={{
                                    backgroundImage: 'linear-gradient(to right, #ffffff, #d1d5db)'
                                }}>
                                    VATS LIBRARY
                                </h2>
                                <p className="text-[10px] tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(234, 179, 8, 0.8)' }}>
                                    Premium Membership
                                </p>
                            </div>
                            <Wifi className="h-6 w-6 rotate-90" style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                        </div>

                        {/* Chip & Contactless */}
                        <div className="flex items-center gap-4 my-2">
                            <div className="w-12 h-9 rounded-md flex items-center justify-center overflow-hidden relative" style={{
                                background: 'linear-gradient(to bottom right, #fef08a, #ca8a04)',
                                borderColor: 'rgba(202, 138, 4, 0.5)',
                                borderWidth: '1px'
                            }}>
                                <div className="absolute inset-0 rounded-md m-[2px]" style={{ borderWidth: '0.5px', borderColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                                <div className="w-full h-[1px] absolute top-1/2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                                <div className="h-full w-[1px] absolute left-1/2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                            </div>
                        </div>

                        {/* Middle Section: QR Code & ID */}
                        <div className="flex justify-between items-end">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Member Name</p>
                                    <p className="font-medium text-lg tracking-wide uppercase text-shadow-sm" style={{ color: '#f3f4f6' }}>
                                        {memberName}
                                    </p>
                                </div>

                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>ID Number</p>
                                        <p className="font-mono text-sm" style={{ color: '#d1d5db' }}>{memberId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider" style={{ color: '#9ca3af' }}>Expires</p>
                                        <p className="font-mono text-sm" style={{ color: '#d1d5db' }}>{formatDate(expiryDate)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
                                {qrValue && (
                                    <QRCodeCanvas
                                        value={qrValue}
                                        size={80}
                                        level="H"
                                        includeMargin={false}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'linear-gradient(to top right, rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0))'
                    }}></div>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm px-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${isActive && !isExpired ? 'text-green-600' : 'text-red-600'}`}>
                        {isActive && !isExpired ? '● Active' : '● Inactive'}
                    </span>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                >
                    {isDownloading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {isDownloading ? 'Generating Pass...' : 'Download Card Pass'}
                </button>
            </div>
        </div>
    );
}
