import { EMPTY_PROGRESS, type Progress } from './answers';
import { learnPath } from './path';
import { placeKnown, placeRow, placementQuestions, rowPassed } from './placement';
import { intervalFor } from './boxes';

const NOW = 1_000_000;

describe('placementQuestions', () => {
  it("asks each of a hiragana row's kana once, in some order", () => {
    const questions = placementQuestions('ka', () => 0.5);
    expect(questions.map((k) => k.char).sort()).toEqual([...'かきくけこ'].sort());
    expect(questions.every((k) => k.script === 'hiragana')).toBe(true);
  });
});

describe('rowPassed', () => {
  it('needs 80% of a row right, the same bar as unlocking', () => {
    expect(rowPassed(4, 5)).toBe(true);
    expect(rowPassed(3, 5)).toBe(false);
    expect(rowPassed(3, 3)).toBe(true);
    expect(rowPassed(2, 3)).toBe(false);
  });
});

describe('placeKnown', () => {
  it('starts a known kana at green belt (box 3), due after that box\'s wait', () => {
    const next = placeKnown(EMPTY_PROGRESS, 'か', NOW);
    expect(next.kana['か']).toEqual({ box: 3, dueAt: NOW + intervalFor(3) });
  });

  it('never lowers a kana that is already higher', () => {
    const high: Progress = { ...EMPTY_PROGRESS, kana: { か: { box: 5, dueAt: 7 } } };
    expect(placeKnown(high, 'か', NOW).kana['か']).toEqual({ box: 5, dueAt: 7 });
  });

  it('never changes the progress it was given', () => {
    const snapshot = structuredClone(EMPTY_PROGRESS);
    placeKnown(EMPTY_PROGRESS, 'か', NOW);
    expect(EMPTY_PROGRESS).toEqual(snapshot);
  });
});

describe('placeRow', () => {
  it("marks a row's plaques done, so the learn path picks up at the next row", () => {
    let progress = EMPTY_PROGRESS;
    for (const char of 'あいうえお') progress = placeKnown(progress, char, NOW);
    progress = placeRow(progress, 'a', NOW);
    const path = learnPath(progress, 'hiragana');
    expect(path.units[0]?.done).toBe(4);
    expect(path.current?.id).toBe('hiragana:ka:0');
  });
});
