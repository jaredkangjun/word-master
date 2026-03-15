import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Edit3, 
  Trophy,
  Flame,
  Target,
  Clock,
  TrendingUp,
  Star,
  Zap,
  ChevronRight,
  Sparkles,
  Upload,
  FileJson,
  FileSpreadsheet,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Brain,
  Calendar
} from 'lucide-react';
import type { LearningProgress, DailyGoal, Achievement, Word, StudyMode } from '@/types';

interface DashboardProps {
  progress: LearningProgress;
  dailyGoal: DailyGoal;
  achievements: Achievement[];
  words: Word[];
  todayReviewStats: { total: number; newWords: number; reviewWords: number };
  hasImportedSample: boolean;
  onStartStudy: (mode: StudyMode) => void;
  onSetDailyTarget: (target: number) => void;
  onImportSampleWords: () => number;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (file: File) => Promise<boolean>;
  onImportCSV: (file: File) => Promise<number>;
  onClearAllData: () => void;
}

export function Dashboard({ 
  progress, 
  dailyGoal, 
  achievements, 
  words,
  todayReviewStats,
  hasImportedSample,
  onStartStudy, 
  onSetDailyTarget,
  onImportSampleWords,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onImportCSV,
  onClearAllData,
}: DashboardProps) {
  const [targetInput, setTargetInput] = useState(progress.todayGoal.toString());
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const masteredWords = words.filter(w => w.reviewStage >= 6 || w.masteryLevel >= 80).length;
  const learningWords = words.filter(w => w.reviewStage < 6 && w.reviewStage > 0).length;
  const newWordsCount = words.filter(w => w.isNew).length;
  
  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const recentAchievements = [...unlockedAchievements]
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);

  const dailyProgressPercent = Math.min(100, (dailyGoal.completedWords / dailyGoal.targetWords) * 100);

  const handleSetTarget = () => {
    const target = parseInt(targetInput);
    if (target > 0) {
      onSetDailyTarget(target);
      setIsTargetDialogOpen(false);
      toast.success(`每日目标已设置为 ${target} 个单词`);
    }
  };

  const handleImportSample = () => {
    const count = onImportSampleWords();
    if (count > 0) {
      toast.success(`成功导入 ${count} 个示例单词！`);
    } else {
      toast.info('示例词库只能导入一次');
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    const success = await onImportJSON(file);
    setIsImporting(false);
    
    if (success) {
      toast.success('数据导入成功！');
    } else {
      toast.error('导入失败，请检查文件格式');
    }
    
    // 重置 input
    if (jsonInputRef.current) {
      jsonInputRef.current.value = '';
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    const count = await onImportCSV(file);
    setIsImporting(false);
    
    if (count > 0) {
      toast.success(`成功导入 ${count} 个单词！`);
    } else {
      toast.error('导入失败，请检查 CSV 格式');
    }
    
    // 重置 input
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    onClearAllData();
    setIsClearDialogOpen(false);
    toast.success('所有数据已清空');
  };

  const studyModes = [
    {
      id: 'flashcard' as StudyMode,
      title: '记忆卡片',
      description: '翻转卡片，记忆单词',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'quiz' as StudyMode,
      title: '选择测试',
      description: '选择题形式，检验记忆',
      icon: HelpCircle,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      id: 'spelling' as StudyMode,
      title: '拼写练习',
      description: '听音拼写，加深记忆',
      icon: Edit3,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  // 欢迎语根据学习状态变化
  const getWelcomeMessage = () => {
    if (progress.streakDays >= 30) return { title: '学习大师！🔥', subtitle: `连续学习 ${progress.streakDays} 天，你太强了！` };
    if (progress.streakDays >= 7) return { title: '习惯已养成 💪', subtitle: `连续学习 ${progress.streakDays} 天，保持下去！` };
    if (progress.streakDays > 0) return { title: '欢迎回来 👋', subtitle: `已连续学习 ${progress.streakDays} 天，继续加油！` };
    if (words.length === 0) return { title: '开始你的单词之旅！', subtitle: '每天学习一点，积累成就未来' };
    return { title: '欢迎来到 WordMaster', subtitle: '添加单词，开始学习吧' };
  };

  const welcome = getWelcomeMessage();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">{welcome.title}</h1>
          <p className="text-white/80">{welcome.subtitle}</p>
        </div>
      </div>

      {/* 冷启动引导 - 无单词时显示 */}
      {words.length === 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-lg font-semibold text-slate-800">欢迎使用 WordMaster！</h3>
                </div>
                <p className="text-slate-600 text-sm">
                  你可以导入示例词库快速开始，或手动添加自己的单词
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleImportSample}
                  disabled={hasImportedSample}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  {hasImportedSample ? '已导入示例词库' : '导入雅思核心 50 词'}
                </Button>
                <Button variant="outline" onClick={() => onStartStudy('flashcard')} disabled>
                  <BookOpen className="w-4 h-4 mr-2" />
                  手动添加
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 今日复习任务卡片 */}
      {words.length > 0 && (
        <Card className={`${todayReviewStats.total > 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${todayReviewStats.total > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  {todayReviewStats.total > 0 ? (
                    <Brain className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {todayReviewStats.total > 0 ? `今日待复习 ${todayReviewStats.total} 个单词` : '今日复习任务已完成！'}
                  </p>
                  {todayReviewStats.total > 0 && (
                    <p className="text-sm text-slate-500">
                      新词 {todayReviewStats.newWords} · 复习 {todayReviewStats.reviewWords}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => onStartStudy('flashcard')}
                disabled={todayReviewStats.total === 0 && words.length > 0}
              >
                {todayReviewStats.total > 0 ? '开始学习' : '已完成'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur border-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">总单词</p>
                <p className="text-2xl font-bold text-slate-800">{progress.totalWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已掌握</p>
                <p className="text-2xl font-bold text-slate-800">{masteredWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">连续天数</p>
                <p className="text-2xl font-bold text-slate-800">{progress.streakDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">学习时长</p>
                <p className="text-2xl font-bold text-slate-800">{progress.totalStudyTime}分</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal & Study Modes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Goal */}
        <Card className="bg-white/80 backdrop-blur border-indigo-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-indigo-600" />
                今日目标
              </CardTitle>
              <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-indigo-600">
                    修改
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>设置每日目标</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">每日学习单词数</label>
                      <Input
                        type="number"
                        value={targetInput}
                        onChange={(e) => setTargetInput(e.target.value)}
                        min={1}
                        max={100}
                      />
                    </div>
                    <Button onClick={handleSetTarget} className="w-full">
                      保存设置
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">进度</span>
                <span className="font-medium text-indigo-600">
                  {dailyGoal.completedWords} / {dailyGoal.targetWords} 词
                </span>
              </div>
              <Progress value={dailyProgressPercent} className="h-3" />
              <div className="flex items-center gap-2 text-sm">
                {dailyGoal.isCompleted ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Star className="w-4 h-4 fill-current" />
                    今日目标已完成！
                  </span>
                ) : (
                  <span className="text-slate-500">
                    还需学习 {dailyGoal.targetWords - dailyGoal.completedWords} 个单词
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Word Status */}
        <Card className="bg-white/80 backdrop-blur border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              学习状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">新词</span>
                <Badge variant="secondary">{newWordsCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">学习中</span>
                <Badge variant="secondary">{learningWords}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">已掌握</span>
                <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{masteredWords}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Modes */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          选择学习模式
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {studyModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card 
                key={mode.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-indigo-200"
                onClick={() => onStartStudy(mode.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${mode.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${mode.textColor}`} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{mode.title}</h3>
                  <p className="text-sm text-slate-500">{mode.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
            <Calendar className="w-5 h-5" />
            数据管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onExportJSON}>
              <FileJson className="w-4 h-4 mr-2" />
              导出 JSON
            </Button>
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              导出 CSV
            </Button>
            <Dialog open={isDataDialogOpen} onOpenChange={setIsDataDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  导入数据
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>导入数据</DialogTitle>
                  <DialogDescription>
                    支持导入 JSON 备份文件或 CSV 单词列表
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">从 JSON 导入（完整备份）</label>
                    <Input
                      ref={jsonInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      disabled={isImporting}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">或</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">从 CSV 导入（仅单词）</label>
                    <Input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleImportCSV}
                      disabled={isImporting}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空数据
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    确认清空所有数据？
                  </DialogTitle>
                  <DialogDescription>
                    此操作将删除所有单词、学习记录和成就，且无法恢复。
                    建议先导出备份。
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-end mt-4">
                  <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
                    取消
                  </Button>
                  <Button variant="destructive" onClick={handleClearData}>
                    确认清空
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
              <Trophy className="w-5 h-5" />
              最近成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-slate-800">{achievement.title}</p>
                    <p className="text-xs text-slate-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
