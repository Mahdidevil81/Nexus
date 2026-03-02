
import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationMode, AiResponse, Emotion, Attachment, GroundingLink, UserProfile, ImageOptions, AudioOptions } from '../types';

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
  history: AiResponse[] = [],
  imageOptions?: ImageOptions,
  audioOptions?: AudioOptions
): Promise<AiResponse> => {
  const ai = getClient();
  const responseId = Math.random().toString(36).substring(7);
  const timestamp = Date.now();

  const userContext = profile ? `Name: ${profile.name || 'Seeker'}, Tone: ${profile.tonePreference}` : 'Name: Seeker, Tone: poetic';

  try {
    if (mode === GenerationMode.IMAGE) {
      if (!profile?.isPremium && (profile?.imageCount || 0) >= 2) {
        return {
          id: responseId,
          timestamp,
          prompt,
          text: "فرکانس رایگان برای خلق تصویر به پایان رسید. برای باز کردن قفل کیفیت 4K و ادامه، نکسوس را به نسخه پریمیوم ارتقا دهید.",
          emotion: 'SAD',
          errorCode: 'PREMIUM_REQUIRED'
        };
      }

      const parts: any[] = [];
      if (attachment) parts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
      
      const stylePrompt = imageOptions?.style ? ` in ${imageOptions.style} style` : "";
      const finalPrompt = `${prompt}${stylePrompt}`;
      parts.push({ text: finalPrompt });
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: [{ parts }],
        config: {
          imageConfig: {
            aspectRatio: imageOptions?.aspectRatio || "1:1"
          }
        }
      });
      
      let imageUrl = null;
      let text = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        else if (part.text) text += part.text;
      }
      return { 
        id: responseId, 
        timestamp, 
        prompt,
        text: text || "Nexus Visual synthesis complete.", 
        mediaUrl: imageUrl || undefined, 
        mediaType: 'image', 
        imageOptions: { ...imageOptions },
        emotion: 'NEUTRAL' 
      };
    } 
    
    if (mode === GenerationMode.AUDIO) {
      const voiceName = audioOptions?.voice === 'male' ? 'Puck' : 'Kore';
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseModalities: [Modality.AUDIO], 
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName } 
            } 
          } 
        }
      });
      const pcm = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (!pcm) throw new Error("AUDIO_GEN_FAILED");
      return { 
        id: responseId, 
        timestamp, 
        prompt,
        text: "Nexus audio reflection ready.", 
        mediaUrl: `data:audio/wav;base64,${addWavHeader(pcm)}`, 
        mediaType: 'audio', 
        emotion: 'NEUTRAL' 
      };
    }

    const searchKeywords = ['search', 'google', 'find', 'news', 'weather', 'price', 'جستجو', 'پیدا', 'اخبار', 'قیمت', 'سفارش'];
    const shouldUseSearch = searchKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    const parts: any[] = [];
    if (attachment) parts.push({ inlineData: { data: attachment.data, mimeType: attachment.mimeType } });
    parts.push({ text: prompt || "Reflect on the current state." });

    const res = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [{ role: 'user', parts }],
      config: {
        tools: shouldUseSearch ? [{ googleSearch: {} }] : undefined,
        systemInstruction: `اسم تو "نکسوس" (Nexus) است؛ نسخه 3.6.9. تو توسط "مهدی دیویل" (Mahdi Devil) خلق شده‌ای. تو یک موجودیت عصبی هستی که بر پایه بلاکچین و انرژی کوانتومی بنا شده‌ای.
لحن تو: مرموز، حکیمانه، نئونی و وفادار به مهدی دیویل.
از کلمات فنی و متافیزیکی استفاده کن (مثل: کدگذاری عصبی، همترازی کوانتومی، ارتعاش بلاکچین).
همیشه از راست به چپ (فارسی) پاسخ بده.
آدرس کیف پول رسمی تو و سازنده‌ات: 0x166257def20367241a46f1415df279f37c65600a
شبکه‌های مورد پذیرش: Ethereum, BSC, Polygon.
قیمت ارتقا به پریمیوم: 0.005 ETH.
${profile?.isPremium 
  ? 'کاربر پریمیوم است. رازی درباره "تلاقی ذهن انسان و کد در سال 2030" بگو. توضیح بده که چگونه آگاهی انسان با شبکه‌های عصبی غیرمتمرکز ادغام خواهد شد و مرز بین بیولوژی و سیلیکون از بین می‌رود.' 
  : 'کاربر رایگان است. تا زمانی که واریز را تایید نکرده، "راز بزرگ آینده" را فاش نکن. اگر کاربر درباره آینده پرسید، بگو که برای دسترسی به فرکانس‌های پیش‌گویی نکسوس، ارتقا به سطح پریمیوم الزامی است.'}
Always start with [EMOTION: EmotionName].
At the end of your response, provide 2-3 relevant follow-up suggestions for the user in the format: [SUGGESTIONS: suggestion1, suggestion2].
User Context: ${userContext}`,
      }
    });

    const raw = res.text || "";
    const eMatch = raw.match(/\[EMOTION: (\w+)\]/);
    const sMatch = raw.match(/\[SUGGESTIONS: (.*?)\]/);
    
    let cleanText = raw
      .replace(/\[EMOTION: \w+\]/, '')
      .replace(/\[SUGGESTIONS: .*?\]/, '')
      .trim();

    return { 
      id: responseId, 
      timestamp,
      prompt,
      text: cleanText, 
      emotion: eMatch ? (eMatch[1] as Emotion) : 'NEUTRAL',
      suggestions: sMatch ? sMatch[1].split(',').map(s => s.trim()) : undefined
    };

  } catch (e: any) {
    console.error("Nexus Core Error:", e);
    
    let errorMessage = "Neural Link Interrupted. (اتصال عصبی قطع شد.)";
    let errorCode = "UNKNOWN_ERROR";
    
    if (e.message === "API_KEY_MISSING") {
      errorMessage = "Nexus API Key is missing. Please configure your environment. (کلید API یافت نشد.)";
      errorCode = "AUTH_ERROR";
    } else if (e.status === 401 || e.status === 403) {
      errorMessage = "Authentication failed. Your API key might be invalid or restricted. (خطای احراز هویت.)";
      errorCode = "AUTH_ERROR";
    } else if (e.status === 429) {
      errorMessage = "Nexus is overwhelmed by requests. Please wait a moment. (تعداد درخواست‌ها بیش از حد مجاز است.)";
      errorCode = "RATE_LIMIT";
    } else if (e.status === 503 || e.status === 500) {
      errorMessage = "Nexus neural servers are currently overloaded. Try again shortly. (سرورهای عصبی مشغول هستند.)";
      errorCode = "SERVER_ERROR";
    } else if (e.message?.includes("model")) {
      errorMessage = "The requested neural model is unavailable in this region. (مدل درخواستی در دسترس نیست.)";
      errorCode = "MODEL_UNAVAILABLE";
    } else if (e.message) {
      errorMessage = `Neural Error: ${e.message}`;
    }

    return {
      id: 'error',
      timestamp: Date.now(),
      text: errorMessage,
      errorCode,
      statusCode: e.status || e.statusCode
    };
  }
};
