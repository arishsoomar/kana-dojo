import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 5, おきなわりょこう (A Trip to Okinawa): adjectives, now and in the past,
// before nouns, likes and dislikes, let's, and counting flat things.
export const LESSON_5: GrammarLesson = {
  id: 'genki-5',
  lesson: 5,
  title: 'A Trip to Okinawa',
  goal: 'Describe things, now and in the past, and say what you like: The sea was beautiful. I love sushi.',
  points: [
    {
      title: 'Adjectives: い and な',
      text: 'There are two kinds of adjectives. い-adjectives end in い: たかいです (it’s expensive), and the negative drops い for くないです: たかくないです. な-adjectives work like nouns: しずかです, しずかじゃないです. いい (good) is irregular: よくないです.',
      examples: [
        { ja: 'このへやは大[おお]きいです。', en: 'This room is big.' },
        { ja: '宿題[しゅくだい]は難[むずか]しくないです。', en: 'The homework is not difficult.' },
        { ja: '町[まち]は静[しず]かじゃないです。', en: 'The town is not quiet.' },
      ],
      say: [
        s('This room is big.', 'この 部屋[へや] は 大[おお]きい です。'),
        s('The homework is not difficult.', '宿題[しゅくだい] は 難[むずか]しくない です。'),
        s('Takeshi is energetic.', 'たけし さん は 元気[げんき] です。'),
        s('The town is not quiet.', '町[まち] は 静[しず]か じゃ ない です。'),
        s('The weather is not good.', '天気[てんき] は よくない です。', 'いい becomes よくない.'),
        s('Japanese is interesting.', '日本語[にほんご] は 面白[おもしろ]い です。'),
        s('Are you busy today?', '今日[きょう] は 忙[いそが]しい です か。'),
        s('I’m not free tomorrow.', '明日[あした] は 暇[ひま] じゃ ない です。'),
      ],
    },
    {
      title: 'Adjectives in the past',
      text: 'い-adjectives: たかい → たかかったです (was expensive), たかくなかったです (wasn’t). いい → よかったです. な-adjectives, like nouns: しずかでした, しずかじゃなかったです.',
      examples: [
        { ja: '旅行[りょこう]は楽[たの]しかったです。', en: 'The trip was fun.' },
        { ja: '海[うみ]はきれいでした。', en: 'The sea was beautiful.' },
      ],
      say: [
        s('The trip was fun.', '旅行[りょこう] は 楽[たの]しかった です。'),
        s('The sea was beautiful.', '海[うみ] は きれい でした。', 'きれい ends in い but is a な-adjective.'),
        s('The test was not difficult.', 'テスト は 難[むずか]しくなかった です。'),
        s('The weather was good.', '天気[てんき] は よかった です。'),
        s('It was very hot yesterday.', '昨日[きのう] は とても 暑[あつ]かった です。'),
        s('The movie was boring.', '映画[えいが] は つまらなかった です。'),
        s('The town was not lively.', '町[まち] は にぎやか じゃ なかった です。'),
      ],
    },
    {
      title: 'Adjective + noun',
      text: 'Put an adjective right before a noun to describe it. い-adjectives stay as they are: たかい とけい. な-adjectives take な: しずかな まち. Ask with どんな: "what kind of".',
      examples: [
        { ja: '古[ふる]いお寺[てら]を見[み]ました。', en: 'I saw an old temple.' },
        { ja: '静[しず]かな町[まち]です。', en: 'It’s a quiet town.' },
      ],
      say: [
        s('I saw an old temple.', '古[ふる]い お寺[てら] を 見[み]ました。'),
        s('It’s a quiet town.', '静[しず]かな 町[まち] です。'),
        s('Takeshi is a kind person.', 'たけし さん は やさしい 人[ひと] です。'),
        s('I bought a new watch.', '新[あたら]しい 時計[とけい] を 買[か]いました。'),
        s('What kind of movie did you see?', 'どんな 映画[えいが] を 見[み]ました か。'),
        s('It’s a beautiful room.', 'きれいな 部屋[へや] です。'),
        s('I bought a cheap bag.', '安[やす]い かばん を 買[か]いました。'),
      ],
    },
    {
      title: 'すき and きらい',
      text: 'すき (like) and きらい (dislike) are な-adjectives. What you like takes が: すしが すきです, "I like sushi". だいすき is "love", だいきらい "hate".',
      examples: [
        { ja: '魚[さかな]が好[す]きです。', en: 'I like fish.' },
        { ja: 'どんな音楽[おんがく]が好[す]きですか。', en: 'What kind of music do you like?' },
      ],
      say: [
        s('I like fish.', '魚[さかな] が 好[す]き です。'),
        s('I don’t like vegetables.', '野菜[やさい] が 好[す]き じゃ ない です。'),
        s('I love the sea.', '海[うみ] が 大好[だいす]き です。'),
        s('What kind of music do you like?', 'どんな 音楽[おんがく] が 好[す]き です か。'),
        s('I hate homework.', '宿題[しゅくだい] が 大嫌[だいきら]い です。'),
        s('Takeshi dislikes coffee.', 'たけし さん は コーヒー が 嫌[きら]い です。'),
      ],
    },
    {
      title: 'Let’s: ～ましょう',
      text: 'Change ます to ましょう for "let’s": いきましょう, "let’s go". ましょうか asks "shall we?": いきましょうか.',
      examples: [
        { ja: 'いっしょに出[で]かけましょう。', en: 'Let’s go out together.' },
        { ja: 'バスに乗[の]りましょうか。', en: 'Shall we take the bus?' },
      ],
      say: [
        s('Let’s go out together.', '一緒[いっしょ] に 出[で]かけましょう。'),
        s('Shall we take the bus?', 'バス に 乗[の]りましょう か。', 'You ride on a vehicle: バスに のります.'),
        s('Let’s swim in the sea.', '海[うみ] で 泳[およ]ぎましょう。'),
        s('Shall we eat lunch?', '昼[ひる]ご飯[はん] を 食[た]べましょう か。'),
        s('Let’s take a picture.', '写真[しゃしん] を 撮[と]りましょう。'),
        s('Let’s go surfing.', 'サーフィン を しましょう。'),
      ],
    },
    {
      title: 'Counting flat things: まい',
      text: 'Japanese counts with a counter after the number, which depends on what is counted. まい counts flat things: tickets, shirts, photos, sheets of paper. いちまい, にまい, さんまい. Ask with なんまい.',
      examples: [
        { ja: 'Tシャツを二[に]枚[まい]買[か]いました。', en: 'I bought two T-shirts.' },
        { ja: '写真[しゃしん]を何[なん]枚[まい]撮[と]りましたか。', en: 'How many pictures did you take?' },
      ],
      say: [
        s('I bought one T-shirt.', 'ティーシャツ を 一[いち]枚[まい] 買[か]いました。', 'The number and counter go before the verb, with no particle.'),
        s('How many pictures did you take?', '写真[しゃしん] を 何[なん]枚[まい] 撮[と]りました か。'),
        s('I took three pictures.', '写真[しゃしん] を 三[さん]枚[まい] 撮[と]りました。'),
        s('Please give me two (tickets).', '二[に]枚[まい] ください。'),
        s('I bought two T-shirts.', 'ティーシャツ を 二[に]枚[まい] 買[か]いました。'),
      ],
    },
  ],
};
