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

export type ImageSize = '1K' | '2K' | '4K';

export interface Attachment {
  data: string; // Base64
  mimeType: string;
  name: string;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface UserProfile {
  name: string;
  languagePreference: 'auto' | 'fa' | 'en';
  tonePreference: 'poetic' | 'visionary' | 'analytical' | 'casual';
  interests: string;
}

export interface AiResponse {
  id: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
  emotion?: Emotion;
  grounding?: GroundingLink[];
  timestamp: number;
}