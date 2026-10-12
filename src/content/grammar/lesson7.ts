import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 7, かぞくのしゃしん (Family Picture): ～ている for what's going on and for how
// things are, describing people, joining descriptions, going to do something, and counting
// people.
export const LESSON_7: GrammarLesson = {
  id: 'genki-7',
  lesson: 7,
  title: 'Family Picture',
  goal: 'Describe people and what they are doing: My sister lives in Tokyo. Mary has long hair.',
  points: [
    {
      title: '～ている: going on now',
      text: 'て-form + いる says an action is going on: "is …ing". たべています, "is eating". Asked "what are you doing?", answer with ています.',
      examples: [
        { ja: 'たけしさんはテレビを見[み]ています。', en: 'Takeshi is watching TV.' },
        { ja: '今[いま]何[なに]をしていますか。', en: 'What are you doing now?' },
      ],
      say: [
        s('Takeshi is watching TV.', 'たけし さん は テレビ を 見[み]て います。'),
        s('What are you doing now?', '今[いま] 何[なに] を して います か。'),
        s('I’m studying Japanese.', '日本語[にほんご] を 勉強[べんきょう] して います。'),
        s('My older sister is singing a song.', '姉[あね] は 歌[うた] を 歌[うた]って います。', 'Your own older sister, to others, is あね.'),
        s('The children are playing in the park.', '子供[こども] は 公園[こうえん] で 遊[あそ]んで います。'),
        s('Mary is drinking coffee in the cafeteria.', 'メアリー さん は 食堂[しょくどう] で コーヒー を 飲[の]んで います。'),
      ],
    },
    {
      title: '～ている: how things are now',
      text: 'With verbs of change, ている says what state someone is in after it: けっこんしています (is married), すんでいます (lives), しっています (knows), ふとっています (is overweight), やせています (is thin). Note しりません, "I don’t know", has no ている.',
      examples: [
        { ja: '姉[あね]は結婚[けっこん]しています。', en: 'My older sister is married.' },
        { ja: '父[ちち]は会社[かいしゃ]で働[はたら]いています。', en: 'My father works for a company.' },
      ],
      say: [
        s('My older sister is married.', '姉[あね] は 結婚[けっこん] して います。'),
        s('My father works for a company.', '父[ちち] は 会社[かいしゃ] で 働[はたら]いて います。'),
        s('Where do you live?', 'どこ に 住[す]んで います か。'),
        s('My family lives in America.', '家族[かぞく] は アメリカ に 住[す]んで います。'),
        s('Do you know Takeshi?', 'たけし さん を 知[し]って います か。'),
        s('No, I don’t know (him).', 'いいえ、知[し]りません。', 'Not しっていません.'),
        s('My younger brother is thin.', '弟[おとうと] は やせて います。'),
        s('Mary is wearing glasses.', 'メアリー さん は 眼鏡[めがね] を かけて います。'),
      ],
    },
    {
      title: 'Describing people: X は Y が …',
      text: 'To describe someone by a feature: メアリーさんは かみが ながいです, "Mary has long hair" (as for Mary, her hair is long). The same goes for せが たかい (tall), あたまが いい (smart), めが きれい.',
      examples: [
        { ja: 'メアリーさんは髪[かみ]が長[なが]いです。', en: 'Mary has long hair.' },
        { ja: '兄[あに]は背[せ]が高[たか]いです。', en: 'My older brother is tall.' },
      ],
      say: [
        s('Mary has long hair.', 'メアリー さん は 髪[かみ] が 長[なが]い です。'),
        s('My older brother is tall.', '兄[あに] は 背[せ] が 高[たか]い です。'),
        s('Takeshi is smart.', 'たけし さん は 頭[あたま] が いい です。'),
        s('My younger sister has short hair.', '妹[いもうと] は 髪[かみ] が 短[みじか]い です。'),
        s('My mother has beautiful eyes.', '母[はは] は 目[め] が きれい です。'),
        s('I am short.', '私[わたし] は 背[せ] が 低[ひく]い です。'),
      ],
    },
    {
      title: 'Joining descriptions: ～くて and ～で',
      text: 'To join descriptions ("… and …"), い-adjectives end in くて: やすくて おいしい (cheap and tasty); いい → よくて. な-adjectives and nouns take で: しずかで きれい, がくせいで.',
      examples: [
        { ja: 'この食堂[しょくどう]は安[やす]くておいしいです。', en: 'This cafeteria is cheap and good.' },
        { ja: 'たけしさんは親切[しんせつ]で、おもしろいです。', en: 'Takeshi is kind and funny.' },
      ],
      say: [
        s('This cafeteria is cheap and good.', 'この 食堂[しょくどう] は 安[やす]くて おいしい です。'),
        s('Takeshi is kind and funny.', 'たけし さん は 親切[しんせつ] で、面白[おもしろ]い です。'),
        s('The room is quiet and clean.', '部屋[へや] は 静[しず]か で、きれい です。'),
        s('My car is old and small.', '私[わたし] の 車[くるま] は 古[ふる]くて 小[ちい]さい です。'),
        s('Mary is an international student and an American.', 'メアリー さん は 留学生[りゅうがくせい] で、アメリカ人[じん] です。'),
        s('My older brother is tall and cool.', '兄[あに] は 背[せ] が 高[たか]くて、かっこいい です。'),
      ],
    },
    {
      title: 'Going to do: ～にいく',
      text: 'The ます stem (the verb before ます) + に いく/くる says the purpose of going or coming: たべに いきます, "go to eat". The place takes に or へ: デパートへ かいものに いきます.',
      examples: [
        { ja: '食堂[しょくどう]に昼[ひる]ご飯[はん]を食[た]べに行[い]きます。', en: 'I go to the cafeteria to eat lunch.' },
        { ja: '友達[ともだち]が遊[あそ]びに来[き]ました。', en: 'A friend came to hang out.' },
      ],
      say: [
        s('I go to the cafeteria to eat lunch.', '食堂[しょくどう] に 昼[ひる]ご飯[はん] を 食[た]べ に 行[い]きます。'),
        s('I went to the department store to buy shoes.', 'デパート に 靴[くつ] を 買[か]い に 行[い]きました。'),
        s('I’ll go to the library to borrow a book.', '図書館[としょかん] に 本[ほん] を 借[か]り に 行[い]きます。'),
        s('A friend came to my home to play.', '友達[ともだち] が うち に 遊[あそ]び に 来[き]ました。'),
        s('Shall we go see a movie?', '映画[えいが] を 見[み] に 行[い]きましょう か。'),
      ],
    },
    {
      title: 'Counting people',
      text: 'People are counted with にん, but one and two are special: ひとり, ふたり, then さんにん, よにん, ごにん. Ask with なんにん.',
      examples: [
        { ja: '兄弟[きょうだい]が二人[ふたり]います。', en: 'I have two siblings.' },
        { ja: '何[なん]人[にん]家族[かぞく]ですか。', en: 'How many people are in your family?' },
      ],
      say: [
        s('I have two siblings.', '兄弟[きょうだい] が 二人[ふたり] います。'),
        s('I have one older sister.', '姉[あね] が 一人[ひとり] います。'),
        s('There are three people in the room.', '部屋[へや] に 三[さん]人[にん] います。'),
        s('How many people are there?', '何[なん]人[にん] います か。'),
        s('There are five people in my family.', '家族[かぞく] は 五[ご]人[にん] です。'),
      ],
    },
  ],
};
