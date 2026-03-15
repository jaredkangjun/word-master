import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Lock, 
  Unlock,
  Star,
  Flame,
  BookOpen,
  Target,
  Zap,
  Crown,
  Sparkles
} from 'lucide-react';
import type { Achievement, LearningProgress } from '@/types';

interface AchievementsProps {
  achievements: Achievement[];
  progress: LearningProgress;
}

export function Achievements({ achievements, progress }: AchievementsProps) {
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const getProgressForType = (type: Achievement['condition']['type']) => {
    switch (type) {
      case 'words_added':
        return { current: progress.totalWords, total: 100 };
      case 'words_mastered':
        return { current: progress.masteredWords, total: 100 };
      case 'streak_days':
        return { current: progress.streakDays, total: 30 };
      case 'study_sessions':
        return { current: progress.totalStudyTime / 10, total: 50 };
      default:
        return { current: 0, total: 100 };
    }
  };

  const getIconForType = (type: Achievement['condition']['type']) => {
    switch (type) {
      case 'words_added':
        return BookOpen;
      case 'words_mastered':
        return Star;
      case 'streak_days':
        return Flame;
      case 'study_sessions':
        return Target;
      default:
        return Trophy;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{unlockedAchievements.length}</p>
            <p className="text-sm text-slate-500">已解锁</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <CardContent className="p-4 text-center">
            <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{lockedAchievements.length}</p>
            <p className="text-sm text-slate-500">待解锁</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4 text-center">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </p>
            <p className="text-sm text-slate-500">完成度</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{achievements.length}</p>
            <p className="text-sm text-slate-500">总成就</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur border-indigo-100">
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            进度概览
          </h3>
          <div className="space-y-4">
            {(['words_added', 'words_mastered', 'streak_days', 'study_sessions'] as const).map((type) => {
              const { current } = getProgressForType(type);
              const Icon = getIconForType(type);
              const labels = {
                words_added: '单词积累',
                words_mastered: '单词掌握',
                streak_days: '连续学习',
                study_sessions: '学习时长',
              };
              
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">{labels[type]}</span>
                    </div>
                    <span className="text-sm text-slate-500">
                      {Math.round(current)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Unlock className="w-5 h-5 text-emerald-500" />
            已解锁成就
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card 
                key={achievement.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shrink-0">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800">{achievement.title}</h4>
                      <p className="text-sm text-slate-500">{achievement.description}</p>
                      <p className="text-xs text-amber-600 mt-1">
                        解锁于 {new Date(achievement.unlockedAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          待解锁成就
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockedAchievements.map((achievement) => {
            const { current } = getProgressForType(achievement.condition.type);
            const progressValue = Math.min(100, (current / achievement.condition.value) * 100);
            
            return (
              <Card 
                key={achievement.id}
                className="bg-slate-50 border-slate-200 overflow-hidden opacity-75"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-2xl shrink-0 grayscale">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-600">{achievement.title}</h4>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span>进度</span>
                          <span>{Math.round(current)} / {achievement.condition.value}</span>
                        </div>
                        <Progress value={progressValue} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
