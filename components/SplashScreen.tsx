import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showDaVinci, setShowDaVinci] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | undefined>(undefined);

  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(onComplete, 1500);
  };

  useEffect(() => {
    // Auto-exit after 3 seconds
    const timer = setTimeout(handleExit, 3000);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize quantum particles
    const particleCount = 40;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      color: Math.random() > 0.5 ? '#22d3ee' : '#d946ef'
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '22';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 40000) { // 200 * 200
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.05 * (1 - dist / 200)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'blur(40px)',
            transition: { duration: 1.5, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 pointer-events-none z-10"
          />

          <div className="relative z-20 flex flex-col items-center">
            {/* Nexus Text Only */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                NEXUS
              </h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-6"
              ></motion.div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map(d => (
                <div 
                  key={d} 
                  className="w-1 h-1 rounded-full bg-blue-500/40" 
                  style={{ animation: `neural-pulse 1.5s infinite ease-in-out ${d}s` }}
                ></div>
              ))}
            </div>
            <span className="text-[8px] text-gray-600 uppercase tracking-[0.8em]">Neural Synchronization</span>
          </motion.div>

          <style>{`
            @keyframes scan {
              0% { transform: translateY(0); opacity: 0; }
              50% { opacity: 0.5; }
              100% { transform: translateY(192px); opacity: 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(SplashScreen);
