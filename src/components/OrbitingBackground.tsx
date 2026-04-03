import React from 'react';

const OrbitingBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none flex items-center justify-center bg-[#030014]">
            {/* Central Glow */}
            <div className="absolute w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-pulse-slow" />

            {/* Core */}
            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-slate-900 to-black rounded-full border border-slate-800 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,1)] animate-pulse" />
                </div>
            </div>

            {/* Ring 1 - Small */}
            <div className="absolute border border-slate-800/50 rounded-full w-[250px] h-[250px] animate-spin-slow">
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center transform -translate-y-1/2 shadow-lg shadow-purple-900/20">
                    <span className="text-[10px]">⚡</span>
                </div>
            </div>

            {/* Ring 2 - Medium */}
            <div className="absolute border border-slate-800/30 rounded-full w-[450px] h-[450px] animate-spin-reverse-slower">
                <div className="absolute top-0 left-1/2 w-10 h-10 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-blue-900/20">
                    <span className="text-xs">🚀</span>
                </div>
                <div className="absolute bottom-1/4 right-[15%] w-4 h-4 bg-blue-500 rounded-full blur-[1px] shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            </div>

            {/* Ring 3 - Large */}
            <div className="absolute border border-slate-800/20 rounded-full w-[700px] h-[700px] animate-spin-slowest">
                <div className="absolute bottom-1/2 -left-5 w-12 h-12 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center transform -translate-y-1/2 shadow-lg shadow-orange-900/20">
                    <span className="text-sm">✨</span>
                </div>
                <div className="absolute top-1/4 right-[10%] w-3 h-3 bg-orange-500 rounded-full blur-[1px] shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
            </div>

            {/* Ring 4 - Extra Large */}
            <div className="absolute border border-slate-800/10 rounded-full w-[1000px] h-[1000px] animate-spin-reverse-super-slow">
                <div className="absolute top-[15%] left-[15%] w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs">🪐</span>
                </div>
            </div>

        </div>
    );
};

export default OrbitingBackground;
