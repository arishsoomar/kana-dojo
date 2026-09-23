import { useState } from 'react';

import type { Progress } from '@/core/answers';
import type { Script } from '@/core/kana';
import { makeQuestion, type Question } from '@/core/question';

// Builds one question when the screen first appears, using the real clock and
// real randomness. The engine itself never reads either.
export function useQuestion(progress: Progress, script: Script): Question {
  const [question] = useState(() => makeQuestion(progress, script, Date.now(), Math.random));
  return question;
}
