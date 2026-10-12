import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 11, やすみのあと (After the Vacation): wanting to, things like, having done,
// and A and B (among others).
export const LESSON_11: GrammarLesson = {
  id: 'genki-11',
  lesson: 11,
  title: 'After the Vacation',
  goal: 'Say what you want to do and what you have done: I want to become a singer. Have you ever climbed a mountain?',
  points: [
    {
      title: 'Want to: ～たい',
      text: 'The ます stem + たいです says what you want to do: たべたいです, "I want to eat". It conjugates like an い-adjective: たくないです (don’t want to), たかったです (wanted to). What you want can take が or を.',
      examples: [
        { ja: '温泉[おんせん]に行[い]きたいです。', en: 'I want to go to a hot spring.' },
        { ja: '将来[しょうらい]、歌手[かしゅ]になりたいです。', en: 'In the future, I want to become a singer.' },
      ],
      say: [
        s('I want to go to a hot spring.', '温泉[おんせん] に 行[い]きたい です。'),
        s('In the future, I want to become a singer.', '将来[しょうらい]、歌手[かしゅ] に なりたい です。'),
        s('I don’t want to study today.', '今日[きょう] は 勉強[べんきょう] したくない です。'),
        s('I want to climb a mountain.', '山[やま] に 登[のぼ]りたい です。'),
        s('What do you want to eat?', '何[なに] が 食[た]べたい です か。'),
        s('I wanted to study abroad in Japan.', '日本[にほん] に 留学[りゅうがく] したかった です。'),
        s('I want to own a dog.', '犬[いぬ] を 飼[か]いたい です。'),
      ],
    },
    {
      title: 'Doing things like…: ～たり～たりする',
      text: 'Short past + り, twice, then する, lists a few things among others: えいがを みたり、かいものを したり しました, "I did things like seeing a movie and shopping". The tense goes on the last する.',
      examples: [
        { ja: '週末[しゅうまつ]は映画[えいが]を見[み]たり、買[か]い物[もの]をしたりしました。', en: 'On the weekend I saw a movie, went shopping and so on.' },
        { ja: '週末[しゅうまつ]は本[ほん]を読[よ]んだり、音楽[おんがく]を聞[き]いたりします。', en: 'On weekends, I read books, listen to music, and so on.' },
      ],
      say: [
        s('On the weekend I saw a movie, went shopping and so on.', '週末[しゅうまつ] は 映画[えいが] を 見[み]たり、買[か]い物[もの] を したり しました。'),
        s('I read books, listen to music and so on.', '本[ほん] を 読[よ]んだり、音楽[おんがく] を 聞[き]いたり します。'),
        s('At the festival we danced and ate and so on.', 'お祭[まつ]り で 踊[おど]ったり、食[た]べたり しました。'),
        s('I went camping and fishing and so on.', 'キャンプ を したり、つり を したり しました。'),
        s('On weekends I clean, do laundry and so on.', '週末[しゅうまつ] は 掃除[そうじ] したり、洗濯[せんたく] したり します。'),
        s('I went for a drive and went to a hot spring.', 'ドライブ に 行[い]ったり、温泉[おんせん] に 行[い]ったり しました。'),
      ],
    },
    {
      title: 'Have done: ～ことがある',
      text: 'Short past + ことが あります says you have done something before: やまに のぼったことが あります, "I have climbed a mountain". Ask with ありますか; "never" is ことが ありません.',
      examples: [
        { ja: '外国[がいこく]に行[い]ったことがありますか。', en: 'Have you ever been abroad?' },
        { ja: '日本[にほん]に行[い]ったことがありません。', en: 'I have never been to Japan.' },
      ],
      say: [
        s('Have you ever climbed a mountain?', '山[やま] に 登[のぼ]った こと が あります か。'),
        s('I have never been to Japan.', '日本[にほん] に 行[い]った こと が ありません。'),
        s('I have been late to class.', '授業[じゅぎょう] に 遅刻[ちこく] した こと が あります。'),
        s('Have you ever told a lie?', 'うそ を ついた こと が あります か。'),
        s('I have been to an art museum.', '美術館[びじゅつかん] に 行[い]った こと が あります。'),
        s('I have never cut class.', '授業[じゅぎょう] を サボった こと が ありません。'),
      ],
    },
    {
      title: 'A や B: A and B, among others',
      text: 'や joins nouns like と, but says the list is not complete: "A, B and so on". おかしや ビールを かいました, "I bought snacks, beer and things".',
      examples: [
        { ja: 'お菓子[かし]やビールを買[か]いました。', en: 'I bought snacks, beer and things.' },
        { ja: '神社[じんじゃ]やお寺[てら]に行[い]きました。', en: 'I went to shrines, temples and such.' },
      ],
      say: [
        s('I bought snacks, beer and things.', 'お菓子[かし] や ビール を 買[か]いました。'),
        s('I went to shrines, temples and such.', '神社[じんじゃ] や お寺[てら] に 行[い]きました。'),
        s('There are mountains, rivers and so on.', '山[やま] や 川[かわ] が あります。'),
        s('I want to go to lakes, hot springs and so on.', '湖[みずうみ] や 温泉[おんせん] に 行[い]きたい です。'),
        s('My host family has a dog, a cat and others.', 'ホストファミリー は 犬[いぬ] や 猫[ねこ] を 飼[か]って います。'),
      ],
    },
  ],
};
