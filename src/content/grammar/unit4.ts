import type { GrammarLesson } from '@/core/grammar';

// Unit 4: adjectives. い- and な-adjectives, their negatives and pasts, liking things, and how
// much. (The order of Genki I's fifth chapter; the words and sentences are our own.)
export const UNIT_4: readonly GrammarLesson[] = [
  {
    id: 'i-adjectives',
    unit: 4,
    title: 'い-adjectives',
    goal: 'Describe things: expensive, big, interesting.',
    sections: [
      {
        title: 'Adjectives ending in い',
        text: 'Most Japanese adjectives end in い: たかい (expensive), おおきい (big), おもしろい (interesting). Put です after them to be polite.',
        examples: [
          { ja: 'この車[くるま]は高[たか]いです。', en: 'This car is expensive.' },
          { ja: '日本[にほん]の映画[えいが]は面白[おもしろ]いです。', en: 'Japanese movies are interesting.' },
        ],
      },
      {
        title: 'Before a noun',
        text: 'An い-adjective goes straight before a noun, just as it is: たかいくるま, "an expensive car".',
        examples: [
          { ja: '大[おお]きい犬[いぬ]がいます。', en: 'There is a big dog.' },
          { ja: '新[あたら]しい服[ふく]を買[か]いました。', en: 'I bought new clothes.' },
        ],
      },
    ],
    exercises: [
      {
        kind: 'meaning',
        ja: 'この車[くるま]は高[たか]いです。',
        options: ['This car is expensive.', 'This car is cheap.', 'That car is big.', 'Is this car expensive?'],
        answer: 'This car is expensive.',
        explain: 'たかい: expensive.',
      },
      { kind: 'choose', prompt: '＿犬[いぬ]がいます。', en: 'There is a big dog.', options: ['大[おお]きい', '大[おお]きいの', '大[おお]きいな', '大[おお]きいです'], answer: '大[おお]きい', explain: 'An い-adjective goes straight before the noun.' },
      { kind: 'order', en: 'I bought new clothes.', pieces: ['新[あたら]しい', '服[ふく]を', '買[か]いました。'], explain: 'The adjective comes right before the noun.' },
      {
        kind: 'meaning',
        ja: '面白[おもしろ]い映画[えいが]でした。',
        options: ['It was an interesting movie.', 'It was a boring movie.', 'The movie was long.', "Let's watch an interesting movie."],
        answer: 'It was an interesting movie.',
        explain: 'おもしろい: interesting.',
      },
      { kind: 'form', word: '高い', reading: 'たかい', pos: ['adj-i'], form: { adjective: 'present', polite: true }, prompt: 'Make it polite', explain: 'Just add です: たかいです.' },
    ],
    words: ['車', '高い', '日本', '映画', '面白い', '大きい', '犬', '新しい', '服', '買う'],
  },
  {
    id: 'na-adjectives',
    unit: 4,
    title: 'な-adjectives',
    goal: 'Use the other kind of adjective: quiet, famous, well.',
    sections: [
      {
        title: 'Adjectives that take な',
        text: 'Some adjectives work more like nouns: しずか (quiet), ゆうめい (famous), げんき (well). With です they look like nouns: しずかです.',
        examples: [
          { ja: 'この部屋[へや]は静[しず]かです。', en: 'This room is quiet.' },
          { ja: '母[はは]は元気[げんき]です。', en: 'My mother is well.' },
        ],
      },
      {
        title: 'Before a noun: な',
        text: 'Before a noun they take な: しずかなへや, "a quiet room". That is where their name comes from.',
        examples: [
          { ja: '静[しず]かな部屋[へや]です。', en: "It's a quiet room." },
          { ja: '有名[ゆうめい]な先生[せんせい]です。', en: "(She's) a famous teacher." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '静[しず]か＿部屋[へや]です。', en: "It's a quiet room.", options: ['な', 'の', 'い', 'に'], answer: 'な', explain: 'Before a noun, a な-adjective takes な.' },
      { kind: 'choose', prompt: '有名[ゆうめい]＿先生[せんせい]です。', en: "She's a famous teacher.", options: ['な', 'い', 'の', 'で'], answer: 'な', explain: 'ゆうめい is a な-adjective: ゆうめいな.' },
      {
        kind: 'meaning',
        ja: '母[はは]は元気[げんき]です。',
        options: ['My mother is well.', 'My mother is famous.', 'My mother is quiet.', 'Is my mother well?'],
        answer: 'My mother is well.',
        explain: 'げんき: well, healthy.',
      },
      { kind: 'choose', prompt: '＿車[くるま]です。', en: "It's a big car.", options: ['大[おお]きい', '大[おお]きいな', '大[おお]きく', '大[おお]きいの'], answer: '大[おお]きい', explain: 'おおきい is an い-adjective: no な.' },
      { kind: 'order', en: 'This room is quiet.', pieces: ['この部屋[へや]は', '静[しず]か', 'です。'], explain: 'With です, a な-adjective needs no な.' },
    ],
    words: ['部屋', '静か', '母', '元気', '有名', '先生', '大きい', '車'],
  },
  {
    id: 'adjective-negative',
    unit: 4,
    title: 'Not: くない and じゃない',
    goal: 'Say something is not expensive, not quiet.',
    sections: [
      {
        title: 'い-adjectives: くない',
        text: 'Change the last い to くない: たかい becomes たかくない, "not expensive". Add です to be polite. いい (good) is special: よくないです.',
        examples: [
          { ja: 'この本[ほん]は高[たか]くないです。', en: "This book isn't expensive." },
          { ja: '今日[きょう]は寒[さむ]くないです。', en: "It isn't cold today." },
          { ja: 'あまりよくないです。', en: "It's not very good." },
        ],
      },
      {
        title: 'な-adjectives: じゃない',
        text: 'な-adjectives work like nouns again: しずかじゃないです, "not quiet".',
        examples: [{ ja: 'この部屋[へや]は静[しず]かじゃないです。', en: "This room isn't quiet." }],
      },
    ],
    exercises: [
      { kind: 'form', word: '高い', reading: 'たかい', pos: ['adj-i'], form: { adjective: 'negative', polite: true }, prompt: 'Polite negative', explain: 'い becomes くない: たかくないです.' },
      { kind: 'form', word: 'いい', reading: 'いい', pos: ['adj-ix'], form: { adjective: 'negative', polite: true }, prompt: 'Polite negative', explain: 'いい is special: よくないです.' },
      { kind: 'form', word: '静か', reading: 'しずか', pos: ['adj-na'], form: { adjective: 'negative', polite: true }, prompt: 'Polite negative', explain: 'Like a noun: しずかじゃないです.' },
      {
        kind: 'meaning',
        ja: '今日[きょう]は寒[さむ]くないです。',
        options: ["It isn't cold today.", "It's cold today.", 'It was cold yesterday.', 'Is it cold today?'],
        answer: "It isn't cold today.",
        explain: 'さむくない: not cold.',
      },
      { kind: 'form', word: '難しい', reading: 'むずかしい', pos: ['adj-i'], form: { adjective: 'negative', polite: true }, prompt: 'Polite negative', explain: 'むずかしい → むずかしくないです.' },
    ],
    words: ['本', '高い', '今日', '寒い', 'いい', '部屋', '静か', '難しい'],
  },
  {
    id: 'adjective-past',
    unit: 4,
    title: 'Was: かった and でした',
    goal: 'Say how something was: the movie was interesting.',
    sections: [
      {
        title: 'い-adjectives: かった',
        text: 'Change the last い to かった: たのしい becomes たのしかった, "was fun". The polite form is たのしかったです, never たのしいでした. いい becomes よかった.',
        examples: [
          { ja: '映画[えいが]は面白[おもしろ]かったです。', en: 'The movie was interesting.' },
          { ja: '昨日[きのう]は楽[たの]しかったです。', en: 'Yesterday was fun.' },
          { ja: 'よかったです。', en: 'That was good. / I\'m glad.' },
        ],
      },
      {
        title: 'な-adjectives: でした',
        text: 'Like nouns: しずかでした, "was quiet". Negative: しずかじゃなかったです. For い-adjectives: たかくなかったです.',
        examples: [
          { ja: '部屋[へや]は静[しず]かでした。', en: 'The room was quiet.' },
          { ja: '難[むずか]しくなかったです。', en: "It wasn't difficult." },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '楽しい', reading: 'たのしい', pos: ['adj-i'], form: { adjective: 'past', polite: true }, prompt: 'Polite past', explain: 'い becomes かった: たのしかったです. Not たのしいでした.' },
      { kind: 'form', word: 'いい', reading: 'いい', pos: ['adj-ix'], form: { adjective: 'past', polite: true }, prompt: 'Polite past', explain: 'いい → よかったです.' },
      { kind: 'form', word: '静か', reading: 'しずか', pos: ['adj-na'], form: { adjective: 'past', polite: true }, prompt: 'Polite past', explain: 'Like a noun: しずかでした.' },
      { kind: 'form', word: '難しい', reading: 'むずかしい', pos: ['adj-i'], form: { adjective: 'pastNegative', polite: true }, prompt: 'Polite past negative', explain: 'くない becomes くなかった: むずかしくなかったです.' },
      {
        kind: 'meaning',
        ja: '映画[えいが]は面白[おもしろ]かったです。',
        options: ['The movie was interesting.', 'The movie is interesting.', "The movie wasn't interesting.", 'Was the movie interesting?'],
        answer: 'The movie was interesting.',
        explain: 'おもしろかった: was interesting.',
      },
    ],
    words: ['映画', '面白い', '昨日', '楽しい', 'いい', '部屋', '静か', '難しい'],
  },
  {
    id: 'suki',
    unit: 4,
    title: 'Liking: すき and きらい',
    goal: 'Say what you like and dislike.',
    sections: [
      {
        title: 'X がすきです',
        text: 'すき (liked) is a な-adjective, and what you like takes が: ねこがすきです, "I like cats". だいすき is "love", きらい is "dislike".',
        examples: [
          { ja: '猫[ねこ]が好[す]きです。', en: 'I like cats.' },
          { ja: 'コーヒーが大好[だいす]きです。', en: 'I love coffee.' },
          { ja: '肉[にく]が嫌[きら]いです。', en: "I don't like meat." },
        ],
      },
      {
        title: 'Not really',
        text: 'Japanese often says "not much" instead of "dislike": あまりすきじゃないです.',
        examples: [{ ja: '魚[さかな]はあまり好[す]きじゃないです。', en: "I don't really like fish." }],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '猫[ねこ]＿好[す]きです。', en: 'I like cats.', options: ['が', 'を', 'に', 'で'], answer: 'が', explain: 'What you like takes が.' },
      {
        kind: 'meaning',
        ja: '肉[にく]が嫌[きら]いです。',
        options: ["I don't like meat.", 'I like meat.', 'I love meat.', "I didn't eat meat."],
        answer: "I don't like meat.",
        explain: 'きらい: disliked.',
      },
      { kind: 'choose', prompt: '魚[さかな]はあまり好[す]き＿。', en: "I don't really like fish.", options: ['じゃないです', 'です', 'くないです', 'でした'], answer: 'じゃないです', explain: 'すき is a な-adjective: すきじゃないです.' },
      { kind: 'order', en: 'I love coffee.', pieces: ['コーヒーが', '大好[だいす]き', 'です。'], explain: 'What you love, with が, then だいすきです.' },
      { kind: 'form', word: '好き', reading: 'すき', pos: ['adj-na'], form: { adjective: 'past', polite: true }, prompt: 'Polite past', explain: 'Like a noun: すきでした.' },
    ],
    words: ['猫', '好き', 'コーヒー', '大好き', '肉', '嫌い', '魚'],
  },
  {
    id: 'how-much',
    unit: 4,
    title: 'How much: とても, ちょっと, あまり',
    goal: 'Say very, a little, and not very.',
    sections: [
      {
        title: 'Very and a little',
        text: 'とても (very) and ちょっと (a little) go before the adjective.',
        examples: [
          { ja: 'この店[みせ]はとても安[やす]いです。', en: 'This shop is very cheap.' },
          { ja: 'ちょっと難[むずか]しいです。', en: "It's a little difficult." },
        ],
      },
      {
        title: 'Not very: あまり + negative',
        text: 'あまり goes with a negative: あまりたかくないです, "not very expensive".',
        examples: [
          { ja: '今日[きょう]はあまり寒[さむ]くないです。', en: "It isn't very cold today." },
          { ja: 'あまり静[しず]かじゃないです。', en: "It isn't very quiet." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: 'この店[みせ]は＿安[やす]いです。', en: 'This shop is very cheap.', options: ['とても', 'あまり', '全然[ぜんぜん]', 'もっと'], answer: 'とても', explain: 'とても: very.' },
      { kind: 'choose', prompt: 'あまり寒[さむ]＿。', en: "It isn't very cold.", options: ['くないです', 'いです', 'かったです', 'いでした'], answer: 'くないです', explain: 'あまり goes with a negative.' },
      {
        kind: 'meaning',
        ja: 'ちょっと難[むずか]しいです。',
        options: ["It's a little difficult.", "It's very difficult.", "It isn't difficult.", 'It was easy.'],
        answer: "It's a little difficult.",
        explain: 'ちょっと: a little.',
      },
      { kind: 'order', en: "It isn't very quiet.", pieces: ['あまり', '静[しず]か', 'じゃないです。'], explain: 'あまり, then the negative.' },
      { kind: 'form', word: '安い', reading: 'やすい', pos: ['adj-i'], form: { adjective: 'negative', polite: true }, prompt: 'Polite negative', explain: 'やすい → やすくないです.' },
    ],
    words: ['店', '安い', '難しい', '今日', '寒い', '静か', '全然', 'もっと'],
  },
];
