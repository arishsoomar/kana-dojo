import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 2, かいもの (Shopping): this and that, here and there, whose, also, not, and
// ね and よ.
export const LESSON_2: GrammarLesson = {
  id: 'genki-2',
  lesson: 2,
  title: 'Shopping',
  goal: 'Point at things, ask whose and how much, say "also" and "not": This umbrella is not mine.',
  points: [
    {
      title: 'これ・それ・あれ・どれ',
      text: 'これ is "this one" near me, それ is "that one" near you, and あれ is "that one over there", away from us both. どれ asks "which one?" They stand on their own, in place of a noun.',
      examples: [
        { ja: 'これはいくらですか。', en: 'How much is this?' },
        { ja: 'それは私[わたし]のかさです。', en: 'That is my umbrella.' },
      ],
      say: [
        s('How much is this?', 'これ は いくら です か。'),
        s('That (near you) is my bag.', 'それ は 私[わたし] の かばん です。'),
        s('What is that (over there)?', 'あれ は 何[なん] です か。'),
        s('Which one is the umbrella?', '傘[かさ] は どれ です か。'),
        s('This is a watch.', 'これ は 時計[とけい] です。'),
        s('That one over there is a library.', 'あれ は 図書館[としょかん] です。'),
      ],
    },
    {
      title: 'この・その・あの・どの + noun',
      text: 'Before a noun, これ, それ, あれ and どれ become この, その, あの and どの: このほん, "this book". They can’t stand on their own.',
      examples: [
        { ja: 'このとけいはいくらですか。', en: 'How much is this watch?' },
        { ja: 'あの学生[がくせい]は留学生[りゅうがくせい]です。', en: 'That student is an international student.' },
      ],
      say: [
        s('How much is this watch?', 'この 時計[とけい] は いくら です か。'),
        s('That (near you) umbrella is 100 yen.', 'その 傘[かさ] は 百[ひゃく] 円[えん] です。'),
        s('That bicycle over there is Takeshi’s.', 'あの 自転車[じてんしゃ] は たけし さん の です。', 'たけしさんの is "Takeshi’s", with the noun left out.'),
        s('Which bag is it?', 'どの かばん です か。'),
        s('This meat is delicious.', 'この 肉[にく] は おいしい です。'),
        s('That book is expensive.', 'その 本[ほん] は 高[たか]い です。'),
      ],
    },
    {
      title: 'ここ・そこ・あそこ・どこ',
      text: 'Places work the same way: ここ is here, そこ is there (near you), あそこ is over there, and どこ asks where.',
      examples: [
        { ja: 'トイレはどこですか。', en: 'Where is the restroom?' },
        { ja: 'ぎんこうはあそこです。', en: 'The bank is over there.' },
      ],
      say: [
        s('Where is the restroom?', 'トイレ は どこ です か。'),
        s('The bank is over there.', '銀行[ぎんこう] は あそこ です。'),
        s('The post office is there (near you).', '郵便局[ゆうびんきょく] は そこ です。'),
        s('Where is the convenience store?', 'コンビニ は どこ です か。'),
        s('The library is here.', '図書館[としょかん] は ここ です。'),
      ],
    },
    {
      title: 'だれの + noun',
      text: 'だれ is "who". だれの (whose) goes before a noun: だれの かさ, "whose umbrella". Answer with the person and の: たけしさんの です, "it’s Takeshi’s".',
      examples: [
        { ja: 'これはだれのかさですか。', en: 'Whose umbrella is this?' },
        { ja: 'メアリーさんのです。', en: 'It’s Mary’s.' },
      ],
      say: [
        s('Whose umbrella is this?', 'これ は 誰[だれ] の 傘[かさ] です か。'),
        s('It’s Takeshi’s.', 'たけし さん の です。'),
        s('Whose wallet is that?', 'それ は 誰[だれ] の 財布[さいふ] です か。'),
        s('It’s mine.', '私[わたし] の です。'),
        s('Whose shoes are those over there?', 'あれ は 誰[だれ] の 靴[くつ] です か。'),
      ],
    },
    {
      title: 'Noun も',
      text: 'も means "also" or "too". It takes the place of は: たけしさんは にほんじんです, ゆいさんも にほんじんです, "Yui is Japanese too".',
      examples: [
        { ja: 'たけしさんも日本人[にほんじん]です。', en: 'Takeshi is Japanese too.' },
        { ja: 'このかさも百[ひゃく]円[えん]です。', en: 'This umbrella is also 100 yen.' },
      ],
      say: [
        s('I am a student too.', '私[わたし] も 学生[がくせい] です。'),
        s('Takeshi is Japanese too.', 'たけし さん も 日本人[にほんじん] です。'),
        s('This watch is expensive too.', 'この 時計[とけい] も 高[たか]い です。'),
        s('My major is also history.', '私[わたし] の 専攻[せんこう] も 歴史[れきし] です。'),
        s('Mary is also an international student.', 'メアリー さん も 留学生[りゅうがくせい] です。'),
      ],
    },
    {
      title: 'Noun じゃないです',
      text: 'To say "is not", change です to じゃないです: がくせいじゃないです, "I am not a student". (In writing, ではありません is also used.)',
      examples: [
        { ja: 'たけしさんは留学生[りゅうがくせい]じゃないです。', en: 'Takeshi is not an international student.' },
        { ja: 'それは私[わたし]のかさじゃないです。', en: 'That is not my umbrella.' },
      ],
      say: [
        s('I am not Japanese.', '私[わたし] は 日本人[にほんじん] じゃ ない です。'),
        s('Takeshi is not an international student.', 'たけし さん は 留学生[りゅうがくせい] じゃ ない です。'),
        s('That is not my umbrella.', 'それ は 私[わたし] の 傘[かさ] じゃ ない です。'),
        s('My major is not economics.', '私[わたし] の 専攻[せんこう] は 経済[けいざい] じゃ ない です。'),
        s('This is not meat; it is fish.', 'これ は 肉[にく] じゃ ない です。魚[さかな] です。'),
      ],
    },
    {
      title: 'ね and よ',
      text: 'At the end of a sentence, ね asks for agreement or shares a feeling: "…, isn’t it?", "…, right?". よ tells the listener something they don’t know: "…, you know.", "I tell you, …".',
      examples: [
        { ja: 'このとんかつはおいしいですね。', en: 'This pork cutlet is delicious, isn’t it?' },
        { ja: 'メアリーさんは留学生[りゅうがくせい]ですよ。', en: 'Mary is an international student, you know.' },
      ],
      say: [
        s('This pork cutlet is delicious, isn’t it?', 'この とんかつ は おいしい です ね。'),
        s('That watch is expensive, isn’t it?', 'その 時計[とけい] は 高[たか]い です ね。'),
        s('Takeshi is a fourth-year student, you know.', 'たけし さん は 四[よん]年生[ねんせい] です よ。'),
        s('It’s not my umbrella, you know.', '私[わたし] の 傘[かさ] じゃ ない です よ。'),
        s('Mary is American, right?', 'メアリー さん は アメリカ人[じん] です ね。'),
      ],
    },
  ],
};
