import { toast } from 'sonner';

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
  meaning: string; // 中文翻译
  example: string;
  exampleTranslation: string;
  audioUrl?: string; // 发音音频URL
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
    
    // Google Translate 返回格式: [[[翻译结果, 原文], ...], ...]
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
 * 并翻译成中文
 * API 文档: https://dictionaryapi.dev/
 */
export async function lookupWord(word: string): Promise<WordInfo | null> {
  if (!word.trim()) {
    toast.error('请输入单词');
    return null;
  }

  try {
    // 1. 获取词典信息
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
    
    // 提取音标
    const phonetic = entry.phonetic || 
      entry.phonetics?.find(p => p.text)?.text || 
      '';

    // 提取发音音频URL
    const audioUrl = entry.phonetics?.find(p => p.audio)?.audio || '';

    // 提取释义和例句
    let englishDefinition = '';
    let example = '';
    
    // 优先使用名词释义，然后是动词，最后是第一个可用的
    const meanings = entry.meanings || [];
    const nounMeaning = meanings.find(m => m.partOfSpeech === 'noun');
    const verbMeaning = meanings.find(m => m.partOfSpeech === 'verb');
    const firstMeaning = meanings[0];
    
    const selectedMeaning = nounMeaning || verbMeaning || firstMeaning;
    
    if (selectedMeaning && selectedMeaning.definitions.length > 0) {
      const firstDef = selectedMeaning.definitions[0];
      englishDefinition = firstDef.definition;
      example = firstDef.example || '';
      
      // 如果没有找到例句，尝试其他定义
      if (!example) {
        for (const def of selectedMeaning.definitions.slice(1)) {
          if (def.example) {
            example = def.example;
            break;
          }
        }
      }
    }

    // 如果还是没有例句，尝试其他词性
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

    // 2. 将英文释义翻译成中文
    let chineseMeaning = '';
    if (englishDefinition) {
      chineseMeaning = await translateToChinese(englishDefinition);
    }

    // 3. 翻译例句
    let exampleTranslation = '';
    if (example) {
      exampleTranslation = await translateToChinese(example);
    }

    return {
      word: entry.word,
      phonetic,
      meaning: chineseMeaning || englishDefinition, // 如果翻译失败，使用原文
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
 * 批量查询多个单词（用于导入功能）
 */
export async function lookupWords(words: string[]): Promise<Map<string, WordInfo>> {
  const results = new Map<string, WordInfo>();
  
  // 串行查询，避免触发频率限制
  for (const word of words) {
    const info = await lookupWord(word);
    if (info) {
      results.set(word.toLowerCase(), info);
    }
    // 添加小延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return results;
}

/**
 * 检查 API 是否可用
 */
export async function checkDictionaryAPI(): Promise<boolean> {
  try {
    const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/hello');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 播放单词发音
 * 优先使用在线音频，如果不存在则使用 Web Speech API
 */
export function playWordAudio(word: string, audioUrl?: string): void {
  // 如果没有提供 audioUrl 或为空，直接使用 Web Speech API
  if (!audioUrl || audioUrl.trim() === '') {
    playWithSpeechSynthesis(word);
    return;
  }

  const audio = new Audio(audioUrl);
  
  // 处理音频播放
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('Audio playback started');
      })
      .catch((error) => {
        console.log('Audio playback failed, using speech synthesis:', error);
        playWithSpeechSynthesis(word);
      });
  }
}

/**
 * 使用 Web Speech API 播放发音
 */
function playWithSpeechSynthesis(text: string): void {
  if (!('speechSynthesis' in window)) {
    toast.error('您的浏览器不支持语音播放');
    return;
  }

  // 取消之前的朗读
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // 稍微慢一点，更清晰
  utterance.pitch = 1;
  
  // 尝试使用英语语音
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * 预加载语音列表（某些浏览器需要）
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
    // 触发语音加载
    window.speechSynthesis.getVoices();
    
    // 某些浏览器需要监听 voiceschanged 事件
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
    });
  }
}
