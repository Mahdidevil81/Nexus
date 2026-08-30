import React from 'react';
import { 
  X, 
  Archive, 
  Trash2, 
  RefreshCw, 
  ScrollText, 
  Clapperboard,
  Image as ImageIcon,
  Clock,
  Music,
  History as HistoryIcon
} from 'lucide-react';
import { AiResponse } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: AiResponse[];
  onSelect: (item: AiResponse) => void;
  onRegenerate?: (item: AiResponse) => void;
  onClearHistory?: () => void;
  onOpenArchive?: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose, history, onSelect, onRegenerate, onClearHistory, onOpenArchive }) => {
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
            <h2 className="text-lg font-bold tracking-widest text-white uppercase flex items-center gap-3">
              <HistoryIcon size={20} className="text-blue-500" />
              حافظه نکسوس
            </h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto py-4 px-2 space-y-2 scrollbar-hide">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-30">
                <ScrollText size={48} className="mb-4 text-gray-400" />
                <p className="text-xs uppercase tracking-widest">هنوز حافظه‌ای ثبت نشده</p>
              </div>
            ) : (
              <div className="px-2 pb-4 border-b border-white/5 mb-2 space-y-2">
                <button 
                  onClick={onOpenArchive}
                  className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <Archive size={14} className="group-hover:scale-110 transition-transform" />
                  Neural Archive
                </button>
                <button 
                  onClick={onClearHistory}
                  className="w-full py-2 rounded-lg text-red-400/60 text-[9px] uppercase tracking-[0.2em] hover:text-red-400 transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                  Clear History
                </button>
              </div>
            )}
            
            {history.map((item) => (
              <div
                key={item.id}
                className="w-full text-right p-3 rounded-xl bg-white/5 border border-transparent hover:border-blue-500/30 hover:bg-white/10 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock size={10} className="text-gray-600" />
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(item.timestamp).toLocaleTimeString('fa-IR')}</span>
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded flex items-center gap-1 ${item.mediaType === 'image' || (item.media && item.media.some(m => m.type === 'image')) ? 'bg-fuchsia-500/20 text-fuchsia-400' : item.mediaType === 'audio' || (item.media && item.media.some(m => m.type === 'audio')) ? 'bg-blue-500/20 text-blue-400' : item.mediaType === 'video' || (item.media && item.media.some(m => m.type === 'video')) ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {item.mediaType === 'image' && <ImageIcon size={10} />}
                    {item.mediaType === 'audio' && <Music size={10} />}
                    {item.mediaType === 'video' && <Clapperboard size={10} />}
                    {item.mediaType || (item.media && item.media.length > 0 ? item.media[0].type : 'Text')}
                  </span>
                </div>

                <div className="flex gap-3" onClick={() => onSelect(item)}>
                  {(item.mediaType === 'image' && item.mediaUrl) || (item.media && item.media.some(m => m.type === 'image')) ? (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                      <img src={item.mediaUrl || item.media?.find(m => m.type === 'image')?.url} alt="History" className="w-full h-full object-cover" />
                    </div>
                  ) : (item.mediaType === 'video' && item.mediaUrl) || (item.media && item.media.some(m => m.type === 'video')) ? (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center">
                      <span className="text-xl">🎬</span>
                    </div>
                  ) : null}
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
                    <RefreshCw size={14} />
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

export default React.memo(HistoryDrawer);