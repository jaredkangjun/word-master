import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCw, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Sparkles,
  Clock,
  BookOpen
} from 'lucide-react';
import { playWordAudio } from '@/services/dictionaryService';
import type { Word, StudySession } from '@/types';

interface FlashcardModeProps {
  words: Word[];
  onComplete: (session: Omit<StudySession, 'id' | 'date'>) => void;
  onUpdateMastery: (wordId: string, isCorrect: boolean, quality?: number) => void;
}

export function FlashcardMode({ words, onComplete, onUpdateMastery }: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedWords, setStudiedWords] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [unknownWords, setUnknownWords] = useState<Set<string>>(new Set());

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnown = () => {
    if (!currentWord) return;
    
    onUpdateMastery(currentWord.id, true);
    setCorrectAnswers(prev => prev + 1);
    
    if (!studiedWords.includes(currentWord.id)) {
      setStudiedWords(prev => [...prev, currentWord.id]);
    }

    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      finishSession();
    }
  };

  const handleUnknown = () => {
    if (!currentWord) return;
    
    onUpdateMastery(currentWord.id, false);
    setUnknownWords(prev => new Set(prev).add(currentWord.id));
    
    if (!studiedWords.includes(currentWord.id)) {
      setStudiedWords(prev => [...prev, currentWord.id]);
    }

    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    onComplete({
      mode: 'flashcard',
      wordsStudied: studiedWords.length > 0 ? studiedWords : words.map(w => w.id),
      correctAnswers,
      totalQuestions: words.length,
      duration: Math.max(1, duration),
    });
    setIsFinished(true);
  };

  const handlePlayAudio = (text: string) => {
    playWordAudio(text);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">没有待复习的单词</h3>
        <p className="text-slate-500">先去添加一些单词吧！</p>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((correctAnswers / words.length) * 100);
    const duration = Math.round((Date.now() - startTime) / 60000);
    
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">学习完成！</h2>
          <p className="text-slate-500 mb-6">太棒了，你完成了今天的学习任务</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-indigo-600">{words.length}</p>
              <p className="text-xs text-slate-500">学习单词</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-emerald-600">{accuracy}%</p>
              <p className="text-xs text-slate-500">正确率</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-600">{duration}</p>
              <p className="text-xs text-slate-500">用时(分)</p>
            </div>
          </div>

          {(unknownWords.size > 0) && (
            <div className="text-left mb-6">
              <p className="text-sm font-medium text-slate-700 mb-2">需要加强的单词：</p>
              <div className="flex flex-wrap gap-2">
                {Array.from(unknownWords).map(wordId => {
                  const word = words.find(w => w.id === wordId);
                  return word ? (
                    <Badge key={wordId} variant="secondary" className="text-red-600">
                      {word.word}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-indigo-600">
            {currentIndex + 1} / {words.length}
          </Badge>
          <span className="text-sm text-slate-500">记忆卡片</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {Math.round((Date.now() - startTime) / 60000)} 分钟
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Flashcard */}
      <div className="relative h-80 perspective-1000">
        <div 
          className={`relative w-full h-full transition-all duration-500 transform-style-preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front */}
          <Card className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-indigo-50 border-indigo-200 ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          }`}>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">{currentWord.word}</h2>
              {currentWord.phonetic && (
                <p className="text-xl text-slate-500 mb-4">{currentWord.phonetic}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(currentWord.word);
                }}
                className="text-indigo-600"
              >
                <Volume2 className="w-5 h-5 mr-2" />
                发音
              </Button>
            </div>
            <p className="absolute bottom-4 text-sm text-slate-400">点击翻转查看释义</p>
          </Card>

          {/* Back */}
          <Card className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-emerald-50 border-emerald-200 ${
            isFlipped ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-emerald-700 mb-4">{currentWord.meaning}</h3>
              {currentWord.example && (
                <div className="mt-4 p-4 bg-white/80 rounded-lg">
                  <p className="text-slate-700 italic mb-2">{currentWord.example}</p>
                  {currentWord.exampleTranslation && (
                    <p className="text-slate-500 text-sm">{currentWord.exampleTranslation}</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleFlip}
        >
          <RotateCw className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          disabled={currentIndex === words.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Answer Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1 h-14 border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={handleUnknown}
        >
          <XCircle className="w-5 h-5 mr-2" />
          不认识
        </Button>
        <Button
          className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          onClick={handleKnown}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          认识
        </Button>
      </div>

      {/* Tips */}
      <div className="text-center text-sm text-slate-400">
        <p>点击卡片翻转，或按空格键</p>
      </div>
    </div>
  );
}
