import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 1, あたらしいともだち (New Friends): saying who and what you are, asking, and の.
export const LESSON_1: GrammarLesson = {
  id: 'genki-1',
  lesson: 1,
  title: 'New Friends',
  goal: 'Say who you are, ask about others, and say whose: I am Mary. What is your major?',
  points: [
    {
      title: 'X は Y です',
      text: 'X は Y です means "X is Y". は marks the topic, what you are talking about, and is read "wa". です ends the sentence politely, like "is" or "am". Once the topic is clear, it is often left out: がくせいです can mean "I am a student".',
      examples: [
        { ja: '私[わたし]は学生[がくせい]です。', en: 'I am a student.' },
        { ja: 'たけしさんは日本人[にほんじん]です。', en: 'Takeshi is Japanese.' },
      ],
      say: [
        s('I am {name}.', '私[わたし] は {name} です。'),
        s('I am a student.', '私[わたし] は 学生[がくせい] です。'),
        s('Mary is an international student.', 'メアリー さん は 留学生[りゅうがくせい] です。', 'Add さん to other people’s names, never to your own.'),
        s('Takeshi is a fourth-year student.', 'たけし さん は 四[よん]年生[ねんせい] です。', 'Fourth-year is usually said よねんせい; よんねんせい is heard too.'),
        s('(I am) a first-year student.', '一年生[いちねんせい] です。'),
        s('It is one o’clock.', '一時[いちじ] です。'),
        s('It is half past two.', '二時半[にじはん] です。'),
        s('I am nineteen years old.', '十九[じゅうきゅう] 歳[さい] です。'),
        s('My major is economics.', '専攻[せんこう] は 経済[けいざい] です。'),
        s('Takeshi is a college student.', 'たけし さん は 大学生[だいがくせい] です。'),
      ],
    },
    {
      title: 'Questions with か',
      text: 'Add か to the end of a sentence to make it a question. The word order stays the same. To ask what, put なん (what) where the answer would go: なんじ (what time), なんさい (how old), なんねんせい (what year).',
      examples: [
        { ja: '留学生[りゅうがくせい]ですか。', en: 'Are you an international student?' },
        { ja: '今[いま]何[なん]時[じ]ですか。', en: 'What time is it now?' },
        { ja: 'いいえ、日本人[にほんじん]です。', en: 'No, I am Japanese.' },
      ],
      say: [
        s('Are you a student?', '学生[がくせい] です か。'),
        s('Is Mary American?', 'メアリー さん は アメリカ人[じん] です か。'),
        s('What time is it now?', '今[いま] 何[なん]時[じ] です か。'),
        s('How old are you?', '何[なん]歳[さい] です か。'),
        s('What year are you (in school)?', '何[なん]年生[ねんせい] です か。'),
        s('Yes, that’s right.', 'はい、そう です。'),
        s('No, I am Korean.', 'いいえ、韓国[かんこく]人[じん] です。'),
        s('Is Professor Yamashita a teacher of Japanese?', 'やました 先生[せんせい] は 日本語[にほんご] の 先生[せんせい] です か。'),
        s('I see.', 'そう です か。'),
      ],
    },
    {
      title: 'Noun の noun',
      text: 'の joins two nouns: A の B is "B of A", or "A’s B". わたしの でんわ is my telephone; にほんごの せんせい is a teacher of Japanese; にほん だいがくの がくせい is a student at Nihon University. The noun that comes second is the one you mean.',
      examples: [
        { ja: '私[わたし]の名前[なまえ]はメアリーです。', en: 'My name is Mary.' },
        { ja: 'たけしさんの専攻[せんこう]は歴史[れきし]です。', en: 'Takeshi’s major is history.' },
        { ja: '日本語[にほんご]の先生[せんせい]です。', en: 'She is a teacher of Japanese.' },
      ],
      say: [
        s('My name is {name}.', '私[わたし] の 名前[なまえ] は {name} です。'),
        s('My major is Japanese.', '私[わたし] の 専攻[せんこう] は 日本語[にほんご] です。'),
        s('What is your major?', '専攻[せんこう] は 何[なん] です か。'),
        s('My friend is Japanese.', '私[わたし] の 友達[ともだち] は 日本人[にほんじん] です。'),
        s('I am a student at Nihon University.', '日本[にほん] 大学[だいがく] の 学生[がくせい] です。'),
        s('Takeshi’s mother is a lawyer.', 'たけし さん の お母[かあ]さん は 弁護士[べんごし] です。'),
        s('My father is a company employee.', '私[わたし] の お父[とう]さん は 会社員[かいしゃいん] です。'),
        s('What is Takeshi’s telephone number?', 'たけし さん の 電話[でんわ] 番号[ばんごう] は 何[なん]番[ばん] です か。'),
        s('My older sister is a graduate student.', '私[わたし] の お姉[ねえ]さん は 大学院生[だいがくいんせい] です。'),
      ],
    },
  ],
};
