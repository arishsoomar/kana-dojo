import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { FeedbackSheet } from '@/components/feedback-sheet';
import { KanaFrame } from '@/components/kana-frame';
import { Karasu, type KarasuMood } from '@/components/karasu';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { LessonTopBar } from '@/components/lesson-top-bar';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts } from '@/constants/theme';
import type { Kana } from '@/core/kana';
import { useLesson, type Result } from '@/hooks/use-lesson';

// Back to where the lesson was opened from. If the lesson was opened directly
// (a refreshed or bookmarked web page), there's nothing to go back to, so go to Learn.
function leaveLesson() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const { question, result, summary, fraction, check, goToNext } = useLesson('hiragana');
  const [selected, setSelected] = useState<Kana | null>(null);
  const [leaving, setLeaving] = useState(false);

  function next() {
    setSelected(null);
    goToNext();
  }

  if (summary) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete summary={summary} onContinue={leaveLesson} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <LessonTopBar fraction={fraction} onClose={() => setLeaving(true)} />

      <View style={styles.body}>
        <View style={styles.coach}>
          <Karasu mood={moodFor(result)} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Read this.</Text>
          </View>
        </View>

        <KanaFrame char={question.kana.char} />

        <View style={styles.choices} accessibilityRole="radiogroup">
          {question.choices.map((choice) => (
            <ChoiceTile
              key={choice.char}
              label={choice.romaji[0]}
              state={tileState(choice, question.kana, selected, result)}
              disabled={result !== null}
              onPress={() => setSelected(choice)}
            />
          ))}
        </View>
      </View>

      {/* The bottom padding lives here, so the white sheet reaches the bottom edge. */}
      <View style={[result ? styles.sheetArea : styles.footer, { paddingBottom: insets.bottom + 22 }]}>
        {result ? (
          <FeedbackSheet result={result} onContinue={next} />
        ) : (
          <PrimaryButton label="Check" disabled={selected === null} onPress={() => selected && check(selected)} />
        )}
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leaveLesson} />
    </View>
  );
}

function moodFor(result: Result | null): KarasuMood {
  if (!result) return 'focus';
  return result.correct ? 'proud' : 'stern';
}

function tileState(choice: Kana, answer: Kana, selected: Kana | null, result: Result | null): TileState {
  if (!result) return choice === selected ? 'selected' : 'idle';
  if (choice === result.guess) return result.correct ? 'correct' : 'wrong';
  if (choice === answer) return 'missed';
  return 'idle';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  bubble: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  bubbleText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: colors.sumi,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  footer: {
    paddingHorizontal: 18,
  },
  sheetArea: {
    backgroundColor: colors.card,
  },
});
