import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  Clock,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { playWordAudio } from '@/services/dictionaryService';
import type { Word, StudySession } from '@/types';

interface QuizModeProps {
  words: Word[];
  allWords: Word[];
  onComplete: (session: Omit<StudySession, 'id' | 'date'>) => void;
  onUpdateMastery: (wordId: string, isCorrect: boolean, quality?: number) => void;
}

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
}

export function QuizMode({ words, allWords, onComplete, onUpdateMastery }: QuizModeProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [studiedWords, setStudiedWords] = useState<string[]>([]);

  // 生成选择题
  useEffect(() => {
    const generateQuestions = (): QuizQuestion[] => {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, Math.min(10, shuffled.length)).map(word => {
        // 从所有单词中随机选择3个错误选项
        const otherWords = allWords.filter(w => w.id !== word.id);
        const wrongOptions = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.meaning);
        
        const options = [word.meaning, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        return {
          word,
          options,
          correctAnswer: word.meaning,
        };
      });
    };

    if (words.length > 0) {
      setQuestions(generateQuestions());
      setStartTime(Date.now());
    }
  }, [words, allWords]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    onUpdateMastery(currentQuestion.word.id, isCorrect);
    
    if (!studiedWords.includes(currentQuestion.word.id)) {
      setStudiedWords(prev => [...prev, currentQuestion.word.id]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const duration = Math.round((Date.now() - startTime) / 60000);
    onComplete({
      mode: 'quiz',
      wordsStudied: studiedWords,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      duration: Math.max(1, duration),
    });
    setIsFinished(true);
  };

  const handlePlayAudio = (text: string) => {
    playWordAudio(text);
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

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const duration = Math.round((Date.now() - startTime) / 60000);
    
    return (
      <div className="max-w-md mx-auto">
        <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">测试完成！</h2>
          <p className="text-slate-500 mb-6">来看看你的表现</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
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
              <span className="text-slate-500">答对</span>
              <span className="font-medium text-emerald-600">{correctCount} 题</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">答错</span>
              <span className="font-medium text-red-600">{questions.length - correctCount} 题</span>
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
          <Badge variant="secondary" className="text-purple-600">
            {currentIndex + 1} / {questions.length}
          </Badge>
          <span className="text-sm text-slate-500">选择测试</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {Math.round((Date.now() - startTime) / 60000)} 分钟
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div className="text-center mb-8">
            <p className="text-sm text-slate-500 mb-4">选择正确的释义</p>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-3xl font-bold text-slate-800">{currentQuestion.word.word}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePlayAudio(currentQuestion.word.word)}
                className="text-indigo-600"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
            {currentQuestion.word.phonetic && (
              <p className="text-slate-500 mt-2">{currentQuestion.word.phonetic}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showCorrect = isAnswered && isCorrect;
              const showWrong = isAnswered && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-auto py-4 px-6 justify-start text-left transition-all ${
                    showCorrect
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : showWrong
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isAnswered}
                >
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium mr-4 shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {currentIndex < questions.length - 1 ? '下一题' : '完成'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Hint */}
      {currentQuestion.word.example && isAnswered && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            <span className="font-medium">例句：</span>
            {currentQuestion.word.example}
          </p>
          {currentQuestion.word.exampleTranslation && (
            <p className="text-sm text-amber-600 mt-1">
              {currentQuestion.word.exampleTranslation}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
