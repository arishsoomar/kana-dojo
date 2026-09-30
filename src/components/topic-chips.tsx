import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { TOPICS } from '@/content/topics';
import type { NewWordsFrom } from '@/core/vocab';

type Props = {
  value: NewWordsFrom | null;
  onChange: (topic: NewWordsFrom | null) => void;
  allLabel: string; // the first chip, for no topic: "Any topic", "All words"
  counts?: (topic: NewWordsFrom) => number; // a number on each chip, like the words left in it
};

// A row of topic chips that scrolls sideways: one for no topic, one for the words the grammar
// lessons use (文, "sentence"), then one per topic with its kanji. The chosen one is dark.
export function TopicChips({ value, onChange, allLabel, counts }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} role="radiogroup">
      <Chip label={allLabel} chosen={value === null} onPress={() => onChange(null)} />
      <Chip
        kanji="文"
        label={counts ? `For grammar · ${counts('grammar')}` : 'For grammar'}
        chosen={value === 'grammar'}
        onPress={() => onChange('grammar')}
      />
      {TOPICS.map((t) => (
        <Chip
          key={t.id}
          kanji={t.kanji}
          label={counts ? `${t.name} · ${counts(t.id)}` : t.name}
          chosen={value === t.id}
          onPress={() => onChange(t.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ label, kanji, chosen, onPress }: { label: string; kanji?: string; chosen: boolean; onPress: () => void }) {
  return (
    <Pressable role="radio" aria-checked={chosen} aria-label={label} onPress={onPress} style={[styles.chip, chosen && styles.chosen]}>
      {kanji && <Text style={[styles.kanji, chosen && styles.chosenText]}>{kanji}</Text>}
      <Text style={[styles.label, chosen && styles.chosenText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  chosen: {
    borderColor: colors.sumi,
    backgroundColor: colors.sumi,
  },
  kanji: {
    fontFamily: fonts.jp,
    fontSize: 15,
    color: colors.vermilion,
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.sumi,
  },
  chosenText: {
    color: colors.card,
  },
});
