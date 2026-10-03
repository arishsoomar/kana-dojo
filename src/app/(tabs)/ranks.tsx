import { router, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { BoltIcon } from '@/components/bolt-icon';
import { BrushIcon } from '@/components/brush-icon';
import { CalendarIcon } from '@/components/calendar-icon';
import { CardsIcon } from '@/components/cards-icon';
import { CheckIcon } from '@/components/check-icon';
import { ClockIcon } from '@/components/clock-icon';
import { DrumIcon } from '@/components/drum-icon';
import { Karasu } from '@/components/karasu';
import { MonIcon } from '@/components/mon-icon';
import { MoonIcon } from '@/components/moon-icon';
import { PartnerRow } from '@/components/partner-row';
import { Yokai } from '@/components/yokai';
import { colors, fonts, jpRoom } from '@/constants/theme';
import type { Assignment, AssignmentKind } from '@/core/assignments';
import { BELTS } from '@/core/boxes';
import { weakPairs } from '@/core/duel';
import { MON } from '@/core/mon';
import { lessonsSince } from '@/core/profile';
import { useAssignments } from '@/hooks/use-assignments';
import { usePartner } from '@/hooks/use-partner';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Where each assignment is done.
const DESTINATIONS: Readonly<Record<AssignmentKind, Href>> = {
  lessons: '/',
  xp: '/',
  games: '/games',
  rain: '/games/rain',
  dungeon: '/games/dungeon',
  memory: '/games/memory',
  taiko: '/games/taiko',
  calligraphy: '/games/calligraphy',
  forge: '/games/forge',
  kata: '/games/kata',
  mixups: '/scrolls',
  reviews: '/words/review',
};

// The Ranks tab: the day's assignments and the month's challenge, then your division. Weekly
// leagues against other learners come later; for now the division shows your own week.
export default function RanksScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const rank = useRank();
  const assignments = useAssignments();
  const partner = usePartner();
  // The time the screen opened; reading the clock during every render isn't allowed.
  const [now] = useState(() => Date.now());
  const thisWeek = lessonsSince(progress, now - WEEK_MS);
  const index = BELTS.indexOf(rank);
  const worstPair = weakPairs(progress).find((p) => p.mixUps > 0)?.pair ?? null;
  const { month } = assignments;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>Assignments</Text>
        <View style={styles.chip}>
          <ClockIcon />
          <Text style={styles.chipText}>{assignments.hoursLeft}h left</Text>
        </View>
      </View>

      {/* The month's challenge, from the mock. */}
      <View style={styles.month}>
        <View style={styles.monthText}>
          <Text style={styles.monthLabel}>{month.name} challenge</Text>
          <Text style={styles.monthTitle}>Finish {month.goal} for the moon</Text>
          <Bar share={month.done / month.goal} color={colors.gold} track={colors.nightRaised} />
          <Text style={styles.monthLabel}>
            {Math.min(month.done, month.goal)} of {month.goal}
            {month.done >= month.goal ? '. Moon earned!' : ''}
          </Text>
        </View>
        <View style={styles.moon}>
          <MoonIcon />
        </View>
      </View>

      <Text style={styles.heading}>Today</Text>
      <View style={styles.list}>
        {assignments.today.map((a) => (
          <AssignmentRow
            key={a.kind}
            assignment={a}
            detail={a.kind === 'mixups' && worstPair ? `Like ${worstPair.kana[0]} and ${worstPair.kana[1]}` : null}
          />
        ))}
        {/* The fourth: a goal shared with a friend. */}
        <PartnerRow
          signedIn={partner.signedIn}
          myName={partner.myName}
          choices={partner.choices}
          chosen={partner.chosen !== null}
          partner={partner.partner}
          goal={partner.goal}
          onChoose={partner.choose}
          onSetUp={() => router.push(partner.signedIn ? '/friends' : '/account')}
          onTrain={() => router.push(partner.goal?.kind === 'kata' ? '/games/kata' : '/')}
        />
      </View>

      <Text style={styles.heading}>Your division</Text>
      <View style={styles.card}>
        <View style={styles.belts}>
          {[BELTS[index - 1], rank, BELTS[index + 1]].map((belt, i) =>
            belt ? (
              <View key={belt} style={i !== 1 && styles.dim}>
                <BeltIcon belt={belt} width={i === 1 ? 64 : 40} />
              </View>
            ) : (
              <View key={`none-${i}`} style={styles.spacer} />
            ),
          )}
        </View>
        <Text style={styles.division}>{rank.charAt(0).toUpperCase() + rank.slice(1)} division</Text>
        <Text style={styles.sub}>
          {thisWeek} {thisWeek === 1 ? 'lesson' : 'lessons'}, games and exams in the last 7 days
        </Text>
      </View>

      <View style={styles.coach}>
        <Karasu mood="gentle" rank={rank} size={66} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            Weekly leagues are coming. Each week you&apos;ll train alongside about 30 learners in your division, and
            the top seven move up a belt.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function AssignmentRow({ assignment, detail }: { assignment: Assignment; detail: string | null }) {
  const { kind, title, count, target, done } = assignment;
  return (
    <Pressable
      role="button"
      aria-label={`${title}. ${done ? 'Done' : `${count} of ${target}`}`}
      onPress={() => router.push(DESTINATIONS[kind])}
      style={[styles.row, done && styles.rowDone]}>
      <View style={[styles.icon, { backgroundColor: done ? colors.pineLight : ICON_BACKGROUNDS[kind] }]}>
        <KindIcon kind={kind} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail && <Text style={styles.rowDetail}>{detail}</Text>}
        <Bar share={count / target} color={done ? colors.pine : BAR_COLORS[kind]} track={colors.line} />
      </View>
      {done ? (
        <View style={styles.reward}>
          <CheckIcon color={colors.pineDark} />
          <Text style={styles.rewardText}>+{MON.assignment}</Text>
          <MonIcon size={16} />
        </View>
      ) : (
        <Text style={styles.count}>
          {count}/{target}
        </Text>
      )}
    </Pressable>
  );
}

function Bar({ share, color, track }: { share: number; color: string; track: string }) {
  return (
    <View style={[styles.bar, { backgroundColor: track }]}>
      <View style={[styles.barFill, { width: `${Math.min(share, 1) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function KindIcon({ kind }: { kind: AssignmentKind }): ReactNode {
  switch (kind) {
    case 'lessons':
      return <Text style={styles.iconKana}>あ</Text>;
    case 'xp':
      return <BoltIcon size={22} />;
    case 'games':
    case 'memory':
      return <CardsIcon color={colors.woodDark} size={24} />;
    case 'rain':
      return <Text style={styles.iconKana}>カ</Text>;
    case 'dungeon':
      return <Yokai char="ね" size={30} />;
    case 'taiko':
      return <DrumIcon size={24} />;
    case 'calligraphy':
      return <BrushIcon color={colors.goldDark} size={22} />;
    case 'forge':
      return <Text style={styles.iconKana}>ね</Text>;
    case 'kata':
      return <CalendarIcon size={22} />;
    case 'mixups':
      return <Text style={[styles.iconKana, styles.iconMixUp]}>ぬめ</Text>;
    case 'reviews':
      // 語, "word".
      return <Text style={[styles.iconKana, styles.iconWord]}>語</Text>;
  }
}

const ICON_BACKGROUNDS: Readonly<Record<AssignmentKind, string>> = {
  lessons: colors.paper,
  xp: colors.goldLight,
  games: colors.paper,
  rain: colors.indigoLight,
  dungeon: colors.night,
  memory: colors.paper,
  taiko: colors.paper,
  calligraphy: colors.goldLight,
  forge: colors.pineLight,
  kata: colors.sumi,
  mixups: colors.vermilionLight,
  reviews: colors.indigoLight,
};

const BAR_COLORS: Readonly<Record<AssignmentKind, string>> = {
  lessons: colors.sumi,
  xp: colors.gold,
  games: colors.woodDark,
  rain: colors.indigo,
  dungeon: colors.sumi,
  memory: colors.woodDark,
  taiko: colors.vermilion,
  calligraphy: colors.gold,
  forge: colors.pine,
  kata: colors.sumi,
  mixups: colors.vermilion,
  reviews: colors.indigo,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
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
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  month: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.sumi,
  },
  monthText: {
    flex: 1,
    gap: 4,
  },
  monthLabel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  monthTitle: {
    marginBottom: 4,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.card,
  },
  moon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.nightRaised,
  },
  heading: {
    marginTop: 6,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  // Thicker border, with padding reduced to match, so the row doesn't grow.
  rowDone: {
    padding: 9.5,
    borderWidth: 2,
    borderColor: colors.pine,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    overflow: 'hidden',
    borderRadius: 8,
  },
  iconKana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    ...jpRoom(20),
    color: colors.sumi,
  },
  iconWord: {
    color: colors.indigoDark,
  },
  iconMixUp: {
    fontSize: 15,
    color: colors.vermilionDark,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  rowDetail: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  count: {
    minWidth: 44,
    textAlign: 'right',
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.pineDark,
  },
  bar: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  card: {
    alignItems: 'center',
    gap: 2,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  belts: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 4,
  },
  dim: {
    opacity: 0.35,
  },
  spacer: {
    width: 40,
  },
  division: {
    fontFamily: fonts.uiBlack,
    fontSize: 19,
    color: colors.sumi,
  },
  sub: {
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
});
