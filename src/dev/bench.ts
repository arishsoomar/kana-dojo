// The flashcard benchmark, for testing in the iPhone simulator: only in a build made with
// EXPO_PUBLIC_BENCH=1 (it's inlined, so in every other build all of this is dead code). Opened
// at launch (bench-start.tsx), the flashcards drive themselves: each card turned over
// and back as a tap would, then swiped. Every turn's animation frames are timed on the UI thread
// and every word said is logged (recording or phone voice, and when it actually starts playing),
// and it all goes to a little server on the Mac (scripts/bench-server.py) as JSON lines.

export const BENCH = process.env.EXPO_PUBLIC_BENCH === '1';

const SERVER = 'http://localhost:8099/bench';

export type BenchEvent = { ev: string; [key: string]: unknown };

let queue: BenchEvent[] = [];
const started = Date.now();

// Notes an event, with the time since the app started.
export function benchLog(event: BenchEvent) {
  if (!BENCH) return;
  queue.push({ ...event, t: Date.now() - started });
  if (queue.length >= 20) void benchFlush();
}

export async function benchFlush() {
  if (!BENCH || queue.length === 0) return;
  const sending = queue;
  queue = [];
  try {
    await fetch(SERVER, { method: 'POST', body: sending.map((e) => JSON.stringify(e)).join('\n') });
  } catch {
    queue = [...sending, ...queue];
  }
}

// What the card does when tapped, set by the card on the screen, so the autopilot taps it the
// way a finger would.
export const benchCard: { tap: (() => void) | null } = { tap: null };

// The deck the benchmark opens at launch (EXPO_PUBLIC_BENCH_DECK, or GENKI lesson 4).
export const BENCH_DECK = process.env.EXPO_PUBLIC_BENCH_DECK ?? 'genki-4';

// How the autopilot paces itself: 'steady' (the same gaps every card) or 'human' (all sorts).
export const BENCH_PACE = process.env.EXPO_PUBLIC_BENCH_PACE ?? 'steady';
