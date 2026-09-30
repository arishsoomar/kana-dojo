import type { GrammarLesson } from '@/core/grammar';

// Unit 5: the て-form. Making it, and what it does: please, doing now, may I, must not, and
// joining actions and descriptions. (The order of Genki I's sixth and seventh chapters; the
// words and sentences are our own.)
export const UNIT_5: readonly GrammarLesson[] = [
  {
    id: 'te-form',
    unit: 5,
    title: 'Making the て-form',
    goal: 'Turn any verb into its て-form.',
    sections: [
      {
        title: 'る-verbs, する and くる',
        text: 'る-verbs swap る for て: たべる becomes たべて. する becomes して, and くる becomes きて.',
        examples: [
          { ja: '食[た]べて', en: 'eat (て-form)' },
          { ja: '見[み]て', en: 'look, watch' },
          { ja: '勉強[べんきょう]して', en: 'study' },
        ],
      },
      {
        title: 'う-verbs: by their last sound',
        text: 'う-verbs change by their last sound. う, つ and る become って. む, ぶ and ぬ become んで. く becomes いて and ぐ becomes いで. す becomes して. And いく is special: いって.',
        examples: [
          { ja: '会[あ]って、待[ま]って、帰[かえ]って', en: 'meet, wait, go home' },
          { ja: '読[よ]んで、遊[あそ]んで', en: 'read, play' },
          { ja: '書[か]いて、泳[およ]いで、話[はな]して', en: 'write, swim, talk' },
          { ja: '行[い]って', en: 'go' },
        ],
      },
    ],
    exercises: [
      { kind: 'form', word: '食べる', reading: 'たべる', pos: ['v1'], form: 'te', prompt: 'The て-form', explain: 'る-verb: たべて.' },
      { kind: 'form', word: '読む', reading: 'よむ', pos: ['v5m'], form: 'te', prompt: 'The て-form', explain: 'む becomes んで: よんで.' },
      { kind: 'form', word: '書く', reading: 'かく', pos: ['v5k'], form: 'te', prompt: 'The て-form', explain: 'く becomes いて: かいて.' },
      { kind: 'form', word: '待つ', reading: 'まつ', pos: ['v5t'], form: 'te', prompt: 'The て-form', explain: 'つ becomes って: まって.' },
      { kind: 'form', word: '行く', reading: 'いく', pos: ['v5k-s'], form: 'te', prompt: 'The て-form', explain: 'いく is special: いって, not いいて.' },
      { kind: 'form', word: '話す', reading: 'はなす', pos: ['v5s'], form: 'te', prompt: 'The て-form', explain: 'す becomes して: はなして.' },
      { kind: 'form', word: '来る', reading: 'くる', pos: ['vk'], form: 'te', prompt: 'The て-form', explain: 'くる becomes きて.' },
    ],
    words: ['食べる', '見る', '勉強', '会う', '待つ', '帰る', '読む', '遊ぶ', '書く', '泳ぐ', '話す', '行く', '来る'],
  },
  {
    id: 'te-kudasai',
    unit: 5,
    title: 'Please: てください',
    goal: 'Ask someone to do something.',
    sections: [
      {
        title: 'て-form + ください',
        text: 'The て-form followed by ください politely asks someone to do something: まどをあけてください, "please open the window".',
        examples: [
          { ja: '窓[まど]を開[あ]けてください。', en: 'Please open the window.' },
          { ja: 'ちょっと待[ま]ってください。', en: 'Please wait a moment.' },
          { ja: 'ここに座[すわ]ってください。', en: 'Please sit here.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: 'ちょっと待[ま]って＿。', en: 'Please wait a moment.', options: ['ください', 'います', 'ます', 'もいいです'], answer: 'ください', explain: 'て-form + ください: please.' },
      { kind: 'choose', prompt: '窓[まど]を＿ください。', en: 'Please open the window.', options: ['開[あ]けて', '開[あ]けます', '開[あ]ける', '開[あ]けた'], answer: '開[あ]けて', explain: 'ください follows the て-form.' },
      {
        kind: 'meaning',
        ja: 'ここに座[すわ]ってください。',
        options: ['Please sit here.', 'Please stand here.', 'May I sit here?', "I'm sitting here."],
        answer: 'Please sit here.',
        explain: 'すわって: sit; ください: please.',
      },
      { kind: 'order', en: 'Please close the door.', pieces: ['ドアを', '閉[し]めて', 'ください。'], explain: 'What, the て-form, then ください.' },
      { kind: 'form', word: '教える', reading: 'おしえる', pos: ['v1'], form: 'te', prompt: 'The て-form (for おしえてください, "please tell me")', explain: 'る-verb: おしえて.' },
    ],
    words: ['窓', '開ける', '待つ', '座る', 'ドア', '閉める', '教える'],
  },
  {
    id: 'te-iru',
    unit: 5,
    title: 'Doing now: ています',
    goal: "Say what's happening right now.",
    sections: [
      {
        title: 'て-form + います',
        text: 'The て-form followed by います says something is going on: テレビをみています, "I\'m watching TV".',
        examples: [
          { ja: '今[いま]テレビを見[み]ています。', en: "I'm watching TV now." },
          { ja: '雨[あめ]が降[ふ]っています。', en: "It's raining." },
          { ja: '母[はは]は料理[りょうり]をしています。', en: 'My mother is cooking.' },
        ],
      },
      {
        title: 'A state that continues',
        text: 'Some verbs use ています for a state that goes on: しっています (I know), けっこんしています (I am married), すんでいます (I live).',
        examples: [
          { ja: '先生[せんせい]を知[し]っています。', en: 'I know the teacher.' },
          { ja: '日本[にほん]に住[す]んでいます。', en: 'I live in Japan.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '今[いま]テレビを見[み]て＿。', en: "I'm watching TV now.", options: ['います', 'ください', 'ます', 'もいいです'], answer: 'います', explain: 'て-form + います: doing now.' },
      {
        kind: 'meaning',
        ja: '雨[あめ]が降[ふ]っています。',
        options: ["It's raining.", 'It rained.', 'It will rain.', "It isn't raining."],
        answer: "It's raining.",
        explain: 'ふっています: is falling.',
      },
      { kind: 'choose', prompt: '日本[にほん]に＿います。', en: 'I live in Japan.', options: ['住[す]んで', '住[す]みて', '住[す]って', '住[す]む'], answer: '住[す]んで', explain: 'すむ: む becomes んで.' },
      { kind: 'order', en: 'My mother is cooking.', pieces: ['母[はは]は', '料理[りょうり]を', 'しています。'], explain: 'りょうりをする: to cook; している: doing now.' },
      { kind: 'form', word: '降る', reading: 'ふる', pos: ['v5r'], form: 'te', prompt: 'The て-form', explain: 'る becomes って (an う-verb): ふって.' },
    ],
    words: ['今', 'テレビ', '見る', '雨', '降る', '母', '料理', '先生', '知る', '日本', '住む'],
  },
  {
    id: 'te-mo-ii',
    unit: 5,
    title: 'May I: てもいいです',
    goal: 'Ask for permission, and give it.',
    sections: [
      {
        title: 'て-form + もいいです',
        text: 'The て-form followed by もいいです says something is all right to do. As a question, it asks permission: しゃしんをとってもいいですか, "may I take a photo?".',
        examples: [
          { ja: '写真[しゃしん]を撮[と]ってもいいですか。', en: 'May I take a photo?' },
          { ja: 'ここに座[すわ]ってもいいですか。', en: 'May I sit here?' },
          { ja: 'はい、いいですよ。', en: "Yes, that's fine." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '写真[しゃしん]を撮[と]って＿いいですか。', en: 'May I take a photo?', options: ['も', 'は', 'が', 'を'], answer: 'も', explain: 'てもいいですか: may I?' },
      {
        kind: 'meaning',
        ja: 'ここに座[すわ]ってもいいですか。',
        options: ['May I sit here?', 'Please sit here.', "I'm sitting here.", "Don't sit here."],
        answer: 'May I sit here?',
        explain: 'すわってもいいですか: may I sit?',
      },
      { kind: 'order', en: 'May I use the phone?', pieces: ['電話[でんわ]を', '使[つか]っても', 'いいですか。'], explain: 'て-form + もいいですか.' },
      { kind: 'form', word: '使う', reading: 'つかう', pos: ['v5u'], form: 'te', prompt: 'The て-form', explain: 'う becomes って: つかって.' },
      { kind: 'form', word: '撮る', reading: 'とる', pos: ['v5r'], form: 'te', prompt: 'The て-form', explain: 'る becomes って (an う-verb): とって.' },
    ],
    words: ['写真', '撮る', '座る', '電話', '使う'],
  },
  {
    id: 'te-wa-ikenai',
    unit: 5,
    title: 'Must not: てはいけません',
    goal: 'Say what is not allowed.',
    sections: [
      {
        title: 'て-form + はいけません',
        text: 'The て-form followed by はいけません says something must not be done. Here は is read "wa".',
        examples: [
          { ja: 'ここで写真[しゃしん]を撮[と]ってはいけません。', en: 'You must not take photos here.' },
          { ja: '部屋[へや]で食[た]べてはいけません。', en: 'No eating in the room.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: 'ここで写真[しゃしん]を撮[と]って＿。', en: 'You must not take photos here.', options: ['はいけません', 'もいいです', 'ください', 'います'], answer: 'はいけません', explain: 'てはいけません: must not.' },
      {
        kind: 'meaning',
        ja: '部屋[へや]で食[た]べてはいけません。',
        options: ['No eating in the room.', 'Please eat in the room.', 'May I eat in the room?', "I'm eating in the room."],
        answer: 'No eating in the room.',
        explain: 'たべてはいけません: must not eat.',
      },
      { kind: 'choose', prompt: '写真[しゃしん]を撮[と]っても＿。', en: "It's fine to take photos.", options: ['いいです', 'いけません', 'ください', 'います'], answer: 'いいです', explain: 'てもいいです: it\'s fine to.' },
      { kind: 'order', en: "You mustn't run here.", pieces: ['ここで', '走[はし]っては', 'いけません。'], explain: 'Where, the て-form + は, then いけません.' },
      { kind: 'form', word: '走る', reading: 'はしる', pos: ['v5r'], form: 'te', prompt: 'The て-form', explain: 'はしる is an う-verb: はしって.' },
    ],
    words: ['写真', '撮る', '部屋', '食べる', '走る'],
  },
  {
    id: 'te-and',
    unit: 5,
    title: 'And then: joining with て',
    goal: 'Say several things in a row.',
    sections: [
      {
        title: 'Actions in order',
        text: 'The て-form joins actions in the order they happen: あさおきて、コーヒーをのみます, "I get up and have coffee". Only the last verb shows the tense.',
        examples: [
          { ja: '朝[あさ]起[お]きて、コーヒーを飲[の]みます。', en: 'I get up in the morning and have coffee.' },
          { ja: '家[いえ]に帰[かえ]って、寝[ね]ました。', en: 'I went home and went to bed.' },
        ],
      },
      {
        title: 'Describing with くて and で',
        text: 'Adjectives join the same way. い-adjectives: やすい becomes やすくて. な-adjectives and nouns: しずかで.',
        examples: [
          { ja: 'この店[みせ]は安[やす]くて、おいしいです。', en: 'This shop is cheap and good.' },
          { ja: '静[しず]かで、きれいな部屋[へや]です。', en: "It's a quiet, clean room." },
        ],
      },
    ],
    exercises: [
      {
        kind: 'meaning',
        ja: '家[いえ]に帰[かえ]って、寝[ね]ました。',
        options: ['I went home and went to bed.', 'I went to bed, then went home.', "I'll go home and sleep.", "I didn't go home."],
        answer: 'I went home and went to bed.',
        explain: 'かえって、ねました: went home, then slept.',
      },
      { kind: 'form', word: '安い', reading: 'やすい', pos: ['adj-i'], form: { adjective: 'te', polite: false }, prompt: 'The て-form, to join it', explain: 'い becomes くて: やすくて.' },
      { kind: 'form', word: '静か', reading: 'しずか', pos: ['adj-na'], form: { adjective: 'te', polite: false }, prompt: 'The て-form, to join it', explain: 'な-adjective: しずかで.' },
      { kind: 'order', en: 'I get up and have coffee.', pieces: ['起[お]きて、', 'コーヒーを', '飲[の]みます。'], explain: 'First action in the て-form, then the next.' },
      { kind: 'form', word: '起きる', reading: 'おきる', pos: ['v1'], form: 'te', prompt: 'The て-form', explain: 'る-verb: おきて.' },
    ],
    words: ['朝', '起きる', 'コーヒー', '飲む', '家', '帰る', '寝る', '店', '安い', 'おいしい', '静か', 'きれい', '部屋'],
  },
];
