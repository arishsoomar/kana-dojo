import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { BeltIcon } from '@/components/belt-icon';
import { Karasu } from '@/components/karasu';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts } from '@/constants/theme';
import { finishOnboarding, setScript } from '@/core/answers';
import type { Belt } from '@/core/boxes';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

type Start = 'new' | 'some' | 'all';

const STARTS: readonly { value: Start; belt: Belt; title: string; sub: string }[] = [
  { value: 'new', belt: 'white', title: "I'm brand new", sub: 'Start at white belt, the あ row' },
  { value: 'some', belt: 'green', title: 'I know some hiragana', sub: 'Take a short grading test and skip what you know' },
  { value: 'all', belt: 'brown', title: 'I know all hiragana', sub: 'Start with katakana' },
];

// The last onboarding step: where to start. A grading test, if chosen, finishes onboarding
// itself; otherwise onboarding finishes here.
export default function StartScreen() {
  const insets = useSafeAreaInsets();
  const { progress, updateProgress } = useProgress();
  const rank = useRank();
  const [choice, setChoice] = useState<Start>('new');

  function next() {
    if (choice === 'some') {
      router.push('/placement');
      return;
    }
    const start = choice === 'all' ? setScript(progress, 'katakana') : progress;
    updateProgress(finishOnboarding(start));
    router.replace('/');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={() => router.back()} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={styles.fill} />
        </View>
      </View>

      <View style={styles.coach}>
        <Karasu mood="gentle" rank={rank} size={72} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Do you know any kana already?</Text>
        </View>
      </View>

      <View style={styles.options} role="radiogroup">
        {STARTS.map((start) => {
          const selected = start.value === choice;
          return (
            <Pressable
              key={start.value}
              role="radio"
              aria-checked={selected}
              onPress={() => setChoice(start.value)}
              style={[styles.option, selected && styles.optionSelected]}>
              <BeltIcon belt={start.belt} width={50} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{start.title}</Text>
                <Text style={styles.optionSub}>{start.sub}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={next} />
      </View>
    </View>
  );
}

const BORDER = 1.5;
const SELECTED_BORDER = 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  track: {
    flex: 1,
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.edge,
  },
  // The second of onboarding's three steps.
  fill: {
    width: '66%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.sumi,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
    paddingHorizontal: 18,
  },
  bubble: {
    flex: 1,
    marginTop: 8,
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
  options: {
    gap: 10,
    paddingHorizontal: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: BORDER,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  // Selection is a thicker border, never a fill.
  optionSelected: {
    padding: 12 - (SELECTED_BORDER - BORDER),
    borderWidth: SELECTED_BORDER,
    borderColor: colors.sumi,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  optionSub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 18,
  },
});
