import type { GrammarLesson } from '@/core/grammar';

// Unit 1: です and the basics. Saying what something is, asking, whose, this and that, here and
// there, also, and not. (The order of Genki I's first chapters; the words and sentences are
// our own.) Readings go in brackets after their kanji: 私[わたし].
export const UNIT_1: readonly GrammarLesson[] = [
  {
    id: 'desu',
    unit: 1,
    title: 'X は Y です',
    goal: 'Say what something or someone is: I am a student.',
    sections: [
      {
        title: 'X is Y',
        text: 'The simplest Japanese sentence is X は Y です: "X is Y". は marks the topic, what you are talking about, and here it is read "wa". です ends the sentence politely, a little like "is".',
        examples: [
          { ja: '私[わたし]は学生[がくせい]です。', en: 'I am a student.' },
          { ja: '父[ちち]は先生[せんせい]です。', en: 'My father is a teacher.' },
          { ja: '母[はは]は医者[いしゃ]です。', en: 'My mother is a doctor.' },
        ],
      },
      {
        title: 'Leaving out the topic',
        text: 'Once it is clear who or what you mean, Japanese leaves it out. On its own, がくせいです can mean "I am a student".',
        examples: [
          { ja: '学生[がくせい]です。', en: '(I) am a student.' },
          { ja: '先生[せんせい]です。', en: '(She) is a teacher.' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '私[わたし]＿学生[がくせい]です。', en: 'I am a student.', options: ['は', 'を', 'に', 'で'], answer: 'は', explain: 'は marks the topic: わたしは, "as for me".' },
      { kind: 'choose', prompt: '父[ちち]は先生[せんせい]＿。', en: 'My father is a teacher.', options: ['です', 'ます', 'か', 'の'], answer: 'です', explain: 'です ends the sentence: "is".' },
      {
        kind: 'meaning',
        ja: '母[はは]は医者[いしゃ]です。',
        options: ['My mother is a doctor.', 'My father is a teacher.', 'I am a doctor.', 'My mother is a student.'],
        answer: 'My mother is a doctor.',
        explain: 'はは is "my mother", いしゃ "a doctor".',
      },
      { kind: 'order', en: 'My friend is a student.', pieces: ['友達[ともだち]は', '学生[がくせい]', 'です。'], explain: 'Topic first, then what it is, then です.' },
      {
        kind: 'meaning',
        ja: '先生[せんせい]です。',
        options: ['(They) are a teacher.', 'I am a student.', 'This is a book.', 'My father is a doctor.'],
        answer: '(They) are a teacher.',
        explain: 'The topic is left out: whoever we are talking about is a teacher.',
      },
    ],
    words: ['私', '学生', '父', '先生', '母', '医者', '友達'],
  },
  {
    id: 'ka',
    unit: 1,
    title: 'Questions with か',
    goal: 'Ask yes-or-no questions, and who or what.',
    sections: [
      {
        title: 'Add か to ask',
        text: 'To ask a yes-or-no question, put か at the end. Nothing else changes: the words stay in the same order, and your voice rises at the end.',
        examples: [
          { ja: '学生[がくせい]ですか。', en: 'Are you a student?' },
          { ja: 'あなたは先生[せんせい]ですか。', en: 'Are you a teacher?' },
        ],
      },
      {
        title: 'はい and いいえ',
        text: 'Answer with はい (yes) or いいえ (no), then say what is true.',
        examples: [
          { ja: 'はい、学生[がくせい]です。', en: 'Yes, I am a student.' },
          { ja: 'いいえ、先生[せんせい]です。', en: 'No, I am a teacher.' },
        ],
      },
      {
        title: 'What and who',
        text: 'Question words go where the answer would go: なん (what) and だれ (who). The sentence still ends in ですか.',
        examples: [
          { ja: 'これは何[なん]ですか。', en: 'What is this?' },
          { ja: 'あの人[ひと]は誰[だれ]ですか。', en: 'Who is that person?' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '学生[がくせい]です＿。', en: 'Are you a student?', options: ['か', 'は', 'も', 'の'], answer: 'か', explain: 'か at the end makes a question.' },
      { kind: 'choose', prompt: '＿、学生[がくせい]です。', en: 'Yes, I am a student.', options: ['はい', 'いいえ', '何[なん]', '誰[だれ]'], answer: 'はい', explain: 'はい is "yes".' },
      {
        kind: 'meaning',
        ja: 'あの人[ひと]は誰[だれ]ですか。',
        options: ['Who is that person?', 'What is that?', 'Is that person a student?', 'Where is that person?'],
        answer: 'Who is that person?',
        explain: 'だれ is "who"; あのひと, "that person".',
      },
      { kind: 'choose', prompt: 'これは＿ですか。', en: 'What is this?', options: ['何[なん]', '誰[だれ]', 'どこ', 'はい'], answer: '何[なん]', explain: 'なん is "what".' },
      { kind: 'order', en: 'Are you a teacher?', pieces: ['あなたは', '先生[せんせい]', 'ですか。'], explain: 'A sentence with か at the end.' },
    ],
    words: ['学生', 'あなた', '先生', 'はい', 'いいえ', 'これ', '何', 'あの', '人', '誰'],
  },
  {
    id: 'no',
    unit: 1,
    title: 'の: my, your, of',
    goal: 'Say whose something is: my book, the teacher’s car.',
    sections: [
      {
        title: 'Noun の noun',
        text: 'の joins two nouns, like "\'s" or "of" in English: the first says whose, or what kind, the second is.',
        examples: [
          { ja: '私[わたし]の本[ほん]', en: 'my book' },
          { ja: '先生[せんせい]の車[くるま]', en: "the teacher's car" },
          { ja: '日本[にほん]の車[くるま]', en: 'a Japanese car' },
        ],
      },
      {
        title: 'In a sentence',
        text: 'The whole の phrase fits where any noun would.',
        examples: [
          { ja: 'これは私[わたし]の時計[とけい]です。', en: 'This is my watch.' },
          { ja: '友達[ともだち]の犬[いぬ]です。', en: "It's my friend's dog." },
        ],
      },
      {
        title: 'Whose?',
        text: 'だれの asks whose.',
        examples: [{ ja: '誰[だれ]の本[ほん]ですか。', en: 'Whose book is it?' }],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '私[わたし]＿本[ほん]', en: 'my book', options: ['の', 'は', 'を', 'か'], answer: 'の', explain: 'の joins the nouns: わたしのほん, "my book".' },
      {
        kind: 'meaning',
        ja: '先生[せんせい]の車[くるま]です。',
        options: ["It's the teacher's car.", 'The teacher is in the car.', "It's my car.", "Is it the teacher's car?"],
        answer: "It's the teacher's car.",
        explain: 'せんせいのくるま: the teacher\'s car.',
      },
      { kind: 'choose', prompt: '＿の時計[とけい]ですか。', en: 'Whose watch is it?', options: ['誰[だれ]', '何[なん]', 'どこ', 'これ'], answer: '誰[だれ]', explain: 'だれの: whose.' },
      { kind: 'order', en: "It's my friend's dog.", pieces: ['友達[ともだち]の', '犬[いぬ]', 'です。'], explain: 'ともだちの comes before the dog it describes.' },
      { kind: 'choose', prompt: '日本[にほん]＿車[くるま]です。', en: "It's a Japanese car.", options: ['の', 'は', 'か', 'も'], answer: 'の', explain: 'にほんのくるま: a car of Japan.' },
    ],
    words: ['私', '本', '先生', '車', '日本', 'これ', '時計', '友達', '犬', '誰'],
  },
  {
    id: 'kore',
    unit: 1,
    title: 'これ・それ・あれ',
    goal: 'Point things out: this, that, and that over there.',
    sections: [
      {
        title: 'This, that, that over there',
        text: 'これ is something near you. それ is near the person you are talking to. あれ is far from you both. どれ asks "which one?".',
        examples: [
          { ja: 'これは水[みず]です。', en: 'This is water.' },
          { ja: 'それは何[なん]ですか。', en: 'What is that?' },
          { ja: 'あれは駅[えき]です。', en: 'That (over there) is the station.' },
        ],
      },
      {
        title: 'Which one?',
        text: 'どれ asks which of several things.',
        examples: [
          { ja: 'どれですか。', en: 'Which one is it?' },
          { ja: '私[わたし]の本[ほん]はどれですか。', en: 'Which one is my book?' },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '＿は私[わたし]の時計[とけい]です。', en: 'This is my watch.', options: ['これ', 'それ', 'あれ', 'どれ'], answer: 'これ', explain: 'Near you: これ.' },
      { kind: 'choose', prompt: '＿は駅[えき]です。', en: 'That (over there) is the station.', options: ['あれ', 'これ', 'それ', 'どれ'], answer: 'あれ', explain: 'Far from you both: あれ.' },
      {
        kind: 'meaning',
        ja: 'それは何[なん]ですか。',
        options: ['What is that (near you)?', 'What is this?', 'Which one is it?', 'Is that a book?'],
        answer: 'What is that (near you)?',
        explain: 'それ: near the person you are talking to.',
      },
      { kind: 'choose', prompt: '先生[せんせい]の本[ほん]は＿ですか。', en: "Which one is the teacher's book?", options: ['どれ', 'これ', '何[なん]', '誰[だれ]'], answer: 'どれ', explain: 'どれ: which one.' },
      { kind: 'order', en: 'That is water.', pieces: ['それは', '水[みず]', 'です。'], explain: 'それは comes first, as the topic.' },
    ],
    words: ['これ', 'それ', 'あれ', 'どれ', '水', '何', '駅', '私', '本', '時計', '先生'],
  },
  {
    id: 'kono',
    unit: 1,
    title: 'この・その・あの + noun',
    goal: 'Say this book, that car, that person over there.',
    sections: [
      {
        title: 'This book, that car',
        text: 'これ, それ and あれ stand on their own. Before a noun, use この, その and あの instead: このほん is "this book".',
        examples: [
          { ja: 'この本[ほん]は私[わたし]のです。', en: 'This book is mine.' },
          { ja: 'その時計[とけい]は高[たか]いです。', en: 'That watch is expensive.' },
          { ja: 'あの人[ひと]は先生[せんせい]です。', en: 'That person is a teacher.' },
        ],
      },
      {
        title: 'Which ...?',
        text: 'どの before a noun asks which one.',
        examples: [{ ja: 'どの車[くるま]ですか。', en: 'Which car is it?' }],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '＿本[ほん]は高[たか]いです。', en: 'This book is expensive.', options: ['この', 'これ', 'その', 'どの'], answer: 'この', explain: 'Before a noun: この, not これ.' },
      { kind: 'choose', prompt: '＿は高[たか]いです。', en: 'This is expensive.', options: ['これ', 'この', 'それ', 'その'], answer: 'これ', explain: 'On its own: これ.' },
      {
        kind: 'meaning',
        ja: 'あの店[みせ]は安[やす]いです。',
        options: ['That shop (over there) is cheap.', 'This shop is expensive.', 'That shop is mine.', 'Is that shop cheap?'],
        answer: 'That shop (over there) is cheap.',
        explain: 'あのみせ: that shop over there; やすい, cheap.',
      },
      { kind: 'choose', prompt: '＿車[くるま]ですか。', en: 'Which car is it?', options: ['どの', 'どれ', 'この', '何[なん]'], answer: 'どの', explain: 'Before a noun: どの.' },
      { kind: 'order', en: 'That watch (near you) is expensive.', pieces: ['その', '時計[とけい]は', '高[たか]いです。'], explain: 'その goes right before the noun it points at.' },
    ],
    words: ['この', 'その', 'あの', 'どの', 'これ', '本', '私', '時計', '高い', '人', '先生', '車', '店', '安い'],
  },
  {
    id: 'koko',
    unit: 1,
    title: 'ここ・そこ・あそこ',
    goal: 'Ask where something is, and answer.',
    sections: [
      {
        title: 'Here, there, over there',
        text: 'The same pattern again, for places: ここ is here, そこ is there (near you), あそこ is over there. どこ asks where.',
        examples: [
          { ja: 'ここは教室[きょうしつ]です。', en: 'This (place) is the classroom.' },
          { ja: 'トイレはあそこです。', en: 'The toilet is over there.' },
          { ja: '駅[えき]はどこですか。', en: 'Where is the station?' },
        ],
      },
      {
        title: 'Asking where',
        text: 'X は どこですか asks where X is. Answer with ここ, そこ or あそこ.',
        examples: [
          { ja: '病院[びょういん]はどこですか。', en: 'Where is the hospital?' },
          { ja: 'そこです。', en: "It's there." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: 'トイレは＿ですか。', en: 'Where is the toilet?', options: ['どこ', 'ここ', '何[なん]', '誰[だれ]'], answer: 'どこ', explain: 'どこ: where.' },
      { kind: 'choose', prompt: '駅[えき]は＿です。', en: 'The station is over there.', options: ['あそこ', 'ここ', 'そこ', 'どこ'], answer: 'あそこ', explain: 'Far from you both: あそこ.' },
      {
        kind: 'meaning',
        ja: 'ここは私[わたし]の部屋[へや]です。',
        options: ['This is my room.', 'Where is my room?', 'My room is over there.', 'That is my house.'],
        answer: 'This is my room.',
        explain: 'ここ, this place; わたしのへや, my room.',
      },
      { kind: 'order', en: 'Where is the hospital?', pieces: ['病院[びょういん]は', 'どこ', 'ですか。'], explain: 'Topic, then どこですか.' },
      { kind: 'choose', prompt: '＿です。', en: "It's here.", options: ['ここ', 'これ', 'この', 'どこ'], answer: 'ここ', explain: 'A place: ここ. (これ is a thing.)' },
    ],
    words: ['ここ', 'そこ', 'あそこ', 'どこ', '教室', 'トイレ', '駅', '病院', '私', '部屋'],
  },
  {
    id: 'mo',
    unit: 1,
    title: 'も and じゃないです',
    goal: 'Say "too", and say what something is not.',
    sections: [
      {
        title: 'も: too, also',
        text: 'も means "too" or "also". It takes the place of は: わたしもがくせいです, "I am a student too".',
        examples: [
          { ja: '私[わたし]も学生[がくせい]です。', en: 'I am a student too.' },
          { ja: '父[ちち]も医者[いしゃ]です。', en: 'My father is a doctor too.' },
        ],
      },
      {
        title: 'じゃないです: is not',
        text: 'To say X is not Y, change です to じゃないです. (じゃありません is more formal; you will hear both.)',
        examples: [
          { ja: '私[わたし]は先生[せんせい]じゃないです。', en: 'I am not a teacher.' },
          { ja: 'これは私[わたし]の本[ほん]じゃないです。', en: "This isn't my book." },
        ],
      },
    ],
    exercises: [
      { kind: 'choose', prompt: '母[はは]＿先生[せんせい]です。', en: 'My mother is a teacher too.', options: ['も', 'は', 'の', 'か'], answer: 'も', explain: 'も in place of は: "too".' },
      { kind: 'choose', prompt: '私[わたし]は医者[いしゃ]＿。', en: "I'm not a doctor.", options: ['じゃないです', 'です', 'ですか', 'もです'], answer: 'じゃないです', explain: 'じゃないです: is not.' },
      {
        kind: 'meaning',
        ja: '友達[ともだち]も学生[がくせい]です。',
        options: ['My friend is a student too.', 'My friend is a student.', "My friend isn't a student.", 'Is my friend a student?'],
        answer: 'My friend is a student too.',
        explain: 'も: too.',
      },
      { kind: 'order', en: "That isn't my watch.", pieces: ['それは', '私[わたし]の時計[とけい]', 'じゃないです。'], explain: 'じゃないです in place of です.' },
      {
        kind: 'meaning',
        ja: 'これは水[みず]じゃないです。',
        options: ["This isn't water.", 'This is water too.', 'Is this water?', 'That is water.'],
        answer: "This isn't water.",
        explain: 'じゃないです: is not.',
      },
    ],
    words: ['私', '学生', '父', '医者', '母', '先生', '友達', 'それ', '時計', 'これ', '本', '水'],
  },
];
