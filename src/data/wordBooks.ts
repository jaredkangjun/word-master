import type { Word } from '@/types';

// 上海教育出版社（沪教牛津版）深圳小学英语 2024-2025
// 按年级和学期组织

export interface WordBook {
  id: string;
  name: string;
  publisher: string;
  region: string;
  grade: number;
  semester: 1 | 2;
  units: WordUnit[];
  icon: string;
  color: string;
}

export interface WordUnit {
  id: string;
  name: string;
  words: Omit<Word, 'id' | 'createdAt' | 'reviewCount' | 'correctCount' | 'masteryLevel' | 'nextReviewDate' | 'reviewStage' | 'easeFactor' | 'isNew'>[];
}

// 一年级上册 Unit 1-10
const grade1Semester1: WordUnit[] = [
  {
    id: 'g1s1u1',
    name: 'Unit 1 - Hello!',
    words: [
      { word: 'hello', meaning: '喂，你好', phonetic: '/həˈləʊ/', example: 'Hello, Miss Fang!', tags: ['greeting'], difficulty: 'easy' },
      { word: 'hi', meaning: '你好', phonetic: '/haɪ/', example: 'Hi, Joe!', tags: ['greeting'], difficulty: 'easy' },
      { word: 'goodbye', meaning: '再见', phonetic: '/ˌɡʊdˈbaɪ/', example: 'Goodbye, Kitty!', tags: ['greeting'], difficulty: 'easy' },
      { word: 'morning', meaning: '早晨，上午', phonetic: '/ˈmɔːnɪŋ/', example: 'Good morning!', tags: ['time'], difficulty: 'easy' },
      { word: 'afternoon', meaning: '中午，下午', phonetic: '/ˌɑːftəˈnuːn/', example: 'Good afternoon!', tags: ['time'], difficulty: 'easy' },
      { word: 'evening', meaning: '晚上', phonetic: '/ˈiːvnɪŋ/', example: 'Good evening!', tags: ['time'], difficulty: 'easy' },
      { word: 'night', meaning: '深夜', phonetic: '/naɪt/', example: 'Good night!', tags: ['time'], difficulty: 'easy' },
      { word: 'nice', meaning: '好的', phonetic: '/naɪs/', example: 'Nice to meet you.', tags: ['adj'], difficulty: 'easy' },
      { word: 'see', meaning: '看见', phonetic: '/siː/', example: 'See you!', tags: ['verb'], difficulty: 'easy' },
      { word: 'you', meaning: '你', phonetic: '/juː/', example: 'How are you?', tags: ['pronoun'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u2',
    name: 'Unit 2 - My classmates',
    words: [
      { word: 'give', meaning: '给', phonetic: '/ɡɪv/', example: 'Give me a book.', tags: ['verb'], difficulty: 'easy' },
      { word: 'me', meaning: '我', phonetic: '/miː/', example: 'Give me a ruler.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'a', meaning: '一，一个', phonetic: '/ə/', example: 'a book', tags: ['article'], difficulty: 'easy' },
      { word: 'please', meaning: '请', phonetic: '/pliːz/', example: 'Please give me a pencil.', tags: ['polite'], difficulty: 'easy' },
      { word: 'thank', meaning: '谢谢', phonetic: '/θæŋk/', example: 'Thank you!', tags: ['polite'], difficulty: 'easy' },
      { word: 'ruler', meaning: '尺子', phonetic: '/ˈruːlə/', example: 'This is my ruler.', tags: ['school'], difficulty: 'easy' },
      { word: 'book', meaning: '书', phonetic: '/bʊk/', example: 'I have a book.', tags: ['school'], difficulty: 'easy' },
      { word: 'pencil', meaning: '铅笔', phonetic: '/ˈpensl/', example: 'Show me your pencil.', tags: ['school'], difficulty: 'easy' },
      { word: 'rubber', meaning: '橡皮', phonetic: '/ˈrʌbə/', example: 'Give me a rubber.', tags: ['school'], difficulty: 'easy' },
      { word: 'how', meaning: '多么', phonetic: '/haʊ/', example: 'How nice!', tags: ['question'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u3',
    name: 'Unit 3 - My face',
    words: [
      { word: 'this', meaning: '这，这个', phonetic: '/ðɪs/', example: 'This is my face.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'is', meaning: '是', phonetic: '/ɪz/', example: 'This is me.', tags: ['verb'], difficulty: 'easy' },
      { word: 'my', meaning: '我的', phonetic: '/maɪ/', example: 'My face', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'your', meaning: '你的', phonetic: '/jɔː/', example: 'Touch your nose.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'touch', meaning: '摸摸', phonetic: '/tʌtʃ/', example: 'Touch your face.', tags: ['verb'], difficulty: 'easy' },
      { word: 'face', meaning: '脸', phonetic: '/feɪs/', example: 'Wash your face.', tags: ['body'], difficulty: 'easy' },
      { word: 'mouth', meaning: '嘴巴', phonetic: '/maʊθ/', example: 'Open your mouth.', tags: ['body'], difficulty: 'easy' },
      { word: 'nose', meaning: '鼻子', phonetic: '/nəʊz/', example: 'Touch your nose.', tags: ['body'], difficulty: 'easy' },
      { word: 'eye', meaning: '眼睛', phonetic: '/aɪ/', example: 'Close your eyes.', tags: ['body'], difficulty: 'easy' },
      { word: 'ear', meaning: '耳朵', phonetic: '/ɪə/', example: 'Touch your ears.', tags: ['body'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u4',
    name: 'Unit 4 - I can sing',
    words: [
      { word: 'I', meaning: '我', phonetic: '/aɪ/', example: 'I can sing.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'what', meaning: '什么', phonetic: '/wɒt/', example: 'What can you do?', tags: ['question'], difficulty: 'easy' },
      { word: 'can', meaning: '会，能', phonetic: '/kæn/', example: 'I can dance.', tags: ['verb'], difficulty: 'easy' },
      { word: 'sing', meaning: '唱歌', phonetic: '/sɪŋ/', example: 'I can sing ABC.', tags: ['verb'], difficulty: 'easy' },
      { word: 'dance', meaning: '跳舞', phonetic: '/dɑːns/', example: 'I can dance.', tags: ['verb'], difficulty: 'easy' },
      { word: 'read', meaning: '阅读', phonetic: '/riːd/', example: 'I can read.', tags: ['verb'], difficulty: 'easy' },
      { word: 'draw', meaning: '画画', phonetic: '/drɔː/', example: 'I can draw.', tags: ['verb'], difficulty: 'easy' },
      { word: 'flower', meaning: '花', phonetic: '/ˈflaʊə/', example: 'A red flower.', tags: ['nature'], difficulty: 'easy' },
      { word: 'house', meaning: '房子', phonetic: '/haʊs/', example: 'This is my house.', tags: ['home'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u6',
    name: 'Unit 6 - My friends',
    words: [
      { word: 'who', meaning: '谁', phonetic: '/huː/', example: 'Who is he?', tags: ['question'], difficulty: 'easy' },
      { word: 'she', meaning: '她', phonetic: '/ʃiː/', example: 'She is my friend.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'he', meaning: '他', phonetic: '/hiː/', example: 'He is my brother.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'grandfather', meaning: '爷爷', phonetic: '/ˈɡrænfɑːðə/', example: 'My grandfather is old.', tags: ['family'], difficulty: 'medium' },
      { word: 'grandmother', meaning: '奶奶', phonetic: '/ˈɡrænmʌðə/', example: 'My grandmother is kind.', tags: ['family'], difficulty: 'medium' },
      { word: 'father', meaning: '父亲', phonetic: '/ˈfɑːðə/', example: 'My father is tall.', tags: ['family'], difficulty: 'easy' },
      { word: 'mother', meaning: '母亲', phonetic: '/ˈmʌðə/', example: 'My mother is beautiful.', tags: ['family'], difficulty: 'easy' },
      { word: 'sister', meaning: '姐，妹', phonetic: '/ˈsɪstə/', example: 'My sister is cute.', tags: ['family'], difficulty: 'easy' },
      { word: 'brother', meaning: '兄，弟', phonetic: '/ˈbrʌðə/', example: 'My brother is strong.', tags: ['family'], difficulty: 'easy' },
      { word: 'baby', meaning: '宝贝', phonetic: '/ˈbeɪbi/', example: 'The baby is small.', tags: ['family'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u7',
    name: 'Unit 7 - Let\'s count',
    words: [
      { word: 'one', meaning: '一', phonetic: '/wʌn/', example: 'I have one book.', tags: ['number'], difficulty: 'easy' },
      { word: 'two', meaning: '二', phonetic: '/tuː/', example: 'Two apples.', tags: ['number'], difficulty: 'easy' },
      { word: 'three', meaning: '三', phonetic: '/θriː/', example: 'Three cats.', tags: ['number'], difficulty: 'easy' },
      { word: 'four', meaning: '四', phonetic: '/fɔː/', example: 'Four dogs.', tags: ['number'], difficulty: 'easy' },
      { word: 'five', meaning: '五', phonetic: '/faɪv/', example: 'Five birds.', tags: ['number'], difficulty: 'easy' },
      { word: 'six', meaning: '六', phonetic: '/sɪks/', example: 'Six fish.', tags: ['number'], difficulty: 'easy' },
      { word: 'seven', meaning: '七', phonetic: '/ˈsevn/', example: 'Seven days.', tags: ['number'], difficulty: 'easy' },
      { word: 'eight', meaning: '八', phonetic: '/eɪt/', example: 'Eight balls.', tags: ['number'], difficulty: 'easy' },
      { word: 'nine', meaning: '九', phonetic: '/naɪn/', example: 'Nine books.', tags: ['number'], difficulty: 'easy' },
      { word: 'ten', meaning: '十', phonetic: '/ten/', example: 'Ten fingers.', tags: ['number'], difficulty: 'easy' },
      { word: 'rabbit', meaning: '兔子', phonetic: '/ˈræbɪt/', example: 'A white rabbit.', tags: ['animal'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u8',
    name: 'Unit 8 - Apples, please',
    words: [
      { word: 'apple', meaning: '苹果', phonetic: '/ˈæpl/', example: 'I like apples.', tags: ['food', 'fruit'], difficulty: 'easy' },
      { word: 'pear', meaning: '梨', phonetic: '/peə/', example: 'A yellow pear.', tags: ['food', 'fruit'], difficulty: 'easy' },
      { word: 'peach', meaning: '桃子', phonetic: '/piːtʃ/', example: 'A sweet peach.', tags: ['food', 'fruit'], difficulty: 'easy' },
      { word: 'orange', meaning: '橘子', phonetic: '/ˈɒrɪndʒ/', example: 'An orange orange.', tags: ['food', 'fruit'], difficulty: 'easy' },
      { word: 'like', meaning: '喜欢', phonetic: '/laɪk/', example: 'I like apples.', tags: ['verb'], difficulty: 'easy' },
      { word: 'supermarket', meaning: '超市', phonetic: '/ˈsuːpəmɑːkɪt/', example: 'Go to the supermarket.', tags: ['place'], difficulty: 'medium' },
    ],
  },
  {
    id: 'g1s1u9',
    name: 'Unit 9 - May I have a pie?',
    words: [
      { word: 'may', meaning: '可以', phonetic: '/meɪ/', example: 'May I have a pie?', tags: ['modal'], difficulty: 'easy' },
      { word: 'have', meaning: '有，吃，喝', phonetic: '/hæv/', example: 'Have a cake.', tags: ['verb'], difficulty: 'easy' },
      { word: 'hamburger', meaning: '汉堡包', phonetic: '/ˈhæmbɜːɡə/', example: 'A big hamburger.', tags: ['food'], difficulty: 'medium' },
      { word: 'pizza', meaning: '披萨', phonetic: '/ˈpiːtsə/', example: 'I like pizza.', tags: ['food'], difficulty: 'easy' },
      { word: 'cake', meaning: '蛋糕', phonetic: '/keɪk/', example: 'A birthday cake.', tags: ['food'], difficulty: 'easy' },
      { word: 'pie', meaning: '派', phonetic: '/paɪ/', example: 'An apple pie.', tags: ['food'], difficulty: 'easy' },
      { word: 'banana', meaning: '香蕉', phonetic: '/bəˈnɑːnə/', example: 'A yellow banana.', tags: ['food', 'fruit'], difficulty: 'easy' },
      { word: 'soup', meaning: '汤', phonetic: '/suːp/', example: 'Hot soup.', tags: ['food'], difficulty: 'easy' },
    ],
  },
  {
    id: 'g1s1u10',
    name: 'Unit 10 - On the farm',
    words: [
      { word: 'farm', meaning: '农场', phonetic: '/fɑːm/', example: 'On the farm.', tags: ['place'], difficulty: 'easy' },
      { word: 'that', meaning: '那，那个', phonetic: '/ðæt/', example: 'That is a cow.', tags: ['pronoun'], difficulty: 'easy' },
      { word: 'chick', meaning: '小鸡', phonetic: '/tʃɪk/', example: 'A yellow chick.', tags: ['animal'], difficulty: 'easy' },
      { word: 'duck', meaning: '鸭子', phonetic: '/dʌk/', example: 'A yellow duck.', tags: ['animal'], difficulty: 'easy' },
      { word: 'cow', meaning: '奶牛', phonetic: '/kaʊ/', example: 'A black and white cow.', tags: ['animal'], difficulty: 'easy' },
      { word: 'pig', meaning: '猪', phonetic: '/pɪɡ/', example: 'A pink pig.', tags: ['animal'], difficulty: 'easy' },
    ],
  },
];

// 所有词库
export const wordBooks: WordBook[] = [
  {
    id: 'hj-sz-g1s1',
    name: '一年级上册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 1,
    semester: 1,
    units: grade1Semester1,
    icon: '🎒',
    color: '#FF6B6B',
  },
  {
    id: 'hj-sz-g1s2',
    name: '一年级下册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 1,
    semester: 2,
    units: [], // 待补充
    icon: '🌸',
    color: '#4ECDC4',
  },
  {
    id: 'hj-sz-g2s1',
    name: '二年级上册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 2,
    semester: 1,
    units: [], // 待补充
    icon: '📚',
    color: '#45B7D1',
  },
  {
    id: 'hj-sz-g2s2',
    name: '二年级下册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 2,
    semester: 2,
    units: [], // 待补充
    icon: '🌈',
    color: '#96CEB4',
  },
  {
    id: 'hj-sz-g3s1',
    name: '三年级上册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 3,
    semester: 1,
    units: [], // 待补充
    icon: '🚀',
    color: '#FFEAA7',
  },
  {
    id: 'hj-sz-g3s2',
    name: '三年级下册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 3,
    semester: 2,
    units: [], // 待补充
    icon: '🦋',
    color: '#DDA0DD',
  },
  {
    id: 'hj-sz-g4s1',
    name: '四年级上册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 4,
    semester: 1,
    units: [], // 待补充
    icon: '🎯',
    color: '#98D8C8',
  },
  {
    id: 'hj-sz-g4s2',
    name: '四年级下册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 4,
    semester: 2,
    units: [], // 待补充
    icon: '⭐',
    color: '#F7DC6F',
  },
  {
    id: 'hj-sz-g5s1',
    name: '五年级上册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 5,
    semester: 1,
    units: [], // 待补充
    icon: '🏆',
    color: '#BB8FCE',
  },
  {
    id: 'hj-sz-g5s2',
    name: '五年级下册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 5,
    semester: 2,
    units: [], // 待补充
    icon: '🌟',
    color: '#85C1E9',
  },
  {
    id: 'hj-sz-g6s1',
    name: '六年级上册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 6,
    semester: 1,
    units: [], // 待补充
    icon: '🎓',
    color: '#F8B195',
  },
  {
    id: 'hj-sz-g6s2',
    name: '六年级下册',
    publisher: '上海教育出版社',
    region: '深圳',
    grade: 6,
    semester: 2,
    units: [], // 待补充
    icon: '👑',
    color: '#A8E6CF',
  },
];

// 根据年级获取词库
export function getBooksByGrade(grade: number): WordBook[] {
  return wordBooks.filter(book => book.grade === grade);
}

// 获取所有年级
export function getAllGrades(): number[] {
  return [...new Set(wordBooks.map(book => book.grade))].sort();
}

// 根据ID获取词库
export function getBookById(id: string): WordBook | undefined {
  return wordBooks.find(book => book.id === id);
}

// 获取词库中所有单词
export function getAllWordsFromBook(bookId: string): Word['word'][] {
  const book = getBookById(bookId);
  if (!book) return [];
  return book.units.flatMap(unit => unit.words.map(w => w.word));
}
