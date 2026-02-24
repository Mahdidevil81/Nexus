export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  color: 'green' | 'cyan' | 'yellow' | 'red' | 'white';
}

export interface SocialLink {
  name: string;
  url: string;
  color: string;
  icon: string;
}

export enum SystemStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}

export enum GenerationMode {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  LIVE = 'LIVE'
}

export type Emotion = 'NEUTRAL' | 'SAD' | 'HAPPY' | 'ANGRY' | 'FEAR' | 'SURPRISE' | 'LOVE';

export interface Attachment {
  data: string; // Base64
  mimeType: string;
  name: string;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export type Theme = 'DARK_NEBULA' | 'CYBERPUNK_GLOW' | 'MINIMALIST_TECH';

export interface UserProfile {
  name: string;
  languagePreference: 'auto' | 'fa' | 'en';
  tonePreference: 'poetic' | 'visionary' | 'analytical' | 'casual';
  themePreference: Theme;
  interests: string;
}

export interface ImageOptions {
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  style?: string;
}

export interface AudioOptions {
  voice?: 'male' | 'female';
}

export interface AiResponse {
  id: string;
  prompt?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  imageOptions?: ImageOptions;
  audioOptions?: AudioOptions;
  emotion?: Emotion;
  grounding?: GroundingLink[];
  suggestions?: string[];
  timestamp: number;
}
