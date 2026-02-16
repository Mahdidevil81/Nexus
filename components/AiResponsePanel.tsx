import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AiResponse } from '../types';

interface AiResponsePanelProps {
  response: AiResponse | null;
  isTyping: boolean;
  onVideoExtend?: (response: AiResponse) => void;
}

const useTypewriter = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    if (!text) return;
    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) return text.slice(0, prev.length + 1);
        clearInterval(timer);
        return prev;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
};

const AiResponsePanel: React.FC<AiResponsePanelProps> = ({ response, isTyping, onVideoExtend }) => {
  const content = response?.text || '';
  const typedContent = useTypewriter(content, 40);
  const isAnimationComplete = typedContent.length === content.length;
  const [loadingMsg, setLoadingMsg] = useState("در حال پردازش نکسوس...");

  useEffect(() => {
    if (isTyping && !content) {
      const msgs = ["همگام‌سازی عصبی...", "اتصال به شبکه نکسوس...", "بازخوانی داده‌های مهدی دیویل...", "بافت حقیقت..."];
      const interval = setInterval(() => {
        setLoadingMsg(msgs[Math.floor(Math.random() * msgs.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isTyping, content]);

  if (!content && !isTyping) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 mb-8 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          <span className="text-4xl text-blue-400 animate-pulse">NX</span>
        </div>
        <h2 className="text-3xl font-thin text-white mb-2 tracking-[0.2em]">NEXUS ASSISTANT</h2>
        <p className="text-gray-500 text-sm font-light">طراحی شده توسط مهدی دیویل برای شکوفایی پتانسیل‌های انسانی</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8">
      <div className="p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
        {isTyping && !content && (
          <div className="flex flex-col items-center gap-4 py-8 animate-pulse text-blue-400">
            <div className="flex gap-1">
              {[0, 0.1, 0.2].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-current" style={{ animationDelay: `${d}s` }}></div>)}
            </div>
            <span className="text-[10px] uppercase tracking-widest">{loadingMsg}</span>
          </div>
        )}

        {content && (
          <div className="space-y-6">
            <div className="prose prose-invert prose-p:leading-8 prose-p:text-gray-200 prose-p:font-light" dir="auto">
              <ReactMarkdown>{typedContent}</ReactMarkdown>
            </div>

            {response?.grounding && response.grounding.length > 0 && isAnimationComplete && (
              <div className="pt-4 border-t border-white/5 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">منابع شبکه:</span>
                <div className="flex flex-wrap gap-2">
                  {response.grounding.map((g, i) => (
                    <a key={i} href={g.uri} target="_blank" className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20 transition-all truncate max-w-[150px]">
                      🔗 {g.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {response?.mediaUrl && isAnimationComplete && (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4 duration-700">
                  {response.mediaType === 'image' && <img src={response.mediaUrl} className="w-full" alt="Reflected" />}
                  {response.mediaType === 'video' && <video controls autoPlay loop className="w-full"><source src={response.mediaUrl} /></video>}
                  {response.mediaType === 'audio' && <audio controls className="w-full mt-2"><source src={response.mediaUrl} /></audio>}
                </div>
                {response.mediaType === 'video' && response.rawVideoData && onVideoExtend && (
                  <button 
                    onClick={() => onVideoExtend(response)}
                    className="w-full py-3 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-300 text-xs tracking-widest uppercase hover:bg-blue-600/40 transition-all"
                  >
                    + ویرایش و تمدید ۷ ثانیه ویدیو
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiResponsePanel;