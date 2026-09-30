import type { GrammarLesson } from '@/core/grammar';

import { UNIT_1 } from './unit1';
import { UNIT_2 } from './unit2';

// Every grammar lesson, in order, and the units' names.
export const GRAMMAR_LESSONS: readonly GrammarLesson[] = [...UNIT_1, ...UNIT_2];

export const UNIT_NAMES: Readonly<Record<number, string>> = {
  1: 'です and the basics',
  2: 'Verbs',
};
