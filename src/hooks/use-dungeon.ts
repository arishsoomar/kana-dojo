import { useEffect, useEffectEvent, useState } from 'react';

import { bestScore, completeLesson, recordAnswer, type Progress } from '@/core/answers';
import { makeChoices } from '@/core/choices';
import {
  answerRun,
  attackMs,
  charmChoices,
  dungeonId,
  spendHint,
  startRun,
  takeCharm,
  type Blow,
  type Charm,
  type Run,
} from '@/core/dungeon';
import type { Kana, Script } from '@/core/kana';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { pickNext } from '@/core/pick';
import { metKana } from '@/core/unlock';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';
import { postWallNews } from './wall-news';

// How long a wrong answer (or an attack) shows the right tile before the next yokai's kana.
const MISS_MS = 800;
// How often the attack timer updates.
const TICK_MS = 100;

type Question = { kana: Kana; choices: Kana[] };

// The last answer, while it shows: the tile picked (null when the yokai attacked first).
export type Flash = { picked: Kana | null; correct: boolean };

export type DungeonResult = { floor: number; deepest: number | null; summary: LessonSummary };

// A new kana for the yokai, from the learner's met kana (weaker ones more often), never the
// one just asked if there's another.
function newQuestion(progress: Progress, pool: readonly Kana[], avoid?: Kana): Question {
  const options = pool.length > 1 ? pool.filter((k) => k !== avoid) : pool;
  const kana = pickNext(progress, options, Math.random);
  return { kana, choices: makeChoices(kana, pool, Math.random) };
}

// Runs one trip into the dungeon, in one script. The kana are the ones the learner had met
// when the run began.
export function useDungeon(script: Script) {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const [startProgress] = useState(progress);
  const [pool] = useState(() => metKana(progress, script));
  const [run, setRun] = useState(() => startRun(Math.random));
  const [question, setQuestion] = useState(() => newQuestion(progress, pool));
  const [shownAt, setShownAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [flash, setFlash] = useState<Flash | null>(null);
  // The last blow, for the "Clean!" pop and Karasu's reactions. The id replays the same blow.
  const [lastBlow, setLastBlow] = useState<{ blow: Blow; id: number } | null>(null);
  const [hint, setHint] = useState<string | null>(null); // the first letter, once revealed
  const [offered, setOffered] = useState<Charm[] | null>(null); // after a floor is cleared
  const [result, setResult] = useState<DungeonResult | null>(null);

  const waiting = flash !== null || offered !== null || result !== null;
  const attackAt = shownAt + attackMs(run.floor, run.charms);

  function nextQuestion(latest: Progress) {
    setQuestion(newQuestion(latest, pool, question.kana));
    setShownAt(Date.now());
    setNow(Date.now());
    setFlash(null);
    setHint(null);
  }

  function finish(finalRun: Run, answersSoFar: LessonAnswer[]) {
    const deepest = bestScore(currentProgress(), dungeonId(script));
    changeProgress((current) => completeLesson(current, dungeonId(script), Date.now(), finalRun.floor));
    haptics.thunk();
    sounds.play('taiko');
    const summary = summarizeLesson(startProgress, currentProgress(), answersSoFar);
    postWallNews({ opened: summary.rowsOpened });
    setResult({ floor: finalRun.floor, deepest, summary });
  }

  // An answer: a tile, or null when the yokai attacked first.
  function answer(picked: Kana | null) {
    if (waiting) return;
    const time = Date.now();
    const ms = time - shownAt;
    const correct = picked === question.kana;
    changeProgress((current) => recordAnswer(current, { char: question.kana.char, guess: picked?.char ?? null, ms, now: time }));
    const answersSoFar = [...answers, { char: question.kana.char, correct, ms }];
    setAnswers(answersSoFar);

    const { run: next, blow } = answerRun(run, picked ? { correct, ms } : null, Math.random);
    setRun(next);
    setLastBlow({ blow, id: answersSoFar.length });

    if (blow.kind === 'strike') {
      haptics.right();
      if (blow.floorCleared) {
        haptics.success();
        setOffered(charmChoices(next, Math.random));
      } else {
        nextQuestion(currentProgress());
      }
      return;
    }
    haptics.miss();
    // Show the right tile for a moment; then the next kana, or the end.
    setFlash({ picked, correct: false });
    setTimeout(() => {
      if (next.over) finish(next, answersSoFar);
      else nextQuestion(currentProgress());
    }, MISS_MS);
  }

  // The attack timer: when it runs out, the yokai attacks.
  const onTick = useEffectEvent(() => {
    const time = Date.now();
    setNow(time);
    if (!waiting && time >= attackAt) answer(null);
  });
  useEffect(() => {
    const timer = setInterval(onTick, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  function choose(charm: Charm) {
    setRun(takeCharm(run, charm, Math.random));
    setOffered(null);
    nextQuestion(currentProgress());
  }

  function revealHint() {
    if (run.hintsLeft === 0 || hint || waiting) return;
    setRun(spendHint(run));
    setHint(question.kana.romaji[0].charAt(0));
  }

  return {
    run,
    question,
    flash,
    lastBlow,
    hint,
    offered,
    result,
    // How long until the yokai attacks, and that as a share of its whole wait (1 = just shown).
    attackIn: Math.max(attackAt - now, 0),
    attackShare: waiting ? 1 : Math.max((attackAt - now) / attackMs(run.floor, run.charms), 0),
    answer,
    choose,
    revealHint,
  };
}
