import { useState } from 'react';
import { useWordStorage } from '@/hooks/useWordStorage';
import { Dashboard } from '@/sections/Dashboard';
import { WordList } from '@/sections/WordList';
import { FlashcardMode } from '@/sections/FlashcardMode';
import { QuizMode } from '@/sections/QuizMode';
import { SpellingMode } from '@/sections/SpellingMode';
import { Achievements } from '@/sections/Achievements';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  List, 
  Layers, 
  HelpCircle, 
  Edit3, 
  Trophy,
  Sparkles,
  Flame,
  Target
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

type ViewMode = 'dashboard' | 'words' | 'flashcard' | 'quiz' | 'spelling' | 'achievements';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const {
    words,
    progress,
    achievements,
    dailyGoal,
    isLoaded,
    addWord,
    updateWord,
    deleteWord,
    clearAllData,
    recordSession,
    updateWordMastery,
    setDailyTarget,
    getWordsToReview,
    getTodayReviewStats,
    // addWords, // 暂时未使用，但保留用于批量导入
    exportToJSON,
    exportToCSV,
    importFromJSON,
    importFromCSV,
    importSampleWords,
    hasImportedSample,
  } = useWordStorage();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          <span className="text-lg font-medium">加载中...</span>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            progress={progress}
            dailyGoal={dailyGoal}
            achievements={achievements}
            words={words}
            todayReviewStats={getTodayReviewStats()}
            hasImportedSample={hasImportedSample()}
            onStartStudy={(mode) => {
              if (getWordsToReview().length === 0 && words.length > 0) {
                toast.info('没有待复习的单词，去添加一些新单词吧！');
                return;
              }
              setCurrentView(mode);
            }}
            onSetDailyTarget={setDailyTarget}
            onImportSampleWords={importSampleWords}
            onExportJSON={exportToJSON}
            onExportCSV={exportToCSV}
            onImportJSON={importFromJSON}
            onImportCSV={importFromCSV}
            onClearAllData={() => {
              clearAllData();
              toast.success('数据已清空');
            }}
          />
        );
      case 'words':
        return (
          <WordList
            words={words}
            onAddWord={addWord}
            onUpdateWord={updateWord}
            onDeleteWord={deleteWord}
          />
        );
      case 'flashcard':
        return (
          <FlashcardMode
            words={getWordsToReview(20)}
            onComplete={(session) => {
              recordSession(session);
              toast.success(`完成学习！学习了 ${session.wordsStudied.length} 个单词`);
              setCurrentView('dashboard');
            }}
            onUpdateMastery={updateWordMastery}
          />
        );
      case 'quiz':
        return (
          <QuizMode
            words={getWordsToReview(20)}
            allWords={words}
            onComplete={(session) => {
              recordSession(session);
              toast.success(`测试完成！正确率 ${Math.round((session.correctAnswers / session.totalQuestions) * 100)}%`);
              setCurrentView('dashboard');
            }}
            onUpdateMastery={updateWordMastery}
          />
        );
      case 'spelling':
        return (
          <SpellingMode
            words={getWordsToReview(10)}
            onComplete={(session) => {
              recordSession(session);
              toast.success(`拼写练习完成！正确率 ${Math.round((session.correctAnswers / session.totalQuestions) * 100)}%`);
              setCurrentView('dashboard');
            }}
            onUpdateMastery={updateWordMastery}
          />
        );
      case 'achievements':
        return <Achievements achievements={achievements} progress={progress} />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard' as ViewMode, label: '首页', icon: BookOpen },
    { id: 'words' as ViewMode, label: '单词库', icon: List },
    { id: 'flashcard' as ViewMode, label: '卡片', icon: Layers },
    { id: 'quiz' as ViewMode, label: '测试', icon: HelpCircle },
    { id: 'spelling' as ViewMode, label: '拼写', icon: Edit3 },
    { id: 'achievements' as ViewMode, label: '成就', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WordMaster
              </span>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2 text-amber-600">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">{progress.streakDays} 天</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <Target className="w-5 h-5" />
                <span className="font-semibold">{dailyGoal.completedWords}/{dailyGoal.targetWords}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 z-40 bg-white/60 backdrop-blur-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    currentView === item.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
