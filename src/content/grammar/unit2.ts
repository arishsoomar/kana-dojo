import type { GrammarLesson } from '@/core/grammar';

// Unit 2: verbs. The ます form and its negative, the three kinds of verbs, を, where (に, へ,
// で), time words, invitations, and how often. (The order of Genki I's third chapter; the
// words and sentences are our own.)
export const UNIT_2: readonly GrammarLesson[] = [
  {
    id: 'masu',
    unit: 2,
    title: 'Verbs: ます and ません',
    goal: "Say what you do, and what you don't: I'll go, I won't drink.",
    sections: [
      {
        title: 'The ます form',
        text: 'Japanese verbs come at the end of the sentence. In polite speech they end in ます: たべます is "I eat", and also "I will eat". The same form covers habits, now, and the future.',
        examples: [
          { ja: '食[た]べます。', en: "I eat. / I'll eat." },
          { ja: '明日[あした]行[い]きます。', en: "I'll go tomorrow." },
          { ja: '今日[きょう]は帰[かえ]ります。', en: "Today I'm going home." },
        ],
      },
      {
        title: 'ません: not',
        text: 'For the negative, change ます to ません: たべません is "I don\'t eat" or "I won\'t eat".',
        examples: [
          { ja: '行[い]きません。', en: "I'm not going." },
          { ja: '今日[きょう]は飲[の]みません。', en: "I'm not drinking today." },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '食べる', reading: 'たべる', pos: ['v1'], form: 'masu', prompt: 'Make it polite', explain: 'たべる drops る and adds ます: たべます.' },
      { kind: 'form', word: '飲む', reading: 'のむ', pos: ['v5m'], form: 'masen', prompt: 'Polite and negative', explain: 'む becomes み, then ません: のみません.' },
      { kind: 'choose', prompt: '明日[あした]行[い]き＿。', en: "I'll go tomorrow.", options: ['ます', 'ません', 'です', 'か'], answer: 'ます', explain: 'いきます: I will go.' },
      {
        kind: 'meaning',
        ja: '今日[きょう]は帰[かえ]りません。',
        options: ["I'm not going home today.", 'I went home today.', "I'll go home today.", "I'm not going out today."],
        answer: "I'm not going home today.",
        explain: 'かえりません: not going home.',
      },
      { kind: 'form', word: '見る', reading: 'みる', pos: ['v1'], form: 'masu', prompt: 'Make it polite', explain: 'みる drops る: みます.' },
    ],
    words: ['食べる', '明日', '行く', '今日', '帰る', '飲む', '見る'],
  },
  {
    id: 'verb-kinds',
    unit: 2,
    title: 'Three kinds of verbs',
    goal: 'Make the ます form of any verb.',
    sections: [
      {
        title: 'る-verbs',
        text: 'Verbs like たべる and みる drop る and add ます: たべます, みます.',
        examples: [
          { ja: '見[み]ます。', en: "I'll watch." },
          { ja: '寝[ね]ます。', en: "I'm going to bed." },
          { ja: '起[お]きます。', en: "I'll get up." },
        ],
      },
      {
        title: 'う-verbs',
        text: 'Most other verbs change their last sound to the i-sound, then add ます: のむ becomes のみます, かく becomes かきます, はなす becomes はなします. Some of these end in る too, like かえる (to go home): かえります, not かえます. Which kind a verb is, you learn with the verb.',
        examples: [
          { ja: '書[か]きます。', en: "I'll write." },
          { ja: '話[はな]します。', en: "I'll talk." },
          { ja: '帰[かえ]ります。', en: "I'll go home." },
        ],
      },
      {
        title: 'する and くる',
        text: 'Two verbs are irregular. する (to do) becomes します, and くる (to come) becomes きます. する also turns nouns into verbs: べんきょうする, to study.',
        examples: [
          { ja: '勉強[べんきょう]します。', en: "I'll study." },
          { ja: '友達[ともだち]が来[き]ます。', en: 'A friend is coming.' },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '書く', reading: 'かく', pos: ['v5k'], form: 'masu', prompt: 'Make it polite', explain: 'く becomes き: かきます.' },
      { kind: 'form', word: '帰る', reading: 'かえる', pos: ['v5r'], form: 'masu', prompt: 'Make it polite', explain: 'かえる is an う-verb: かえります, not かえます.' },
      { kind: 'form', word: '起きる', reading: 'おきる', pos: ['v1'], form: 'masu', prompt: 'Make it polite', explain: 'おきる is a る-verb: おきます.' },
      { kind: 'form', word: 'する', reading: 'する', pos: ['vs-i'], form: 'masu', prompt: 'Make it polite', explain: 'する is irregular: します.' },
      { kind: 'form', word: '来る', reading: 'くる', pos: ['vk'], form: 'masu', prompt: 'Make it polite', explain: 'くる is irregular: きます.' },
      { kind: 'form', word: '待つ', reading: 'まつ', pos: ['v5t'], form: 'masen', prompt: 'Polite and negative', explain: 'つ becomes ち: まちません.' },
    ],
    words: ['見る', '寝る', '起きる', '書く', '話す', '帰る', '勉強', '友達', '来る', '待つ'],
  },
  {
    id: 'wo',
    unit: 2,
    title: 'を: what you do it to',
    goal: 'Say what you eat, drink, read and watch.',
    sections: [
      {
        title: 'を marks the object',
        text: 'を comes after the thing a verb is done to: みずをのみます, "I drink water". It is read "o".',
        examples: [
          { ja: '水[みず]を飲[の]みます。', en: 'I drink water.' },
          { ja: '本[ほん]を読[よ]みます。', en: 'I read books.' },
          { ja: 'テレビを見[み]ます。', en: 'I watch TV.' },
        ],
      },
      {
        title: 'The order',
        text: 'The verb stays at the end. What it is done to comes just before, with を.',
        examples: [
          { ja: '私[わたし]は手紙[てがみ]を書[か]きます。', en: "I'll write a letter." },
          { ja: '音楽[おんがく]を聞[き]きます。', en: 'I listen to music.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '水[みず]＿飲[の]みます。', en: 'I drink water.', options: ['を', 'は', 'に', 'で'], answer: 'を', explain: 'を marks what you drink.' },
      { kind: 'order', en: 'I watch TV every day.', pieces: ['毎日[まいにち]', 'テレビを', '見[み]ます。'], explain: 'Time, then what, then the verb.' },
      {
        kind: 'meaning',
        ja: '音楽[おんがく]を聞[き]きます。',
        options: ['I listen to music.', 'I play music.', 'I read a book.', 'I watch TV.'],
        answer: 'I listen to music.',
        explain: 'きく: to listen; おんがく: music.',
      },
      { kind: 'form', word: '読む', reading: 'よむ', pos: ['v5m'], form: 'masu', prompt: 'Make it polite', explain: 'む becomes み: よみます.' },
      { kind: 'choose', prompt: '写真[しゃしん]＿見[み]ます。', en: 'I look at photos.', options: ['を', 'が', 'に', 'は'], answer: 'を', explain: 'を: what you look at.' },
    ],
    words: ['水', '飲む', '本', '読む', 'テレビ', '見る', '私', '手紙', '書く', '音楽', '聞く', '毎日', '写真'],
  },
  {
    id: 'ni-de',
    unit: 2,
    title: 'に, へ and で: where',
    goal: 'Say where you go, and where you do things.',
    sections: [
      {
        title: 'に and へ: going to',
        text: 'With verbs of going and coming, に or へ marks where to: がっこうにいきます, "I go to school". へ is read "e" here. Both are right; に is more common.',
        examples: [
          { ja: '学校[がっこう]に行[い]きます。', en: 'I go to school.' },
          { ja: '家[いえ]へ帰[かえ]ります。', en: 'I go home.' },
          { ja: '会社[かいしゃ]に来[き]ます。', en: '(He) comes to the office.' },
        ],
      },
      {
        title: 'で: where it happens',
        text: 'で marks the place where something is done: いえでほんをよみます, "I read at home".',
        examples: [
          { ja: '家[いえ]で本[ほん]を読[よ]みます。', en: 'I read at home.' },
          { ja: '店[みせ]でパンを買[か]います。', en: 'I buy bread at the shop.' },
          { ja: '公園[こうえん]で遊[あそ]びます。', en: '(They) play in the park.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '学校[がっこう]＿行[い]きます。', en: 'I go to school.', options: ['に', 'で', 'を', 'は'], answer: 'に', explain: 'Going to a place: に (or へ).' },
      { kind: 'choose', prompt: '家[いえ]＿本[ほん]を読[よ]みます。', en: 'I read at home.', options: ['で', 'に', 'を', 'へ'], answer: 'で', explain: 'Where something is done: で.' },
      { kind: 'choose', prompt: '店[みせ]＿パンを買[か]います。', en: 'I buy bread at the shop.', options: ['で', 'に', 'へ', 'を'], answer: 'で', explain: 'Buying happens at the shop: で.' },
      {
        kind: 'meaning',
        ja: '駅[えき]に行[い]きます。',
        options: ["I'm going to the station.", "I'm at the station.", "I'm coming from the station.", 'I wait at the station.'],
        answer: "I'm going to the station.",
        explain: 'えきにいきます: going to the station.',
      },
      { kind: 'order', en: 'I drink coffee at the shop.', pieces: ['店[みせ]で', 'コーヒーを', '飲[の]みます。'], explain: 'Where, what, then the verb.' },
    ],
    words: ['学校', '行く', '家', '帰る', '会社', '来る', '本', '読む', '店', 'パン', '買う', '公園', '遊ぶ', '駅', 'コーヒー', '飲む'],
  },
  {
    id: 'time',
    unit: 2,
    title: 'When: time words',
    goal: 'Say when you do things: today, tomorrow, every day.',
    sections: [
      {
        title: 'Today, tomorrow, every day',
        text: 'Words like きょう (today), あした (tomorrow) and まいにち (every day) usually go near the start, with no particle after them.',
        examples: [
          { ja: '今日[きょう]学校[がっこう]に行[い]きます。', en: "I'm going to school today." },
          { ja: '毎日[まいにち]勉強[べんきょう]します。', en: 'I study every day.' },
          { ja: '明日[あした]友達[ともだち]に会[あ]います。', en: "I'll meet a friend tomorrow." },
        ],
      },
      {
        title: 'Morning and night',
        text: 'あさ (morning) and よる (night) work the same way. Clock times and days of the week are different: they take に, as in しちじに (at seven) and にちようびに (on Sunday).',
        examples: [
          { ja: '朝[あさ]コーヒーを飲[の]みます。', en: 'I drink coffee in the morning.' },
          { ja: '夜[よる]テレビを見[み]ます。', en: 'I watch TV at night.' },
        ],
      },
    ],
    exercises: [
      {
        kind: 'meaning',
        ja: '毎日[まいにち]勉強[べんきょう]します。',
        options: ['I study every day.', 'I studied today.', "I don't study every day.", "I'll study tomorrow."],
        answer: 'I study every day.',
        explain: 'まいにち: every day.',
      },
      { kind: 'choose', prompt: '＿友達[ともだち]に会[あ]います。', en: "I'll meet a friend tomorrow.", options: ['明日[あした]', '今日[きょう]', '毎日[まいにち]', '夜[よる]'], answer: '明日[あした]', explain: 'あした: tomorrow.' },
      { kind: 'order', en: 'I watch TV at night.', pieces: ['夜[よる]', 'テレビを', '見[み]ます。'], explain: 'When, what, then the verb.' },
      { kind: 'form', word: '会う', reading: 'あう', pos: ['v5u'], form: 'masu', prompt: 'Make it polite', explain: 'う becomes い: あいます.' },
      { kind: 'form', word: '勉強する', reading: 'べんきょうする', pos: ['vs-i'], form: 'masen', prompt: 'Polite and negative', explain: 'する becomes しません: べんきょうしません.' },
    ],
    words: ['今日', '学校', '行く', '毎日', '勉強', '明日', '友達', '会う', '朝', 'コーヒー', '飲む', '夜', 'テレビ', '見る'],
  },
  {
    id: 'masenka',
    unit: 2,
    title: 'Invitations: ませんか and ましょう',
    goal: "Invite someone, and say let's.",
    sections: [
      {
        title: "Won't you...? ませんか",
        text: 'To invite someone, ask in the negative: いっしょにたべませんか, "won\'t you eat with me?". It sounds softer than a plain question.',
        examples: [
          { ja: '一緒[いっしょ]に食[た]べませんか。', en: 'Would you like to eat together?' },
          { ja: '映画[えいが]を見[み]ませんか。', en: 'Want to watch a movie?' },
        ],
      },
      {
        title: "Let's: ましょう",
        text: 'ましょう means "let\'s": いきましょう, "let\'s go". It is also how you say yes to an invitation.',
        examples: [
          { ja: '行[い]きましょう。', en: "Let's go." },
          { ja: 'いいですね。飲[の]みましょう。', en: "Sounds good. Let's have a drink." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '一緒[いっしょ]に食[た]べ＿。', en: 'Would you like to eat together?', options: ['ませんか', 'ましょう', 'ます', 'ません'], answer: 'ませんか', explain: 'ませんか: won\'t you...?' },
      { kind: 'choose', prompt: '行[い]き＿。', en: "Let's go.", options: ['ましょう', 'ませんか', 'ます', 'ません'], answer: 'ましょう', explain: 'ましょう: let\'s.' },
      {
        kind: 'meaning',
        ja: '映画[えいが]を見[み]ませんか。',
        options: ['Want to watch a movie?', "I don't watch movies.", "Let's watch a movie.", 'I watched a movie.'],
        answer: 'Want to watch a movie?',
        explain: 'ませんか: an invitation.',
      },
      { kind: 'order', en: 'Would you like to play together?', pieces: ['一緒[いっしょ]に', '遊[あそ]び', 'ませんか。'], explain: 'The verb\'s ます stem, then ませんか.' },
      {
        kind: 'meaning',
        ja: 'いいですね。飲[の]みましょう。',
        options: ["Sounds good. Let's have a drink.", "No thanks, I don't drink.", 'Would you like a drink?', 'I had a drink.'],
        answer: "Sounds good. Let's have a drink.",
        explain: 'いいですね: sounds good; のみましょう: let\'s drink.',
      },
    ],
    words: ['一緒に', '食べる', '映画', '見る', '行く', 'いい', '飲む', '遊ぶ'],
  },
  {
    id: 'how-often',
    unit: 2,
    title: 'How often: よく, 時々, 全然',
    goal: "Say how often you do things, and what you don't do at all.",
    sections: [
      {
        title: 'Often, sometimes',
        text: 'よく (often) and ときどき (sometimes) usually go just before what you do.',
        examples: [
          { ja: 'よく映画[えいが]を見[み]ます。', en: 'I often watch movies.' },
          { ja: '時々[ときどき]音楽[おんがく]を聞[き]きます。', en: 'I sometimes listen to music.' },
        ],
      },
      {
        title: 'Not at all: ぜんぜん and あまり',
        text: 'ぜんぜん (not at all) and あまり (not much) go with a negative verb: ぜんぜんのみません, "I don\'t drink at all".',
        examples: [
          { ja: 'お茶[ちゃ]は全然[ぜんぜん]飲[の]みません。', en: "I don't drink tea at all." },
          { ja: 'テレビはあまり見[み]ません。', en: "I don't watch TV much." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '＿テレビを見[み]ます。', en: 'I often watch TV.', options: ['よく', '全然[ぜんぜん]', 'あまり', 'いつ'], answer: 'よく', explain: 'よく: often.' },
      { kind: 'choose', prompt: '全然[ぜんぜん]飲[の]み＿。', en: "I don't drink at all.", options: ['ません', 'ます', 'ましょう', 'ませんか'], answer: 'ません', explain: 'ぜんぜん goes with a negative verb.' },
      {
        kind: 'meaning',
        ja: '時々[ときどき]音楽[おんがく]を聞[き]きます。',
        options: ['I sometimes listen to music.', 'I often listen to music.', "I don't listen to music much.", 'I listen to music every day.'],
        answer: 'I sometimes listen to music.',
        explain: 'ときどき: sometimes.',
      },
      { kind: 'order', en: "I don't watch TV much.", pieces: ['テレビは', 'あまり', '見[み]ません。'], explain: 'あまり before a negative verb: not much.' },
      {
        kind: 'meaning',
        ja: 'よく本[ほん]を読[よ]みます。',
        options: ['I often read books.', 'I sometimes read books.', "I don't read books.", 'I read a book today.'],
        answer: 'I often read books.',
        explain: 'よく: often.',
      },
    ],
    words: ['よく', '映画', '見る', '時々', '音楽', '聞く', 'お茶', '全然', '飲む', 'テレビ', 'あまり', '本', '読む'],
  },
];
