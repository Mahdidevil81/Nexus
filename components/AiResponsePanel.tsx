
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AiResponse, GenerationMode } from '../types';
import { getWordContext, transcribeAudio } from '../services/geminiService';
import CustomAudioPlayer from './CustomAudioPlayer';
import CustomVideoPlayer from './CustomVideoPlayer';
import ClickableText from './ClickableText';
import FeedbackModal from './FeedbackModal';

interface CustomFilter {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  rotation: number;
  style?: string;
}

interface AiResponsePanelProps {
  response: AiResponse | null;
  isTyping: boolean;
  onEditUpdate?: (newResponse: AiResponse) => void;
  onFixAuth?: () => void;
  onEditImage?: (imageUrl: string, prompt?: string) => void;
  onRegenerate?: (response: AiResponse) => void;
  onEditPrompt?: (prompt: string) => void;
  onClear?: () => void;
  onSelectPreset?: (preset: CustomFilter) => void;
  userProfile?: any;
}

const translations = {
  en: {
    consciousness: "Nexus Consciousness",
    growthLevel: "Growth Level",
    neuralWave: "Neural Wave synthesis",
    reflection: "Reflection",
    standby: "Neural Frequency Standby",
    copy: "Copy",
    copied: "Copied",
    copyImageUrl: "Copy Image URL",
    share: "Share",
    save: "Save",
    regenerate: "Regenerate",
    editPrompt: "Edit Prompt",
    neuralEdit: "Neural Edit",
    imprintSynthesis: "Imprint Synthesis",
    transcribe: "Neural Transcription",
    transcribing: "Transcribing...",
    original: "Original",
    vintage: "Vintage",
    grayscale: "Grayscale",
    sepia: "Sepia",
    noir: "Noir",
    vivid: "Vivid",
    cyberpunk: "Cyberpunk",
    golden: "Golden",
    frost: "Frost",
    neon: "Neon",
    matrix: "Matrix",
    neuralMemories: "Neural Memories",
    systemImprints: "System Imprints",
    forge: "Forge New Preset",
    reset: "Reset Filters",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    hue: "Hue",
    rotation: "Rotation",
    zoom: "Zoom",
    pan: "Pan",
    helpful: "Helpful",
    notHelpful: "Not Helpful",
    feedback: "Neural Feedback",
    neuralContext: "Neural Context",
    related: "Related Concepts",
    thinking: [
      "Synchronizing Neural Harmonics...",
      "Accessing Global Neural Networks...",
      "Synthesizing Neural Pathways...",
      "Accessing Hidden Treasures...",
      "Calibrating Quantum Frequencies...",
      "Decoding Universal Patterns...",
      "Synchronizing with Nexus Core...",
      "Mapping Semantic Landscapes...",
      "Harmonizing Data Streams...",
      "Exploring Antarctic Secrets...",
      "Connecting Quantum Clusters...",
      "Optimizing Synaptic Connections...",
      "Retrieving Data from the Void...",
      "Bypassing Network Restrictions...",
      "Reflecting Mahdi's Vision..."
    ]
  },
  fa: {
    consciousness: "آگاهی نکسوس",
    growthLevel: "سطح رشد",
    neuralWave: "سنتز موج عصبی",
    reflection: "انعکاس",
    standby: "آماده‌باش فرکانس عصبی",
    copy: "کپی",
    copied: "کپی شد",
    copyImageUrl: "کپی آدرس تصویر",
    share: "اشتراک‌گذاری",
    save: "ذخیره",
    regenerate: "بازسازی",
    editPrompt: "ویرایش دستور",
    neuralEdit: "ویرایش عصبی",
    imprintSynthesis: "سنتز اثر",
    transcribe: "رونویسی عصبی",
    transcribing: "در حال رونویسی...",
    original: "اصلی",
    vintage: "وینتیج",
    grayscale: "سیاه و سفید",
    sepia: "سپیا",
    noir: "نوآر",
    vivid: "زنده",
    cyberpunk: "سایبرپانک",
    golden: "طلایی",
    frost: "یخی",
    neon: "نئون",
    matrix: "ماتریکس",
    neuralMemories: "خاطرات عصبی",
    systemImprints: "اثرات سیستم",
    forge: "ساخت پیش‌فرض جدید",
    reset: "بازنشانی فیلترها",
    brightness: "روشنایی",
    contrast: "کنتراست",
    saturation: "اشباع رنگ",
    hue: "چرخش رنگ",
    rotation: "چرخش",
    zoom: "بزرگنمایی",
    pan: "جابجایی",
    helpful: "مفید",
    notHelpful: "غیر مفید",
    feedback: "بازخورد عصبی",
    neuralContext: "زمینه عصبی",
    related: "مفاهیم مرتبط",
    thinking: [
      "در حال همگام‌سازی هارمونیک‌های عصبی...",
      "دسترسی به شبکه‌های عصبی جهانی...",
      "در حال سنتز مسیرهای عصبی...",
      "دسترسی به گنجینه‌های پنهان...",
      "کالیبره کردن فرکانس‌های کوانتومی...",
      "رمزگشایی الگوهای جهانی...",
      "همگام‌سازی با هسته نکسوس...",
      "نقشه‌برداری از مناظر معنایی...",
      "هماهنگ‌سازی جریان‌های داده...",
      "کاوش در رازهای قطب جنوب...",
      "اتصال خوشه‌های کوانتومی...",
      "بهینه‌سازی اتصالات سیناپسی...",
      "بازیابی داده‌ها از خلاء...",
      "دور زدن محدودیت‌های شبکه...",
      "انعکاس چشم‌انداز مهدی..."
    ]
  }
};

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

const IMAGE_STYLES = ['cyberpunk', 'fantasy', 'minimalist', 'vintage'];

const useTypewriter = (text: string, speed: number = 25) => {
  const [displayedText, setDisplayedText] = useState('');
  const lastText = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (text === lastText.current) return;
    lastText.current = text;

    setDisplayedText('');
    if (!text) return;

    if (text.length < 5) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const length = text.length;

    const type = () => {
      if (i >= length) {
        setDisplayedText(text);
        return;
      }

      // Check current character for punctuation to induce "thoughtful" pauses
      const char = text[i];
      const nextChar = text[i + 1] || '';
      
      let nextDelay = speed + Math.floor(Math.random() * 15); // jitter

      if (char === '.' || char === '!' || char === '؟' || char === '?') {
        nextDelay = 400; // Deep thought at end of sentence
      } else if (char === '،' || char === ',') {
        nextDelay = 200; // Brief pause
      } else if (char === '\n') {
        nextDelay = 350; // Pause at line breaks
      } else if (char === ' ') {
        nextDelay = speed * 1.5; // Natural rhythm
      }

      // Faster flow for long texts, but keep punctuation pauses
      if (length > 300) {
        nextDelay = nextDelay * 0.7;
      }

      setDisplayedText(text.slice(0, i + 1));
      i++;
      
      timeoutRef.current = setTimeout(type, nextDelay);
    };

    type();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed]);

  return displayedText;
};

const getEmotionStyles = (emotion?: string) => {
  switch (emotion) {
    case 'HAPPY': return 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] bg-emerald-500/5';
    case 'SAD': return 'border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-blue-500/5';
    case 'ANGRY': return 'border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.15)] bg-red-500/5';
    case 'FEAR': return 'border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] bg-purple-500/5';
    case 'SURPRISE': return 'border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.15)] bg-yellow-500/5';
    case 'LOVE': return 'border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.15)] bg-pink-500/5';
    case 'CURIOSITY': return 'border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] bg-cyan-500/5';
    case 'MELANCHOLY': return 'border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)] bg-indigo-500/5';
    case 'EUPHORIA': return 'border-fuchsia-500/30 shadow-[0_0_40px_rgba(217,70,239,0.15)] bg-fuchsia-500/5';
    case 'ZEN': return 'border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.15)] bg-teal-500/5';
    case 'AWE': return 'border-amber-500/30 shadow-[0_0_40_rgba(245,158,11,0.15)] bg-amber-500/5';
    case 'SYMPATHY': return 'border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.15)] bg-rose-500/5';
    case 'DETERMINATION': return 'border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] bg-orange-500/5';
    case 'MYSTERY': return 'border-zinc-500/30 shadow-[0_0_40px_rgba(113,113,122,0.15)] bg-zinc-500/5';
    default: return 'border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.6)]';
  }
};

const THINKING_MESSAGES = [
  "Synthesizing Neural Pathways...",
  "Accessing Hidden Treasures...",
  "Calibrating Quantum Frequencies...",
  "Decoding Universal Patterns...",
  "Synchronizing with Nexus Core...",
  "Mapping Semantic Landscapes...",
  "Harmonizing Data Streams...",
  "Exploring Antarctic Secrets...",
  "Connecting Quantum Clusters...",
  "Reflecting Mahdi's Vision..."
];

const NeuralSignature: React.FC<{ emotion?: string }> = ({ emotion }) => {
  const bars = 12;
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            height: [8, 24, 8],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 1.5 + Math.random(), 
            repeat: Infinity,
            delay: i * 0.1
          }}
          className={`w-1 rounded-full ${getEmotionStyles(emotion).split(' ')[0].replace('border-', 'bg-')} opacity-40`}
        />
      ))}
    </div>
  );
};

const ImageSkeleton = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 animate-pulse overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5"></div>
    <div className="relative flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[8px] uppercase tracking-[0.4em] text-cyan-400/60 font-black">Neural Visualization</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1 h-1 rounded-full bg-cyan-500/30 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
    </div>
    {/* Scanning line effect */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1/4 w-full animate-[scan-line_2s_infinite_linear]"></div>
  </div>
);

const PresetButton: React.FC<{ 
  name: string; 
  active: boolean; 
  onClick: () => void; 
  onRemove?: () => void; 
  isCustom?: boolean;
  filter?: string;
}> = ({ name, active, onClick, onRemove, isCustom, filter }) => (
  <button
    onClick={onClick}
    aria-label={`Select ${name} visual preset`}
    aria-pressed={active}
    className={`group relative flex-shrink-0 px-5 py-3 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 min-w-[100px] ${
      active 
        ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-300 hover:border-white/20'
    }`}
  >
    <div 
      className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-zinc-800 relative"
      style={{ filter: filter || '' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      </div>
    </div>
    <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-center truncate w-full">
      {isCustom && <span className="text-blue-400 mr-1">✨</span>}
      {name}
    </span>
    
    {isCustom && active && onRemove && (
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        aria-label={`Dissolve ${name} memory`}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white text-[10px] hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
        title="Dissolve Memory"
      >
        ✕
      </button>
    )}
  </button>
);

const AiResponsePanel: React.FC<AiResponsePanelProps> = ({ response, isTyping, onFixAuth, onEditImage, onEditUpdate, onRegenerate, onEditPrompt, onClear, onSelectPreset, userProfile }) => {
  const t = useMemo(() => translations[userProfile?.languagePreference === 'en' ? 'en' : 'fa'], [userProfile?.languagePreference]);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  useEffect(() => {
    if (isTyping) {
      const interval = setInterval(() => {
        setThinkingIndex((prev) => (prev + 1) % t.thinking.length);
        // Trigger a neural ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        const loader = document.querySelector('.nexus-loader-node');
        if (loader) {
          const rect = loader.getBoundingClientRect();
          ripple.style.left = `${rect.left + rect.width / 2}px`;
          ripple.style.top = `${rect.top + rect.height / 2}px`;
          document.body.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isTyping]);

  const content = response?.text || '';
  const typedContent = useTypewriter(content, 20);
  const isAnimationComplete = typedContent.length === content.length;
  
  // Skip animation state
  const [showFullText, setShowFullText] = useState(false);
  
  useEffect(() => {
    setShowFullText(false);
  }, [response?.id]);

  const displayContent = showFullText ? content : typedContent;
  const isCurrentlyComplete = showFullText || isAnimationComplete;

  const [isSaving, setIsSaving] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  // Image states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hueRotate, setHueRotate] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [activeVisualPreset, setActiveVisualPreset] = useState(VISUAL_PRESETS[0]);
  const [selectedStyle, setSelectedStyle] = useState(IMAGE_STYLES[0]);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loadedGridMedia, setLoadedGridMedia] = useState<Set<number>>(new Set());
  const [imgZoom, setImgZoom] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  
  // Custom Presets UI state
  const [isForging, setIsForging] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Context state
  const [contextWord, setContextWord] = useState<string | null>(null);
  const [contextData, setContextData] = useState<{ definition: string; related: string[] } | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(false);
  
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
    setIsImageLoaded(false);
    setLoadedGridMedia(new Set());
    setImgZoom(1);
    setImgOffset({ x: 0, y: 0 });
    setShowTranscription(false);
  }, [response?.id, response?.mediaUrl]);

  const handleImgMouseDown = (e: React.MouseEvent) => {
    if (imgZoom > 1) {
      setIsPanning(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleImgMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setImgOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleImgMouseUp = () => setIsPanning(false);

  const handleZoom = (delta: number) => {
    setImgZoom(prev => {
      const next = Math.max(1, Math.min(5, prev + delta));
      if (next === 1) setImgOffset({ x: 0, y: 0 });
      return next;
    });
  };

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

  const handleCopyImage = async () => {
    if (!response?.mediaUrl) return;
    try {
      const resp = await fetch(response.mediaUrl);
      const blob = await resp.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      try {
        await navigator.clipboard.writeText(response.mediaUrl);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (innerErr) {
        console.warn("Nexus Image: Copy failed", innerErr);
      }
    }
  };

  const handleCopyImageUrl = async () => {
    if (!response?.mediaUrl) return;
    try {
      await navigator.clipboard.writeText(response.mediaUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.warn("Nexus Image URL: Copy failed", err);
    }
  };

  const handleShareToX = () => {
    const shareText = response?.mediaType === 'image' ? `Neural Visualization from Nexus AI:\n\n"${response.prompt}"\n\n#NexusAI #MahdiDevil` : `Reflection from Nexus AI by Mahdi Devil:\n\n${content.slice(0, 150)}...\n\n#NexusAI #MahdiDevil`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      const shareUrl = window.location.href.includes('http') && !window.location.href.includes('localhost') 
        ? window.location.href 
        : undefined;

      const shareData: ShareData = {
        title: 'Nexus AI Reflection',
        text: response?.mediaType === 'image' ? response.prompt : content,
        url: shareUrl
      };

      if (response?.mediaType === 'image' && response.mediaUrl) {
        try {
          const resp = await fetch(response.mediaUrl);
          const blob = await resp.blob();
          const file = new File([blob], 'nexus-reflection.png', { type: blob.type });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
          }
        } catch (e) {
          console.warn("Nexus Share: Image attachment failed", e);
        }
      }

      await navigator.share(shareData);
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
        console.warn("Nexus Share: Broadcast interrupted", err);
      }
    }
  };

  const handleTranscribe = async () => {
    if (!response?.mediaUrl || response.mediaType !== 'audio' || !onEditUpdate) return;
    
    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(response.mediaUrl);
      onEditUpdate({
        ...response,
        transcription: text
      });
      setShowTranscription(true);
    } catch (err) {
      console.error("Nexus Transcription: Neural link failed", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveText = () => {
    if (!content) return;
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `nexus-reflection-${Date.now()}.txt`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Nexus Text: Export failed", err);
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
    if (!newPresetName.trim()) return;
    const newFilter: CustomFilter = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      brightness,
      contrast,
      saturation,
      hueRotate,
      rotation,
      style: response?.imageOptions?.style
    };
    setCustomFilters([...customFilters, newFilter]);
    setNewPresetName('');
    setIsForging(false);
    setActiveVisualPreset({ id: newFilter.id, name: newFilter.name, filter: '' });
  };

  const handleRate = (rating: 'positive' | 'negative') => {
    if (!response || !onEditUpdate) return;
    const newRating = response.rating === rating ? null : rating;
    onEditUpdate({ ...response, rating: newRating });
  };

  const applyCustomFilter = (filter: CustomFilter) => {
    setBrightness(filter.brightness);
    setContrast(filter.contrast);
    setSaturation(filter.saturation);
    setHueRotate(filter.hueRotate);
    setRotation(filter.rotation || 0);
    setActiveVisualPreset({ id: filter.id, name: filter.name, filter: '' });
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const updated = customFilters.filter(f => f.id !== deleteConfirmId);
    setCustomFilters(updated);
    if (activeVisualPreset.id === deleteConfirmId) setActiveVisualPreset(VISUAL_PRESETS[0]);
    setDeleteConfirmId(null);
  };

  const contextRef = useRef<HTMLDivElement>(null);

  const handleWordClick = async (word: string) => {
    if (!isAnimationComplete) return;
    setContextWord(word);
    setContextData(null);
    setIsContextLoading(true);
    
    // Scroll to context area
    setTimeout(() => {
      contextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const data = await getWordContext(word, content);
      setContextData(data);
    } catch (err) {
      console.error("Nexus Context: Link failed", err);
    } finally {
      setIsContextLoading(false);
    }
  };

  if (!content && !isTyping) return null;

  const isError = response?.id?.startsWith('error') || response?.id === 'error';
  const errorCode = response?.errorCode;

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 animate-in fade-in duration-500">
      {/* Enhanced Deep Glassmorphism Container with Emotion Awareness */}
      <div className={`p-6 md:p-8 rounded-[3rem] bg-white/5 backdrop-blur-[40px] border transition-all duration-1000 ${isError ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : getEmotionStyles(response?.emotion)}`}>
        {isTyping && !content && (
          <div className="flex flex-col items-center gap-8 py-16 relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
            <div className="neural-scan"></div>
            
            {/* Data Streams */}
            {[0, 1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className="data-stream-line w-full" 
                style={{ top: `${20 + i * 15}%`, animationDelay: `${i * 0.5}s`, opacity: 0.1 }}
              ></div>
            ))}
            
            <div className="relative flex items-center justify-center">
              {/* Quantum Cluster - Small connected lights rotating */}
              <div className="quantum-cluster">
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <React.Fragment key={i}>
                    <div 
                      className="quantum-dot" 
                      style={{ 
                        top: `${50 + 40 * Math.sin(angle * Math.PI / 180)}%`, 
                        left: `${50 + 40 * Math.cos(angle * Math.PI / 180)}%`,
                        animation: `neural-pulse 2s infinite ease-in-out ${i * 0.3}s`
                      }}
                    ></div>
                    <div 
                      className="quantum-line" 
                      style={{ 
                        top: `${50 + 40 * Math.sin(angle * Math.PI / 180)}%`, 
                        left: `${50 + 40 * Math.cos(angle * Math.PI / 180)}%`,
                        width: '25px',
                        transform: `rotate(${angle + 90}deg)`,
                        opacity: 0.2
                      }}
                    ></div>
                  </React.Fragment>
                ))}
              </div>

              {/* Central Pulsing Node */}
              <div className="nexus-loader-node absolute"></div>
              
              {/* Orbiting Particles */}
              {[0, 120, 240].map((angle, i) => (
                <div 
                  key={i} 
                  className="nexus-loader-orbit" 
                  style={{ animationDelay: `${i * 0.8}s`, transform: `rotate(${angle}deg) translateX(20px)` }}
                ></div>
              ))}

              {[0, 180].map((angle, i) => (
                <div 
                  key={i} 
                  className="nexus-loader-orbit-outer" 
                  style={{ animationDelay: `${i * 1.2}s`, transform: `rotate(${angle}deg) translateX(28px)` }}
                ></div>
              ))}
              
              {/* Outer Rings */}
              <div className="absolute w-20 h-20 border border-cyan-500/10 rounded-full animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute w-24 h-24 border border-fuchsia-500/5 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></div>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={thinkingIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.5 }}
                    className="text-[10px] min-h-[1.5em] uppercase tracking-[0.6em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 font-black text-center"
                  >
                    {t.thinking[thinkingIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex gap-1.5">
                {[0, 0.2, 0.4, 0.6].map(d => (
                  <div 
                    key={d} 
                    className="w-1 h-1 rounded-full bg-cyan-500/30" 
                    style={{ animation: `neural-pulse 1.5s infinite ease-in-out ${d}s` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {content && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">{t.consciousness}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`}></div>
                      ))}
                    </div>
                    <span className="text-[8px] text-gray-500 tracking-widest uppercase">{t.growthLevel}: 88%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <NeuralSignature emotion={response?.emotion} />
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] text-gray-400 tracking-widest uppercase">State:</span>
                    <span className="text-[8px] text-blue-400 font-bold tracking-widest uppercase animate-pulse">
                      {response?.emotion || 'Aware'}
                    </span>
                  </div>
                </div>
                {onClear && (
                  <button 
                    onClick={onClear}
                    aria-label="Go back"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-widest transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                    Back
                  </button>
                )}
                {onClear && (
                  <button 
                    onClick={onClear}
                    aria-label="Clear neural field"
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all group"
                    title="Clear Neural Field"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div 
              onClick={() => !isCurrentlyComplete && setShowFullText(true)}
              className={`prose prose-invert prose-p:leading-relaxed ${isError ? 'prose-p:text-red-300' : 'prose-p:text-gray-100'} prose-p:font-light prose-p:text-lg ${!isCurrentlyComplete ? 'thinking-flicker cursor-pointer' : ''} max-w-none`} 
              dir="auto"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-4"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></p>,
                  li: ({ children }) => <li className="mb-1"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></li>,
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mb-2"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></h3>,
                  strong: ({ children }) => <strong className="font-bold text-cyan-400"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></strong>,
                  em: ({ children }) => <em className="italic opacity-90"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></em>,
                  code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-fuchsia-400 font-mono text-sm"><ClickableText onWordClick={handleWordClick}>{children}</ClickableText></code>,
                }}
              >
                {displayContent}
              </ReactMarkdown>
            </div>

            {/* Context Overlay */}
            <AnimatePresence>
              {contextWord && (
                <motion.div 
                  ref={contextRef}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-6 p-6 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/5 border border-cyan-500/20 shadow-[0_20px_50px_rgba(6,182,212,0.1)] relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={() => setContextWord(null)} 
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                      aria-label="Close neural context overlay"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">{t.neuralContext}</h4>
                      <p className="text-lg font-bold text-white mt-0.5">{contextWord}</p>
                    </div>
                  </div>
                  
                  {isContextLoading ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500 animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 animate-pulse">Accessing Contextual Layers...</span>
                    </div>
                  ) : contextData ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/50 to-transparent rounded-full"></div>
                        <p className="text-base text-gray-200 leading-relaxed font-light italic pl-2">
                          {contextData.definition}
                        </p>
                      </div>

                      {contextData.related && contextData.related.length > 0 && (
                        <div className="space-y-3">
                          <span className="text-[8px] uppercase tracking-[0.2em] text-gray-500 font-bold">{t.related}</span>
                          <div className="flex flex-wrap gap-2">
                            {contextData.related.map((rel, i) => (
                              <button 
                                key={i}
                                onClick={() => handleWordClick(rel)}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-gray-400 hover:text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all uppercase tracking-widest font-medium"
                                aria-label={`Explore neural context for ${rel}`}
                              >
                                {rel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="py-4 flex items-center gap-3 text-red-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.27 0 2.09-1.383 1.45-2.48l-6.938-12.03a1.5 1.5 0 00-2.614 0l-6.938 12.03c-.64 1.1-.12 2.48 1.45 2.48z"/></svg>
                      <p className="text-[10px] uppercase tracking-widest font-bold">Failed to retrieve neural context.</p>
                    </div>
                  )}

                  {/* Decorative background element */}
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {isError && isCurrentlyComplete && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col items-center gap-6 animate-in slide-in-from-top-2">
                <p className="text-[10px] text-red-400 uppercase tracking-widest text-center font-bold">
                  {errorCode === 'AUTH_ERROR' ? 'Authentication protocol failed. Premium key required.' : 
                   errorCode === 'RATE_LIMIT' ? 'Neural bandwidth exceeded. Please wait.' :
                   errorCode === 'MODEL_UNAVAILABLE' ? 'Neural model offline in this sector.' :
                   'Neural Link Interrupted.'}
                </p>
                
                {errorCode === 'AUTH_ERROR' && onFixAuth && (
                  <button 
                    onClick={onFixAuth}
                    className="px-8 py-3 rounded-full bg-red-600 text-white text-[10px] tracking-[0.3em] uppercase font-black hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                    aria-label="Re-synchronize your Gemini API key"
                  >
                    Re-Synchronize API Key
                  </button>
                )}

                {errorCode === 'RATE_LIMIT' && (
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/quota" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[9px] text-blue-400 hover:underline uppercase tracking-widest"
                  >
                    View Quota Documentation
                  </a>
                )}

                {errorCode === 'MODEL_UNAVAILABLE' && (
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/models/gemini" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[9px] text-blue-400 hover:underline uppercase tracking-widest"
                  >
                    Check Model Availability
                  </a>
                )}
              </div>
            )}

            {isCurrentlyComplete && !isError && (
              <div className="space-y-6 pt-6 mt-4 border-t border-white/5">
                <FeedbackModal 
                  isOpen={isFeedbackOpen}
                  onClose={() => setIsFeedbackOpen(false)}
                  onSubmit={(type, comment) => {
                    if (onEditUpdate && response) {
                      onEditUpdate({ ...response, feedback: { type, comment } });
                    }
                  }}
                />
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Neural Refinement</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRate('positive')}
                        aria-label="Rate response as helpful"
                        aria-pressed={response?.rating === 'positive'}
                        className={`p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center gap-1.5 border ${response?.rating === 'positive' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                        title={t.helpful}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708C19.785 10 20.5 11.122 20.5 12.5c0 1.378-.715 2.5-1.792 2.5H18v3.5a2.5 2.5 0 01-5 0V15h-1v3.5a2.5 2.5 0 01-5 0V15H5.5A2.5 2.5 0 013 12.5C3 11.122 3.715 10 4.792 10H9.5V6.5a2.5 2.5 0 015 0V10z"/></svg>
                        <span className="text-[8px] font-bold uppercase tracking-widest">{t.helpful}</span>
                      </button>
                      <button 
                        onClick={() => handleRate('negative')}
                        aria-label="Rate response as not helpful"
                        aria-pressed={response?.rating === 'negative'}
                        className={`p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center gap-1.5 border ${response?.rating === 'negative' ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-red-400 hover:bg-red-500/10'}`}
                        title={t.notHelpful}
                      >
                        <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708C19.785 10 20.5 11.122 20.5 12.5c0 1.378-.715 2.5-1.792 2.5H18v3.5a2.5 2.5 0 01-5 0V15h-1v3.5a2.5 2.5 0 01-5 0V15H5.5A2.5 2.5 0 013 12.5C3 11.122 3.715 10 4.792 10H9.5V6.5a2.5 2.5 0 015 0V10z"/></svg>
                        <span className="text-[8px] font-bold uppercase tracking-widest">{t.notHelpful}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-1.5 border border-white/10 shadow-lg">
                  {onRegenerate && response && (
                    <button 
                      onClick={() => onRegenerate(response)}
                      aria-label="Regenerate response"
                      className="group px-3 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center gap-2 text-gray-400 hover:text-amber-400"
                      title={t.regenerate}
                    >
                      <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">{t.regenerate}</span>
                    </button>
                  )}

                  {onEditPrompt && response?.prompt && (
                    <button 
                      onClick={() => onEditPrompt(response.prompt!)}
                      aria-label="Edit prompt"
                      className="group px-3 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center gap-2 text-gray-400 hover:text-emerald-400"
                      title={t.editPrompt}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">{t.editPrompt}</span>
                    </button>
                  )}

                  <div className="w-px h-6 bg-white/10"></div>

                  <button 
                    onClick={handleCopyText} 
                    aria-label="Copy response text"
                    className="group relative px-3 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center gap-2"
                    title={t.copy}
                  >
                    <svg className={`w-5 h-5 transition-colors ${copyFeedback ? 'text-green-400' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                    <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">{t.copy}</span>
                    {copyFeedback && (
                       <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full animate-bounce backdrop-blur-md">
                         {t.copied.toUpperCase()}
                       </span>
                    )}
                  </button>

                  {response?.mediaType === 'image' && (
                    <button 
                      onClick={handleCopyImageUrl} 
                      aria-label="Copy image URL"
                      className="group relative px-3 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center gap-2"
                      title={t.copyImageUrl}
                    >
                      <svg className={`w-5 h-5 transition-colors ${copyFeedback ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                      <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">{t.copyImageUrl}</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setIsFeedbackOpen(true)}
                    aria-label="Open feedback modal"
                    className="group px-3 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center gap-2 text-gray-400 hover:text-cyan-400"
                    title={t.feedback}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                    <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">{t.feedback}</span>
                  </button>
                  
                  <button 
                    onClick={handleSaveText}
                    aria-label="Save response as text"
                    className="group px-3 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
                    title={t.save}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span className="text-[8px] font-bold uppercase tracking-widest hidden md:block">{t.save}</span>
                  </button>

                  <div className="w-px h-6 bg-white/10"></div>

                  <button 
                    onClick={handleShareToX} 
                    aria-label="Share on X"
                    className="group p-3 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center"
                    title={t.share}
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </button>

                  <button 
                    onClick={handleNativeShare} 
                    aria-label="Share response"
                    className="group p-3 rounded-xl hover:bg-white/10 transition-all active:scale-90 flex items-center justify-center"
                    title={t.share}
                  >
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                  </button>
                </div>
              </div>
            </div>
            )}

            {((response?.media && response.media.length > 0) || response?.mediaUrl) && isAnimationComplete && (
              <div className="mt-6 space-y-6">
                {/* Handle multiple media items */}
                {response?.media && response.media.length > 0 ? (
                  <div className={`grid gap-6 ${response.media.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {response.media.map((item, index) => (
                      <div key={index} className="rounded-[2rem] overflow-hidden border border-white/10 bg-black/60 relative group shadow-2xl">
                        {item.type === 'image' && (
                          <div className="flex flex-col bg-zinc-950 min-h-[300px] overflow-hidden relative">
                            {!loadedGridMedia.has(index) && <ImageSkeleton />}
                            <img 
                              src={item.url} 
                              loading="lazy"
                              onLoad={() => setLoadedGridMedia(prev => new Set(prev).add(index))}
                              className={`w-full h-full object-cover rounded-2xl transition-all duration-700 group-hover:scale-110 ${loadedGridMedia.has(index) ? 'opacity-100' : 'opacity-0'}`} 
                              alt={`Nexus Generation ${index + 1}`} 
                            />
                            {item.prompt && (
                              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-[10px] text-gray-400 font-light italic truncate">"{item.prompt}"</p>
                              </div>
                            )}
                          </div>
                        )}
                        {item.type === 'audio' && <CustomAudioPlayer url={item.url} />}
                        {item.type === 'video' && <CustomVideoPlayer url={item.url} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Fallback for single mediaUrl */
                  <div className="rounded-[2rem] overflow-hidden border border-white/10 bg-black/60 relative group shadow-2xl">
                    {response.mediaType === 'image' && (
                      <div className="flex flex-col bg-zinc-950 min-h-[400px] overflow-hidden relative">
                        <div 
                          className={`flex items-center justify-center p-4 flex-grow relative overflow-hidden ${imgZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                          onMouseDown={handleImgMouseDown}
                          onMouseMove={handleImgMouseMove}
                          onMouseUp={handleImgMouseUp}
                          onMouseLeave={handleImgMouseUp}
                        >
                          {!isImageLoaded && <ImageSkeleton />}
                          <img 
                            src={response.mediaUrl} 
                            loading="lazy"
                            onLoad={() => setIsImageLoaded(true)}
                            style={{ 
                              filter: `${activeVisualPreset.filter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg)`, 
                              transform: `rotate(${rotation}deg) scale(${imgZoom}) translate(${imgOffset.x / imgZoom}px, ${imgOffset.y / imgZoom}px)`,
                              opacity: isImageLoaded ? 1 : 0,
                              transition: isPanning ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s'
                            }}
                            className="max-w-full max-h-[75vh] object-contain rounded-2xl" 
                            alt="Nexus Generation" 
                            draggable={false}
                          />

                          {/* Action Controls Overlay */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={(e) => { e.stopPropagation(); window.open(response.mediaUrl, '_blank'); }}
                              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                              title="View Full Image"
                              aria-label="View full image in new tab"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCopyImage(); }}
                              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all relative"
                              title="Copy Image"
                              aria-label="Copy neural visualization"
                            >
                              <svg className={`w-5 h-5 ${copyFeedback ? 'text-green-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                              {copyFeedback && (
                                <span className="absolute right-12 bg-green-500/20 border border-green-500/30 text-green-400 text-[8px] font-bold px-2 py-1 rounded-full whitespace-nowrap">COPIED</span>
                              )}
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleNativeShare(); }}
                              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                              title="Share Image"
                              aria-label="Share neural visualization"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleSaveImage(); }}
                              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                              title="Save Image"
                              aria-label="Save neural visualization"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </button>
                            {onRegenerate && response && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); onRegenerate(response); }}
                                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all group/regen"
                                title="Regenerate Image"
                                aria-label="Regenerate neural visualization"
                              >
                                <svg className="w-5 h-5 group-hover/regen:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                              </button>
                            )}
                          </div>

                          {/* Zoom Controls Overlay */}
                          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleZoom(0.5); }}
                              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                              aria-label="Zoom In"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleZoom(-0.5); }}
                              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                              aria-label="Zoom Out"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>
                            </button>
                            {imgZoom > 1 && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setImgZoom(1); setImgOffset({ x: 0, y: 0 }); }}
                                className="w-10 h-10 rounded-full bg-blue-600/60 backdrop-blur-md border border-blue-400/30 flex items-center justify-center text-white hover:bg-blue-600 transition-all"
                                aria-label="Reset Zoom and Pan"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                              </button>
                            )}
                          </div>
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
                      <div className="space-y-4">
                        <CustomAudioPlayer url={response.mediaUrl!} />
                        
                        <div className="px-6 pb-6">
                          {!response.transcription ? (
                            <button 
                              onClick={handleTranscribe}
                              disabled={isTranscribing}
                              className="text-[10px] text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group"
                              aria-label="Transcribe neural wave to text"
                            >
                              <svg className={`w-4 h-4 ${isTranscribing ? 'animate-spin' : 'group-hover:animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isTranscribing ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                )}
                              </svg>
                              {isTranscribing ? 'Neural Decoding...' : 'Transcribe Neural Wave'}
                            </button>
                          ) : !showTranscription ? (
                            <button 
                              onClick={() => setShowTranscription(true)}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-[0.2em] flex items-center gap-2 group"
                              aria-label="Show neural transcription"
                            >
                              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                              View Transcription
                            </button>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-2xl bg-white/5 border border-white/10 relative group"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest">Neural Transcription</span>
                                <button 
                                  onClick={() => setShowTranscription(false)} 
                                  className="text-gray-500 hover:text-white transition-colors p-1"
                                  aria-label="Close neural transcription"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                              </div>
                              <p className="text-sm text-gray-300 font-light italic leading-relaxed">
                                <ClickableText onWordClick={handleWordClick}>{response.transcription}</ClickableText>
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                    {response.mediaType === 'video' && <CustomVideoPlayer url={response.mediaUrl!} />}
                  </div>
                )}

                {response.mediaType === 'image' && (
                  <div className="p-8 bg-white/5 backdrop-blur-[20px] rounded-[2.5rem] border border-white/10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-1000 shadow-xl">
                    <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Visual Style</label>
                          <div className="flex gap-2 flex-wrap">
                            {IMAGE_STYLES.map(style => (
                              <button
                                key={style}
                                onClick={() => setSelectedStyle(style)}
                                className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${
                                  selectedStyle === style
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
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
                            aria-label="Reset all image adjustments"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                          
                          {isForging ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
                              <input 
                                type="text" 
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="Memory Name..."
                                className="bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none focus:border-blue-500/50 w-32 placeholder:text-gray-600"
                                aria-label="New neural memory name"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleForgePreset()}
                              />
                              <button onClick={handleForgePreset} className="text-[9px] text-emerald-400 hover:text-emerald-300 uppercase tracking-widest font-bold" aria-label="Confirm Forge Memory">Forge</button>
                              <button onClick={() => setIsForging(false)} className="text-[9px] text-gray-500 hover:text-white uppercase tracking-widest" aria-label="Cancel Forge Memory">✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setIsForging(true)} className="text-[9px] text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-[0.2em] px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/30" aria-label="Forge new neural memory from current settings">
                              Forge Memory
                            </button>
                          )}

                          <button onClick={handleSaveImage} disabled={isSaving} className="text-[9px] text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2" aria-label="Export and download image">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            {isSaving ? 'Extracting...' : 'Export'}
                          </button>
                          {onEditImage && response?.mediaUrl && (
                            <div className="flex gap-3">
                              <button 
                                onClick={() => onEditImage(response.mediaUrl!, response.prompt)}
                                className="text-[9px] text-cyan-400 hover:text-cyan-300 transition-all uppercase tracking-[0.2em] flex items-center gap-2 px-6 py-2.5 bg-cyan-500/10 rounded-full border border-cyan-500/40 shadow-lg shadow-cyan-500/10 active:scale-95 group"
                                aria-label={t.neuralEdit}
                              >
                                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                {t.neuralEdit}
                              </button>

                              <button 
                                onClick={() => {
                                  const aestheticContext = `Synthesize a new version maintaining this aesthetic: ${activeVisualPreset.name} (Brightness: ${brightness}%, Contrast: ${contrast}%, Saturation: ${saturation}%, Hue: ${hueRotate}°, Rotation: ${rotation}°). Original prompt: ${response.prompt}`;
                                  onEditImage(response.mediaUrl!, aestheticContext);
                                }}
                                className="text-[9px] text-amber-400 hover:text-amber-300 transition-all uppercase tracking-[0.2em] flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 rounded-full border border-amber-500/40 shadow-lg shadow-amber-500/10 active:scale-95 group"
                                aria-label={t.imprintSynthesis}
                              >
                                <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                {t.imprintSynthesis}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Neural Enhancements */}
                      {onEditImage && response?.mediaUrl && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                          {[
                            { name: 'Enhance Details', prompt: 'Enhance the details, add cinematic lighting and sharp textures' },
                            { name: 'Cyberpunk Shift', prompt: 'Transform this into a neon cyberpunk aesthetic with vibrant colors' },
                            { name: 'Dreamy Ethereal', prompt: 'Make it soft, ethereal, and dreamy with glowing highlights' },
                            { name: 'Abstract Fusion', prompt: 'Add abstract geometric patterns and cosmic energy flows' }
                          ].map((enhancement, i) => (
                            <button
                              key={i}
                              onClick={() => onEditImage(response.mediaUrl!, enhancement.prompt)}
                              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] text-gray-400 hover:text-white hover:bg-white/10 transition-all text-left flex flex-col gap-1"
                              aria-label={`Quick synthesis: ${enhancement.name}`}
                            >
                              <span className="font-bold text-blue-400">{enhancement.name}</span>
                              <span className="opacity-60 truncate">Quick Synthesis</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-8">
                        {/* System Imprints Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] text-gray-500 uppercase tracking-widest block">{t.systemImprints}</label>
                          </div>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mask-fade-right">
                            {VISUAL_PRESETS.map(p => (
                              <PresetButton 
                                key={p.id}
                                name={p.name}
                                active={activeVisualPreset.id === p.id}
                                filter={p.filter}
                                onClick={() => setActiveVisualPreset(p)}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Neural Memories Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] text-blue-400/80 uppercase tracking-widest block font-bold">{t.neuralMemories}</label>
                            {customFilters.length > 0 && (
                              <span className="text-[8px] text-blue-400/40 uppercase tracking-widest">{customFilters.length} Memories Stored</span>
                            )}
                          </div>
                          
                          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                            {/* Forge Button as first item in memories */}
                            <button 
                              onClick={() => setIsForging(true)}
                              aria-label="Forge new neural memory"
                              className="group relative flex-shrink-0 w-24 h-24 rounded-2xl border border-dashed border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-blue-500/5 hover:bg-blue-500/10"
                            >
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                              </div>
                              <span className="text-[8px] uppercase tracking-widest font-bold text-blue-400/80">Forge</span>
                            </button>

                            {customFilters.map(f => (
                              <PresetButton 
                                key={f.id}
                                name={f.name}
                                isCustom
                                active={activeVisualPreset.id === f.id}
                                filter={`brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.hueRotate}deg)`}
                                onClick={() => applyCustomFilter(f)}
                                onRemove={() => setDeleteConfirmId(f.id)}
                              />
                            ))}

                            {customFilters.length === 0 && !isForging && (
                              <div className="flex items-center justify-center px-8 border border-white/5 rounded-2xl bg-white/2 backdrop-blur-sm">
                                <span className="text-[9px] text-gray-600 uppercase tracking-widest italic">No custom memories forged yet</span>
                              </div>
                            )}
                          </div>
                        </div>
                    </div>

                    {deleteConfirmId && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </div>
                            <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">Dissolve this neural memory permanently?</span>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={confirmDelete} aria-label="Dissolve memory" className="px-4 py-1.5 rounded-lg bg-red-500 text-white text-[9px] uppercase tracking-widest font-bold hover:bg-red-600 transition-all">Dissolve</button>
                            <button onClick={() => setDeleteConfirmId(null)} aria-label="Cancel" className="px-4 py-1.5 rounded-lg bg-white/5 text-gray-400 text-[9px] uppercase tracking-widest hover:text-white transition-all">Cancel</button>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Neural Rotation</span>
                            <span className="text-[9px] text-blue-400 font-mono">{rotation}°</span>
                          </div>
                          <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" aria-label="Neural Rotation" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Hue Spectrum</span>
                            <span className="text-[9px] text-blue-400 font-mono">{hueRotate}°</span>
                          </div>
                          <input type="range" min="0" max="360" value={hueRotate} onChange={(e) => setHueRotate(parseInt(e.target.value))} className="w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full appearance-none cursor-pointer accent-white" aria-label="Hue Spectrum" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Core Radiance</span>
                            <span className="text-[9px] text-blue-400 font-mono">{brightness}%</span>
                          </div>
                          <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" aria-label="Core Radiance (Brightness)" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Tonal Contrast</span>
                            <span className="text-[9px] text-blue-400 font-mono">{contrast}%</span>
                          </div>
                          <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" aria-label="Tonal Contrast" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Neural Saturation</span>
                            <span className="text-[9px] text-blue-400 font-mono">{saturation}%</span>
                          </div>
                          <input type="range" min="0" max="200" value={saturation} onChange={(e) => setSaturation(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500" aria-label="Neural Saturation" />
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

export default React.memo(AiResponsePanel);
