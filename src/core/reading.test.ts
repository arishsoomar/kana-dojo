import {
  PARTICLE_NOTES,
  phraseParticles,
  phraseRomaji,
  phraseRound,
  phraseText,
  placeOpen,
  readyPhrases,
  readingId,
  readySigns,
  SIGNS_TO_OPEN,
  signRomaji,
  signRound,
  type Phrase,
  type Place,
} from './reading';
import { seededRng } from './random';

// A small station, made up for the tests.
const station: Place = {
  id: 'station',
  name: 'The station',
  kana: 'えき',
  signs: [
    { text: 'でぐち', meaning: 'exit' },
    { text: 'いりぐち', meaning: 'entrance' },
    { text: 'きっぷ', meaning: 'ticket' },
    { text: 'トイレ', meaning: 'toilet' },
    { text: 'ホーム', meaning: 'platform' },
    { text: 'バス', meaning: 'bus' },
  ],
};

const chars = (text: string) => new Set([...text]);
// Everything in the station but バ and ス.
const MOST = chars('でぐちいりきぷトイレホム');

describe('reading a sign', () => {
  it('spells it the way it sounds, marks included', () => {
    expect(signRomaji('でぐち')).toBe('deguchi');
    expect(signRomaji('きっぷ')).toBe('kippu');
    expect(signRomaji('ホーム')).toBe('hoomu');
  });
});

describe('which signs are ready', () => {
  it('needs every kana in a sign met, in its own script; っ and ー need no learning', () => {
    expect(readySigns(station, MOST).map((s) => s.text)).toEqual(['でぐち', 'いりぐち', 'きっぷ', 'トイレ', 'ホーム']);
  });

  it('is nothing for someone who has met no kana', () => {
    expect(readySigns(station, new Set())).toEqual([]);
  });

  it(`opens a place once ${SIGNS_TO_OPEN} of its signs are ready`, () => {
    expect(placeOpen(station, MOST)).toBe(true);
    expect(placeOpen(station, chars('でぐちいりトイレ'))).toBe(false); // でぐち, いりぐち, トイレ: 3
  });
});

describe('a round of signs', () => {
  const round = signRound(station, MOST, seededRng('test'), 8);

  it('has the questions asked for', () => {
    expect(round).toHaveLength(8);
  });

  it('asks for a ready sign each time, among four different ready signs', () => {
    const ready = readySigns(station, MOST).map((s) => s.text);
    for (const q of round) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
      expect(q.options.map((o) => o.text)).toContain(q.answer.text);
      for (const o of q.options) expect(ready).toContain(o.text);
    }
  });

  it('never asks for the same sign twice in a row', () => {
    round.slice(1).forEach((q, i) => expect(q.answer.text).not.toBe(round[i]?.answer.text));
  });

  it('asks for every ready sign before any comes back', () => {
    expect(new Set(round.slice(0, 5).map((q) => q.answer.text)).size).toBe(5);
  });

  it('is nothing when the place is still locked', () => {
    expect(signRound(station, chars('でぐち'), seededRng('test'), 8)).toEqual([]);
  });
});

describe('phrases', () => {
  const water: Phrase = { text: 'みず[を] ください', meaning: 'Water, please.' };
  const hello: Phrase = { text: 'こんにち[は]', meaning: 'Hello.' };
  const flower: Phrase = { text: 'はな', meaning: 'A flower.' };
  const toilet: Phrase = { text: 'トイレ[は] どこ ですか', meaning: 'Where is the toilet?' };
  const station: Phrase = { text: 'えき[へ] いきます', meaning: "I'm going to the station." };
  const joined = (p: Phrase) => phraseRomaji(p).map((s) => s.text).join('');

  it('shows the phrase without the particle marks', () => {
    expect(phraseText(water)).toBe('みずを ください');
    expect(phraseText(hello)).toBe('こんにちは');
  });

  it('reads particles は as wa, へ as e and を as o, and picks them out', () => {
    expect(joined(water)).toBe('mizu o kudasai');
    expect(joined(toilet)).toBe('toire wa doko desuka');
    expect(joined(station)).toBe('eki e ikimasu');
    expect(phraseRomaji(water).filter((s) => s.particle).map((s) => s.text)).toEqual(['o']);
  });

  it('keeps a one-word phrase joined, and reads a は that is part of a word as ha', () => {
    expect(joined(hello)).toBe('konnichiwa');
    expect(joined(flower)).toBe('hana');
  });

  it('lists the particles a phrase uses, each once, with a note for each', () => {
    expect(phraseParticles(toilet)).toEqual(['は']);
    expect(phraseParticles(flower)).toEqual([]);
    for (const p of ['は', 'へ', 'を'] as const) expect(PARTICLE_NOTES[p]).toMatch(/read/);
  });

  const phrases = [water, hello, flower, toilet, station];
  const known = chars('みずをくださいこんにちはなトイレどでかえへきすま');

  it('is ready once every kana in it has been met, particles included', () => {
    expect(readyPhrases(phrases, known)).toEqual(phrases);
    // Without す and ま: not ですか or いきます.
    expect(readyPhrases(phrases, chars('みずをくださいこんにちはなトイレどでかえへき'))).toEqual([water, hello, flower]);
    expect(readyPhrases(phrases, chars('はな'))).toEqual([flower]);
  });

  it('makes rounds of "what does this mean?", with four different meanings to choose from', () => {
    const round = phraseRound(phrases, known, seededRng('p'), 6);
    expect(round).toHaveLength(6);
    for (const q of round) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.meaning)).size).toBe(4);
      expect(q.options).toContain(q.answer);
    }
    round.slice(1).forEach((q, i) => expect(q.answer).not.toBe(round[i]?.answer));
  });

  it(`needs ${SIGNS_TO_OPEN} ready phrases for a round`, () => {
    expect(phraseRound(phrases, chars('はな'), seededRng('p'), 6)).toEqual([]);
  });
});

describe('recording a round', () => {
  it('counts as a game, one record per place or the phrases', () => {
    expect(readingId('station')).toBe('game:reading:station');
    expect(readingId('phrases')).toBe('game:reading:phrases');
  });
});
