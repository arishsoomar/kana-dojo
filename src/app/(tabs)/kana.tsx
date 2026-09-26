import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { KanaCell } from '@/components/kana-cell';
import { pronounce } from '@/audio/pronounce';
import { KanaDetailSheet } from '@/components/kana-detail-sheet';
import { ProgressRing } from '@/components/progress-ring';
import { SegmentedControl } from '@/components/segmented-control';
import { colors, fonts } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import { kanaDetails } from '@/core/details';
import { pairTipFor } from '@/core/feedback';
import { masteryGrid } from '@/core/grid';
import { KANA, lookalikesOf, rowMark, type Kana, type RowId, type Script } from '@/core/kana';
import { kanaTip } from '@/core/tips';
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
  const [open, setOpen] = useState<Kana | null>(null);
  const grid = masteryGrid(progress, script);

  function drill(kana: Kana) {
    setOpen(null);
    router.push({ pathname: '/lesson', params: { drill: kana.char } });
  }

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
        {grid.rows.map(({ row, belt, cells }, i) => {
          // A heading where the marked rows begin, saying what the mark does.
          const previous = grid.rows[i - 1];
          const newMark = rowMark(row) !== null && rowMark(row) !== (previous ? rowMark(previous.row) : null);
          return (
            <Fragment key={row}>
              {newMark && <MarkHeading row={row} script={script} />}
              <View style={styles.row}>
                {/* The row's name and its belt: the belt of its weakest kana. */}
                <View style={styles.rowLabel} aria-label={`${row} row, ${belt} belt`}>
                  <Text style={styles.rowName}>{row}</Text>
                  <BeltIcon belt={belt} width={24} />
                </View>
                {cells.map((cell) => (
                  <KanaCell key={cell.kana.char} cell={cell} onPress={() => setOpen(cell.kana)} />
                ))}
                {/* Short rows (ya, wa) keep the same column widths as the rest. */}
                {Array.from({ length: 5 - cells.length }, (_, n) => (
                  <View key={`empty-${n}`} style={styles.emptyCell} />
                ))}
              </View>
            </Fragment>
          );
        })}
      </View>

      {open && (
        <DetailSheet kana={open} onDrill={() => drill(open)} onClose={() => setOpen(null)} />
      )}
    </ScrollView>
  );
}

// "Dakuten ゛" with an example from this script, like か ka → が ga.
function MarkHeading({ row, script }: { row: RowId; script: Script }) {
  const mark = rowMark(row);
  if (!mark) return null;
  const [plain, marked] = mark === 'dakuten' ? ['ka', 'ga'] : ['ha', 'pa'];
  const char = (romaji: string) => KANA.find((k) => k.script === script && k.romaji[0] === romaji)?.char ?? '';
  return (
    <View style={styles.markHeading}>
      <Text style={styles.markTitle}>{mark === 'dakuten' ? 'Dakuten ゛' : 'Handakuten ゜'}</Text>
      <Text style={styles.markSub}>
        {mark === 'dakuten' ? 'Two little strokes voice the sound: ' : 'A little circle turns h into p: '}
        <Text style={styles.markKana}>{char(plain)}</Text> {plain} → <Text style={styles.markKana}>{char(marked)}</Text> {marked}
      </Text>
    </View>
  );
}

function DetailSheet({ kana, onDrill, onClose }: { kana: Kana; onDrill: () => void; onClose: () => void }) {
  const { progress } = useProgress();
  const details = kanaDetails(progress, kana);
  // Tip: how to tell it from its most common mix-up or a lookalike, else its own memory tip.
  const tip =
    pairTipFor(kana.char, [...details.mixUps.map((m) => m.char), ...lookalikesOf(kana.char)]) ?? kanaTip(kana.char);
  return (
    <KanaDetailSheet kana={kana} details={details} tip={tip} onDrill={onDrill} onSpeak={() => pronounce(kana)} onClose={onClose} />
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
  markHeading: {
    marginTop: 14,
    marginBottom: 2,
    gap: 2,
  },
  markTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  markSub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  markKana: {
    fontFamily: fonts.jp,
    color: colors.sumi,
  },
  rowLabel: {
    alignItems: 'center',
    gap: 2,
    width: 26,
  },
  rowName: {
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
