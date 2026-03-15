import { useState } from 'react';
import { wordBooks, getAllGrades, getBooksByGrade, type WordBook } from '@/data/wordBooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

interface BookSelectorProps {
  onSelectBook: (book: WordBook) => void;
  currentBookId?: string;
}

export function BookSelector({ onSelectBook, currentBookId }: BookSelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const grades = getAllGrades();

  const gradeNames: Record<number, string> = {
    1: '一年级',
    2: '二年级',
    3: '三年级',
    4: '四年级',
    5: '五年级',
    6: '六年级',
  };

  const gradeEmojis: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🌲',
    4: '🌳',
    5: '🌴',
    6: '🎓',
  };

  const books = selectedGrade ? getBooksByGrade(selectedGrade) : [];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg animate-bounce">
          📚
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          选择你的课本
        </h1>
        <p className="text-slate-500">
          沪教版（深圳）小学英语 2024-2025
        </p>
      </div>

      {/* Grade Selection */}
      {!selectedGrade ? (
        <div className="space-y-4">
          <p className="text-center text-sm text-slate-400 font-medium">
            你现在几年级？
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {grades.map((grade) => (
              <Card
                key={grade}
                className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-amber-300 bg-gradient-to-br from-white to-amber-50"
                onClick={() => setSelectedGrade(grade)}
              >
                <div className="text-center space-y-2">
                  <div className="text-4xl">{gradeEmojis[grade]}</div>
                  <div className="font-bold text-slate-700">
                    {gradeNames[grade]}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGrade(null)}
            className="text-slate-500"
          >
            ← 返回选择年级
          </Button>

          <p className="text-center text-sm text-slate-400 font-medium">
            选择学期
          </p>

          <div className="grid gap-3">
            {books.map((book) => {
              const isSelected = currentBookId === book.id;
              const hasWords = book.units.some(u => u.words.length > 0);
              const totalWords = book.units.reduce((sum, u) => sum + u.words.length, 0);

              return (
                <Card
                  key={book.id}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-amber-400 shadow-lg bg-amber-50'
                      : 'border-transparent hover:border-amber-200 hover:shadow-md'
                  } ${!hasWords ? 'opacity-60' : ''}`}
                  onClick={() => hasWords && onSelectBook(book)}
                  style={{ backgroundColor: isSelected ? undefined : `${book.color}15` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: book.color }}
                    >
                      {book.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">
                          {book.name}
                        </h3>
                        {isSelected && (
                          <Badge className="bg-amber-400 text-white">
                            学习中
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {book.publisher} · {book.region}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <BookOpen className="w-3 h-3" />
                          {book.units.length} 个单元
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Sparkles className="w-3 h-3" />
                          {totalWords} 个单词
                        </div>
                      </div>
                    </div>

                    {hasWords ? (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        即将推出
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-center text-xs text-slate-400">
        <p>💡 选择课本后，单词会自动导入你的学习列表</p>
      </div>
    </div>
  );
}
