import { toast } from 'sonner';

// 音频缓存 - 避免重复请求
const audioCache = new Map<string, string>();

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: {
    text?: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
}

export interface WordInfo {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  audioUrl?: string;
}

/**
 * 使用 Google Translate 免费API翻译英文到中文
 */
async function translateToChinese(text: string): Promise<string> {
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`
    );
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}

/**
 * 从 Free Dictionary API 获取单词信息
 */
export async function lookupWord(word: string): Promise<WordInfo | null> {
  if (!word.trim()) {
    toast.error('请输入单词');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        toast.error(`未找到单词 "${word}"，请检查拼写`);
      } else {
        toast.error('查询失败，请稍后重试');
      }
      return null;
    }

    const data: DictionaryEntry[] = await response.json();
    
    if (!data || data.length === 0) {
      toast.error('未找到该单词的信息');
      return null;
    }

    const entry = data[0];
    
    const phonetic = entry.phonetic || 
      entry.phonetics?.find(p => p.text)?.text || 
      '';

    const audioUrl = entry.phonetics?.find(p => p.audio)?.audio || '';

    let englishDefinition = '';
    let example = '';
    
    const meanings = entry.meanings || [];
    const nounMeaning = meanings.find(m => m.partOfSpeech === 'noun');
    const verbMeaning = meanings.find(m => m.partOfSpeech === 'verb');
    const firstMeaning = meanings[0];
    
    const selectedMeaning = nounMeaning || verbMeaning || firstMeaning;
    
    if (selectedMeaning && selectedMeaning.definitions.length > 0) {
      const firstDef = selectedMeaning.definitions[0];
      englishDefinition = firstDef.definition;
      example = firstDef.example || '';
      
      if (!example) {
        for (const def of selectedMeaning.definitions.slice(1)) {
          if (def.example) {
            example = def.example;
            break;
          }
        }
      }
    }

    if (!example) {
      for (const m of meanings) {
        for (const def of m.definitions) {
          if (def.example) {
            example = def.example;
            break;
          }
        }
        if (example) break;
      }
    }

    let chineseMeaning = '';
    if (englishDefinition) {
      chineseMeaning = await translateToChinese(englishDefinition);
    }

    let exampleTranslation = '';
    if (example) {
      exampleTranslation = await translateToChinese(example);
    }

    return {
      word: entry.word,
      phonetic,
      meaning: chineseMeaning || englishDefinition,
      example,
      exampleTranslation,
      audioUrl,
    };
  } catch (error) {
    console.error('Dictionary API error:', error);
    toast.error('网络错误，请检查网络连接');
    return null;
  }
}

/**
 * 使用 Google Translate TTS 生成音频 URL
 */
function getGoogleTTSUrl(text: string): string {
  const limitedText = text.slice(0, 100);
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(limitedText)}&tl=en&client=tw-ob`;
}

/**
 * 使用 ResponsiveVoice TTS（备用方案）
 */
function getResponsiveVoiceUrl(text: string): string {
  const limitedText = encodeURIComponent(text.slice(0, 100));
  return `https://code.responsivevoice.org/getvoice.php?t=${limitedText}&tl=en-US&sv=g1&vn=&pitch=0.5&rate=0.5&vol=1`;
}

/**
 * 播放单词发音
 */
export function playWordAudio(word: string, audioUrl?: string): void {
  if (!word) return;

  const ttsUrls = [
    audioUrl,
    audioCache.get(word.toLowerCase()),
    getGoogleTTSUrl(word),
    getResponsiveVoiceUrl(word),
  ].filter(Boolean) as string[];

  if (ttsUrls.length === 0) {
    playWithSpeechSynthesis(word);
    return;
  }

  tryPlayAudio(ttsUrls, 0, word);
}

/**
 * 依次尝试播放音频 URL
 */
function tryPlayAudio(urls: string[], index: number, fallbackText: string): void {
  if (index >= urls.length) {
    playWithSpeechSynthesis(fallbackText);
    return;
  }

  const url = urls[index];
  const audio = new Audio(url);
  
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Audio playback started:', url);
        if (!audioCache.has(fallbackText.toLowerCase())) {
          audioCache.set(fallbackText.toLowerCase(), url);
        }
      })
      .catch((error) => {
        console.log('Audio playback failed:', url, error);
        tryPlayAudio(urls, index + 1, fallbackText);
      });
  } else {
    tryPlayAudio(urls, index + 1, fallbackText);
  }
}

/**
 * 使用 Web Speech API 播放发音（备用方案）
 */
function playWithSpeechSynthesis(text: string): void {
  if (!('speechSynthesis' in window)) {
    toast.error('您的浏览器不支持语音播放');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onerror = () => {
    toast.error('语音播放失败，请检查浏览器设置');
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * 预加载语音列表
 */
export function preloadVoices(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
}

/**
 * 初始化语音列表
 */
export function initVoices(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
    });
  }
}
