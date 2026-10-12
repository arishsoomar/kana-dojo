import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 8, バーベキュー (Barbecue): short forms, and what they're for: casual speech, I
// think, someone said, please don't, liking doing things; the subject particle が, and
// something and nothing.
export const LESSON_8: GrammarLesson = {
  id: 'genki-8',
  lesson: 8,
  title: 'Barbecue',
  goal: 'Talk casually, give opinions and pass on what others said: I think it will rain tomorrow.',
  points: [
    {
      title: 'Short forms (present)',
      text: 'Each polite form has a short (plain) form. Verbs: the dictionary form (たべる), and for "don’t", ない: る-verbs drop る (たべない); う-verbs change their last sound to the あ row (のむ → のまない; う → わ: かう → かわない); しない, こない; ある → ない. Adjectives drop です: たかい, たかくない. な-adjectives and nouns take だ: しずかだ, がくせいだ; じゃない.',
      examples: [
        { ja: '食[た]べる、食[た]べない', en: 'eat, don’t eat' },
        { ja: '飲[の]む、飲[の]まない', en: 'drink, don’t drink' },
        { ja: '学生[がくせい]だ、学生[がくせい]じゃない', en: 'is a student, isn’t a student' },
      ],
      say: [
        s('(short form) don’t eat: たべる', '食[た]べない'),
        s('(short form) don’t drink: のむ', '飲[の]まない'),
        s('(short form) don’t buy: かう', '買[か]わない', 'う becomes わ: かわない.'),
        s('(short form) don’t do: する', 'しない'),
        s('(short form) don’t come: くる', '来[こ]ない'),
        s('(short form) there isn’t: ある', 'ない'),
        s('(short form) is quiet: しずか', '静[しず]か だ'),
        s('(short form) isn’t expensive: たかい', '高[たか]くない'),
      ],
    },
    {
      title: 'Casual speech',
      text: 'With friends and family, the short forms are the sentence: あした ひま? (free tomorrow?), うん、ひま (yeah, I’m free). だ is usually dropped, and so is か in questions: rising intonation does the asking. うん is a casual yes, ううん a casual no.',
      examples: [
        { ja: '明日[あした]暇[ひま]？うん、暇[ひま]。', en: 'Free tomorrow? Yeah, I’m free.' },
        { ja: '今日[きょう]学校[がっこう]に行[い]く？', en: 'Are you going to school today?' },
      ],
      say: [
        s('(casual) Are you free tomorrow?', '明日[あした] 暇[ひま]？'),
        s('(casual) Yeah, I’m free.', 'うん、暇[ひま]。'),
        s('(casual) Are you going to school today?', '今日[きょう] 学校[がっこう] に 行[い]く？'),
        s('(casual) Nah, I’m not going.', 'ううん、行[い]かない。'),
        s('(casual) Do you drink coffee?', 'コーヒー 飲[の]む？'),
        s('(casual) This is delicious, isn’t it?', 'これ、おいしい ね。'),
      ],
    },
    {
      title: 'I think: ～とおもいます',
      text: 'Short form + と おもいます gives your opinion or guess: "I think…". Nouns and な-adjectives keep だ: がくせいだと おもいます. "I don’t think…" is usually said by putting the short form in the negative: こないと おもいます.',
      examples: [
        { ja: '明日[あした]は雨[あめ]が降[ふ]ると思[おも]います。', en: 'I think it will rain tomorrow.' },
        { ja: 'たけしさんは来[こ]ないと思[おも]います。', en: 'I don’t think Takeshi will come.' },
      ],
      say: [
        s('I think it will rain tomorrow.', '明日[あした] は 雨[あめ] が 降[ふ]る と 思[おも]います。'),
        s('I don’t think Takeshi will come.', 'たけし さん は 来[こ]ない と 思[おも]います。'),
        s('I think Mary is busy.', 'メアリー さん は 忙[いそが]しい と 思[おも]います。'),
        s('I think that person is a teacher.', 'あの 人[ひと] は 先生[せんせい] だ と 思[おも]います。'),
        s('I think this tomato is cheap.', 'この トマト は 安[やす]い と 思[おも]います。'),
        s('I think it’s a famous place.', '有名[ゆうめい]な 所[ところ] だ と 思[おも]います。'),
      ],
    },
    {
      title: 'Someone said: ～といっていました',
      text: 'Short form + と いっていました passes on what someone said: "(they) said…". たけしさんは あした いくと いっていました, "Takeshi said he’ll go tomorrow".',
      examples: [
        { ja: 'たけしさんは明日[あした]行[い]くと言[い]っていました。', en: 'Takeshi said he will go tomorrow.' },
        { ja: '天気予報[てんきよほう]は雪[ゆき]が降[ふ]ると言[い]っていました。', en: 'The weather forecast said it will snow.' },
      ],
      say: [
        s('Takeshi said he will go tomorrow.', 'たけし さん は 明日[あした] 行[い]く と 言[い]って いました。'),
        s('The weather forecast said it will snow.', '天気予報[てんきよほう] は 雪[ゆき] が 降[ふ]る と 言[い]って いました。'),
        s('Mary said she is busy.', 'メアリー さん は 忙[いそが]しい と 言[い]って いました。'),
        s('The teacher said there is no test.', '先生[せんせい] は テスト が ない と 言[い]って いました。'),
        s('My friend said she likes karaoke.', '友達[ともだち] は カラオケ が 好[す]き だ と 言[い]って いました。'),
      ],
    },
    {
      title: 'Please don’t: ～ないでください',
      text: 'ない form + で ください asks someone not to do something: たべないでください, "please don’t eat (it)".',
      examples: [
        { ja: 'ここで写真[しゃしん]を撮[と]らないでください。', en: 'Please don’t take pictures here.' },
        { ja: '忘[わす]れないでください。', en: 'Please don’t forget.' },
      ],
      say: [
        s('Please don’t take pictures here.', 'ここ で 写真[しゃしん] を 撮[と]らないで ください。'),
        s('Please don’t forget.', '忘[わす]れないで ください。'),
        s('Please don’t throw away this magazine.', 'この 雑誌[ざっし] を 捨[す]てないで ください。'),
        s('Please don’t come tomorrow.', '明日[あした] 来[こ]ないで ください。'),
        s('Please don’t drink sake.', 'お酒[さけ] を 飲[の]まないで ください。'),
      ],
    },
    {
      title: 'Liking doing: ～のがすきです',
      text: 'To like, or be good at, doing something, put の after the dictionary form: およぐのが すきです (I like swimming), りょうりするのが じょうずです (is good at cooking). へた is "bad at".',
      examples: [
        { ja: '料理[りょうり]するのが好[す]きです。', en: 'I like cooking.' },
        { ja: 'メアリーさんは歌[うた]を歌[うた]うのが上手[じょうず]です。', en: 'Mary is good at singing.' },
      ],
      say: [
        s('I like cooking.', '料理[りょうり] する の が 好[す]き です。'),
        s('Mary is good at singing.', 'メアリー さん は 歌[うた] を 歌[うた]う の が 上手[じょうず] です。'),
        s('I don’t like cleaning.', '掃除[そうじ] する の が 好[す]き じゃ ない です。'),
        s('I’m bad at driving.', '運転[うんてん] する の が 下手[へた] です。'),
        s('I love taking pictures.', '写真[しゃしん] を 撮[と]る の が 大好[だいす]き です。'),
      ],
    },
    {
      title: 'The subject particle が',
      text: 'With a question word as the subject (だれ, なに, どれ), use が, not は: だれが いきますか. The answer keeps が: たけしさんが いきます.',
      examples: [
        { ja: 'だれがめがねをかけていますか。', en: 'Who is wearing glasses?' },
        { ja: 'たけしさんがかけています。', en: 'Takeshi is (wearing them).' },
      ],
      say: [
        s('Who is coming to the party?', '誰[だれ] が パーティー に 来[き]ます か。'),
        s('Takeshi is coming.', 'たけし さん が 来[き]ます。'),
        s('Who made this?', '誰[だれ] が これ を 作[つく]りました か。'),
        s('Which one is delicious?', 'どれ が おいしい です か。'),
        s('Mary cut the tomatoes.', 'メアリー さん が トマト を 切[き]りました。'),
      ],
    },
    {
      title: 'Something, nothing: なにか and なにも',
      text: 'なにか is "something", なにも (with a negative) "nothing". They take the place of を and が: なにか たべましたか, "did you eat something?"; なにも たべませんでした, "I didn’t eat anything".',
      examples: [
        { ja: '何[なに]か食[た]べましたか。', en: 'Did you eat something?' },
        { ja: 'いいえ、何[なに]も食[た]べませんでした。', en: 'No, I didn’t eat anything.' },
      ],
      say: [
        s('Did you eat something?', '何[なに]か 食[た]べました か。'),
        s('No, I didn’t eat anything.', 'いいえ、何[なに]も 食[た]べませんでした。'),
        s('Shall we drink something?', '何[なに]か 飲[の]みましょう か。'),
        s('I didn’t buy anything.', '何[なに]も 買[か]いませんでした。'),
        s('Is there something in the bag?', 'かばん の 中[なか] に 何[なに]か あります か。'),
      ],
    },
  ],
};
