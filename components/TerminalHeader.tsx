import React from 'react';
import { SystemStatus } from '../types';

interface TerminalHeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  status: SystemStatus;
}

const TerminalHeader: React.FC<TerminalHeaderProps> = ({ onMenuClick, onProfileClick, status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case SystemStatus.PROCESSING:
        return { color: 'bg-blue-500', label: 'SYNCING', pulse: 'animate-pulse' };
      case SystemStatus.ERROR:
        return { color: 'bg-red-500', label: 'ERROR', pulse: 'animate-ping' };
      default:
        return { color: 'bg-emerald-500', label: 'ONLINE', pulse: '' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="w-full relative py-3 mb-6 select-none">
      <div className="flex items-center justify-between">
        
        {/* Left: Status Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${status === SystemStatus.ERROR ? 'border-red-500/30 bg-red-500/10' : 'border-blue-500/30 bg-blue-500/10'} backdrop-blur-md`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.color} ${config.pulse}`}></div>
            <span className={`text-[10px] font-bold tracking-widest ${status === SystemStatus.ERROR ? 'text-red-400' : 'text-blue-400'}`}>
              {config.label}
            </span>
          </div>
          
          <button 
            onClick={onProfileClick}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="Profile Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </button>
        </div>

        {/* Right: Brand Identity & Menu */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end cursor-default">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-[0.2em] text-white leading-none">
                NEXUS
              </h1>
            </div>
            <p className="text-[8px] tracking-[0.15em] text-gray-500 uppercase font-light mt-1">
              Neural Synchronization
            </p>
          </div>
          
          <button 
            onClick={onMenuClick}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalHeader;