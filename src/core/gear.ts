import type { Progress } from './answers';

// Karasu's gear, from the supply shed. It's all for looks: nothing here makes training easier.
// Most is bought with mon; some is earned by a feat and can't be bought.

// A rest day for the streak, the shed's one supply.
export const REST_DAY_PRICE = 50;
export const REST_DAY_ITEM = 'rest-day';

export type Slot = 'head' | 'face' | 'body' | 'neck' | 'hand';

// What earns an unlockable: reaching `count` in one of the learner's feats.
export type Feats = {
  deepestFloor: number; // in the Yokai dungeon, either script
  duelsWon: number;
  longestStreak: number;
  rowBelts: number; // rows (either script) with a belt exam ever passed
  wordsRead: number; // right in Word Forge
};
export type Unlock = { feat: keyof Feats; count: number; about: string };

export type GearItem = {
  id: string;
  name: string;
  slot: Slot;
  price: number | null; // in mon; null for an unlockable
  unlock?: Unlock;
};

export const GEAR: readonly GearItem[] = [
  // To buy
  { id: 'hachimaki', name: 'Red hachimaki', slot: 'head', price: 80 },
  { id: 'kasa', name: 'Straw kasa', slot: 'head', price: 180 },
  { id: 'kitsune', name: 'Kitsune mask', slot: 'face', price: 200 },
  { id: 'glasses', name: 'Round glasses', slot: 'face', price: 110 },
  { id: 'haori', name: 'Red haori', slot: 'body', price: 150 },
  { id: 'scarf', name: 'Indigo scarf', slot: 'neck', price: 100 },
  { id: 'bokken', name: 'Bokken', slot: 'hand', price: 120 },
  { id: 'fan', name: 'Paper fan', slot: 'hand', price: 90 },
  { id: 'wagasa', name: 'Paper umbrella', slot: 'hand', price: 160 },
  // To earn
  { id: 'golden-bokken', name: 'Golden bokken', slot: 'hand', price: null, unlock: { feat: 'deepestFloor', count: 10, about: 'Reach floor 10 of the Yokai dungeon' } },
  { id: 'oni-mask', name: 'Oni mask', slot: 'face', price: null, unlock: { feat: 'duelsWon', count: 5, about: 'Win 5 duels' } },
  { id: 'sakura', name: 'Sakura crown', slot: 'head', price: null, unlock: { feat: 'longestStreak', count: 30, about: 'Train 30 days in a row' } },
  { id: 'night-haori', name: 'Night haori', slot: 'body', price: null, unlock: { feat: 'rowBelts', count: 10, about: 'Earn 10 row belts' } },
  { id: 'eboshi', name: "Scholar's eboshi", slot: 'head', price: null, unlock: { feat: 'wordsRead', count: 100, about: 'Read 100 words in Word Forge' } },
];

export function gearById(id: string): GearItem | null {
  return GEAR.find((g) => g.id === id) ?? null;
}

// Whether an item is available: always for bought gear; for an unlockable, once its feat is reached.
export function unlocked(item: GearItem, feats: Feats): boolean {
  return !item.unlock || feats[item.unlock.feat] >= item.unlock.count;
}

// Whether the learner has an item: bought, or an unlockable earned.
export function owns(progress: Progress, item: GearItem, feats: Feats): boolean {
  if (item.price === null) return unlocked(item, feats);
  return progress.purchases.some((p) => p.item === item.id);
}

// Buys a piece of gear with mon, or null if it can't be bought: an unlockable, already owned,
// or more than the balance.
export function buyGear(progress: Progress, item: GearItem, now: number, balance: number, feats: Feats): Progress | null {
  if (item.price === null || owns(progress, item, feats) || balance < item.price) return null;
  return { ...progress, purchases: [...progress.purchases, { item: item.id, at: now }] };
}

// Buys a rest day, or null: only while fewer than 2 are held, and with enough mon.
export function buyRestDay(progress: Progress, now: number, held: number, balance: number): Progress | null {
  if (held >= 2 || balance < REST_DAY_PRICE) return null;
  return { ...progress, purchases: [...progress.purchases, { item: REST_DAY_ITEM, at: now }] };
}

// Puts an item on Karasu, taking off whatever was in its slot.
export function equip(progress: Progress, item: GearItem): Progress {
  const others = progress.settings.gear.filter((id) => gearById(id)?.slot !== item.slot);
  return { ...progress, settings: { ...progress.settings, gear: [...others, item.id] } };
}

export function unequip(progress: Progress, item: GearItem): Progress {
  return { ...progress, settings: { ...progress.settings, gear: progress.settings.gear.filter((id) => id !== item.id) } };
}

// The gear Karasu is wearing.
export function wornGear(progress: Progress): GearItem[] {
  return progress.settings.gear.flatMap((id) => gearById(id) ?? []);
}
