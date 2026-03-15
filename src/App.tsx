import { useState, useEffect } from 'react';
import { useWordStorage } from '@/hooks/useWordStorage';
import { KidsDashboard } from '@/sections/KidsDashboard';
import { BookSelector } from '@/sections/BookSelector';
import { WordList } from '@/sections/WordList';
import { FlashcardMode } from '@/sections/FlashcardMode';
import { QuizMode } from '@/sections/QuizMode';
import { SpellingMode } from '@/sections/SpellingMode';
import { Achievements } from '@/sections/Achievements';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import type { WordBook } from '@/data/wordBooks';
import { getBookById } from '@/data/wordBooks';

type ViewMode = 'dashboard' | 'books' | 'words' | 'flashcard' | 'quiz' | 'spelling' | 'achievements';

const CURRENT_BOOK_KEY = 'wordmaster_current_book_id';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [currentBook, setCurrentBook] = useState<WordBook | undefined>(undefined);
  
  const {
    words,
    progress,
    achievements,
    dailyGoal,
    isLoaded,
    addWord,
    addWords,
    updateWord,
    deleteWord,
    recordSession,
    updateWordMastery,
    getWordsToReview,
  } = useWordStorage();

  // 加载当前选中的课本
  useEffect(() => {
    const savedBookId = localStorage.getItem(CURRENT_BOOK_KEY);
    if (savedBookId) {
      const book = getBookById(savedBookId);
      if (book) {
        setCurrentBook(book);
      }
    }
  }, []);

  // 保存选中的课本
  const handleSelectBook = (book: WordBook) => {
    setCurrentBook(book);
    localStorage.setItem(CURRENT_BOOK_KEY, book.id);
    
    // 导入课本单词
    const wordsToAdd = book.units
      .flatMap(unit => unit.words)
      .filter(w => w.word && w.meaning)
      .map(w => ({
        word: w.word,
        meaning: w.meaning,
        phonetic: w.phonetic,
        example: w.example,
        exampleTranslation: w.exampleTranslation,
        audioUrl: w.audioUrl,
        tags: w.tags || [book.name],
        difficulty: w.difficulty || 'easy',
      }));
    
    if (wordsToAdd.length > 0) {
      // 检查是否已经有这些单词
      const existingWords = new Set(words.map(w => w.word.toLowerCase()));
      const newWords = wordsToAdd.filter(w => !existingWords.has(w.word.toLowerCase()));
      
      if (newWords.length > 0) {
        addWords(newWords);
        toast.success(`已导入 ${newWords.length} 个新单词！`);
      } else {
        toast.info('这些单词已经在你的学习列表中了');
      }
    }
    
    setCurrentView('dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">📚</div>
          <div className="text-lg font-medium text-amber-700">加载中...</div>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <KidsDashboard
            progress={progress}
            dailyGoal={dailyGoal}
            achievements={achievements}
            words={words}
            currentBook={currentBook}
            onStartStudy={(mode) => {
              if (mode === 'flashcard' && getWordsToReview().length === 0 && words.length > 0) {
                toast.info('没有待复习的单词，去添加一些新单词吧！');
                return;
              }
              setCurrentView(mode);
            }}
            onOpenBookSelector={() => setCurrentView('books')}
          />
        );
      case 'books':
        return (
          <BookSelector
            onSelectBook={handleSelectBook}
            currentBookId={currentBook?.id}
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

  // 儿童版简化导航
  const kidsNavItems = [
    { id: 'dashboard' as ViewMode, label: '首页', emoji: '🏠' },
    { id: 'books' as ViewMode, label: '课本', emoji: '📚' },
    { id: 'flashcard' as ViewMode, label: '学习', emoji: '📖' },
    { id: 'quiz' as ViewMode, label: '游戏', emoji: '🎮' },
    { id: 'achievements' as ViewMode, label: '成就', emoji: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Toaster position="top-center" richColors />
      
      {/* Header - 儿童版 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-md">
                🌟
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                单词小达人
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600">
                <span>🔥</span>
                <span className="text-sm font-bold">{progress.streakDays}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                <span>⭐</span>
                <span className="text-sm font-bold">{dailyGoal.completedWords}/{dailyGoal.targetWords}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button for sub-pages */}
      {currentView !== 'dashboard' && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('dashboard')}
            className="text-slate-500"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回首页
          </Button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation - 儿童版 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-lg z-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-around py-2">
            {kidsNavItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className={`text-xs font-medium ${isActive ? 'text-amber-700' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
