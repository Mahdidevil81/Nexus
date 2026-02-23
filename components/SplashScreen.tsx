import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-out fade-out fill-mode-forwards delay-[3000ms] duration-500">
      <div className="relative">
        <h1 className="text-6xl md:text-8xl font-bold tracking-[0.4em] text-white animate-in zoom-in duration-1000">
          NEXUS
        </h1>
        <div className="absolute -inset-2 bg-blue-500/20 blur-2xl animate-pulse -z-10"></div>
      </div>
      
      <p className="mt-6 text-lg md:text-xl font-light text-blue-400 tracking-[0.2em] opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-forwards italic font-serif">
        Mahdi Devil
      </p>
      
      <div className="mt-12 w-32 h-0.5 bg-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-full bg-blue-500 -translate-x-full animate-[loading_3s_ease-in-out_forwards]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;