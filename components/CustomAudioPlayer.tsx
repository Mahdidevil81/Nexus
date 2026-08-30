
import React, { useState, useEffect, useRef } from 'react';

const CustomAudioPlayer: React.FC<{ url: string }> = ({ url }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [isBeat, setIsBeat] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  const spectrogramDataRef = useRef<Uint8Array[]>([]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.85;
      
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let bassSum = 0;
      for (let i = 0; i < 4; i++) bassSum += dataArray[i];
      const bassAvg = bassSum / 4;
      
      let midSum = 0;
      for (let i = 10; i < 20; i++) midSum += dataArray[i];
      const midAvg = midSum / 10;

      const intensity = Math.max(0, (bassAvg - 140) / 115);
      const snareIntensity = Math.max(0, (midAvg - 120) / 135);
      
      setIsBeat(bassAvg > 165);
      setBeatIntensity(intensity);

      if (intensity > 0.8) {
        ctx.translate((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3);
      }

      spectrogramDataRef.current.unshift(new Uint8Array(dataArray));
      if (spectrogramDataRef.current.length > 80) spectrogramDataRef.current.pop();

      const specWidth = canvas.width / 80;
      ctx.globalCompositeOperation = 'screen';
      spectrogramDataRef.current.forEach((data, index) => {
        const x = canvas.width - (index * specWidth);
        const alpha = (1 - index / 80) * 0.4;
        
        for (let j = 0; j < data.length; j += 2) {
          const val = data[j];
          if (val > 40) {
            const y = canvas.height - (j * (canvas.height / data.length));
            const h = (canvas.height / data.length) * 2;
            const hue = 180 + (j / data.length) * 120 + (intensity * 60);
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha * (val / 255)})`;
            ctx.fillRect(x, y, specWidth, h);
          }
        }
      });
      ctx.globalCompositeOperation = 'source-over';

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      const hueShift = intensity * 100;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, `hsla(${180 + hueShift}, 100%, 50%, 1)`);
      gradient.addColorStop(0.5, `hsla(${220 + hueShift}, 100%, 50%, 1)`);
      gradient.addColorStop(1, `hsla(${280 + hueShift}, 100%, 50%, 1)`);

      for (let i = 0; i < bufferLength; i++) {
        const bounce = (i < 10) ? intensity * 30 : snareIntensity * 15;
        const barHeight = ((dataArray[i] / 255) * canvas.height * 0.7) + bounce;
        
        ctx.fillStyle = gradient;
        if (intensity > 0.6) {
          ctx.shadowBlur = intensity * 25;
          ctx.shadowColor = `hsla(${180 + hueShift}, 100%, 50%, 0.8)`;
        }
        
        const centerX = canvas.width / 2;
        const roundedHeight = Math.max(2, barHeight);
        
        ctx.beginPath();
        ctx.roundRect(centerX + x, canvas.height - roundedHeight, barWidth, roundedHeight, 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.roundRect(centerX - x - barWidth, canvas.height - roundedHeight, barWidth, roundedHeight, 2);
        ctx.fill();

        x += barWidth + 2;
      }
      ctx.shadowBlur = 0;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const coreRadius = 20 + ( intensity * 30 ) + ( snareIntensity * 15 );
      
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2.5);
      glowGrad.addColorStop(0, `hsla(${180 + hueShift}, 100%, 50%, ${0.2 + intensity * 0.4})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(centerX - coreRadius * 2.5, centerY - coreRadius * 2.5, coreRadius * 5, coreRadius * 5);

      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      coreGrad.addColorStop(0, '#fff');
      coreGrad.addColorStop(0.3, `hsla(${180 + hueShift}, 100%, 50%, 1)`);
      coreGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      if (intensity > 0.4) {
        ctx.strokeStyle = `hsla(${280 + hueShift}, 100%, 50%, ${intensity - 0.2})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, coreRadius + 15, (coreRadius + 15) * 0.4, Date.now() / 500, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };
    
    draw();
  };

  const togglePlay = () => {
    if (audioRef.current) {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      if (isPlaying) {
        audioRef.current.pause();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play();
        drawWaveform();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const onEnded = () => {
    setIsPlaying(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  return (
    <div className={`w-full bg-white/5 backdrop-blur-[40px] border transition-all duration-300 ${isBeat ? 'border-blue-500/50 scale-[1.01] shadow-[0_0_50px_rgba(59,130,246,0.2)]' : 'border-white/10 shadow-2xl'} rounded-[2rem] p-6 mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700`}>
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={onTimeUpdate} 
        onLoadedMetadata={onLoadedMetadata} 
        onEnded={onEnded}
      />
      
      <div className="h-16 w-full relative overflow-hidden rounded-xl bg-black/20 border border-white/5">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={64} 
          className="w-full h-full opacity-60"
        />
        {!isPlaying && progress === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] uppercase tracking-[0.3em] text-gray-600">Neural Frequency Standby</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 active:scale-90 transition-all"
          aria-label={isPlaying ? "Pause Neural Wave" : "Play Neural Wave"}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-6 h-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-grow flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-blue-400 uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span>Neural Wave synthesis</span>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-0.5 border border-white/5">
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button 
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`hover:text-white transition-colors ${playbackRate === speed ? 'text-white font-bold' : 'text-gray-500'}`}
                    aria-label={`Set playback speed to ${speed}x`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <span>{duration > 0 ? `${Math.floor(duration)}s` : '--'} Reflection</span>
          </div>
          
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomAudioPlayer);
