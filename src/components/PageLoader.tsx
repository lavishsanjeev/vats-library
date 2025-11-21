'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function PageLoader() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + Math.random() * 25;
            });
        }, 100);

        // Hide loader after animation completes
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030014] loader-container">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute inset-0 bg-grid-white opacity-10" />
            </div>

            {/* Main Loader Content */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* 3D Rotating Book Icon */}
                <div className="relative">
                    <div className="loader-3d">
                        <div className="book-container">
                            <BookOpen className="h-20 w-20 text-primary" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Orbiting Particles */}
                    <div className="orbit-container">
                        <div className="orbit-ring">
                            <div className="particle particle-1"></div>
                            <div className="particle particle-2"></div>
                            <div className="particle particle-3"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white hero-text animate-pulse-text">
                        Vats Library
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-purple-400 to-primary rounded-full transition-all duration-300 ease-out glow-bar"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* Percentage */}
                <div className="text-sm text-gray-400 font-mono">
                    {Math.min(Math.round(progress), 100)}%
                </div>
            </div>
        </div>
    );
}
