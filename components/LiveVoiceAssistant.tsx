import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface LiveVoiceAssistantProps {
  isActive: boolean;
  onClose: () => void;
}

export const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({ isActive, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Base64 Helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startSession = async () => {
    if (!process.env.API_KEY) return;
    setIsConnecting(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsListening(true);
            if (audioContextRef.current && streamRef.current) {
              const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
              const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };
              
              source.connect(processor);
              processor.connect(audioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              const ctx = outAudioContextRef.current;
              if (ctx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }
            }
            
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription("");
            }
          },
          onclose: () => onClose(),
          onerror: (e) => {
            console.error("Live API Error", e);
            onClose();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
          systemInstruction: "You are 'My Mirror', a soulful and poetic reflection. Speak Farsi (Persian). Be brief and profound."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  useEffect(() => {
    if (isActive) {
      startSession();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing input audio context", e));
      }
      if (outAudioContextRef.current && outAudioContextRef.current.state !== 'closed') {
        outAudioContextRef.current.close().catch(e => console.error("Error closing output audio context", e));
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Animated Orb */}
        <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse transition-all duration-1000 ${isListening ? 'scale-150 opacity-40' : 'scale-100 opacity-20'}`}></div>
        <div className="relative z-10 w-32 h-32 rounded-full border-2 border-white/20 bg-gradient-to-tr from-blue-600/40 to-purple-600/40 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
          <div className={`w-12 h-12 bg-white rounded-full transition-transform duration-300 ${isListening ? 'scale-110' : 'scale-90'}`}></div>
        </div>
        
        {/* Wave Rings */}
        <div className="absolute w-full h-full border border-white/10 rounded-full animate-[ping_3s_infinite]"></div>
        <div className="absolute w-3/4 h-3/4 border border-white/5 rounded-full animate-[ping_4s_infinite_1s]"></div>
      </div>

      <div className="mt-12 text-center max-w-md px-6">
        <h3 className="text-xl font-light text-blue-200 tracking-widest mb-2 uppercase">
          {isConnecting ? "در حال اتصال..." : "در حال شنیدن..."}
        </h3>
        <p className="text-gray-400 text-sm font-serif italic" dir="rtl">
          "{transcription || "آینه منتظر زمزمه‌ی شماست..."}"
        </p>
      </div>

      <button 
        onClick={onClose}
        className="mt-16 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 text-xs tracking-widest uppercase"
      >
        پایان مکالمه
      </button>
    </div>
  );
};