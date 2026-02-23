import { Emotion } from '../types';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private currentEmotion: Emotion | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public playSignal(emotion: Emotion) {
    this.init();
    if (this.currentEmotion === emotion) return;
    this.currentEmotion = emotion;
    if (!this.ctx || !this.masterGain) return;

    // Quick crossfade out of existing signal
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    
    setTimeout(() => {
      this.oscillators.forEach(osc => { 
        try { 
          osc.stop(); 
          osc.disconnect(); 
        } catch(e) {} 
      });
      this.oscillators = [];
      this.startNewSignal(emotion);
    }, 150);
  }

  private startNewSignal(emotion: Emotion) {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    
    const createOsc = (freq: number, type: OscillatorType = 'sine', volume: number = 0.05, duration: number = 0.5) => {
      const safeFreq = Math.min(freq, 400);
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(safeFreq, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.05);
      gain.gain.setTargetAtTime(0, now + 0.1, duration / 3); // Natural decay

      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(now);
      osc.stop(now + duration + 0.5);
      
      this.oscillators.push(osc);
      return { osc, gain };
    };

    switch (emotion) {
      case 'HAPPY':
        // A light, rising major third
        createOsc(196.00, 'sine', 0.08, 0.4); // G3
        setTimeout(() => createOsc(246.94, 'sine', 0.08, 0.4), 100); // B3
        break;
      case 'LOVE':
        // A soft, warm swell
        const love = createOsc(174.61, 'sine', 0.06, 1.2); // F3
        love.gain.gain.setTargetAtTime(0.06, now, 0.4);
        break;
      case 'ANGRY':
        // Low, brief rumble
        createOsc(65.41, 'triangle', 0.1, 0.3); // C2
        break;
      case 'SAD':
        // Descending, soft tone
        const sad = createOsc(164.81, 'sine', 0.06, 1.0); // E3
        sad.osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.8); // C3
        break;
      case 'FEAR':
        // Slightly dissonant, low hum
        createOsc(82.41, 'sine', 0.05, 0.8); // E2
        createOsc(87.31, 'sine', 0.05, 0.8); // F2
        break;
      case 'NEUTRAL':
      default:
        // Clean, simple confirmation blip
        createOsc(220.00, 'sine', 0.07, 0.2); // A3
        break;
    }

    this.masterGain.gain.setTargetAtTime(0.2, now, 0.1);
  }

  public stopSignal() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    this.currentEmotion = null;
  }
}

export const audioManager = new AudioManager();