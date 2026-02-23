
import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationMode, AiResponse, Emotion, Attachment, GroundingLink, UserProfile } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

const addWavHeader = (base64Pcm: string): string => {
  const pcmData = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
  const numChannels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (v: DataView, o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  const wavBuffer = new Uint8Array(header.byteLength + pcmData.byteLength);
  wavBuffer.set(new Uint8Array(header), 0);
  wavBuffer.set(pcmData, header.byteLength);
  let binary = '';
  for (let i = 0; i < wavBuffer.byteLength; i++) binary += String.fromCharCode(wavBuffer[i]);
  return btoa(binary);
};

export const generateResponse = async (
  prompt: string, 
  mode: GenerationMode, 
  attachment?: Attachment,
  profile?: UserProfile,
  history: AiResponse[] = []
): Promise<AiResponse> => {
  const ai = getClient();
  const responseId = Math.random().toString(36).substring(7);
  const timestamp = Date.now();

  const userContext = profile ? `[PROFILE: ${profile.name || 'Seeker'}, TONE: ${profile.tonePreference}]` : '';

  try {
    if (mode === GenerationMode.IMAGE) {
      const parts: any[] = [];
      if (attachment) parts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
      if (prompt) parts.push({ text: prompt });
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: [{ parts }]
      });
      
      let imageUrl = null;
      let text = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        else if (part.text) text += part.text;
      }
      return { id: responseId, timestamp, text: text || "Nexus Visual synthesis complete.", mediaUrl: imageUrl || undefined, mediaType: 'image', emotion: 'NEUTRAL' };
    } 
    
    if (mode === GenerationMode.AUDIO) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseModalities: [Modality.AUDIO], 
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Kore' } 
            } 
          } 
        }
      });
      const pcm = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (!pcm) throw new Error("AUDIO_GEN_FAILED");
      return { id: responseId, timestamp, text: "Nexus audio reflection ready.", mediaUrl: `data:audio/wav;base64,${addWavHeader(pcm)}`, mediaType: 'audio', emotion: 'NEUTRAL' };
    }

    const searchKeywords = ['search', 'google', 'find', 'news', 'weather', 'price', 'جستجو', 'پیدا', 'اخبار', 'قیمت', 'سفارش'];
    const shouldUseSearch = searchKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    const parts: any[] = [];
    if (attachment) parts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
    parts.push({ text: prompt || "Reflect on the current state." });

    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts }],
      config: {
        tools: shouldUseSearch ? [{ googleSearch: {} }] : undefined,
        systemInstruction: `You are 'Nexus', architected by Mahdi Devil. Wise, poetic, and direct. 
Always start with [EMOTION: EmotionName].
User Context: ${userContext}`,
      }
    });

    const raw = res.text || "";
    const eMatch = raw.match(/\[EMOTION: (\w+)\]/);
    return { 
      id: responseId, timestamp,
      text: raw.replace(/\[EMOTION: \w+\]/, '').trim(), 
      emotion: eMatch ? (eMatch[1] as Emotion) : 'NEUTRAL'
    };

  } catch (e: any) {
    console.error("Nexus Core Error:", e);
    throw e;
  }
};
