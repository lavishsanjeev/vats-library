'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2 } from 'lucide-react';

export default function JoinButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        // Simulate loading for effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/dashboard');
    };

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="btn-3d w-full bg-white text-black h-12 rounded-xl flex items-center justify-center font-bold transition-all relative z-10 hover:bg-gray-100 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
                style={{ boxShadow: '0px 10px 0px 0px #9ca3af, 0px 10px 20px rgba(0,0,0,0.4)' }}
            >
                {isLoading ? 'Processing...' : 'Join Now'}
            </button>

            {/* Full Screen Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-[#030014]/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="relative">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />

                        {/* Icon Container */}
                        <div className="relative bg-black/50 border border-white/10 p-8 rounded-full shadow-2xl">
                            <BookOpen className="h-16 w-16 text-primary animate-bounce" />
                        </div>

                        {/* Spinning Ring */}
                        <div className="absolute inset-0 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>

                    <h3 className="mt-8 text-2xl font-bold text-white tracking-wider animate-pulse">
                        VATS LIBRARY
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">Preparing your membership...</p>
                </div>
            )}
        </>
    );
}
