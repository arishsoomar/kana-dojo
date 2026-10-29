import { useEffect, useEffectEvent } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';

import { BENCH, BENCH_PACE, benchCard, benchFlush, benchLog } from './bench';

// How long to wait after each tap, and how much of that to time the frames for: the turn
// itself (240ms, and its little overshoot), when a stall would show.
const WATCH_MS = 600;
const TURN_MS = 300;
// Frames this far apart (or more) were dropped: at 60 a second they're 16.7ms apart.
const LATE_MS = 25;
const VERY_LATE_MS = 34;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Stats = { frames: number; max: number; late: number; veryLate: number; sum: number };
const EMPTY: Stats = { frames: 0, max: 0, late: 0, veryLate: 0, sum: 0 };

// The benchmark's autopilot (see bench.ts): with the English side in front, for each card it
// turns it over, back, and over again, then swipes it away, timing every turn's frames.
export function useBenchAutopilot({
  cardsLeft,
  setEnglishFront,
  fling,
}: {
  cardsLeft: number;
  setEnglishFront: () => void;
  fling: (know: boolean) => void;
}) {
  const watching = useSharedValue(false);
  const stats = useSharedValue<Stats>(EMPTY);

  useFrameCallback((frame) => {
    'worklet';
    const gap = frame.timeSincePreviousFrame;
    if (!watching.get() || gap === null) return;
    stats.modify((s) => {
      'worklet';
      s.frames += 1;
      s.sum += gap;
      if (gap > s.max) s.max = gap;
      if (gap >= LATE_MS) s.late += 1;
      if (gap >= VERY_LATE_MS) s.veryLate += 1;
      return s;
    });
  }, BENCH);

  async function tapAndWatch(card: number, turn: number, watchMs = WATCH_MS) {
    stats.set({ ...EMPTY });
    watching.set(true);
    const tapped = Date.now();
    benchLog({ ev: 'tap', card, turn });
    benchCard.tap?.();
    benchLog({ ev: 'tap-handled', card, turn, jsMs: Date.now() - tapped });
    const timed = Math.min(watchMs, TURN_MS);
    await wait(timed);
    watching.set(false);
    const s = stats.get();
    benchLog({ ev: 'turn', card, turn, frames: s.frames, maxGap: Math.round(s.max), late: s.late, veryLate: s.veryLate, avgGap: s.frames ? +(s.sum / s.frames).toFixed(1) : 0 });
    await wait(watchMs - timed);
  }

  // At a person's pace (EXPO_PUBLIC_BENCH_PACE=human): gaps from a hurried 40ms to a slow 1.5s,
  // the same each run (a seeded shuffle), so a failure can be run again.
  async function runLikeAPerson() {
    let seed = 7;
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const gap = (from: number, to: number) => wait(from + random() * (to - from));
    for (let card = 0; card < cardsLeft; card++) {
      await gap(40, 1500); // sometimes tapped while the card is still rising
      await tapAndWatch(card, 0, 150 + random() * 1350); // sometimes swiped before the word ends
      if (random() < 0.3) {
        await tapAndWatch(card, 1, 100 + random() * 600);
        await tapAndWatch(card, 2, 150 + random() * 900);
      }
      // Swiped away: a person can't touch it once it's going, so the next tap waits for the
      // next card to be there (the gap above is then from when it appears).
      const going = benchCard.tap;
      fling(random() < 0.7);
      for (let waited = 0; benchCard.tap === going && waited < 2000; waited += 10) await wait(10);
      await benchFlush();
    }
  }

  const run = useEffectEvent(async () => {
    setEnglishFront();
    await wait(1500);
    benchLog({ ev: 'start', cards: cardsLeft, pace: BENCH_PACE });
    if (BENCH_PACE === 'human') {
      await runLikeAPerson();
      benchLog({ ev: 'done' });
      await benchFlush();
      return;
    }
    for (let card = 0; card < cardsLeft; card++) {
      await wait(700); // the card rises into place, and its back gets ready
      await tapAndWatch(card, 0); // over: the Japanese side, and the word said
      await wait(500);
      await tapAndWatch(card, 1); // back to the English side
      await wait(300);
      await tapAndWatch(card, 2); // over again, straight away
      await wait(400);
      fling(card % 2 === 0);
      await wait(500);
      await benchFlush();
    }
    benchLog({ ev: 'done' });
    await benchFlush();
  });

  useEffect(() => {
    if (BENCH) void run();
  }, []);
}
