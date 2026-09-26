import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { ComboChip } from '@/components/combo-chip';
import { FeedbackSheet } from '@/components/feedback-sheet';
import { KanaFrame } from '@/components/kana-frame';
import { AliveKarasu } from '@/components/alive-karasu';
import type { KarasuMood } from '@/components/karasu';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { LessonTopBar } from '@/components/lesson-top-bar';
import { SpeakerIcon } from '@/components/speaker-icon';
import { TypeAnswer } from '@/components/type-answer';
import { colors, fonts } from '@/constants/theme';
import { pronounce } from '@/audio/pronounce';
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
  const {
    question,
    questionKey,
    result,
    summary,
    heard,
    reaction,
    combo,
    sound,
    toggleSound,
    typing,
    toggleTyping,
    fraction,
    check,
    checkTyped,
    goToNext,
  } = useLesson(mode);
  const [leaving, setLeaving] = useState(false);
  const rank = useRank();

  // Android's back button asks first, like the X. (iOS swipe-back is already off for lessons.)
  // Once the lesson is complete, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (summary) return false;
      setLeaving(true);
      return true; // handled: don't leave the screen
    });
    return () => subscription.remove();
  }, [summary]);

  // Only a wrong answer gets the feedback sheet; a correct one moves on by itself.
  const wrong = result !== null && !result.correct;

  if (summary) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete summary={summary} onContinue={leaveLesson} rank={rank} />
      </View>
    );
  }

  return (
    // In typing mode the keyboard is up, so the screen makes room for it.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}>
      <LessonTopBar
        fraction={fraction}
        onClose={() => setLeaving(true)}
        sound={sound}
        onToggleSound={toggleSound}
        typing={typing}
        onToggleTyping={toggleTyping}
      />

      <View style={styles.body}>
        <View style={styles.coach}>
          <AliveKarasu mood={moodFor(result)} rank={rank} move={reaction} />
          {/* Before the first answer, what this lesson is. After it, the kana just answered,
              with a button to hear it again. */}
          {heard ? (
            <Pressable
              role="button"
              aria-label={`Hear ${heard.char} again`}
              onPress={() => pronounce(heard)}
              style={[styles.bubble, styles.heard]}>
              <Text style={styles.bubbleText}>
                <Text style={styles.heardKana}>{heard.char}</Text> · {heard.romaji[0]}
              </Text>
              <SpeakerIcon color={colors.ink2} size={20} />
            </Pressable>
          ) : (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{coachLine(mode)}</Text>
            </View>
          )}
        </View>

        {/* The frame grows to fill the middle; the answers sit at the bottom, near the thumb. */}
        <View style={styles.frame}>
          <KanaFrame char={question.kana.char} />
          <ComboChip count={combo} />
        </View>

        {/* A fresh box for each question: it clears, and opens the keyboard. */}
        {typing ? (
          <TypeAnswer key={questionKey} wrong={wrong} onSubmit={checkTyped} />
        ) : (
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
        )}
      </View>

      {/* The bottom padding lives here, so the white sheet reaches the bottom edge. */}
      <View style={[wrong && styles.sheetArea, { paddingBottom: insets.bottom + (wrong ? 22 : 12) }]}>
        {wrong && <FeedbackSheet result={result} onContinue={goToNext} />}
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leaveLesson} />
    </KeyboardAvoidingView>
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
  heard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heardKana: {
    fontFamily: fonts.jp,
  },
  // Holds the frame (which grows to fill the middle) and the combo chip in its corner.
  frame: {
    flex: 1,
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
