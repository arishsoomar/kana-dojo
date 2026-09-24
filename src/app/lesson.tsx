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
import { plaqueById } from '@/core/path';
import { useLesson, type LessonMode, type Result } from '@/hooks/use-lesson';
import { useRank } from '@/hooks/use-rank';

// Back to where the lesson was opened from. If the lesson was opened directly
// (a refreshed or bookmarked web page), there's nothing to go back to, so go to Learn.
function leaveLesson() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

type Params = { plaque?: string; drill?: string; script?: string };

// `/lesson?plaque=hiragana:ka:0` plays a plaque, `/lesson?drill=し` drills one kana,
// `/lesson?script=katakana` is a practice lesson. Anything else is hiragana practice.
function modeFrom({ plaque, drill, script }: Params): LessonMode {
  const found = plaque ? plaqueById(plaque) : null;
  if (found) return { plaque: found };
  const kana = KANA.find((k) => k.char === drill);
  if (kana) return { drill: kana };
  return { script: script === 'katakana' ? 'katakana' : 'hiragana' };
}

// What Karasu says above each question.
function coachLine(mode: LessonMode): string {
  if ('drill' in mode) return `Drilling ${mode.drill.char}.`;
  if ('plaque' in mode) {
    const { plaque } = mode;
    return plaque.kind === 'mixed'
      ? `Reviewing the ${plaque.kana[0]?.char ?? ''} row.`
      : `Learning ${plaque.kana.map((k) => k.char).join(' ')}.`;
  }
  return 'Read this.';
}

export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();
  const [mode] = useState(() => modeFrom(params));
  const { question, result, summary, fraction, check, goToNext } = useLesson(mode);
  const [leaving, setLeaving] = useState(false);
  const rank = useRank();

  if (summary) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete summary={summary} onContinue={leaveLesson} rank={rank} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <LessonTopBar fraction={fraction} onClose={() => setLeaving(true)} />

      <View style={styles.body}>
        <View style={styles.coach}>
          <Karasu mood={moodFor(result)} rank={rank} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{coachLine(mode)}</Text>
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
