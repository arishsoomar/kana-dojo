import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { Karasu } from '@/components/karasu';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { finishOnboarding } from '@/core/answers';
import { DAILY_GOALS, setDailyGoal } from '@/core/goal';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Choose how much to train each day. Part of onboarding for a new learner (after the
// welcome); from Profile, the same screen changes the goal.
export default function GoalScreen() {
  const insets = useSafeAreaInsets();
  const { progress, updateProgress } = useProgress();
  const rank = useRank();
  const onboarding = !progress.settings.onboarded;
  const [choice, setChoice] = useState(progress.settings.dailyGoal);

  function done() {
    const withGoal = setDailyGoal(progress, choice);
    if (onboarding) {
      updateProgress(finishOnboarding(withGoal));
      router.replace('/');
    } else {
      updateProgress(withGoal);
      goBack();
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label={onboarding ? 'Back' : 'Close'} onPress={goBack} hitSlop={10}>
          {onboarding ? <BackIcon color={colors.ink2} /> : <XIcon color={colors.ink2} />}
        </Pressable>
        {onboarding && (
          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
        )}
      </View>

      <View style={styles.coach}>
        <Karasu mood="gentle" rank={rank} size={72} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>How long will you train each day?</Text>
        </View>
      </View>

      <View style={styles.options} role="radiogroup">
        {DAILY_GOALS.map((goal) => {
          const selected = goal.lessons === choice;
          return (
            <Pressable
              key={goal.lessons}
              role="radio"
              aria-checked={selected}
              onPress={() => setChoice(goal.lessons)}
              style={[styles.option, selected && styles.optionSelected]}>
              <Text style={styles.minutes}>{goal.minutes} minutes</Text>
              <Text style={[styles.name, selected && styles.nameSelected]}>
                {goal.name} · {goal.lessons} {goal.lessons === 1 ? 'lesson' : 'lessons'}
              </Text>
            </Pressable>
          );
        })}
        <Text style={styles.note}>You can change this anytime.</Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label={onboarding ? 'Continue' : 'Save'} onPress={done} />
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
  // Onboarding is two steps (welcome, then this), so this one shows halfway.
  fill: {
    width: '50%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.sumi,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 6,
    marginBottom: 18,
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
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: BORDER,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  // Selection is a thicker border, never a fill; padding shrinks so the card doesn't grow.
  optionSelected: {
    padding: 14 - (SELECTED_BORDER - BORDER),
    borderWidth: SELECTED_BORDER,
    borderColor: colors.sumi,
  },
  minutes: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  name: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.muted,
  },
  nameSelected: {
    color: colors.sumi,
  },
  note: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 18,
  },
});
