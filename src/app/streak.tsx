import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheckIcon } from '@/components/check-icon';
import { FlameIcon } from '@/components/flame-icon';
import { Karasu } from '@/components/karasu';
import { PrimaryButton } from '@/components/primary-button';
import { RestIcon } from '@/components/rest-icon';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import type { Streak, StreakDay } from '@/core/streak';
import { useStreak } from '@/hooks/use-streak';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function StreakScreen() {
  const insets = useSafeAreaInsets();
  const streak = useStreak();

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 22 }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { paddingTop: insets.top + 6 }]}>
          <Pressable role="button" aria-label="Close" onPress={close} hitSlop={10} style={styles.close}>
            <XIcon color={colors.ink2} />
          </Pressable>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.count}>{streak.current}</Text>
              <Text style={styles.countLabel}>{streak.current === 1 ? 'day training' : 'days training'}</Text>
            </View>
            <FlameIcon size={96} />
          </View>
          <Text style={styles.heroSub}>{heroLine(streak)}</Text>
        </View>

        <View style={[styles.card, styles.weekCard]}>
          {streak.week.map((day, i) => (
            <DayDot key={day.day} day={day} isToday={i === streak.week.length - 1} />
          ))}
        </View>

        <View style={[styles.card, styles.restCard]}>
          <RestIcon />
          <View style={styles.restText}>
            <Text style={styles.restTitle}>Rest day</Text>
            <Text style={styles.restSub}>Keeps your streak if you miss a day. Earn one every 7 days.</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {streak.restDays} of {streak.maxRestDays}
            </Text>
          </View>
        </View>

        <View style={styles.coach}>
          <Karasu mood="gentle" size={66} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{coachLine(streak)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={streak.trainedToday ? 'Keep training' : 'Start a lesson'} onPress={close} />
      </View>
    </View>
  );
}

function DayDot({ day, isToday }: { day: StreakDay; isToday: boolean }) {
  return (
    <View style={styles.day} aria-label={`${day.day}: ${day.status}`}>
      <Text style={[styles.dayLetter, isToday && styles.todayLetter]}>{day.letter}</Text>
      <View style={[styles.dot, dotStyles[day.status]]}>
        {day.status === 'trained' && <CheckIcon color={colors.card} />}
        {day.status === 'rest' && <RestIcon size={22} />}
      </View>
    </View>
  );
}

// The big line under the count.
function heroLine(streak: Streak): string {
  if (streak.trainedToday) return 'Trained today. See you tomorrow.';
  if (streak.current > 0) return `Train today to reach ${streak.current + 1}`;
  return 'Finish a lesson today to start a streak';
}

// What Karasu says. Never guilt: a broken streak gets a welcome back.
function coachLine(streak: Streak): string {
  const { current, restDays, previous, trainedToday } = streak;
  if (current === 0 && previous) return 'Welcome back. Your belts are still yours. One lesson starts a new streak.';
  if (current === 0) return 'One lesson a day is all it takes. Start today.';
  const days = current === 1 ? 'One day' : `${current} days`;
  if (trainedToday) return `${days}. Good training. Rest well.`;
  if (restDays > 0) return `${days}. A rest day is there if you need it, no shame in that.`;
  return `${days}. A short lesson today keeps it going.`;
}

const DOT = 30;

const dotStyles = StyleSheet.create({
  trained: { backgroundColor: colors.vermilion },
  rest: { backgroundColor: colors.indigoLight },
  // A missed day is shown plainly, not in red: it's a fact, not a failure.
  missed: { borderWidth: 2, borderColor: colors.edge },
  today: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.vermilion },
  none: { backgroundColor: colors.line },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingBottom: 12,
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 30,
    backgroundColor: colors.vermilionLight,
  },
  close: {
    alignSelf: 'flex-start',
    marginLeft: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  count: {
    fontFamily: fonts.uiBlack,
    fontSize: 60,
    lineHeight: 64,
    color: colors.vermilionDark,
  },
  countLabel: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 17,
    color: colors.vermilionDark,
  },
  heroSub: {
    marginTop: 4,
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  card: {
    marginHorizontal: 18,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  weekCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -12,
  },
  day: {
    alignItems: 'center',
    gap: 4,
  },
  dayLetter: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  todayLetter: {
    color: colors.vermilionDark,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
  restCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  restText: {
    flex: 1,
  },
  restTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  restSub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.sumi,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginHorizontal: 18,
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
    fontSize: 13.5,
    color: colors.sumi,
  },
  footer: {
    paddingHorizontal: 18,
  },
});
