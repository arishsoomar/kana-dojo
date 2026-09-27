import { EMPTY_PROGRESS, type Progress } from './answers';
import { KANA, type Kana } from './kana';
import {
  BEAT_MS,
  chartBeats,
  judge,
  nextNote,
  startTaiko,
  sweepTaiko,
  taikoPoints,
  tapTaiko,
  TAIKO_NOTES,
  WINDOWS,
} from './taiko';

const rng = () => 0.5;
const rows = [...'あいうえおかきくけこさしすせそ'];
const pool: Kana[] = KANA.filter((k) => rows.includes(k.char));
const LEARNER: Progress = { ...EMPTY_PROGRESS, kana: Object.fromEntries(rows.map((c) => [c, { box: 3, at: 1 }])) };

describe('the chart', () => {
  it('has 48 notes: every other beat for 16 after a 4-beat count-in, then every beat', () => {
    const beats = chartBeats();
    expect(beats).toHaveLength(TAIKO_NOTES);
    expect(beats.slice(0, 3)).toEqual([4, 6, 8]);
    expect(beats[15]).toBe(34);
    expect(beats.slice(16, 19)).toEqual([36, 37, 38]);
  });
});

describe('judge', () => {
  it('is Perfect, Good or OK by how close a hit is to the beat, early or late', () => {
    expect(judge(0)).toBe('perfect');
    expect(judge(-WINDOWS.perfect)).toBe('perfect');
    expect(judge(WINDOWS.perfect + 1)).toBe('good');
    expect(judge(-WINDOWS.good)).toBe('good');
    expect(judge(WINDOWS.good + 1)).toBe('ok');
    expect(judge(WINDOWS.ok + 1)).toBeNull();
  });
});

describe('taikoPoints', () => {
  it('pays more for better timing, plus a bonus for the combo', () => {
    expect(taikoPoints('perfect', 0)).toBeGreaterThan(taikoPoints('good', 0));
    expect(taikoPoints('good', 0)).toBeGreaterThan(taikoPoints('ok', 0));
    expect(taikoPoints('perfect', 10)).toBeGreaterThan(taikoPoints('perfect', 0));
    expect(taikoPoints('miss', 10)).toBe(0);
  });
});

describe('startTaiko', () => {
  it('gives each beat of the chart a kana, never the same twice in a row, with three sounds to pick from', () => {
    const state = startTaiko(LEARNER, pool, rng);
    expect(state.notes).toHaveLength(TAIKO_NOTES);
    expect(state.notes[0]?.at).toBe(4 * BEAT_MS);
    state.notes.forEach((note, i) => {
      expect(note.choices).toHaveLength(3);
      expect(note.choices).toContain(note.kana);
      if (i > 0) expect(note.kana).not.toBe(state.notes[i - 1]!.kana);
    });
    expect(state.score).toBe(0);
    expect(state.combo).toBe(0);
  });
});

describe('tapping', () => {
  const state = startTaiko(LEARNER, pool, rng);
  const first = state.notes[0]!;
  const wrong = first.choices.find((k) => k !== first.kana)!;

  it('hits the next note with the right sound, on the beat', () => {
    const { state: next, judged } = tapTaiko(state, first.at + 20, first.kana);
    expect(judged).toMatchObject({ judgement: 'perfect', correct: true });
    expect(next.notes[0]?.result).toBe('perfect');
    expect(next.combo).toBe(1);
    expect(next.score).toBe(taikoPoints('perfect', 0));
    expect(nextNote(next)).toBe(next.notes[1]);
  });

  it('misses with the wrong sound, breaking the combo and noting what was hit', () => {
    const one = tapTaiko(state, first.at, first.kana).state;
    const second = one.notes[1]!;
    const other = second.choices.find((k) => k !== second.kana)!;
    const { state: next, judged } = tapTaiko(one, second.at, other);
    expect(judged).toMatchObject({ judgement: 'miss', correct: false, guess: other });
    expect(next.combo).toBe(0);
    expect(next.bestCombo).toBe(1);
  });

  it('does nothing for a tap far too early', () => {
    const { state: next, judged } = tapTaiko(state, first.at - WINDOWS.ok - 1, wrong);
    expect(judged).toBeNull();
    expect(next).toEqual(state);
  });

  it('misses notes let past the ring', () => {
    const { state: next, missed } = sweepTaiko(state, first.at + WINDOWS.ok + 1);
    expect(missed.map((n) => n.id)).toEqual([first.id]);
    expect(next.notes[0]?.result).toBe('miss');
    expect(next.combo).toBe(0);
  });

  it('is done when every note is judged', () => {
    let current = state;
    for (const note of state.notes) current = tapTaiko(current, note.at, note.kana).state;
    expect(current.done).toBe(true);
    expect(current.hits).toBe(TAIKO_NOTES);
    expect(current.bestCombo).toBe(TAIKO_NOTES);
  });

  it('never changes the state it was given', () => {
    const snapshot = structuredClone(state);
    tapTaiko(state, first.at, first.kana);
    sweepTaiko(state, first.at + 10_000);
    expect(state).toEqual(snapshot);
  });
});
