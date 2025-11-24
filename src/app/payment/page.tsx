import UPIPayment from '@/components/UPIPayment';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function PaymentPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in?redirect_url=/payment');
    }

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
                    <p className="text-gray-400">Scan the QR code to activate your access.</p>
                </div>

                <UPIPayment />

                <div className="mt-8 text-center">
                    <a href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
                        &larr; Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
