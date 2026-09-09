
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Mic, 
  Music, 
  MessageSquare, 
  LayoutGrid, 
  Paperclip, 
  SendHorizontal, 
  Languages, 
  Settings, 
  History, 
  User, 
  Target,
  Sparkles,
  Maximize2,
  Terminal
} from 'lucide-react';
import AiResponsePanel from './components/AiResponsePanel';
import FooterLinks from './components/FooterLinks';
import TerminalHeader from './components/TerminalHeader';
import HistoryDrawer from './components/HistoryDrawer';
import ProfileDrawer from './components/ProfileDrawer';
import TaskList from './components/TaskList';
import SplashScreen from './components/SplashScreen';
import QuantumBackground from './components/QuantumBackground';
import { LiveVoiceAssistant } from './components/LiveVoiceAssistant';
import NeuralDashboard from './components/NeuralDashboard';
import NexusLogo from './components/NexusLogo';
import NexusDataRelay from './components/NexusDataRelay';
import KnowledgeMapDrawer from './components/KnowledgeMapDrawer';
import PremiumModal from './components/PremiumModal';
import { SystemStatus, GenerationMode, AiResponse, Emotion, Attachment, UserProfile, ImageOptions, AudioOptions, Theme, Task, Profile, Priority } from './types';
import { generateResponse, getInspirationPrompts } from './services/geminiService';
import { audioManager } from './utils/audioManager';

const STORAGE_KEY_HISTORY = 'neksus_neural_history';
const STORAGE_KEY_PROFILE = 'neksus_neural_profile';
const STORAGE_KEY_TASKS = 'nexus_neural_tasks';
const STORAGE_KEY_PROFILES = 'neksus_profiles_v3';
const STORAGE_KEY_CURRENT_PROFILE_ID = 'neksus_current_profile_v3';

const defaultProfile: UserProfile = {
  name: '',
  languagePreference: 'fa',
  tonePreference: 'poetic',
  themePreference: 'DARK_NEBULA',
  interests: '',
  expertiseLevel: 'intermediate',
  contentFocus: [],
  responseLength: 'balanced',
  creativeFreedom: 50,
  emotionHistory: []
};

const translations = {
  en: {
    mantra: "I am free because I am aware",
    chat: "Chat",
    image: "Image",
    audio: "Audio",
    live: "Live Audio",
    placeholder: "Nexus is waiting for your vibration...",
    listening: "Listening",
    syncing: "Synchronizing...",
    error: "System Error",
    ready: "Ready",
    pastSessions: "Past Sessions",
    backToLive: "Back to Live",
    exitMirror: "Exit Mirror",
    retry: "Retry",
    inspiration: "Seek the hidden treasures of knowledge",
    consciousness: "Reflect on the nature of consciousness",
    visionary: "Generate a visionary digital art piece",
    restore: "Restore Session",
    chatWithNexus: "Chat with Nexus",
    toggleStt: "Toggle STT Language",
    speechToText: "Speech to Text",
    aspectRatio: "Aspect Ratio",
    visualStyle: "Visual Style",
    square: "Square",
    landscape: "Landscape",
    portrait: "Portrait",
    wide: "Wide",
    tall: "Tall",
    photorealistic: "Photorealistic",
    digitalArt: "Digital Art",
    oilPainting: "Oil Painting",
    sketch: "Sketch",
    threeDRender: "3D Render",
    abstract: "Abstract",
    cartoon: "Cartoon",
    cyberpunk: "Cyberpunk",
    capabilities: "Nexus Capabilities",
    audioMode: "Audio Mode",
    tts: "Speech (TTS)",
    music: "Music (Lyria)",
    voice: "Neural Voice",
    inflection: "Inflection",
    genre: "Genre",
    mood: "Mood",
    length: "Length",
    clip: "30s Clip",
    full: "Full Track",
    neutral: "Neutral",
    cheerful: "Cheerful",
    sad: "Sad",
    angry: "Angry",
    serious: "Serious",
    calm: "Calm",
    pained: "Pained",
    surprised: "Surprised"
  },
  fa: {
    mantra: "من آزادم چون آگاهم",
    chat: "گفتگو",
    image: "ساخت عکس",
    audio: "ساخت صدا",
    live: "گفتگوی زنده",
    placeholder: "نکسوس در انتظار ارتعاش کلام شماست...",
    listening: "در حال شنیدن",
    syncing: "در حال همگام‌سازی...",
    error: "خطای سیستم",
    ready: "آماده",
    pastSessions: "جلسات گذشته",
    backToLive: "بازگشت به زنده",
    exitMirror: "خروج از آینه",
    retry: "تلاش مجدد",
    inspiration: "به دنبال گنجینه‌های پنهان دانش باشید",
    consciousness: "در مورد ماهیت آگاهی تامل کنید",
    visionary: "یک اثر هنری دیجیتال رویایی خلق کنید",
    restore: "بازیابی جلسه",
    chatWithNexus: "گفتگو با نکسوس",
    toggleStt: "تغییر زبان گفتار به نوشتار",
    speechToText: "گفتار به نوشتار",
    aspectRatio: "نسبت ابعاد",
    visualStyle: "سبک بصری",
    square: "مربع",
    landscape: "افقی",
    portrait: "عمودی",
    wide: "عریض",
    tall: "بلند",
    photorealistic: "واقع‌گرایانه",
    digitalArt: "هنر دیجیتال",
    oilPainting: "نقاشی رنگ روغن",
    sketch: "طراحی",
    threeDRender: "رندر سه‌بعدی",
    abstract: "انتزاعی",
    cartoon: "کارتونی",
    cyberpunk: "سایبرپانک",
    capabilities: "قابلیت‌های نکسوس",
    audioMode: "حالت صوتی",
    tts: "آموزش گفتار",
    music: "موسیقی (لیریا)",
    voice: "صدای عصبی",
    inflection: "لحن صدا",
    genre: "سبک موسیقی",
    mood: "مود موسیقی",
    length: "مدت زمان",
    clip: "قطعه ۳۰ ثانیه‌ای",
    full: "قطعه کامل",
    neutral: "خنثی",
    cheerful: "شاد",
    sad: "غمگین",
    angry: "عصبانی",
    serious: "جدی",
    calm: "آرام",
    pained: "دردمند",
    surprised: "متعجب"
  }
};

// Nexus 369 Core Logo Component
// (Imported from components/NexusLogo.tsx)

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  // Profile Management
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (saved) return JSON.parse(saved);
      
      // Migration or initial setup
      const initialProfile: Profile = {
        id: 'default',
        name: 'Primary Core',
        userProfile: defaultProfile,
        history: [],
        tasks: [],
        lastActive: Date.now()
      };
      return [initialProfile];
    } catch (e) {
      return [{ id: 'default', name: 'Primary Core', userProfile: defaultProfile, history: [], tasks: [], lastActive: Date.now() }];
    }
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CURRENT_PROFILE_ID) || 'default';
  });

  const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  const [history, setHistory] = useState<AiResponse[]>(activeProfile.history);
  const [userProfile, setUserProfile] = useState<UserProfile>(activeProfile.userProfile);
  const [tasks, setTasks] = useState<Task[]>(activeProfile.tasks);

  // Switch profile
  const switchProfile = useCallback((id: string) => {
    // Save current state to current profile before switching
    setProfiles(prev => prev.map(p => 
      p.id === currentProfileId 
        ? { ...p, history, userProfile, tasks, lastActive: Date.now() } 
        : p
    ));
    
    const next = profiles.find(p => p.id === id);
    if (next) {
      setCurrentProfileId(id);
      setHistory(next.history);
      setUserProfile(next.userProfile);
      setTasks(next.tasks);
      localStorage.setItem(STORAGE_KEY_CURRENT_PROFILE_ID, id);
    }
  }, [currentProfileId, history, userProfile, tasks, profiles]);

  const createProfile = useCallback((name: string) => {
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name,
      userProfile: { ...defaultProfile, name },
      history: [],
      tasks: [],
      lastActive: Date.now()
    };
    setProfiles(prev => [...prev, newProfile]);
    switchProfile(newProfile.id);
  }, [switchProfile]);

  const deleteProfile = useCallback((id: string) => {
    if (profiles.length <= 1) return;
    const nextProfiles = profiles.filter(p => p.id !== id);
    setProfiles(nextProfiles);
    if (currentProfileId === id) {
      switchProfile(nextProfiles[0].id);
    }
  }, [profiles, currentProfileId, switchProfile]);

  const [response, setResponse] = useState<AiResponse | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<SystemStatus>(SystemStatus.IDLE);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.TEXT);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('NEUTRAL');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [showLive, setShowLive] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isKnowledgeMapOpen, setIsKnowledgeMapOpen] = useState(false);
  const [isRelayOpen, setIsRelayOpen] = useState(false);
  const [isDesktopMode, setIsDesktopMode] = useState(false);
  const [isPremium, setIsPremium] = useState<boolean>(() => localStorage.getItem('nexus_is_premium') === 'true');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [imageOptions, setImageOptions] = useState<ImageOptions>({
    aspectRatio: '1:1',
    style: 'photorealistic'
  });
  const [audioOptions, setAudioOptions] = useState<AudioOptions>({
    audioMode: 'TTS',
    voiceName: 'Kore',
    emotion: 'neutral' as any,
    musicOptions: {
      genre: 'Visionary Electronic',
      mood: 'Epic and Futuristic',
      length: 'clip'
    }
  });
  const [inspirationChips, setInspirationChips] = useState<string[]>([]);
  
  const addTask = useCallback((text: string, priority: Priority = 'MEDIUM', description?: string, dueDate?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      description,
      dueDate
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const addSubTask = useCallback((parentId: string, text: string, priority: Priority = 'MEDIUM', description?: string, dueDate?: string) => {
    const newSubTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      description,
      dueDate
    };
    setTasks(prev => prev.map(t => {
      if (t.id === parentId) {
        return { ...t, subTasks: [...(t.subTasks || []), newSubTask] };
      }
      return t;
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const t = useMemo(() => translations[userProfile.languagePreference === 'en' ? 'en' : 'fa'], [userProfile.languagePreference]);

  useEffect(() => {
    setInspirationChips([t.inspiration, t.consciousness, t.visionary]);
  }, [t]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [inputValue]);

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
    // Splash timer moved to component
  }, []);

  useEffect(() => {
    setProfiles(prev => prev.map(p => 
      p.id === currentProfileId 
        ? { ...p, history, userProfile, tasks, lastActive: Date.now() } 
        : p
    ));
  }, [history, userProfile, tasks]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
        localStorage.setItem(STORAGE_KEY_CURRENT_PROFILE_ID, currentProfileId);
      } catch (e) {
        // Silent fail
      }
    }, 1000); // Debounce by 1s

    return () => clearTimeout(timeoutId);
  }, [profiles, currentProfileId]);

  useEffect(() => {
    if (currentEmotion) audioManager.playSignal(currentEmotion);
  }, [currentEmotion]);

  const isFetchingInspiration = useRef(false);
  const lastInspirationFetch = useRef(0);

  useEffect(() => {
    const fetchInspiration = async () => {
      // Rate limit protection: Don't fetch more than once every 30 seconds
      if (Date.now() - lastInspirationFetch.current < 30000) return;
      
      try {
        // Only fetch if idle, no current response/attachment, and we don't have custom chips yet
        // We check if the chips are the default ones from translations
        const isDefaultChips = inspirationChips.length === 3 && 
          (inspirationChips[0] === t.inspiration || inspirationChips[0] === translations.en.inspiration || inspirationChips[0] === translations.fa.inspiration);

        if (!response && !attachment && status === SystemStatus.IDLE && (inspirationChips.length === 0 || isDefaultChips) && !isFetchingInspiration.current) {
          isFetchingInspiration.current = true;
          lastInspirationFetch.current = Date.now();
          
          const chips = await getInspirationPrompts(history, userProfile);
          if (chips && chips.length > 0) {
            setInspirationChips(chips);
          }
        }
      } catch (e) {
        console.error("Inspiration Fetch Error:", e);
      } finally {
        isFetchingInspiration.current = false;
      }
    };
    fetchInspiration();
  }, [history.length, userProfile, response, attachment, status, inspirationChips, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'p') {
        e.preventDefault();
        setIsProfileOpen(prev => !prev);
        setIsDrawerOpen(false);
        setIsTaskOpen(false);
      } else if (key === 'h') {
        e.preventDefault();
        setIsDrawerOpen(prev => !prev);
        setIsProfileOpen(false);
        setIsTaskOpen(false);
      } else if (key === 't') {
        e.preventDefault();
        setIsTaskOpen(prev => !prev);
        setIsProfileOpen(false);
        setIsDrawerOpen(false);
        setIsKnowledgeMapOpen(false);
      } else if (key === 'k') {
        e.preventDefault();
        setIsKnowledgeMapOpen(prev => !prev);
        setIsProfileOpen(false);
        setIsDrawerOpen(false);
        setIsTaskOpen(false);
        setIsArchiveOpen(false);
      } else if (key === 'escape') {
        setIsProfileOpen(false);
        setIsDrawerOpen(false);
        setIsTaskOpen(false);
        setIsArchiveOpen(false);
        setIsKnowledgeMapOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const send = async (e?: React.FormEvent, overrideValue?: string) => {
    if (e) e.preventDefault();
    const valueToUse = overrideValue || inputValue;
    if (!valueToUse.trim() && !attachment) return;

    const p = valueToUse;
    setInputValue("");
    setStatus(SystemStatus.PROCESSING);
    
    // Auto-detect image generation intent if attachment is present
    let finalMode = mode;
    const imageKeywords = ['generate', 'create', 'make', 'draw', 'paint', 'visualize', 'تصویر', 'عکس', 'بکش', 'بساز'];
    if (attachment && imageKeywords.some(k => p.toLowerCase().includes(k)) && mode !== GenerationMode.IMAGE) {
      finalMode = GenerationMode.IMAGE;
      setMode(GenerationMode.IMAGE);
    }

    try {
      const res = await generateResponse(
        p, 
        finalMode, 
        attachment, 
        userProfile, 
        history, 
        finalMode === GenerationMode.IMAGE ? imageOptions : undefined,
        finalMode === GenerationMode.AUDIO ? audioOptions : undefined,
        tasks
      );

      // Handle Function Calls
      if (res.functionCalls) {
        for (const fc of res.functionCalls) {
          if (fc.name === 'addTask') {
            const newTask = addTask(fc.args.text, fc.args.priority || 'MEDIUM', fc.args.description, fc.args.dueDate);
            res.text = res.text ? `${res.text}\n\n[Neural Objective Synchronized: ${newTask.text}]` : `[Neural Objective Synchronized: ${newTask.text}]`;
          } else if (fc.name === 'completeTask') {
            toggleTask(fc.args.taskId);
            const task = tasks.find(t => t.id === fc.args.taskId);
            res.text = res.text ? `${res.text}\n\n[Objective Completed: ${task?.text || fc.args.taskId}]` : `[Objective Completed: ${task?.text || fc.args.taskId}]`;
          } else if (fc.name === 'deleteTask') {
            deleteTask(fc.args.taskId);
            const task = tasks.find(t => t.id === fc.args.taskId);
            res.text = res.text ? `${res.text}\n\n[Objective Purged: ${task?.text || fc.args.taskId}]` : `[Objective Purged: ${task?.text || fc.args.taskId}]`;
          } else if (fc.name === 'listTasks') {
            const list = tasks.length > 0 
              ? tasks.map(t => `- ${t.text} (${t.completed ? 'Completed' : 'Active'})`).join('\n')
              : "No active neural objectives.";
            res.text = res.text ? `${res.text}\n\nNeural Objectives:\n${list}` : `Neural Objectives:\n${list}`;
          }
        }
      }

      setResponse(res);
      setHistory(prev => [res, ...prev].slice(0, 30));
      setAttachment(undefined);
      if (res.emotion) {
        setCurrentEmotion(res.emotion);
        setUserProfile(prev => ({
          ...prev,
          emotionHistory: [{ emotion: res.emotion!, timestamp: Date.now() }, ...(prev.emotionHistory || [])].slice(0, 50)
        }));
      }
    } catch (err: any) {
      const errorId = `error-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      let errorMessage = "Neural Link Interrupted. Verify your API environment or project billing. (اتصال عصبی قطع شد.)";
      
      const errorString = err.toString();
      if (errorString.includes('PERMISSION_DENIED') || errorString.includes('403')) {
        errorMessage = "Permission Denied: The API key might be invalid or lacks necessary permissions. Please check your API key configuration. (اجازه دسترسی رد شد.)";
      } else if (errorString.includes('RATE_LIMIT') || errorString.includes('429')) {
        errorMessage = "Rate Limit Exceeded: The request limit has been reached. Please wait a moment before trying again. (محدودیت نرخ درخواست رعایت نشد.)";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setResponse({ 
        id: errorId, 
        timestamp: Date.now(), 
        text: errorMessage
      });
      setCurrentEmotion('FEAR');
    } finally {
      setStatus(SystemStatus.IDLE);
    }
  };

  const ambient = useMemo(() => {
    // Theme to gradient mapping
    const themeGradients: Record<Theme, string> = {
      'DARK_NEBULA': 'from-indigo-950/40 via-slate-900/20 to-transparent',
      'CYBERPUNK_GLOW': 'from-fuchsia-900/20 via-purple-900/10 to-transparent',
      'MINIMALIST_TECH': 'from-zinc-800/20 via-zinc-900/10 to-transparent',
      'SOLAR_FLARE': 'from-orange-900/30 via-amber-900/10 to-transparent',
      'DEEP_SPACE': 'from-emerald-900/20 via-teal-950/10 to-transparent',
      'NEON_GLOW': 'from-lime-900/30 via-green-900/10 to-transparent',
      'MINIMALIST': 'from-zinc-100/10 via-zinc-200/5 to-transparent',
      'VIOLET_DREAM': 'from-violet-900/30 via-indigo-900/10 to-transparent',
      'ARCTIC_FROST': 'from-sky-900/20 via-blue-950/10 to-transparent'
    };

    const themeBase = themeGradients[userProfile.themePreference] || 'from-blue-900/10 via-cyan-900/5 to-transparent';

    switch (currentEmotion) {
      case 'SAD': return 'from-blue-950/40 via-blue-900/10 to-black';
      case 'HAPPY': return 'from-yellow-500/10 via-amber-400/5 to-black';
      case 'LOVE': return 'from-pink-900/30 via-rose-900/10 to-black';
      case 'ANGRY': return 'from-red-900/30 via-orange-950/10 to-black';
      default: return themeBase;
    }
  }, [userProfile.themePreference, currentEmotion]);

  const themeClasses = useMemo(() => {
    const themeClassesMap: Record<Theme, string> = {
      'DARK_NEBULA': 'font-sans selection:bg-indigo-500/30',
      'CYBERPUNK_GLOW': 'font-sans selection:bg-fuchsia-500/30',
      'MINIMALIST_TECH': 'font-mono selection:bg-zinc-500/30',
      'SOLAR_FLARE': 'font-sans selection:bg-orange-500/30',
      'DEEP_SPACE': 'font-serif selection:bg-emerald-500/30',
      'NEON_GLOW': 'font-sans selection:bg-lime-500/40',
      'MINIMALIST': 'font-sans font-light tracking-wide selection:bg-zinc-300/50',
      'VIOLET_DREAM': 'font-serif selection:bg-violet-500/30',
      'ARCTIC_FROST': 'font-sans selection:bg-sky-400/30'
    };

    return themeClassesMap[userProfile.themePreference] || 'font-sans selection:bg-blue-500/30';
  }, [userProfile.themePreference]);

  const handleRegenerate = useCallback((item: AiResponse) => {
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
  }, [send]);

  const handleEditImage = useCallback((url: string, prompt?: string) => {
    const parts = url.split(',');
    if (parts.length < 2) return;
    const header = parts[0];
    const data = parts[1];
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    setAttachment({ data, mimeType, name: 'nexus-edit.png' });
    setMode(GenerationMode.IMAGE);
    if (prompt) setInputValue(prompt);
    // Focus input if possible
  }, []);

  const handleEditPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleEditUpdate = useCallback((newResponse: AiResponse) => {
    setResponse(newResponse);
    setHistory(prev => prev.map(item => item.id === newResponse.id ? newResponse : item));
  }, []);

  const handleSelectPreset = useCallback((preset: any) => {
    if (preset.style) {
      setImageOptions(prev => ({ ...prev, style: preset.style }));
    }
  }, []);

  const handleClearResponse = useCallback(() => setResponse(null), []);

  return (
    <div className={`h-[100dvh] w-full flex flex-col overflow-hidden relative bg-black text-gray-200 transition-all duration-1000 ${isDesktopMode ? 'p-0 items-stretch justify-start' : 'md:p-0 p-[15px] items-center justify-between'} ${themeClasses} ${status === SystemStatus.PROCESSING ? 'thinking-flicker' : ''}`}>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <QuantumBackground status={status} isTyping={inputValue.length > 0} />
      <div className={`fixed inset-0 bg-gradient-to-b ${ambient} pointer-events-none transition-all duration-3000`}></div>
      
      <HistoryDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        history={history} 
        onSelect={(item) => { setResponse(item); setIsDrawerOpen(false); }}
        onRegenerate={handleRegenerate}
        onClearHistory={() => setHistory([])}
        onOpenArchive={() => { setIsArchiveOpen(true); setIsDrawerOpen(false); }}
      />

      <NexusDataRelay externalToggle={isRelayOpen} onClose={() => setIsRelayOpen(false)} />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={userProfile}
        onUpdate={setUserProfile}
        profiles={profiles}
        currentProfileId={currentProfileId}
        onSwitch={switchProfile}
        onCreate={createProfile}
        onDelete={deleteProfile}
        onOpenRelay={() => { setIsRelayOpen(true); setIsProfileOpen(false); }}
      />

      <KnowledgeMapDrawer
        isOpen={isKnowledgeMapOpen}
        onClose={() => setIsKnowledgeMapOpen(false)}
        history={history}
        currentResponse={response}
        language={userProfile.languagePreference}
        onExploreConcept={(prompt) => send(undefined, prompt)}
      />

      {/* Task List Drawer */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-500 ${isTaskOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTaskOpen(false)}></div>
        <div className="relative z-10 w-full max-w-md transform transition-transform duration-500 scale-95 origin-center" style={{ transform: isTaskOpen ? 'scale(1)' : 'scale(0.9)' }}>
          <TaskList 
            tasks={tasks} 
            onAdd={addTask} 
            onAddSubTask={addSubTask}
            onToggle={toggleTask} 
            onDelete={deleteTask} 
          />
        </div>
      </div>

      {/* Neural Archive Overlay */}
      <AnimatePresence>
        {isArchiveOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-3xl p-8 overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                  <h1 className="text-3xl font-black tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-fuchsia-500 uppercase">Neural Archive</h1>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Historical data synchronization</span>
                </div>
                <button onClick={() => setIsArchiveOpen(false)} className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={item.id}
                    className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(item.timestamp).toLocaleString('fa-IR')}</span>
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-1 rounded-full ${item.mediaType === 'image' || (item.media && item.media.some(m => m.type === 'image')) ? 'bg-fuchsia-500/20 text-fuchsia-400' : item.mediaType === 'audio' || (item.media && item.media.some(m => m.type === 'audio')) ? 'bg-blue-500/20 text-blue-400' : item.mediaType === 'video' || (item.media && item.media.some(m => m.type === 'video')) ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {item.mediaType || (item.media && item.media.length > 0 ? item.media[0].type : 'Text')}
                      </span>
                    </div>
                    {((item.mediaUrl && item.mediaType === 'image') || (item.media && item.media.some(m => m.type === 'image'))) && (
                      <div className="aspect-square rounded-2xl overflow-hidden mb-4 border border-white/10">
                        <img src={item.mediaUrl || item.media?.find(m => m.type === 'image')?.url} alt="Archive" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    )}
                    {((item.mediaUrl && item.mediaType === 'video') || (item.media && item.media.some(m => m.type === 'video'))) && (
                      <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10 bg-zinc-900 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <p className="text-sm text-white/90 font-medium mb-2 line-clamp-2" dir="auto">{item.prompt}</p>
                    <p className="text-xs text-gray-400 font-light line-clamp-3 leading-relaxed">{item.text}</p>
                    <button 
                      onClick={() => { setResponse(item); setIsArchiveOpen(false); }}
                      className="mt-6 w-full py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                    >
                      Restore Session
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto w-full flex flex-col h-full z-10 px-4 py-4 md:py-6 relative">
        <TerminalHeader 
          onMenuClick={() => setIsDrawerOpen(true)} 
          onProfileClick={() => setIsProfileOpen(true)}
          onLanguageToggle={() => setUserProfile(prev => ({ ...prev, languagePreference: prev.languagePreference === 'en' ? 'fa' : 'en' }))}
          onDesktopToggle={() => setIsDesktopMode(!isDesktopMode)}
          onArchiveClick={() => setIsArchiveOpen(true)}
          onKnowledgeMapClick={() => setIsKnowledgeMapOpen(true)}
          onPremiumClick={() => setIsPremiumModalOpen(true)}
          isDesktopMode={isDesktopMode}
          status={status}
          language={userProfile.languagePreference}
          isPremium={isPremium}
        />
        
        <div className="flex-grow overflow-y-auto scrollbar-hide py-4 space-y-8 relative flex flex-col items-center justify-center">
          {/* Central Nexus Core - Only visible when no response is present */}
          {!response && !attachment && (
            <div className="flex flex-col items-center justify-center z-0 select-none w-full max-w-xl mx-auto h-full space-y-10 mt-10">
              
              {/* Background Glow Field */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

              {/* Core Container */}
              <div className={`relative flex items-center justify-center transition-all duration-700 ${isDesktopMode ? 'w-96 h-96' : 'w-64 h-64 xs:w-72 xs:h-72 sm:w-80 sm:h-80 opacity-90 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]'}`}>
                <NexusLogo />
              </div>

              {/* The Mantra */}
              <div className="flex flex-col items-center gap-4 w-full text-center px-4 relative z-10">
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 font-light uppercase drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-in slide-in-from-bottom-6 duration-1000 delay-300 font-sans text-xl md:text-2xl tracking-[0.3em]">
                  {t.mantra}
                </h2>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60"></div>
              </div>

              {/* Quick Action Panels */}
              <div className="grid grid-cols-3 gap-2 md:gap-6 w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 relative z-10">
                {[
                  { id: GenerationMode.IMAGE, label: t.image, icon: <ImageIcon />, color: 'from-fuchsia-500/20 to-purple-500/20', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/40' },
                  { id: GenerationMode.LIVE, label: t.live, icon: <Mic />, color: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/30', glow: 'shadow-orange-500/40' },
                  { id: GenerationMode.AUDIO, label: t.audio, icon: <Music />, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/40' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => m.id === GenerationMode.LIVE ? setShowLive(true) : setMode(m.id)}
                    className={`group relative p-3 md:p-6 rounded-2xl md:rounded-3xl border ${m.border} bg-gradient-to-br ${m.color} backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] shadow-lg ${m.glow} active:scale-95 flex flex-col items-center justify-center gap-2 md:gap-3 overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                      {React.cloneElement(m.icon as any, { className: "w-5 h-5 md:w-7 md:h-7", strokeWidth: 1.5 })}
                    </div>
                    <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-gray-300 group-hover:text-white transition-colors text-center">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AiResponsePanel 
            response={response} 
            isTyping={status === SystemStatus.PROCESSING} 
            onEditImage={handleEditImage}
            onEditUpdate={handleEditUpdate}
            onRegenerate={handleRegenerate}
            onEditPrompt={handleEditPrompt}
            onClear={handleClearResponse}
            onSelectPreset={handleSelectPreset}
            userProfile={userProfile}
          />

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto pb-2 space-y-4 relative">
          {/* Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2 px-4 mb-4">
            {(!response && !attachment && status === SystemStatus.IDLE) && (
              inspirationChips.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(undefined, s)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-2"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
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
                <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.aspectRatio}</label>
                <select 
                  value={imageOptions.aspectRatio}
                  onChange={(e) => setImageOptions(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="1:1">1:1 ({t.square})</option>
                  <option value="4:3">4:3 ({t.landscape})</option>
                  <option value="3:4">3:4 ({t.portrait})</option>
                  <option value="16:9">16:9 ({t.wide})</option>
                  <option value="9:16">9:16 ({t.tall})</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.visualStyle}</label>
                <select 
                  value={imageOptions.style}
                  onChange={(e) => setImageOptions(prev => ({ ...prev, style: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="photorealistic">{t.photorealistic}</option>
                  <option value="digital art">{t.digitalArt}</option>
                  <option value="oil painting">{t.oilPainting}</option>
                  <option value="sketch">{t.sketch}</option>
                  <option value="3d render">{t.threeDRender}</option>
                  <option value="abstract">{t.abstract}</option>
                  <option value="cartoon">{t.cartoon}</option>
                  <option value="cyberpunk">{t.cyberpunk}</option>
                </select>
              </div>
            </div>
          )}

          {/* Audio Generation Options */}
          {mode === GenerationMode.AUDIO && status === SystemStatus.IDLE && (
            <div className="flex flex-wrap justify-center gap-4 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.audioMode}</label>
                <select 
                  value={audioOptions.audioMode}
                  onChange={(e) => setAudioOptions(prev => ({ ...prev, audioMode: e.target.value as any }))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="TTS">{t.tts}</option>
                  <option value="MUSIC">{t.music}</option>
                </select>
              </div>

              {audioOptions.audioMode === 'TTS' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.voice}</label>
                    <select 
                      value={audioOptions.voiceName}
                      onChange={(e) => setAudioOptions(prev => ({ ...prev, voiceName: e.target.value as any }))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                    >
                      <option value="Kore">Kore</option>
                      <option value="Puck">Puck</option>
                      <option value="Charon">Charon</option>
                      <option value="Fenrir">Fenrir</option>
                      <option value="Zephyr">Zephyr</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.inflection}</label>
                    <select 
                      value={audioOptions.emotion}
                      onChange={(e) => setAudioOptions(prev => ({ ...prev, emotion: e.target.value as any }))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                    >
                      <option value="neutral">{t.neutral}</option>
                      <option value="cheerful">{t.cheerful}</option>
                      <option value="sad">{t.sad}</option>
                      <option value="angry">{t.angry}</option>
                      <option value="serious">{t.serious}</option>
                      <option value="calm">{t.calm}</option>
                      <option value="pained">{t.pained}</option>
                      <option value="surprised">{t.surprised}</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.genre}</label>
                    <input 
                      type="text"
                      value={audioOptions.musicOptions?.genre}
                      onChange={(e) => setAudioOptions(prev => ({ ...prev, musicOptions: { ...prev.musicOptions, genre: e.target.value } }))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all w-24"
                      placeholder="e.g. Lo-fi"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.mood}</label>
                    <input 
                      type="text"
                      value={audioOptions.musicOptions?.mood}
                      onChange={(e) => setAudioOptions(prev => ({ ...prev, musicOptions: { ...prev.musicOptions, mood: e.target.value } }))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all w-24"
                      placeholder="e.g. Chill"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 px-1">{t.length}</label>
                    <select 
                      value={audioOptions.musicOptions?.length}
                      onChange={(e) => setAudioOptions(prev => ({ ...prev, musicOptions: { ...prev.musicOptions, length: e.target.value as any } }))}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 transition-all"
                    >
                      <option value="clip font-sans">{t.clip}</option>
                      <option value="full font-sans">{t.full}</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex justify-center items-center gap-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400/60 font-medium">{t.chatWithNexus || 'Chat with Nexus'}</span>
            <div className="h-px w-12 bg-blue-500/20"></div>
          </div>

          <form onSubmit={send} className={`relative bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-1 focus-within:border-blue-500/50 shadow-2xl neon-border-pulse group overflow-hidden ${isDesktopMode ? 'w-full' : 'md:bg-white/5 bg-[#141414]/80 md:rounded-[2.5rem] rounded-[30px] md:p-2 p-[10px_20px] md:relative fixed md:bottom-auto bottom-[10px] md:left-auto left-1/2 md:translate-x-0 -translate-x-1/2 md:w-full w-[94%]'}`}>
            {status === SystemStatus.PROCESSING && <div className="neural-scan"></div>}
            
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowModes(!showModes)}
                className={`p-2.5 rounded-full transition-all ${showModes ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title={t.capabilities}
              >
                <LayoutGrid size={22} strokeWidth={1.5} />
              </button>
              
              <AnimatePresence>
                {showModes && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 p-2 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex gap-2 z-50 min-w-[280px]"
                  >
                    {[
                      { id: GenerationMode.TEXT, label: t.chat, icon: <MessageSquare size={20} />, color: 'hover:bg-blue-500/20 hover:text-blue-400' },
                      { id: GenerationMode.IMAGE, label: t.image, icon: <ImageIcon size={20} />, color: 'hover:bg-fuchsia-500/20 hover:text-fuchsia-400' },
                      { id: GenerationMode.AUDIO, label: t.audio, icon: <Music size={20} />, color: 'hover:bg-emerald-500/20 hover:text-emerald-400' },
                      { id: GenerationMode.LIVE, label: t.live, icon: <Mic size={20} />, color: 'hover:bg-orange-500/20 hover:text-orange-400' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          if (m.id === GenerationMode.LIVE) setShowLive(true);
                          else setMode(m.id);
                          setShowModes(false);
                        }}
                        className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${m.color} ${mode === m.id ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                      >
                        <div className={`${mode === m.id ? 'scale-110' : ''} transition-transform`}>{m.icon}</div>
                        <span className="text-[8px] uppercase tracking-widest font-bold">{m.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative flex-grow">
              <textarea 
                ref={textareaRef}
                rows={1}
                maxLength={2000}
                value={inputValue} 
                onChange={e => setInputValue(e.target.value)} 
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                className={`w-full bg-transparent px-4 py-2 outline-none text-white placeholder-gray-600 text-sm md:text-base text-right font-light resize-none max-h-32 overflow-y-auto scrollbar-hide ${isDesktopMode ? '' : 'md:px-4 md:py-2 p-[5px]'}`} 
                placeholder={t.placeholder} 
                dir={userProfile.languagePreference === 'fa' ? 'rtl' : 'ltr'}
              />
              <div className="absolute -bottom-5 right-2 text-[9px] text-gray-600">
                {2000 - inputValue.length}
              </div>
            </div>

            <div className={`flex items-center gap-1 pr-1 ${isDesktopMode ? '' : 'md:gap-1 gap-[15px] md:opacity-100 opacity-70'}`}>
              <button 
                type="button" 
                onClick={() => setUserProfile(prev => ({ ...prev, languagePreference: prev.languagePreference === 'fa' ? 'en' : 'fa' }))}
                className="p-1 px-2 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-400 hover:text-white transition-all uppercase tracking-widest"
                title={t.toggleStt}
              >
                {userProfile.languagePreference === 'fa' ? 'FA' : 'EN'}
              </button>

              <button 
                type="button" 
                onClick={toggleSTT}
                className={`p-2.5 transition-all relative group rounded-full ${isListening ? 'text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,44,44,0.3)]' : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5'}`}
                title={t.speechToText}
              >
                <Mic size={20} strokeWidth={1.5} className={isListening ? 'animate-pulse' : ''} />
              </button>

              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/5 rounded-full transition-all"
              >
                <Paperclip size={20} strokeWidth={1.5} />
              </button>

              <button 
                type="submit" 
                disabled={status === SystemStatus.PROCESSING} 
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95 hover:scale-105 transition-all disabled:opacity-50 shrink-0 ml-1 border border-white/10"
              >
                {status === SystemStatus.PROCESSING ? (
                  <Sparkles size={18} className="animate-spin" />
                ) : (
                  <SendHorizontal size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*" />
          </form>
          
        </div>
      </div>
      {showLive && (
        <LiveVoiceAssistant 
          isActive={showLive} 
          onClose={() => setShowLive(false)} 
          userProfile={userProfile}
          tasks={tasks}
          onAddTask={addTask}
          onCompleteTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      )}

      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)}
        onUpgrade={() => {
          setIsPremium(true);
          localStorage.setItem('nexus_is_premium', 'true');
        }}
      />
    </div>
  );
};

export default App;
