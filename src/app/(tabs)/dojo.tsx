import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { BoltIcon } from '@/components/bolt-icon';
import { CheckIcon } from '@/components/check-icon';
import { DojoRoom } from '@/components/dojo-room';
import { FlameIcon } from '@/components/flame-icon';
import { CountBadge } from '@/components/count-badge';
import { FriendsIcon } from '@/components/friends-icon';
import { MonIcon } from '@/components/mon-icon';
import { MoonIcon } from '@/components/moon-icon';
import { PlaqueIcon } from '@/components/plaque-icon';
import { SettingsIcon } from '@/components/settings-icon';
import { KanaIcon } from '@/components/tab-icons';
import { colors, fonts } from '@/constants/theme';
import { dojoRoom } from '@/core/dojo';
import {
  badgeLevel,
  kanaLearned,
  overallAccuracy,
  overallStrikeSpeed,
  rowBeltsEarned,
  trainingSince,
  type BadgeProgress,
} from '@/core/profile';
import { KANA } from '@/core/kana';
import { useFriends } from '@/hooks/use-friends';
import { useMon } from '@/hooks/use-mon';
import { useAssignments } from '@/hooks/use-assignments';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useStreak } from '@/hooks/use-streak';

// Badge goals: streak days for Unbroken, row belts earned for Graded, moons for Moon-watcher.
const UNBROKEN_GOALS = [7, 30, 100];
const GRADED_GOALS = [5, 10, 20];
const MOON_GOALS = [1, 3, 12];

// The Dojo tab: your room, filled with what you've earned (the supply shed is through its
// doorway), then your rank, numbers and badges. Friends and settings are in the header.
export default function DojoTab() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const assignments = useAssignments();
  const rank = useRank();
  const streak = useStreak();
  const mon = useMon();
  const { waiting } = useFriends();
  const room = dojoRoom(progress, { streak: streak.current, moons: assignments.moons });
  const since = trainingSince(progress);
  const accuracy = overallAccuracy(progress);
  const speed = overallStrikeSpeed(progress);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Your dojo</Text>
        <Pressable role="button" aria-label={`${mon.balance} mon. Open the supply shed`} onPress={() => router.push('/shed')} style={styles.chip}>
          <MonIcon />
          <Text style={styles.chipText}>{mon.balance}</Text>
        </Pressable>
        <Pressable
          role="button"
          aria-label={waiting > 0 ? `Friends, ${waiting} ${waiting === 1 ? 'request' : 'requests'} waiting` : 'Friends'}
          onPress={() => router.push('/friends')}
          hitSlop={10}>
          <FriendsIcon />
          <CountBadge count={waiting} />
        </Pressable>
        <Pressable role="button" aria-label="Settings" onPress={() => router.push('/settings')} hitSlop={10}>
          <SettingsIcon />
        </Pressable>
      </View>

      <DojoRoom room={room} rank={rank} mon={mon.balance} onShed={() => router.push('/shed')} />

      <View style={styles.rankRow}>
        <BeltIcon belt={rank} width={46} />
        <View>
          <Text style={styles.rank}>{capitalize(rank)} belt</Text>
          <Text style={styles.since}>
            {since === null
              ? 'Finish a lesson to start training'
              : `Training since ${new Date(since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat icon={<FlameIcon size={28} />} value={String(streak.current)} label="Day streak" />
        <Stat icon={<KanaIcon color={colors.sumi} size={28} />} value={`${kanaLearned(progress)}/${KANA.length}`} label="Kana learned" />
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
        <Stat icon={<PlaqueIcon color={colors.wood} lines={colors.woodDark} size={28} />} value={`${room.plaques.length}/${room.rowCount}`} label="Plaques" />
        <Stat icon={<Text style={styles.hanko}>勝</Text>} value={String(room.scrollsWon)} label="Scrolls won" />
      </View>

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
      <Badge
        name="Moon-watcher"
        about="Monthly challenges met"
        icon={<MoonIcon size={22} color={colors.card} />}
        tint={colors.gold}
        progress={badgeLevel(assignments.moons, MOON_GOALS)}
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
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  title: {
    flex: 1,
    marginTop: 4,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  chipText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  rank: {
    fontFamily: fonts.uiBlack,
    fontSize: 19,
    color: colors.sumi,
  },
  since: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  hanko: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: colors.vermilion,
    textAlign: 'center',
    fontFamily: fonts.jp,
    fontSize: 14,
    lineHeight: 23,
    color: colors.vermilion,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  heading: {
    marginTop: 4,
    paddingHorizontal: 4,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
