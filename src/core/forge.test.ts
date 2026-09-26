import { EMPTY_PROGRESS, type Progress } from './answers';
import {
  forgeOptions,
  forgeWord,
  forgeRound,
  readChosen,
  readTyped,
  readyWords,
  recordReading,
  splitWord,
  wordRomaji,
  type ForgeWord,
} from './forge';
import { KANA, type Kana } from './kana';

const NOW = 1_000_000;

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char}`);
  return found;
}

function word(text: string, meaning = ''): ForgeWord {
  const found = forgeWord({ text, meaning, picture: '' });
  if (!found) throw new Error(`Can't split ${text}`);
  return found;
}

// The kana in a string, for pools of kana to choose from.
function kanaIn(chars: string): Kana[] {
  return word(chars).units;
}

// Progress where these kana have been met (answered once), at white belt.
function met(chars: string): Progress {
  const units = kanaIn(chars);
  return { ...EMPTY_PROGRESS, kana: Object.fromEntries(units.map((k) => [k.char, { box: 0, at: 1 }])) };
}

describe('splitWord', () => {
  it('splits a word into its kana', () => {
    expect(splitWord('ねこ')?.map((k) => k.char)).toEqual(['ね', 'こ']);
  });

  it('keeps a yōon like しゃ together as one kana', () => {
    expect(splitWord('しゃしん')?.map((k) => k.char)).toEqual(['しゃ', 'し', 'ん']);
    expect(splitWord('きょう')?.map((k) => k.char)).toEqual(['きょ', 'う']);
  });

  it('is null for something that is not kana', () => {
    expect(splitWord('cat')).toBeNull();
    expect(splitWord('ねこcat')).toBeNull();
  });
});

describe('wordRomaji', () => {
  it("joins each kana's standard spelling", () => {
    expect(wordRomaji(word('しゃしん').parts)).toBe('shashin');
    expect(wordRomaji(word('すし').parts)).toBe('sushi');
  });
});

describe('readyWords', () => {
  it('lists only words whose kana have all been met, in the given script', () => {
    // The あ to な rows at green belt, so they're open and met (and the は row opens, unmet).
    const rows = 'あいうえおかきくけこさしすせそたちつてとなにぬねの';
    const progress: Progress = { ...EMPTY_PROGRESS, kana: Object.fromEntries([...rows].map((c) => [c, { box: 3, at: 1 }])) };
    const texts = readyWords(progress, 'hiragana').map((w) => w.word.text);
    expect(texts).toContain('ねこ');
    expect(texts).toContain('いぬ');
    // や and ま haven't been met, and ほ (in the open は row) hasn't either.
    expect(texts).not.toContain('やま');
    expect(texts).not.toContain('ほし');
    expect(readyWords(progress, 'katakana')).toEqual([]);
  });
});

describe('readTyped', () => {
  it('is right for the standard spelling, or any accepted one, ignoring case and spaces', () => {
    expect(readTyped(word('すし'), 'sushi').correct).toBe(true);
    expect(readTyped(word('すし'), 'susi').correct).toBe(true);
    expect(readTyped(word('しゃしん'), ' ShaShin ').correct).toBe(true);
  });

  it('finds the misread kana, and the kana that was typed instead', () => {
    const reading = readTyped(word('ねこ'), 'reko');
    expect(reading.correct).toBe(false);
    expect(reading.units.map((u) => [u.kana.char, u.correct, u.guess?.char ?? null])).toEqual([
      ['ね', false, 'れ'],
      ['こ', true, 'こ'],
    ]);
  });

  it('stops at something that spells no kana, judging only what came before', () => {
    const reading = readTyped(word('さかな'), 'saxana');
    expect(reading.correct).toBe(false);
    expect(reading.units.map((u) => [u.kana.char, u.correct, u.guess?.char ?? null])).toEqual([
      ['さ', true, 'さ'],
      ['か', false, null],
    ]);
  });

  it('is wrong with extra letters on the end', () => {
    expect(readTyped(word('ねこ'), 'nekoo').correct).toBe(false);
  });
});

describe('forgeOptions', () => {
  const neko = word('ねこ');
  const pool = kanaIn('ねこれわにかき');

  it('offers the answer and three others, each one kana off, all different', () => {
    for (const r of [0, 0.4, 0.9]) {
      const options = forgeOptions(neko, pool, () => r);
      expect(options).toHaveLength(4);
      expect(options.filter((o) => o.misread === null).map((o) => o.romaji)).toEqual(['neko']);
      expect(new Set(options.map((o) => o.romaji)).size).toBe(4);
      for (const o of options.filter((x) => x.misread !== null)) {
        const parts = neko.parts.map((k, i) => (i === o.misread?.index ? o.misread.as : k));
        expect(o.romaji).toBe(wordRomaji(parts));
      }
    }
  });

  it("uses a kana's lookalikes first: ね is misread as わ or れ", () => {
    for (const r of [0, 0.5, 0.99]) {
      const romaji = forgeOptions(neko, pool, () => r).map((o) => o.romaji);
      expect(romaji.some((x) => x === 'wako' || x === 'reko')).toBe(true);
    }
  });

  it('lists the options in alphabetical order, so the answer is not always in one place', () => {
    const options = forgeOptions(neko, pool, () => 0.5).map((o) => o.romaji);
    expect(options).toEqual([...options].sort());
  });
});

describe('readChosen', () => {
  const neko = word('ねこ');

  it('is right when the answer was chosen, judging every kana', () => {
    const reading = readChosen(neko, { romaji: 'neko', misread: null });
    expect(reading.correct).toBe(true);
    expect(reading.units.every((u) => u.correct)).toBe(true);
  });

  it('judges only the misread kana when another option was chosen', () => {
    const reading = readChosen(neko, { romaji: 'reko', misread: { index: 0, as: kana('れ') } });
    expect(reading.correct).toBe(false);
    expect(reading.units.map((u) => [u.kana.char, u.correct, u.guess?.char])).toEqual([['ね', false, 'れ']]);
  });
});

describe('recordReading', () => {
  const neko = word('ねこ');

  it("records each judged kana, sharing the time evenly, and typed answers as typed", () => {
    const reading = readTyped(neko, 'neko');
    const { progress, answers } = recordReading(met('ねこ'), neko, reading, 3000, NOW, true);
    // Typed, 1.5s each: well under the 6s typing limit at white belt, so up two steps.
    expect(progress.kana['ね']).toEqual({ box: 2, at: NOW });
    expect(progress.kana['こ']).toEqual({ box: 2, at: NOW });
    expect(answers).toEqual([
      { char: 'ね', correct: true, ms: 1500 },
      { char: 'こ', correct: true, ms: 1500 },
    ]);
  });

  it('logs the mix-up for a misread kana, and leaves unjudged kana alone', () => {
    const reading = readChosen(neko, { romaji: 'reko', misread: { index: 0, as: kana('れ') } });
    const { progress, answers } = recordReading(met('ねこ'), neko, reading, 2000, NOW, false);
    expect(progress.confusions).toEqual([{ shown: 'ね', guessed: 'れ' }]);
    expect(progress.kana['こ']).toEqual({ box: 0, at: 1 });
    expect(answers).toEqual([{ char: 'ね', correct: false, ms: 1000 }]);
  });
});

describe('forgeRound', () => {
  it('gives 10 words, never the same word twice in a row, even from a short list', () => {
    const words = [word('ねこ'), word('いぬ'), word('あめ')];
    for (const r of [0, 0.5, 0.99]) {
      const round = forgeRound(words, () => r);
      expect(round).toHaveLength(10);
      round.forEach((w, i) => {
        if (i > 0) expect(w.word.text).not.toBe(round[i - 1]!.word.text);
      });
    }
  });
});

describe('small っ and ー', () => {
  it('keeps っ and ー in a word as marks between its kana', () => {
    expect(splitWord('きって')?.map((p) => p.char)).toEqual(['き', 'っ', 'て']);
    expect(splitWord('コーヒー')?.map((p) => p.char)).toEqual(['コ', 'ー', 'ヒ', 'ー']);
    expect(word('きって').units.map((k) => k.char)).toEqual(['き', 'て']);
  });

  it('refuses a mark with nothing to change: っ at the end, or ー at the start', () => {
    expect(splitWord('きっ')).toBeNull();
    expect(splitWord('ーカ')).toBeNull();
  });

  it('spells っ by doubling the next consonant, and t before ch', () => {
    expect(wordRomaji(word('きって').parts)).toBe('kitte');
    expect(wordRomaji(word('がっこう').parts)).toBe('gakkou');
    expect(wordRomaji(word('ちょっと').parts)).toBe('chotto');
    expect(wordRomaji(word('ざっし').parts)).toBe('zasshi');
  });

  it('spells ー by repeating the vowel before it', () => {
    expect(wordRomaji(word('コーヒー').parts)).toBe('koohii');
    expect(wordRomaji(word('サッカー').parts)).toBe('sakkaa');
    expect(wordRomaji(word('コンピューター').parts)).toBe('konpyuutaa');
  });

  it('reads typed marks: doubled consonants, repeated vowels, or "-" for ー', () => {
    expect(readTyped(word('きって'), 'kitte').correct).toBe(true);
    expect(readTyped(word('コーヒー'), 'koohii').correct).toBe(true);
    expect(readTyped(word('コーヒー'), 'ko-hi-').correct).toBe(true);
    expect(readTyped(word('まっちゃ'), 'matcha').correct).toBe(true);
    expect(readTyped(word('まっちゃ'), 'maccha').correct).toBe(true);
  });

  it('is wrong when a mark is missed, and says which, with every kana still right', () => {
    const reading = readTyped(word('きって'), 'kite');
    expect(reading.correct).toBe(false);
    expect(reading.missedMark?.char).toBe('っ');
    expect(reading.units.every((u) => u.correct)).toBe(true);
    expect(readTyped(word('コーヒー'), 'kohii').missedMark?.char).toBe('ー');
  });

  it('can offer the word with its mark missed as a wrong option', () => {
    const kitte = word('きって');
    const pool = kanaIn('きてかくけこたちつと');
    for (const r of [0, 0.5, 0.99]) {
      const options = forgeOptions(kitte, pool, () => r);
      const dropped = options.find((o) => o.dropsMark !== undefined);
      expect(dropped?.romaji).toBe('kite');
      const reading = readChosen(kitte, dropped!);
      expect(reading.correct).toBe(false);
      expect(reading.missedMark?.char).toBe('っ');
      expect(reading.units).toEqual([]);
    }
  });

  it('records only the kana, sharing the time between them', () => {
    const kitte = word('きって');
    const { answers } = recordReading(met('きて'), kitte, readTyped(kitte, 'kitte'), 2000, NOW, false);
    expect(answers).toEqual([
      { char: 'き', correct: true, ms: 1000 },
      { char: 'て', correct: true, ms: 1000 },
    ]);
  });
});
