import { completeLesson, EMPTY_PROGRESS, type Progress } from './answers';
import { KANA, type Kana } from './kana';
import { rowBelt } from './belts';
import { learnPath, makePlaqueQuestion, plaqueById, plaquesFor } from './path';

const NOW = 1_000_000;

function done(progress: Progress, ...ids: string[]): Progress {
  return ids.reduce((p, id) => completeLesson(p, id, NOW), progress);
}

function chars(kana: readonly Kana[]): string {
  return kana.map((k) => k.char).join('');
}

describe('plaquesFor', () => {
  it('introduces a row two kana at a time, then a mixed review', () => {
    const plaques = plaquesFor('hiragana', 'ka');
    expect(plaques.map((p) => [p.id, p.kind, chars(p.kana)])).toEqual([
      ['hiragana:ka:0', 'learn', 'かき'],
      ['hiragana:ka:1', 'learn', 'くけ'],
      ['hiragana:ka:2', 'learn', 'こ'],
      ['hiragana:ka:mixed', 'mixed', 'かきくけこ'],
    ]);
  });

  it('handles 3-kana rows', () => {
    expect(plaquesFor('katakana', 'ya').map((p) => chars(p.kana))).toEqual(['ヤユ', 'ヨ', 'ヤユヨ']);
  });
});

describe('rowBelt', () => {
  it("is the lowest belt among the row's kana", () => {
    const progress = { ...EMPTY_PROGRESS, kana: { あ: { box: 7, dueAt: 0 }, い: { box: 5, dueAt: 0 }, う: { box: 3, dueAt: 0 }, え: { box: 3, dueAt: 0 }, お: { box: 3, dueAt: 0 } } };
    expect(rowBelt(progress, 'hiragana', 'a')).toBe('green');
    expect(rowBelt(EMPTY_PROGRESS, 'hiragana', 'a')).toBe('white');
  });
});

describe('learnPath', () => {
  it('starts a new learner on the first plaque, with everything after it locked', () => {
    const path = learnPath(EMPTY_PROGRESS, 'hiragana');
    const [a, ka] = path.units;
    expect(a?.plaques.map((p) => p.state)).toEqual(['current', 'locked', 'locked', 'locked']);
    expect(ka?.open).toBe(false);
    expect(ka?.plaques.every((p) => p.state === 'locked')).toBe(true);
    expect(path.current?.id).toBe('hiragana:a:0');
    expect(path.currentUnit.row).toBe('a');
  });

  it('marks finished plaques done and moves current to the next one', () => {
    const path = learnPath(done(EMPTY_PROGRESS, 'hiragana:a:0', 'hiragana:a:1'), 'hiragana');
    expect(path.units[0]?.plaques.map((p) => p.state)).toEqual(['done', 'done', 'current', 'locked']);
    expect(path.units[0]?.done).toBe(2);
  });

  it('has no current plaque when every open plaque is done', () => {
    const allA = done(EMPTY_PROGRESS, 'hiragana:a:0', 'hiragana:a:1', 'hiragana:a:2', 'hiragana:a:mixed');
    const path = learnPath(allA, 'hiragana');
    expect(path.current).toBeNull();
    expect(path.currentUnit.row).toBe('a');
  });

  it("moves on to the next row's plaques once that row unlocks", () => {
    const green = { あ: { box: 3, dueAt: 0 }, い: { box: 3, dueAt: 0 }, う: { box: 3, dueAt: 0 }, え: { box: 3, dueAt: 0 } };
    const progress = done({ ...EMPTY_PROGRESS, kana: green }, 'hiragana:a:0', 'hiragana:a:1', 'hiragana:a:2', 'hiragana:a:mixed');
    const path = learnPath(progress, 'hiragana');
    expect(path.units[1]?.open).toBe(true);
    expect(path.current?.id).toBe('hiragana:ka:0');
    expect(path.currentUnit.row).toBe('ka');
  });

  it('keeps each script separate', () => {
    const path = learnPath(done(EMPTY_PROGRESS, 'hiragana:a:0'), 'katakana');
    expect(path.current?.id).toBe('katakana:a:0');
  });
});

describe('makePlaqueQuestion', () => {
  const [first] = plaquesFor('hiragana', 'a');

  it("mostly asks the plaque's own kana", () => {
    if (!first) throw new Error('missing plaque');
    const { kana } = makePlaqueQuestion(EMPTY_PROGRESS, first, NOW, () => 0.2);
    expect(['あ', 'い']).toContain(kana.char);
  });

  it('sometimes reviews other unlocked kana', () => {
    if (!first) throw new Error('missing plaque');
    const { kana } = makePlaqueQuestion(EMPTY_PROGRESS, first, NOW, () => 0.9);
    expect(['う', 'え', 'お']).toContain(kana.char);
  });

  it('offers four choices that include the answer', () => {
    if (!first) throw new Error('missing plaque');
    const { kana, choices } = makePlaqueQuestion(EMPTY_PROGRESS, first, NOW, () => 0.5);
    expect(choices).toHaveLength(4);
    expect(choices).toContain(kana);
    expect(KANA).toContain(kana);
  });
});

describe('plaqueById', () => {
  it('finds a plaque from its id', () => {
    expect(plaqueById('katakana:sa:mixed')?.kana.map((k) => k.char).join('')).toBe('サシスセソ');
  });

  it('is null for an unknown id', () => {
    expect(plaqueById('hiragana:zz:0')).toBeNull();
  });
});

describe('learnPath: belt exams', () => {
  it('shows the awarded belt, and an exam once the row qualifies', () => {
    const green = { ...EMPTY_PROGRESS, kana: Object.fromEntries([...'あいうえお'].map((c) => [c, { box: 3, dueAt: 0 }])) };
    const unit = learnPath(green, 'hiragana').units[0];
    expect(unit?.belt).toBe('white');
    expect(unit?.exam).toBe('green');
  });

  it('offers no exam in a locked row', () => {
    expect(learnPath(EMPTY_PROGRESS, 'hiragana').units[1]?.exam).toBeNull();
  });
});
