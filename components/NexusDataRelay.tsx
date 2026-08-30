
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchNexusData, fetchNexusKnowledge, NexusProject } from '../services/nexusDataService';

interface NexusDataRelayProps {
  externalToggle?: boolean;
  onClose?: () => void;
}

const NexusDataRelay: React.FC<NexusDataRelayProps> = ({ externalToggle, onClose }) => {
  const [data, setData] = useState<NexusProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'DATA' | 'KNOWLEDGE'>('DATA');

  // Trigger from outside if externalToggle changes
  React.useEffect(() => {
    if (externalToggle !== undefined && externalToggle !== isOpen) {
      if (externalToggle) handleFetch('DATA');
      else setIsOpen(false);
    }
  }, [externalToggle]);

  const handleFetch = async (tab: 'DATA' | 'KNOWLEDGE' = activeTab) => {
    setLoading(true);
    setIsOpen(true);
    setActiveTab(tab);
    const results = tab === 'DATA' ? await fetchNexusData() : await fetchNexusKnowledge();
    setData(results || []);
    setLoading(false);
  };

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none w-full h-full">
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto w-[90%] max-w-sm max-h-[80vh] bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/5 flex flex-col bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">Aura Gateway</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest">Nexus Neural Relay</span>
                </div>
                <button 
                  onClick={() => { setIsOpen(false); onClose?.(); }} 
                  className="p-2 -mr-2 text-gray-500 hover:text-white transition-colors"
                  aria-label="Close Relay"
                >✕</button>
              </div>

              <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                {[
                  { id: 'DATA', label: 'Data', icon: '📡' },
                  { id: 'KNOWLEDGE', label: 'Knowledge', icon: '🧠' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleFetch(tab.id as any)}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Synchronizing Neural Field...</span>
                </div>
              ) : data.length > 0 ? (
                data.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-2xl border transition-all group ${
                      item.type === 'knowledge' ? 'bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/50' : 'bg-white/5 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <h4 className={`text-[11px] font-bold mb-1 transition-colors line-clamp-2 ${
                      item.type === 'knowledge' ? 'text-fuchsia-300 group-hover:text-fuchsia-200' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {item.type === 'knowledge' ? '💎 ' : '📌 '}{item.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-4">
                      {item.type === 'knowledge' ? '✨ ' : '🔍 '}{item.description}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">No signals synthesized.</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-black/40 border-t border-white/5 text-center">
              <span className="text-[8px] text-gray-600 uppercase tracking-widest">
                Source: {activeTab === 'DATA' ? 'data.europa.eu' : 'Nexus Neural Archive'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default NexusDataRelay;
