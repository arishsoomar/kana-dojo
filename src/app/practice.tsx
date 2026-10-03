import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { CheckIcon } from '@/components/check-icon';
import { LockIcon } from '@/components/lock-icon';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts, jpRoom } from '@/constants/theme';
import { KANA, rowKind, rowsOf, type Kana, type RowId, type Script } from '@/core/kana';
import { practicePool, practiceRows, type RowPick } from '@/core/practice';
import { useProgress } from '@/hooks/use-progress';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

const key = (p: RowPick) => `${p.script}:${p.row}`;

// Where a kana sits down its column: by its vowel. Combined sounds (きゃ, きゅ, きょ) use
// three slots, the rest five. ん has no vowel; it takes the empty middle of the わ column.
const VOWELS = ['a', 'i', 'u', 'e', 'o'] as const;
const COMBINED = ['a', 'u', 'o'] as const;

function slotOf(kana: Kana): string {
  const romaji = kana.romaji[0];
  if (romaji === 'n') return 'u';
  return romaji.slice(-1);
}

// A grid section: its title, its columns (rows of kana, in order), and its vowel slots.
type Section = { title: string; script: Script; rows: RowId[]; slots: readonly string[]; wide: boolean };

function sectionsFor(script: Script, name: string): Section[] {
  const rows = rowsOf(script);
  const plain = rows.filter((r) => ['basic', 'dakuten', 'handakuten'].includes(rowKind(r)));
  const combined = rows.filter((r) => rowKind(r) === 'yoon');
  const extended = rows.filter((r) => rowKind(r) === 'extended');
  return [
    { title: name, script, rows: plain, slots: VOWELS, wide: false },
    { title: `${name} combinations`, script, rows: combined, slots: COMBINED, wide: true },
    ...(extended.length > 0 ? [{ title: 'Extended katakana', script, rows: extended, slots: VOWELS, wide: true }] : []),
  ];
}

const SECTIONS: readonly Section[] = [...sectionsFor('hiragana', 'Hiragana'), ...sectionsFor('katakana', 'Katakana')];

// Free practice: choose rows from either script, or both, and practise them for as long as
// you like. Every row is shown in a chart, like a kana table; rows the Learn wall hasn't
// opened yet are greyed out and can't be chosen.
export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const open = new Set(
    (['hiragana', 'katakana'] as const).flatMap((script) => practiceRows(progress, script).map((row) => key({ script, row }))),
  );
  // Everything open, to start with.
  const [chosen, setChosen] = useState<ReadonlySet<string>>(() => new Set(open));

  const picks: RowPick[] = SECTIONS.flatMap(({ script, rows }) => rows.filter((row) => chosen.has(key({ script, row }))).map((row) => ({ script, row })));
  const kanaCount = practicePool(progress, picks).length;

  // Turns rows on or off; rows that aren't open are left alone.
  function set(script: Script, rows: readonly RowId[], on: boolean) {
    const next = new Set(chosen);
    for (const row of rows) {
      const k = key({ script, row });
      if (!open.has(k)) continue;
      if (on) next.add(k);
      else next.delete(k);
    }
    setChosen(next);
  }

  // Whether every open row among these is chosen (and there's at least one).
  function allOn(script: Script, rows: readonly RowId[]): boolean {
    const openRows = rows.filter((row) => open.has(key({ script, row })));
    return openRows.length > 0 && openRows.every((row) => chosen.has(key({ script, row })));
  }

  function start() {
    router.push({ pathname: '/lesson', params: { rows: picks.map(key).join(',') } });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Practice kana</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Tick the columns to practise. Questions keep coming until you stop, with no exam; right answers still move each kana
          toward its next belt. Greyed-out rows open on the Learn wall.
        </Text>

        {SECTIONS.map((section) => {
          const { script, rows } = section;
          const basic = rows.filter((r) => rowKind(r) === 'basic');
          const voiced = rows.filter((r) => rowKind(r) === 'dakuten' || rowKind(r) === 'handakuten');
          const toggles =
            basic.length > 0
              ? [
                  { label: 'All', rows },
                  { label: 'Regular', rows: basic },
                  { label: 'Dakuten', rows: voiced },
                ]
              : [{ label: 'All', rows }];
          return (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.toggles}>
                  {toggles.map((t) => (
                    <Box key={t.label} label={t.label} on={allOn(script, t.rows)} onPress={() => set(script, t.rows, !allOn(script, t.rows))} />
                  ))}
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chart}>
                {rows.map((row) => {
                  const k = key({ script, row });
                  const isOpen = open.has(k);
                  const on = chosen.has(k);
                  const kana = KANA.filter((x) => x.script === script && x.row === row);
                  // A gap between the regular rows and the ゛ ones, as in a kana chart.
                  const gap = rowKind(row) === 'dakuten' && row === 'ga';
                  return (
                    <Pressable
                      key={row}
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`${row} row${isOpen ? '' : ', not open yet'}`}
                      disabled={!isOpen}
                      onPress={() => set(script, [row], !on)}
                      style={[styles.column, section.wide && styles.wide, gap && styles.gap, on && styles.columnOn, !isOpen && styles.locked]}>
                      <View style={[styles.check, on && styles.checkOn]}>
                        {on ? <CheckIcon color={colors.card} /> : !isOpen ? <LockIcon color={colors.muted} /> : null}
                      </View>
                      {section.slots.map((slot) => {
                        const k2 = kana.find((x) => slotOf(x) === slot);
                        return (
                          <View key={slot} style={styles.cell}>
                            <Text style={[styles.kana, section.wide && styles.kanaWide]}>{k2?.char ?? ''}</Text>
                            <Text style={styles.romaji}>{k2?.romaji[0] ?? ''}</Text>
                          </View>
                        );
                      })}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton label={kanaCount > 0 ? `Practise ${kanaCount} kana` : 'Tick some columns'} disabled={kanaCount === 0} onPress={start} />
      </View>
    </View>
  );
}

// A small checkbox with its label, for choosing a group of columns at once.
function Box({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable role="checkbox" aria-checked={on} onPress={onPress} style={styles.toggle} hitSlop={6}>
      <View style={[styles.smallCheck, on && styles.checkOn]}>{on && <CheckIcon color={colors.card} />}</View>
      <Text style={styles.toggleText}>{label}</Text>
    </Pressable>
  );
}

const COLUMN = 34;

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
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.sumi,
  },
  content: {
    gap: 14,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  intro: {
    paddingHorizontal: 6,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  section: {
    gap: 10,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  sectionHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  toggles: {
    flexDirection: 'row',
    gap: 12,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toggleText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  smallCheck: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.edge,
  },
  chart: {
    paddingHorizontal: 8,
  },
  column: {
    alignItems: 'center',
    width: COLUMN,
    paddingVertical: 4,
    borderRadius: 6,
  },
  wide: {
    width: COLUMN + 14,
  },
  gap: {
    marginLeft: 10,
  },
  columnOn: {
    backgroundColor: colors.paper,
  },
  locked: {
    opacity: 0.35,
  },
  check: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    marginBottom: 4,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.edge,
  },
  checkOn: {
    borderColor: colors.indigo,
    backgroundColor: colors.indigo,
  },
  cell: {
    alignItems: 'center',
    height: 44,
  },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 19,
    ...jpRoom(19),
    lineHeight: 26,
    color: colors.sumi,
  },
  kanaWide: {
    fontSize: 16,
  },
  romaji: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 10,
    color: colors.ink2,
  },
  footer: {
    paddingTop: 10,
    paddingHorizontal: 18,
  },
});
