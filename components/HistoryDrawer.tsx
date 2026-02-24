import React from 'react';
import { AiResponse } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AiResponse[];
  onSelect: (item: AiResponse) => void;
  onRegenerate?: (item: AiResponse) => void;
  onClearHistory?: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect, onRegenerate, onClearHistory }) => {
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
              <div
                key={item.id}
                className="w-full text-right p-3 rounded-xl bg-white/5 border border-transparent hover:border-blue-500/30 hover:bg-white/10 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-gray-500 font-mono">{new Date(item.timestamp).toLocaleTimeString('fa-IR')}</span>
                  <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${item.mediaType === 'image' ? 'bg-fuchsia-500/20 text-fuchsia-400' : item.mediaType === 'audio' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {item.mediaType || 'Text'}
                  </span>
                </div>

                <div className="flex gap-3" onClick={() => onSelect(item)}>
                  {item.mediaType === 'image' && item.mediaUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                      <img src={item.mediaUrl} alt="History" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <p className="text-[11px] text-white/90 font-medium line-clamp-1 mb-1" dir="auto">
                      {item.prompt || "No prompt"}
                    </p>
                    <p className="text-[10px] text-gray-400 line-clamp-2 font-light leading-snug group-hover:text-gray-300 transition-colors">
                      {item.text || "بدون متن"}
                    </p>
                    {item.imageOptions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500 uppercase">{item.imageOptions.aspectRatio}</span>
                        <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500 uppercase">{item.imageOptions.style}</span>
                      </div>
                    )}
                  </div>
                </div>

                {onRegenerate && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRegenerate(item); }}
                    className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500/20"
                    title="Regenerate"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
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