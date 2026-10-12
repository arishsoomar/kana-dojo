import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 12, びょうき (Feeling Ill): explaining, too much, advice, because, must, and
// asking politely.
export const LESSON_12: GrammarLesson = {
  id: 'genki-12',
  lesson: 12,
  title: 'Feeling Ill',
  goal: 'Explain what’s wrong and give advice: I have a sore throat. You had better take medicine.',
  points: [
    {
      title: 'Explaining: ～んです',
      text: 'Short form + んです explains or asks for an explanation: どうしたんですか, "what’s wrong?"; のどが いたいんです, "(it’s that) my throat hurts". Nouns and な-adjectives take な: びょうきなんです.',
      examples: [
        { ja: 'どうしたんですか。', en: 'What’s the matter?' },
        { ja: 'おなかが痛[いた]いんです。', en: 'I have a stomachache.' },
      ],
      say: [
        s('What’s the matter?', 'どう した ん です か。'),
        s('I have a stomachache.', 'おなか が 痛[いた]い ん です。'),
        s('I have a sore throat.', 'のど が 痛[いた]い ん です。'),
        s('I caught a cold.', '風邪[かぜ] を ひいた ん です。'),
        s('Why did you break up with your boyfriend?', 'どうして 彼氏[かれし] と 別[わか]れた ん です か。'),
        s('Actually, I have allergies.', 'アレルギー が ある ん です。'),
        s('(It’s that) I don’t have money.', 'お金[かね] が ない ん です。'),
      ],
    },
    {
      title: 'Too much: ～すぎる',
      text: 'The ます stem + すぎる means doing too much: たべすぎました, "I ate too much". With adjectives, drop い (or な): たかすぎます, "too expensive"; しずかすぎます.',
      examples: [
        { ja: '昨日[きのう]お酒[さけ]を飲[の]みすぎました。', en: 'I drank too much last night.' },
        { ja: 'この服[ふく]は高[たか]すぎます。', en: 'These clothes are too expensive.' },
      ],
      say: [
        s('I drank too much last night.', '昨日[きのう] お酒[さけ] を 飲[の]みすぎました。'),
        s('These clothes are too expensive.', 'この 服[ふく] は 高[たか]すぎます。'),
        s('I ate too much.', '食[た]べすぎました。'),
        s('This cake is too sweet.', 'この ケーキ は 甘[あま]すぎます。'),
        s('This room is too small.', 'この 部屋[へや] は 狭[せま]すぎます。'),
        s('I worry too much.', '心配[しんぱい] しすぎます。'),
      ],
    },
    {
      title: 'Advice: ～ほうがいいです',
      text: 'Short past + ほうが いいです gives advice: "you had better…": くすりを のんだほうが いいです. "Better not": ない form + ほうが いいです.',
      examples: [
        { ja: '薬[くすり]を飲[の]んだほうがいいですよ。', en: 'You had better take medicine.' },
        { ja: '今日[きょう]は学校[がっこう]に行[い]かないほうがいいです。', en: 'You had better not go to school today.' },
      ],
      say: [
        s('You had better take medicine.', '薬[くすり] を 飲[の]んだ ほう が いい です よ。'),
        s('You had better not go to school today.', '今日[きょう] は 学校[がっこう] に 行[い]かない ほう が いい です。'),
        s('You had better go to the hospital.', '病院[びょういん] に 行[い]った ほう が いい です。'),
        s('You had better rest.', '休[やす]んだ ほう が いい です。'),
        s('You had better not drink sake.', 'お酒[さけ] を 飲[の]まない ほう が いい です。'),
        s('You had better study more.', 'もっと 勉強[べんきょう] した ほう が いい です。'),
      ],
    },
    {
      title: 'Because: ～ので',
      text: 'ので, like から, gives a reason, but sounds softer and more polite. Short form + ので; nouns and な-adjectives take な: びょうきなので.',
      examples: [
        { ja: '熱[ねつ]があるので、今日[きょう]は休[やす]みます。', en: 'I have a fever, so I’ll be absent today.' },
        { ja: '用事[ようじ]があるので、帰[かえ]ります。', en: 'I have something to take care of, so I’ll go home.' },
      ],
      say: [
        s('I have a fever, so I’ll be absent today.', '熱[ねつ] が ある ので、今日[きょう] は 休[やす]みます。'),
        s('I have something to take care of, so I’ll go home.', '用事[ようじ] が ある ので、帰[かえ]ります。'),
        s('I’m sick, so I won’t go to the game.', '病気[びょうき] な ので、試合[しあい] に 行[い]きません。'),
        s('I was thirsty, so I drank juice.', 'のど が 渇[かわ]いた ので、ジュース を 飲[の]みました。'),
        s('My feet hurt, so I won’t walk.', '足[あし] が 痛[いた]い ので、歩[ある]きません。'),
      ],
    },
    {
      title: 'Must: ～なければいけません',
      text: 'ない form, minus い, + ければ いけません means "must": たべなければ いけません, "I have to eat". In casual speech it’s ～なきゃ いけない.',
      examples: [
        { ja: '明日[あした]は早[はや]く起[お]きなければいけません。', en: 'I have to get up early tomorrow.' },
        { ja: '薬[くすり]を飲[の]まなきゃいけない。', en: '(casual) I have to take medicine.' },
      ],
      say: [
        s('I have to get up early tomorrow.', '明日[あした] は 早[はや]く 起[お]きなければ いけません。'),
        s('I have to take medicine.', '薬[くすり] を 飲[の]まなければ いけません。'),
        s('I have to pay.', '払[はら]わなければ いけません。'),
        s('I have to study for the test.', 'テスト の 勉強[べんきょう] を しなければ いけません。'),
        s('(casual) I have to go home now.', 'もう 帰[かえ]らなきゃ いけない。'),
        s('(casual) I have to buy a ticket.', '切符[きっぷ] を 買[か]わなきゃ いけない。'),
      ],
    },
    {
      title: 'Asking politely: ～でしょうか',
      text: 'でしょうか is a softer, more polite ですか, for asking someone above you: びょうきでしょうか, "could it be that I’m ill?". Short forms come before it, with no だ: おなかが いたいんですが、かぜでしょうか.',
      examples: [
        { ja: 'インフルエンザでしょうか。', en: 'Could it be the flu?' },
        { ja: 'この単語[たんご]の意味[いみ]は何[なん]でしょうか。', en: 'What might this word mean?' },
      ],
      say: [
        s('Could it be the flu?', 'インフルエンザ でしょう か。'),
        s('Could it be a cold?', '風邪[かぜ] でしょう か。'),
        s('Is it bad?', '悪[わる]い でしょう か。'),
        s('Will it be all right?', '大丈夫[だいじょうぶ] でしょう か。'),
        s('What might the meaning be?', '意味[いみ] は 何[なん] でしょう か。'),
      ],
    },
  ],
};
