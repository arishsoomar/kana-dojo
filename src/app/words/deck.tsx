import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { BackIcon } from '@/components/back-icon';
import { CheckIcon } from '@/components/check-icon';
import { Furigana } from '@/components/furigana';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { SpeakerIcon } from '@/components/speaker-icon';
import { WordPicture } from '@/components/word-card';
import { colors, fonts } from '@/constants/theme';
import { knownCards } from '@/core/flashcards';
import { useProgress } from '@/hooks/use-progress';
import { deckById, useDecks, wordById } from '@/hooks/use-words';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

const FRONTS = [
  { value: 'japanese', label: 'Japanese' },
  { value: 'english', label: 'English' },
] as const;

const ORDERS = [
  { value: 'order', label: 'In order' },
  { value: 'shuffled', label: 'Shuffled' },
] as const;

// A deck: study its flashcards (all of them, or just the ones still being learned), choose the
// card front and the order, and see every word in it, with its picture, meaning and sound.
export default function DeckScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const deck = typeof id === 'string' ? deckById(id) : null;
  const { progress } = useProgress();
  const { front, setFront } = useDecks();
  const [order, setOrder] = useState<(typeof ORDERS)[number]['value']>('order');

  if (!deck) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <PrimaryButton label="Back" onPress={goBack} />
      </View>
    );
  }
  const known = new Set(knownCards(progress, deck.ids));
  const learning = deck.ids.length - known.size;
  const study = (only: boolean) =>
    router.push({
      pathname: '/words/flashcards',
      params: { deck: deck.id, shuffle: order === 'shuffled' ? '1' : '0', ...(only ? { only: 'learning' } : {}) },
    });

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.titles}>
          <Text style={styles.name}>{deck.name}</Text>
          <Text style={styles.title}>{deck.title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          <Text style={styles.knownText}>
            {known.size} of {deck.ids.length} known
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(known.size / deck.ids.length) * 100}%` }]} />
          </View>
          <PrimaryButton label={`Study all ${deck.ids.length}`} onPress={() => study(false)} />
          {known.size > 0 && learning > 0 && <PrimaryButton label={`Study the ${learning} still learning`} tone="light" onPress={() => study(true)} />}
        </View>

        <View style={styles.card}>
          <Text style={styles.optionTitle}>Card front</Text>
          <SegmentedControl options={FRONTS} value={front} onChange={setFront} />
          <Text style={styles.optionAbout}>
            {front === 'japanese' ? 'Read the Japanese, and say what it means.' : 'See the English and picture, say it in Japanese, then hear it.'}
          </Text>
          <Text style={[styles.optionTitle, styles.optionGap]}>Order</Text>
          <SegmentedControl options={ORDERS} value={order} onChange={setOrder} />
        </View>

        <Text style={styles.listTitle}>{deck.ids.length} words</Text>
        <View style={styles.list}>
          {deck.ids.map((wordId) => {
            const word = wordById(wordId);
            if (!word) return null;
            return (
              // Tap a word to hear it.
              <Pressable
                key={wordId}
                role="button"
                aria-label={`${word.word}: ${word.meanings[0]}. Hear it`}
                onPress={() => speakWord(word.reading)}
                style={styles.row}>
                <View style={styles.rowPicture}>
                  <WordPicture word={word} size={36} />
                </View>
                <View style={styles.rowText}>
                  <Furigana furigana={word.furigana} size={20} />
                  <Text style={styles.meaning} numberOfLines={2}>
                    {word.meanings[0]}
                  </Text>
                </View>
                {known.has(wordId) && (
                  <View style={styles.knownMark} aria-label="Known">
                    <CheckIcon color={colors.card} />
                  </View>
                )}
                <SpeakerIcon color={colors.muted} size={18} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  titles: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  title: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 20,
    color: colors.sumi,
  },
  content: {
    gap: 14,
    paddingHorizontal: 18,
  },
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  knownText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  track: {
    height: 10,
    marginBottom: 4,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.pine,
  },
  optionTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  optionGap: {
    marginTop: 6,
  },
  optionAbout: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
  listTitle: {
    marginTop: 6,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  list: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowPicture: {
    alignItems: 'center',
    width: 40,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  meaning: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  knownMark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.pine,
  },
});
