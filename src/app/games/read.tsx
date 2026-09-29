import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { CheckIcon } from '@/components/check-icon';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { PLACES } from '@/content/signs';
import { colors, fonts } from '@/constants/theme';
import {
  PARTICLE_NOTES,
  phraseParticles,
  phraseRomaji,
  phraseText,
  signRomaji,
  type Phrase,
  type PlaceId,
  type ReadingSet,
  type Sign,
} from '@/core/reading';
import { useReadingRound, type ReadingQuestion } from '@/hooks/use-reading';
import { useRank } from '@/hooks/use-rank';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games/reading');
}

const SETS: readonly ReadingSet[] = ['station', 'cafe', 'shop', 'street', 'phrases'];

function isSet(value: unknown): value is ReadingSet {
  return typeof value === 'string' && (SETS as readonly string[]).includes(value);
}

// How each place's signs look: the station's blue boards, the café's chalkboard menu, the
// shop's white labels, and the street's red signs.
const SIGN_LOOKS: Readonly<Record<PlaceId, { backgroundColor: string; borderColor: string; color: string }>> = {
  station: { backgroundColor: colors.indigoDark, borderColor: colors.indigoDark, color: colors.card },
  cafe: { backgroundColor: colors.sumi, borderColor: colors.woodDark, color: colors.card },
  shop: { backgroundColor: colors.card, borderColor: colors.vermilion, color: colors.sumi },
  street: { backgroundColor: colors.vermilion, borderColor: colors.vermilionDark, color: colors.card },
};

// A round in the reading room: find the sign that says something, or say what a phrase means.
export default function ReadScreen() {
  const { set } = useLocalSearchParams<{ set: string }>();
  if (!isSet(set)) {
    return <Empty text="There's nothing to read here." />;
  }
  return <Round set={set} />;
}

function Empty({ text }: { text: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, styles.empty, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <Text style={styles.emptyText}>{text}</Text>
      <PrimaryButton label="Back" onPress={leave} />
    </View>
  );
}

function Round({ set }: { set: ReadingSet }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const round = useReadingRound(set);
  const { current, picked, correct, result } = round;
  const [leaving, setLeaving] = useState(false);
  const place = set === 'phrases' ? null : set;
  const placeName = PLACES.find((p) => p.id === place)?.name ?? null;

  // Android's back button asks first, like the X. Once the round is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (!round.ready) return <Empty text="This part of the reading room isn't open yet. Meet more kana on the Learn wall." />;

  if (result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={result.summary}
          onContinue={leave}
          title="Round complete"
          headline={{ label: 'Read', value: `${result.right}/${result.total}` }}
          secondary={{ label: 'Another round', onPress: () => router.replace({ pathname: '/games/read', params: { set } }) }}
          rank={rank}
          celebrate={result.right === result.total}
        />
      </View>
    );
  }
  if (!current) return null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable role="button" aria-label="Leave round" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${round.fraction * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.coach}>
          <AliveKarasu mood={picked ? (correct ? 'proud' : 'stern') : 'focus'} rank={rank} size={54} move={round.reaction} />
          <Prompt question={current} placeName={placeName} />
        </View>

        {current.kind === 'sign' && place ? (
          <View style={styles.signs}>
            {current.question.options.map((sign) => (
              <SignTile
                key={sign.text}
                sign={sign}
                place={place}
                state={tileState(sign, current.question.answer, picked)}
                onPress={() => round.pick(sign)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.meanings}>
            {current.question.options.map((phrase) => (
              <MeaningButton
                key={phrase.text}
                phrase={phrase}
                state={tileState(phrase, current.question.answer, picked)}
                onPress={() => round.pick(phrase)}
              />
            ))}
          </View>
        )}

        {picked && (
          <>
            <Answer question={current} picked={picked} correct={correct} />
            <PrimaryButton label="Continue" tone={correct ? 'pine' : 'sumi'} onPress={round.next} />
          </>
        )}
      </ScrollView>
      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
}

// What to find, or what to read.
function Prompt({ question, placeName }: { question: ReadingQuestion; placeName: string | null }) {
  if (question.kind === 'sign') {
    return (
      <View style={styles.prompt}>
        <Text style={styles.promptLabel}>{placeName ? `${placeName}. Find:` : 'Find:'}</Text>
        <Text style={styles.promptMeaning}>{question.question.answer.meaning}</Text>
      </View>
    );
  }
  return (
    <View style={styles.prompt}>
      <Text style={styles.promptLabel}>What does this mean?</Text>
      <Text style={styles.promptPhrase}>{phraseText(question.question.answer)}</Text>
    </View>
  );
}

type TileState = 'waiting' | 'right' | 'wrong' | 'other';

// Before answering, every option is waiting. After, the right one is marked right, a wrong
// pick wrong, and the rest fade.
function tileState<T>(option: T, answer: T, picked: T | null): TileState {
  if (picked === null) return 'waiting';
  if (option === answer) return 'right';
  return option === picked ? 'wrong' : 'other';
}

function SignTile({ sign, place, state, onPress }: { sign: Sign; place: PlaceId; state: TileState; onPress: () => void }) {
  const look = SIGN_LOOKS[place];
  return (
    <Pressable
      role="button"
      aria-label={state === 'waiting' ? sign.text : `${sign.text}, ${sign.meaning}`}
      disabled={state !== 'waiting'}
      onPress={onPress}
      style={[
        styles.sign,
        { backgroundColor: look.backgroundColor, borderColor: look.borderColor },
        state === 'right' && styles.signRight,
        state === 'wrong' && styles.signWrong,
        state === 'other' && styles.faded,
      ]}>
      <Text style={[styles.signText, { color: look.color, fontSize: signFontSize(sign.text) }]} numberOfLines={1}>
        {sign.text}
      </Text>
      {state === 'right' && (
        <View style={styles.tick}>
          <CheckIcon color={colors.card} />
        </View>
      )}
    </Pressable>
  );
}

function MeaningButton({ phrase, state, onPress }: { phrase: Phrase; state: TileState; onPress: () => void }) {
  return (
    <Pressable
      role="button"
      disabled={state !== 'waiting'}
      onPress={onPress}
      style={[styles.meaning, state === 'right' && styles.meaningRight, state === 'wrong' && styles.meaningWrong, state === 'other' && styles.faded]}>
      <Text style={styles.meaningText}>{phrase.meaning}</Text>
    </Pressable>
  );
}

// After answering: how the right one reads, what the wrong pick was, and for a phrase, its
// particles picked out with a note on each.
function Answer({ question, picked, correct }: { question: ReadingQuestion; picked: Sign | Phrase; correct: boolean }) {
  if (question.kind === 'sign') {
    const { answer } = question.question;
    return (
      <View style={[styles.answer, correct ? styles.answerRight : styles.answerWrong]}>
        <Text style={styles.answerTitle}>{correct ? 'Right!' : 'Not quite.'}</Text>
        <Text style={styles.answerLine}>
          <Text style={styles.kana}>{answer.text}</Text> · {signRomaji(answer.text)} · {answer.meaning}
        </Text>
        {!correct && (
          <Text style={styles.answerSoft}>
            You tapped <Text style={styles.kana}>{picked.text}</Text> · {signRomaji(picked.text)} · {picked.meaning}
          </Text>
        )}
      </View>
    );
  }
  const phrase = question.question.answer;
  return (
    <View style={[styles.answer, correct ? styles.answerRight : styles.answerWrong]}>
      <Text style={styles.answerTitle}>{correct ? 'Right!' : 'Not quite.'}</Text>
      <Text style={styles.answerLine}>
        {phraseRomaji(phrase).map((piece, i) => (
          <Text key={i} style={piece.particle && styles.particle}>
            {piece.text}
          </Text>
        ))}
      </Text>
      <Text style={styles.answerLine}>{phrase.meaning}</Text>
      {!correct && <Text style={styles.answerSoft}>You chose &ldquo;{picked.meaning}&rdquo;</Text>}
      {phraseParticles(phrase).map((p) => (
        <Text key={p} style={styles.note}>
          {PARTICLE_NOTES[p]}
        </Text>
      ))}
    </View>
  );
}

// A sign fits its text on one line: long ones like ちゅうしゃじょう get smaller type.
function signFontSize(text: string): number {
  return Math.min(30, Math.floor(126 / [...text].length));
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  empty: {
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.uiBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.sumi,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    backgroundColor: colors.pine,
  },
  body: {
    gap: 14,
    paddingHorizontal: 18,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prompt: {
    flex: 1,
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  promptLabel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  promptMeaning: {
    fontFamily: fonts.uiBlack,
    fontSize: 26,
    color: colors.sumi,
  },
  promptPhrase: {
    fontFamily: fonts.jp,
    fontSize: 28,
    lineHeight: 38,
    color: colors.sumi,
  },
  signs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // A sign: two to a row, big enough to read at a glance.
  sign: {
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 92,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 3,
  },
  signRight: {
    borderColor: colors.pine,
    borderWidth: 5,
  },
  signWrong: {
    borderColor: colors.vermilionDark,
    borderWidth: 5,
    opacity: 0.75,
  },
  faded: {
    opacity: 0.35,
  },
  signText: {
    fontFamily: fonts.jp,
  },
  tick: {
    position: 'absolute',
    top: -9,
    right: -9,
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.paper,
    backgroundColor: colors.pine,
  },
  meanings: {
    gap: 10,
  },
  meaning: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  meaningRight: {
    borderWidth: 2.5,
    borderColor: colors.pine,
    backgroundColor: colors.pineLight,
  },
  meaningWrong: {
    borderWidth: 2.5,
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  meaningText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.sumi,
  },
  answer: {
    gap: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  answerRight: {
    borderColor: colors.pine,
    backgroundColor: colors.pineLight,
  },
  answerWrong: {
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  answerTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  answerLine: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.sumi,
  },
  answerSoft: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  // A particle in the romaji, read differently from its kana: picked out in vermilion.
  particle: {
    fontFamily: fonts.uiBlack,
    color: colors.vermilionDark,
  },
  note: {
    marginTop: 4,
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink2,
  },
});
