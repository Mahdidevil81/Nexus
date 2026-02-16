import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const FooterLinks: React.FC = () => {
  return (
    <div className="flex justify-center mt-2">
      <div className="flex flex-wrap justify-center gap-6 px-6 py-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-105"
            title={link.name}
          >
            <span 
              className={`flex items-center justify-center ${link.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
              dangerouslySetInnerHTML={{ __html: link.icon }}
            />
            <span className="hidden md:block text-xs font-light tracking-wider text-gray-300 uppercase">
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterLinks;