
import React from 'react';
import { UserProfile } from '../types';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  syncScore?: number;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, profile, onUpdate, syncScore = 0 }) => {
  const handleChange = (field: keyof UserProfile, value: string) => {
    onUpdate({ ...profile, [field]: value });
  };

  // Fix: Ensure syncScore is treated as a number
  const syncPercent = Math.min(100, (syncScore || 0) * 5);

  const resetProfile = () => {
    if (window.confirm("آیا از بازنشانی تنظیمات نکسوس اطمینان دارید؟ (Reset Core Settings?)")) {
      onUpdate({ name: '', languagePreference: 'auto', tonePreference: 'poetic', interests: '' });
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-zinc-950/90 backdrop-blur-3xl border-r border-white/10 z-50 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold tracking-[0.2em] text-white uppercase">Neural Core</h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">✕</button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Sync Level</span>
                <span className="text-[10px] text-gray-400 font-mono">{syncPercent}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                  style={{ width: `${syncPercent}%` }}
                />
              </div>
              <p className="text-[8px] text-gray-600 uppercase tracking-[0.2em] animate-pulse">Neural link established</p>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto py-8 px-6 space-y-8 scrollbar-hide">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Subject Identity</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-light text-sm"
                placeholder="Name..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Core Language</label>
              <select 
                value={profile.languagePreference}
                onChange={(e) => handleChange('languagePreference', e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-light text-sm appearance-none"
              >
                <option value="auto">Auto-Detect</option>
                <option value="fa">Persian (فارسی)</option>
                <option value="en">English (انگلیسی)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Neural Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {['poetic', 'visionary', 'analytical', 'casual'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleChange('tonePreference', t as any)}
                    className={`px-3 py-2 rounded-lg text-[9px] uppercase tracking-widest border transition-all ${
                      profile.tonePreference === t 
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]' 
                      : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-widest block">Nexus Directives</label>
              <textarea 
                value={profile.interests}
                onChange={(e) => handleChange('interests', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500/50 outline-none transition-all font-light text-sm h-32 resize-none leading-relaxed"
                placeholder="Describe your goals, interests, or how the AI should treat you..."
              />
            </div>

            <button 
              onClick={resetProfile}
              className="w-full py-3 rounded-xl border border-red-500/20 text-red-500/50 text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
            >
              Reset Core Settings
            </button>
          </div>
          
          <div className="p-6 border-t border-white/5 bg-black/40">
            <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">Nexus Neural Memory v2.1</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;
