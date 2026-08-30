import React, { useEffect, useRef } from 'react';
import { SystemStatus } from '../types';

enum ShapeType {
  CIRCLE,
  TRIANGLE,
  SQUARE,
  HEXAGON
}

enum BehaviorType {
  STABLE,
  VOLATILE
}

interface QuantumBackgroundProps {
  status?: SystemStatus;
  isTyping?: boolean;
}

const QuantumBackground: React.FC<QuantumBackgroundProps> = ({ 
  status = SystemStatus.IDLE, 
  isTyping = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lastMouseRef = useRef({ x: -1000, y: -1000 });
  const mouseVelocityRef = useRef({ x: 0, y: 0 });
  const shockwavesRef = useRef<Shockwave[]>([]);

  class Shockwave {
    x: number;
    y: number;
    radius: number = 0;
    maxRadius: number = 500;
    life: number = 1.0;
    color: string;

    constructor(x: number, y: number, color: string = '100, 200, 255') {
      this.x = x;
      this.y = y;
      this.color = color;
    }

    update() {
      this.radius += 12;
      this.life -= 0.015;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.color}, ${this.life * 0.4})`;
      ctx.lineWidth = 3 * this.life;
      ctx.stroke();
      
      // Secondary ring
      if (this.radius > 50) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 40, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${this.color}, ${this.life * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let sparks: Spark[] = [];
    let motes: QuantumMote[] = [];
    
    const getParams = () => {
      const isMobile = window.innerWidth < 768;
      return {
        particleCount: isMobile ? 60 : 140, // Reduced count for clarity
        moteCount: isMobile ? 20 : 45,
        connectionDistance: isMobile ? 120 : 180, // Reduced distance to prevent "blindness"
        baseSpeed: isMobile ? 0.0001 : 0.00015 
      };
    };

    let { particleCount, moteCount, connectionDistance, baseSpeed } = getParams();

    class QuantumMote {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      color: string;
      opacity: number;
      pulse: number;
      pulseSpeed: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.size = Math.random() * 2 + 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        
        const colors = ['6, 182, 212', '139, 92, 246', '217, 70, 239'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.3 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.01 + Math.random() * 0.02;
      }

      update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulse += this.pulseSpeed;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const currentOpacity = this.opacity * (0.5 + Math.sin(this.pulse) * 0.5);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 4);
        gradient.addColorStop(0, `rgba(${this.color}, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(${this.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${this.color}, ${currentOpacity * 1.5})`;
        ctx.beginPath();
        // Small diamond/square core that rotates
        ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.fill();
        
        ctx.restore();
      }
    }

    class Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * force;
        this.vy = Math.sin(angle) * force;
        this.life = 1.0;
        this.color = color;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // Gravity
        this.life -= 0.02;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.life})`;
        ctx.fill();
      }
    }

    class Particle {
      x: number;
      y: number;
      tx: number; // Target X on the Plane
      ty: number; // Target Y on the Plane
      radius: number; // Still used for internal pulse/size
      speed: number;
      size: number;
      color: string;
      baseColor: string;
      excitation: number = 0;
      shape: ShapeType;
      behavior: BehaviorType;
      rotation: number = 0;
      rotationSpeed: number;
      history: { x: number, y: number }[] = [];
      parallaxFactor: number;
      noiseOffset: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.tx = this.x;
        this.ty = this.y;
        
        this.noiseOffset = Math.random() * 1000;
        this.behavior = Math.random() > 0.95 ? BehaviorType.VOLATILE : BehaviorType.STABLE;
        
        this.speed = (Math.random() * 0.05 + 0.01) * (Math.random() > 0.5 ? 1 : -1);
        this.size = (Math.random() * 1.5 + 0.8);
        this.radius = Math.random() * 2 + 1; // Pulse radius

        const shapeRand = Math.random();
        if (shapeRand > 0.85) this.shape = ShapeType.HEXAGON;
        else if (shapeRand > 0.7) this.shape = ShapeType.SQUARE;
        else if (shapeRand > 0.4) this.shape = ShapeType.TRIANGLE;
        else this.shape = ShapeType.CIRCLE;

        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.parallaxFactor = Math.random() * 0.06 + 0.02;
        
        const rand = Math.random();
        if (rand > 0.75) this.baseColor = '251, 191, 36'; // Amber
        else if (rand > 0.5) this.baseColor = '6, 182, 212'; // Cyan
        else if (rand > 0.25) this.baseColor = '217, 70, 239'; // Fuchsia
        else this.baseColor = '139, 92, 246'; // Violet
        this.color = this.baseColor;
      }

      update(width: number, height: number, status: SystemStatus, isTyping: boolean, index: number) {
        const timestamp = Date.now();
        
        // Save history for trail
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 8) this.history.shift();

        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        
        // React to AI Status
        const statusExcitation = status === SystemStatus.PROCESSING ? 0.7 : 0;
        const typingExcitation = isTyping ? 0.3 : 0;
        
        // Plane Logic: Particles exist on a grid and react to proximity
        const force = distToMouse < 300 ? (300 - distToMouse) / 300 : 0;
        
        if (force > 0) {
          this.excitation = Math.min(1, this.excitation + 0.05 * force);
          // Magnetic interactive nudge
          this.tx += (dx / distToMouse) * force * 5;
          this.ty += (dy / distToMouse) * force * 5;
        } else {
          this.excitation = Math.max(statusExcitation + typingExcitation, this.excitation - 0.01);
        }

        // Drifting movement on the plane
        this.tx += Math.sin(timestamp / 2000 + this.noiseOffset) * 0.2;
        this.ty += Math.cos(timestamp / 2000 + this.noiseOffset) * 0.2;

        // Apply target movement
        this.x += (this.tx - this.x) * 0.05;
        this.y += (this.ty - this.y) * 0.05;

        // Boundary wrap
        if (this.x < -100) { this.x = width + 100; this.tx = this.x; }
        if (this.x > width + 100) { this.x = -100; this.tx = this.x; }
        if (this.y < -100) { this.y = height + 100; this.ty = this.y; }
        if (this.y > height + 100) { this.y = -100; this.ty = this.y; }

        this.rotation += this.rotationSpeed * (1 + this.excitation * 3);
        
        // Pulse
        this.radius = 1 + Math.sin(timestamp / 1000 + this.noiseOffset) * 0.5;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Draw Trail
        if (this.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(this.history[0].x, this.history[0].y);
          for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }
          ctx.strokeStyle = `rgba(${this.color}, ${0.05 + this.excitation * 0.25})`;
          ctx.lineWidth = this.size * 0.4;
          ctx.stroke();
        }

        const glowSize = this.size * (4 + this.excitation * 6);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        gradient.addColorStop(0, `rgba(${this.color}, ${0.4 + this.excitation * 0.5})`);
        gradient.addColorStop(1, `rgba(${this.color}, 0)`);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        const coreSize = this.size * 0.6;
        const opacity = 0.7 + this.excitation * 0.3;
        
        // Darker core with a hint of its base color
        const colorParts = this.color.split(',').map(c => parseInt(c.trim()));
        const darkColor = colorParts.map(c => Math.floor(c * 0.3)).join(', ');
        ctx.fillStyle = `rgba(${darkColor}, ${opacity})`;
        
        // Subtle glow stroke for definition
        ctx.strokeStyle = `rgba(${this.color}, ${opacity * 0.5})`;
        ctx.lineWidth = 0.5;

        switch (this.shape) {
          case ShapeType.CIRCLE:
            ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            break;
          case ShapeType.TRIANGLE:
            ctx.moveTo(0, -coreSize);
            ctx.lineTo(coreSize, coreSize);
            ctx.lineTo(-coreSize, coreSize);
            break;
          case ShapeType.SQUARE:
            ctx.rect(-coreSize/2, -coreSize/2, coreSize, coreSize);
            break;
          case ShapeType.HEXAGON:
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const x = coreSize * Math.cos(angle);
              const y = coreSize * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const params = getParams();
      particleCount = params.particleCount;
      moteCount = params.moteCount;
      connectionDistance = params.connectionDistance;
      baseSpeed = params.baseSpeed;
      init();
    };

    const init = () => {
      particles = [];
      motes = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
      for (let i = 0; i < moteCount; i++) {
        motes.push(new QuantumMote(canvas.width, canvas.height));
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      lastMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      const mdx = mouseRef.current.x - lastMouseRef.current.x;
      const mdy = mouseRef.current.y - lastMouseRef.current.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      
      mouseVelocityRef.current = { x: mdx, y: mdy };
      
      if (mDist > 5 && sparks.length < 80) {
        // Choose color based on position/theme
        const color = mDist > 20 ? '255, 255, 255' : '6, 182, 212';
        sparks.push(new Spark(mouseRef.current.x, mouseRef.current.y, color));
      }
    };

    const onClick = (e: MouseEvent) => {
      shockwavesRef.current.push(new Shockwave(e.clientX, e.clientY));
      if (shockwavesRef.current.length > 5) shockwavesRef.current.shift();
      
      for (let i = 0; i < 15; i++) {
        sparks.push(new Spark(e.clientX, e.clientY, '255, 255, 255'));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decay mouse velocity
      mouseVelocityRef.current.x *= 0.9;
      mouseVelocityRef.current.y *= 0.9;

      const now = Date.now();
      const connDistSq = connectionDistance * connectionDistance;
      const connDistSqHigh = (connectionDistance * 1.8) * (connectionDistance * 1.8);

      // Update Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const sw = shockwavesRef.current[i];
        sw.update();
        if (sw.life <= 0) {
          shockwavesRef.current.splice(i, 1);
        } else {
          sw.draw(ctx);
        }
      }

      for (let i = motes.length - 1; i >= 0; i--) {
        motes[i].update(canvas.width, canvas.height);
        motes[i].draw(ctx);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        sparks[i].update();
        if (sparks[i].life <= 0) {
          sparks.splice(i, 1);
        } else {
          sparks[i].draw(ctx);
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update(canvas.width, canvas.height, status, isTyping, i);
        p1.draw(ctx);

        // Draw Energy Tendrils to mouse
        const dxm = p1.x - mouseRef.current.x;
        const dym = p1.y - mouseRef.current.y;
        const distToMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distToMouse < 150 && Math.random() > 0.92) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `rgba(${p1.color}, ${0.15 * (1 - distToMouse / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
          // Node at connection
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p1.color}, 0.2)`;
          ctx.fill();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          const midX = (p1.x + p2.x) * 0.5;
          const midY = (p1.y + p2.y) * 0.5;
          const mdx = midX - mouseRef.current.x;
          const mdy = midY - mouseRef.current.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          
          const isNearMouse = mDistSq < 50000; // 223 * 223
          const currentConnDistSq = (isNearMouse || status === SystemStatus.PROCESSING) ? connDistSqHigh : connDistSq;

          if (distSq < currentConnDistSq) {
            const distance = Math.sqrt(distSq);
            const currentConnDist = Math.sqrt(currentConnDistSq);
            let opacity = 1 - distance / currentConnDist;
            
            // Randomly skip some connections for a more organic/less dense feel
            const connectionSeed = Math.sin(i * 1.5 + j * 2.1 + now / 2000);
            if (connectionSeed < -0.2 && !isNearMouse && status !== SystemStatus.PROCESSING) continue;

            if (isNearMouse || status === SystemStatus.PROCESSING) {
              const factor = isNearMouse ? (1 - Math.sqrt(mDistSq) / 223) : 0.5;
              opacity *= (1 + factor * 2);
            }

            const pulseSpeed = (isNearMouse || status === SystemStatus.PROCESSING) ? 400 : 800;
            const pulse = Math.sin(now / pulseSpeed + i * 0.4 + j * 0.2) * 0.4 + 0.6;
            const finalOpacity = Math.min(1, opacity * pulse);

            let strokeColor = p1.color;
            if (mDistSq < 40000 || status === SystemStatus.PROCESSING) {
              const mDist = Math.sqrt(mDistSq);
              const mix = status === SystemStatus.PROCESSING ? 0.3 : (1 - mDist / 200);
              const r = Math.floor(255 * mix * 0.6 + parseInt(p1.color.split(',')[0]) * (1 - mix * 0.6));
              const g = Math.floor(255 * mix * 0.9 + parseInt(p1.color.split(',')[1]) * (1 - mix * 0.9));
              const b = Math.floor(255 * mix + parseInt(p1.color.split(',')[2]) * (1 - mix));
              strokeColor = `${r}, ${g}, ${b}`;
            }

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Use more of the particle's color and less white/gray for connections
            ctx.strokeStyle = `rgba(${strokeColor}, ${finalOpacity * 0.12})`; 
            ctx.lineWidth = finalOpacity * (0.4 + (p1.excitation + p2.excitation) * 0.3);
            ctx.stroke();

            // Randomly form small shapes
            if (Math.random() > 0.995 && distSq < currentConnDistSq * 0.6) {
              for (let k = j + 1; k < particles.length; k++) {
                const p3 = particles[k];
                const dx2 = p1.x - p3.x;
                const dy2 = p1.y - p3.y;
                const distSq2 = dx2 * dx2 + dy2 * dy2;
                
                if (distSq2 < currentConnDistSq * 0.6) {
                  const dx3 = p2.x - p3.x;
                  const dy3 = p2.y - p3.y;
                  const distSq3 = dx3 * dx3 + dy3 * dy3;
                  
                  if (distSq3 < currentConnDistSq * 0.6) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(${strokeColor}, ${finalOpacity * 0.08})`;
                    ctx.fill();
                    
                    // Add "energy core" to the triangle
                    if (Math.random() > 0.99) {
                      const tx = (p1.x + p2.x + p3.x) / 3;
                      const ty = (p1.y + p2.y + p3.y) / 3;
                      ctx.beginPath();
                      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
                      ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.5})`;
                      ctx.fill();
                    }
                  }
                }
              }
            }

            // Energy pulses
            if (Math.random() > 0.98 || (status === SystemStatus.PROCESSING && Math.random() > 0.95)) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              // Muted energy pulses
              ctx.strokeStyle = `rgba(${strokeColor}, ${finalOpacity * 0.4})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onClick);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [status, isTyping]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
};

export default QuantumBackground;
