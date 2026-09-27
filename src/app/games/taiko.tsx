import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, BackHandler, Easing, Platform, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { CharmIcon } from '@/components/charm-icon';
import { DrumIcon } from '@/components/drum-icon';
import { kanaFit } from '@/components/kana-fit';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { colors, dungeonColors, fonts, taikoColors } from '@/constants/theme';
import { bestScore } from '@/core/answers';
import type { Script } from '@/core/kana';
import { BEAT_MS, nextNote, SONG_NAME, TAIKO_NOTES, taikoId, type Judgement } from '@/core/taiko';
import { unlockedKana } from '@/core/unlock';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useTaiko } from '@/hooks/use-taiko';

const useNativeDriver = Platform.OS !== 'web';

// How many beats ahead a note appears at the top of the track.
const TRAVEL_BEATS = 3;
const TAG = 52; // the next note's tag; later ones are smaller
const RING = 76;

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// Whether a script's drill is open: from the mock, once its た row is.
function taikoOpen(progress: ReturnType<typeof useProgress>['progress'], script: Script): boolean {
  return unlockedKana(progress, script).some((k) => k.row === 'ta');
}

// The Taiko drill: choose a script, then hit each kana's sound as it reaches the ring, to the
// beat of "Tanuki matsuri". Each play gets a new key, so "Play again" starts fresh.
export default function TaikoScreen() {
  const [script, setScript] = useState<Script | null>(null);
  const [playNumber, setPlayNumber] = useState(0);
  if (!script) return <Entrance onStart={setScript} />;
  return <Drill key={playNumber} script={script} onAgain={() => setPlayNumber((n) => n + 1)} />;
}

function Entrance({ onStart }: { onStart: (script: Script) => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [choice, setChoice] = useState<Script>(progress.settings.script);

  return (
    <View style={[styles.night, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.topRow}>
        <Pressable role="button" aria-label="Leave the taiko drill" onPress={leave} hitSlop={10}>
          <XIcon color={dungeonColors.soft} />
        </Pressable>
      </View>
      <View style={styles.entrance}>
        <DrumIcon size={96} />
        <Text style={styles.title}>Taiko drill</Text>
        <Text style={styles.soft}>
          Kana ride down the track to the beat of {SONG_NAME}. Hit each one&apos;s sound as it reaches the ring.
        </Text>
        <View style={styles.scriptChoices} role="radiogroup">
          {(['hiragana', 'katakana'] as const).map((script) => {
            const open = taikoOpen(progress, script);
            const best = bestScore(progress, taikoId(script));
            return (
              <Pressable
                key={script}
                role="radio"
                aria-checked={choice === script}
                onPress={() => setChoice(script)}
                style={[styles.scriptCard, choice === script && styles.scriptCardChosen]}>
                <Text style={styles.scriptName}>{script === 'hiragana' ? 'Hiragana' : 'Katakana'}</Text>
                <Text style={styles.scriptKana}>{script === 'hiragana' ? 'ひらがな' : 'カタカナ'}</Text>
                <Text style={styles.scriptInfo}>
                  {open ? (best !== null ? `Best: ${best.toLocaleString('en-US')}` : 'Ready') : `Opens at the ${script === 'hiragana' ? 'た' : 'タ'} row`}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Start the drum" tone="light" disabled={!taikoOpen(progress, choice)} onPress={() => onStart(choice)} />
      </View>
    </View>
  );
}

function Drill({ script, onAgain }: { script: Script; onAgain: () => void }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const taiko = useTaiko(script);
  const { game, time, last, result } = taiko;
  const [height, setHeight] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X. Once the song is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (result) {
    // A best only counts with something hit.
    const best = result.score > 0 && (result.best === null || result.score > result.best);
    return (
      <View style={[styles.paper, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={result.summary}
          onContinue={leave}
          title={SONG_NAME}
          headline={{ label: 'Score', value: result.score.toLocaleString('en-US') }}
          note={`${result.hits} of ${TAIKO_NOTES} hit · best combo ${result.bestCombo}${best ? ' · Your best yet!' : ''}`}
          secondary={{ label: 'Play again', onPress: onAgain }}
          rank={rank}
          celebrate={best}
        />
      </View>
    );
  }

  function onLayout(event: LayoutChangeEvent) {
    setHeight(event.nativeEvent.layout.height);
  }

  // The ring sits near the bottom of the track; a note moves from the top to it over TRAVEL_BEATS.
  const ringY = height - RING / 2 - 16;
  const perMs = ringY / (TRAVEL_BEATS * BEAT_MS);
  const next = nextNote(game);
  // Beat lines, one per beat, moving down with the notes.
  const firstBeat = Math.floor(time / BEAT_MS);
  const beatLines = Array.from({ length: TRAVEL_BEATS + 2 }, (_, i) => ringY - ((firstBeat + i) * BEAT_MS - time) * perMs).filter(
    (y) => y > 0 && y < height,
  );

  return (
    <View style={[styles.night, { paddingTop: insets.top }]}>
      <View style={styles.stats}>
        <Pressable role="button" aria-label="Leave the taiko drill" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={dungeonColors.soft} />
        </Pressable>
        <View style={styles.songChip}>
          <DrumIcon size={16} />
          <Text style={styles.songText}>{SONG_NAME}</Text>
        </View>
        <Text style={styles.score}>{game.score.toLocaleString('en-US')}</Text>
        {game.combo > 1 && (
          <View style={styles.comboChip}>
            <Text style={styles.comboText}>x{game.combo}</Text>
          </View>
        )}
      </View>

      <View style={styles.stage} onLayout={onLayout}>
        <View style={styles.track}>
          {beatLines.map((y) => (
            <View key={Math.round(y)} style={[styles.beatLine, { top: y }]} />
          ))}
        </View>
        <View style={[styles.lantern, styles.lanternLeft]}>
          <CharmIcon charm="lantern" size={28} />
        </View>
        <View style={[styles.lantern, styles.lanternRight]}>
          <CharmIcon charm="lantern" size={28} />
        </View>

        {/* The ring, where each note is hit. */}
        {height > 0 && <View style={[styles.ring, { top: ringY - RING / 2 }]} />}

        {/* Notes on their way down: the next one full size, the rest smaller and fainter. */}
        {height > 0 &&
          game.notes
            .filter((n) => n.result === null && n.at - time <= TRAVEL_BEATS * BEAT_MS)
            .map((note) => {
              const isNext = note === next;
              const size = isNext ? TAG : 40;
              const y = ringY - (note.at - time) * perMs;
              return (
                <View
                  key={note.id}
                  style={[styles.tag, { width: size, height: size, top: y - size / 2, marginLeft: -size / 2 }, isNext ? styles.tagNext : styles.tagLater]}>
                  <Text style={[styles.tagKana, { fontSize: (isNext ? 24 : 18) * kanaFit(note.kana.char, 0.68) }]}>{note.kana.char}</Text>
                </View>
              );
            })}

        {last && <JudgementPop key={last.id} judgement={last.judgement} top={ringY - 40} />}
        <View style={[styles.karasu, { top: ringY - 50 }]}>
          <AliveKarasu mood={last?.judgement === 'miss' ? 'focus' : 'cheer'} rank={rank} size={66} move={last && last.judgement !== 'miss' ? { kind: 'hop', id: last.id } : null} />
        </View>
      </View>

      {/* The next note's three sounds. */}
      <View style={[styles.buttons, { paddingBottom: insets.bottom + 18 }]}>
        {(next?.choices ?? []).map((choice, i) => (
          <Pressable
            key={choice.char}
            role="button"
            aria-label={`Hit ${choice.romaji[0]}`}
            onPress={() => taiko.tap(choice)}
            style={[styles.button, { backgroundColor: BUTTON_COLORS[i] }]}>
            <Text style={styles.buttonText}>{choice.romaji[0]}</Text>
          </Pressable>
        ))}
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
}

// The buttons keep their colours by place, as in the mock. The notes stay neutral, so the
// colour never gives the answer away.
const BUTTON_COLORS = [colors.vermilion, taikoColors.ring, colors.pine] as const;

const JUDGEMENT_TEXT: Readonly<Record<Judgement, string>> = { perfect: 'Perfect', good: 'Good', ok: 'OK', miss: 'Miss' };

// "Perfect", "Good", "OK" or "Miss", popping up beside the ring.
function JudgementPop({ judgement, top }: { judgement: Judgement; top: number }) {
  const reduceMotion = useReducedMotion();
  const [pop] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  useEffect(() => {
    if (reduceMotion) return;
    const show = Animated.sequence([
      Animated.timing(pop, { toValue: 1, duration: 120, easing: Easing.out(Easing.back(2)), useNativeDriver }),
      Animated.delay(350),
      Animated.timing(pop, { toValue: 0, duration: 200, useNativeDriver }),
    ]);
    show.start();
    return () => show.stop();
  }, [pop, reduceMotion]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.judgement,
        judgement === 'miss' ? styles.judgementMiss : judgement === 'perfect' ? styles.judgementPerfect : null,
        { top, opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] },
      ]}>
      {JUDGEMENT_TEXT[judgement]}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  night: {
    flex: 1,
    backgroundColor: colors.night,
  },
  paper: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  topRow: {
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  entrance: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 6,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.card,
  },
  soft: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: dungeonColors.soft,
  },
  scriptChoices: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  scriptCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: dungeonColors.edge,
    backgroundColor: dungeonColors.card,
  },
  scriptCardChosen: {
    borderColor: colors.gold,
  },
  scriptName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.card,
  },
  scriptKana: {
    marginBottom: 4,
    fontFamily: fonts.jp,
    fontSize: 15,
    color: dungeonColors.soft,
  },
  scriptInfo: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    textAlign: 'center',
    color: dungeonColors.cardText,
  },
  footer: {
    paddingHorizontal: 18,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 18,
  },
  songChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: dungeonColors.tile,
  },
  songText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.gold,
  },
  score: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.uiBlack,
    fontSize: 18,
    color: colors.card,
  },
  comboChip: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: colors.vermilion,
  },
  comboText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.card,
  },
  stage: {
    flex: 1,
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    left: 74,
    right: 74,
    top: 0,
    bottom: 0,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: taikoColors.trackEdge,
    backgroundColor: taikoColors.track,
  },
  beatLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderTopColor: taikoColors.beatLine,
  },
  lantern: {
    position: 'absolute',
    top: 10,
  },
  lanternLeft: {
    left: 14,
  },
  lanternRight: {
    right: 14,
  },
  ring: {
    position: 'absolute',
    left: '50%',
    width: RING,
    height: RING,
    marginLeft: -RING / 2,
    borderRadius: RING / 2,
    borderWidth: 3,
    borderColor: taikoColors.ring,
    // A soft glow around the ring, like the mock's.
    shadowColor: taikoColors.ring,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  tag: {
    position: 'absolute',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: taikoColors.tag,
  },
  tagNext: {
    borderColor: taikoColors.ring,
  },
  tagLater: {
    borderColor: dungeonColors.edge,
    opacity: 0.7,
  },
  tagKana: {
    fontFamily: fonts.jp,
    color: colors.sumi,
  },
  judgement: {
    position: 'absolute',
    right: 10,
    fontFamily: fonts.uiBlack,
    fontSize: 18,
    color: colors.card,
  },
  judgementPerfect: {
    color: colors.gold,
  },
  judgementMiss: {
    color: dungeonColors.soft,
  },
  karasu: {
    position: 'absolute',
    left: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 18,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.card,
  },
});
