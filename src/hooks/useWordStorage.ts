import { useState, useEffect, useCallback } from 'react';
import type { Word, LearningProgress, StudySession, Achievement, DailyGoal, ExportData } from '@/types';
import { sampleWords } from '@/data/sampleWords';

const WORDS_KEY = 'wordmaster_words_v2'; // v2 版本，SRS 更新
const PROGRESS_KEY = 'wordmaster_progress_v2';
const SESSIONS_KEY = 'wordmaster_sessions_v2';
const ACHIEVEMENTS_KEY = 'wordmaster_achievements_v2';
const DAILY_GOAL_KEY = 'wordmaster_daily_goal_v2';
const HAS_IMPORTED_SAMPLE_KEY = 'wordmaster_has_imported_sample';

// 艾宾浩斯间隔重复算法 - 间隔天数（乘以 easeFactor）
const SRS_INTERVALS = [1, 2, 4, 7, 15, 30, 90, 180, 365];

// 默认成就列表
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: '单词新手', description: '添加第1个单词', icon: '🌱', condition: { type: 'words_added', value: 1 } },
  { id: '2', title: '词汇积累者', description: '添加10个单词', icon: '📚', condition: { type: 'words_added', value: 10 } },
  { id: '3', title: '单词达人', description: '添加50个单词', icon: '🏆', condition: { type: 'words_added', value: 50 } },
  { id: '4', title: '词汇大师', description: '添加100个单词', icon: '👑', condition: { type: 'words_added', value: 100 } },
  { id: '5', title: '初窥门径', description: '掌握5个单词', icon: '⭐', condition: { type: 'words_mastered', value: 5 } },
  { id: '6', title: '渐入佳境', description: '掌握25个单词', icon: '🌟', condition: { type: 'words_mastered', value: 25 } },
  { id: '7', title: '融会贯通', description: '掌握100个单词', icon: '💫', condition: { type: 'words_mastered', value: 100 } },
  { id: '8', title: '坚持3天', description: '连续学习3天', icon: '🔥', condition: { type: 'streak_days', value: 3 } },
  { id: '9', title: '坚持7天', description: '连续学习7天', icon: '🔥🔥', condition: { type: 'streak_days', value: 7 } },
  { id: '10', title: '坚持30天', description: '连续学习30天', icon: '🔥🔥🔥', condition: { type: 'streak_days', value: 30 } },
];

// 获取今天的日期字符串
const getTodayString = () => new Date().toISOString().split('T')[0];

// 迁移旧数据到新格式（添加 SRS 字段）
function migrateWord(oldWord: Partial<Word>): Word {
  const now = Date.now();
  return {
    id: oldWord.id || crypto.randomUUID(),
    word: oldWord.word || '',
    phonetic: oldWord.phonetic,
    meaning: oldWord.meaning || '',
    example: oldWord.example,
    exampleTranslation: oldWord.exampleTranslation,
    audioUrl: oldWord.audioUrl, // 添加 audioUrl 支持
    tags: oldWord.tags || [],
    difficulty: oldWord.difficulty || 'medium',
    createdAt: oldWord.createdAt || now,
    lastReviewed: oldWord.lastReviewed,
    reviewCount: oldWord.reviewCount || 0,
    correctCount: oldWord.correctCount || 0,
    masteryLevel: oldWord.masteryLevel || 0,
    // SRS 新字段
    nextReviewDate: oldWord.nextReviewDate || now,
    reviewStage: oldWord.reviewStage ?? 0,
    easeFactor: oldWord.easeFactor ?? 2.5,
    isNew: oldWord.isNew ?? (oldWord.reviewCount === 0),
  };
}

export function useWordStorage() {
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<LearningProgress>({
    totalWords: 0,
    masteredWords: 0,
    learningWords: 0,
    todayLearned: 0,
    todayGoal: 10,
    streakDays: 0,
    lastStudyDate: '',
    totalStudyTime: 0,
  });
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>({
    date: getTodayString(),
    targetWords: 10,
    completedWords: 0,
    isCompleted: false,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    const loadedWords = localStorage.getItem(WORDS_KEY);
    const loadedProgress = localStorage.getItem(PROGRESS_KEY);
    const loadedSessions = localStorage.getItem(SESSIONS_KEY);
    const loadedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
    const loadedDailyGoal = localStorage.getItem(DAILY_GOAL_KEY);

    if (loadedWords) {
      const parsed = JSON.parse(loadedWords);
      // 迁移旧数据格式
      const migrated = Array.isArray(parsed) ? parsed.map(migrateWord) : [];
      setWords(migrated);
    }
    if (loadedProgress) setProgress(JSON.parse(loadedProgress));
    if (loadedSessions) setSessions(JSON.parse(loadedSessions));
    if (loadedAchievements) setAchievements(JSON.parse(loadedAchievements));
    if (loadedDailyGoal) {
      const parsed = JSON.parse(loadedDailyGoal);
      // 检查是否是今天的目标
      if (parsed.date === getTodayString()) {
        setDailyGoal(parsed);
      } else {
        // 新的一天，重置每日目标
        const newGoal: DailyGoal = {
          date: getTodayString(),
          targetWords: parsed.targetWords || 10,
          completedWords: 0,
          isCompleted: false,
        };
        setDailyGoal(newGoal);
        localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(newGoal));
      }
    }
    setIsLoaded(true);
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(WORDS_KEY, JSON.stringify(words));
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(dailyGoal));
    }
  }, [words, progress, sessions, achievements, dailyGoal, isLoaded]);

  // ==================== SRS 算法 ====================

  /**
   * 计算下次复习时间（SRS 核心算法）
   * @param word 单词
   * @param isCorrect 是否回答正确
   * @param quality 回答质量 1-5（1=完全不会，5=完美掌握）
   */
  const calculateNextReview = useCallback((word: Word, isCorrect: boolean, quality: number = 3): Word => {
    const now = Date.now();
    let newStage = word.reviewStage;
    let newEaseFactor = word.easeFactor;
    let newIsNew = false;

    if (!isCorrect || quality < 3) {
      // 回答错误或困难，退回阶段 1
      newStage = 1;
      // 降低难度系数
      newEaseFactor = Math.max(1.3, word.easeFactor - 0.2);
    } else {
      // 回答正确，进入下一阶段
      newStage = Math.min(SRS_INTERVALS.length, word.reviewStage + 1);
      // 提高难度系数（缓慢）
      newEaseFactor = Math.min(3.0, word.easeFactor + 0.05);
      newIsNew = false;
    }

    // 计算下次复习间隔（天数 * 难度系数）
    const baseInterval = SRS_INTERVALS[Math.min(newStage, SRS_INTERVALS.length - 1)];
    const actualInterval = Math.round(baseInterval * newEaseFactor);
    const nextReviewDate = now + (actualInterval * 24 * 60 * 60 * 1000);

    return {
      ...word,
      nextReviewDate,
      reviewStage: newStage,
      easeFactor: newEaseFactor,
      isNew: newIsNew,
      lastReviewed: now,
    };
  }, []);

  // ==================== CRUD 操作 ====================

  // 添加单词
  const addWord = useCallback((wordData: Omit<Word, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'masteryLevel' | 'nextReviewDate' | 'reviewStage' | 'easeFactor' | 'isNew'>) => {
    const now = Date.now();
    const newWord: Word = {
      ...wordData,
      id: crypto.randomUUID(),
      createdAt: now,
      reviewCount: 0,
      correctCount: 0,
      masteryLevel: 0,
      // SRS 初始值
      nextReviewDate: now, // 新词立即可以学习
      reviewStage: 0,
      easeFactor: 2.5,
      isNew: true,
    };
    setWords(prev => [newWord, ...prev]);
    setProgress(prev => ({
      ...prev,
      totalWords: prev.totalWords + 1,
      learningWords: prev.learningWords + 1,
    }));
    checkAchievements('words_added', words.length + 1);
    return newWord;
  }, [words.length]);

  // 批量添加单词
  const addWords = useCallback((wordDataList: Omit<Word, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'masteryLevel' | 'nextReviewDate' | 'reviewStage' | 'easeFactor' | 'isNew'>[]) => {
    const now = Date.now();
    const newWords: Word[] = wordDataList.map(data => ({
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      reviewCount: 0,
      correctCount: 0,
      masteryLevel: 0,
      nextReviewDate: now,
      reviewStage: 0,
      easeFactor: 2.5,
      isNew: true,
    }));
    
    setWords(prev => [...newWords, ...prev]);
    setProgress(prev => ({
      ...prev,
      totalWords: prev.totalWords + newWords.length,
      learningWords: prev.learningWords + newWords.length,
    }));
    checkAchievements('words_added', words.length + newWords.length);
    return newWords;
  }, [words.length]);

  // 更新单词
  const updateWord = useCallback((id: string, updates: Partial<Word>) => {
    setWords(prev => prev.map(word => 
      word.id === id ? { ...word, ...updates } : word
    ));
  }, []);

  // 删除单词
  const deleteWord = useCallback((id: string) => {
    setWords(prev => prev.filter(word => word.id !== id));
    setProgress(prev => ({
      ...prev,
      totalWords: prev.totalWords - 1,
    }));
  }, []);

  // 清空所有数据
  const clearAllData = useCallback(() => {
    setWords([]);
    setSessions([]);
    setProgress({
      totalWords: 0,
      masteredWords: 0,
      learningWords: 0,
      todayLearned: 0,
      todayGoal: 10,
      streakDays: 0,
      lastStudyDate: '',
      totalStudyTime: 0,
    });
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setDailyGoal({
      date: getTodayString(),
      targetWords: 10,
      completedWords: 0,
      isCompleted: false,
    });
    localStorage.removeItem(HAS_IMPORTED_SAMPLE_KEY);
  }, []);

  // ==================== 学习会话 ====================

  // 记录学习会话
  const recordSession = useCallback((session: Omit<StudySession, 'id' | 'date'>) => {
    const newSession: StudySession = {
      ...session,
      id: crypto.randomUUID(),
      date: getTodayString(),
    };
    setSessions(prev => [...prev, newSession]);
    
    // 更新进度
    const today = getTodayString();
    setProgress(prev => {
      const isNewDay = prev.lastStudyDate !== today;
      let newStreak = prev.streakDays;
      
      if (isNewDay) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (prev.lastStudyDate === yesterdayStr) {
          newStreak = prev.streakDays + 1;
        } else {
          newStreak = 1;
        }
        checkAchievements('streak_days', newStreak);
      }

      return {
        ...prev,
        todayLearned: isNewDay ? session.wordsStudied.length : prev.todayLearned + session.wordsStudied.length,
        lastStudyDate: today,
        streakDays: newStreak,
        totalStudyTime: prev.totalStudyTime + session.duration,
      };
    });

    // 更新每日目标
    setDailyGoal(prev => {
      const newCompleted = prev.completedWords + session.wordsStudied.length;
      return {
        ...prev,
        completedWords: newCompleted,
        isCompleted: newCompleted >= prev.targetWords,
      };
    });

    checkAchievements('study_sessions', sessions.length + 1);
  }, [sessions.length]);

  // 更新单词掌握程度（SRS 版本）
  const updateWordMastery = useCallback((wordId: string, isCorrect: boolean, quality: number = 3) => {
    setWords(prev => prev.map(word => {
      if (word.id !== wordId) return word;
      
      const newReviewCount = word.reviewCount + 1;
      const newCorrectCount = word.correctCount + (isCorrect ? 1 : 0);
      const newMasteryLevel = Math.min(100, Math.round((newCorrectCount / newReviewCount) * 100));
      
      // 应用 SRS 算法
      const srsWord = calculateNextReview(word, isCorrect, quality);
      
      return {
        ...srsWord,
        reviewCount: newReviewCount,
        correctCount: newCorrectCount,
        masteryLevel: newMasteryLevel,
      };
    }));

    // 检查掌握的单词数量（stage >= 6 或 mastery >= 80）
    if (isCorrect) {
      const masteredCount = words.filter(w => 
        w.reviewStage >= 6 || w.masteryLevel >= 80
      ).length;
      checkAchievements('words_mastered', masteredCount);
    }
  }, [words, calculateNextReview]);

  // ==================== 查询方法 ====================

  // 获取今天需要复习的单词（SRS 核心）
  const getWordsToReview = useCallback((count: number = 20) => {
    const now = Date.now();
    return words
      .filter(w => w.nextReviewDate <= now) // 到期的单词
      .sort((a, b) => {
        // 优先复习：新词 > 复习阶段低的 > 到期时间早的
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        if (a.reviewStage !== b.reviewStage) return a.reviewStage - b.reviewStage;
        return a.nextReviewDate - b.nextReviewDate;
      })
      .slice(0, count);
  }, [words]);

  // 获取今天复习任务统计
  const getTodayReviewStats = useCallback(() => {
    const now = Date.now();
    const dueWords = words.filter(w => w.nextReviewDate <= now);
    const newWords = dueWords.filter(w => w.isNew);
    const reviewWords = dueWords.filter(w => !w.isNew);
    
    return {
      total: dueWords.length,
      newWords: newWords.length,
      reviewWords: reviewWords.length,
    };
  }, [words]);

  // 获取已掌握的单词（reviewStage >= 6）
  const getMasteredWords = useCallback(() => {
    return words.filter(w => w.reviewStage >= 6 || w.masteryLevel >= 80);
  }, [words]);

  // 获取学习中的单词
  const getLearningWords = useCallback(() => {
    return words.filter(w => w.reviewStage < 6 && w.reviewStage > 0);
  }, [words]);

  // ==================== 成就系统 ====================

  // 检查成就
  const checkAchievements = useCallback((type: Achievement['condition']['type'], value: number) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.unlockedAt) return achievement;
      if (achievement.condition.type === type && value >= achievement.condition.value) {
        return { ...achievement, unlockedAt: Date.now() };
      }
      return achievement;
    }));
  }, []);

  // ==================== 每日目标 ====================

  // 设置每日目标
  const setDailyTarget = useCallback((target: number) => {
    setDailyGoal(prev => ({
      ...prev,
      targetWords: target,
    }));
  }, []);

  // ==================== 数据导入导出 ====================

  // 导出所有数据
  const exportData = useCallback((): ExportData => {
    return {
      version: '2.0',
      exportDate: new Date().toISOString(),
      words,
      progress,
      sessions,
      achievements,
      dailyGoal,
    };
  }, [words, progress, sessions, achievements, dailyGoal]);

  // 导出为 JSON 文件
  const exportToJSON = useCallback(() => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordmaster-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportData]);

  // 导出为 CSV（仅单词）
  const exportToCSV = useCallback(() => {
    const headers = ['word', 'meaning', 'phonetic', 'example', 'exampleTranslation', 'tags', 'difficulty'];
    const rows = words.map(w => [
      w.word,
      w.meaning,
      w.phonetic || '',
      w.example || '',
      w.exampleTranslation || '',
      w.tags.join(';'),
      w.difficulty,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordmaster-words-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [words]);

  // 导入数据
  const importData = useCallback((data: ExportData): boolean => {
    try {
      if (data.words && Array.isArray(data.words)) {
        // 迁移导入的单词数据格式
        const migratedWords = data.words.map(migrateWord);
        setWords(prev => [...migratedWords, ...prev]);
      }
      if (data.progress) {
        setProgress(prev => ({ ...prev, ...data.progress }));
      }
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(prev => [...data.sessions, ...prev]);
      }
      if (data.achievements && Array.isArray(data.achievements)) {
        // 合并成就，保留已解锁的
        setAchievements(prev => prev.map(ach => {
          const imported = data.achievements.find(a => a.id === ach.id);
          if (imported?.unlockedAt && !ach.unlockedAt) {
            return imported;
          }
          return ach;
        }));
      }
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }, []);

  // 从 JSON 文件导入
  const importFromJSON = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      return importData(data);
    } catch (error) {
      console.error('Import from JSON error:', error);
      return false;
    }
  }, [importData]);

  // 从 CSV 导入
  const importFromCSV = useCallback(async (file: File): Promise<number> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      // 跳过标题行
      const dataLines = lines[0].toLowerCase().includes('word') ? lines.slice(1) : lines;
      
      const importedWords: Omit<Word, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'masteryLevel' | 'nextReviewDate' | 'reviewStage' | 'easeFactor' | 'isNew'>[] = [];
      
      for (const line of dataLines) {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2 && parts[0]) {
          importedWords.push({
            word: parts[0],
            meaning: parts[1] || '',
            phonetic: parts[2] || '',
            example: parts[3] || '',
            exampleTranslation: parts[4] || '',
            tags: parts[5] ? parts[5].split(';').filter(Boolean) : [],
            difficulty: (parts[6] as 'easy' | 'medium' | 'hard') || 'medium',
          });
        }
      }
      
      if (importedWords.length > 0) {
        addWords(importedWords);
      }
      
      return importedWords.length;
    } catch (error) {
      console.error('Import from CSV error:', error);
      return 0;
    }
  }, [addWords]);

  // 导入示例词库
  const importSampleWords = useCallback((count: number = 20) => {
    const hasImported = localStorage.getItem(HAS_IMPORTED_SAMPLE_KEY);
    if (hasImported) return 0;
    
    const selected = sampleWords.slice(0, count);
    addWords(selected);
    localStorage.setItem(HAS_IMPORTED_SAMPLE_KEY, 'true');
    return selected.length;
  }, [addWords]);

  // 检查是否已导入示例
  const hasImportedSample = useCallback(() => {
    return localStorage.getItem(HAS_IMPORTED_SAMPLE_KEY) === 'true';
  }, []);

  return {
    words,
    progress,
    sessions,
    achievements,
    dailyGoal,
    isLoaded,
    
    // CRUD
    addWord,
    addWords,
    updateWord,
    deleteWord,
    clearAllData,
    
    // 学习
    recordSession,
    updateWordMastery,
    
    // 查询
    getWordsToReview,
    getTodayReviewStats,
    getMasteredWords,
    getLearningWords,
    
    // 目标
    setDailyTarget,
    
    // 导入导出
    exportData,
    exportToJSON,
    exportToCSV,
    importData,
    importFromJSON,
    importFromCSV,
    importSampleWords,
    hasImportedSample,
  };
}
