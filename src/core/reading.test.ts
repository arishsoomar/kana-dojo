import { placeOpen, readySigns, SIGNS_TO_OPEN, signRomaji, signRound, type Place } from './reading';
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
