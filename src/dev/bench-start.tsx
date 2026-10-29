import { router } from 'expo-router';
import { useEffect } from 'react';

import { BENCH, BENCH_DECK } from './bench';

// In a benchmark build, goes straight to the flashcards at launch (no deep link, which iOS asks
// about first). Renders nothing.
export function BenchStart() {
  useEffect(() => {
    if (!BENCH) return;
    const open = setTimeout(() => router.push({ pathname: '/words/flashcards', params: { deck: BENCH_DECK } }), 1000);
    return () => clearTimeout(open);
  }, []);
  return null;
}
