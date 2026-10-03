import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { TopicChips } from '@/components/topic-chips';
import { colors, fonts, jpRoom } from '@/constants/theme';
import { VOCAB } from '@/content/vocab';
import type { WordCard } from '@/core/srs';
import type { NewWordsFrom, VocabWord } from '@/core/vocab';
import { useProgress } from '@/hooks/use-progress';
import { wordsFrom } from '@/hooks/use-words';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

// Known: remembered for three weeks or more at a time.
const KNOWN_DAYS = 21;

type Status = 'new' | 'learning' | 'known';

function statusOf(card: WordCard | undefined): Status {
  if (!card) return 'new';
  return card.stability >= KNOWN_DAYS ? 'known' : 'learning';
}

const STATUS_COLORS: Readonly<Record<Status, string>> = { new: colors.line, learning: colors.gold, known: colors.pine };

// The whole word deck, most frequent first, to browse and search: by the word, its reading,
// or its meaning. Each shows whether it's new, being learned, or known.
export default function WordsScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState<NewWordsFrom | null>(null);

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    const ids = topic ? new Set(wordsFrom(topic)) : null;
    const inTopic = ids ? VOCAB.filter((w) => ids.has(String(w.id))) : VOCAB;
    if (!query) return inTopic;
    return inTopic.filter((w) => w.word.includes(query) || w.reading.includes(query) || w.meanings.some((m) => m.toLowerCase().includes(query)));
  }, [search, topic]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>The word deck</Text>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search: 食べる, たべる or eat"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          aria-label="Search the deck"
          style={styles.search}
        />
        <TopicChips value={topic} onChange={setTopic} allLabel="All words" />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(w) => String(w.id)}
        renderItem={({ item, index }) => (
          <Row word={item} number={search || topic ? null : index + 1} status={statusOf(progress.words[String(item.id)])} />
        )}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={<Text style={styles.none}>No words match.</Text>}
        initialNumToRender={20}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

function Row({ word, number, status }: { word: VocabWord; number: number | null; status: Status }) {
  return (
    <View style={styles.row} aria-label={`${word.word}, ${word.reading}: ${word.meanings[0]}. ${status}`}>
      {number !== null && <Text style={styles.number}>{number}</Text>}
      <View style={styles.grow}>
        <Text style={styles.word}>
          {word.word}
          {word.reading !== word.word && <Text style={styles.reading}>  {word.reading}</Text>}
        </Text>
        <Text style={styles.meaning} numberOfLines={1}>
          {word.meanings[0]}
        </Text>
      </View>
      <View style={[styles.status, { backgroundColor: STATUS_COLORS[status] }]} />
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
  searchRow: {
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  search: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: colors.sumi,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  number: {
    width: 36,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  grow: {
    flex: 1,
  },
  word: {
    fontFamily: fonts.jp,
    fontSize: 19,
    ...jpRoom(19),
    color: colors.sumi,
  },
  reading: {
    fontFamily: fonts.jp,
    fontSize: 13,
    ...jpRoom(13),
    color: colors.ink2,
  },
  meaning: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
  status: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  none: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.muted,
  },
});
