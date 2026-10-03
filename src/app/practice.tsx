import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts } from '@/constants/theme';
import { KANA, rowKind, type RowId, type Script } from '@/core/kana';
import { practicePool, practiceRows, type RowPick } from '@/core/practice';
import { useProgress } from '@/hooks/use-progress';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

const SCRIPTS: readonly { script: Script; name: string }[] = [
  { script: 'hiragana', name: 'Hiragana' },
  { script: 'katakana', name: 'Katakana' },
];

const key = (p: RowPick) => `${p.script}:${p.row}`;

// The row's kana, as its label: かきくけこ.
function rowKana(script: Script, row: RowId): string {
  return KANA.filter((k) => k.script === script && k.row === row)
    .map((k) => k.char)
    .join('');
}

// Free practice: choose rows from either script, or both, and practise them for as long as
// you like. Only rows the Learn wall has opened can be chosen.
export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const open = SCRIPTS.map(({ script, name }) => ({ script, name, rows: practiceRows(progress, script) }));
  const everything = open.flatMap(({ script, rows }) => rows.map((row) => key({ script, row })));
  // Everything open, to start with.
  const [chosen, setChosen] = useState<ReadonlySet<string>>(() => new Set(everything));

  const picks: RowPick[] = open.flatMap(({ script, rows }) => rows.filter((row) => chosen.has(key({ script, row }))).map((row) => ({ script, row })));
  const kanaCount = practicePool(progress, picks).length;

  function toggle(pick: RowPick) {
    const next = new Set(chosen);
    if (next.has(key(pick))) next.delete(key(pick));
    else next.add(key(pick));
    setChosen(next);
  }

  // Choose all of a script's rows (or just those of one kind), or none of them.
  function setScript(script: Script, rows: readonly RowId[], on: boolean) {
    const next = new Set(chosen);
    for (const row of rows) {
      if (on) next.add(key({ script, row }));
      else next.delete(key({ script, row }));
    }
    setChosen(next);
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

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 }]}>
        <Text style={styles.intro}>
          Choose the rows to practise. Questions keep coming until you stop, with no exam. Right answers still move each kana
          toward its next belt.
        </Text>

        {open.map(({ script, name, rows }) => {
          const all = rows.every((row) => chosen.has(key({ script, row })));
          return (
            <View key={script} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>{name}</Text>
                <Pressable role="button" onPress={() => setScript(script, rows, !all)} hitSlop={8}>
                  <Text style={styles.action}>{all ? 'None' : 'All'}</Text>
                </Pressable>
              </View>
              <View style={styles.rows}>
                {rows.map((row) => {
                  const on = chosen.has(key({ script, row }));
                  return (
                    <Pressable
                      key={row}
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`${name} ${row} row`}
                      onPress={() => toggle({ script, row })}
                      style={[styles.row, on && styles.rowOn, rowKind(row) !== 'basic' && styles.rowExtra]}>
                      <Text style={[styles.rowKana, on && styles.rowKanaOn]}>{rowKana(script, row)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {rows.length === 1 && (
                <Text style={styles.note}>More rows open here as you learn them on the Learn wall.</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton label={kanaCount > 0 ? `Practise ${kanaCount} kana` : 'Choose some rows'} disabled={kanaCount === 0} onPress={start} />
      </View>
    </View>
  );
}

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
    paddingHorizontal: 18,
  },
  intro: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  section: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  action: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  rows: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  row: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  // Rows past the basic ones (゛, ゜, yōon, extended) are drawn a little apart.
  rowExtra: {
    borderStyle: 'dashed',
  },
  rowOn: {
    borderStyle: 'solid',
    borderColor: colors.sumi,
    backgroundColor: colors.sumi,
  },
  rowKana: {
    fontFamily: fonts.jp,
    fontSize: 16,
    color: colors.sumi,
  },
  rowKanaOn: {
    color: colors.card,
  },
  note: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  footer: {
    paddingTop: 10,
    paddingHorizontal: 18,
  },
});
