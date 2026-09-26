import { useEffect, useEffectEvent, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import { KANA } from '@/core/kana';
import type { LessonSummary } from '@/core/lesson';
import { useHaptics } from '@/hooks/use-haptics';

import { BeltIcon } from './belt-icon';
import { BoltIcon } from './bolt-icon';
import { AliveKarasu } from './alive-karasu';
import { Confetti } from './confetti';
import { PrimaryButton } from './primary-button';

type Props = {
  summary: LessonSummary;
  onContinue: () => void;
  title?: string;
  // The first stat tile. Lessons show XP; games show their score.
  headline?: { label: string; value: string };
  // An extra line under the title, like "New best!".
  note?: string;
  // A second button under Continue, like "Play again".
  secondary?: { label: string; onPress: () => void };
  rank: Belt; // sets Karasu's form
  // A big win (a duel won, a new best): confetti and a cheer. A row opening always counts.
  celebrate?: boolean;
};

// The end-of-lesson (or end-of-game) screen: Karasu cheering, three stats, and any belts earned.
export function LessonComplete({
  summary,
  onContinue,
  title = 'Lesson complete',
  headline = { label: 'XP', value: String(summary.xp) },
  note,
  secondary,
  rank,
  celebrate = false,
}: Props) {
  const haptics = useHaptics();
  const party = celebrate || summary.rowsOpened.length > 0;
  // A success buzz once, when a celebration appears. An effect event always sees the latest
  // haptics setting, without making the effect run again when it changes.
  const buzz = useEffectEvent(() => haptics.success());
  useEffect(() => {
    if (party) buzz();
  }, [party]);

  const speed = summary.strikeSpeedMs === null ? '–' : `${(summary.strikeSpeedMs / 1000).toFixed(1)}s`;

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <AliveKarasu mood="cheer" size={146} rank={rank} move={party ? { kind: 'cheer', id: 1 } : null} />
        <Text style={styles.title}>{title}</Text>
        {note && <Text style={styles.note}>{note}</Text>}
      </View>

      <View style={styles.stats}>
        <Stat label={headline.label} value={headline.value} icon={<BoltIcon />} />
        <Stat label="Accuracy" value={`${Math.round(summary.accuracy * 100)}%`} color={colors.pineDark} />
        <Stat label="Strike speed" value={speed} color={colors.indigo} />
      </View>

      {summary.rowsOpened.map(({ script, row }) => (
        <View key={`${script}:${row}`} style={[styles.card, styles.opened]}>
          <Text style={styles.cardText}>
            The <Text style={styles.kana}>{KANA.find((k) => k.script === script && k.row === row)?.char}</Text> row is
            open!
          </Text>
        </View>
      ))}

      {summary.promotions.map(({ char, belt }) => (
        <View key={char} style={styles.card}>
          <BeltIcon belt={belt} />
          <Text style={styles.cardText}>
            <Text style={styles.kana}>{char}</Text> reached {belt} belt
          </Text>
        </View>
      ))}

      <View style={styles.footer}>
        {secondary && <PrimaryButton label={secondary.label} tone="pine" onPress={secondary.onPress} />}
        <PrimaryButton label="Continue" onPress={onContinue} />
      </View>
      {party && <Confetti />}
    </View>
  );
}

type StatProps = {
  label: string;
  value: string;
  color?: string;
  icon?: ReactNode;
};

function Stat({ label, value, color = colors.sumi, icon }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        {icon}
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
  },
  hero: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    marginTop: 6,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  stats: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  statLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: colors.ink2,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontFamily: fonts.uiBlack,
    fontSize: 19,
  },
  // A new row: highlighted in the vermilion of a seal.
  opened: {
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  cardText: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  note: {
    marginTop: 2,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.goldDark,
  },
  footer: {
    gap: 10,
    marginTop: 'auto',
  },
});
