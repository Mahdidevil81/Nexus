
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Profile, Emotion } from '../types';
import { CREATOR, PHILOSOPHY, SOCIAL_LINKS } from '../constants';
import { 
  Instagram, 
  Github, 
  Send, 
  Youtube, 
  Globe, 
  ArrowRight, 
  X, 
  ChevronDown, 
  Plus, 
  Trash2, 
  RotateCcw,
  Fingerprint,
  UserCog,
  ShieldCheck,
  Palette,
  Heart,
  Cpu,
  Save,
  Trash,
  Settings
} from 'lucide-react';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  profiles: Profile[];
  currentProfileId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onOpenRelay: () => void;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  onUpdate,
  profiles,
  currentProfileId,
  onSwitch,
  onCreate,
  onDelete,
  onOpenRelay
}) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('profiles');
  const [newProfileName, setNewProfileName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  React.useEffect(() => {
    setLocalProfile(profile);
  }, [profile, isOpen]);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
    setHasSaved(false);
  };

  const calculateSync = () => {
    let score = 0;
    if (localProfile.name) score += 30;
    if (localProfile.interests) score += 40;
    if (localProfile.tonePreference) score += 15;
    if (localProfile.languagePreference) score += 15;
    return score;
  };

  const syncPercent = hasSaved ? 100 : calculateSync();

  const handleSave = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onUpdate(localProfile);
      setIsSyncing(false);
      setHasSaved(true);
    }, 1000);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetProfile = () => {
    const reset: UserProfile = { 
      name: '', 
      languagePreference: 'auto', 
      tonePreference: 'poetic', 
      themePreference: 'DARK_NEBULA', 
      interests: '',
      expertiseLevel: 'intermediate',
      contentFocus: [],
      responseLength: 'balanced',
      creativeFreedom: 50,
      emotionHistory: []
    };
    setLocalProfile(reset);
    onUpdate(reset);
    setHasSaved(false);
    setShowResetConfirm(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getEmotionColor = (emotion: Emotion) => {
    const colors: Record<Emotion, string> = {
      NEUTRAL: 'text-gray-400',
      HAPPY: 'text-emerald-400',
      SAD: 'text-blue-400',
      ANGRY: 'text-red-400',
      FEAR: 'text-purple-400',
      SURPRISE: 'text-yellow-400',
      LOVE: 'text-pink-400',
      CURIOSITY: 'text-cyan-400',
      MELANCHOLY: 'text-indigo-400',
      EUPHORIA: 'text-orange-400',
      ZEN: 'text-teal-400',
      AWE: 'text-sky-400',
      SYMPATHY: 'text-rose-400',
      DETERMINATION: 'text-amber-400',
      MYSTERY: 'text-violet-400'
    };
    return colors[emotion] || 'text-white';
  };

  return (
    <>
      <aside 
        role="dialog" 
        aria-label="Profile Settings"
        aria-hidden={!isOpen}
        className={`fixed top-0 left-0 bottom-0 w-80 bg-black/90 backdrop-blur-3xl border-r border-white/5 z-50 transform transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-[0.3em] text-white uppercase">NEKSUS</h2>
                <span className="text-[8px] text-blue-400 uppercase tracking-[0.4em] mt-1">Neural Core v3.0</span>
              </div>
              <button 
                onClick={onClose} 
                aria-label="Close Profile Settings"
                className="p-2 text-gray-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Synchronization</span>
                <span className="text-[10px] text-blue-400 font-mono">{syncPercent}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${syncPercent}%` }}
                  className={`h-full transition-all duration-1000 ${hasSaved ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-grow overflow-y-auto py-6 px-6 space-y-4 scrollbar-hide">
            
            {/* Neural Profiles Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('profiles')}
                aria-expanded={expandedSection === 'profiles'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Fingerprint size={14} className="text-blue-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Neural Profiles</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'profiles' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'profiles' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-3"
                  >
                    <div className="space-y-2">
                      {profiles.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => onSwitch(p.id)}
                            className={`flex-grow text-left px-4 py-3 rounded-xl text-[10px] uppercase tracking-widest border transition-all flex items-center justify-between ${
                              currentProfileId === p.id 
                              ? 'bg-blue-600/20 border-blue-500 text-white' 
                              : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                            }`}
                          >
                            <span>{p.name}</span>
                            {currentProfileId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                          </button>
                          {profiles.length > 1 && (
                            <button 
                              onClick={() => onDelete(p.id)}
                              aria-label={`Delete profile ${p.name}`}
                              className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {showCreateInput ? (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                        <input 
                          autoFocus
                          type="text"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newProfileName.trim()) {
                              onCreate(newProfileName);
                              setNewProfileName('');
                              setShowCreateInput(false);
                            }
                          }}
                          className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px] outline-none"
                          placeholder="Profile Name..."
                        />
                        <button 
                          onClick={() => {
                            if (newProfileName.trim()) {
                              onCreate(newProfileName);
                              setNewProfileName('');
                              setShowCreateInput(false);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 rounded-xl text-white text-[10px]"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowCreateInput(true)}
                        className="w-full py-3 rounded-xl border border-dashed border-white/10 text-gray-600 text-[8px] uppercase tracking-widest hover:border-white/20 hover:text-gray-400 transition-all"
                      >
                        <Plus size={10} />
                        Initialize New Profile
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Aura Gateway Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={onOpenRelay}
                className="w-full p-4 flex items-center justify-between hover:bg-cyan-500/10 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-cyan-400 animate-pulse" />
                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-black">Aura Gateway</span>
                </div>
                <ArrowRight size={14} className="text-cyan-600 transition-transform group-hover:translate-x-1" />
              </button>
            </section>

            {/* Identity Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('identity')}
                aria-expanded={expandedSection === 'identity'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <UserCog size={14} className="text-cyan-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Subject Identity</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'identity' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'identity' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-4"
                  >
                    <input 
                      type="text" 
                      value={localProfile.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-light text-sm"
                      placeholder="Enter Name..."
                      aria-label="Profile Name"
                    />
                    <textarea 
                      value={localProfile.interests}
                      onChange={(e) => handleChange('interests', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-light text-sm h-24 resize-none leading-relaxed"
                      placeholder="Neural Directives..."
                      aria-label="Neural Directives"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Configuration Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('config')}
                aria-expanded={expandedSection === 'config'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Settings size={14} className="text-emerald-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Neural Config</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'config' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'config' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-6"
                  >
                    <div className="space-y-2">
                      <label htmlFor="language-select" className="text-[8px] text-gray-600 uppercase tracking-widest block px-1">Language</label>
                      <select 
                        id="language-select"
                        value={localProfile.languagePreference}
                        onChange={(e) => handleChange('languagePreference', e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-light text-sm appearance-none"
                      >
                        <option value="auto">Auto-Detect</option>
                        <option value="fa">Persian (فارسی)</option>
                        <option value="en">English (انگلیسی)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest block px-1">Tone</span>
                      <div className="grid grid-cols-2 gap-2">
                        {['poetic', 'visionary', 'analytical', 'casual'].map((t) => (
                          <button
                            key={t}
                            onClick={() => handleChange('tonePreference', t as any)}
                            className={`px-3 py-2 rounded-lg text-[8px] uppercase tracking-widest border transition-all ${
                              localProfile.tonePreference === t 
                              ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                              : 'bg-white/5 border-white/10 text-gray-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Neural Parameters Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('parameters')}
                aria-expanded={expandedSection === 'parameters'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-orange-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Neural Parameters</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'parameters' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'parameters' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-6"
                  >
                    <div className="space-y-2">
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest block px-1">Expertise Level</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['beginner', 'intermediate', 'expert'].map((l) => (
                          <button
                            key={l}
                            onClick={() => handleChange('expertiseLevel', l as any)}
                            className={`px-2 py-2 rounded-lg text-[7px] uppercase tracking-widest border transition-all ${
                              localProfile.expertiseLevel === l 
                              ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' 
                              : 'bg-white/5 border-white/10 text-gray-600'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest block px-1">Content Focus</span>
                      <div className="flex flex-wrap gap-2">
                        {['Technology', 'Philosophy', 'Art', 'Science', 'Spirituality', 'History', 'Future'].map((f) => (
                          <button
                            key={f}
                            onClick={() => {
                              const current = localProfile.contentFocus || [];
                              const next = current.includes(f) 
                                ? current.filter(item => item !== f)
                                : [...current, f];
                              handleChange('contentFocus', next);
                            }}
                            className={`px-3 py-1.5 rounded-full text-[7px] uppercase tracking-widest border transition-all ${
                              localProfile.contentFocus?.includes(f)
                              ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-400' 
                              : 'bg-white/5 border-white/10 text-gray-600'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest block px-1">Response Length</span>
                      <div className="grid grid-cols-3 gap-2">
                        {['concise', 'balanced', 'detailed'].map((l) => (
                          <button
                            key={l}
                            onClick={() => handleChange('responseLength', l as any)}
                            className={`px-2 py-2 rounded-lg text-[7px] uppercase tracking-widest border transition-all ${
                              localProfile.responseLength === l 
                              ? 'bg-amber-600/20 border-amber-500 text-amber-400' 
                              : 'bg-white/5 border-white/10 text-gray-600'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label htmlFor="creative-freedom-range" className="text-[8px] text-gray-600 uppercase tracking-widest block">Creative Freedom</label>
                        <span className="text-[9px] text-blue-400 font-mono">{localProfile.creativeFreedom}%</span>
                      </div>
                      <input 
                        id="creative-freedom-range"
                        type="range" 
                        min="0" 
                        max="100" 
                        value={localProfile.creativeFreedom}
                        onChange={(e) => handleChange('creativeFreedom', parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Aesthetics Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('aesthetics')}
                aria-expanded={expandedSection === 'aesthetics'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Palette size={14} className="text-fuchsia-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Visual Imprint</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'aesthetics' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'aesthetics' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                      {[
                        { id: 'DARK_NEBULA', label: 'Dark Nebula' },
                        { id: 'CYBERPUNK_GLOW', label: 'Cyberpunk Glow' },
                        { id: 'MINIMALIST_TECH', label: 'Minimalist Tech' },
                        { id: 'SOLAR_FLARE', label: 'Solar Flare' },
                        { id: 'DEEP_SPACE', label: 'Deep Space' },
                        { id: 'VIOLET_DREAM', label: 'Violet Dream' },
                        { id: 'ARCTIC_FROST', label: 'Arctic Frost' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => handleChange('themePreference', t.id as any)}
                          className={`px-4 py-3 rounded-xl text-[9px] uppercase tracking-widest border transition-all flex items-center justify-between ${
                            localProfile.themePreference === t.id 
                            ? 'bg-blue-600/20 border-blue-500 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-600 hover:border-white/20'
                          }`}
                        >
                          <span>{t.label}</span>
                          {localProfile.themePreference === t.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Emotion History Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('emotions')}
                aria-expanded={expandedSection === 'emotions'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                   <Heart size={14} className="text-rose-500" />
                   <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Emotion History</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'emotions' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'emotions' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                      {localProfile.emotionHistory && localProfile.emotionHistory.length > 0 ? (
                        localProfile.emotionHistory.map((eh, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className={`text-[9px] uppercase tracking-widest font-bold ${getEmotionColor(eh.emotion)}`}>
                              {eh.emotion}
                            </span>
                            <span className="text-[8px] text-gray-600 font-mono">
                              {new Date(eh.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-[9px] text-gray-600 uppercase tracking-widest">No emotional data recorded</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Architect Section */}
            <section className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button 
                onClick={() => toggleSection('architect')}
                aria-expanded={expandedSection === 'architect'}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-violet-500" />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Architect</span>
                </div>
                <ChevronDown size={14} className={`text-gray-600 transition-transform duration-300 ${expandedSection === 'architect' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expandedSection === 'architect' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 space-y-3"
                  >
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-600 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          MD
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-200 font-bold tracking-wider">{CREATOR}</span>
                          <span className="text-[7px] text-blue-400 uppercase tracking-[0.2em]">Visionary Architect</span>
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-gray-500 italic leading-relaxed border-l-2 border-white/10 pl-3 py-1">
                        "{PHILOSOPHY}"
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        {SOCIAL_LINKS.map((link) => {
                          const Icon = link.name === 'Instagram' ? Instagram : 
                                       link.name === 'GitHub' ? Github : 
                                       link.name === 'Telegram' ? Send : 
                                       link.name === 'YouTube' ? Youtube : Globe;
                          return (
                            <a 
                              key={link.name}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                              title={link.name}
                            >
                              <Icon className={`w-4 h-4 ${link.color || 'text-gray-400'} group-hover:scale-110 transition-transform`} />
                            </a>
                          );
                        })}
                        <a 
                          href="https://mahdidevil.blogspot.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                          title="Blog"
                        >
                          <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        </a>
                      </div>

                      <a 
                        href="https://mahdidevil.blogspot.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
                      >
                        <span className="text-[8px] text-blue-400 uppercase tracking-widest font-bold">Neural Gateway</span>
                        <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

          </div>
          
          {/* Footer Actions */}
          <footer className="p-6 border-t border-white/5 bg-black/40 space-y-3">
            <button 
              onClick={handleSave}
              disabled={isSyncing}
              className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                hasSaved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
              }`}
            >
              {isSyncing ? (
                <RotateCcw size={16} className="animate-spin" />
              ) : hasSaved ? (
                <ShieldCheck size={16} />
              ) : (
                <Save size={16} />
              )}
              {isSyncing ? "Syncing..." : hasSaved ? "Synchronized" : "Establish Link"}
            </button>

            {showResetConfirm ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                <button onClick={resetProfile} className="flex-grow py-2 rounded-lg bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <Trash size={12} />
                  Confirm
                </button>
                <button onClick={() => setShowResetConfirm(false)} className="flex-grow py-2 rounded-lg bg-white/5 text-gray-400 text-[9px] uppercase tracking-widest">Cancel</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)} 
                className="w-full py-2 text-red-500/40 text-[8px] uppercase tracking-widest hover:text-red-500/80 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={10} />
                Reset Neural Core
              </button>
            )}

            <div className="pt-4 text-center">
              <div className="h-px w-8 bg-white/5 mx-auto mb-4"></div>
              <p className="text-[7px] text-gray-700 uppercase tracking-[0.3em] font-light">
                © 2026 Nexus • Mahdi Devil
              </p>
            </div>
          </footer>
        </div>
      </aside>
    </>
  );
};

export default React.memo(ProfileDrawer);
