
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { AiResponse, GenerationMode } from '../types';

interface CustomFilter {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
}

interface AiResponsePanelProps {
  response: AiResponse | null;
  isTyping: boolean;
  onEditUpdate?: (newResponse: AiResponse) => void;
  onFixAuth?: () => void;
}

const VISUAL_PRESETS = [
  { id: 'none', name: 'Original', filter: '' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(50%) contrast(110%) brightness(105%) saturate(80%)' },
  { id: 'grayscale', name: 'Grayscale', filter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(100%)' },
  { id: 'noir', name: 'Noir', filter: 'grayscale(100%) contrast(150%) brightness(80%)' },
  { id: 'vivid', name: 'Vivid', filter: 'saturate(180%) contrast(110%)' },
  { id: 'cyber', name: 'Cyberpunk', filter: 'hue-rotate(-45deg) saturate(200%) contrast(120%) brightness(110%)' },
  { id: 'golden', name: 'Golden', filter: 'sepia(30%) saturate(150%) brightness(110%) hue-rotate(-10deg)' },
  { id: 'frost', name: 'Frost', filter: 'hue-rotate(180deg) saturate(80%) brightness(110%) contrast(90%)' },
  { id: 'neon', name: 'Neon', filter: 'saturate(300%) contrast(150%) brightness(120%)' },
  { id: 'matrix', name: 'Matrix', filter: 'hue-rotate(90deg) saturate(150%) brightness(110%) contrast(120%)' },
];

const useTypewriter = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) return text.slice(0, prev.length + 1);
        clearInterval(timer);
        return prev;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
};

const CustomAudioPlayer: React.FC<{ url: string }> = ({ url }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      analyser.fftSize = 256;
      
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6'; // blue-500
      ctx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        audioRef.current.play();
        drawWaveform();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const onEnded = () => {
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[2rem] p-6 mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 shadow-2xl">
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata} 
        onEnded={onEnded}
      />
      
      {/* Waveform Visualization */}
      <div className="h-16 w-full relative overflow-hidden rounded-xl bg-black/20 border border-white/5">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={64} 
          className="w-full h-full opacity-60"
        />
        {!isPlaying && progress === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] uppercase tracking-[0.3em] text-gray-600">Neural Frequency Standby</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 active:scale-90 transition-all"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-6 h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-grow flex flex-col gap-2">
          <div className="flex justify-between text-[10px] font-mono text-blue-400 uppercase tracking-widest">
            <span>Neural Wave synthesis</span>
            <span>{duration > 0 ? `${Math.floor(duration)}s` : '--'} Reflection</span>
          </div>
          
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AiResponsePanel: React.FC<AiResponsePanelProps> = ({ response, isTyping, onFixAuth }) => {
  const content = response?.text || '';
  const typedContent = useTypewriter(content, 30);
  const isAnimationComplete = typedContent.length === content.length;
  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // Image states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hueRotate, setHueRotate] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [activeVisualPreset, setActiveVisualPreset] = useState(VISUAL_PRESETS[0]);
  
  // Custom Filters state
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_custom_filters');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHueRotate(0);
    setRotation(0);
    setActiveVisualPreset(VISUAL_PRESETS[0]);
  };

  useEffect(() => {
    handleResetFilters();
  }, [response?.id]);

  useEffect(() => {
    localStorage.setItem('nexus_custom_filters', JSON.stringify(customFilters));
  }, [customFilters]);

  const handleCopyText = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.warn("Nexus Clipboard: Sync failed", err);
    }
  };

  const handleShareToX = () => {
    const text = `Reflection from Nexus AI by Mahdi Devil:\n\n${content.slice(0, 150)}...\n\n#NexusAI #MahdiDevil`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      const shareUrl = window.location.href.includes('http') && !window.location.href.includes('localhost') 
        ? window.location.href 
        : undefined;

      await navigator.share({
        title: 'Nexus AI Reflection',
        text: content,
        url: shareUrl
      });
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        console.warn("Nexus Share: Broadcast interrupted", err);
      }
    }
  };

  const handleSaveImage = () => {
    if (!response?.mediaUrl || response.mediaType !== 'image') return;
    setIsSaving(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return setIsSaving(false);
        const angleRad = (rotation * Math.PI) / 180;
        const absCos = Math.abs(Math.cos(angleRad));
        const absSin = Math.abs(Math.sin(angleRad));
        canvas.width = img.width * absCos + img.height * absSin;
        canvas.height = img.width * absSin + img.height * absCos;
        ctx.filter = `${activeVisualPreset.filter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg)`;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angleRad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const link = document.createElement('a');
        link.download = `nexus-reflection-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error("Nexus Image: Export failed", e);
      } finally {
        setIsSaving(false);
      }
    };
    img.onerror = () => {
      console.error("Nexus Image: Resource load failed");
      setIsSaving(false);
    };
    img.src = response.mediaUrl;
  };

  const handleForgePreset = () => {
    const name = window.prompt("Name this visual neural imprinted memory:");
    if (!name) return;
    const newFilter: CustomFilter = {
      id: `custom_${Date.now()}`,
      name,
      brightness,
      contrast,
      saturation,
      hueRotate
    };
    setCustomFilters([...customFilters, newFilter]);
  };

  const applyCustomFilter = (filter: CustomFilter) => {
    setBrightness(filter.brightness);
    setContrast(filter.contrast);
    setSaturation(filter.saturation);
    setHueRotate(filter.hueRotate);
    setActiveVisualPreset({ id: filter.id, name: filter.name, filter: '' });
  };

  const deleteCustomFilter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Dissolve this aesthetic memory?")) {
      const updated = customFilters.filter(f => f.id !== id);
      setCustomFilters(updated);
      if (activeVisualPreset.id === id) setActiveVisualPreset(VISUAL_PRESETS[0]);
    }
  };

  if (!content && !isTyping) return null;

  const isAuthError = response?.id === 'auth_error';

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 animate-in fade-in duration-500">
      {/* Enhanced Deep Glassmorphism Container */}
      <div className={`p-6 md:p-8 rounded-[3rem] bg-white/5 backdrop-blur-[40px] border ${isAuthError ? 'border-red-500/40' : 'border-white/10'} shadow-[0_32px_128px_rgba(0,0,0,0.6)] transition-all duration-1000`}>
        {isTyping && !content && (
          <div className="flex flex-col items-center gap-6 py-12 animate-pulse">
            <div className="flex gap-2">
              {[0, 0.2, 0.4].map(d => <div key={d} className="w-2 h-2 rounded-full bg-blue-500" style={{ animationDelay: `${d}s` }}></div>)}
            </div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-blue-400 font-bold">Nexus Synthesizing...</span>
          </div>
        )}

        {content && (
          <div className="space-y-8">
            <div className={`prose prose-invert prose-p:leading-relaxed ${isAuthError ? 'prose-p:text-red-300' : 'prose-p:text-gray-100'} prose-p:font-light prose-p:text-lg`} dir="auto">
              <ReactMarkdown>{typedContent}</ReactMarkdown>
            </div>

            {isAuthError && isAnimationComplete && onFixAuth && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col items-center gap-6 animate-in slide-in-from-top-2">
                <p className="text-[10px] text-red-400 uppercase tracking-widest text-center font-bold">
                  Authentication protocol failed. Premium key required.
                </p>
                <button 
                  onClick={onFixAuth}
                  className="px-8 py-3 rounded-full bg-red-600 text-white text-[10px] tracking-[0.3em] uppercase font-black hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                  Re-Synchronize API Key
                </button>
              </div>
            )}

            {isAnimationComplete && !isAuthError && (
              <div className="flex items-center justify-end gap-4 pt-6 mt-4 border-t border-white/5">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-lg">
                  <button 
                    onClick={handleCopyText} 
                    className="group relative p-3 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center"
                    title="Copy to Clipboard"
                  >
                    <svg className={`w-5 h-5 transition-colors ${copyFeedback ? 'text-green-400' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    {copyFeedback && (
                       <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full animate-bounce backdrop-blur-md">
                         COPIED
                       </span>
                    )}
                  </button>
                  
                  <div className="w-px h-6 bg-white/10"></div>

                  <button 
                    onClick={handleShareToX} 
                    className="group p-3 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center"
                    title="Share to X"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </button>

                  <button 
                    onClick={handleNativeShare} 
                    className="group p-3 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center"
                    title="Share to Apps"
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </button>
                </div>
              </div>
            )}

            {response?.mediaUrl && isAnimationComplete && (
              <div className="mt-6 space-y-6">
                <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black/60 relative group shadow-2xl">
                  {response.mediaType === 'image' && (
                    <div className="flex flex-col bg-zinc-950 min-h-[400px] overflow-hidden relative">
                      <div className="flex items-center justify-center p-4 flex-grow">
                        <img 
                          src={response.mediaUrl} 
                          style={{ 
                            filter: `${activeVisualPreset.filter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg)`, 
                            transform: `rotate(${rotation}deg)` 
                          }}
                          className="max-w-full max-h-[75vh] object-contain transition-all duration-700 rounded-2xl cursor-zoom-in" 
                          alt="Nexus Generation" 
                          onClick={() => window.open(response.mediaUrl, '_blank')}
                        />
                      </div>
                      
                      {response.prompt && (
                        <div className="px-6 py-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2">Original Neural Imprint</p>
                          <p className="text-xs text-gray-300 font-light italic leading-relaxed">"{response.prompt}"</p>
                          {response.imageOptions && (
                            <div className="mt-3 flex gap-3">
                              <div className="flex flex-col">
                                <span className="text-[8px] text-gray-600 uppercase tracking-widest">Ratio</span>
                                <span className="text-[10px] text-blue-400 font-mono">{response.imageOptions.aspectRatio}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] text-gray-600 uppercase tracking-widest">Style</span>
                                <span className="text-[10px] text-fuchsia-400 font-mono uppercase">{response.imageOptions.style}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {response.mediaType === 'audio' && (
                    <CustomAudioPlayer url={response.mediaUrl} />
                  )}
                </div>

                {response.mediaType === 'image' && (
                  <div className="p-8 bg-white/5 backdrop-blur-[20px] rounded-[2.5rem] border border-white/10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-xl">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">Aesthetic Engine</label>
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1">Refine your neural visualization</span>
                        </div>
                        <div className="flex gap-4 items-center">
                          <button 
                            onClick={handleResetFilters} 
                            className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                            title="Reset All Adjustments"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                          <button onClick={handleForgePreset} className="text-[9px] text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-[0.2em] px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/30">
                            Forge Memory
                          </button>
                          <button onClick={handleSaveImage} disabled={isSaving} className="text-[9px] text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            {isSaving ? 'Extracting...' : 'Export'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-grow space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest block px-1">Artistic Imprint</label>
                          <div className="relative">
                            <select 
                              value={activeVisualPreset.id}
                              onChange={(e) => {
                                const val = e.target.value;
                                const custom = customFilters.find(f => f.id === val);
                                if (custom) {
                                  applyCustomFilter(custom);
                                } else {
                                  const p = VISUAL_PRESETS.find(x => x.id === val);
                                  if (p) setActiveVisualPreset(p);
                                }
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-gray-300 tracking-widest appearance-none focus:border-blue-500/50 transition-all outline-none scrollbar-hide"
                            >
                              <optgroup label="System Imprints" className="bg-zinc-900 text-gray-400">
                                {VISUAL_PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </optgroup>
                              {customFilters.length > 0 && (
                                <optgroup label="Neural Memories" className="bg-zinc-900 text-blue-400">
                                  {customFilters.map(f => <option key={f.id} value={f.id}>✨ {f.name}</option>)}
                                </optgroup>
                              )}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                          </div>
                        </div>
                        
                        {activeVisualPreset.id.startsWith('custom_') && (
                          <div className="flex items-end pb-1">
                            <button 
                              onClick={(e) => deleteCustomFilter(e, activeVisualPreset.id)}
                              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] uppercase tracking-widest hover:bg-red-500/20 transition-all"
                            >
                              Dissolve Memory
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Neural Rotation</span>
                            <span className="text-[9px] text-blue-400 font-mono">{rotation}°</span>
                          </div>
                          <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Hue Spectrum</span>
                            <span className="text-[9px] text-blue-400 font-mono">{hueRotate}°</span>
                          </div>
                          <input type="range" min="0" max="360" value={hueRotate} onChange={(e) => setHueRotate(parseInt(e.target.value))} className="w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer accent-white" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Core Radiance</span>
                            <span className="text-[9px] text-blue-400 font-mono">{brightness}%</span>
                          </div>
                          <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Tonal Contrast</span>
                            <span className="text-[9px] text-blue-400 font-mono">{contrast}%</span>
                          </div>
                          <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiResponsePanel;
