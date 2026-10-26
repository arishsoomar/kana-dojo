import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { RoundDone } from '@/components/round-done';
import { WordCardFace } from '@/components/word-card';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import type { WordFront } from '@/core/answers';
import type { VocabWord } from '@/core/vocab';
import { knownCards } from '@/core/flashcards';
import { useProgress } from '@/hooks/use-progress';
import { useTurnOver } from '@/hooks/use-turn-over';
import { deckById, useFlashcards, type Deck } from '@/hooks/use-words';

// Half a turn of the card: edge-on, then flat with the other side up.
const HALF_TURN_MS = 120;

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

// Flashcards for a deck (a GENKI lesson's, or numbers), shuffled or in order.
export default function FlashcardsScreen() {
  const { deck: deckId, shuffle, only } = useLocalSearchParams<{ deck?: string; shuffle?: string; only?: string }>();
  const { progress } = useProgress();
  const deck = typeof deckId === 'string' ? deckById(deckId) : null;
  // Just the cards still being learned, if asked (and there are any).
  const known = deck ? new Set(knownCards(progress, deck.ids)) : new Set<string>();
  const learning = deck && only === 'learning' ? deck.ids.filter((id) => !known.has(id)) : [];
  if (!deck || deck.ids.length === 0) {
    return <Missing />;
  }
  return <Flashcards deck={deck} only={learning.length > 0 ? learning : null} shuffled={shuffle === '1'} />;
}

function Flashcards({ deck, only, shuffled }: { deck: Deck; only: readonly string[] | null; shuffled: boolean }) {
  const insets = useSafeAreaInsets();
  const cards = useFlashcards(deck, only, shuffled);
  const { finish } = cards;

  function close() {
    finish();
    leave();
  }

  // Android's back button keeps the session too.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      finish();
      return false;
    });
    return () => subscription.remove();
  }, [finish]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable role="button" aria-label="Stop" onPress={close} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(cards.at / Math.max(cards.total, 1)) * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {Math.min(cards.at + 1, cards.total)} / {cards.total}
        </Text>
      </View>

      {cards.over || !cards.word ? (
        <RoundDone
          known={cards.known}
          learning={cards.learning}
          note={`${deck.title}: ${cards.deckKnown} of ${deck.ids.length} known`}
          onAgain={cards.again}
          onDone={close}
          bottom={insets.bottom}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.body}>
            {/* A new card each answer, so the next word never shows its back while turning. */}
            <FlashCard key={cards.answered} word={cards.word} front={cards.front} flipped={cards.flipped} onFlip={cards.flip} onSpeak={cards.speak} />
          </ScrollView>
          <View style={[styles.answers, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable role="button" onPress={() => cards.answer(false)} style={[styles.answer, styles.learning]}>
              <Text style={styles.answerLabel}>Still learning</Text>
            </Pressable>
            <Pressable role="button" onPress={() => cards.answer(true)} style={[styles.answer, styles.know]}>
              <Text style={styles.answerLabel}>Know it</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// One card: tap to turn it over, and back again.
function FlashCard({
  word,
  front,
  flipped,
  onFlip,
  onSpeak,
}: {
  word: VocabWord;
  front: WordFront;
  flipped: boolean;
  onFlip: () => void;
  onSpeak: () => void;
}) {
  const { shown: back, style: turning } = useTurnOver(flipped, HALF_TURN_MS);
  const shownFront = front === 'english' ? word.meanings[0] : word.word;
  return (
    <Pressable role="button" aria-label={`${back ? word.word : shownFront}. Tap to turn over`} onPress={onFlip}>
      <Animated.View style={[styles.card, turning]}>
        <WordCardFace word={word} front={front} back={back} onSpeak={onSpeak} />
      </Animated.View>
    </Pressable>
  );
}

function Missing() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, styles.done, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <Text style={styles.doneTitle}>No cards here</Text>
      <PrimaryButton label="Back" onPress={leave} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  track: {
    flex: 1,
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.indigo,
  },
  count: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  card: {
    alignItems: 'center',
    gap: 16,
    minHeight: 300,
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  answers: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  answer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  learning: {
    backgroundColor: colors.vermilion,
  },
  know: {
    backgroundColor: colors.pine,
  },
  answerLabel: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.card,
  },
  done: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 24,
  },
  doneTitle: {
    textAlign: 'center',
    fontFamily: fonts.uiBlack,
    fontSize: 26,
    color: colors.sumi,
  },
});
