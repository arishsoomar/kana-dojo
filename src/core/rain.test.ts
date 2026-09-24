import { KANA } from './kana';
import { RAIN_FALL_MS, RAIN_LANES, RAIN_SPAWN_MS, startRain, stepRain } from './rain';

const pool = KANA.filter((k) => k.row === 'a' && k.script === 'hiragana');
const rng = () => 0.5;

describe('Kana Rain', () => {
  it('starts with nothing falling, then drops the first kana at the top', () => {
    const start = startRain();
    expect(start.drops).toEqual([]);
    const { state } = stepRain(start, 16, pool, rng);
    expect(state.drops).toHaveLength(1);
    expect(state.drops[0]?.y).toBeCloseTo(0);
    expect(pool).toContain(state.drops[0]?.kana);
  });

  it('moves kana down at a steady rate: the full height in RAIN_FALL_MS', () => {
    let { state } = stepRain(startRain(), 0, pool, rng);
    ({ state } = stepRain(state, RAIN_FALL_MS / 4, pool, rng));
    expect(state.drops[0]?.y).toBeCloseTo(0.25);
  });

  it('removes a kana when it reaches the ground and reports it as landed', () => {
    let { state } = stepRain(startRain(), 0, pool, rng);
    const first = state.drops[0];
    const result = stepRain(state, RAIN_FALL_MS, pool, rng);
    expect(result.landed).toEqual([expect.objectContaining({ id: first?.id })]);
    expect(result.state.drops.some((d) => d.id === first?.id)).toBe(false);
  });

  it('drops a new kana every RAIN_SPAWN_MS', () => {
    let { state } = stepRain(startRain(), 0, pool, rng);
    for (let i = 0; i < 3; i++) ({ state } = stepRain(state, RAIN_SPAWN_MS, pool, rng));
    expect(state.drops).toHaveLength(4);
  });

  it('never starts a kana in a lane where another is still near the top', () => {
    let { state } = stepRain(startRain(), 0, pool, () => 0);
    ({ state } = stepRain(state, RAIN_SPAWN_MS, pool, () => 0));
    const lanes = state.drops.map((d) => d.lane);
    expect(new Set(lanes).size).toBe(lanes.length);
    expect(lanes.every((lane) => lane >= 0 && lane < RAIN_LANES)).toBe(true);
  });

  it('does not change the state it was given', () => {
    const { state } = stepRain(startRain(), 0, pool, rng);
    const snapshot = structuredClone(state);
    stepRain(state, RAIN_SPAWN_MS, pool, rng);
    expect(state).toEqual(snapshot);
  });
});
