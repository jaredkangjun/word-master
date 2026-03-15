import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Volume2, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { playWordAudio } from '@/services/dictionaryService';
import type { Word, StudySession } from '@/types';

interface SpellingModeProps {
  words: Word[];
  onComplete: (session: Omit<StudySession, 'id' | 'date'>) => void;
  onUpdateMastery: (wordId: string, isCorrect: boolean, quality?: number) => void;
}

export function SpellingMode({ words, onComplete, onUpdateMastery }: SpellingModeProps) {
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [studiedWords, setStudiedWords] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (words.length > 0) {
      setShuffledWords([...words].sort(() => Math.random() - 0.5).slice(0, 10));
      setStartTime(Date.now());
    }
  }, [words]);

  useEffect(() => {
    if (inputRef.current && !isAnswered) {
      inputRef.current.focus();
    }
  }, [currentIndex, isAnswered]);

  const currentWord = shuffledWords[currentIndex];
  const progress = shuffledWords.length > 0 ? ((currentIndex + 1) / shuffledWords.length) * 100 : 0;

  const handleSubmit = () => {
    if (!userInput.trim() || isAnswered) return;

    const correct = userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      onUpdateMastery(currentWord.id, true);
    } else {
      onUpdateMastery(currentWord.id, false);
    }

    if (!studiedWords.includes(currentWord.id)) {
      setStudiedWords(prev => [...prev, currentWord.id]);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    onComplete({
      mode: 'spelling',
      wordsStudied: studiedWords,
      correctAnswers: correctCount,
      totalQuestions: shuffledWords.length,
      duration: Math.max(1, duration),
    });
    setIsFinished(true);
  };

  const handlePlayAudio = (text: string) => {
    playWordAudio(text);
  };

  const getHint = () => {
    if (!currentWord) return '';
    const word = currentWord.word;
    if (word.length <= 3) return word[0] + '_'.repeat(word.length - 1);
    return word[0] + '_'.repeat(word.length - 2) + word[word.length - 1];
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

  if (shuffledWords.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / shuffledWords.length) * 100);
    const duration = Math.round((Date.now() - startTime) / 60000);
    
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">拼写练习完成！</h2>
          <p className="text-slate-500 mb-6">你的拼写能力正在提升</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-indigo-600">{shuffledWords.length}</p>
              <p className="text-xs text-slate-500">题目数</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className={`text-2xl font-bold ${accuracy >= 80 ? 'text-emerald-600' : accuracy >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {accuracy}%
              </p>
              <p className="text-xs text-slate-500">正确率</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-600">{duration}</p>
              <p className="text-xs text-slate-500">用时(分)</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">拼写正确</span>
              <span className="font-medium text-emerald-600">{correctCount} 词</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">需要练习</span>
              <span className="font-medium text-red-600">{shuffledWords.length - correctCount} 词</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-emerald-600">
            {currentIndex + 1} / {shuffledWords.length}
          </Badge>
          <span className="text-sm text-slate-500">拼写练习</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {Math.round((Date.now() - startTime) / 60000)} 分钟
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
      <Card className="p-6">
        <CardContent className="p-0 space-y-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-4">听读音，写出正确的单词</p>
            
            {/* Audio Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePlayAudio(currentWord.word)}
              className="w-20 h-20 rounded-full mb-4"
            >
              <Volume2 className="w-8 h-8" />
            </Button>

            {/* Meaning Hint */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <p className="text-slate-700">{currentWord.meaning}</p>
            </div>

            {/* Hint Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="text-slate-400"
            >
              {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHint ? '隐藏提示' : '显示提示'}
            </Button>

            {showHint && (
              <p className="text-lg font-mono text-amber-600 mt-2">
                提示：{getHint()}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="space-y-4">
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isAnswered && handleSubmit()}
              placeholder="输入单词..."
              className={`text-center text-lg h-12 ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-red-500 bg-red-50'
                  : ''
              }`}
              disabled={isAnswered}
            />

            {!isAnswered ? (
              <Button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                disabled={!userInput.trim()}
              >
                提交
              </Button>
            ) : (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="font-medium text-emerald-700">拼写正确！</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700">拼写错误</span>
                    </>
                  )}
                </div>
                {!isCorrect && (
                  <p className="text-center text-slate-700">
                    正确答案：<span className="font-bold text-emerald-600">{currentWord.word}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            className="bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            {currentIndex < shuffledWords.length - 1 ? '下一题' : '完成'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Example */}
      {isAnswered && currentWord.example && (
        <Card className="p-4 bg-indigo-50 border-indigo-200">
          <p className="text-sm text-indigo-800">
            <span className="font-medium">例句：</span>
            {currentWord.example}
          </p>
          {currentWord.exampleTranslation && (
            <p className="text-sm text-indigo-600 mt-1">
              {currentWord.exampleTranslation}
            </p>
          )}
        </Card>
      )}

      {/* Tips */}
      <div className="text-center text-sm text-slate-400">
        <p>按 Enter 键快速提交</p>
      </div>
    </div>
  );
}
