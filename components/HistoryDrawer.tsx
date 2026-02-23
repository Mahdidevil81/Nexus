import React from 'react';
import { AiResponse } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AiResponse[];
  onSelect: (item: AiResponse) => void;
  onClearHistory?: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect, onClearHistory }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 bg-zinc-950/80 backdrop-blur-2xl border-r border-white/10 z-50 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-widest text-white uppercase">حافظه نکسوس</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">✕</button>
          </div>
          
          <div className="flex-grow overflow-y-auto py-4 px-2 space-y-2 scrollbar-hide">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-30">
                <span className="text-4xl mb-2">📜</span>
                <p className="text-xs uppercase tracking-widest">هنوز حافظه‌ای ثبت نشده</p>
              </div>
            ) : (
              <div className="px-2 pb-4 border-b border-white/5 mb-2">
                <button 
                  onClick={onClearHistory}
                  className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all"
                >
                  پاکسازی حافظه (Clear All)
                </button>
              </div>
            )}
            
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full text-right p-4 rounded-xl bg-white/5 border border-transparent hover:border-blue-500/30 hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-gray-500 font-mono">{new Date(item.timestamp).toLocaleTimeString('fa-IR')}</span>
                  <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${item.mediaType ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {item.mediaType || 'Text'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 font-light leading-relaxed group-hover:text-white transition-colors">
                  {item.text || "بدون متن"}
                </p>
              </button>
            ))}
          </div>
          
          <div className="p-6 border-t border-white/5 bg-black/40">
            <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">Nexus Neural Memory v2.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryDrawer;