import type { GrammarLesson } from '@/core/grammar';

// Unit 6: short forms. The dictionary form and ない, the short past, casual speech, and the
// short forms at work inside sentences: と思います and と言っていました. (The order of Genki
// I's eighth and ninth chapters; the words and sentences are our own.)
export const UNIT_6: readonly GrammarLesson[] = [
  {
    id: 'short-present',
    unit: 6,
    title: 'Short forms: the dictionary form and ない',
    goal: 'Make the short forms of verbs, for casual speech.',
    sections: [
      {
        title: 'Short and long',
        text: 'Every verb has a polite long form (たべます) and a short form. The short present is the dictionary form: たべる. Friends use short forms with each other, and they go inside longer sentences.',
        examples: [
          { ja: '食[た]べる', en: 'eat (short form)' },
          { ja: '行[い]く', en: 'go (short form)' },
        ],
      },
      {
        title: 'The short negative: ない',
        text: 'る-verbs swap る for ない: たべない. う-verbs change their last sound to the a-sound, then add ない: のむ becomes のまない, かく becomes かかない. A verb ending in う takes わ: かう becomes かわない. する becomes しない, くる becomes こない, and ある becomes just ない.',
        examples: [
          { ja: '食[た]べない', en: "don't eat" },
          { ja: '飲[の]まない', en: "don't drink" },
          { ja: '買[か]わない', en: "don't buy" },
          { ja: 'しない、来[こ]ない', en: "don't do, don't come" },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '食べる', reading: 'たべる', pos: ['v1'], form: 'nai', prompt: 'Short negative', explain: 'る-verb: たべない.' },
      { kind: 'form', word: '飲む', reading: 'のむ', pos: ['v5m'], form: 'nai', prompt: 'Short negative', explain: 'む becomes ま: のまない.' },
      { kind: 'form', word: '買う', reading: 'かう', pos: ['v5u'], form: 'nai', prompt: 'Short negative', explain: 'う becomes わ: かわない.' },
      { kind: 'form', word: '来る', reading: 'くる', pos: ['vk'], form: 'nai', prompt: 'Short negative', explain: 'くる → こない.' },
      { kind: 'form', word: 'ある', reading: 'ある', pos: ['v5r-i'], form: 'nai', prompt: 'Short negative', explain: 'ある → ない.' },
      { kind: 'form', word: '帰る', reading: 'かえる', pos: ['v5r'], form: 'nai', prompt: 'Short negative', explain: 'かえる is an う-verb: かえらない.' },
    ],
    words: ['食べる', '行く', '飲む', '買う', '来る', 'ある', '帰る'],
  },
  {
    id: 'short-past',
    unit: 6,
    title: 'The short past: た and なかった',
    goal: 'Say what you did, casually.',
    sections: [
      {
        title: 'た: like the て-form',
        text: 'The short past is made exactly like the て-form, with た in place of て: たべて becomes たべた, のんで becomes のんだ, いって becomes いった.',
        examples: [
          { ja: '食[た]べた', en: 'ate' },
          { ja: '飲[の]んだ', en: 'drank' },
          { ja: '行[い]った', en: 'went' },
        ],
      },
      {
        title: "なかった: didn't",
        text: 'For the short past negative, change the ない of the short negative to なかった: たべない becomes たべなかった.',
        examples: [
          { ja: '食[た]べなかった', en: "didn't eat" },
          { ja: '行[い]かなかった', en: "didn't go" },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '飲む', reading: 'のむ', pos: ['v5m'], form: 'ta', prompt: 'Short past', explain: 'Like のんで: のんだ.' },
      { kind: 'form', word: '行く', reading: 'いく', pos: ['v5k-s'], form: 'ta', prompt: 'Short past', explain: 'Like いって: いった.' },
      { kind: 'form', word: '見る', reading: 'みる', pos: ['v1'], form: 'ta', prompt: 'Short past', explain: 'る-verb: みた.' },
      { kind: 'form', word: '書く', reading: 'かく', pos: ['v5k'], form: 'ta', prompt: 'Short past', explain: 'Like かいて: かいた.' },
      { kind: 'form', word: 'する', reading: 'する', pos: ['vs-i'], form: 'nakatta', prompt: 'Short past negative', explain: 'しない → しなかった.' },
      { kind: 'form', word: '会う', reading: 'あう', pos: ['v5u'], form: 'nakatta', prompt: 'Short past negative', explain: 'あわない → あわなかった.' },
    ],
    words: ['食べる', '飲む', '行く', '見る', '書く', '会う'],
  },
  {
    id: 'casual',
    unit: 6,
    title: 'Casual speech',
    goal: 'Talk casually, the way friends do.',
    sections: [
      {
        title: 'Short forms with friends',
        text: 'With friends and family, Japanese uses short forms instead of ます and です. A question needs no か: the voice rising is enough.',
        examples: [
          { ja: '明日[あした]行[い]く？', en: 'Are you going tomorrow?' },
          { ja: 'うん、行[い]く。', en: "Yeah, I'm going." },
          { ja: 'ううん、行[い]かない。', en: "No, I'm not going." },
        ],
      },
      {
        title: 'です becomes だ, or nothing',
        text: 'After nouns and な-adjectives, です becomes だ, and in questions it usually drops away. い-adjectives simply lose their です.',
        examples: [
          { ja: '今日[きょう]は雨[あめ]だ。', en: "It's raining today." },
          { ja: 'これ、高[たか]い？', en: 'Is this expensive?' },
          { ja: '昨日[きのう]は楽[たの]しかった。', en: 'Yesterday was fun.' },
        ],
      },
    ],
    exercises: [
      {
        kind: 'meaning',
        ja: '明日[あした]行[い]く？',
        options: ['Are you going tomorrow?', "I'm going tomorrow.", 'Did you go yesterday?', "Let's go tomorrow."],
        answer: 'Are you going tomorrow?',
        explain: 'A short form with a rising voice: a casual question.',
      },
      { kind: 'choose', prompt: 'ううん、行[い]か＿。', en: "No, I'm not going.", options: ['ない', 'ません', 'なかった', 'ます'], answer: 'ない', explain: 'Casual: the short negative.' },
      { kind: 'choose', prompt: '今日[きょう]は雨[あめ]＿。', en: "It's raining today. (casual)", options: ['だ', 'です', 'でした', 'だった'], answer: 'だ', explain: 'Casual です after a noun: だ.' },
      {
        kind: 'meaning',
        ja: '昨日[きのう]は楽[たの]しかった。',
        options: ['Yesterday was fun.', 'Tomorrow will be fun.', "Yesterday wasn't fun.", 'Today is fun.'],
        answer: 'Yesterday was fun.',
        explain: 'たのしかった: was fun (casual).',
      },
      { kind: 'form', word: '高い', reading: 'たかい', pos: ['adj-i'], form: { adjective: 'past', polite: false }, prompt: 'Casual past', explain: 'たかかった, without です.' },
    ],
    words: ['明日', '行く', '今日', '雨', '高い', '昨日', '楽しい'],
  },
  {
    id: 'to-omou',
    unit: 6,
    title: 'I think: とおもいます',
    goal: 'Say what you think.',
    sections: [
      {
        title: 'Short form + とおもいます',
        text: 'To say what you think, put a short-form sentence before とおもいます: あしたあめがふるとおもいます, "I think it will rain tomorrow".',
        examples: [
          { ja: '明日[あした]雨[あめ]が降[ふ]ると思[おも]います。', en: 'I think it will rain tomorrow.' },
          { ja: '先生[せんせい]は来[こ]ないと思[おも]います。', en: "I don't think the teacher will come." },
          { ja: 'この映画[えいが]は面白[おもしろ]いと思[おも]います。', en: 'I think this movie is interesting.' },
        ],
      },
      {
        title: 'With nouns and な-adjectives: だ',
        text: 'After a noun or a な-adjective, the short form needs だ: しずかだとおもいます, "I think it\'s quiet".',
        examples: [{ ja: 'あの人[ひと]は学生[がくせい]だと思[おも]います。', en: 'I think that person is a student.' }],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '明日[あした]雨[あめ]が降[ふ]る＿思[おも]います。', en: 'I think it will rain tomorrow.', options: ['と', 'を', 'に', 'が'], answer: 'と', explain: 'と marks what you think.' },
      { kind: 'choose', prompt: 'あの人[ひと]は学生[がくせい]＿と思[おも]います。', en: 'I think that person is a student.', options: ['だ', 'です', 'の', 'な'], answer: 'だ', explain: 'After a noun, the short form needs だ.' },
      {
        kind: 'meaning',
        ja: '先生[せんせい]は来[こ]ないと思[おも]います。',
        options: ["I don't think the teacher will come.", 'I think the teacher will come.', "The teacher didn't come.", 'The teacher thinks I will come.'],
        answer: "I don't think the teacher will come.",
        explain: 'こない: won\'t come; とおもいます: I think.',
      },
      { kind: 'order', en: 'I think this movie is interesting.', pieces: ['この映画[えいが]は', '面白[おもしろ]いと', '思[おも]います。'], explain: 'The thought, then と, then おもいます.' },
      { kind: 'choose', prompt: 'この映画[えいが]は面白[おもしろ]い＿思[おも]います。', en: 'I think this movie is interesting.', options: ['と', 'だと', 'です', 'でと'], answer: 'と', explain: 'い-adjectives need no だ: おもしろいと.' },
    ],
    words: ['明日', '雨', '降る', '思う', '先生', '来る', '映画', '面白い', '人', '学生'],
  },
  {
    id: 'to-itte-ita',
    unit: 6,
    title: 'Someone said: といっていました',
    goal: 'Pass on what someone said.',
    sections: [
      {
        title: 'Short form + といっていました',
        text: 'To pass on what someone said, put what they said in the short form, then といっていました: "(they) were saying". The person saying it takes は.',
        examples: [
          { ja: '先生[せんせい]は明日[あした]休[やす]むと言[い]っていました。', en: 'The teacher said she will be off tomorrow.' },
          { ja: '友達[ともだち]はその映画[えいが]が好[す]きだと言[い]っていました。', en: 'My friend said he likes that movie.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '先生[せんせい]は明日[あした]休[やす]む＿言[い]っていました。', en: 'The teacher said she will be off tomorrow.', options: ['と', 'を', 'に', 'で'], answer: 'と', explain: 'と marks what was said.' },
      {
        kind: 'meaning',
        ja: '友達[ともだち]はその映画[えいが]が好[す]きだと言[い]っていました。',
        options: ['My friend said he likes that movie.', 'I told my friend I like that movie.', "My friend doesn't like that movie.", 'My friend watched that movie.'],
        answer: 'My friend said he likes that movie.',
        explain: 'すきだといっていました: was saying (he) likes it.',
      },
      { kind: 'order', en: 'My mother said she is busy.', pieces: ['母[はは]は', '忙[いそが]しいと', '言[い]っていました。'], explain: 'Who, what they said with と, then いっていました.' },
      { kind: 'form', word: '休む', reading: 'やすむ', pos: ['v5m'], form: 'dictionary', prompt: 'The short (dictionary) form', explain: 'Short present: やすむ.' },
      { kind: 'form', word: '言う', reading: 'いう', pos: ['v5u'], form: 'te', prompt: 'The て-form (for いっていました)', explain: 'う becomes って: いって.' },
    ],
    words: ['先生', '明日', '休む', '言う', '友達', '映画', '好き', '母', '忙しい'],
  },
];
