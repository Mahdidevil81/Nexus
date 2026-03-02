import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-out fade-out fill-mode-forwards delay-[3000ms] duration-500">
      <div className="relative group">
        <h1 className="text-7xl md:text-9xl font-black tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-fuchsia-500 animate-in zoom-in duration-1500 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          NEXUS
        </h1>
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-cyan-400 to-fuchsia-600 blur-3xl opacity-30 animate-pulse -z-10 group-hover:opacity-50 transition-opacity"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 animate-[scan_3s_linear_infinite]"></div>
      </div>
      
      <p className="mt-8 text-sm md:text-base font-medium text-gray-400 tracking-[0.4em] uppercase opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000 fill-mode-forwards">
        Architected by <span className="text-blue-400 font-bold">Mahdi Devil</span>
      </p>
      
      <div className="mt-16 w-48 h-px bg-white/5 relative overflow-hidden rounded-full">
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent -translate-x-full animate-[loading_3.5s_cubic-bezier(0.65,0,0.35,1)_forwards]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scan {
          0% { transform: translate(-50%, -100px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translate(-50%, 100px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;