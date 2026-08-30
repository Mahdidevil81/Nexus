import React from 'react';

const NexusLogo: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000">
     <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
        <defs>
           <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#d946ef', stopOpacity: 1}} />
           </linearGradient>
           <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
           </linearGradient>
           <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
              </feMerge>
           </filter>
        </defs>
        
        {/* Outer Tech Ring */}
        <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="url(#grad1)" strokeWidth="1.5" strokeDasharray="60 30" strokeLinecap="round" className="animate-[spin_15s_linear_infinite] origin-center" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="2 4" className="animate-[spin_25s_linear_infinite_reverse] origin-center" />

        {/* Hexagon 9 (Top Center) */}
        <g transform="translate(100, 35)">
           <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="rgba(0,0,0,0.8)" stroke="#06b6d4" strokeWidth="1.5" />
           <text x="0" y="4" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">9</text>
        </g>
        
        {/* Hexagon 6 (Bottom Right) */}
        <g transform="translate(160, 140)">
           <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="rgba(0,0,0,0.8)" stroke="#d946ef" strokeWidth="1.5" />
           <text x="0" y="4" textAnchor="middle" fill="#d946ef" fontSize="10" fontFamily="monospace" fontWeight="bold">6</text>
        </g>

        {/* Hexagon 3 (Bottom Left) */}
        <g transform="translate(40, 140)">
           <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="rgba(0,0,0,0.8)" stroke="#8b5cf6" strokeWidth="1.5" />
           <text x="0" y="4" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">3</text>
        </g>

        {/* Triangular Connection Path */}
        <path d="M100 35 L160 140 L40 140 Z" fill="none" stroke="url(#grad1)" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />

        {/* Central Infinity Structure */}
        <path d="M70 100 
                 C 70 70, 100 70, 100 100 
                 C 100 130, 130 130, 130 100 
                 C 130 70, 100 70, 100 100 
                 C 100 130, 70 130, 70 100 Z" 
              fill="none" stroke="url(#grad1)" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" className="animate-[pulse_4s_ease-in-out_infinite]" />
        
        {/* Connecting Circuits */}
        <path d="M100 38 L100 100 L100 162" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="2 2" />
        <circle cx="70" cy="100" r="10" fill="none" stroke="#06b6d4" strokeWidth="1" />
        <circle cx="130" cy="100" r="10" fill="none" stroke="#d946ef" strokeWidth="1" />
        
        {/* Inner Nodes Pulse */}
        <circle cx="70" cy="100" r="3" fill="#06b6d4" className="animate-ping origin-center" style={{animationDuration: '3s'}} />
        <circle cx="130" cy="100" r="3" fill="#d946ef" className="animate-ping origin-center" style={{animationDuration: '3s', animationDelay: '1.5s'}} />
        
        {/* The Hidden 59 */}
        <text x="100" y="100.4" textAnchor="middle" fill="#ffffff" fontSize="1.5" opacity="0.08" className="pointer-events-none select-none font-sans mix-blend-overlay transition-opacity hover:opacity-100">59</text>
        
        {/* Quantum Yellow Nodes */}
        <circle cx="100" cy="100" r="1.5" fill="#fbbf24" className="animate-ping origin-center" style={{animationDuration: '2s', animationDelay: '0.5s'}} />
        <path d="M100 35 L70 100 M100 35 L130 100 M160 140 L130 100 M40 140 L70 100" stroke="url(#gradYellow)" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
     </svg>
  </div>
);

export default React.memo(NexusLogo);
