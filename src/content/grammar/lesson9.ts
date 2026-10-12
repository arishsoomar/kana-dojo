import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 9, かぶき (Kabuki): short forms in the past, and what they're for: casual
// speech, I think, someone said; describing nouns with verbs; already and not yet; and reasons.
export const LESSON_9: GrammarLesson = {
  id: 'genki-9',
  lesson: 9,
  title: 'Kabuki',
  goal: 'Talk about the past casually, describe people by what they do: The person playing the piano is Takeshi.',
  points: [
    {
      title: 'Short forms (past)',
      text: 'The short past of a verb is the て-form with た for て (だ for で): たべた, のんだ, いった, した, きた. "Didn’t" turns ない into なかった: たべなかった. い-adjectives: たかかった, たかくなかった (いい → よかった). な-adjectives and nouns: しずかだった, がくせいだった; じゃなかった.',
      examples: [
        { ja: '食[た]べた、食[た]べなかった', en: 'ate, didn’t eat' },
        { ja: '行[い]った、行[い]かなかった', en: 'went, didn’t go' },
        { ja: '元気[げんき]だった、元気[げんき]じゃなかった', en: 'was well, wasn’t well' },
      ],
      say: [
        s('(short past) ate: たべる', '食[た]べた'),
        s('(short past) drank: のむ', '飲[の]んだ'),
        s('(short past) went: いく', '行[い]った'),
        s('(short past) did: する', 'した'),
        s('(short past) didn’t see: みる', '見[み]なかった'),
        s('(short past) was fun: たのしい', '楽[たの]しかった'),
        s('(short past) was good: いい', 'よかった', 'いい becomes よかった.'),
        s('(short past) wasn’t well: げんき', '元気[げんき] じゃ なかった'),
      ],
    },
    {
      title: 'Casual speech in the past',
      text: 'With friends, the short past is the sentence: きのう なに した? (what did you do yesterday?), えいが みた (I saw a movie).',
      examples: [
        { ja: '昨日[きのう]何[なに]した？', en: 'What did you do yesterday?' },
        { ja: '映画[えいが]見[み]た。楽[たの]しかった。', en: 'I saw a movie. It was fun.' },
      ],
      say: [
        s('(casual) What did you do yesterday?', '昨日[きのう] 何[なに] した？'),
        s('(casual) I saw a movie. It was fun.', '映画[えいが] 見[み]た。楽[たの]しかった。'),
        s('(casual) Did you take medicine?', '薬[くすり] 飲[の]んだ？'),
        s('(casual) Nope, I didn’t.', 'ううん、飲[の]まなかった。'),
        s('(casual) Was the test difficult?', '試験[しけん]、難[むずか]しかった？'),
        s('(casual) The concert was great.', 'コンサート、よかった よ。'),
      ],
    },
    {
      title: 'I think, they said: in the past',
      text: 'と おもいます and と いっていました take the short past too: もう おわったと おもいます (I think it has already ended); しけんは むずかしかったと いっていました (they said the exam was difficult).',
      examples: [
        { ja: '試験[しけん]は難[むずか]しかったと思[おも]います。', en: 'I think the exam was difficult.' },
        { ja: 'たけしさんはかぶきを見[み]たと言[い]っていました。', en: 'Takeshi said he saw kabuki.' },
      ],
      say: [
        s('I think the exam was difficult.', '試験[しけん] は 難[むずか]しかった と 思[おも]います。'),
        s('Takeshi said he saw kabuki.', 'たけし さん は 歌舞伎[かぶき] を 見[み]た と 言[い]って いました。'),
        s('I think the concert already ended.', 'コンサート は もう 終[お]わった と 思[おも]います。'),
        s('Mary said she was sick.', 'メアリー さん は 病気[びょうき] だった と 言[い]って いました。'),
        s('My friend said she didn’t take medicine.', '友達[ともだち] は 薬[くすり] を 飲[の]まなかった と 言[い]って いました。'),
      ],
    },
    {
      title: 'Describing nouns with verbs',
      text: 'A short-form verb right before a noun describes it, like "who…" or "that…" in English: ピアノを ひいている ひと, "the person (who is) playing the piano". The describing part always comes first.',
      examples: [
        { ja: 'ピアノをひいている人[ひと]はたけしさんです。', en: 'The person playing the piano is Takeshi.' },
        { ja: 'これは昨日[きのう]買[か]ったチケットです。', en: 'This is the ticket I bought yesterday.' },
      ],
      say: [
        s('The person playing the piano is Takeshi.', 'ピアノ を 弾[ひ]いて いる 人[ひと] は たけし さん です。'),
        s('This is the ticket I bought yesterday.', 'これ は 昨日[きのう] 買[か]った チケット です。'),
        s('Who is the person wearing a red hat?', '赤[あか]い 帽子[ぼうし] を かぶって いる 人[ひと] は 誰[だれ] です か。'),
        s('The person dancing over there is my friend.', 'あそこ で 踊[おど]って いる 人[ひと] は 私[わたし] の 友達[ともだち] です。'),
        s('This is the essay I wrote.', 'これ は 私[わたし] が 書[か]いた 作文[さくぶん] です。', 'Inside a describing part, the doer takes が, not は.'),
        s('I ate the boxed lunch my mother made.', '母[はは] が 作[つく]った お弁当[べんとう] を 食[た]べました。'),
      ],
    },
    {
      title: 'Already and not yet: もう and まだ',
      text: 'もう + past means "already": もう たべました. "Not yet" is まだ + ていません: まだ たべていません, "I haven’t eaten yet". (Not まだ たべませんでした.)',
      examples: [
        { ja: 'もう宿題[しゅくだい]をしましたか。', en: 'Have you done the homework yet?' },
        { ja: 'いいえ、まだしていません。', en: 'No, I haven’t done it yet.' },
      ],
      say: [
        s('Have you done the homework yet?', 'もう 宿題[しゅくだい] を しました か。'),
        s('No, I haven’t done it yet.', 'いいえ、まだ して いません。'),
        s('I already bought the ticket.', 'もう チケット を 買[か]いました。'),
        s('I haven’t memorized the words yet.', 'まだ 単語[たんご] を 覚[おぼ]えて いません。'),
        s('The class has already started.', 'もう クラス が 始[はじ]まりました。'),
        s('I haven’t written the letter yet.', 'まだ 手紙[てがみ] を 書[か]いて いません。'),
      ],
    },
    {
      title: 'Reasons: explanation から、situation',
      text: 'から can join a reason to what follows from it in one sentence, now with short forms too: ねむかったから、ねました (I was sleepy, so I went to bed). Polite or short, the reason always comes first.',
      examples: [
        { ja: '病気[びょうき]だったから、学校[がっこう]に行[い]きませんでした。', en: 'I was sick, so I didn’t go to school.' },
        { ja: 'チケットを二[ふた]つもらったから、いっしょに行[い]きませんか。', en: 'I got two tickets, so won’t you come with me?' },
      ],
      say: [
        s('I was sick, so I didn’t go to school.', '病気[びょうき] だった から、学校[がっこう] に 行[い]きませんでした。'),
        s('I got two tickets, so won’t you come with me?', 'チケット を 二[ふた]つ もらった から、一緒[いっしょ] に 行[い]きません か。'),
        s('I was lonely, so I wrote a letter.', '寂[さび]しかった から、手紙[てがみ] を 書[か]きました。'),
        s('There’s an exam tomorrow, so I’ll memorize words.', '明日[あした] 試験[しけん] が ある から、単語[たんご] を 覚[おぼ]えます。'),
        s('I like music, so I often go to concerts.', '音楽[おんがく] が 好[す]き だ から、よく コンサート に 行[い]きます。'),
      ],
    },
  ],
};
