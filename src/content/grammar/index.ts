import type { GrammarLesson } from '@/core/grammar';

import { UNIT_1 } from './unit1';
import { UNIT_2 } from './unit2';
import { UNIT_3 } from './unit3';
import { UNIT_4 } from './unit4';
import { UNIT_5 } from './unit5';
import { UNIT_6 } from './unit6';

// Every grammar lesson, in order, and the units' names.
export const GRAMMAR_LESSONS: readonly GrammarLesson[] = [...UNIT_1, ...UNIT_2, ...UNIT_3, ...UNIT_4, ...UNIT_5, ...UNIT_6];

export const UNIT_NAMES: Readonly<Record<number, string>> = {
  1: 'です and the basics',
  2: 'Verbs',
  3: 'あります・います and the past',
  4: 'Adjectives',
  5: 'The て-form',
  6: 'Short forms and casual speech',
};
