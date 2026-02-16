import React from 'react';

const TerminalHeader: React.FC = () => {
  return (
    <div className="w-full relative py-4 mb-2 select-none">
      <div className="flex items-center justify-between px-2 md:px-4">
        
        {/* Left: Brand Identity */}
        <div className="flex flex-col group cursor-default">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-md border border-white/20 bg-black/50 backdrop-blur-md group-hover:border-white/50 transition-colors duration-500">
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white relative z-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest text-white leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-400 transition-all duration-300 font-sans">
                پلتفرم نکسوس
              </h1>
              <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase font-light group-hover:text-gray-300 transition-colors">
                Nexus OS v2.5
              </p>
            </div>
          </div>
        </div>

        {/* Right: System Status HUD */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex flex-col items-end text-[10px] text-gray-600 font-mono">
            <span className="tracking-widest">SIGNAL: QUANTUM</span>
            <span className="tracking-widest">FREQ: 110-396Hz</span>
          </div>
          
          <div className="flex items-center gap-2 border border-white/10 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <span className="text-xs font-mono text-gray-300 tracking-wider">SYNCED</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-white/10 overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-[shimmer_3s_infinite_linear] -translate-x-full"></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default TerminalHeader;