import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import { parseRuby, type Exercise } from '@/core/grammar';
import type { ExerciseRun } from '@/hooks/use-grammar';

import { Furigana } from './furigana';
import { PrimaryButton } from './primary-button';

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

type Run = ExerciseRun;

// A grammar exercise at a time, then what was right and why: for lessons and for reviews.
export function GrammarPractice({ run, heading }: { run: Run; heading?: string }) {
  const insets = useSafeAreaInsets();
  const { exercise, answered } = run;
  if (!exercise) return null;
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      {heading && <Text style={styles.heading}>{heading}</Text>}
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
  heading: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  content: {
    gap: 14,
    paddingHorizontal: 18,
  },
  body: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 21,
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
