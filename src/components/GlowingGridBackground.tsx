import React from 'react';

const GlowingGridBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#030014]">
            {/* 1. Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px] opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }} />

            {/* 2. Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            {/* Fallback/Custom Grid if image missing - using CSS gradient */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(to right, #4f4f4f2e 1px, transparent 1px), linear-gradient(to bottom, #4f4f4f2e 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
                }}
            />

            {/* 3. Floating "Tech" Blocks */}
            {/* Top Left Cluster */}
            <div className="absolute top-20 left-20 w-2 h-2 bg-sky-500/50 rounded-sm animate-ping" />
            <div className="absolute top-24 left-24 w-1 h-1 bg-white/30" />
            <div className="absolute top-10 left-1/4 w-32 h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent opacity-50" />

            {/* Bottom Right Cluster */}
            <div className="absolute bottom-32 right-32 w-4 h-4 border border-sky-500/30 rounded-sm rotate-45" />
            <div className="absolute bottom-40 right-20 w-20 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />

            {/* Random Blocks */}
            <div className="absolute top-1/3 left-10 w-6 h-6 border-l-2 border-t-2 border-sky-500/20 rounded-tl-lg" />
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-sky-400/40 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />

            {/* Center Subtle Highlight */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-900/10 blur-[100px] rounded-full pointer-events-none" />
        </div>
    );
};

export default GlowingGridBackground;
