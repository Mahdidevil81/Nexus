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

export type Emotion = 
  | 'NEUTRAL' 
  | 'SAD' 
  | 'HAPPY' 
  | 'ANGRY' 
  | 'FEAR' 
  | 'SURPRISE' 
  | 'LOVE' 
  | 'CURIOSITY' 
  | 'MELANCHOLY' 
  | 'EUPHORIA' 
  | 'ZEN' 
  | 'AWE' 
  | 'SYMPATHY'
  | 'DETERMINATION'
  | 'MYSTERY';

export interface Attachment {
  data: string; // Base64
  mimeType: string;
  name: string;
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export type Theme = 'DARK_NEBULA' | 'CYBERPUNK_GLOW' | 'MINIMALIST_TECH' | 'SOLAR_FLARE' | 'DEEP_SPACE' | 'NEON_GLOW' | 'MINIMALIST' | 'VIOLET_DREAM' | 'ARCTIC_FROST';

export interface UserProfile {
  name: string;
  languagePreference: 'auto' | 'fa' | 'en';
  tonePreference: 'poetic' | 'visionary' | 'analytical' | 'casual';
  themePreference: Theme;
  interests: string;
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  contentFocus: string[];
  responseLength: 'concise' | 'balanced' | 'detailed';
  creativeFreedom: number;
  emotionHistory: { emotion: Emotion; timestamp: number }[];
}

export interface Profile {
  id: string;
  name: string;
  userProfile: UserProfile;
  history: AiResponse[];
  tasks: Task[];
  lastActive: number;
}

export interface ImageOptions {
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  style?: string;
}

export interface AudioOptions {
  audioMode?: 'TTS' | 'MUSIC';
  voice?: 'male' | 'female';
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  emotion?: 'cheerful' | 'sad' | 'angry' | 'serious' | 'calm' | 'pained' | 'surprised';
  musicOptions?: {
    genre?: string;
    mood?: string;
    length?: 'clip' | 'full';
  };
}

export interface MediaItem {
  url: string;
  type: 'image' | 'audio' | 'video';
  prompt?: string;
  options?: any;
}

export interface AiResponse {
  id: string;
  prompt?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  media?: MediaItem[];
  transcription?: string;
  imageOptions?: ImageOptions;
  audioOptions?: AudioOptions;
  emotion?: Emotion;
  grounding?: GroundingLink[];
  suggestions?: string[];
  functionCalls?: { name: string; args: any; id: string }[];
  errorCode?: string;
  rating?: 'positive' | 'negative' | null;
  feedback?: {
    type: 'issue' | 'suggestion' | 'other';
    comment: string;
  };
  timestamp: number;
}

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type KnowledgeCategory = 'PHILOSOPHY' | 'SCIENCE' | 'HISTORY' | 'SESSION_INSIGHT';

export interface KnowledgeNode {
  id: string;
  title: string;
  titleFa: string;
  category: KnowledgeCategory;
  description: string;
  descriptionFa: string;
  historicalFact?: string;
  historicalFactFa?: string;
  connections: string[];
  sourcePrompt?: string;
  reflectionPrompt: string;
  level: number;
  timestamp: number;
  x?: number;
  y?: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  description?: string;
  dueDate?: string;
  subTasks?: Task[];
  dependencies?: string[];
}

