import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { FlameIcon } from '@/components/flame-icon';
import { Karasu } from '@/components/karasu';
import { PlaqueTile } from '@/components/plaque-tile';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { colors, fonts, wallColors } from '@/constants/theme';
import type { Script } from '@/core/kana';
import { learnPath, type LearnPath, type PathUnit, type Plaque } from '@/core/path';
import { greenNeeded } from '@/core/unlock';
import { useProgress } from '@/hooks/use-progress';
import { useStreak } from '@/hooks/use-streak';

const SCRIPTS = [
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'katakana', label: 'Katakana' },
] as const;

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const streak = useStreak();
  const [script, setScript] = useState<Script>('hiragana');
  const path = learnPath(progress, script);
  const unit = path.currentUnit;
  const needed = greenNeeded(progress, script, unit.row);

  function openPlaque(plaque: Plaque) {
    router.push({ pathname: '/lesson', params: { plaque: plaque.id } });
  }

  function practice() {
    router.push({ pathname: '/lesson', params: { script } });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        <View style={styles.toggle}>
          <SegmentedControl options={SCRIPTS} value={script} onChange={setScript} />
        </View>
        <Pressable
          role="button"
          aria-label={`Streak: ${streak.current} ${streak.current === 1 ? 'day' : 'days'}`}
          onPress={() => router.push('/streak')}
          style={styles.streak}>
          <FlameIcon />
          <Text style={[styles.streakCount, streak.current === 0 && styles.streakCountZero]}>{streak.current}</Text>
        </Pressable>
      </View>

      <View style={styles.unitCard}>
        <Text style={styles.unitNumber}>Unit {unit.number}</Text>
        <Text style={styles.unitTitle}>
          The <Text style={styles.kana}>{rowKana(unit)}</Text> row
        </Text>
        <View style={styles.unitBelt}>
          <BeltIcon belt={unit.belt} width={40} />
          <Text style={styles.unitBeltText}>
            {capitalize(unit.belt)} belt, {unit.done} of {unit.plaques.length} done
          </Text>
        </View>
      </View>

      <View style={styles.coach}>
        <Karasu mood="focus" size={64} />
        <View style={styles.coachBody}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{coachLine(path, needed)}</Text>
          </View>
          {path.current ? (
            <PrimaryButton label="Begin" onPress={() => path.current && openPlaque(path.current)} />
          ) : (
            <PrimaryButton label="Practice" onPress={practice} />
          )}
        </View>
      </View>

      {path.units.map((u) => (
        <View key={u.row} style={styles.shelf}>
          <View style={styles.shelfLabel}>
            <Text style={[styles.shelfTitle, !u.open && styles.shelfTitleLocked]}>
              Unit {u.number} · <Text style={styles.kana}>{rowKana(u)}</Text> row
            </Text>
            {u.open && <BeltIcon belt={u.belt} width={30} />}
          </View>
          <View style={styles.rail} />
          <View style={styles.plaques}>
            {u.plaques.map(({ plaque, state }) => (
              <PlaqueTile key={plaque.id} plaque={plaque} state={state} onPress={() => openPlaque(plaque)} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// The first kana of a unit's row, e.g. "か" for the ka row.
function rowKana(unit: PathUnit): string {
  return unit.plaques[0]?.plaque.kana[0]?.char ?? '';
}

function coachLine(path: LearnPath, needed: number): string {
  const { current } = path;
  if (current) {
    return current.kind === 'mixed'
      ? 'Next: review the whole row.'
      : `Next: learn ${current.kana.map((k) => k.char).join(' ')}.`;
  }
  if (needed > 0) {
    return `Practice until ${needed} more ${needed === 1 ? 'kana reaches' : 'kana reach'} green belt to open the next row.`;
  }
  return 'Every plaque is done. Keep practicing to hold your belts.';
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
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    flex: 1,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakCount: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.vermilion,
  },
  streakCountZero: {
    color: colors.muted,
  },
  unitCard: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.sumi,
  },
  unitNumber: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  unitTitle: {
    fontFamily: fonts.uiBlack,
    fontSize: 20,
    color: colors.card,
  },
  unitBelt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  unitBeltText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  coachBody: {
    flex: 1,
    gap: 8,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  bubbleText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.sumi,
  },
  shelf: {
    marginTop: 8,
  },
  shelfLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  shelfTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.sumi,
  },
  shelfTitleLocked: {
    color: colors.muted,
  },
  rail: {
    height: 8,
    marginHorizontal: -18,
    backgroundColor: wallColors.rail,
  },
  plaques: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: -4,
    paddingLeft: 6,
  },
});
