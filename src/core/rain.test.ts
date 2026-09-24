import { KANA } from './kana';
import {
  pointsFor,
  RAIN_FALL_MS,
  RAIN_LANES,
  RAIN_LIVES,
  RAIN_SPAWN_MS,
  rainPace,
  startRain,
  stepRain,
  targetOf,
  typeKey,
  waveOf,
  type RainState,
} from './rain';

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

describe('typing in Kana Rain', () => {
  function kana(char: string) {
    const found = KANA.find((k) => k.char === char);
    if (!found) throw new Error(`No kana ${char}`);
    return found;
  }

  // A rain with these kana falling, in order, each lower than the one before.
  function raining(...chars: string[]): RainState {
    return {
      ...startRain(),
      drops: chars.map((char, i) => ({ id: i, kana: kana(char), lane: i % RAIN_LANES, y: 0.1 + i * 0.1 })),
      nextId: chars.length,
      sinceSpawn: 0,
    };
  }

  it('locks on to the lowest kana that matches what has been typed', () => {
    const rain = raining('か', 'き', 'か');
    expect(targetOf(rain.drops, 'k')?.id).toBe(2);
    expect(targetOf(rain.drops, 'ki')?.id).toBe(1);
    expect(targetOf(rain.drops, '')).toBeNull();
  });

  it('keeps a partial match as typed, without clearing anything', () => {
    const result = typeKey(raining('し'), '', 's');
    expect(result.typed).toBe('s');
    expect(result.cleared).toBeNull();
    expect(result.state.drops).toHaveLength(1);
  });

  it('clears the lowest kana on a complete match and empties the input', () => {
    const rain = raining('え', 'か', 'え');
    const result = typeKey(rain, '', 'e');
    expect(result.cleared?.id).toBe(2);
    expect(result.typed).toBe('');
    expect(result.state.drops.map((d) => d.id)).toEqual([0, 1]);
  });

  it('accepts alternate spellings and capital letters', () => {
    expect(typeKey(raining('し'), 's', 'i').cleared?.kana.char).toBe('し');
    expect(typeKey(raining('つ'), 'T', 'U').cleared?.kana.char).toBe('つ');
  });

  it('ignores a key that could not match anything falling', () => {
    const result = typeKey(raining('か'), 'k', 'x');
    expect(result.typed).toBe('k');
    expect(result.rejected).toBe(true);
    expect(result.cleared).toBeNull();
  });

  it('waits on "n" while な could still be meant, and Enter takes ん', () => {
    const rain = raining('な', 'ん');
    const waiting = typeKey(rain, '', 'n');
    expect(waiting.cleared).toBeNull();
    expect(waiting.typed).toBe('n');
    const submitted = typeKey(rain, 'n', 'Enter');
    expect(submitted.cleared?.kana.char).toBe('ん');
    expect(submitted.typed).toBe('');
  });

  it('clears ん straight away when nothing longer could match', () => {
    expect(typeKey(raining('ん', 'か'), '', 'n').cleared?.kana.char).toBe('ん');
  });
});

describe('scoring, lives and waves', () => {
  function kana(char: string) {
    const found = KANA.find((k) => k.char === char);
    if (!found) throw new Error(`No kana ${char}`);
    return found;
  }

  function oneDrop(y: number, extra: Partial<RainState> = {}): RainState {
    return { ...startRain(), drops: [{ id: 0, kana: kana('か'), lane: 0, y }], nextId: 1, sinceSpawn: 0, ...extra };
  }

  it('gives more points the higher a kana is caught: 40 at the top, 10 at the ground', () => {
    expect(pointsFor(0)).toBe(40);
    expect(pointsFor(1)).toBe(10);
    expect(pointsFor(0.5)).toBe(25);
  });

  it('adds the points and counts the kana when one is cleared', () => {
    const result = typeKey(oneDrop(0.1), 'k', 'a');
    expect(result.state.score).toBe(pointsFor(0.1));
    expect(result.state.cleared).toBe(1);
  });

  it('starts with three lives and loses one for each kana that lands', () => {
    expect(startRain().lives).toBe(RAIN_LIVES);
    expect(RAIN_LIVES).toBe(3);
    const { state } = stepRain(oneDrop(0.99), 1000, pool, rng);
    expect(state.lives).toBe(2);
    expect(state.over).toBe(false);
  });

  it('ends the game when the last life is lost, and then nothing moves or clears', () => {
    const { state } = stepRain(oneDrop(0.99, { lives: 1 }), 1000, pool, rng);
    expect(state.lives).toBe(0);
    expect(state.over).toBe(true);
    const later = stepRain(state, 5000, pool, rng);
    expect(later.state).toEqual(state);
    expect(later.landed).toEqual([]);
    const frozen = { ...state, drops: [{ id: 5, kana: kana('か'), lane: 0, y: 0.5 }] };
    expect(typeKey(frozen, 'k', 'a').cleared).toBeNull();
  });

  it('moves to the next wave every 10 kana cleared', () => {
    expect(waveOf(0)).toBe(1);
    expect(waveOf(9)).toBe(1);
    expect(waveOf(10)).toBe(2);
    expect(waveOf(25)).toBe(3);
  });

  it('gets 10% faster each wave, down to a limit', () => {
    expect(rainPace(1)).toEqual({ fallMs: RAIN_FALL_MS, spawnMs: RAIN_SPAWN_MS });
    expect(rainPace(2).fallMs).toBeCloseTo(RAIN_FALL_MS * 0.9);
    expect(rainPace(2).spawnMs).toBeCloseTo(RAIN_SPAWN_MS * 0.9);
    expect(rainPace(50)).toEqual({ fallMs: 3500, spawnMs: 700 });
  });

  it('makes kana fall faster in a later wave', () => {
    const wave1 = stepRain(oneDrop(0), 1000, pool, rng).state.drops[0]?.y ?? 0;
    const wave2 = stepRain(oneDrop(0, { cleared: 10 }), 1000, pool, rng).state.drops[0]?.y ?? 0;
    expect(wave2).toBeGreaterThan(wave1);
  });
});
