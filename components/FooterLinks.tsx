
import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const FooterLinks: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-5 mt-8 pb-4 opacity-60 hover:opacity-100 transition-all duration-1000 group">
      {/* Social Icons Row */}
      <div className="flex gap-10">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-all duration-500 hover:scale-150 ${link.color} drop-shadow-[0_0_12px_currentColor]`}
            title={link.name}
            dangerouslySetInnerHTML={{ __html: link.icon }}
          />
        ))}
      </div>

      {/* Neon Enhanced Legal & Branding Text */}
      <div className="flex flex-col items-center gap-2 px-6">
        <p className="text-[10px] md:text-[11px] text-cyan-300/90 text-center leading-relaxed tracking-[0.15em] font-light max-w-xs md:max-w-none [text-shadow:0_0_10px_rgba(6,182,212,0.6)]">
          Terms and conditions of service and privacy of individuals are protected,
        </p>
        
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-fuchsia-500/50"></div>
          <p className="text-[11px] md:text-[13px] font-black text-fuchsia-400 tracking-[0.5em] uppercase [text-shadow:0_0_15px_rgba(217,70,239,0.8)] animate-pulse">
            By MAHDI DEVIL 2026
          </p>
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-fuchsia-500/50"></div>
        </div>
      </div>
    </div>
  );
};

export default FooterLinks;
