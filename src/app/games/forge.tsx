import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { AliveKarasu } from '@/components/alive-karasu';
import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { FeedbackCard, FeedbackSheet, type Correction } from '@/components/feedback-sheet';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { LessonTopBar } from '@/components/lesson-top-bar';
import { PrimaryButton } from '@/components/primary-button';
import { SpeakerIcon } from '@/components/speaker-icon';
import { TypeAnswer } from '@/components/type-answer';
import { WordFrame } from '@/components/word-frame';
import { colors, fonts } from '@/constants/theme';
import { WORD_PICTURES } from '@/constants/word-pictures';
import { FORGE_MIN_WORDS, readyWords, wordRomaji, type ForgeOption } from '@/core/forge';
import { missDetails, useForge, type ForgeMiss } from '@/hooks/use-forge';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// Word Forge: read real words made of kana you've met. Opens once there are enough of them.
export default function ForgeScreen() {
  const { progress } = useProgress();
  // Checked once, when the screen opens; a round keeps its words even as more become ready.
  const [enough] = useState(() => readyWords(progress, progress.settings.script).length >= FORGE_MIN_WORDS);
  const insets = useSafeAreaInsets();

  if (!enough) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.emptyText}>
          Word Forge opens once you&apos;ve met the kana for {FORGE_MIN_WORDS} words. Keep going on the Learn wall.
        </Text>
        <PrimaryButton label="Back" onPress={leave} />
      </View>
    );
  }
  return <Forge />;
}

function Forge() {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const forge = useForge();
  const { word, options, miss, heard, result } = forge;
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X. Once the round is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={result.summary}
          onContinue={leave}
          title="Round complete"
          headline={{ label: 'Words', value: `${result.right}/${result.total}` }}
          secondary={{ label: 'Another round', onPress: () => router.replace('/games/forge') }}
          rank={rank}
          celebrate={result.right === result.total}
        />
      </View>
    );
  }
  if (!word) return null;

  // Tapping shows the correction in a sheet at the bottom; typing shows it in place of the word.
  const sheet = miss !== null && !forge.typing;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}>
      <LessonTopBar
        fraction={forge.fraction}
        onClose={() => setLeaving(true)}
        sound={forge.sound}
        onToggleSound={forge.toggleSound}
        typing={forge.typing}
        onToggleTyping={forge.toggleTyping}
      />

      <View style={styles.body}>
        <View style={styles.coach}>
          <AliveKarasu mood={miss ? 'stern' : heard ? 'proud' : 'focus'} rank={rank} move={forge.reaction} />
          {/* Before the first answer, what to do. After it, the word just read, its romaji and
              meaning, and a button to hear it again. */}
          {heard ? (
            <Pressable
              role="button"
              aria-label={`Hear ${heard.word.text} again`}
              onPress={() => speakWord(heard.word.text)}
              style={[styles.bubble, styles.heard]}>
              <Text style={styles.bubbleText} numberOfLines={2}>
                <Text style={styles.kana}>{heard.word.text}</Text> · {wordRomaji(heard.units)} · {heard.word.meaning}
              </Text>
              <SpeakerIcon color={colors.ink2} size={20} />
            </Pressable>
          ) : (
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>Read this word.</Text>
            </View>
          )}
        </View>

        <View style={styles.frame}>
          {forge.typing && miss ? (
            <FeedbackCard
              correction={correctionFor(miss)}
              picture={
                <View style={styles.cardPicture}>
                  <Image source={WORD_PICTURES[miss.word.word.picture]} style={styles.cardImage} />
                  <Text style={styles.cardWord}>{miss.word.word.text}</Text>
                </View>
              }
            />
          ) : (
            <WordFrame text={word.word.text} picture={WORD_PICTURES[word.word.picture]} meaning={word.word.meaning} />
          )}
        </View>

        {forge.typing ? (
          <TypeAnswer
            questionKey={forge.questionKey}
            wrong={miss !== null}
            onSubmit={forge.type}
            onContinue={forge.goToNext}
            checksItself={false}
            placeholder="Type the word"
          />
        ) : (
          <View style={styles.choices}>
            {options.map((option) => (
              <ChoiceTile
                key={option.romaji}
                label={option.romaji}
                state={tileState(option, miss)}
                disabled={miss !== null}
                onPress={() => forge.pick(option)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={[sheet && styles.sheetArea, { paddingBottom: insets.bottom + (sheet ? 22 : 12) }]}>
        {sheet && <FeedbackSheet correction={correctionFor(miss)} onContinue={forge.goToNext} />}
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </KeyboardAvoidingView>
  );
}

// What a misread word's correction says: the word's romaji, what was picked or typed, which
// kana was misread, and a tip for it.
function correctionFor(miss: ForgeMiss): Correction {
  const { romaji, tip, misread } = missDetails(miss);
  const given = miss.picked ? `You picked ${miss.picked.romaji}.` : `You typed "${miss.typed ?? ''}".`;
  return { title: `That's ${romaji}`, detail: misread ? `${given} ${misread}` : given, tip };
}

function tileState(option: ForgeOption, miss: ForgeMiss | null): TileState {
  if (!miss) return 'idle';
  if (option === miss.picked) return 'wrong';
  if (option.misread === null) return 'missed';
  return 'idle';
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
  body: {
    flex: 1,
    paddingHorizontal: 18,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  bubble: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  bubbleText: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: colors.sumi,
  },
  heard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  frame: {
    flex: 1,
  },
  cardPicture: {
    alignItems: 'center',
  },
  cardImage: {
    width: 56,
    height: 56,
  },
  cardWord: {
    fontFamily: fonts.jp,
    fontSize: 34,
    color: colors.sumi,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginBottom: 12,
  },
  sheetArea: {
    backgroundColor: colors.card,
  },
});
