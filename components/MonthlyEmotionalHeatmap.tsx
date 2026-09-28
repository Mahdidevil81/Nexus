import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Emotion } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Activity, 
  Flame, 
  RotateCcw,
  Check
} from 'lucide-react';

interface EmotionHistoryItem {
  emotion: Emotion;
  timestamp: number;
}

interface MonthlyEmotionalHeatmapProps {
  emotionHistory: EmotionHistoryItem[];
  onUpdateEmotionHistory?: (newHistory: EmotionHistoryItem[]) => void;
  language?: 'fa' | 'en' | 'auto';
}

// Color palette aligned with Nexus AWARE protocol & ProfileDrawer
const EMOTION_CONFIG: Record<Emotion, {
  name: string;
  color: string;
  bgHex: string;
  borderHex: string;
  glowHex: string;
  description: string;
}> = {
  HAPPY: {
    name: 'Joy / Happy',
    color: 'text-emerald-400',
    bgHex: '#10b981',
    borderHex: '#059669',
    glowHex: 'rgba(16, 185, 129, 0.4)',
    description: 'Elevated vibrational frequency of contentment and delight.'
  },
  ZEN: {
    name: 'Zen / Calm',
    color: 'text-teal-400',
    bgHex: '#14b8a6',
    borderHex: '#0d9488',
    glowHex: 'rgba(20, 184, 166, 0.4)',
    description: 'Stillness of mind, balanced harmonic equilibrium.'
  },
  CURIOSITY: {
    name: 'Curiosity / Inquiry',
    color: 'text-cyan-400',
    bgHex: '#06b6d4',
    borderHex: '#0891b2',
    glowHex: 'rgba(6, 182, 212, 0.4)',
    description: 'Electrified neural seeking, decoding hidden matrix patterns.'
  },
  EUPHORIA: {
    name: 'Euphoria / Bliss',
    color: 'text-orange-400',
    bgHex: '#f97316',
    borderHex: '#ea580c',
    glowHex: 'rgba(249, 115, 22, 0.45)',
    description: 'Peak transcendental expansion and energetic radiance.'
  },
  LOVE: {
    name: 'Love / Compassion',
    color: 'text-pink-400',
    bgHex: '#ec4899',
    borderHex: '#db2777',
    glowHex: 'rgba(236, 72, 153, 0.4)',
    description: 'Tat Tvam Asi connection, universal heart resonance.'
  },
  AWE: {
    name: 'Awe / Wonder',
    color: 'text-sky-400',
    bgHex: '#0ea5e9',
    borderHex: '#0284c7',
    glowHex: 'rgba(14, 165, 233, 0.4)',
    description: 'Profound reverence before the infinite tapestry of creation.'
  },
  DETERMINATION: {
    name: 'Determination',
    color: 'text-amber-400',
    bgHex: '#f59e0b',
    borderHex: '#d97706',
    glowHex: 'rgba(245, 158, 11, 0.4)',
    description: 'Unyielding drive and sovereign alignment of will.'
  },
  MYSTERY: {
    name: 'Mystery / Intuition',
    color: 'text-violet-400',
    bgHex: '#8b5cf6',
    borderHex: '#7c3aed',
    glowHex: 'rgba(139, 92, 246, 0.4)',
    description: 'Intuitive peering into the occult and unexplored depths.'
  },
  SURPRISE: {
    name: 'Surprise / Spark',
    color: 'text-yellow-400',
    bgHex: '#eab308',
    borderHex: '#ca8a04',
    glowHex: 'rgba(234, 179, 8, 0.4)',
    description: 'Sudden disruption of expectation, spontaneous flash.'
  },
  MELANCHOLY: {
    name: 'Melancholy / Longing',
    color: 'text-indigo-400',
    bgHex: '#6366f1',
    borderHex: '#4f46e5',
    glowHex: 'rgba(99, 102, 241, 0.4)',
    description: 'Reflective, poetic gravity of longing and impermanence.'
  },
  SAD: {
    name: 'Sadness / Sorrow',
    color: 'text-blue-400',
    bgHex: '#3b82f6',
    borderHex: '#2563eb',
    glowHex: 'rgba(59, 130, 246, 0.4)',
    description: 'Deep internal processing and release of heavy energy.'
  },
  FEAR: {
    name: 'Fear / Vigilance',
    color: 'text-purple-400',
    bgHex: '#a855f7',
    borderHex: '#9333ea',
    glowHex: 'rgba(168, 85, 247, 0.4)',
    description: 'Hyper-vigilant neural firing and survival perception.'
  },
  ANGRY: {
    name: 'Anger / Fire',
    color: 'text-red-400',
    bgHex: '#ef4444',
    borderHex: '#dc2626',
    glowHex: 'rgba(239, 68, 68, 0.45)',
    description: 'Catalytic fire demanding transformation and boundary defense.'
  },
  SYMPATHY: {
    name: 'Sympathy / Empathy',
    color: 'text-rose-400',
    bgHex: '#f43f5e',
    borderHex: '#e11d48',
    glowHex: 'rgba(244, 63, 94, 0.4)',
    description: 'Active mirroring of another consciousness in the field.'
  },
  NEUTRAL: {
    name: 'Neutral / Equanimity',
    color: 'text-gray-400',
    bgHex: '#9ca3af',
    borderHex: '#6b7280',
    glowHex: 'rgba(156, 163, 175, 0.25)',
    description: 'Zero-point baseline awareness; calm observation.'
  }
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthlyEmotionalHeatmap: React.FC<MonthlyEmotionalHeatmapProps> = ({
  emotionHistory = [],
  onUpdateEmotionHistory,
  language = 'en'
}) => {
  // Navigation State: defaults to the current month & year
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [filterEmotion, setFilterEmotion] = useState<Emotion | 'ALL'>('ALL');
  const [justSeeded, setJustSeeded] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format month and year label
  const monthName = useMemo(() => {
    return currentDate.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentDate, language]);

  // Aggregate daily emotions
  // Key format: YYYY-MM-DD
  const dailyData = useMemo(() => {
    const map = new Map<string, {
      date: Date;
      key: string;
      counts: Record<Emotion, number>;
      totalLogs: number;
      predominantEmotion: Emotion;
      predominantCount: number;
      timestamps: { emotion: Emotion; time: number }[];
    }>();

    emotionHistory.forEach((item) => {
      const d = new Date(item.timestamp);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;

      let record = map.get(key);
      if (!record) {
        record = {
          date: new Date(y, d.getMonth(), d.getDate()),
          key,
          counts: {} as Record<Emotion, number>,
          totalLogs: 0,
          predominantEmotion: item.emotion,
          predominantCount: 0,
          timestamps: []
        };
        map.set(key, record);
      }

      record.counts[item.emotion] = (record.counts[item.emotion] || 0) + 1;
      record.totalLogs += 1;
      record.timestamps.push({ emotion: item.emotion, time: item.timestamp });

      // Recalculate predominant emotion
      if (record.counts[item.emotion] > record.predominantCount) {
        record.predominantEmotion = item.emotion;
        record.predominantCount = record.counts[item.emotion];
      }
    });

    return map;
  }, [emotionHistory]);

  // Generate calendar days for the current displayed month
  const calendarCells = useMemo(() => {
    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Day of the week for the 1st day (0 is Sun, 1 is Mon, ..., 6 is Sat)
    // Convert to Monday=0 .. Sunday=6 for clean European/ISO calendar layout
    const firstDayWeekday = new Date(year, month, 1).getDay();
    const leadingPadding = (firstDayWeekday + 6) % 7;

    const cells: Array<{
      type: 'padding' | 'day';
      dayNumber?: number;
      key?: string;
      data?: (typeof dailyData extends Map<any, infer V> ? V : never) | null;
      isToday?: boolean;
    }> = [];

    // Leading padding cells from previous month
    for (let i = 0; i < leadingPadding; i++) {
      cells.push({ type: 'padding' });
    }

    const today = new Date();
    const isCurrentYearMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDateNumber = today.getDate();

    // Days in this month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRecord = dailyData.get(dayKey) || null;
      const isToday = isCurrentYearMonth && d === todayDateNumber;

      cells.push({
        type: 'day',
        dayNumber: d,
        key: dayKey,
        data: dayRecord,
        isToday
      });
    }

    return cells;
  }, [year, month, dailyData]);

  // Monthly stats calculation
  const monthlyStats = useMemo(() => {
    const daysWithData = calendarCells.filter(c => c.type === 'day' && c.data && c.data.totalLogs > 0);
    const activeDaysCount = daysWithData.length;
    
    // Emotion totals in this month
    const emotionFrequency: Record<string, number> = {};
    let totalMonthlyPulses = 0;

    daysWithData.forEach(c => {
      if (c.data) {
        Object.entries(c.data.counts).forEach(([em, cnt]) => {
          emotionFrequency[em] = (emotionFrequency[em] || 0) + cnt;
          totalMonthlyPulses += cnt;
        });
      }
    });

    const topEmotionEntry = Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1])[0];
    const topEmotion = topEmotionEntry ? (topEmotionEntry[0] as Emotion) : null;
    const distinctEmotionsCount = Object.keys(emotionFrequency).length;

    // Calculate longest consecutive streak in this month
    let maxStreak = 0;
    let currentStreak = 0;
    calendarCells.filter(c => c.type === 'day').forEach(c => {
      if (c.data && c.data.totalLogs > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    return {
      activeDaysCount,
      totalMonthlyPulses,
      topEmotion,
      distinctEmotionsCount,
      maxStreak
    };
  }, [calendarCells]);

  // Handlers for month navigation
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayKey(null);
  };

  const handleTodayReset = () => {
    setCurrentDate(new Date());
    setSelectedDayKey(null);
  };

  // Seed sample data for user to immediately explore the heatmap
  const handleSeedQuantumHistory = () => {
    if (!onUpdateEmotionHistory) return;

    const sampleEmotions: Emotion[] = [
      'ZEN', 'HAPPY', 'CURIOSITY', 'EUPHORIA', 'AWE', 
      'LOVE', 'DETERMINATION', 'MYSTERY', 'MELANCHOLY'
    ];

    const generated: EmotionHistoryItem[] = [];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Generate emotional logs across the last 35 days with varying density
    for (let dayOffset = 35; dayOffset >= 0; dayOffset--) {
      // 80% chance of emotional activity on a given day
      if (Math.random() > 0.2) {
        const pulsesCount = Math.floor(Math.random() * 6) + 1; // 1 to 6 pulses
        const primaryEmotion = sampleEmotions[Math.floor(Math.random() * sampleEmotions.length)];

        for (let p = 0; p < pulsesCount; p++) {
          const emotion = Math.random() > 0.35 
            ? primaryEmotion 
            : sampleEmotions[Math.floor(Math.random() * sampleEmotions.length)];
          
          const timestamp = now - (dayOffset * oneDay) + (p * 3600 * 1000 * 3);
          generated.push({ emotion, timestamp });
        }
      }
    }

    onUpdateEmotionHistory([...generated, ...emotionHistory]);
    setJustSeeded(true);
    setTimeout(() => setJustSeeded(false), 2500);
  };

  // Selected Day Details
  const selectedDayInfo = useMemo(() => {
    if (!selectedDayKey) return null;
    return dailyData.get(selectedDayKey) || {
      key: selectedDayKey,
      totalLogs: 0,
      counts: {} as Record<Emotion, number>,
      timestamps: [],
      predominantEmotion: 'NEUTRAL' as Emotion,
      predominantCount: 0,
      date: new Date(selectedDayKey)
    };
  }, [selectedDayKey, dailyData]);

  // Compute cell intensity styling
  const getCellIntensityStyle = (data: (typeof dailyData extends Map<any, infer V> ? V : never) | null | undefined) => {
    if (!data || data.totalLogs === 0) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        color: '#6b7280',
        boxShadow: 'none'
      };
    }

    const cfg = EMOTION_CONFIG[data.predominantEmotion] || EMOTION_CONFIG.NEUTRAL;
    
    // Scale intensity based on number of logs on that day
    // 1 log: 30% intensity
    // 2 logs: 50%
    // 3-4 logs: 70%
    // 5+ logs: 90% + glowing shadow
    let opacity = 0.30;
    let shadow = 'none';

    if (data.totalLogs === 1) {
      opacity = 0.35;
    } else if (data.totalLogs === 2) {
      opacity = 0.55;
    } else if (data.totalLogs <= 4) {
      opacity = 0.75;
      shadow = `0 0 8px ${cfg.glowHex}`;
    } else {
      opacity = 0.95;
      shadow = `0 0 12px ${cfg.glowHex}`;
    }

    // Check filter match
    const isFilteredOut = filterEmotion !== 'ALL' && data.predominantEmotion !== filterEmotion;

    if (isFilteredOut) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        borderColor: 'rgba(255, 255, 255, 0.03)',
        color: '#4b5563',
        opacity: 0.25,
        boxShadow: 'none'
      };
    }

    return {
      backgroundColor: cfg.bgHex,
      opacity,
      borderColor: cfg.borderHex,
      boxShadow: shadow,
      color: '#ffffff'
    };
  };

  return (
    <div className="space-y-4">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 text-gray-400 hover:text-white transition-all"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider text-gray-200 uppercase font-mono">
              {monthName}
            </span>
            <span className="text-[8px] text-gray-500 font-mono tracking-widest">
              AURA QUANTUM CYCLE
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 text-gray-400 hover:text-white transition-all"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTodayReset}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[8px] text-gray-300 uppercase tracking-widest font-mono transition-all"
          >
            Today
          </button>

          {onUpdateEmotionHistory && (
            <button
              onClick={handleSeedQuantumHistory}
              title="Populate demo emotional logs across the last month to inspect long-term heat patterns"
              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-[8px] flex items-center gap-1 transition-all"
            >
              {justSeeded ? <Check size={12} className="text-emerald-400" /> : <Sparkles size={12} />}
              <span className="hidden sm:inline uppercase tracking-widest font-mono text-[7px]">
                {justSeeded ? 'Synced' : 'Simulate'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Monthly Resonance Summary Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase tracking-wider font-mono">
            <Activity size={10} className="text-cyan-400" />
            <span>Active Days</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold text-white font-mono">
              {monthlyStats.activeDaysCount}
            </span>
            <span className="text-[8px] text-gray-500 font-mono">
              / {calendarCells.filter(c => c.type === 'day').length}d
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase tracking-wider font-mono">
            <Flame size={10} className="text-amber-400" />
            <span>Max Streak</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold text-amber-300 font-mono">
              {monthlyStats.maxStreak}
            </span>
            <span className="text-[8px] text-gray-500 font-mono">days</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[8px] text-gray-500 uppercase tracking-wider font-mono truncate">
            <Sparkles size={10} className="text-fuchsia-400" />
            <span>Dominant Vibe</span>
          </div>
          <div className="mt-1 truncate">
            {monthlyStats.topEmotion ? (
              <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${EMOTION_CONFIG[monthlyStats.topEmotion]?.color || 'text-white'}`}>
                {monthlyStats.topEmotion}
              </span>
            ) : (
              <span className="text-[9px] text-gray-600 font-mono uppercase">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-2">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center pb-1 border-b border-white/5">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-[8px] font-mono text-gray-500 uppercase tracking-wider py-0.5">
              {wd}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {calendarCells.map((cell, index) => {
            if (cell.type === 'padding') {
              return (
                <div 
                  key={`pad-${index}`} 
                  className="aspect-square rounded-lg bg-transparent opacity-10 pointer-events-none" 
                />
              );
            }

            const isSelected = selectedDayKey === cell.key;
            const style = getCellIntensityStyle(cell.data);
            const hasData = Boolean(cell.data && cell.data.totalLogs > 0);

            return (
              <button
                key={cell.key}
                onClick={() => setSelectedDayKey(prev => prev === cell.key ? null : (cell.key || null))}
                style={style}
                className={`group relative aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 transition-all duration-300 border ${
                  cell.isToday 
                    ? 'ring-1 ring-cyan-400 ring-offset-1 ring-offset-black' 
                    : ''
                } ${
                  isSelected 
                    ? 'scale-105 border-white !opacity-100 z-10' 
                    : 'hover:scale-105'
                }`}
              >
                {/* Day number */}
                <span className={`text-[9px] font-mono font-bold leading-none ${
                  hasData ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-gray-500'
                }`}>
                  {cell.dayNumber}
                </span>

                {/* Pulses / Intensity Indicator */}
                {hasData && cell.data && (
                  <div className="w-full flex justify-center items-center gap-0.5">
                    <span className="text-[7px] font-mono font-black tracking-tighter opacity-90 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {cell.data.totalLogs}
                    </span>
                  </div>
                )}

                {/* Subtle dot indicator if today */}
                {cell.isToday && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400 animate-ping opacity-75" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Detail Card */}
      <AnimatePresence mode="wait">
        {selectedDayInfo && (
          <motion.div
            key={selectedDayInfo.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon size={13} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-gray-200 font-mono uppercase tracking-wider">
                  {new Date(selectedDayInfo.key).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <span className="text-[8px] font-mono text-gray-500">
                {selectedDayInfo.totalLogs} {selectedDayInfo.totalLogs === 1 ? 'Pulse' : 'Pulses'}
              </span>
            </div>

            {selectedDayInfo.totalLogs > 0 ? (
              <div className="space-y-2">
                {/* Predominant Emotion Highlight */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                      style={{ 
                        backgroundColor: EMOTION_CONFIG[selectedDayInfo.predominantEmotion]?.bgHex || '#fff',
                        color: EMOTION_CONFIG[selectedDayInfo.predominantEmotion]?.bgHex || '#fff'
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest font-mono">Predominant Emotion</span>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${EMOTION_CONFIG[selectedDayInfo.predominantEmotion]?.color || 'text-white'}`}>
                        {EMOTION_CONFIG[selectedDayInfo.predominantEmotion]?.name || selectedDayInfo.predominantEmotion}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-gray-400">
                    {Math.round((selectedDayInfo.predominantCount / selectedDayInfo.totalLogs) * 100)}% dominance
                  </span>
                </div>

                <p className="text-[8px] text-gray-400 italic px-1 leading-relaxed">
                  "{EMOTION_CONFIG[selectedDayInfo.predominantEmotion]?.description}"
                </p>

                {/* Breakdown of all emotions on that day */}
                <div className="space-y-1 pt-1">
                  <div className="text-[7px] text-gray-500 uppercase tracking-widest font-mono">Daily Spectrum Breakdown</div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selectedDayInfo.counts).map(([em, cnt]) => {
                      const cfg = EMOTION_CONFIG[em as Emotion] || EMOTION_CONFIG.NEUTRAL;
                      return (
                        <div 
                          key={em} 
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 flex items-center gap-1.5 text-[8px] font-mono"
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.bgHex }} />
                          <span className={cfg.color}>{em}</span>
                          <span className="text-gray-500">×{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-[9px] text-gray-500 font-mono uppercase tracking-widest">
                No emotional pulses registered on this planetary cycle.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heatmap Intensity & Emotion Legend */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between text-[7px] text-gray-500 uppercase tracking-widest font-mono">
          <span>Pulse Intensity</span>
          <div className="flex items-center gap-1">
            <span>Low</span>
            <div className="flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/30" />
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-500/50" />
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/70 border border-cyan-500/80" />
              <span className="w-2.5 h-2.5 rounded bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)] border border-cyan-300" />
            </div>
            <span>High</span>
          </div>
        </div>

        {/* Emotion Spectrum Filters */}
        <div className="flex items-center justify-between">
          <span className="text-[7px] text-gray-500 uppercase tracking-widest font-mono">
            Filter Resonance:
          </span>
          {filterEmotion !== 'ALL' && (
            <button
              onClick={() => setFilterEmotion('ALL')}
              className="text-[7px] text-cyan-400 hover:underline uppercase tracking-wider font-mono flex items-center gap-0.5"
            >
              <RotateCcw size={8} />
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1 scrollbar-hide">
          {(['ALL', 'HAPPY', 'ZEN', 'CURIOSITY', 'EUPHORIA', 'LOVE', 'AWE', 'DETERMINATION', 'MELANCHOLY', 'SAD'] as const).map((em) => {
            const isSelected = filterEmotion === em;
            if (em === 'ALL') {
              return (
                <button
                  key="ALL"
                  onClick={() => setFilterEmotion('ALL')}
                  className={`px-2 py-0.5 rounded-md text-[7px] font-mono uppercase tracking-wider transition-all border ${
                    isSelected 
                      ? 'bg-white/20 text-white border-white/30 font-bold' 
                      : 'bg-white/5 text-gray-500 border-white/5 hover:text-gray-300'
                  }`}
                >
                  All
                </button>
              );
            }

            const cfg = EMOTION_CONFIG[em];
            return (
              <button
                key={em}
                onClick={() => setFilterEmotion(prev => prev === em ? 'ALL' : em)}
                className={`px-2 py-0.5 rounded-md text-[7px] font-mono uppercase tracking-wider transition-all border flex items-center gap-1 ${
                  isSelected 
                    ? 'border-white font-bold shadow-[0_0_8px_rgba(255,255,255,0.2)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
                style={isSelected ? { backgroundColor: cfg.bgHex, color: '#ffffff' } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.bgHex }} />
                <span className={isSelected ? 'text-white' : cfg.color}>{em}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthlyEmotionalHeatmap;
