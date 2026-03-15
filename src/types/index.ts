// 单词类型定义
export interface Word {
  id: string;
  word: string;
  phonetic?: string;
  meaning: string;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;  // 发音音频URL
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;
  lastReviewed?: number;
  reviewCount: number;
  correctCount: number;
  masteryLevel: number; // 0-100，用于快速参考
  
  // SRS 新增字段
  nextReviewDate: number;    // 下次复习时间戳
  reviewStage: number;       // 复习阶段 0-8（0=新词，1-8=间隔天数阶段）
  easeFactor: number;        // 难度系数（默认 2.5，范围 1.3-3.0）
  isNew: boolean;            // 是否为新词（从未复习过）
}

// 学习进度类型
export interface LearningProgress {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  todayLearned: number;
  todayGoal: number;
  streakDays: number;
  lastStudyDate: string;
  totalStudyTime: number; // 分钟
}

// 学习会话类型
export interface StudySession {
  id: string;
  date: string;
  mode: 'flashcard' | 'quiz' | 'spelling';
  wordsStudied: string[];
  correctAnswers: number;
  totalQuestions: number;
  duration: number; // 分钟
}

// 成就类型
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  condition: {
    type: 'words_added' | 'words_mastered' | 'streak_days' | 'study_sessions';
    value: number;
  };
}

// 学习模式
export type StudyMode = 'flashcard' | 'quiz' | 'spelling';

// 每日目标
export interface DailyGoal {
  date: string;
  targetWords: number;
  completedWords: number;
  isCompleted: boolean;
}

// 导出数据格式
export interface ExportData {
  version: string;
  exportDate: string;
  words: Word[];
  progress: LearningProgress;
  sessions: StudySession[];
  achievements: Achievement[];
  dailyGoal: DailyGoal;
}
