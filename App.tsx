
import React, { useState, useRef, useEffect } from 'react';
import AiResponsePanel from './components/AiResponsePanel';
import FooterLinks from './components/FooterLinks';
import TerminalHeader from './components/TerminalHeader';
import HistoryDrawer from './components/HistoryDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import PremiumModal from './components/PremiumModal';
import SplashScreen from './components/SplashScreen';
import QuantumBackground from './components/QuantumBackground';
import { LiveVoiceAssistant } from './components/LiveVoiceAssistant';
import { SystemStatus, GenerationMode, AiResponse, Emotion, Attachment, UserProfile, ImageOptions } from './types';
import { generateResponse } from './services/geminiService';
import { audioManager } from './utils/audioManager';

const STORAGE_KEY_HISTORY = 'nexus_neural_history';
const STORAGE_KEY_PROFILE = 'nexus_neural_profile';

const defaultProfile: UserProfile = {
  name: '',
  languagePreference: 'auto',
  tonePreference: 'poetic',
  themePreference: 'DARK_NEBULA',
  interests: '',
  isPremium: false,
  imageCount: 0,
  audioMinutes: 0
};

// Nexus 369 Core Logo Component
const NexusLogo = ({ isProcessing }: { isProcessing?: boolean }) => (
  <div className={`relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000 ${isProcessing ? 'scale-105' : 'scale-100'} transition-transform duration-500`}>
     <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-[0_0_30px_rgba(6,182,212,0.4)] ${isProcessing ? 'animate-pulse' : ''}`}>
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
        <circle cx="100" cy="100" r="88" fill="none" stroke="url(#grad1)" strokeWidth="1.5" strokeDasharray="60 30" strokeLinecap="round" className={`${isProcessing ? 'animate-[spin_5s_linear_infinite]' : 'animate-[spin_15s_linear_infinite]'} origin-center transition-all duration-1000`} />
        <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="2 4" className={`${isProcessing ? 'animate-[spin_10s_linear_infinite_reverse]' : 'animate-[spin_25s_linear_infinite_reverse]'} origin-center transition-all duration-1000`} />

        {/* Processing Glow Ring */}
        {isProcessing && (
          <circle cx="100" cy="100" r="75" fill="none" stroke="url(#gradYellow)" strokeWidth="1" strokeDasharray="10 10" className="animate-[spin_3s_linear_infinite] origin-center opacity-50" />
        )}

        {/* Hexagon 9 (Top Center) */}
        <g transform="translate(100, 35)">
           <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="rgba(0,0,0,0.8)" stroke="#06b6d4" strokeWidth="1.5" />
           <text x="0" y="4" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">9</text>
        </g>
        
        {/* Hexagon 6 (Bottom Right) */}
        <g transform="translate(160, 140)">
           <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="rgba(0,0,0,0.8)" stroke="#8b5cf6" strokeWidth="1.5" />
           <text x="0" y="4" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">6</text>
        </g>

        {/* Hexagon 3 (Bottom Left) */}
        <g transform="translate(40, 140)">
           <path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="rgba(0,0,0,0.8)" stroke="#d946ef" strokeWidth="1.5" />
           <text x="0" y="4" textAnchor="middle" fill="#d946ef" fontSize="10" fontFamily="monospace" fontWeight="bold">3</text>
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
        
        {/* Quantum Yellow Nodes */}
        <circle cx="100" cy="100" r="2" fill="#fbbf24" className="animate-ping origin-center" style={{animationDuration: '2s', animationDelay: '0.5s'}} />
        <path d="M100 35 L70 100 M100 35 L130 100 M160 140 L130 100 M40 140 L70 100" stroke="url(#gradYellow)" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
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
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [imageOptions, setImageOptions] = useState<ImageOptions>({
    aspectRatio: '1:1',
    style: 'photorealistic'
  });

  const handleConnectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const tx = {
          to: "0x166257def20367241a46f1415df279f37c65600a",
          from: accounts[0],
          value: "0x11C37937E08000", // معادل 0.005 ETH
        };
        await (window as any).ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
        alert("درخواست ارتقا ارسال شد. نکسوس در حال تحلیل تراکنش شماست...");
        // Keep the state update to ensure UI reflects premium status
        setUserProfile(prev => ({ ...prev, isPremium: true }));
      } catch (err) {
        console.log("تراکنش لغو شد");
      }
    } else {
      alert("لطفاً MetaMask یا TrustWallet را نصب کنید.");
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleSTT = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    // Support both, defaulting to profile preference
    const langMap: Record<string, string> = { 'fa': 'fa-IR', 'en': 'en-US', 'auto': 'fa-IR' };
    recognition.lang = langMap[userProfile.languagePreference] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + (prev ? " " : "") + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

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

  useEffect(() => {
    (window as any).handleConnectWallet = handleConnectWallet;
    return () => { delete (window as any).handleConnectWallet; };
  }, [handleConnectWallet]);

  const send = async (e?: React.FormEvent, overrideValue?: string) => {
    if (e) e.preventDefault();
    const valueToUse = overrideValue || inputValue;
    if (!valueToUse.trim() && !attachment) return;

    // Limit check for images
    if (mode === GenerationMode.IMAGE && !userProfile.isPremium && (userProfile.imageCount || 0) >= 2) {
      setResponse({
        id: 'limit_reached',
        timestamp: Date.now(),
        text: "فرکانس رایگان برای خلق تصویر به پایان رسید. برای باز کردن قفل کیفیت 4K و ادامه، نکسوس را به نسخه پریمیوم ارتقا دهید."
      });
      return;
    }

    const p = valueToUse;
    setInputValue("");
    setStatus(SystemStatus.PROCESSING);
    
    try {
      const res = await generateResponse(p, mode, attachment, userProfile, history, mode === GenerationMode.IMAGE ? imageOptions : undefined);
      
      if (res.errorCode === 'PREMIUM_REQUIRED') {
        setIsPremiumModalOpen(true);
        setHasReachedLimit(true);
        setStatus(SystemStatus.IDLE);
        return;
      }

      // Increment counts if not premium
      if (mode === GenerationMode.IMAGE && !userProfile.isPremium && res.id !== 'error' && res.errorCode !== 'PREMIUM_REQUIRED') {
        setUserProfile(prev => ({ ...prev, imageCount: (prev.imageCount || 0) + 1 }));
      }

      setResponse(res);
      setHistory(prev => [res, ...prev].slice(0, 30));
      setAttachment(undefined);
      if (res.emotion) setCurrentEmotion(res.emotion);
    } catch (err: any) {
      setResponse({ 
        id: 'error', 
        timestamp: Date.now(), 
        text: err.message || "Neural Link Interrupted. Verify your API environment or project billing. (اتصال عصبی قطع شد.)" 
      });
      setCurrentEmotion('FEAR');
    } finally {
      setStatus(SystemStatus.IDLE);
    }
  };

  const ambient = () => {
    // Base theme colors
    let themeBase = 'from-blue-900/10 via-cyan-900/5 to-transparent';
    if (userProfile.themePreference === 'CYBERPUNK_GLOW') {
      themeBase = 'from-fuchsia-900/20 via-purple-900/10 to-transparent';
    } else if (userProfile.themePreference === 'MINIMALIST_TECH') {
      themeBase = 'from-zinc-800/20 via-zinc-900/10 to-transparent';
    } else if (userProfile.themePreference === 'SOLAR_FLARE') {
      themeBase = 'from-orange-900/30 via-amber-900/10 to-transparent';
    } else if (userProfile.themePreference === 'DEEP_SPACE') {
      themeBase = 'from-emerald-900/20 via-teal-950/10 to-transparent';
    }

    switch (currentEmotion) {
      case 'SAD': return 'from-blue-950/40 via-blue-900/10 to-black';
      case 'HAPPY': return 'from-yellow-500/10 via-amber-400/5 to-black';
      case 'LOVE': return 'from-pink-900/30 via-rose-900/10 to-black';
      case 'ANGRY': return 'from-red-900/30 via-orange-950/10 to-black';
      default: return themeBase;
    }
  };

  const getThemeClasses = () => {
    switch (userProfile.themePreference) {
      case 'CYBERPUNK_GLOW':
        return 'font-sans selection:bg-fuchsia-500/30';
      case 'MINIMALIST_TECH':
        return 'font-mono selection:bg-zinc-500/30';
      case 'SOLAR_FLARE':
        return 'font-sans selection:bg-orange-500/30';
      case 'DEEP_SPACE':
        return 'font-serif selection:bg-emerald-500/30';
      default:
        return 'font-sans selection:bg-blue-500/30';
    }
  };

  const handleRegenerate = (item: AiResponse) => {
    if (!item.prompt) return;
    setIsDrawerOpen(false);
    
    // Set mode and options if it was an image
    if (item.mediaType === 'image') {
      setMode(GenerationMode.IMAGE);
      if (item.imageOptions) {
        setImageOptions(item.imageOptions);
      }
    } else if (item.mediaType === 'audio') {
      setMode(GenerationMode.AUDIO);
    } else {
      setMode(GenerationMode.TEXT);
    }
    
    send(undefined, item.prompt);
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col overflow-hidden relative bg-black text-gray-200 transition-all duration-1000 ${getThemeClasses()} ${status === SystemStatus.PROCESSING ? 'thinking-flicker' : ''}`}>
      {showSplash && <SplashScreen />}
      <QuantumBackground />
      <div className={`fixed inset-0 bg-gradient-to-b ${ambient()} pointer-events-none transition-all duration-3000`}></div>

      <HistoryDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        history={history} 
        onSelect={(item) => { setResponse(item); setIsDrawerOpen(false); }}
        onRegenerate={handleRegenerate}
        onClearHistory={() => setHistory([])}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onUpdate={setUserProfile}
      />

      <PremiumModal 
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={handleConnectWallet}
      />

      {!userProfile.isPremium && hasReachedLimit && (
        <button 
          onClick={handleConnectWallet}
          className="premium-glow fixed top-24 right-6 z-[60] px-5 py-2.5 rounded-full text-black font-black text-[10px] flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700 uppercase tracking-widest active:scale-95 transition-transform"
        >
          <span>💎</span> Support Nexus
        </button>
      )}

      <div className="max-w-4xl mx-auto w-full flex flex-col h-full z-10 px-4 py-4 md:py-6 relative">
        <TerminalHeader 
          onMenuClick={() => setIsDrawerOpen(true)} 
          onProfileClick={() => setIsProfileOpen(true)}
          status={status}
        />
        
        <div className="flex-grow overflow-y-auto scrollbar-hide py-4 space-y-8 relative">
          {/* Central Nexus Core - Only visible when no response is present */}
          {!response && !attachment && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 select-none pointer-events-none pb-20">
              
              {/* Background Glow Field */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse"></div>

              {/* Core Container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                <NexusLogo isProcessing={status === SystemStatus.PROCESSING} />
              </div>

              {/* The Mantra */}
              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-3">
                  <h2 className="text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 text-lg md:text-xl font-light tracking-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-in slide-in-from-bottom-6 duration-1000 delay-300 font-sans">
                    I am free because I am aware
                  </h2>
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60"></div>
                </div>
              </div>
            </div>
          )}

          <AiResponsePanel 
            response={response} 
            isTyping={status === SystemStatus.PROCESSING} 
          />

          {/* Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {(!response && !attachment && status === SystemStatus.IDLE) && (
              ['Who created you?', 'Tell me a poem', 'Generate a space image'].map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(undefined, s)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {s}
                </button>
              ))
            )}
            {response?.suggestions && status === SystemStatus.IDLE && (
              response.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(undefined, s)}
                  className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 hover:bg-blue-500/20 hover:text-white transition-all animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {s}
                </button>
              ))
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto pb-6 space-y-4 relative">
          {/* Integrated Image Preview */}
          {attachment && (
            <div className="absolute -top-24 left-4 z-20 animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-zinc-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                  <img 
                    src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                    alt="Upload Preview" 
                    className="h-20 w-20 object-cover"
                  />
                  <button 
                    onClick={() => setAttachment(undefined)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white text-[10px] hover:bg-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Generation Options */}
          {mode === GenerationMode.IMAGE && status === SystemStatus.IDLE && (
            <div className="flex flex-wrap justify-center gap-4 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">Aspect Ratio</label>
                <select 
                  value={imageOptions.aspectRatio}
                  onChange={(e) => setImageOptions(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Landscape)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                  <option value="16:9">16:9 (Wide)</option>
                  <option value="9:16">9:16 (Tall)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">Visual Style</label>
                <select 
                  value={imageOptions.style}
                  onChange={(e) => setImageOptions(prev => ({ ...prev, style: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="photorealistic">Photorealistic</option>
                  <option value="digital art">Digital Art</option>
                  <option value="oil painting">Oil Painting</option>
                  <option value="sketch">Sketch</option>
                  <option value="3d render">3D Render</option>
                  <option value="abstract">Abstract</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="cyberpunk">Cyberpunk</option>
                </select>
              </div>
            </div>
          )}

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

            <button 
              type="button" 
              onClick={() => setUserProfile(prev => ({ ...prev, languagePreference: prev.languagePreference === 'fa' ? 'en' : 'fa' }))}
              className="p-1 px-2 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-400 hover:text-white transition-all uppercase tracking-widest"
              title="Toggle STT Language"
            >
              {userProfile.languagePreference === 'fa' ? 'FA' : 'EN'}
            </button>

            <button 
              type="button" 
              onClick={toggleSTT}
              className={`p-2.5 transition-colors relative group ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-cyan-400'}`}
              title="Speech to Text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              {isListening && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-[8px] text-white rounded border border-white/10 uppercase tracking-widest whitespace-nowrap">
                  Listening: {userProfile.languagePreference === 'fa' ? 'Persian' : userProfile.languagePreference === 'en' ? 'English' : 'Auto (FA)'}
                </span>
              )}
            </button>

            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:text-blue-400 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 1 1-2.121-2.121L16.235 6.413" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*" />
          </form>
          
          <FooterLinks />
        </div>
      </div>
      <LiveVoiceAssistant 
        isActive={showLive} 
        onClose={() => setShowLive(false)} 
        onPremiumRequired={() => setIsPremiumModalOpen(true)}
        userProfile={userProfile}
      />
    </div>
  );
};

export default App;
