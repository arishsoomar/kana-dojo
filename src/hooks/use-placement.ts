import { useState } from 'react';

import { FAST_MS, recordAnswer } from '@/core/answers';
import { makeChoices } from '@/core/choices';
import { KANA, ROWS, type Kana, type RowId } from '@/core/kana';
import { placeKnown, placementQuestions, placeRow, rowPassed } from '@/core/placement';

import { useProgress } from './use-progress';

// How long the picked answer shows right or wrong before the next question.
const FLASH_MS = 450;

type Test = {
  rowIndex: number;
  questions: Kana[]; // the current row's kana, shuffled
  index: number;
  choices: Kana[];
  knownInRow: number; // answered correctly and quickly in this row
  shownAt: number;
  placedRows: RowId[]; // rows shown to be known
  done: boolean;
};

// Wrong options come from the hiragana rows reached so far.
function choicesFor(kana: Kana, rowIndex: number): Kana[] {
  const rowsSoFar = ROWS.slice(0, rowIndex + 1);
  return makeChoices(kana, KANA.filter((k) => k.script === 'hiragana' && rowsSoFar.includes(k.row)), Math.random);
}

function startRow(rowIndex: number, placedRows: RowId[]): Test {
  // Safe: rowIndex is always a valid index into ROWS, and every row has kana.
  const questions = placementQuestions(ROWS[rowIndex]!, Math.random);
  return {
    rowIndex,
    questions,
    index: 0,
    choices: choicesFor(questions[0]!, rowIndex),
    knownInRow: 0,
    shownAt: Date.now(),
    placedRows,
    done: false,
  };
}

// Runs the grading test: hiragana row by row, stopping at the first row mostly missed.
export function usePlacement() {
  const { changeProgress } = useProgress();
  const [test, setTest] = useState(() => startRow(0, []));
  const [flash, setFlash] = useState<{ guess: Kana; correct: boolean } | null>(null);

  function answer(guess: Kana) {
    if (flash || test.done) return;
    const kana = test.questions[test.index];
    if (!kana) return;
    const now = Date.now();
    const ms = now - test.shownAt;
    const correct = guess === kana;
    // Known means right and quick; a slow right answer isn't counted as known.
    const known = correct && ms < FAST_MS;
    changeProgress((current) => {
      const answered = recordAnswer(current, { char: kana.char, guess: guess.char, ms, now });
      return known ? placeKnown(answered, kana.char, now) : answered;
    });
    setFlash({ guess, correct });

    setTimeout(() => {
      setFlash(null);
      const knownInRow = test.knownInRow + (known ? 1 : 0);
      const next = test.questions[test.index + 1];
      if (next) {
        setTest({ ...test, index: test.index + 1, choices: choicesFor(next, test.rowIndex), knownInRow, shownAt: Date.now() });
        return;
      }
      // End of a row: known rows are placed and the test moves on; otherwise it stops here.
      // Safe: rowIndex is a valid index into ROWS.
      const row = ROWS[test.rowIndex]!;
      if (!rowPassed(knownInRow, test.questions.length)) {
        setTest({ ...test, knownInRow, done: true });
        return;
      }
      changeProgress((current) => placeRow(current, row, Date.now()));
      const placedRows = [...test.placedRows, row];
      if (test.rowIndex + 1 >= ROWS.length) setTest({ ...test, knownInRow, placedRows, done: true });
      else setTest(startRow(test.rowIndex + 1, placedRows));
    }, FLASH_MS);
  }

  // Stop early, keeping the rows already shown to be known.
  function stop() {
    setTest({ ...test, done: true });
  }

  return {
    row: ROWS[test.rowIndex],
    kana: test.questions[test.index],
    choices: test.choices,
    questionInRow: test.index + 1,
    rowLength: test.questions.length,
    placedRows: test.placedRows,
    done: test.done,
    flash,
    answer,
    stop,
  };
}
