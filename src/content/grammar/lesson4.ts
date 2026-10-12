import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 4, はじめてのデート (The First Date): there is, where things are, the past, も,
// how long, a lot, and with.
export const LESSON_4: GrammarLesson = {
  id: 'genki-4',
  lesson: 4,
  title: 'The First Date',
  goal: 'Say what is where, and talk about what you did: There is a cat under the desk. I waited for one hour.',
  points: [
    {
      title: 'あります・います',
      text: 'X が あります means "there is X" for things, and X が います for people and animals. To say where, put the place first with に: こうえんに いぬが います. あります also means "have": じゅぎょうが あります, "I have a class".',
      examples: [
        { ja: 'あそこにスーパーがあります。', en: 'There is a supermarket over there.' },
        { ja: '公園[こうえん]に犬[いぬ]がいます。', en: 'There is a dog in the park.' },
      ],
      say: [
        s('There is a supermarket over there.', 'あそこ に スーパー が あります。'),
        s('There is a dog in the park.', '公園[こうえん] に 犬[いぬ] が います。'),
        s('Is there a hospital near here?', 'この 近[ちか]く に 病院[びょういん] が あります か。'),
        s('I have a class tomorrow.', '明日[あした] クラス が あります。'),
        s('There is a child at the temple.', 'お寺[てら] に 子供[こども] が います。'),
        s('I have a part-time job on Saturday.', '土曜日[どようび] に アルバイト が あります。'),
      ],
    },
    {
      title: 'Where things are',
      text: 'To say where something is: X は Y の うえ です, "X is on top of Y". The place words are うえ (on), した (under), なか (in), まえ (in front of), うしろ (behind), みぎ (right of), ひだり (left of), ちかく (near), となり (next to), and あいだ (between: A と B の あいだ).',
      examples: [
        { ja: 'ねこはつくえの下[した]です。', en: 'The cat is under the desk.' },
        { ja: '銀行[ぎんこう]は病院[びょういん]の隣[となり]です。', en: 'The bank is next to the hospital.' },
      ],
      say: [
        s('The cat is under the desk.', '猫[ねこ] は 机[つくえ] の 下[した] です。'),
        s('The bank is next to the hospital.', '銀行[ぎんこう] は 病院[びょういん] の 隣[となり] です。'),
        s('My umbrella is in my bag.', '私[わたし] の 傘[かさ] は かばん の 中[なか] です。'),
        s('The bus stop is in front of the bookstore.', 'バス停[てい] は 本屋[ほんや] の 前[まえ] です。'),
        s('The post office is between the library and the bank.', '郵便局[ゆうびんきょく] は 図書館[としょかん] と 銀行[ぎんこう] の 間[あいだ] です。'),
        s('There is a dog behind the chair.', 'いす の 後[うし]ろ に 犬[いぬ] が います。'),
        s('The restaurant is to the right of the hotel.', 'レストラン は ホテル の 右[みぎ] です。'),
      ],
    },
    {
      title: 'でした: the past of です',
      text: 'The past of です is でした: "was". "Was not" is じゃなかったです.',
      examples: [
        { ja: '昨日[きのう]は月曜日[げつようび]でした。', en: 'Yesterday was Monday.' },
        { ja: '先生[せんせい]は日本人[にほんじん]じゃなかったです。', en: 'The teacher was not Japanese.' },
      ],
      say: [
        s('Yesterday was Monday.', '昨日[きのう] は 月曜日[げつようび] でした。'),
        s('The teacher was not Japanese.', '先生[せんせい] は 日本人[にほんじん] じゃ なかった です。'),
        s('Takeshi’s father was a lawyer.', 'たけし さん の お父[とう]さん は 弁護士[べんごし] でした。'),
        s('It was not an expensive book.', '高[たか]い 本[ほん] じゃ なかった です。'),
        s('Was it Tuesday?', '火曜日[かようび] でした か。'),
      ],
    },
    {
      title: 'Verbs in the past: ました',
      text: 'For the past, change ます to ました (did) and ません to ませんでした (didn’t).',
      examples: [
        { ja: '昨日[きのう]レポートを書[か]きました。', en: 'I wrote a paper yesterday.' },
        { ja: '先週[せんしゅう]は勉強[べんきょう]しませんでした。', en: 'I didn’t study last week.' },
      ],
      say: [
        s('I took pictures yesterday.', '昨日[きのう] 写真[しゃしん] を 撮[と]りました。'),
        s('I didn’t study last week.', '先週[せんしゅう] は 勉強[べんきょう] しませんでした。'),
        s('I met Takeshi at the park.', '公園[こうえん] で たけし さん に 会[あ]いました。', 'Meeting someone takes に: たけしさんに あいます.'),
        s('I bought bread at the supermarket.', 'スーパー で パン を 買[か]いました。'),
        s('What did you do on the weekend?', '週末[しゅうまつ] 何[なに] を しました か。'),
        s('I didn’t eat breakfast.', '朝[あさ]ご飯[はん] を 食[た]べませんでした。'),
        s('I wrote a paper on Friday.', '金曜日[きんようび] に レポート を 書[か]きました。'),
      ],
    },
    {
      title: 'も after other particles',
      text: 'も (also) takes the place of は, が and を: わたしも, ねこも います, パンも かいました. With other particles it goes after them: こうえんでも, にちようびにも.',
      examples: [
        { ja: 'パンも買[か]いました。', en: 'I bought bread too.' },
        { ja: '日曜日[にちようび]にも勉強[べんきょう]しました。', en: 'I studied on Sunday too.' },
      ],
      say: [
        s('I bought bread too.', 'パン も 買[か]いました。'),
        s('There is a cat too.', '猫[ねこ] も います。'),
        s('I studied on Sunday too.', '日曜日[にちようび] に も 勉強[べんきょう] しました。'),
        s('I took pictures at the temple too.', 'お寺[てら] で も 写真[しゃしん] を 撮[と]りました。'),
        s('I went to the park too.', '公園[こうえん] に も 行[い]きました。'),
      ],
    },
    {
      title: 'How long: じかん and ぐらい',
      text: 'じかん counts hours: いちじかん (one hour), にじかん. ぐらい after it means "about". A length of time takes no particle: いちじかん まちました.',
      examples: [
        { ja: '一時間[いちじかん]待[ま]ちました。', en: 'I waited for one hour.' },
        { ja: '毎日[まいにち]三[さん]時間[じかん]ぐらい勉強[べんきょう]します。', en: 'I study about three hours every day.' },
      ],
      say: [
        s('I waited for one hour.', '一時間[いちじかん] 待[ま]ちました。'),
        s('I study about three hours every day.', '毎日[まいにち] 三[さん]時間[じかん] ぐらい 勉強[べんきょう] します。'),
        s('I watched TV for about two hours.', '二[に]時間[じかん] ぐらい テレビ を 見[み]ました。'),
        s('How many hours did you wait?', '何[なん]時間[じかん] 待[ま]ちました か。'),
        s('I slept about seven hours.', '七[なな]時間[じかん] ぐらい 寝[ね]ました。'),
      ],
    },
    {
      title: 'たくさん',
      text: 'たくさん means "a lot" or "many". It usually goes right before the verb: しゃしんを たくさん とりました. Before a noun it takes の: たくさんの しゃしん.',
      examples: [
        { ja: '写真[しゃしん]をたくさん撮[と]りました。', en: 'I took a lot of pictures.' },
        { ja: '公園[こうえん]に子供[こども]がたくさんいます。', en: 'There are a lot of children in the park.' },
      ],
      say: [
        s('I took a lot of pictures.', '写真[しゃしん] を たくさん 撮[と]りました。'),
        s('There are a lot of children in the park.', '公園[こうえん] に 子供[こども] が たくさん います。'),
        s('I bought a lot of books.', '本[ほん] を たくさん 買[か]いました。'),
        s('There are a lot of temples in this town.', 'この 町[まち] に は お寺[てら] が たくさん あります。'),
        s('I drank a lot of coffee.', 'コーヒー を たくさん 飲[の]みました。'),
      ],
    },
    {
      title: 'と: with, and',
      text: 'と after a person means "(together) with": ともだちと いきました. Between nouns it means "and": パンと コーヒー. ひとりで means "alone".',
      examples: [
        { ja: '友達[ともだち]と映画[えいが]を見[み]ました。', en: 'I saw a movie with a friend.' },
        { ja: 'パンとコーヒーを買[か]いました。', en: 'I bought bread and coffee.' },
      ],
      say: [
        s('I saw a movie with a friend.', '友達[ともだち] と 映画[えいが] を 見[み]ました。'),
        s('I bought bread and coffee.', 'パン と コーヒー を 買[か]いました。'),
        s('I ate lunch with Takeshi.', 'たけし さん と 昼[ひる]ご飯[はん] を 食[た]べました。'),
        s('I went to the temple alone.', '一人[ひとり] で お寺[てら] に 行[い]きました。'),
        s('There is a dog and a cat at my home.', 'うち に 犬[いぬ] と 猫[ねこ] が います。'),
      ],
    },
  ],
};
