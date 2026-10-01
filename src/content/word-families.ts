// Word families: words for the same thing that differ by who's talking, to whom, and how
// politely. Japanese has humble words for yourself and your own family, respectful words for
// others, and casual ones for friends, so "mother" or "I" come in several kinds. Each word
// card in a family shows the whole family, with its own word picked out.
//
// `word` and `reading` are as the deck has them, when the word is in the deck (checked in
// word-families.test.ts); a few common ones that aren't in the deck are listed too.

export type FamilyMember = { word: string; reading: string; when: string };

export type WordFamily = {
  id: string;
  title: string; // 'Ways to say "mother"'
  about: string;
  members: readonly FamilyMember[];
};

export const WORD_FAMILIES: readonly WordFamily[] = [
  {
    id: 'mother',
    title: 'Ways to say "mother"',
    about: "Japanese talks about family in two ways: humble words for your own family when talking to others, and polite ones for someone else's family.",
    members: [
      { word: '母', reading: 'はは', when: 'Your own mother, when talking to others: "my mother". Humble.' },
      { word: 'お母さん', reading: 'おかあさん', when: "Someone else's mother. Also what you call your own mother, and how you talk about her at home." },
      { word: '母さん', reading: 'かあさん', when: 'Calling your own mother, a little more casually.' },
      { word: 'ママ', reading: 'ママ', when: 'Mom, mommy: children, and many adults at home.' },
      { word: '母親', reading: 'ははおや', when: 'Mother as a role, neutral and a little formal: "a mother\'s love", or in the news.' },
      { word: 'おふくろ', reading: 'おふくろ', when: 'Casual, mostly men, about their own mother.' },
    ],
  },
  {
    id: 'father',
    title: 'Ways to say "father"',
    about: "Like mother: humble for your own father when talking to others, polite for someone else's.",
    members: [
      { word: '父', reading: 'ちち', when: 'Your own father, when talking to others: "my father". Humble.' },
      { word: 'お父さん', reading: 'おとうさん', when: "Someone else's father. Also what you call your own father, and how you talk about him at home." },
      { word: '父さん', reading: 'とうさん', when: 'Calling your own father, a little more casually.' },
      { word: 'パパ', reading: 'パパ', when: 'Dad, daddy: children, and many adults at home.' },
      { word: '父親', reading: 'ちちおや', when: 'Father as a role, neutral and a little formal.' },
      { word: '親父', reading: 'おやじ', when: 'Casual, mostly men, about their own father. Also "old man", the owner of a small shop or bar.' },
    ],
  },
  {
    id: 'i',
    title: 'Ways to say "I"',
    about: 'Japanese has many words for "I", and the one you choose says a lot about you. Often the best choice is to leave it out.',
    members: [
      { word: '私', reading: 'わたし', when: 'The safe choice for everyone: polite and neutral.' },
      { word: 'わたくし', reading: 'わたくし', when: 'Very formal: speeches, business, talking to customers.' },
      { word: '僕', reading: 'ぼく', when: 'Boys and men: soft and friendly.' },
      { word: '俺', reading: 'おれ', when: 'Men: casual and rough. With friends, not with a boss.' },
      { word: 'あたし', reading: 'あたし', when: 'Women and girls, casual.' },
      { word: '自分', reading: 'じぶん', when: 'Means "oneself". Some men use it for "I", which sounds stiff or sporty.' },
      { word: 'うち', reading: 'うち', when: 'Casual, mostly young women, especially in western Japan. Also means "our home" or "our company".' },
    ],
  },
  {
    id: 'you',
    title: 'Ways to say "you"',
    about: 'Japanese avoids "you". It\'s usually better to use the person\'s name with さん, or their title, like せんせい. Every word here says something about how you see them.',
    members: [
      { word: 'あなた', reading: 'あなた', when: "Polite but distant; textbooks love it, people mostly don't use it. Wives once used it for their husbands." },
      { word: '君', reading: 'きみ', when: 'From a man to an equal or someone younger. Can sound superior.' },
      { word: 'あんた', reading: 'あんた', when: 'Casual and blunt. Can sound rude.' },
      { word: 'お前', reading: 'おまえ', when: 'Rough: between close male friends, or to someone below you. Rude otherwise.' },
      { word: 'てめえ', reading: 'てめえ', when: 'An insult, mostly in fights (and in anime). Never use it.' },
      { word: '貴様', reading: 'きさま', when: 'An insult, mostly in fights (and in anime). Never use it.' },
    ],
  },
  {
    id: 'siblings',
    title: 'Ways to say brother and sister',
    about: 'Japanese has separate words for older and younger brothers and sisters, and humble and polite versions of each.',
    members: [
      { word: '兄', reading: 'あに', when: 'Your own older brother, when talking to others. Humble.' },
      { word: 'お兄さん', reading: 'おにいさん', when: "Someone else's older brother, or calling your own. Also a friendly way to address a young man." },
      { word: '兄貴', reading: 'あにき', when: 'Casual, mostly men, about their own older brother. Also a boss in gang films.' },
      { word: '姉', reading: 'あね', when: 'Your own older sister, when talking to others. Humble.' },
      { word: 'お姉さん', reading: 'おねえさん', when: "Someone else's older sister, or calling your own. Also a friendly way to address a young woman." },
      { word: '弟', reading: 'おとうと', when: "Younger brother. For someone else's, add さん: おとうとさん." },
      { word: '妹', reading: 'いもうと', when: "Younger sister. For someone else's, add さん: いもうとさん." },
    ],
  },
  {
    id: 'spouses',
    title: 'Ways to say husband and wife',
    about: "Your own husband or wife, and someone else's, take different words, and some old ones are going out of use.",
    members: [
      { word: '夫', reading: 'おっと', when: 'Your own husband: neutral, the modern choice.' },
      { word: '主人', reading: 'しゅじん', when: 'Your own husband, traditional ("master of the house"). For someone else\'s: ごしゅじん.' },
      { word: '旦那', reading: 'だんな', when: "Casual: your own husband, or someone else's as だんなさん." },
      { word: '妻', reading: 'つま', when: 'Your own wife: neutral, the modern choice.' },
      { word: '奥さん', reading: 'おくさん', when: "Someone else's wife." },
      { word: '嫁', reading: 'よめ', when: "Casual, your own wife. Strictly it means daughter-in-law, so some people don't like it." },
      { word: '家内', reading: 'かない', when: 'Your own wife, traditional ("inside the house"). Going out of use.' },
    ],
  },
  {
    id: 'eat',
    title: 'Polite and humble ways to say "eat"',
    about: 'Some verbs change completely when you\'re being polite: respectful forms for what others do, humble forms for what you do.',
    members: [
      { word: '食べる', reading: 'たべる', when: 'Eat: the everyday word.' },
      { word: '食う', reading: 'くう', when: 'Eat, roughly: mostly men, casual.' },
      { word: '召し上がる', reading: 'めしあがる', when: 'Respectful: when someone else, a guest or a customer, eats. どうぞめしあがってください, "please, help yourself".' },
      { word: 'いただく', reading: 'いただく', when: 'Humble: when you eat or drink. That\'s the いただきます said before meals. Also means "to receive".' },
    ],
  },
  {
    id: 'say',
    title: 'Polite and humble ways to say "say"',
    about: 'Respectful for what others say, humble for what you say.',
    members: [
      { word: '言う', reading: 'いう', when: 'Say: the everyday word.' },
      { word: 'おっしゃる', reading: 'おっしゃる', when: 'Respectful: when someone above you says something.' },
      { word: '申す', reading: 'もうす', when: 'Humble: when you say something. ～ともうします, "my name is ～".' },
      { word: '申し上げる', reading: 'もうしあげる', when: 'Even more humble: saying something to someone above you.' },
    ],
  },
  {
    id: 'do',
    title: 'Polite and humble ways to say "do"',
    about: 'Respectful for what others do, humble for what you do, and casual for friends.',
    members: [
      { word: 'する', reading: 'する', when: 'Do: the everyday word.' },
      { word: 'なさる', reading: 'なさる', when: 'Respectful: when someone above you does something.' },
      { word: 'いたす', reading: 'いたす', when: 'Humble: when you do something. よろしくおねがいいたします.' },
      { word: 'やる', reading: 'やる', when: 'Do, casually. Also "give" to someone below you, or to animals and plants.' },
    ],
  },
  {
    id: 'go',
    title: 'Polite and humble ways to say go, come and be',
    about: 'Several everyday verbs share one respectful form and have their own humble ones.',
    members: [
      { word: '行く', reading: 'いく', when: 'Go: the everyday word.' },
      { word: '来る', reading: 'くる', when: 'Come: the everyday word.' },
      { word: 'いる', reading: 'いる', when: 'Be (somewhere), for people and animals: the everyday word.' },
      { word: 'いらっしゃる', reading: 'いらっしゃる', when: 'Respectful: when someone else goes, comes or is somewhere. いらっしゃいませ, "welcome", in every shop.' },
      { word: '参る', reading: 'まいる', when: 'Humble: when you go or come.' },
      { word: '伺う', reading: 'うかがう', when: "Humble: when you visit someone, or ask them something." },
      { word: 'おる', reading: 'おる', when: 'Humble: when you are somewhere. おります.' },
    ],
  },
  {
    id: 'give',
    title: 'Ways to give and receive',
    about: 'Japanese says which way a gift goes, and how polite to be about it.',
    members: [
      { word: 'あげる', reading: 'あげる', when: 'Give: from you (or anyone) to someone else.' },
      { word: 'くれる', reading: 'くれる', when: 'Give: from someone else to you or your family.' },
      { word: 'もらう', reading: 'もらう', when: 'Receive.' },
      { word: 'くださる', reading: 'くださる', when: 'Respectful くれる: someone above you gives you something.' },
      { word: 'いただく', reading: 'いただく', when: 'Humble もらう: you receive from someone above you.' },
      { word: '差し上げる', reading: 'さしあげる', when: 'Humble あげる: you give to someone above you.' },
      { word: 'やる', reading: 'やる', when: 'Give to someone below you, or to animals and plants. Casual.' },
    ],
  },
  {
    id: 'yes-no',
    title: 'Ways to say yes and no',
    about: 'From polite to casual. Japanese often avoids a flat "no", softening it instead.',
    members: [
      { word: 'はい', reading: 'はい', when: 'Yes, polite. Also just "I hear you".' },
      { word: 'ええ', reading: 'ええ', when: 'Yes, softer and more conversational.' },
      { word: 'うん', reading: 'うん', when: 'Yeah: casual.' },
      { word: 'いいえ', reading: 'いいえ', when: 'No, polite, but it can sound blunt; people often soften it instead.' },
      { word: 'いや', reading: 'いや', when: 'No, casual. Also "well..." before disagreeing.' },
      { word: 'ううん', reading: 'ううん', when: 'Nah: casual.' },
    ],
  },
  {
    id: 'people',
    title: 'Ways to say "person"',
    about: 'How you refer to someone shows how much respect you give them.',
    members: [
      { word: '人', reading: 'ひと', when: 'Person: the everyday word.' },
      { word: '方', reading: 'かた', when: 'Person, respectfully: このかた, "this gentleman" or "this lady".' },
      { word: '者', reading: 'もの', when: 'Person, humbly, about yourself or your side: ～というものです.' },
      { word: 'やつ', reading: 'やつ', when: 'Guy, casually. Can be rude about someone.' },
      { word: 'こいつ', reading: 'こいつ', when: 'This guy: casual, often rude. そいつ and あいつ are "that guy".' },
    ],
  },
];
