import type { GrammarLesson, SayCard } from '@/core/grammar';

const s = (en: string, ja: string, note?: string): SayCard => (note ? { en, ja, note } : { en, ja });

// GENKI I lesson 6, ロバートさんのいちにち (A Day in Robert's Life): the て-form, and what it
// builds: please, and then, may, must not; reasons with から, and offering help.
export const LESSON_6: GrammarLesson = {
  id: 'genki-6',
  lesson: 6,
  title: 'A Day in Robert’s Life',
  goal: 'Ask for things, string actions together, ask permission: Please open the window. May I sit here?',
  points: [
    {
      title: 'The て-form',
      text: 'The て-form joins a verb to what follows. る-verbs: たべる → たべて. う-verbs change by their last sound: う, つ, る → って (かう → かって); む, ぶ, ぬ → んで (よむ → よんで); く → いて (かく → かいて); ぐ → いで (およぐ → およいで); す → して (はなす → はなして). いく → いって, する → して, くる → きて.',
      examples: [
        { ja: '食[た]べる → 食[た]べて、待[ま]つ → 待[ま]って', en: 'eat, wait' },
        { ja: '読[よ]む → 読[よ]んで、書[か]く → 書[か]いて', en: 'read, write' },
        { ja: '行[い]く → 行[い]って、来[く]る → 来[き]て', en: 'go, come' },
      ],
      say: [
        s('(the て-form of) to eat: たべる', '食[た]べて'),
        s('(the て-form of) to wait: まつ', '待[ま]って'),
        s('(the て-form of) to read: よむ', '読[よ]んで'),
        s('(the て-form of) to write: かく', '書[か]いて'),
        s('(the て-form of) to swim: およぐ', '泳[およ]いで'),
        s('(the て-form of) to speak: はなす', '話[はな]して'),
        s('(the て-form of) to go: いく', '行[い]って', 'いく is the one く-verb that takes って.'),
        s('(the て-form of) to come: くる', '来[き]て'),
      ],
    },
    {
      title: 'Please: ～てください',
      text: 'て-form + ください asks someone politely to do something: まどを あけてください, "please open the window".',
      examples: [
        { ja: '窓[まど]を開[あ]けてください。', en: 'Please open the window.' },
        { ja: 'ゆっくり話[はな]してください。', en: 'Please speak slowly.' },
      ],
      say: [
        s('Please open the window.', '窓[まど] を 開[あ]けて ください。'),
        s('Please speak slowly.', 'ゆっくり 話[はな]して ください。'),
        s('Please read page ten.', '十[じゅう] ページ を 読[よ]んで ください。'),
        s('Please turn off the light.', '電気[でんき] を 消[け]して ください。'),
        s('Please wait a little.', 'ちょっと 待[ま]って ください。'),
        s('Please teach me kanji.', '漢字[かんじ] を 教[おし]えて ください。'),
        s('Please come right away.', 'すぐ 来[き]て ください。'),
      ],
    },
    {
      title: 'Two actions: ～て、～',
      text: 'Join actions in order with the て-form; the last verb shows the tense: あさごはんを たべて、がっこうに いきました, "I ate breakfast and went to school".',
      examples: [
        { ja: '朝[あさ]ご飯[はん]を食[た]べて、学校[がっこう]に行[い]きました。', en: 'I ate breakfast and went to school.' },
        { ja: 'うちに帰[かえ]って、休[やす]みます。', en: 'I’ll go home and rest.' },
      ],
      say: [
        s('I ate breakfast and went to school.', '朝[あさ]ご飯[はん] を 食[た]べて、学校[がっこう] に 行[い]きました。'),
        s('I’ll go home and rest.', 'うち に 帰[かえ]って、休[やす]みます。'),
        s('I got up and took a shower.', '起[お]きて、シャワー を 浴[あ]びました。'),
        s('I went to the library and studied.', '図書館[としょかん] に 行[い]って、勉強[べんきょう] しました。'),
        s('Let’s go to a cafe and drink coffee.', 'カフェ に 行[い]って、コーヒー を 飲[の]みましょう。'),
        s('I borrowed a book and read it at home.', '本[ほん] を 借[か]りて、うち で 読[よ]みました。'),
      ],
    },
    {
      title: 'May: ～てもいいです',
      text: 'て-form + もいいです means "you may…"; as a question, ～てもいいですか asks "may I…?".',
      examples: [
        { ja: 'ここに座[すわ]ってもいいですか。', en: 'May I sit here?' },
        { ja: '教科書[きょうかしょ]を見[み]てもいいです。', en: 'You may look at the textbook.' },
      ],
      say: [
        s('May I sit here?', 'ここ に 座[すわ]って も いい です か。'),
        s('You may look at the textbook.', '教科書[きょうかしょ] を 見[み]て も いい です。'),
        s('May I turn on the air conditioner?', 'エアコン を つけて も いい です か。'),
        s('May I use the computer?', 'パソコン を 使[つか]って も いい です か。'),
        s('May I go home?', 'うち に 帰[かえ]って も いい です か。'),
        s('May I open the window?', '窓[まど] を 開[あ]けて も いい です か。'),
      ],
    },
    {
      title: 'Must not: ～てはいけません',
      text: 'て-form + はいけません means "you must not…": ここで たばこを すってはいけません.',
      examples: [
        { ja: 'ここでたばこを吸[す]ってはいけません。', en: 'You must not smoke here.' },
        { ja: 'テストで教科書[きょうかしょ]を見[み]てはいけません。', en: 'You must not look at the textbook in the test.' },
      ],
      say: [
        s('You must not smoke here.', 'ここ で たばこ を 吸[す]って は いけません。'),
        s('You must not look at the textbook in the test.', 'テスト で 教科書[きょうかしょ] を 見[み]て は いけません。'),
        s('You must not use the computer.', 'パソコン を 使[つか]って は いけません。'),
        s('You must not forget your homework.', '宿題[しゅくだい] を 忘[わす]れて は いけません。'),
        s('You must not enter this room.', 'この 部屋[へや] に 入[はい]って は いけません。'),
      ],
    },
    {
      title: 'Because: から',
      text: 'から after a sentence gives the reason, and the result follows: あしたは テストが ありますから、べんきょうします, "There’s a test tomorrow, so I’ll study." It can also come last, as an answer to "why?".',
      examples: [
        { ja: '明日[あした]テストがありますから、勉強[べんきょう]します。', en: 'There’s a test tomorrow, so I’ll study.' },
        { ja: '暑[あつ]いですから、窓[まど]を開[あ]けてください。', en: 'It’s hot, so please open the window.' },
      ],
      say: [
        s('There’s a test tomorrow, so I’ll study.', '明日[あした] テスト が あります から、勉強[べんきょう] します。'),
        s('It’s hot, so please open the window.', '暑[あつ]い です から、窓[まど] を 開[あ]けて ください。'),
        s('I’m busy, so I won’t go out.', '忙[いそが]しい です から、出[で]かけません。'),
        s('It’s cold, so please close the window.', '寒[さむ]い です から、窓[まど] を 閉[し]めて ください。'),
        s('Why? Because I have a part-time job.', 'どうして です か。アルバイト が あります から。'),
      ],
    },
    {
      title: 'Offering: ～ましょうか',
      text: 'ましょうか also offers help: "shall I…?". てつだいましょうか, "shall I help you?". Accept with ありがとうございます, or decline with だいじょうぶです or けっこうです.',
      examples: [
        { ja: '手伝[てつだ]いましょうか。', en: 'Shall I help you?' },
        { ja: '荷物[にもつ]を持[も]ちましょうか。', en: 'Shall I carry your bags?' },
      ],
      say: [
        s('Shall I help you?', '手伝[てつだ]いましょう か。'),
        s('Shall I carry your bags?', '荷物[にもつ] を 持[も]ちましょう か。'),
        s('Shall I open the window?', '窓[まど] を 開[あ]けましょう か。'),
        s('Shall I turn on the air conditioner?', 'エアコン を つけましょう か。'),
        s('No, thank you. I’m fine.', 'いいえ、大丈夫[だいじょうぶ] です。'),
      ],
    },
  ],
};
