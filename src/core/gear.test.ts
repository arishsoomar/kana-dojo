import { EMPTY_PROGRESS, type Progress } from './answers';
import { buyGear, buyRestDay, equip, GEAR, gearById, owns, REST_DAY_PRICE, unequip, unlocked, wornGear, type Feats } from './gear';

const NOW = 1_000_000;
const NO_FEATS: Feats = { deepestFloor: 0, duelsWon: 0, longestStreak: 0, rowBelts: 0, wordsRead: 0 };
const hachimaki = gearById('hachimaki')!;
const kasa = gearById('kasa')!;
const goldenBokken = gearById('golden-bokken')!;

describe('the gear list', () => {
  it('has items to buy and items to earn, each in a slot, all different', () => {
    expect(new Set(GEAR.map((g) => g.id)).size).toBe(GEAR.length);
    expect(GEAR.filter((g) => g.price !== null)).toHaveLength(9);
    expect(GEAR.filter((g) => g.unlock)).toHaveLength(5);
    expect(GEAR.every((g) => (g.price === null) === (g.unlock !== undefined))).toBe(true);
  });
});

describe('unlocking and owning', () => {
  it('opens an unlockable once its feat is reached', () => {
    expect(unlocked(goldenBokken, NO_FEATS)).toBe(false);
    expect(unlocked(goldenBokken, { ...NO_FEATS, deepestFloor: 10 })).toBe(true);
    expect(unlocked(hachimaki, NO_FEATS)).toBe(true);
  });

  it('owns bought gear, and unlockables once earned', () => {
    const bought: Progress = { ...EMPTY_PROGRESS, purchases: [{ item: 'hachimaki', at: 1 }] };
    expect(owns(bought, hachimaki, NO_FEATS)).toBe(true);
    expect(owns(EMPTY_PROGRESS, hachimaki, NO_FEATS)).toBe(false);
    expect(owns(EMPTY_PROGRESS, goldenBokken, { ...NO_FEATS, deepestFloor: 12 })).toBe(true);
  });
});

describe('buyGear', () => {
  it('buys with enough mon, recording the purchase', () => {
    const next = buyGear(EMPTY_PROGRESS, hachimaki, NOW, 100, NO_FEATS);
    expect(next?.purchases).toEqual([{ item: 'hachimaki', at: NOW }]);
  });

  it("won't buy without enough mon, twice, or an unlockable", () => {
    expect(buyGear(EMPTY_PROGRESS, hachimaki, NOW, 79, NO_FEATS)).toBeNull();
    const once = buyGear(EMPTY_PROGRESS, hachimaki, NOW, 100, NO_FEATS)!;
    expect(buyGear(once, hachimaki, NOW, 100, NO_FEATS)).toBeNull();
    expect(buyGear(EMPTY_PROGRESS, goldenBokken, NOW, 1000, { ...NO_FEATS, deepestFloor: 10 })).toBeNull();
  });
});

describe('buyRestDay', () => {
  it('buys one while fewer than 2 are held, with enough mon', () => {
    expect(buyRestDay(EMPTY_PROGRESS, NOW, 1, REST_DAY_PRICE)?.purchases).toEqual([{ item: 'rest-day', at: NOW }]);
    expect(buyRestDay(EMPTY_PROGRESS, NOW, 2, 500)).toBeNull();
    expect(buyRestDay(EMPTY_PROGRESS, NOW, 0, REST_DAY_PRICE - 1)).toBeNull();
  });
});

describe('equipping', () => {
  it('wears one item per slot, swapping out the old one', () => {
    let progress = equip(EMPTY_PROGRESS, hachimaki);
    expect(wornGear(progress).map((g) => g.id)).toEqual(['hachimaki']);
    progress = equip(progress, kasa);
    expect(wornGear(progress).map((g) => g.id)).toEqual(['kasa']);
    progress = equip(progress, gearById('kitsune')!);
    expect(wornGear(progress).map((g) => g.id).sort()).toEqual(['kasa', 'kitsune']);
  });

  it('takes an item off', () => {
    const progress = unequip(equip(EMPTY_PROGRESS, hachimaki), hachimaki);
    expect(wornGear(progress)).toEqual([]);
  });

  it('never changes the progress it was given', () => {
    const snapshot = structuredClone(EMPTY_PROGRESS);
    equip(EMPTY_PROGRESS, hachimaki);
    buyGear(EMPTY_PROGRESS, hachimaki, NOW, 100, NO_FEATS);
    expect(EMPTY_PROGRESS).toEqual(snapshot);
  });
});
