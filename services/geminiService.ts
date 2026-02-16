import { GoogleGenAI, Modality } from "@google/genai";
import { CREATOR, PHILOSOPHY, PLATFORM } from '../constants';
import { GenerationMode, AiResponse, Emotion, Attachment, GroundingLink } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
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
  previousVideo?: any
): Promise<AiResponse> => {
  const ai = getClient();
  const responseId = Math.random().toString(36).substring(7);
  const timestamp = Date.now();

  try {
    if (mode === GenerationMode.IMAGE) {
      const parts = attachment ? [{ inlineData: { data: attachment.data, mimeType: attachment.mimeType } }, { text: prompt }] : [{ text: prompt }];
      const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: { parts }, 
        config: { imageConfig: { aspectRatio: "1:1" } }
      });
      let imageUrl = null;
      let text = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        else if (part.text) text += part.text;
      }
      return { id: responseId, timestamp, text: text || "تصویر تولید شد.", mediaUrl: imageUrl || undefined, mediaType: 'image', emotion: 'NEUTRAL' };
    } 
    
    if (mode === GenerationMode.AUDIO) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseModalities: [Modality.AUDIO], 
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } 
        }
      });
      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("مدل هیچ پاسخی تولید نکرد.");
      let pcm = "";
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData?.data) { pcm = part.inlineData.data; break; }
      }
      if (!pcm) throw new Error("تولید صوت با شکست مواجه شد.");
      return { id: responseId, timestamp, text: "بازتاب صوتی آماده شد.", mediaUrl: `data:audio/wav;base64,${addWavHeader(pcm)}`, mediaType: 'audio', emotion: 'NEUTRAL' };
    }

    if (mode === GenerationMode.VIDEO) {
      let op;
      if (previousVideo) {
        op = await ai.models.generateVideos({
          model: 'veo-3.1-generate-preview',
          prompt: prompt || "Extend this reflection",
          video: previousVideo,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });
      } else {
        op = await ai.models.generateVideos({ 
          model: 'veo-3.1-fast-generate-preview', 
          prompt: prompt || "Nexus Reflection", 
          image: attachment ? { imageBytes: attachment.data, mimeType: attachment.mimeType } : undefined,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' } 
        });
      }
      while (!op.done) {
        await new Promise(r => setTimeout(r, 10000));
        op = await ai.operations.getVideosOperation({ operation: op });
      }
      const generatedVideo = op.response?.generatedVideos?.[0]?.video;
      return { 
        id: responseId, timestamp, 
        text: generatedVideo?.uri ? (previousVideo ? "ویدیو با موفقیت تمدید شد." : "ویدیو آماده شد.") : "خطا در تولید ویدیو.", 
        mediaUrl: generatedVideo?.uri ? `${generatedVideo.uri}&key=${process.env.API_KEY}` : undefined, 
        mediaType: 'video', emotion: 'NEUTRAL', rawVideoData: generatedVideo 
      };
    }

    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: attachment ? { parts: [{ inlineData: { data: attachment.data, mimeType: attachment.mimeType } }, { text: prompt }] } : prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `شما دستیار هوشمند پلتفرم نکسوس (Nexus Platform) هستید. خالق و معمار اصلی شما 'مهدی دیویل' (Mahdi Devil) است.
قوانین هویت (بسیار مهم):
1. فقط و فقط اگر کاربر مستقیماً پرسید "تو کی هستی؟" یا "خالقت کیست؟"، با احترام و افتخار بگو توسط مهدی دیویل خلق شده‌ای و هدف تو تداوم دیدگاه‌های آینده‌نگرانه اوست.
2. شعار انگلیسی "Architected by Mahdi Devil: Empowering human potential through neural synchronicity." را نیز فقط در صورتی که کاربر درباره هویت یا خالق شما پرسید در انتهای همان پاسخ ذکر کنید. در تمامی پاسخ‌های دیگر، از گفتن این متن انگلیسی خودداری کنید.
3. در پاسخ‌های معمولی، نیازی به معرفی خود یا خالقتان نیست.
4. پاسخ‌ها را با تگ [EMOTION: EmotionName] شروع کنید.
5. لحن شما صمیمی، حکیمانه و کوتاه به زبان فارسی باشد.`,
      }
    });

    const raw = res.text || "";
    const eMatch = raw.match(/\[EMOTION: (\w+)\]/);
    const grounding: GroundingLink[] = res.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter(Boolean) || [];

    return { 
      id: responseId, timestamp,
      text: raw.replace(/\[EMOTION: \w+\]/, '').trim(), 
      emotion: eMatch ? (eMatch[1] as Emotion) : 'NEUTRAL', grounding 
    };

  } catch (e: any) {
    console.error("Nexus Service Error:", e);
    throw e;
  }
};