import React from 'react';
import { 
  User, 
  Languages, 
  Monitor, 
  Maximize2, 
  Menu, 
  History, 
  Cpu,
  Fingerprint,
  FolderArchive,
  Network
} from 'lucide-react';
import { SystemStatus } from '../types';

interface TerminalHeaderProps {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  onLanguageToggle?: () => void;
  onDesktopToggle?: () => void;
  onArchiveClick?: () => void;
  onKnowledgeMapClick?: () => void;
  onPremiumClick?: () => void;
  isDesktopMode?: boolean;
  status: SystemStatus;
  language: string;
  isPremium?: boolean;
}

const TerminalHeader: React.FC<TerminalHeaderProps> = ({ 
  onMenuClick, 
  onProfileClick, 
  onLanguageToggle, 
  onDesktopToggle, 
  onArchiveClick, 
  onKnowledgeMapClick,
  onPremiumClick,
  isDesktopMode, 
  status, 
  language,
  isPremium
}) => {
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
        
        {/* Left: Status Badge & Settings Dropdown */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`flex items-center gap-2 px-2.5 md:px-3 py-1 rounded-full border ${status === SystemStatus.ERROR ? 'border-red-500/30 bg-red-500/10' : 'border-blue-500/30 bg-blue-500/10'} backdrop-blur-md`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.color} ${config.pulse}`}></div>
            <span className={`text-[9px] md:text-[10px] font-bold tracking-widest ${status === SystemStatus.ERROR ? 'text-red-400' : 'text-blue-400'}`}>
              {config.label}
            </span>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={onProfileClick}
              className="p-2.5 md:p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-lg group"
              title="Profile Settings (P)"
            >
              <User size={16} strokeWidth={1.5} className="group-hover:scale-110 transition-transform md:w-[18px] md:h-[18px]" />
            </button>

            {/* Language Toggle - Compact on mobile */}
            <button 
              onClick={onLanguageToggle}
              className="px-2.5 md:px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all active:scale-95 uppercase flex items-center gap-1.5 md:gap-2"
            >
              <Languages size={12} className="md:w-[14px] md:h-[14px]" />
              <span className="hidden xs:inline">{language === 'en' ? 'FA' : 'EN'}</span>
            </button>

            {/* Premium / Upgrade Button */}
            <button 
              onClick={onPremiumClick}
              className={`px-2.5 md:px-3 py-1.5 rounded-full border transition-all active:scale-95 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 shadow-lg ${
                isPremium 
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-yellow-500/40 text-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.25)]' 
                  : 'bg-gradient-to-r from-yellow-500/10 via-amber-500/20 to-yellow-500/10 border-yellow-500/30 text-yellow-500/90 hover:text-white hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]'
              }`}
              title={isPremium ? "Premium Activated" : "Upgrade to Premium"}
            >
              <span className={isPremium ? "scale-110" : "animate-bounce"}>💎</span>
              <span>{isPremium ? (language === 'en' ? 'PREMIUM' : 'پرمیوم') : (language === 'en' ? 'UPGRADE' : 'ارتقا')}</span>
            </button>

            {/* Consolidate secondary controls on tiny screens or keep them desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={onDesktopToggle}
                className={`p-2.5 md:p-3 rounded-full border transition-all active:scale-95 ${isDesktopMode ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-blue-500/30'}`}
                title="Toggle Desktop Mode"
              >
                <Monitor size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
              </button>

              <button 
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                    });
                  } else {
                    if (document.exitFullscreen) {
                      document.exitFullscreen();
                    }
                  }
                }}
                className="p-2.5 md:p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all active:scale-95"
                title="Toggle Fullscreen"
              >
                <Maximize2 size={16} strokeWidth={1.5} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Brand Identity & Menu */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex flex-col items-end cursor-default">
            <h1 className="text-sm md:text-lg font-extrabold tracking-[0.2em] text-white leading-none">
              NEXUS
            </h1>
            <div className="hidden xs:flex items-center gap-1.5 mt-1 md:mt-1.5 group">
              <Cpu size={7} className="text-blue-500 animate-pulse md:w-[8px] md:h-[8px]" />
              <span className="text-[6px] md:text-[7px] tracking-[0.3em] text-blue-400 font-bold uppercase transition-all group-hover:text-cyan-300">
                Nexus Plane
              </span>
            </div>
          </div>
          
          <div className="flex gap-1.5 md:gap-2">
            {/* Knowledge Map Button */}
            <div className="relative group/map">
              <button 
                onClick={onKnowledgeMapClick}
                className="p-2.5 md:p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
                title="Knowledge Map & Growth (K)"
              >
                <Network size={20} className="md:w-[24px] md:h-[24px] group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300" strokeWidth={1.5} />
              </button>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-3 hidden group-hover/map:flex flex-col items-end z-50 pointer-events-none">
                <div className="bg-black/95 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] w-52 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center gap-2 mb-1.5 opacity-90">
                    <Network size={13} className="text-cyan-400" />
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                      {language === 'en' ? 'Knowledge Map' : 'نقشه دانش و رشد'}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-300 leading-relaxed text-right font-light">
                    {language === 'en' ? 'Explore connected concepts, historical milestones, and grow alongside Nexus.' : 'کاوش مفاهیم متصل، حقایق تاریخی و رشد دوشادوش آگاهی نکسوس.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative group/archive">
              <button 
                onClick={onArchiveClick}
                className="p-2.5 md:p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-fuchsia-500/30 transition-all active:scale-95 shadow-lg group"
              >
                <FolderArchive size={20} className="md:w-[24px] md:h-[24px] group-hover:scale-110 group-hover:text-fuchsia-400 transition-all duration-300" strokeWidth={1.5} />
              </button>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-3 hidden group-hover/archive:flex flex-col items-end z-50 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md border border-fuchsia-500/30 rounded-xl p-3 shadow-[0_0_20px_rgba(217,70,239,0.2)] w-48 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center gap-2 mb-1.5 opacity-80">
                    <FolderArchive size={12} className="text-fuchsia-400" />
                    <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">Neural Archive</span>
                  </div>
                  <p className="text-[9px] text-gray-300 leading-relaxed text-right font-light">
                    {language === 'en' ? 'Access your saved multimedia files, images, and recorded memories in the neural database.' : 'دسترسی به فایل‌های چندرسانه‌ای، تصاویر و خاطرات ذخیره شده در پایگاه داده عصبی نکسوس.'}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={onMenuClick}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-lg group"
              title="Neural History (H)"
            >
              <Menu size={24} strokeWidth={1.5} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TerminalHeader);