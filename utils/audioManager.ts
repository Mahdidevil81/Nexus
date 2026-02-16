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
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    setTimeout(() => {
      this.oscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch(e) {} });
      this.oscillators = [];
      this.startNewSignal(emotion);
    }, 500);
  }

  private startNewSignal(emotion: Emotion) {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const createOsc = (freq: number, type: OscillatorType = 'sine', volume: number = 0.05) => {
      // Ensure frequency is strictly LOW (under 400Hz)
      const safeFreq = Math.min(freq, 400);
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(safeFreq, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      gain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 2);
      this.oscillators.push(osc);
      return { osc, gain };
    };

    switch (emotion) {
      case 'HAPPY':
        createOsc(164.81, 'sine', 0.03); // E3
        createOsc(196.00, 'sine', 0.03); // G3
        break;
      case 'LOVE':
        createOsc(174.61, 'sine', 0.04); // F3
        createOsc(220.00, 'sine', 0.02); // A3
        break;
      case 'ANGRY':
        createOsc(55.00, 'triangle', 0.03); // A1
        createOsc(58.27, 'triangle', 0.03); // Bb1
        break;
      case 'SAD':
        createOsc(98.00, 'sine', 0.04); // G2
        createOsc(116.54, 'sine', 0.03); // Bb2
        break;
      case 'FEAR':
        createOsc(73.42, 'sine', 0.04); // D2
        createOsc(77.78, 'sine', 0.04); // Eb2
        break;
      case 'NEUTRAL':
      default:
        createOsc(110.00, 'sine', 0.03); // A2
        break;
    }
    this.masterGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 2);
  }

  public stopSignal() {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 1);
    }
    this.currentEmotion = null;
  }
}

export const audioManager = new AudioManager();