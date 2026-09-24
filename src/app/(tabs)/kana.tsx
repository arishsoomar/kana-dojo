import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { KanaCell } from '@/components/kana-cell';
import { ProgressRing } from '@/components/progress-ring';
import { SegmentedControl } from '@/components/segmented-control';
import { colors, fonts } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import { masteryGrid } from '@/core/grid';
import type { Script } from '@/core/kana';
import { useProgress } from '@/hooks/use-progress';

const SCRIPTS = [
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'katakana', label: 'Katakana' },
] as const;

// Highest belt first, as in the mock.
const SHOWN_BELTS: readonly Belt[] = ['black', 'brown', 'green'];

export default function KanaScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [script, setScript] = useState<Script>('hiragana');
  const grid = masteryGrid(progress, script);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Your kana</Text>

      <SegmentedControl options={SCRIPTS} value={script} onChange={setScript} />

      <View style={styles.summary}>
        <ProgressRing fraction={grid.pastWhite / grid.total} label={String(grid.pastWhite)} />
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>
            {grid.pastWhite} of {grid.total} past white
          </Text>
          <View style={styles.beltCounts}>
            {SHOWN_BELTS.map((belt) => (
              <View key={belt} style={styles.beltCount} aria-label={`${grid.counts[belt]} ${belt} belt`}>
                <BeltIcon belt={belt} width={30} />
                <Text style={styles.beltCountText}>{grid.counts[belt]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.rows}>
        {grid.rows.map(({ row, cells }) => (
          <View key={row} style={styles.row}>
            <Text style={styles.rowLabel}>{row}</Text>
            {cells.map((cell) => (
              <KanaCell key={cell.kana.char} cell={cell} />
            ))}
            {/* Short rows (ya, wa) keep the same column widths as the rest. */}
            {Array.from({ length: 5 - cells.length }, (_, i) => (
              <View key={`empty-${i}`} style={styles.emptyCell} />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

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
  title: {
    marginTop: 4,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  beltCounts: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  beltCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  beltCountText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.sumi,
  },
  rows: {
    gap: 8,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    width: 22,
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.muted,
  },
  // Same border width as a real cell (but invisible), so every column lines up.
  emptyCell: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
