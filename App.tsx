
import React, { useState, useRef, useEffect } from 'react';
import AiResponsePanel from './components/AiResponsePanel';
import FooterLinks from './components/FooterLinks';
import TerminalHeader from './components/TerminalHeader';
import HistoryDrawer from './components/HistoryDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import SplashScreen from './components/SplashScreen';
import { LiveVoiceAssistant } from './components/LiveVoiceAssistant';
import { SystemStatus, GenerationMode, AiResponse, Emotion, Attachment, UserProfile, ImageSize } from './types';
import { generateResponse } from './services/geminiService';
import { audioManager } from './utils/audioManager';

const STORAGE_KEY_HISTORY = 'nexus_neural_history';
const STORAGE_KEY_PROFILE = 'nexus_neural_profile';

const defaultProfile: UserProfile = {
  name: '',
  languagePreference: 'auto',
  tonePreference: 'poetic',
  interests: ''
};

// Nexus 369 Core Logo Component
const NexusLogo = () => (
  <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000">
     <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
        <defs>
           <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#06b6d4', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#d946ef', stopOpacity: 1}} />
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

        {/* Hexagon 9 (Top) */}
        <g transform="translate(100, 28)">
           <path d="M0 -10 L8.6 -5 L8.6 5 L0 10 L-8.6 5 L-8.6 -5 Z" fill="rgba(0,0,0,0.8)" stroke="#06b6d4" strokeWidth="1" />
           <text x="0" y="3.5" textAnchor="middle" fill="#06b6d4" fontSize="8" fontFamily="monospace" fontWeight="bold">9</text>
        </g>
        
        {/* Hexagon 6 (Bottom) */}
        <g transform="translate(100, 172)">
           <path d="M0 -10 L8.6 -5 L8.6 5 L0 10 L-8.6 5 L-8.6 -5 Z" fill="rgba(0,0,0,0.8)" stroke="#d946ef" strokeWidth="1" />
           <text x="0" y="3.5" textAnchor="middle" fill="#d946ef" fontSize="8" fontFamily="monospace" fontWeight="bold">6</text>
        </g>

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
     </svg>
  </div>
);

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [history, setHistory] = useState<AiResponse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [response, setResponse] = useState<AiResponse | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.TEXT);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('NEUTRAL');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [showLive, setShowLive] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  }, [history, userProfile]);

  useEffect(() => {
    if (currentEmotion) audioManager.playSignal(currentEmotion);
  }, [currentEmotion]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1];
        setAttachment({ data: base64, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachment) return;

    const p = inputValue;
    setInputValue("");
    setStatus(SystemStatus.PROCESSING);
    
    try {
      const res = await generateResponse(p, mode, attachment, userProfile, history);
      setResponse(res);
      setHistory(prev => [res, ...prev].slice(0, 30));
      setAttachment(undefined);
      if (res.emotion) setCurrentEmotion(res.emotion);
    } catch (err: any) {
      setResponse({ 
        id: 'error', 
        timestamp: Date.now(), 
        text: "Neural Link Interrupted. Verify your API environment or project billing. (اتصال عصبی قطع شد.)" 
      });
      setCurrentEmotion('FEAR');
    } finally {
      setStatus(SystemStatus.IDLE);
    }
  };

  const ambient = () => {
    switch (currentEmotion) {
      case 'SAD': return 'from-blue-950/40 via-blue-900/10 to-black';
      case 'HAPPY': return 'from-yellow-500/10 via-amber-400/5 to-black';
      case 'LOVE': return 'from-pink-900/30 via-rose-900/10 to-black';
      case 'ANGRY': return 'from-red-900/30 via-orange-950/10 to-black';
      default: return 'from-blue-900/10 via-cyan-900/5 to-transparent';
    }
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col overflow-hidden relative bg-black text-gray-200 transition-all duration-1000 ${status === SystemStatus.PROCESSING ? 'thinking-flicker' : ''}`}>
      {showSplash && <SplashScreen />}
      <div className={`fixed inset-0 bg-gradient-to-b ${ambient()} pointer-events-none transition-all duration-3000`}></div>
      
      <HistoryDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        history={history} 
        onSelect={(item) => { setResponse(item); setIsDrawerOpen(false); }}
        onClearHistory={() => setHistory([])}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onUpdate={setUserProfile}
      />

      <div className="max-w-4xl mx-auto w-full flex flex-col h-full z-10 px-4 py-4 md:py-6 relative">
        <TerminalHeader 
          onMenuClick={() => setIsDrawerOpen(true)} 
          onProfileClick={() => setIsProfileOpen(true)}
        />
        
        <div className="flex-grow overflow-y-auto scrollbar-hide py-4 space-y-8 relative">
          {/* Central Nexus Core - Only visible when no response is present */}
          {!response && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 select-none pointer-events-none pb-20">
              
              {/* Background Glow Field */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse"></div>

              {/* Core Container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <NexusLogo />
              </div>

              {/* The Mantra */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <h2 className="text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 text-lg md:text-xl font-light tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-in slide-in-from-bottom-6 duration-1000 delay-300 font-sans">
                  I am free because I am aware
                </h2>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60"></div>
              </div>
            </div>
          )}

          <AiResponsePanel 
            response={response} 
            isTyping={status === SystemStatus.PROCESSING} 
          />
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto pb-6 space-y-4">
          <div className="flex justify-center gap-3">
            {[
              { id: GenerationMode.LIVE, icon: '🎙️' },
              { id: GenerationMode.AUDIO, icon: '🎵' },
              { id: GenerationMode.IMAGE, icon: '🖼️' },
              { id: GenerationMode.TEXT, icon: '💬' }
            ].map(m => (
              <button 
                key={m.id} 
                onClick={() => m.id === GenerationMode.LIVE ? setShowLive(true) : setMode(m.id as any)} 
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border ${
                  (mode === m.id) 
                  ? 'bg-blue-600/40 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{m.icon}</span>
              </button>
            ))}
          </div>

          <form onSubmit={send} className="relative bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-2 focus-within:border-blue-500/50 shadow-2xl neon-border-pulse group">
            <button 
              type="submit" 
              disabled={status === SystemStatus.PROCESSING} 
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-50"
            >
              {status === SystemStatus.PROCESSING ? '...' : '▲'}
            </button>

            <input 
              type="text" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              className="flex-grow bg-transparent px-4 outline-none text-white placeholder-gray-600 text-sm md:text-base text-right font-light" 
              placeholder="نکسوس در انتظار ارتعاش کلام شماست..." 
              dir="rtl"
            />

            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:text-blue-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 1 1-2.121-2.121L16.235 6.413" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*" />
          </form>
          
          <FooterLinks />
        </div>
      </div>
      <LiveVoiceAssistant isActive={showLive} onClose={() => setShowLive(false)} />
    </div>
  );
};

export default App;
