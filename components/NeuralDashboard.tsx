
import React from 'react';
import { motion } from 'motion/react';
import { Emotion, GenerationMode } from '../types';

interface NeuralDashboardProps {
  currentEmotion: Emotion;
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
  status: string;
}

const EMOTION_COLORS: Record<Emotion, string> = {
  NEUTRAL: 'bg-gray-400',
  SAD: 'bg-blue-500',
  HAPPY: 'bg-yellow-400',
  ANGRY: 'bg-red-500',
  FEAR: 'bg-purple-500',
  SURPRISE: 'bg-orange-400',
  LOVE: 'bg-pink-500',
  CURIOSITY: 'bg-cyan-400',
  MELANCHOLY: 'bg-indigo-500',
  EUPHORIA: 'bg-fuchsia-500',
  ZEN: 'bg-teal-500',
  AWE: 'bg-amber-400',
  SYMPATHY: 'bg-rose-500',
  DETERMINATION: 'bg-orange-600',
  MYSTERY: 'bg-zinc-600',
};

const NeuralDashboard: React.FC<NeuralDashboardProps> = ({ currentEmotion, mode, onModeChange, status }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-4 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-2xl">
        {/* Emotion Frequency Monitor */}
        <div className="flex items-center gap-4 flex-grow">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-full blur-xl ${EMOTION_COLORS[currentEmotion] || 'bg-blue-500'}`}
            />
            <div className={`relative z-10 w-3 h-3 rounded-full ${EMOTION_COLORS[currentEmotion] || 'bg-blue-500'} shadow-[0_0_15px_currentColor]`} />
          </div>
          
          <div className="flex flex-col">
            <span className="text-[8px] uppercase tracking-[0.3em] text-gray-500">Neural Frequency</span>
            <span className={`text-xs font-bold tracking-widest uppercase ${currentEmotion === 'NEUTRAL' ? 'text-gray-300' : 'text-white'}`}>
              {currentEmotion}
            </span>
          </div>

          {/* Mini Waveform */}
          <div className="flex items-end gap-0.5 h-4 ml-2">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: status === 'PROCESSING' ? [4, 16, 4] : [4, 8, 4]
                }}
                transition={{ 
                  duration: 0.5 + Math.random(), 
                  repeat: Infinity,
                  delay: i * 0.1
                }}
                className={`w-0.5 rounded-full ${EMOTION_COLORS[currentEmotion] || 'bg-blue-500'} opacity-40`}
              />
            ))}
          </div>
        </div>

        {/* Generation Mode Controls */}
        <div className="flex items-center gap-2 bg-black/20 rounded-2xl p-1 border border-white/5">
          {[
            { id: GenerationMode.TEXT, label: 'Text', icon: '💬' },
            { id: GenerationMode.IMAGE, label: 'Image', icon: '🖼️' },
            { id: GenerationMode.AUDIO, label: 'Audio', icon: '🎵' },
            { id: GenerationMode.LIVE, label: 'Live', icon: '🎙️' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                mode === m.id 
                  ? 'bg-white/10 text-white border border-white/10 shadow-lg' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NeuralDashboard;
