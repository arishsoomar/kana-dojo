import type { Phrase } from '@/core/reading';

// Everyday phrases for the reading room, in kana, with spaces between words as in beginners'
// books. Particles read differently (は as wa, へ as e, を as o) are in brackets. Every
// meaning is different, so each question has one answer (checked in phrases.test.ts).
export const PHRASES: readonly Phrase[] = [
  // Greetings and everyday words
  { text: 'こんにち[は]', meaning: 'Hello.' },
  { text: 'こんばん[は]', meaning: 'Good evening.' },
  { text: 'おはよう', meaning: 'Good morning.' },
  { text: 'おやすみ', meaning: 'Good night.' },
  { text: 'さようなら', meaning: 'Goodbye.' },
  { text: 'また あした', meaning: 'See you tomorrow.' },
  { text: 'ありがとう', meaning: 'Thank you.' },
  { text: 'すみません', meaning: 'Excuse me.' },
  { text: 'ごめんなさい', meaning: "I'm sorry." },
  { text: 'はい', meaning: 'Yes.' },
  { text: 'いいえ', meaning: 'No.' },
  { text: 'はじめまして', meaning: 'Nice to meet you.' },
  { text: 'いただきます', meaning: "Let's eat! (before a meal)" },
  { text: 'ごちそうさま', meaning: 'Thanks for the meal.' },
  { text: 'いって きます', meaning: "I'm off! (leaving home)" },
  { text: 'ただいま', meaning: "I'm home!" },
  { text: 'おかえり', meaning: 'Welcome home.' },
  // Short sentences
  { text: 'みず[を] ください', meaning: 'Water, please.' },
  { text: 'これ[は] なん ですか', meaning: 'What is this?' },
  { text: 'トイレ[は] どこ ですか', meaning: 'Where is the toilet?' },
  { text: 'いくら ですか', meaning: 'How much is it?' },
  { text: 'えき[へ] いきます', meaning: "I'm going to the station." },
  { text: 'わたし[は] がくせい です', meaning: "I'm a student." },
  { text: 'ねこが すき です', meaning: 'I like cats.' },
  { text: 'おいしい です', meaning: "It's delicious." },
  { text: 'にほんご[を] べんきょう します', meaning: 'I study Japanese.' },
  { text: 'コーヒー[を] のみます', meaning: 'I drink coffee.' },
  { text: 'がっこう[へ] いきます', meaning: "I'm going to school." },
];
