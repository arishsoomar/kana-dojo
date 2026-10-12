import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 3, デートのやくそく (Making a Date): verbs in the present tense, the particles
// that go with them, times, invitations, how often, and は for contrast.
export const LESSON_3: GrammarLesson = {
  id: 'genki-3',
  lesson: 3,
  title: 'Making a Date',
  goal: 'Talk about what you do and when, and invite someone: I watch movies on weekends. Won’t you have coffee?',
  points: [
    {
      title: 'Verbs and their ます forms',
      text: 'Japanese verbs end in an u-sound in their dictionary form: たべる, のむ, する. To speak politely, change the ending to ます (do) or ません (don’t). る-verbs drop る: たべる → たべます. う-verbs change their last sound to the い row: のむ → のみます, かえる → かえります. The two irregular verbs are する → します and くる → きます.',
      examples: [
        { ja: '食[た]べる → 食[た]べます → 食[た]べません', en: 'eat → (I) eat → (I) don’t eat' },
        { ja: '飲[の]む → 飲[の]みます → 飲[の]みません', en: 'drink → (I) drink → (I) don’t drink' },
        { ja: 'する → します、来[く]る → 来[き]ます', en: 'do → do; come → come' },
      ],
      say: [
        s('I eat.', '食[た]べます。'),
        s('I don’t eat.', '食[た]べません。'),
        s('I drink.', '飲[の]みます。'),
        s('I go back home.', '帰[かえ]ります。', 'かえる looks like a る-verb but is an う-verb: かえります.'),
        s('I study.', '勉強[べんきょう] します。'),
        s('I come.', '来[き]ます。'),
        s('I don’t read.', '読[よ]みません。'),
        s('I get up.', '起[お]きます。'),
      ],
    },
    {
      title: 'The present tense: habits and the future',
      text: 'The ます form means both what you usually do and what you will do: テレビを みます is "I watch TV" or "I will watch TV". What is happening right now comes later, in lesson 7.',
      examples: [
        { ja: '毎日[まいにち]コーヒーを飲[の]みます。', en: 'I drink coffee every day.' },
        { ja: '明日[あした]テニスをします。', en: 'I will play tennis tomorrow.' },
      ],
      say: [
        s('I drink coffee every day.', '毎日[まいにち] コーヒー を 飲[の]みます。'),
        s('I will play tennis tomorrow.', '明日[あした] テニス を します。'),
        s('I will watch a movie tonight.', '今晩[こんばん] 映画[えいが] を 見[み]ます。'),
        s('I listen to music every night.', '毎晩[まいばん] 音楽[おんがく] を 聞[き]きます。'),
        s('I won’t drink sake.', 'お酒[さけ] を 飲[の]みません。'),
      ],
    },
    {
      title: 'Particles: を, で, に and へ',
      text: 'を marks what an action is done to: コーヒーを のみます. で marks where an action happens: としょかんで べんきょうします. に or へ marks where you go to: がっこうに いきます, がっこうへ いきます (へ is read "e").',
      examples: [
        { ja: '図書館[としょかん]で雑誌[ざっし]を読[よ]みます。', en: 'I read magazines in the library.' },
        { ja: '学校[がっこう]に行[い]きます。', en: 'I go to school.' },
      ],
      say: [
        s('I read magazines in the library.', '図書館[としょかん] で 雑誌[ざっし] を 読[よ]みます。'),
        s('I go to school.', '学校[がっこう] へ 行[い]きます。'),
        s('I go back home.', 'うち に 帰[かえ]ります。'),
        s('I eat hamburgers at a cafe.', 'カフェ で ハンバーガー を 食[た]べます。'),
        s('I speak Japanese at home.', 'うち で 日本語[にほんご] を 話[はな]します。'),
        s('I watch TV at home.', 'うち で テレビ を 見[み]ます。'),
        s('Takeshi comes to the university.', 'たけし さん は 大学[だいがく] に 来[き]ます。'),
      ],
    },
    {
      title: 'Times: に, and ごろ',
      text: 'Clock times and days of the week take に: しちじに おきます, どようびに. Words relative to now (きょう, あした, まいにち, こんばん, しゅうまつ) take no particle. ごろ after a time means "about": じゅういちじごろ.',
      examples: [
        { ja: '七[しち]時[じ]に起[お]きます。', en: 'I get up at seven.' },
        { ja: '十一[じゅういち]時[じ]ごろ寝[ね]ます。', en: 'I go to bed at about eleven.' },
      ],
      say: [
        s('I get up at seven.', '七[しち]時[じ] に 起[お]きます。'),
        s('I go to bed at about eleven.', '十一[じゅういち]時[じ] ごろ 寝[ね]ます。'),
        s('I play tennis on Saturday.', '土曜日[どようび] に テニス を します。'),
        s('I will study tomorrow.', '明日[あした] 勉強[べんきょう] します。', 'あした takes no particle.'),
        s('I eat breakfast at eight.', '八[はち]時[じ] に 朝[あさ]ご飯[はん] を 食[た]べます。'),
        s('When do you go back home?', 'いつ うち に 帰[かえ]ります か。'),
      ],
    },
    {
      title: 'Inviting: ～ませんか',
      text: 'A ません question, ～ませんか, is a polite invitation: "won’t you …?", "would you like to …?". Say yes with いいですね, or decline softly with ちょっと….',
      examples: [
        { ja: 'いっしょに映画[えいが]を見[み]ませんか。', en: 'Would you like to see a movie (with me)?' },
        { ja: 'いいですね。', en: 'That sounds good.' },
      ],
      say: [
        s('Would you like to see a movie?', '映画[えいが] を 見[み]ません か。'),
        s('Won’t you have coffee?', 'コーヒー を 飲[の]みません か。'),
        s('Would you like to play tennis on Sunday?', '日曜日[にちようび] に テニス を しません か。'),
        s('That sounds good.', 'いい です ね。'),
        s('Hmm, Saturday is a little…', '土曜日[どようび] は ちょっと…', 'Trailing off with ちょっと is the polite way to say no.'),
        s('Won’t you eat ice cream at a cafe?', 'カフェ で アイスクリーム を 食[た]べません か。'),
      ],
    },
    {
      title: 'How often',
      text: 'Before the verb: まいにち (every day), よく (often), たいてい (usually), ときどき (sometimes). あまり (not much) and ぜんぜん (not at all) go with a negative verb: あまり のみません.',
      examples: [
        { ja: 'よくテレビを見[み]ます。', en: 'I often watch TV.' },
        { ja: 'ぜんぜん勉強[べんきょう]しません。', en: 'I don’t study at all.' },
      ],
      say: [
        s('I often watch TV.', 'よく テレビ を 見[み]ます。'),
        s('I sometimes drink sake.', '時々[ときどき] お酒[さけ] を 飲[の]みます。'),
        s('I usually get up at seven.', 'たいてい 七[しち]時[じ] に 起[お]きます。'),
        s('I don’t drink coffee much.', 'コーヒー は あまり 飲[の]みません。'),
        s('I don’t watch TV at all.', 'テレビ は 全然[ぜんぜん] 見[み]ません。'),
      ],
    },
    {
      title: 'Word order',
      text: 'The usual order is: topic は, time, place で, thing を, verb. The verb comes last. Only the verb is required; the rest can move or drop out once it is clear.',
      examples: [
        { ja: '私[わたし]は今日[きょう]図書館[としょかん]で日本語[にほんご]を勉強[べんきょう]します。', en: 'I will study Japanese in the library today.' },
        { ja: 'メアリーさんは毎日[まいにち]うちで晩[ばん]ご飯[はん]を食[た]べます。', en: 'Mary eats dinner at home every day.' },
      ],
      say: [
        s('I will study Japanese in the library today.', '私[わたし] は 今日[きょう] 図書館[としょかん] で 日本語[にほんご] を 勉強[べんきょう] します。'),
        s('Mary eats dinner at home every day.', 'メアリー さん は 毎日[まいにち] うち で 晩[ばん]ご飯[はん] を 食[た]べます。'),
        s('I drink coffee at a cafe on weekends.', '週末[しゅうまつ] カフェ で コーヒー を 飲[の]みます。'),
        s('Takeshi will go to school at nine tomorrow.', 'たけし さん は 明日[あした] 九[く]時[じ] に 学校[がっこう] へ 行[い]きます。'),
        s('I eat lunch at school at twelve.', '十二[じゅうに]時[じ] に 学校[がっこう] で 昼[ひる]ご飯[はん] を 食[た]べます。'),
      ],
    },
    {
      title: 'は for contrast',
      text: 'は can set one thing against another: コーヒーは のみます. おちゃは のみません. "Coffee I drink; tea I don’t." It often stands in for を or comes after a time, to say "as for…".',
      examples: [
        { ja: 'コーヒーは飲[の]みます。お茶[ちゃ]は飲[の]みません。', en: 'I drink coffee. Tea, I don’t.' },
        { ja: '週末[しゅうまつ]は勉強[べんきょう]しません。', en: 'On weekends, I don’t study.' },
      ],
      say: [
        s('Coffee, I drink. Tea, I don’t.', 'コーヒー は 飲[の]みます。お茶[ちゃ] は 飲[の]みません。'),
        s('On weekends, I don’t study.', '週末[しゅうまつ] は 勉強[べんきょう] しません。'),
        s('I watch movies, but I don’t watch TV.', '映画[えいが] は 見[み]ます。でも、テレビ は 見[み]ません。'),
        s('Today I’ll go to school. Tomorrow I won’t.', '今日[きょう] は 学校[がっこう] へ 行[い]きます。明日[あした] は 行[い]きません。'),
        s('I listen to music, but I don’t read magazines.', '音楽[おんがく] は 聞[き]きます。でも、雑誌[ざっし] は 読[よ]みません。'),
      ],
    },
  ],
};
