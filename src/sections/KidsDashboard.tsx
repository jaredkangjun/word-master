import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { LearningProgress, DailyGoal, Achievement, Word } from '@/types';
import type { WordBook } from '@/data/wordBooks';

interface KidsDashboardProps {
  progress: LearningProgress;
  dailyGoal: DailyGoal;
  achievements: Achievement[];
  words: Word[];
  currentBook?: WordBook;
  onStartStudy: (mode: 'flashcard' | 'quiz') => void;
  onOpenBookSelector: () => void;
}

export function KidsDashboard({
  progress,
  dailyGoal,
  achievements,
  words,
  currentBook,
  onStartStudy,
  onOpenBookSelector,
}: KidsDashboardProps) {
  const masteredWords = words.filter(w => w.reviewStage >= 6 || w.masteryLevel >= 80).length;
  const learningWords = words.filter(w => w.reviewStage < 6 && w.reviewStage > 0).length;
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  
  // 计算等级
  const level = Math.floor(masteredWords / 10) + 1;
  
  // 今日目标进度
  const dailyProgress = Math.min(100, (dailyGoal.completedWords / dailyGoal.targetWords) * 100);
  const isDailyCompleted = dailyProgress >= 100;

  // 待复习单词
  const now = Date.now();
  const dueWords = words.filter(w => w.nextReviewDate <= now);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* 顶部：等级和连续学习 */}
      <div className="flex items-center justify-between">
        <Card className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md">
            🏆
          </div>
          <div>
            <div className="text-xs text-amber-700 font-medium">单词等级</div>
            <div className="text-xl font-bold text-amber-800">Lv.{level}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-100 to-rose-100 border-red-200">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-2xl shadow-md">
            🔥
          </div>
          <div>
            <div className="text-xs text-red-700 font-medium">连续学习</div>
            <div className="text-xl font-bold text-red-800">{progress.streakDays}天</div>
          </div>
        </Card>
      </div>

      {/* 当前课本 */}
      {currentBook ? (
        <Card 
          className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50"
          onClick={onOpenBookSelector}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
              style={{ backgroundColor: currentBook.color }}
            >
              {currentBook.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800">{currentBook.name}</h3>
                <Badge className="bg-amber-400 text-white text-xs">学习中</Badge>
              </div>              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>已掌握: {masteredWords}</span>
                <span>学习中: {learningWords}</span>
                <span>待复习: {dueWords.length}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>        </Card>
      ) : (
        <Card 
          className="p-6 text-center cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-amber-300 bg-amber-50"
          onClick={onOpenBookSelector}
        >
          <div className="text-4xl mb-2">📚</div>
          <h3 className="font-bold text-slate-700">选择课本开始学习</h3>
          <p className="text-sm text-slate-500 mt-1">沪教版（深圳）小学英语</p>
        </Card>
      )}

      {/* 今日目标 */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-700">今日目标</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-blue-600">{dailyGoal.completedWords}</span>
            <span className="text-slate-400"> / {dailyGoal.targetWords}</span>
          </div>
        </div>
        
        <Progress value={dailyProgress} className="h-3" />
        
        {isDailyCompleted && (
          <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
            <Sparkles className="w-4 h-4" />
            今日目标已完成！太棒了！
          </div>
        )}
      </Card>

      {/* 开始学习按钮 */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          className="h-20 text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 shadow-lg"
          onClick={() => onStartStudy('flashcard')}
          disabled={dueWords.length === 0}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">📚</div>
            <div>{dueWords.length > 0 ? `复习单词 (${dueWords.length})` : '暂无单词'}</div>
          </div>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-20 text-lg font-bold border-2 border-purple-200 hover:bg-purple-50"
          onClick={() => onStartStudy('quiz')}
          disabled={words.length < 5}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🎮</div>
            <div>单词游戏</div>
          </div>
        </Button>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-2xl font-bold text-green-600">{masteredWords}</div>
          <div className="text-xs text-slate-500">已掌握</div>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-2xl font-bold text-blue-600">{learningWords}</div>
          <div className="text-xs text-slate-500">学习中</div>
        </Card>
        <Card className="p-3 text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-2xl font-bold text-purple-600">{unlockedAchievements.length}</div>
          <div className="text-xs text-slate-500">成就</div>
        </Card>
      </div>

      {/* 成就提示 */}
      {unlockedAchievements.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏅</div>
            <div className="flex-1">
              <div className="font-medium text-slate-700">最新成就</div>
              <div className="text-sm text-slate-500">
                {unlockedAchievements[unlockedAchievements.length - 1]?.title}
              </div>
            </div>
            <Badge className="bg-yellow-400 text-white">
              +{unlockedAchievements.length}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
