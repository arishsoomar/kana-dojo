import { useState } from 'react';

import { speakWord } from '@/audio/pronounce';
import { VOCAB } from '@/content/vocab';
import { completeLesson } from '@/core/answers';
import { rateWord, setNewWords, setNewWordsTopic, studySession, WORDS_REVIEW_ID, wordsStudied } from '@/core/deck';
import { summarizeLesson, type LessonAnswer, type LessonSummary } from '@/core/lesson';
import { nextIntervals, type Rating } from '@/core/srs';
import { TOPIC_IDS, type TopicId, type VocabWord } from '@/core/vocab';

import { useHaptics } from './use-haptics';
import { useProgress } from './use-progress';
import { useSoundEffects } from './use-sound-effects';
import { dayBounds, useToday } from './use-today';

// The deck in order, by id.
export const DECK_IDS: readonly string[] = VOCAB.map((w) => String(w.id));
const BY_ID = new Map(VOCAB.map((w) => [String(w.id), w]));

export function wordById(id: string): VocabWord | null {
  return BY_ID.get(id) ?? null;
}

// Each topic's words, in deck order.
const TOPIC_DECKS = new Map<TopicId, readonly string[]>(
  TOPIC_IDS.map((topic) => [topic, VOCAB.filter((w) => w.topics.includes(topic)).map((w) => String(w.id))]),
);

// Where new words come from: the chosen topic's words, or the whole deck.
function newWordsDeck(topic: TopicId | null): readonly string[] {
  return (topic && TOPIC_DECKS.get(topic)) || DECK_IDS;
}

// The word deck today: reviews due, new words still to start, and how far through the deck.
export function useWordsToday() {
  const { progress, updateProgress } = useProgress();
  const today = useToday();
  const { start, end } = dayBounds(today);
  const topic = progress.settings.newWordsTopic;
  const session = studySession(progress, newWordsDeck(topic), start, end);
  return {
    due: session.due.length,
    fresh: session.fresh.length,
    studied: wordsStudied(progress),
    total: DECK_IDS.length,
    newPerDay: progress.settings.newWords,
    setNewPerDay: (perDay: number) => updateProgress(setNewWords(progress, perDay)),
    topic,
    setTopic: (next: TopicId | null) => updateProgress(setNewWordsTopic(progress, next)),
    // Words in each topic not started yet.
    topicLeft: (t: TopicId) => (TOPIC_DECKS.get(t) ?? []).filter((id) => progress.words[id] === undefined).length,
  };
}

export type WordReviewResult = { reviewed: number; learned: number; summary: LessonSummary };

// A review session: today's due words, then today's new ones, chosen when it starts. A word
// shows its front; turning it over shows the back and the four ratings with when each would
// bring it back. A word rated Again comes back at the end of the session. When the session is
// over (or left part-way), it's kept as a finished lesson: training for the streak and the
// daily goal.
export function useWordReview() {
  const { progress, changeProgress, currentProgress } = useProgress();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  const today = useToday();
  const sound = progress.settings.sound;

  const [startProgress] = useState(progress);
  const [initial] = useState(() => {
    const { start, end } = dayBounds(today);
    return studySession(progress, newWordsDeck(progress.settings.newWordsTopic), start, end);
  });
  const [queue, setQueue] = useState<string[]>(() => [...initial.due, ...initial.fresh]);
  const [shownAt, setShownAt] = useState(() => Date.now());
  // When it was turned over, or null while it shows its front.
  const [flippedAt, setFlippedAt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<LessonAnswer[]>([]);
  const [result, setResult] = useState<WordReviewResult | null>(null);

  const id = queue[0] ?? null;
  const word = id ? wordById(id) : null;
  const card = id ? (progress.words[id] ?? null) : null;

  function flip() {
    if (!word || flippedAt !== null) return;
    setFlippedAt(Date.now());
    if (sound) speakWord(word.reading);
  }

  function finish(done: LessonAnswer[]) {
    if (done.length === 0 || result) return;
    changeProgress((p) => completeLesson(p, WORDS_REVIEW_ID, Date.now(), done.length));
    const learned = initial.fresh.filter((f) => done.some((a) => a.char === f)).length;
    setResult({ reviewed: done.length, learned, summary: summarizeLesson(startProgress, currentProgress(), done) });
  }

  function rate(rating: Rating) {
    if (!id || flippedAt === null) return;
    const now = Date.now();
    changeProgress((p) => rateWord(p, id, rating, now));
    if (rating === 1) haptics.miss();
    else haptics.right();
    const done = [...answers, { char: id, correct: rating > 1, ms: flippedAt - shownAt }];
    setAnswers(done);
    // Forgotten: once more before the session ends.
    const rest = rating === 1 ? [...queue.slice(1), id] : queue.slice(1);
    setFlippedAt(null);
    setShownAt(now);
    if (rest.length === 0) {
      setQueue([]);
      sounds.play('taiko');
      finish(done);
      return;
    }
    setQueue(rest);
  }

  return {
    word,
    isNew: card === null,
    // Readings over the kanji on the front, until the word is known well (three weeks' stability).
    frontReadings: card === null || card.stability < 21,
    flipped: flippedAt !== null,
    // When each rating would bring it back, once it's turned over.
    intervals: flippedAt !== null ? nextIntervals(card, flippedAt) : null,
    left: queue.length,
    total: initial.due.length + initial.fresh.length,
    reviewed: answers.length,
    result,
    flip,
    rate,
    // Leaving part-way still keeps what was reviewed as training.
    leave: () => finish(answers),
    speak: () => word && speakWord(word.reading),
  };
}
