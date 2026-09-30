import type { GrammarLesson } from '@/core/grammar';

// Unit 3: what's there and where, and the past. あります and います, where things are, the
// past of verbs and of です, and と. (The order of Genki I's fourth chapter; the words and
// sentences are our own.)
export const UNIT_3: readonly GrammarLesson[] = [
  {
    id: 'aru-iru',
    unit: 3,
    title: 'あります and います',
    goal: 'Say there is something, or someone.',
    sections: [
      {
        title: 'Things: あります',
        text: 'あります says a thing is there, or that you have it. が marks what is there: ほんがあります, "there is a book".',
        examples: [
          { ja: '本[ほん]があります。', en: 'There is a book.' },
          { ja: '時間[じかん]があります。', en: 'I have time.' },
        ],
      },
      {
        title: 'People and animals: います',
        text: 'For anything alive that moves, people and animals, use います instead: ねこがいます, "there is a cat".',
        examples: [
          { ja: '猫[ねこ]がいます。', en: 'There is a cat.' },
          { ja: '友達[ともだち]がいます。', en: 'I have a friend (here).' },
        ],
      },
      {
        title: 'Not there: ありません and いません',
        text: 'The negatives follow the usual pattern: ありません, いません.',
        examples: [
          { ja: 'お金[かね]がありません。', en: "I don't have any money." },
          { ja: '犬[いぬ]はいません。', en: "There isn't a dog." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '猫[ねこ]が＿。', en: 'There is a cat.', options: ['います', 'あります', 'です', 'ます'], answer: 'います', explain: 'A cat is alive: います.' },
      { kind: 'choose', prompt: '本[ほん]が＿。', en: 'There is a book.', options: ['あります', 'います', 'です', 'ありません'], answer: 'あります', explain: 'A book is a thing: あります.' },
      {
        kind: 'meaning',
        ja: '時間[じかん]がありません。',
        options: ["I don't have time.", 'I have time.', 'What time is it?', "There isn't a clock."],
        answer: "I don't have time.",
        explain: 'じかんがありません: there is no time.',
      },
      { kind: 'choose', prompt: '友達[ともだち]＿います。', en: 'I have a friend here.', options: ['が', 'を', 'で', 'へ'], answer: 'が', explain: 'が marks what or who is there.' },
      { kind: 'form', word: 'ある', reading: 'ある', pos: ['v5r-i'], form: 'masen', prompt: 'Polite and negative', explain: 'ある: ありません.' },
    ],
    words: ['本', '時間', '猫', '友達', 'お金', '犬'],
  },
  {
    id: 'where',
    unit: 3,
    title: 'Where things are: うえ, した, なか',
    goal: 'Say where things are: on the desk, under the chair, in the box.',
    sections: [
      {
        title: 'X のうえに: on X',
        text: 'Place words work like nouns joined with の: つくえのうえ, "the top of the desk". Then に says where: つくえのうえにほんがあります, "there is a book on the desk".',
        examples: [
          { ja: '机[つくえ]の上[うえ]に本[ほん]があります。', en: 'There is a book on the desk.' },
          { ja: '椅子[いす]の下[した]に猫[ねこ]がいます。', en: 'There is a cat under the chair.' },
          { ja: '箱[はこ]の中[なか]に時計[とけい]があります。', en: 'There is a watch in the box.' },
        ],
      },
      {
        title: 'In front, behind, next to',
        text: 'まえ is in front, うしろ behind, となり next to.',
        examples: [
          { ja: '駅[えき]の前[まえ]に店[みせ]があります。', en: 'There is a shop in front of the station.' },
          { ja: '私[わたし]の隣[となり]に先生[せんせい]がいます。', en: 'The teacher is next to me.' },
        ],
      },
      {
        title: 'Where is it?',
        text: 'To say where a thing you already mean is, put it first with は: ほんはつくえのうえにあります, "the book is on the desk". To ask, use どこに.',
        examples: [
          { ja: '猫[ねこ]はどこにいますか。', en: 'Where is the cat?' },
          { ja: '箱[はこ]の中[なか]にいます。', en: "It's in the box." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '机[つくえ]の＿に本[ほん]があります。', en: 'There is a book on the desk.', options: ['上[うえ]', '下[した]', '中[なか]', '前[まえ]'], answer: '上[うえ]', explain: 'うえ: on top of.' },
      { kind: 'choose', prompt: '箱[はこ]の中[なか]＿時計[とけい]があります。', en: 'There is a watch in the box.', options: ['に', 'で', 'を', 'へ'], answer: 'に', explain: 'に: where something is.' },
      {
        kind: 'meaning',
        ja: '椅子[いす]の下[した]に猫[ねこ]がいます。',
        options: ['There is a cat under the chair.', 'There is a cat on the chair.', 'The cat is next to the chair.', 'There is a chair under the cat.'],
        answer: 'There is a cat under the chair.',
        explain: 'いすのした: under the chair.',
      },
      { kind: 'order', en: 'There is a shop in front of the station.', pieces: ['駅[えき]の前[まえ]に', '店[みせ]が', 'あります。'], explain: 'Where (with に), what (with が), then あります.' },
      { kind: 'choose', prompt: '猫[ねこ]は＿にいますか。', en: 'Where is the cat?', options: ['どこ', '何[なん]', '誰[だれ]', 'どれ'], answer: 'どこ', explain: 'どこに: where.' },
    ],
    words: ['机', '上', '本', '椅子', '下', '猫', '箱', '中', '時計', '駅', '前', '店', '私', '隣', '先生'],
  },
  {
    id: 'mashita',
    unit: 3,
    title: 'The past: ました',
    goal: 'Say what you did, and what you did not do.',
    sections: [
      {
        title: 'ました: did',
        text: 'For the past, change ます to ました: みます becomes みました, "I watched".',
        examples: [
          { ja: '昨日[きのう]映画[えいが]を見[み]ました。', en: 'I watched a movie yesterday.' },
          { ja: '友達[ともだち]に会[あ]いました。', en: 'I met a friend.' },
        ],
      },
      {
        title: "ませんでした: didn't",
        text: 'For the past negative, change ます to ませんでした: たべませんでした, "I didn\'t eat".',
        examples: [
          { ja: '朝[あさ]ご飯[はん]を食[た]べませんでした。', en: "I didn't eat breakfast." },
          { ja: '昨日[きのう]は勉強[べんきょう]しませんでした。', en: "I didn't study yesterday." },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '見る', reading: 'みる', pos: ['v1'], form: 'mashita', prompt: 'Polite past', explain: 'ます becomes ました: みました.' },
      { kind: 'form', word: '買う', reading: 'かう', pos: ['v5u'], form: 'mashita', prompt: 'Polite past', explain: 'かいます becomes かいました.' },
      { kind: 'form', word: '行く', reading: 'いく', pos: ['v5k-s'], form: 'masendeshita', prompt: 'Polite past negative', explain: 'いきません + でした: いきませんでした.' },
      {
        kind: 'meaning',
        ja: '昨日[きのう]映画[えいが]を見[み]ました。',
        options: ['I watched a movie yesterday.', "I'll watch a movie tomorrow.", "I didn't watch a movie yesterday.", 'I watch movies every day.'],
        answer: 'I watched a movie yesterday.',
        explain: 'みました: watched; きのう: yesterday.',
      },
      { kind: 'choose', prompt: '朝[あさ]ご飯[はん]を食[た]べ＿。', en: "I didn't eat breakfast.", options: ['ませんでした', 'ました', 'ません', 'ます'], answer: 'ませんでした', explain: 'Past and negative: ませんでした.' },
    ],
    words: ['昨日', '映画', '見る', '友達', '会う', '朝', 'ご飯', '食べる', '勉強', '買う', '行く'],
  },
  {
    id: 'deshita',
    unit: 3,
    title: 'でした: was',
    goal: 'Say what something was, and was not.',
    sections: [
      {
        title: 'でした: was',
        text: 'The past of です is でした: きのうはあめでした, "it was rainy yesterday".',
        examples: [
          { ja: '昨日[きのう]は雨[あめ]でした。', en: 'It rained yesterday.' },
          { ja: '父[ちち]は先生[せんせい]でした。', en: 'My father was a teacher.' },
        ],
      },
      {
        title: "じゃなかったです: wasn't",
        text: 'The past of じゃないです is じゃなかったです: "was not".',
        examples: [
          { ja: '昨日[きのう]は雨[あめ]じゃなかったです。', en: "It didn't rain yesterday." },
          { ja: 'あの人[ひと]は学生[がくせい]じゃなかったです。', en: "That person wasn't a student." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '父[ちち]は先生[せんせい]＿。', en: 'My father was a teacher.', options: ['でした', 'です', 'ました', 'じゃないです'], answer: 'でした', explain: 'The past of です: でした.' },
      { kind: 'choose', prompt: '昨日[きのう]は雨[あめ]＿。', en: "It didn't rain yesterday.", options: ['じゃなかったです', 'でした', 'じゃないです', 'ませんでした'], answer: 'じゃなかったです', explain: 'Past and negative, after a noun: じゃなかったです.' },
      {
        kind: 'meaning',
        ja: '昨日[きのう]は雨[あめ]でした。',
        options: ['It rained yesterday.', 'It will rain tomorrow.', "It didn't rain yesterday.", 'It is raining today.'],
        answer: 'It rained yesterday.',
        explain: 'あめでした: it was rain.',
      },
      { kind: 'order', en: "That person wasn't a student.", pieces: ['あの人[ひと]は', '学生[がくせい]', 'じゃなかったです。'], explain: 'じゃなかったです in place of でした.' },
      { kind: 'choose', prompt: '＿は雨[あめ]でした。', en: 'It rained yesterday.', options: ['昨日[きのう]', '明日[あした]', '毎日[まいにち]', '今[いま]'], answer: '昨日[きのう]', explain: 'でした is past, so: yesterday.' },
    ],
    words: ['昨日', '雨', '父', '先生', '人', '学生', '明日', '毎日', '今'],
  },
  {
    id: 'to',
    unit: 3,
    title: 'と: and, with',
    goal: 'Join nouns with "and", and say who you do things with.',
    sections: [
      {
        title: 'X と Y: X and Y',
        text: 'と joins nouns: いぬとねこ, "dogs and cats". It only joins nouns, never whole sentences.',
        examples: [
          { ja: '犬[いぬ]と猫[ねこ]がいます。', en: 'There are a dog and a cat.' },
          { ja: 'パンとコーヒーを買[か]いました。', en: 'I bought bread and coffee.' },
        ],
      },
      {
        title: 'With someone',
        text: 'After a person, と means "with": ともだちとえいがをみました, "I watched a movie with a friend".',
        examples: [
          { ja: '友達[ともだち]と映画[えいが]を見[み]ました。', en: 'I watched a movie with a friend.' },
          { ja: '母[はは]と話[はな]しました。', en: 'I talked with my mother.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '犬[いぬ]＿猫[ねこ]がいます。', en: 'There are a dog and a cat.', options: ['と', 'も', 'の', 'に'], answer: 'と', explain: 'と: and, between nouns.' },
      { kind: 'choose', prompt: '友達[ともだち]＿映画[えいが]を見[み]ました。', en: 'I watched a movie with a friend.', options: ['と', 'を', 'に', 'が'], answer: 'と', explain: 'と after a person: with.' },
      {
        kind: 'meaning',
        ja: '母[はは]と話[はな]しました。',
        options: ['I talked with my mother.', 'My mother talked.', "I didn't talk to my mother.", "I'll talk with my mother."],
        answer: 'I talked with my mother.',
        explain: 'ははと: with my mother; はなしました: talked.',
      },
      { kind: 'order', en: 'I bought bread and coffee.', pieces: ['パンと', 'コーヒーを', '買[か]いました。'], explain: 'と joins the two things bought.' },
      { kind: 'form', word: '話す', reading: 'はなす', pos: ['v5s'], form: 'mashita', prompt: 'Polite past', explain: 'す becomes し: はなしました.' },
    ],
    words: ['犬', '猫', 'パン', 'コーヒー', '買う', '友達', '映画', '見る', '母', '話す'],
  },
];
