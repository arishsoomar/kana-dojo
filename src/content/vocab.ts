import type { VocabWord } from '@/core/vocab';

import data from './vocab.json';

// The word deck. JSON's types are too loose to be VocabWord as they stand (a furigana piece is
// a plain string array to TypeScript), so it's given its type here; vocab.test.ts checks every
// word really has this shape.
export const VOCAB = data as unknown as readonly VocabWord[];
