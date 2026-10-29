import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlipCard } from '@/components/flip-card';
import { PrimaryButton } from '@/components/primary-button';
import { RoundDone } from '@/components/round-done';
import { Pile, riseFromPile, SwipeCard, type SwipeCardHandle } from '@/components/swipe-card';
import { WordCardFace } from '@/components/word-card';
import { XIcon } from '@/components/x-icon';
import { MNEMONIC_PICTURES, type MnemonicPicture } from '@/constants/mnemonic-pictures';
import { colors, fonts } from '@/constants/theme';
import { mnemonicFor, type WordMnemonic } from '@/content/mnemonics';
import { useBenchAutopilot } from '@/dev/use-bench-autopilot';
import type { WordFront } from '@/core/answers';
import type { VocabWord } from '@/core/vocab';
import { knownCards } from '@/core/flashcards';
import { useHaptics } from '@/hooks/use-haptics';
import { useProgress } from '@/hooks/use-progress';
import { whenQuiet } from '@/hooks/quiet-time';
import { deckById, useDecks, useFlashcards, type Deck } from '@/hooks/use-words';

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
  const haptics = useHaptics();
  // The buttons send the card off the way a swipe would.
  const card = useRef<SwipeCardHandle>(null);
  const { setFront } = useDecks();
  // The next card, drawn under this one once nothing's moving, so it comes up with both sides
  // ready: no drawing in the middle of its first turn. It's kept out of sight (the plain pile
  // shows) until this card starts to go, or it would show through as this one turns edge-on.
  const [nextDrawnFor, setNextDrawnFor] = useState(-1);
  const [revealedFor, setRevealedFor] = useState(-1);
  useEffect(() => {
    // Not on the end-of-round screen, so a new round starts with just its first card.
    if (cards.over) return;
    return whenQuiet(300, () => setNextDrawnFor(cards.answered));
  }, [cards.answered, cards.over]);
  const drawNext = nextDrawnFor === cards.answered && cards.nextId !== null && cards.nextWord !== null;

  // Back to the top for each card, as the last one goes, so the next is seen whole.
  const scroll = useRef<ScrollView>(null);
  function leaving() {
    setRevealedFor(cards.answered);
    scroll.current?.scrollTo({ y: 0, animated: true });
  }
  useLayoutEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [cards.answered]);

  useBenchAutopilot({ cardsLeft: cards.total, setEnglishFront: () => setFront('english'), fling: (know) => card.current?.fling(know) });

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
          <ScrollView ref={scroll} contentContainerStyle={styles.body}>
            {/* The rest of the round, as a pile under this card: the next card itself once it's
                drawn. Each card keeps its key from the pile to the top (the answer count it'll
                be shown at), so it comes up as it is, not drawn again. And each has its own edge
                of the pile peeking out under it, its own size: going, a card takes its edge with
                it, so a long card (turned over, with its memory tip) doesn't leave a long pile. */}
            <View>
              {drawNext && cards.nextWord && (
                <CardSlot key={cards.answered + 1} behind hidden={revealedFor !== cards.answered} pile={cards.at + 2 < cards.total} pileHidden={false}>
                  <SwipeCard onSwipe={cards.answer} active={false}>
                    <FlashCard
                      word={cards.nextWord}
                      mnemonic={mnemonicFor(cards.nextId)}
                      mnemonicPicture={cards.nextId ? MNEMONIC_PICTURES[cards.nextId] : undefined}
                      front={cards.front}
                      flipped={false}
                      onFlip={() => {}}
                      onSpeak={() => {}}
                      active={false}
                    />
                  </SwipeCard>
                </CardSlot>
              )}
              <CardSlot key={cards.answered} behind={false} hidden={false} pile={cards.nextId !== null} pileHidden={revealedFor === cards.answered}>
                <SwipeCard ref={card} onSwipe={cards.answer} onThreshold={haptics.tick} onLeave={leaving}>
                  <FlashCard
                    word={cards.word}
                    mnemonic={mnemonicFor(cards.id)}
                    mnemonicPicture={cards.id ? MNEMONIC_PICTURES[cards.id] : undefined}
                    front={cards.front}
                    flipped={cards.flipped}
                    onFlip={cards.flip}
                    onSpeak={cards.speak}
                  />
                </SwipeCard>
              </CardSlot>
            </View>
          </ScrollView>
          {/* Swipe the card, or tap: left if you're still learning it, right if you know it. */}
          <View style={[styles.answers, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable role="button" aria-label="Still learning" onPress={() => card.current?.fling(false)} style={[styles.answer, styles.learning]}>
              <Text style={styles.answerLabel}>← Still learning</Text>
            </Pressable>
            <Pressable role="button" aria-label="Know it" onPress={() => card.current?.fling(true)} style={[styles.answer, styles.know]}>
              <Text style={styles.answerLabel}>Know it →</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// Where a card sits: on top, or under it in the pile (a little smaller and lower, out of reach,
// and out of sight until the card on top starts to go). One drawn in the pile slides up when its
// turn comes; one that wasn't (the cards went by too fast) rises into place as it's drawn. With
// `pile`, the edge of the pile peeks out under it, sized to it.
function CardSlot({
  behind,
  hidden,
  pile,
  pileHidden,
  children,
}: {
  behind: boolean;
  hidden: boolean;
  pile: boolean;
  pileHidden: boolean;
  children: ReactNode;
}) {
  const lift = useSharedValue(behind ? 1 : 0);
  useEffect(() => {
    lift.set(withTiming(behind ? 1 : 0, { duration: 200 }));
  }, [behind, lift]);
  const placed = useAnimatedStyle(() => ({ transform: [{ translateY: lift.get() * 10 }, { scale: 1 - lift.get() * 0.05 }] }));
  return (
    <Animated.View
      entering={behind ? undefined : riseFromPile}
      style={[behind && styles.behind, hidden && styles.hidden, placed]}
      pointerEvents={behind ? 'none' : 'auto'}
      aria-hidden={behind}>
      {pile && !pileHidden && <Pile />}
      {children}
    </Animated.View>
  );
}

// One card: tap to turn it over, and back again. Both sides are drawn from the start (see
// FlipCard), so turning it is only ever an animation.
function FlashCard({
  word,
  mnemonic,
  mnemonicPicture,
  front,
  flipped,
  onFlip,
  onSpeak,
  active = true,
}: {
  word: VocabWord;
  mnemonic: WordMnemonic | null;
  mnemonicPicture: MnemonicPicture | undefined;
  front: WordFront;
  flipped: boolean;
  onFlip: () => void;
  onSpeak: () => void;
  active?: boolean; // on top, rather than waiting in the pile
}) {
  const shownFront = front === 'english' ? word.meanings[0] : word.word;
  return (
    <FlipCard
      flipped={flipped}
      onTap={onFlip}
      label={`${flipped ? word.word : shownFront}. Tap to turn over`}
      faceStyle={styles.card}
      active={active}
      front={<WordCardFace word={word} front={front} back={false} onSpeak={onSpeak} />}
      back={<WordCardFace word={word} mnemonic={mnemonic} mnemonicPicture={mnemonicPicture} front={front} back onSpeak={onSpeak} />}
    />
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
  // A card waiting in the pile, under the one on top, at its own height (not stretched to a
  // long card's on top, which it would show as it's revealed).
  behind: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  hidden: {
    opacity: 0,
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
