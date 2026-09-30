import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { Furigana } from '@/components/furigana';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { SpeakerIcon } from '@/components/speaker-icon';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { VOCAB } from '@/content/vocab';
import { parseRuby, rubyText, type Example, type Exercise, type GrammarLesson } from '@/core/grammar';
import { lessonById, useGrammarLesson } from '@/hooks/use-grammar';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

// The forms a form exercise can ask for, in words.
const FORM_NAMES: Readonly<Record<string, string>> = {
  dictionary: 'dictionary form',
  masu: 'polite present (ます)',
  masen: 'polite negative (ません)',
  mashita: 'polite past (ました)',
  masendeshita: 'polite past negative (ませんでした)',
  te: 'て-form',
  ta: 'short past (た)',
  nai: 'short negative (ない)',
  nakatta: 'short past negative (なかった)',
};

const ADJECTIVE_FORM_NAMES = { present: 'present', negative: 'negative', past: 'past', pastNegative: 'past negative', te: 'て-form' } as const;

// A grammar lesson: its explanations and examples, then its exercises.
export default function GrammarLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = typeof id === 'string' ? lessonById(id) : null;
  const insets = useSafeAreaInsets();
  if (!lesson) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.body}>There&apos;s no lesson here.</Text>
        <PrimaryButton label="Back" onPress={leave} />
      </View>
    );
  }
  return <Lesson lesson={lesson} />;
}

function Lesson({ lesson }: { lesson: GrammarLesson }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const run = useGrammarLesson(lesson);
  const [leaving, setLeaving] = useState(false);
  const practising = run.phase === 'practice';

  // Android's back button asks first while practising.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!practising || run.result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [practising, run.result]);

  if (run.result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={run.result.summary}
          onContinue={leave}
          title="Lesson complete"
          headline={{ label: 'Right', value: `${run.result.right}/${run.result.total}` }}
          rank={rank}
          celebrate={run.result.right === run.result.total}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable role="button" aria-label="Leave lesson" onPress={() => (practising ? setLeaving(true) : leave())} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        {practising ? (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${run.fraction * 100}%` }]} />
          </View>
        ) : (
          <Text style={styles.barTitle}>Unit {lesson.unit}</Text>
        )}
      </View>

      {practising ? <Practice run={run} /> : <Learn lesson={lesson} onPractice={run.startPractice} />}
      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
}

// The explanations: each section with its examples (tap one to hear it), and the lesson's
// words, marked new if they haven't been started in the deck yet.
function Learn({ lesson, onPractice }: { lesson: GrammarLesson; onPractice: () => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const words = lesson.words.map((w) => VOCAB.find((v) => v.word === w)).filter((w) => w !== undefined);
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.goal}>{lesson.goal}</Text>

      {lesson.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.body}>{section.text}</Text>
          {section.examples.map((example) => (
            <ExampleRow key={example.ja} example={example} />
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Words in this lesson</Text>
        <View style={styles.words}>
          {words.map((w) => (
            <View key={w.id} style={styles.word}>
              <Furigana furigana={w.furigana} size={17} />
              <Text style={styles.wordMeaning} numberOfLines={1}>
                {w.meanings[0]?.split('; ')[0]}
                {progress.words[String(w.id)] === undefined ? ' · new' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <PrimaryButton label="Practice" onPress={onPractice} />
    </ScrollView>
  );
}

function ExampleRow({ example }: { example: Example }) {
  return (
    <Pressable role="button" aria-label={`${rubyText(example.ja)}: ${example.en}. Hear it`} onPress={() => speakWord(rubyText(example.ja))} style={styles.example}>
      <View style={styles.grow}>
        <Furigana furigana={parseRuby(example.ja)} size={20} />
        <Text style={styles.exampleEn}>{example.en}</Text>
      </View>
      <SpeakerIcon color={colors.muted} size={18} />
    </Pressable>
  );
}

type Run = ReturnType<typeof useGrammarLesson>;

// One exercise at a time, then what was right and why.
function Practice({ run }: { run: Run }) {
  const insets = useSafeAreaInsets();
  const { exercise, answered } = run;
  if (!exercise) return null;
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <Prompt exercise={exercise} />
      {exercise.kind === 'order' ? <Order run={run} /> : <Options run={run} exercise={exercise} />}
      {answered && (
        <View style={[styles.feedback, answered.right ? styles.feedbackRight : styles.feedbackWrong]}>
          <Text style={styles.feedbackTitle}>{answered.right ? 'Right!' : 'Not quite.'}</Text>
          {!answered.right && run.rightAnswer !== null && (
            <View style={styles.rightAnswer}>
              <Text style={styles.body}>The answer: </Text>
              <Furigana
                furigana={parseRuby(typeof run.rightAnswer === 'string' ? run.rightAnswer : run.rightAnswer.join(' '))}
                size={18}
              />
            </View>
          )}
          <Text style={styles.body}>{exercise.explain}</Text>
        </View>
      )}
      {answered && <PrimaryButton label="Continue" tone={answered.right ? 'pine' : 'sumi'} onPress={run.next} />}
    </ScrollView>
  );
}

function Prompt({ exercise }: { exercise: Exercise }) {
  if (exercise.kind === 'choose') {
    return (
      <View style={styles.prompt}>
        <Text style={styles.promptLabel}>Fill the gap</Text>
        <Furigana furigana={parseRuby(exercise.prompt.replace('＿', '＿＿'))} size={26} />
        {exercise.en && <Text style={styles.promptEn}>{exercise.en}</Text>}
      </View>
    );
  }
  if (exercise.kind === 'meaning') {
    return (
      <View style={styles.prompt}>
        <Text style={styles.promptLabel}>What does this mean?</Text>
        <Furigana furigana={parseRuby(exercise.ja)} size={26} />
      </View>
    );
  }
  if (exercise.kind === 'order') {
    return (
      <View style={styles.prompt}>
        <Text style={styles.promptLabel}>Put it in order</Text>
        <Text style={styles.promptBig}>{exercise.en}</Text>
      </View>
    );
  }
  const form =
    typeof exercise.form === 'string'
      ? FORM_NAMES[exercise.form]
      : exercise.form.adjective === 'te'
        ? 'て-form'
        : `${exercise.form.polite ? 'polite' : 'plain'} ${ADJECTIVE_FORM_NAMES[exercise.form.adjective]}`;
  return (
    <View style={styles.prompt}>
      <Text style={styles.promptLabel}>{exercise.prompt}</Text>
      <Text style={styles.promptBig}>
        {exercise.word} <Text style={styles.promptEn}>({exercise.reading})</Text>
      </Text>
      <Text style={styles.promptEn}>The {form}</Text>
    </View>
  );
}

// Choosing one: a word, a meaning, or a form.
function Options({ run, exercise }: { run: Run; exercise: Exclude<Exercise, { kind: 'order' }> }) {
  const english = exercise.kind === 'meaning';
  return (
    <View style={styles.options}>
      {run.choices.map((option) => {
        const state = !run.answered ? 'waiting' : option === run.rightAnswer ? 'right' : option === run.answered.answer ? 'wrong' : 'other';
        return (
          <Pressable
            key={option}
            role="button"
            disabled={run.answered !== null}
            onPress={() => run.answer(option)}
            style={[styles.option, state === 'right' && styles.optionRight, state === 'wrong' && styles.optionWrong, state === 'other' && styles.faded]}>
            {english ? <Text style={styles.optionText}>{option}</Text> : <Furigana furigana={parseRuby(option)} size={20} />}
          </Pressable>
        );
      })}
    </View>
  );
}

// Putting pieces in order: tap pieces to build the sentence, tap one in it to take it back.
function Order({ run }: { run: Run }) {
  const pool = run.choices.filter((p) => !run.built.includes(p));
  const full = pool.length === 0;
  return (
    <View style={styles.options}>
      <View style={[styles.tray, run.answered && (run.answered.right ? styles.optionRight : styles.optionWrong)]}>
        {run.built.length === 0 && <Text style={styles.trayHint}>Tap the pieces in order</Text>}
        {run.built.map((piece, i) => (
          <Pressable key={piece} role="button" onPress={() => run.removePiece(i)} style={styles.piece}>
            <Furigana furigana={parseRuby(piece)} size={19} />
          </Pressable>
        ))}
      </View>
      <View style={styles.pool}>
        {pool.map((piece) => (
          <Pressable key={piece} role="button" onPress={() => run.addPiece(piece)} style={styles.piece}>
            <Furigana furigana={parseRuby(piece)} size={19} />
          </Pressable>
        ))}
      </View>
      {!run.answered && <PrimaryButton label="Check" disabled={!full} onPress={() => run.answer(run.built)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  empty: {
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  barTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  track: {
    flex: 1,
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.pine,
  },
  content: {
    gap: 14,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.uiBlack,
    fontSize: 26,
    color: colors.sumi,
  },
  goal: {
    marginTop: -8,
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: colors.ink2,
  },
  section: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  body: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink2,
  },
  example: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  grow: {
    flex: 1,
  },
  exampleEn: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  word: {
    maxWidth: 150,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  wordMeaning: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 11,
    color: colors.ink2,
  },
  prompt: {
    gap: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  promptLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  promptBig: {
    fontFamily: fonts.uiBlack,
    fontSize: 22,
    color: colors.sumi,
  },
  promptEn: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  options: {
    gap: 10,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  optionRight: {
    borderWidth: 2.5,
    borderColor: colors.pine,
    backgroundColor: colors.pineLight,
  },
  optionWrong: {
    borderWidth: 2.5,
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  faded: {
    opacity: 0.4,
  },
  optionText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.sumi,
  },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    minHeight: 70,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  trayHint: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.muted,
  },
  pool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  piece: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  feedback: {
    gap: 6,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  feedbackRight: {
    borderColor: colors.pine,
    backgroundColor: colors.pineLight,
  },
  feedbackWrong: {
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  feedbackTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  rightAnswer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
});
