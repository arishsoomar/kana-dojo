import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { Furigana } from '@/components/furigana';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { SpeakerIcon } from '@/components/speaker-icon';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { intervalLabel, type Rating } from '@/core/srs';
import { REGISTERS } from '@/content/registers';
import { WORD_FAMILIES, type WordFamily } from '@/content/word-families';
import { furiganaText, type VocabWord } from '@/core/vocab';
import { useRank } from '@/hooks/use-rank';
import { useTurnOver } from '@/hooks/use-turn-over';
import { lessonById } from '@/hooks/use-grammar';
import { useWordReview, type WordSessionMode } from '@/hooks/use-words';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

const RATINGS: readonly { rating: Rating; label: string; color: string }[] = [
  { rating: 1, label: 'Again', color: colors.vermilion },
  { rating: 2, label: 'Hard', color: colors.goldDark },
  { rating: 3, label: 'Good', color: colors.pine },
  { rating: 4, label: 'Easy', color: colors.indigo },
];

// Half a turn of the card: edge-on, then flat with the back up.
const HALF_TURN_MS = 120;

// Reviewing words: each shows its front; tap to turn it over, then rate how well you knew it.
export default function WordReviewScreen() {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  // Opened from a grammar lesson (its words not started yet), for more new words, or to practise.
  const { lesson, mode } = useLocalSearchParams<{ lesson?: string; mode?: string }>();
  const lessonWords = typeof lesson === 'string' ? lessonById(lesson)?.words : undefined;
  const [session] = useState<WordSessionMode>(() =>
    lessonWords ? { kind: 'lesson', words: lessonWords } : mode === 'more' ? { kind: 'more' } : mode === 'practice' ? { kind: 'practice' } : { kind: 'today' },
  );
  const review = useWordReview(session);
  const { word, flipped, intervals, result } = review;
  const [leaving, setLeaving] = useState(false);
  // The card turns over in 3D; `back` is whether its back is up at this moment.
  const { shown: back, style: turning } = useTurnOver(flipped, HALF_TURN_MS);

  function close() {
    review.leave();
    leave();
  }

  // Android's back button asks first, like the X. Once it's over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result || review.reviewed === 0) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result, review.reviewed]);

  if (result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={result.summary}
          onContinue={leave}
          title={session.kind === 'lesson' ? 'Ready for the lesson' : session.kind === 'practice' ? 'Practice done' : 'Done for today'}
          headline={{ label: 'Reviewed', value: String(result.reviewed) }}
          note={result.learned > 0 ? `${result.learned} new ${result.learned === 1 ? 'word' : 'words'} started` : undefined}
          rank={rank}
        />
      </View>
    );
  }

  if (!word) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.emptyTitle}>{session.kind === 'practice' ? 'Nothing to practise yet' : 'Nothing to review'}</Text>
        <Text style={styles.emptyText}>
          {session.kind === 'lesson'
            ? "You've started all of this lesson's words already."
            : session.kind === 'practice'
              ? 'Practice goes over words you studied today, or this week. Learn some words first.'
              : session.kind === 'more'
                ? "You've started every word in this list."
                : "Every word due today is done, and so are today's new ones. Come back tomorrow."}
        </Text>
        <PrimaryButton label="Back" onPress={leave} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable
          role="button"
          aria-label="Leave review"
          onPress={() => (review.reviewed > 0 ? setLeaving(true) : leave())}
          hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(review.reviewed / Math.max(review.reviewed + review.left, 1)) * 100}%` }]} />
        </View>
        <Text style={styles.left}>{review.left} left</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Pressable role="button" aria-label={back ? word.word : `${word.word}. Tap to turn over`} onPress={review.flip} disabled={flipped}>
          <Animated.View style={[styles.card, turning]}>
            {review.isNew && !back && <Text style={styles.badge}>New</Text>}
            <Furigana furigana={word.furigana} size={48} align="center" readings={back || review.frontReadings} />
            {back ? <Back word={word} onSpeak={review.speak} /> : <Text style={styles.hint}>Tap to see what it means</Text>}
          </Animated.View>
        </Pressable>
      </ScrollView>

      {/* Practice: just again or got it. It doesn't change when words come back. */}
      {review.flipped && review.practice && (
        <View style={[styles.ratings, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable role="button" onPress={() => review.rate(1)} style={[styles.rating, { backgroundColor: colors.vermilion }]}>
            <Text style={styles.ratingLabel}>Again</Text>
            <Text style={styles.ratingWhen}>see it again</Text>
          </Pressable>
          <Pressable role="button" onPress={() => review.rate(3)} style={[styles.rating, { backgroundColor: colors.pine }]}>
            <Text style={styles.ratingLabel}>Got it</Text>
            <Text style={styles.ratingWhen}>next word</Text>
          </Pressable>
        </View>
      )}
      {intervals && !review.practice && (
        <View style={[styles.ratings, { paddingBottom: insets.bottom + 12 }]}>
          {RATINGS.map(({ rating, label, color }) => (
            <Pressable
              key={rating}
              role="button"
              aria-label={`${label}: back in ${intervalLabel(intervals[rating])}`}
              onPress={() => review.rate(rating)}
              style={[styles.rating, { backgroundColor: color }]}>
              <Text style={styles.ratingLabel}>{label}</Text>
              <Text style={styles.ratingWhen}>{intervalLabel(intervals[rating])}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={close} title="Stop reviewing?" body={review.practice ? 'Practice never changes your schedule.' : "The words you've rated are saved."} />
    </View>
  );
}

// The back of the card: its reading (for words with kanji), meanings, and an example sentence.
function Back({ word, onSpeak }: { word: VocabWord; onSpeak: () => void }) {
  return (
    <View style={styles.back}>
      <Pressable role="button" aria-label={`Hear ${word.reading}`} onPress={onSpeak} style={styles.reading} hitSlop={8}>
        {word.reading !== word.word && <Text style={styles.readingText}>{word.reading}</Text>}
        <SpeakerIcon color={colors.ink2} size={20} />
      </Pressable>
      {(word.labels.length > 0 || word.note) && (
        <View style={styles.labels}>
          {word.labels.map((label) => (
            <Text key={label} style={styles.label} aria-label={REGISTERS[label]?.about}>
              {REGISTERS[label]?.name ?? label}
            </Text>
          ))}
          {word.note && <Text style={styles.note}>{word.note}</Text>}
        </View>
      )}
      <View style={styles.meanings}>
        {word.meanings.map((meaning, i) => (
          <Text key={i} style={[styles.meaning, i > 0 && styles.meaningMore]}>
            {word.meanings.length > 1 ? `${i + 1}. ` : ''}
            {meaning}
          </Text>
        ))}
      </View>
      {/* The example sentence: tap it (or its speaker) to hear it. */}
      {word.example && (
        <Pressable
          role="button"
          aria-label={`${furiganaText(word.example.ja)}: ${word.example.en}. Hear it`}
          onPress={() => word.example && speakWord(furiganaText(word.example.ja))}
          style={styles.example}>
          <View style={styles.exampleText}>
            <Furigana furigana={word.example.ja} size={19} />
            <Text style={styles.exampleEn}>{word.example.en}</Text>
          </View>
          <SpeakerIcon color={colors.muted} size={20} />
        </Pressable>
      )}
      {familiesOf(word).map((family) => (
        <Family key={family.id} family={family} word={word} />
      ))}
    </View>
  );
}

// A word family the word is in ("Ways to say 'mother'"): open it to see every word in it and
// when each is used, with this one picked out.
function Family({ family, word }: { family: WordFamily; word: VocabWord }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.family}>
      <Pressable role="button" aria-expanded={open} onPress={() => setOpen(!open)} style={styles.familyHead}>
        <Text style={styles.familyTitle}>{family.title}</Text>
        <Text style={styles.familyToggle}>{open ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {open && (
        <>
          <Text style={styles.exampleEn}>{family.about}</Text>
          {family.members.map((m) => {
            const self = m.word === word.word && m.reading === word.reading;
            return (
              <View key={m.word} style={[styles.member, self && styles.memberSelf]}>
                <Text style={styles.memberWord}>
                  {m.word}
                  {m.reading !== m.word && <Text style={styles.memberReading}>  {m.reading}</Text>}
                </Text>
                <Text style={styles.memberWhen}>{m.when}</Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

// The word families a word is in.
function familiesOf(word: VocabWord): WordFamily[] {
  return WORD_FAMILIES.filter((f) => f.members.some((m) => m.word === word.word && m.reading === word.reading));
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  empty: {
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    fontFamily: fonts.uiBlack,
    fontSize: 22,
    color: colors.sumi,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink2,
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
  left: {
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
  badge: {
    position: 'absolute',
    top: 12,
    left: 14,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: fonts.uiExtraBold,
    fontSize: 11,
    color: colors.indigoDark,
    backgroundColor: colors.indigoLight,
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
  },
  reading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingText: {
    fontFamily: fonts.jp,
    fontSize: 20,
    color: colors.ink2,
  },
  meanings: {
    alignSelf: 'stretch',
    gap: 4,
  },
  meaning: {
    textAlign: 'center',
    fontFamily: fonts.uiExtraBold,
    fontSize: 19,
    color: colors.sumi,
  },
  meaningMore: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  example: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.indigoDark,
    backgroundColor: colors.indigoLight,
  },
  note: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.ink2,
  },
  family: {
    alignSelf: 'stretch',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  familyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  familyTitle: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  familyToggle: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  member: {
    gap: 2,
    padding: 8,
    borderRadius: 8,
  },
  memberSelf: {
    backgroundColor: colors.goldLight,
  },
  memberWord: {
    fontFamily: fonts.jp,
    fontSize: 17,
    color: colors.sumi,
  },
  memberReading: {
    fontFamily: fonts.jp,
    fontSize: 12,
    color: colors.ink2,
  },
  memberWhen: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink2,
  },
  exampleText: {
    flex: 1,
    gap: 6,
  },
  exampleEn: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  ratings: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  rating: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ratingLabel: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.card,
  },
  ratingWhen: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.card,
  },
});
