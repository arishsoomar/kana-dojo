import { EMPTY_PROGRESS } from './answers';
import { KANA } from './kana';
import {
  addRound,
  cantWin,
  completeLiveDuel,
  LIVE_COUNTDOWN_MS,
  LIVE_REVEAL_MS,
  liveStep,
  startLive,
  type LiveState,
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

describe('a duel, step by step', () => {
  const MET = [...'あいうえおかきくけこ'];
  const start = () => startLive('KAME', MET);
  const hello = { type: 'hello', met: MET } as const;

  // Two players connected, counted in, and at the first kana (at time 10_000).
  function playing() {
    let s = start();
    s = liveStep(s, { type: 'joined' });
    s = liveStep(s, { type: 'message', message: hello, now: 1000 });
    return liveStep(s, { type: 'tick', now: 10_000 });
  }
  const answerOf = (s: LiveState) => s.questions[s.round]!.kana;

  it('says hello when the other player joins, and again when theirs arrives', () => {
    let s = liveStep(start(), { type: 'joined' });
    expect(s.outbox).toEqual([{ type: 'hello', met: MET }]);
    s = liveStep(s, { type: 'message', message: hello, now: 1000 });
    expect(s.outbox).toEqual([hello, hello]);
  });

  it('counts down once both have said hello, then shows the first kana', () => {
    let s = liveStep(start(), { type: 'message', message: hello, now: 1000 });
    expect(s.phase).toBe('countdown');
    s = liveStep(s, { type: 'tick', now: 1000 + LIVE_COUNTDOWN_MS - 1 });
    expect(s.phase).toBe('countdown');
    s = liveStep(s, { type: 'tick', now: 1000 + LIVE_COUNTDOWN_MS });
    expect(s).toMatchObject({ phase: 'playing', round: 0, shownAt: 1000 + LIVE_COUNTDOWN_MS });
  });

  it('stops if there are too few kana in common', () => {
    const s = liveStep(start(), { type: 'message', message: { type: 'hello', met: ['あ', 'い'] }, now: 1000 });
    expect(s.phase).toBe('too-few');
  });

  it('ignores a second hello', () => {
    const s = playing();
    expect(liveStep(s, { type: 'message', message: hello, now: 12_000 })).toEqual(s);
  });

  it('sends my answer with my time, and settles the round once theirs arrives', () => {
    let s = playing();
    s = liveStep(s, { type: 'tap', correct: true, now: 10_900 });
    expect(s.outbox.at(-1)).toEqual({ type: 'answer', round: 0, correct: true, ms: 900 });
    expect(s.phase).toBe('playing');
    s = liveStep(s, { type: 'message', message: { type: 'answer', round: 0, correct: true, ms: 1200 }, now: 11_000 });
    expect(s).toMatchObject({ phase: 'reveal', lastResult: 'mine', score: { mine: 1, theirs: 0 } });
    expect(answerOf(s)).toBeDefined();
  });

  it('takes only one tap a round', () => {
    let s = playing();
    s = liveStep(s, { type: 'tap', correct: false, now: 10_500 });
    expect(liveStep(s, { type: 'tap', correct: true, now: 10_600 })).toEqual(s);
  });

  it("gives up the round once their right answer can't be beaten", () => {
    let s = playing();
    s = liveStep(s, { type: 'message', message: { type: 'answer', round: 0, correct: true, ms: 700 }, now: 10_400 });
    expect(s.phase).toBe('playing');
    s = liveStep(s, { type: 'tick', now: 10_700 });
    expect(s.outbox.at(-1)).toEqual({ type: 'answer', round: 0, correct: false, ms: 700 });
    expect(s).toMatchObject({ phase: 'reveal', lastResult: 'theirs' });
  });

  it(`times out at ${LIVE_ROUND_MS / 1000}s`, () => {
    let s = playing();
    s = liveStep(s, { type: 'tick', now: 10_000 + LIVE_ROUND_MS });
    expect(s.outbox.at(-1)).toEqual({ type: 'answer', round: 0, correct: false, ms: LIVE_ROUND_MS });
  });

  it('keeps an answer to the next round that arrives early', () => {
    let s = playing();
    s = liveStep(s, { type: 'message', message: { type: 'answer', round: 1, correct: true, ms: 500 }, now: 10_100 });
    s = liveStep(s, { type: 'tap', correct: true, now: 10_300 });
    s = liveStep(s, { type: 'message', message: { type: 'answer', round: 0, correct: false, ms: 900 }, now: 10_400 });
    s = liveStep(s, { type: 'tick', now: 10_400 + LIVE_REVEAL_MS });
    expect(s).toMatchObject({ phase: 'playing', round: 1 });
    // Their round-1 answer is already here: a quicker one wins it outright.
    s = liveStep(s, { type: 'tap', correct: true, now: s.shownAt + 450 });
    expect(s).toMatchObject({ lastResult: 'mine', score: { mine: 2, theirs: 0 } });
  });

  it(`ends at ${LIVE_WIN} points`, () => {
    let s = playing();
    for (let i = 0; i < LIVE_WIN; i++) {
      s = liveStep(s, { type: 'tap', correct: true, now: s.shownAt + 500 });
      s = liveStep(s, { type: 'message', message: { type: 'answer', round: s.round, correct: false, ms: 900 }, now: s.shownAt + 900 });
      if (s.phase === 'reveal') s = liveStep(s, { type: 'tick', now: s.phaseEnds });
    }
    expect(s).toMatchObject({ phase: 'over', score: { mine: LIVE_WIN, theirs: 0 } });
  });

  it('does not change the state it was given', () => {
    const s = playing();
    const before = JSON.stringify(s);
    liveStep(s, { type: 'tap', correct: true, now: 10_500 });
    expect(JSON.stringify(s)).toBe(before);
  });
});

describe('rematch messages', () => {
  it('are read, with a valid room code only', () => {
    expect(parseLiveMessage({ type: 'rematch', code: 'TAKE' })).toEqual({ type: 'rematch', code: 'TAKE' });
    expect(parseLiveMessage({ type: 'rematch', code: 'no' })).toBeNull();
  });
});

describe('the record', () => {
  it('keeps both scores, and counts as a game', () => {
    const done = completeLiveDuel(EMPTY_PROGRESS, 'KAME', 5, { mine: 7, theirs: 4 });
    expect(done.completed).toEqual([{ lesson: 'game:live:KAME', at: 5, score: 7, opponent: 4 }]);
  });
});
