import { KANA } from './kana';
import {
  addRound,
  cantWin,
  isRoomCode,
  LIVE_MIN_SHARED,
  LIVE_ROUND_MS,
  LIVE_WIN,
  liveOutcome,
  liveQuestions,
  makeRoomCode,
  normalizeRoomCode,
  parseLiveMessage,
  settleRound,
  sharedKana,
  timedOut,
} from './live-duel';

const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length] ?? 0;
};

describe('room codes', () => {
  it('are 4 letters, never I or O', () => {
    for (const value of [0, 0.3, 0.6, 0.99]) {
      const code = makeRoomCode(() => value);
      expect(code).toMatch(/^[A-Z]{4}$/);
      expect(code).not.toMatch(/[IO]/);
    }
  });

  it('are different for different random numbers', () => {
    expect(makeRoomCode(seq(0.1, 0.2, 0.3, 0.4))).not.toBe(makeRoomCode(seq(0.5, 0.6, 0.7, 0.8)));
  });

  it('are read forgivingly: lower case and spaces are fine', () => {
    expect(normalizeRoomCode(' kam e ')).toBe('KAME');
    expect(isRoomCode('KAME')).toBe(true);
    expect(isRoomCode('kame')).toBe(true);
    expect(isRoomCode('KAM')).toBe(false);
    expect(isRoomCode('KOME')).toBe(false);
    expect(isRoomCode('KAM3')).toBe(false);
  });
});

describe('the kana', () => {
  const mine = [...'あいうえおかきくけこ'];
  const theirs = [...'かきくけこさしすせそ'];

  it('are only the ones both have met, in chart order', () => {
    expect(sharedKana(mine, theirs).map((k) => k.char)).toEqual([...'かきくけこ']);
    expect(sharedKana(theirs, mine)).toEqual(sharedKana(mine, theirs));
  });

  it('ignores anything that is not a kana', () => {
    expect(sharedKana(['か', 'x', 'か'], ['か', 'x']).map((k) => k.char)).toEqual(['か']);
  });

  it(`gives no questions with fewer than ${LIVE_MIN_SHARED} in common`, () => {
    expect(liveQuestions('KAME', sharedKana(mine.slice(0, 4), mine.slice(0, 4)))).toEqual([]);
  });

  it('gives both phones the same questions from the same room code', () => {
    const pool = sharedKana(mine, theirs);
    expect(liveQuestions('KAME', pool)).toEqual(liveQuestions('KAME', [...pool]));
    expect(liveQuestions('KAME', pool).map((q) => q.kana.char)).not.toEqual(liveQuestions('TAKO', pool).map((q) => q.kana.char));
  });

  it('never asks the same kana twice in a row, and gives four choices from the shared kana', () => {
    const pool = sharedKana(mine, mine);
    const questions = liveQuestions('KAME', pool);
    expect(questions.length).toBeGreaterThanOrEqual(2 * LIVE_WIN);
    questions.forEach((q, i) => {
      if (i > 0) expect(q.kana.char).not.toBe(questions[i - 1]?.kana.char);
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.kana);
      expect(q.choices.every((c) => pool.includes(c))).toBe(true);
    });
  });
});

describe('a round', () => {
  it('goes to the right answer with the quicker time', () => {
    expect(settleRound({ correct: true, ms: 900 }, { correct: true, ms: 1200 })).toBe('mine');
    expect(settleRound({ correct: true, ms: 1500 }, { correct: true, ms: 1200 })).toBe('theirs');
  });

  it('goes to the only right answer, however slow', () => {
    expect(settleRound({ correct: false, ms: 400 }, { correct: true, ms: 5000 })).toBe('theirs');
    expect(settleRound({ correct: true, ms: 5000 }, { correct: false, ms: 400 })).toBe('mine');
  });

  it('scores for both on equal times, and for nobody on two wrong answers', () => {
    expect(settleRound({ correct: true, ms: 800 }, { correct: true, ms: 800 })).toBe('both');
    expect(settleRound({ correct: false, ms: 800 }, { correct: false, ms: 900 })).toBe('none');
  });

  it(`times out at ${LIVE_ROUND_MS / 1000}s as a wrong answer`, () => {
    expect(timedOut()).toEqual({ correct: false, ms: LIVE_ROUND_MS });
  });

  it("gives up once the other's right answer can't be beaten", () => {
    expect(cantWin({ correct: true, ms: 1200 }, 1100)).toBe(false);
    expect(cantWin({ correct: true, ms: 1200 }, 1200)).toBe(true);
    // A wrong answer can always be beaten.
    expect(cantWin({ correct: false, ms: 300 }, 5000)).toBe(false);
  });
});

describe('the score', () => {
  it('adds each round to whoever took it', () => {
    let score = { mine: 0, theirs: 0 };
    score = addRound(score, 'mine');
    score = addRound(score, 'both');
    score = addRound(score, 'none');
    score = addRound(score, 'theirs');
    expect(score).toEqual({ mine: 2, theirs: 2 });
  });

  it(`ends at ${LIVE_WIN}: a win, a loss, or a draw if both get there together`, () => {
    expect(liveOutcome({ mine: LIVE_WIN - 1, theirs: 3 })).toBe('going');
    expect(liveOutcome({ mine: LIVE_WIN, theirs: 3 })).toBe('won');
    expect(liveOutcome({ mine: 2, theirs: LIVE_WIN })).toBe('lost');
    expect(liveOutcome({ mine: LIVE_WIN, theirs: LIVE_WIN })).toBe('draw');
  });
});

describe('messages', () => {
  it('reads each kind', () => {
    expect(parseLiveMessage({ type: 'hello', met: ['か', 'き'] })).toEqual({ type: 'hello', met: ['か', 'き'] });
    expect(parseLiveMessage({ type: 'answer', round: 3, correct: true, ms: 812 })).toEqual({ type: 'answer', round: 3, correct: true, ms: 812 });
    expect(parseLiveMessage({ type: 'leave' })).toEqual({ type: 'leave' });
  });

  it('drops anything that is not a kana from a hello', () => {
    expect(parseLiveMessage({ type: 'hello', met: ['か', 7, 'zz', KANA[0]?.char] })).toEqual({ type: 'hello', met: ['か', 'あ'] });
  });

  it('keeps answer times within a round', () => {
    expect(parseLiveMessage({ type: 'answer', round: 0, correct: true, ms: -50 })).toMatchObject({ ms: 0 });
    expect(parseLiveMessage({ type: 'answer', round: 0, correct: true, ms: 99_999 })).toMatchObject({ ms: LIVE_ROUND_MS });
  });

  it('rejects anything malformed', () => {
    for (const bad of [null, 'hello', 42, {}, { type: 'shout' }, { type: 'hello' }, { type: 'answer', round: -1, correct: true, ms: 1 }, { type: 'answer', round: 1.5, correct: true, ms: 1 }, { type: 'answer', round: 1, correct: 'yes', ms: 1 }, { type: 'answer', round: 1, correct: true }]) {
      expect(parseLiveMessage(bad)).toBeNull();
    }
  });
});
