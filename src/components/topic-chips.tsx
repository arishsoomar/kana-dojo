import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, jpRoom } from '@/constants/theme';
import { TOPICS } from '@/content/topics';
import { GENKI_LESSONS, genkiLesson, type NewWordsFrom } from '@/core/vocab';

type Props = {
  value: NewWordsFrom | null;
  onChange: (topic: NewWordsFrom | null) => void;
  allLabel: string; // the first chip, for no topic: "Any topic", "All words"
  counts?: (topic: NewWordsFrom) => number; // a number on each chip, like the words left in it
};

// Two rows of chips that scroll sideways. Topics: one for no topic, one for the words the
// grammar lessons use (文, "sentence"), then one per topic with its kanji. Under them, GENKI I's
// lessons, for following the textbook. The chosen one, in either row, is dark.
export function TopicChips({ value, onChange, allLabel, counts }: Props) {
  return (
    <View style={styles.rows} role="radiogroup">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Text style={styles.book}>GENKI I</Text>
        {LESSONS.map((lesson) => {
          const from = genkiLesson(lesson);
          const name = lesson === 0 ? 'Before L1' : `L${lesson}`;
          return (
            <Chip
              key={from}
              label={counts ? `${name} · ${counts(from)}` : name}
              chosen={value === from}
              onPress={() => onChange(from)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const LESSONS = Array.from({ length: GENKI_LESSONS + 1 }, (_, lesson) => lesson);

function Chip({ label, kanji, chosen, onPress }: { label: string; kanji?: string; chosen: boolean; onPress: () => void }) {
  return (
    <Pressable role="radio" aria-checked={chosen} aria-label={label} onPress={onPress} style={[styles.chip, chosen && styles.chosen]}>
      {kanji && <Text style={[styles.kanji, chosen && styles.chosenText]}>{kanji}</Text>}
      <Text style={[styles.label, chosen && styles.chosenText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 6,
  },
  book: {
    alignSelf: 'center',
    marginRight: 2,
    fontFamily: fonts.uiBlack,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.ink2,
  },
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
    ...jpRoom(15),
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
