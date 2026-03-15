import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Volume2, 
  BookOpen,
  Star,
  Filter,
  MoreHorizontal,
  Wand2,
  Loader2,
  Play
} from 'lucide-react';
import { lookupWord, playWordAudio, preloadVoices } from '@/services/dictionaryService';
import type { Word } from '@/types';

interface WordListProps {
  words: Word[];
  onAddWord: (word: Omit<Word, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'masteryLevel' | 'nextReviewDate' | 'reviewStage' | 'easeFactor' | 'isNew'>) => void;
  onUpdateWord: (id: string, updates: Partial<Word>) => void;
  onDeleteWord: (id: string) => void;
}

export function WordList({ words, onAddWord, onUpdateWord, onDeleteWord }: WordListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // 表单状态
  const [formData, setFormData] = useState({
    word: '',
    phonetic: '',
    meaning: '',
    example: '',
    exampleTranslation: '',
    tags: [] as string[],
    difficulty: 'medium' as Word['difficulty'],
  });

  // 预加载语音
  useEffect(() => {
    preloadVoices();
  }, []);

  // 获取所有标签
  const allTags = Array.from(new Set(words.flatMap(w => w.tags)));

  // 过滤单词
  const filteredWords = words.filter(word => {
    const matchesSearch = 
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? word.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  // 按掌握度分类
  const masteredWords = filteredWords.filter(w => w.masteryLevel >= 80);
  const learningWords = filteredWords.filter(w => w.masteryLevel < 80 && w.masteryLevel > 0);
  const newWords = filteredWords.filter(w => w.masteryLevel === 0);

  const handleSubmit = () => {
    if (!formData.word.trim() || !formData.meaning.trim()) return;
    
    if (editingWord) {
      onUpdateWord(editingWord.id, formData);
      setEditingWord(null);
    } else {
      onAddWord(formData);
    }
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      word: '',
      phonetic: '',
      meaning: '',
      example: '',
      exampleTranslation: '',
      tags: [],
      difficulty: 'medium',
    });
    setNewTag('');
    setAudioUrl('');
  };

  const startEdit = (word: Word) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      phonetic: word.phonetic || '',
      meaning: word.meaning,
      example: word.example || '',
      exampleTranslation: word.exampleTranslation || '',
      tags: [...word.tags],
      difficulty: word.difficulty,
    });
    setIsAddDialogOpen(true);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // 播放单词发音
  const handlePlayAudio = (word: string, url?: string) => {
    playWordAudio(word, url);
  };

  // 自动填充单词信息
  const handleAutoFill = async () => {
    if (!formData.word.trim()) return;
    
    setIsAutoFilling(true);
    try {
      const wordInfo = await lookupWord(formData.word);
      if (wordInfo) {
        setFormData(prev => ({
          ...prev,
          phonetic: wordInfo.phonetic || prev.phonetic,
          meaning: wordInfo.meaning || prev.meaning,
          example: wordInfo.example || prev.example,
          exampleTranslation: wordInfo.exampleTranslation || prev.exampleTranslation,
        }));
        setAudioUrl(wordInfo.audioUrl || '');
      }
    } finally {
      setIsAutoFilling(false);
    }
  };

  const WordCard = ({ word }: { word: Word }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-slate-800">{word.word}</h3>
              {word.phonetic && (
                <span className="text-sm text-slate-500">{word.phonetic}</span>
              )}
              {/* 发音按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 hover:bg-indigo-100"
                onClick={() => handlePlayAudio(word.word)}
                title="点击发音"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
              </Button>
            </div>
            <p className="text-slate-700 mb-2">{word.meaning}</p>
            {word.example && (
              <div className="text-sm text-slate-500 mb-2">
                <p className="italic">{word.example}</p>
                {word.exampleTranslation && (
                  <p className="text-slate-400">{word.exampleTranslation}</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {word.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-indigo-100"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                {word.masteryLevel >= 80 && <Star className="w-4 h-4 text-amber-500 fill-current" />}
                <span className={`text-xs font-medium ${
                  word.masteryLevel >= 80 ? 'text-emerald-600' :
                  word.masteryLevel >= 50 ? 'text-amber-600' :
                  'text-slate-400'
                }`}>
                  {word.masteryLevel}%
                </span>
              </div>
              <span className="text-xs text-slate-400">
                复习{word.reviewCount}次
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => startEdit(word)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDeleteWord(word.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-800">单词库</h2>
          <Badge variant="secondary">{words.length}</Badge>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
              onClick={() => {
                setEditingWord(null);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加单词
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWord ? '编辑单词' : '添加新单词'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Word Input with Auto-fill Button */}
              <div>
                <Label>单词 *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.word}
                    onChange={(e) => setFormData(prev => ({ ...prev, word: e.target.value }))}
                    placeholder="输入英文单词，如：apple"
                    className="flex-1"
                  />
                  {!editingWord && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAutoFill}
                      disabled={isAutoFilling || !formData.word.trim()}
                      className="whitespace-nowrap"
                    >
                      {isAutoFilling ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      自动填充
                    </Button>
                  )}
                </div>
                {!editingWord && (
                  <p className="text-xs text-slate-400 mt-1">
                    输入单词后点击"自动填充"，自动获取音标、中文释义、例句和发音
                  </p>
                )}
              </div>

              {/* 发音预览 */}
              {formData.word && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayAudio(formData.word, audioUrl)}
                    className="text-indigo-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    试听发音
                  </Button>
                </div>
              )}

              <div>
                <Label>音标</Label>
                <Input
                  value={formData.phonetic}
                  onChange={(e) => setFormData(prev => ({ ...prev, phonetic: e.target.value }))}
                  placeholder="/ˈæp.əl/"
                />
              </div>
              <div>
                <Label>中文释义 *</Label>
                <Input
                  value={formData.meaning}
                  onChange={(e) => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                  placeholder="中文翻译"
                />
              </div>
              <div>
                <Label>例句</Label>
                <Input
                  value={formData.example}
                  onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                  placeholder="英文例句"
                />
              </div>
              <div>
                <Label>例句翻译</Label>
                <Input
                  value={formData.exampleTranslation}
                  onChange={(e) => setFormData(prev => ({ ...prev, exampleTranslation: e.target.value }))}
                  placeholder="例句的中文翻译"
                />
              </div>
              <div>
                <Label>难度</Label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <Button
                      key={diff}
                      type="button"
                      variant={formData.difficulty === diff ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: diff }))}
                    >
                      {diff === 'easy' ? '简单' : diff === 'medium' ? '中等' : '困难'}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>标签</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="添加标签"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingWord ? '保存修改' : '添加单词'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索单词或释义..."
            className="pl-10"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <Badge 
              variant={selectedTag === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTag(null)}
            >
              全部
            </Badge>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Word Lists */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            全部 ({filteredWords.length})
          </TabsTrigger>
          <TabsTrigger value="mastered">
            已掌握 ({masteredWords.length})
          </TabsTrigger>
          <TabsTrigger value="learning">
            学习中 ({learningWords.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            新词 ({newWords.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
              {filteredWords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>没有找到单词</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mastered" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {masteredWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
              {masteredWords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>还没有掌握的单词，继续加油！</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="learning" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {learningWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
              {learningWords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <MoreHorizontal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>没有学习中的单词</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {newWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
              {newWords.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>没有新单词，去添加一些吧！</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
