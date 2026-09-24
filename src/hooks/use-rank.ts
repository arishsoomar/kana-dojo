import type { Belt } from '@/core/boxes';
import { overallRank } from '@/core/rank';

import { useProgress } from './use-progress';

// The learner's overall rank, which sets Karasu's form.
export function useRank(): Belt {
  const { progress } = useProgress();
  return overallRank(progress);
}
