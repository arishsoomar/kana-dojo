import { useProgress } from './use-progress';

// The ids of the gear Karasu is wearing, from the learner's settings.
export function useWornGear(): readonly string[] {
  return useProgress().progress.settings.gear;
}
