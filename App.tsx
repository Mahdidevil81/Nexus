import React, { useState, useRef, useEffect } from 'react';
import AiResponsePanel from './components/AiResponsePanel';
import FooterLinks from './components/FooterLinks';
import TerminalHeader from './components/TerminalHeader';
import { LiveVoiceAssistant } from './components/LiveVoiceAssistant';
import { SystemStatus, GenerationMode, AiResponse, Emotion, Attachment } from './types';
import { generateResponse } from './services/geminiService';
import { audioManager } from './utils/audioManager';

const App: React.FC = () => {
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [history, setHistory] = useState<AiResponse[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.TEXT);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('NEUTRAL');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [hasVeoKey, setHasVeoKey] = useState<boolean>(false);
  const [showLive, setShowLive] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (currentEmotion) audioManager.playSignal(currentEmotion);
  }, [currentEmotion]);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasVeoKey(hasKey);
      }
    };
    checkKey();
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'fa-IR';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + " " + transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const handleVideoExtend = (resp: AiResponse) => {
    if (resp.rawVideoData) {
      setEditingVideo(resp.rawVideoData);
      setMode(GenerationMode.VIDEO);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

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

  const handleOpenVeoKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasVeoKey(true); 
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachment && !editingVideo) return;

    if (mode === GenerationMode.VIDEO && !hasVeoKey) {
      await handleOpenVeoKey();
    }

    const p = inputValue; 
    setInputValue(""); 
    setStatus(SystemStatus.PROCESSING); 
    setResponse(null);
    
    try {
      const res = await generateResponse(p, mode, attachment, editingVideo);
      setResponse(res);
      setHistory(prev => [res, ...prev].slice(0, 20));
      setAttachment(undefined);
      setEditingVideo(null);
      if (res.emotion) setCurrentEmotion(res.emotion);
    } catch (e: any) { 
      console.error(e);
      setResponse({ id: 'error', timestamp: Date.now(), text: "اختلال در شبکه نکسوس. مجدداً تلاش کنید." });
    } finally { 
      setStatus(SystemStatus.IDLE); 
    }
  };

  const ambient = () => {
    switch (currentEmotion) {
      case 'SAD': return 'from-blue-900/30 to-black';
      case 'HAPPY': return 'from-yellow-500/10 to-black';
      case 'LOVE': return 'from-pink-900/30 to-black';
      case 'ANGRY': return 'from-red-900/30 to-black';
      default: return 'from-blue-900/10 to-transparent';
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col p-4 md:p-6 overflow-hidden relative transition-all duration-1000 bg-black text-gray-200">
      <div className={`fixed inset-0 bg-gradient-to-b ${ambient()} pointer-events-none transition-all duration-3000`}></div>
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full z-10">
        <TerminalHeader />
        <div className="flex-grow flex flex-col overflow-hidden relative">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="absolute top-2 left-2 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            {showHistory ? '✕ بستن' : '↺ تاریخچه نکسوس'}
          </button>
          <div className="flex-grow overflow-y-auto scrollbar-hide py-4">
            {showHistory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-left-4 duration-500">
                {history.map(item => (
                  <div key={item.id} onClick={() => {setResponse(item); setShowHistory(false);}} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 cursor-pointer transition-all">
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.text}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-600">
                      <span>{new Date(item.timestamp).toLocaleTimeString('fa-IR')}</span>
                      <span className="bg-blue-500/10 px-2 py-0.5 rounded uppercase">{item.mediaType || 'Nexus Core'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AiResponsePanel response={response} isTyping={status === SystemStatus.PROCESSING} onVideoExtend={handleVideoExtend} />
            )}
          </div>
        </div>
        <div className="mt-auto space-y-4 pt-4">
          {editingVideo && (
            <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2 animate-pulse">
              <span className="text-xs text-blue-300 font-light">در حال ویرایش و تمدید ویدیوی قبلی در شبکه...</span>
              <button onClick={() => setEditingVideo(null)} className="text-xs text-red-400">لغو</button>
            </div>
          )}
          <div className="flex justify-center flex-wrap gap-1.5 md:gap-3">
            {[
              { id: GenerationMode.TEXT, icon: '💬', label: 'نکسوس' },
              { id: GenerationMode.IMAGE, icon: '🖼️', label: 'تصویر' },
              { id: GenerationMode.VIDEO, icon: '🎬', label: 'ویدیو' },
              { id: GenerationMode.AUDIO, icon: '🎵', label: 'صدا' },
              { id: GenerationMode.LIVE, icon: '🎙️', label: 'زنده' }
            ].map(m => (
              <button key={m.id} onClick={() => m.id === GenerationMode.LIVE ? setShowLive(true) : setMode(m.id)} 
                className={`px-3 py-2 md:px-5 md:py-2.5 rounded-2xl text-xs border transition-all ${mode === m.id || (m.id === GenerationMode.LIVE && showLive) ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                {m.icon} <span className="hidden md:inline mr-1">{m.label}</span>
              </button>
            ))}
          </div>
          <form onSubmit={send} className="relative bg-white/10 backdrop-blur-3xl border border-white/10 rounded-3xl p-1.5 focus-within:border-blue-500/50 transition-all">
            {attachment && (
              <div className="px-4 py-2 flex items-center gap-2">
                <span className="text-[10px] bg-blue-500/20 px-2 py-1 rounded text-blue-300 truncate max-w-[150px]">{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(undefined)} className="text-white/50 hover:text-white">✕</button>
              </div>
            )}
            <div className="flex items-center">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-blue-400 transition-colors" disabled={mode === GenerationMode.AUDIO}>
                📎
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*" />
              <input 
                type="text" 
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                className="w-full bg-transparent p-3 outline-none text-white placeholder-gray-500 text-sm md:text-base" 
                placeholder={isRecording ? "نکسوس در حال شنیدن..." : (editingVideo ? "تغییرات مورد نظر برای ویدیو را بنویسید..." : "دستورات نکسوس...")} 
                dir="rtl"
              />
              <button type="button" onClick={toggleRecording} className={`p-3 transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}>
                🎙️
              </button>
              <button type="submit" disabled={status === SystemStatus.PROCESSING} className="p-3 bg-blue-600 rounded-2xl text-white disabled:opacity-50 shadow-lg shadow-blue-900/40">
                {status === SystemStatus.PROCESSING ? '...' : '▲'}
              </button>
            </div>
          </form>
          <FooterLinks />
        </div>
      </div>
      <LiveVoiceAssistant isActive={showLive} onClose={() => setShowLive(false)} />
    </div>
  );
};

export default App;