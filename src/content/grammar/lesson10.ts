import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 10, ふゆやすみのよてい (Winter Vacation Plans): comparing, "the … one", plans,
// becoming, somewhere and nowhere, and how you get there.
export const LESSON_10: GrammarLesson = {
  id: 'genki-10',
  lesson: 10,
  title: 'Winter Vacation Plans',
  goal: 'Compare things, talk about plans and how you’ll travel: The Shinkansen is faster than the bus.',
  points: [
    {
      title: 'Comparing two: より and のほうが',
      text: 'A は B より … です: "A is more … than B". To ask which of two: A と B と どちらが … ですか. Answer with のほうが: A のほうが … です, "A is more …".',
      examples: [
        { ja: '新幹線[しんかんせん]はバスより速[はや]いです。', en: 'The Shinkansen is faster than the bus.' },
        { ja: '夏[なつ]と冬[ふゆ]とどちらが好[す]きですか。', en: 'Which do you like better, summer or winter?' },
      ],
      say: [
        s('The Shinkansen is faster than the bus.', '新幹線[しんかんせん] は バス より 速[はや]い です。'),
        s('Which do you like better, summer or winter?', '夏[なつ] と 冬[ふゆ] と どちら が 好[す]き です か。'),
        s('I like winter better.', '冬[ふゆ] の ほう が 好[す]き です。'),
        s('The subway is cheaper than the Shinkansen.', '地下鉄[ちかてつ] は 新幹線[しんかんせん] より 安[やす]い です。'),
        s('Which is colder, Tokyo or Osaka?', 'とうきょう と おおさか と どっち が 寒[さむ]い です か。'),
        s('My older brother is older than me.', '兄[あに] は 私[わたし] より 年上[としうえ] です。'),
      ],
    },
    {
      title: 'Comparing three or more: いちばん',
      text: '… の なかで A が いちばん … です: "among …, A is the most …". Ask with a question word and が: きせつの なかで いつが いちばん すきですか.',
      examples: [
        { ja: '季節[きせつ]の中[なか]でいつがいちばん好[す]きですか。', en: 'Which season do you like best?' },
        { ja: '秋[あき]がいちばん好[す]きです。', en: 'I like fall best.' },
      ],
      say: [
        s('Which season do you like best?', '季節[きせつ] の 中[なか] で いつ が 一番[いちばん] 好[す]き です か。'),
        s('I like fall best.', '秋[あき] が 一番[いちばん] 好[す]き です。'),
        s('Among Japanese foods, what do you like best?', '日本[にほん] の 料理[りょうり] の 中[なか] で 何[なに] が 一番[いちばん] 好[す]き です か。'),
        s('Tempura is the most delicious.', '天[てん]ぷら が 一番[いちばん] おいしい です。'),
        s('Who is the tallest in your family?', '家族[かぞく] の 中[なか] で 誰[だれ] が 一番[いちばん] 背[せ] が 高[たか]い です か。'),
        s('Baseball is the most interesting sport.', 'スポーツ の 中[なか] で 野球[やきゅう] が 一番[いちばん] 面白[おもしろ]い です。'),
      ],
    },
    {
      title: 'The … one: adjective + の',
      text: 'の after an adjective stands for a noun already mentioned: あかいの, "the red one"; やすいのを ください, "please give me the cheap one". With な-adjectives: きれいなの. With nouns: わたしの, "mine".',
      examples: [
        { ja: 'どんなかさがいいですか。赤[あか]いのがいいです。', en: 'What kind of umbrella would you like? I’d like a red one.' },
        { ja: '安[やす]いのをください。', en: 'Please give me the cheap one.' },
      ],
      say: [
        s('I’d like a red one.', '赤[あか]い の が いい です。'),
        s('Please give me the cheap one.', '安[やす]い の を ください。'),
        s('This watch is old, so I’ll buy a new one.', 'この 時計[とけい] は 古[ふる]い です から、新[あたら]しい の を 買[か]います。'),
        s('Which gloves are yours? The black ones.', 'どの 手袋[てぶくろ] です か。黒[くろ]い の です。'),
        s('Is there a white one?', '白[しろ]い の が あります か。'),
      ],
    },
    {
      title: 'Plans: ～つもりです',
      text: 'Dictionary form + つもりです says what you intend to do: "I plan to…". Negative: ない form + つもりです, "I don’t plan to…".',
      examples: [
        { ja: '冬[ふゆ]休[やす]みに旅行[りょこう]するつもりです。', en: 'I plan to travel over the winter break.' },
        { ja: '今年[ことし]はうちに帰[かえ]らないつもりです。', en: 'I don’t plan to go home this year.' },
      ],
      say: [
        s('I plan to travel this year.', '今年[ことし] は 旅行[りょこう] する つもり です。'),
        s('I don’t plan to go home this year.', '今年[ことし] は うち に 帰[かえ]らない つもり です。'),
        s('What do you plan to do on the weekend?', '週末[しゅうまつ] は 何[なに] を する つもり です か。'),
        s('I plan to stay at a hotel.', 'ホテル に 泊[と]まる つもり です。'),
        s('I plan to practice Japanese every day.', '毎日[まいにち] 日本語[にほんご] を 練習[れんしゅう] する つもり です。'),
      ],
    },
    {
      title: 'Becoming: ～くなる and ～になる',
      text: 'なる means "become". い-adjectives change い to く: さむく なりました, "it got cold". な-adjectives and nouns take に: げんきに なりました, いしゃに なりたい (lesson 11).',
      examples: [
        { ja: '寒[さむ]くなりましたね。', en: 'It’s gotten cold, hasn’t it?' },
        { ja: '日本語[にほんご]が上手[じょうず]になりました。', en: 'Your Japanese has gotten good.' },
      ],
      say: [
        s('It’s gotten cold, hasn’t it?', '寒[さむ]く なりました ね。'),
        s('My Japanese has gotten better.', '日本語[にほんご] が 上手[じょうず] に なりました。'),
        s('It got warm.', '暖[あたた]かく なりました。'),
        s('I became sleepy.', '眠[ねむ]く なりました。'),
        s('Takeshi became a doctor.', 'たけし さん は 医者[いしゃ] に なりました。'),
        s('The room got clean.', '部屋[へや] が きれい に なりました。'),
      ],
    },
    {
      title: 'Somewhere, nowhere: どこかに and どこにも',
      text: 'どこか is "somewhere", どこも (with a negative) "nowhere". Particles follow: どこかに いきましたか, "did you go somewhere?"; どこにも いきませんでした, "I didn’t go anywhere". The same goes for なにか/なにも and だれか/だれも.',
      examples: [
        { ja: '冬[ふゆ]休[やす]みにどこかに行[い]きましたか。', en: 'Did you go somewhere over the winter break?' },
        { ja: 'いいえ、どこにも行[い]きませんでした。', en: 'No, I didn’t go anywhere.' },
      ],
      say: [
        s('Did you go somewhere on the weekend?', '週末[しゅうまつ] どこか に 行[い]きました か。'),
        s('No, I didn’t go anywhere.', 'いいえ、どこ に も 行[い]きませんでした。'),
        s('Shall we go somewhere?', 'どこか に 行[い]きましょう か。'),
        s('Is there someone in the room?', '部屋[へや] に 誰[だれ]か います か。'),
        s('No, there’s no one.', 'いいえ、誰[だれ]も いません。'),
      ],
    },
    {
      title: 'By: で, and how long it takes',
      text: 'で marks the means: でんしゃで いきます, "go by train". あるいて means "on foot". To ask how long, use どのぐらい かかりますか: "how long does it take?".',
      examples: [
        { ja: '駅[えき]まで地下鉄[ちかてつ]で行[い]きます。', en: 'I go to the station by subway.' },
        { ja: 'うちから学校[がっこう]までどのぐらいかかりますか。', en: 'How long does it take from home to school?' },
      ],
      say: [
        s('I go to the station by subway.', '駅[えき] まで 地下鉄[ちかてつ] で 行[い]きます。'),
        s('How long does it take from home to school?', 'うち から 学校[がっこう] まで どのぐらい かかります か。'),
        s('It takes about an hour on foot.', '歩[ある]いて 一時間[いちじかん] ぐらい かかります。'),
        s('I’ll go to Osaka by Shinkansen.', 'おおさか まで 新幹線[しんかんせん] で 行[い]きます。'),
        s('How do you go to school?', '学校[がっこう] まで どうやって 行[い]きます か。'),
        s('I went by plane.', '飛行機[ひこうき] で 行[い]きました。'),
      ],
    },
  ],
};
