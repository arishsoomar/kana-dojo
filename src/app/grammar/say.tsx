import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Furigana } from '@/components/furigana';
import { RoundDone } from '@/components/round-done';
import { SpeakerIcon } from '@/components/speaker-icon';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { parseRuby, type GrammarLesson } from '@/core/grammar';
import { lessonById, useSayCards, type SaySentence } from '@/hooks/use-grammar';
import { useTurnOver } from '@/hooks/use-turn-over';

// Half a turn of the card: edge-on, then flat with the other side up.
const HALF_TURN_MS = 120;

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

// Saying a grammar lesson's sentences: the English in front, the Japanese behind.
export default function SayScreen() {
  const { id, shuffle, only } = useLocalSearchParams<{ id?: string; shuffle?: string; only?: string }>();
  const lesson = typeof id === 'string' ? lessonById(id) : null;
  if (!lesson) {
    leave();
    return null;
  }
  return <Say lesson={lesson} onlyLearning={only === 'learning'} shuffled={shuffle === '1'} />;
}

function Say({ lesson, onlyLearning, shuffled }: { lesson: GrammarLesson; onlyLearning: boolean; shuffled: boolean }) {
  const insets = useSafeAreaInsets();
  const cards = useSayCards(lesson, onlyLearning, shuffled);
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

      {cards.over || !cards.sentence ? (
        <RoundDone
          known={cards.known}
          learning={cards.learning}
          note={`${lesson.title}: ${cards.lessonKnown} of ${cards.lessonTotal} sentences known`}
          onAgain={cards.again}
          onDone={close}
          bottom={insets.bottom}
        />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.body}>
            {/* A new card each answer, so the next sentence never shows its back while turning. */}
            <SayCardView key={cards.answered} sentence={cards.sentence} flipped={cards.flipped} onFlip={cards.flip} onSpeak={cards.speak} />
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

// One sentence: the English, then turned over, the Japanese with its romaji, a speaker, the
// grammar point, and a note on any catch.
function SayCardView({ sentence, flipped, onFlip, onSpeak }: { sentence: SaySentence; flipped: boolean; onFlip: () => void; onSpeak: () => void }) {
  const { shown: back, style: turning } = useTurnOver(flipped, HALF_TURN_MS);
  return (
    <Pressable role="button" aria-label={`${back ? sentence.romaji : sentence.en}. Tap to turn over`} onPress={onFlip}>
      <Animated.View style={[styles.card, turning]}>
        <Text style={styles.point}>{sentence.point}</Text>
        {back ? (
          <View style={styles.back}>
            <Furigana furigana={parseRuby(sentence.ja)} size={28} align="center" />
            <Pressable role="button" aria-label="Hear it" onPress={onSpeak} style={styles.said} hitSlop={8}>
              <Text style={styles.romaji}>{sentence.romaji}</Text>
              <SpeakerIcon color={colors.ink2} size={20} />
            </Pressable>
            <Text style={styles.enSmall}>{sentence.en}</Text>
            {sentence.note && <Text style={styles.note}>{sentence.note}</Text>}
          </View>
        ) : (
          <>
            <Text style={styles.en}>{sentence.en}</Text>
            <Text style={styles.hint}>Say it in Japanese, then tap to check</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
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
    gap: 18,
    minHeight: 300,
    paddingTop: 22,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  point: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.indigoDark,
    backgroundColor: colors.indigoLight,
  },
  en: {
    marginTop: 30,
    textAlign: 'center',
    fontFamily: fonts.uiExtraBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.sumi,
  },
  hint: {
    marginTop: 'auto',
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.muted,
  },
  back: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
  },
  said: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  romaji: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: fonts.uiBold,
    fontSize: 17,
    color: colors.ink2,
  },
  enSmall: {
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: colors.muted,
  },
  note: {
    alignSelf: 'stretch',
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
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
});
