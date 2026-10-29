// The flashcards' animations (a card turning over, being dragged, flying off, the next one
// rising) shouldn't share their frames with drawing something new: building a card's back takes
// long enough to make a turn stutter. So whatever is moving says how long it needs (or holds on
// while a finger is on it), and drawing that can wait (the next card, a card's back) waits.

// performance.now, not the wall clock, which can jump when the phone's time is changed.
const now = () => performance.now();

let busyUntil = 0;
let held = 0;
// Nothing asks for longer than this, so a wait never runs past it whatever the clock does.
const LONGEST_MS = 1000;

// Something's moving for the next `ms` milliseconds.
export function keepQuiet(ms: number) {
  busyUntil = Math.max(busyUntil, now() + Math.min(ms, LONGEST_MS));
}

// A finger is on a card (dragging it), until `release`, which also keeps it quiet for `ms` more
// while the card settles.
export function hold() {
  held += 1;
}

export function release(ms = 0) {
  held = Math.max(0, held - 1);
  keepQuiet(ms);
}

// Runs `then` after `delay`, or once nothing's moving, if something is by then. Returns a way to
// call it off.
export function whenQuiet(delay: number, then: () => void): () => void {
  let timer = setTimeout(function check() {
    const left = Math.min(busyUntil - now(), LONGEST_MS);
    if (held > 0) timer = setTimeout(check, 50);
    else if (left > 0) timer = setTimeout(check, left);
    else then();
  }, delay);
  return () => clearTimeout(timer);
}
