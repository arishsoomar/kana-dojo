import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { BoltIcon } from '@/components/bolt-icon';
import { CheckIcon } from '@/components/check-icon';
import { FlameIcon } from '@/components/flame-icon';
import { Karasu } from '@/components/karasu';
import { KanaIcon } from '@/components/tab-icons';
import { colors, fonts } from '@/constants/theme';
import { setSound } from '@/core/answers';
import { DAILY_GOALS } from '@/core/goal';
import {
  badgeLevel,
  kanaLearned,
  overallAccuracy,
  overallStrikeSpeed,
  rowBeltsEarned,
  trainingSince,
  type BadgeProgress,
} from '@/core/profile';
import { useAuth } from '@/hooks/use-auth';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useStreak } from '@/hooks/use-streak';

// On web the switch's knob colour comes from activeThumbColor, not thumbColor. React Native's
// types don't list it (it only exists on web), hence the cast.
const webThumbColor = Platform.OS === 'web' ? ({ activeThumbColor: colors.card } as object) : {};

// Badge goals: streak days for Unbroken, row belts earned for Graded.
const UNBROKEN_GOALS = [7, 30, 100];
const GRADED_GOALS = [5, 10, 20];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { progress, updateProgress } = useProgress();
  const rank = useRank();
  const streak = useStreak();
  const since = trainingSince(progress);
  const accuracy = overallAccuracy(progress);
  const speed = overallStrikeSpeed(progress);
  const goal = DAILY_GOALS.find((g) => g.lessons === progress.settings.dailyGoal);
  const auth = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Karasu mood="focus" rank={rank} size={98} />
        <Text style={styles.rank}>{capitalize(rank)} belt</Text>
        <View style={styles.sinceRow}>
          <BeltIcon belt={rank} width={52} />
          <Text style={styles.since}>
            {since === null
              ? 'Finish a lesson to start training'
              : `Training since ${new Date(since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat icon={<FlameIcon size={28} />} value={String(streak.current)} label="Day streak" />
        <Stat icon={<KanaIcon color={colors.sumi} size={28} />} value={`${kanaLearned(progress)}/92`} label="Kana learned" />
        <Stat
          icon={<BoltIcon size={28} />}
          value={speed === null ? '–' : `${(speed / 1000).toFixed(1)}s`}
          label="Strike speed"
        />
        <Stat
          icon={<CheckIcon color={colors.pine} size={28} />}
          value={accuracy === null ? '–' : `${Math.round(accuracy * 100)}%`}
          label="Accuracy"
        />
      </View>

      <Pressable role="button" onPress={() => router.push('/goal')} style={styles.goal}>
        <View style={styles.goalText}>
          <Text style={styles.goalTitle}>Daily goal</Text>
          <Text style={styles.goalSub}>
            {goal ? `${goal.name} · ${goal.minutes} minutes, ${goal.lessons} ${goal.lessons === 1 ? 'lesson' : 'lessons'} a day` : ''}
          </Text>
        </View>
        <Text style={styles.goalChange}>Change</Text>
      </Pressable>

      {/* The same setting as the speaker button in a lesson's top bar. */}
      <View style={styles.goal}>
        <View style={styles.goalText}>
          <Text style={styles.goalTitle}>Sound</Text>
          <Text style={styles.goalSub}>Hear each kana spoken after you answer it</Text>
        </View>
        <Switch
          aria-label="Sound"
          value={progress.settings.sound}
          onValueChange={(on) => updateProgress(setSound(progress, on))}
          trackColor={{ false: colors.edge, true: colors.pine }}
          thumbColor={colors.card}
          {...webThumbColor}
        />
      </View>

      {/* Only shown when this build has accounts set up. */}
      {auth.available && (
        <Pressable role="button" onPress={() => router.push('/account')} style={styles.goal}>
          <View style={styles.goalText}>
            <Text style={styles.goalTitle}>{auth.email ? 'Account' : 'Save your progress to an account'}</Text>
            <Text style={styles.goalSub}>{auth.email ? `Signed in as ${auth.email}` : 'Optional. Sign in with a code sent to your email.'}</Text>
          </View>
          <Text style={styles.goalChange}>{auth.email ? 'Manage' : 'Sign in'}</Text>
        </Pressable>
      )}

      <Text style={styles.heading}>Badges</Text>
      <Badge
        name="Unbroken"
        about="Days in a row"
        icon={<FlameIcon size={24} />}
        tint={colors.vermilion}
        progress={badgeLevel(streak.current, UNBROKEN_GOALS)}
      />
      <Badge
        name="Graded"
        about="Row belts earned by exam"
        icon={<BeltIcon belt="white" width={28} />}
        tint={colors.sumi}
        progress={badgeLevel(rowBeltsEarned(progress), GRADED_GOALS)}
      />
    </ScrollView>
  );
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

type BadgeProps = {
  name: string;
  about: string;
  icon: ReactNode;
  tint: string;
  progress: BadgeProgress;
};

// A badge with levels, and how far along the next one is.
function Badge({ name, about, icon, tint, progress }: BadgeProps) {
  const { level, goal, value } = progress;
  const fraction = goal === null ? 1 : value / goal;
  return (
    <View style={styles.badge} aria-label={`${name}, level ${level}`}>
      <View style={[styles.badgeIcon, { backgroundColor: tint }]}>{icon}</View>
      <View style={styles.badgeBody}>
        <Text style={styles.badgeName}>
          {name} <Text style={styles.badgeLevel}>Level {level}</Text>
        </Text>
        <Text style={styles.badgeAbout}>{about}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(fraction, 1) * 100}%`, backgroundColor: tint }]} />
        </View>
      </View>
      <Text style={styles.badgeCount}>{goal === null ? 'Max' : `${value}/${goal}`}</Text>
    </View>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 14,
    backgroundColor: colors.sumi,
  },
  rank: {
    marginTop: 2,
    fontFamily: fonts.uiBlack,
    fontSize: 23,
    color: colors.card,
  },
  sinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  since: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.muted,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 18,
  },
  stat: {
    flexBasis: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  statValue: {
    fontFamily: fonts.uiBlack,
    fontSize: 17,
    color: colors.sumi,
  },
  statLabel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 18,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  goalSub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  goalChange: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  heading: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 18,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  badgeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  badgeBody: {
    flex: 1,
  },
  badgeName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  badgeLevel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  badgeAbout: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  track: {
    height: 6,
    marginTop: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  badgeCount: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
});
