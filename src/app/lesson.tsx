import { router, useLocalSearchParams } from 'expo-router';
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
import { colors, fonts } from '@/constants/theme';
import { KANA, type Kana } from '@/core/kana';
import { useLesson, type LessonMode, type Result } from '@/hooks/use-lesson';

// Back to where the lesson was opened from. If the lesson was opened directly
// (a refreshed or bookmarked web page), there's nothing to go back to, so go to Learn.
function leaveLesson() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// `/lesson?drill=し` drills one kana; plain `/lesson` is a hiragana lesson.
function modeFrom(drill: string | undefined): LessonMode {
  const kana = KANA.find((k) => k.char === drill);
  return kana ? { drill: kana } : { script: 'hiragana' };
}

export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const { drill } = useLocalSearchParams<{ drill?: string }>();
  const [mode] = useState(() => modeFrom(drill));
  const { question, result, summary, fraction, check, goToNext } = useLesson(mode);
  const [leaving, setLeaving] = useState(false);

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
            <Text style={styles.bubbleText}>{'drill' in mode ? `Drilling ${mode.drill.char}.` : 'Read this.'}</Text>
          </View>
        </View>

        {/* The frame grows to fill the middle; the answers sit at the bottom, near the thumb. */}
        <KanaFrame char={question.kana.char} />

        <View style={styles.choices}>
          {question.choices.map((choice) => (
            <ChoiceTile
              key={choice.char}
              label={choice.romaji[0]}
              state={tileState(choice, question.kana, result)}
              disabled={result !== null}
              onPress={() => check(choice)}
            />
          ))}
        </View>
      </View>

      {/* The bottom padding lives here, so the white sheet reaches the bottom edge. */}
      <View style={[result && styles.sheetArea, { paddingBottom: insets.bottom + (result ? 22 : 12) }]}>
        {result && <FeedbackSheet result={result} onContinue={goToNext} />}
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leaveLesson} />
    </View>
  );
}

function moodFor(result: Result | null): KarasuMood {
  if (!result) return 'focus';
  return result.correct ? 'proud' : 'stern';
}

function tileState(choice: Kana, answer: Kana, result: Result | null): TileState {
  if (!result) return 'idle';
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
    marginBottom: 12,
  },
  sheetArea: {
    backgroundColor: colors.card,
  },
});
