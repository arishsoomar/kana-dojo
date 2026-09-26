import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, BackHandler, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { kanaFit } from '@/components/kana-fit';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PlaqueIcon } from '@/components/plaque-icon';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { colors, fonts, memoryColors } from '@/constants/theme';
import { fewestMoves, MEMORY_PAIRS, memoryKana, memoryReady, type MemoryCard, type MemoryMode } from '@/core/memory';
import { useMemory } from '@/hooks/use-memory';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

const useNativeDriver = Platform.OS !== 'web';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// "0:48", from seconds.
function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

// What each mode pairs, with an example.
const MODES: readonly { mode: MemoryMode; name: string; example: string; about: string }[] = [
  { mode: 'hiragana', name: 'Hiragana', example: 'あ ↔ a', about: 'Match each hiragana with its romaji' },
  { mode: 'katakana', name: 'Katakana', example: 'ア ↔ a', about: 'Match each katakana with its romaji' },
  { mode: 'both', name: 'Both', example: 'あ ↔ ア', about: 'Match each hiragana with its katakana' },
];

// Memory match: choose what to pair, then find all eight pairs. Each new game gets a new key,
// so "Deal again" shuffles a fresh board.
export default function MemoryScreen() {
  const [mode, setMode] = useState<MemoryMode | null>(null);
  const [gameNumber, setGameNumber] = useState(0);
  if (!mode) return <ChooseMode onDeal={setMode} />;
  return <Board key={gameNumber} mode={mode} onAgain={() => setGameNumber((n) => n + 1)} onOtherMode={() => setMode(null)} />;
}

function ChooseMode({ onDeal }: { onDeal: (mode: MemoryMode) => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [choice, setChoice] = useState<MemoryMode>(progress.settings.script);

  return (
    <View style={[styles.table, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave memory match" onPress={leave} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
      </View>
      <View style={styles.choose}>
        <Text style={styles.title}>Memory match</Text>
        <Text style={styles.sub}>Turn over two cards at a time and find the pairs.</Text>
        <View style={styles.modes} role="radiogroup">
          {MODES.map(({ mode, name, example, about }) => {
            const ready = memoryReady(progress, mode);
            const known = memoryKana(progress, mode).length;
            const best = fewestMoves(progress, mode);
            return (
              <Pressable
                key={mode}
                role="radio"
                aria-checked={choice === mode}
                onPress={() => setChoice(mode)}
                style={[styles.mode, choice === mode && styles.modeChosen]}>
                <View style={styles.modeText}>
                  <Text style={styles.modeName}>
                    {name} <Text style={styles.modeExample}>{example}</Text>
                  </Text>
                  <Text style={styles.modeAbout}>{about}</Text>
                  <Text style={styles.modeInfo}>
                    {ready
                      ? `${known} kana to play with${best !== null ? ` · Best: ${best} moves` : ''}`
                      : mode === 'both'
                        ? `Learn ${MEMORY_PAIRS} kana in both scripts to play`
                        : `Learn ${MEMORY_PAIRS} kana to play`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Deal the cards" disabled={!memoryReady(progress, choice)} onPress={() => onDeal(choice)} />
      </View>
    </View>
  );
}

type BoardProps = { mode: MemoryMode; onAgain: () => void; onOtherMode: () => void };

function Board({ mode, onAgain, onOtherMode }: BoardProps) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const memory = useMemory(mode);
  const { game, result } = memory;
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X. Once the game is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (result) {
    const best = result.best === null || result.moves < result.best;
    return (
      <View style={[styles.paper, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={result.summary}
          onContinue={leave}
          title="All pairs found"
          headline={{ label: 'Moves', value: String(result.moves) }}
          note={`${clock(result.seconds)}${best ? ' · Your best yet!' : ` · Best: ${result.best} moves`}`}
          secondary={{ label: 'Deal again', onPress: onAgain }}
          rank={rank}
          celebrate={best}
        />
        <Pressable role="button" onPress={onOtherMode} style={styles.otherMode}>
          <Text style={styles.otherModeText}>Play another mode</Text>
        </Pressable>
      </View>
    );
  }

  const subtitle = MODES.find((m) => m.mode === mode)?.about ?? '';

  return (
    <View style={[styles.table, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave memory match" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.pairs}>
          {game.found.length} of {MEMORY_PAIRS} pairs
        </Text>
        <View style={styles.clock}>
          <Text style={styles.clockText}>{clock(memory.seconds)}</Text>
        </View>
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>Match the pairs</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>

      <View style={styles.grid}>
        {game.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            state={game.found.includes(card.pair) ? 'found' : game.up.includes(card.id) ? 'up' : 'down'}
            onPress={() => memory.flip(card.id)}
          />
        ))}
      </View>

      <View style={styles.coach}>
        <AliveKarasu mood={memory.said.startsWith('Not') ? 'focus' : 'proud'} rank={rank} size={74} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{memory.said}</Text>
        </View>
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
}

type CardState = 'down' | 'up' | 'found';

// One card. Face down it shows the dojo's plaque; turned up, its kana or romaji; once its pair
// is found, it stays showing, faded. It turns over with a quick flip.
function Card({ card, state, onPress }: { card: MemoryCard; state: CardState; onPress: () => void }) {
  const reduceMotion = useReducedMotion();
  const [turn] = useState(() => new Animated.Value(1));
  const showing = state !== 'down';

  useEffect(() => {
    if (reduceMotion) return;
    turn.setValue(0);
    const flip = Animated.timing(turn, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver });
    flip.start();
    return () => flip.stop();
  }, [showing, turn, reduceMotion]);

  const isKana = card.face === card.kana.char;
  return (
    <Animated.View style={[styles.cardSlot, { transform: [{ scaleX: turn }] }]}>
      <Pressable
        role="button"
        aria-label={showing ? `Card ${card.face}` : 'Face-down card'}
        disabled={state === 'found'}
        onPress={onPress}
        style={[styles.card, styles[state]]}>
        {showing ? (
          <Text
            style={[
              styles.face,
              isKana && styles.kana,
              isKana && { fontSize: 24 * kanaFit(card.face, 0.7) },
              state === 'found' && styles.foundText,
            ]}>
            {card.face}
          </Text>
        ) : (
          <PlaqueIcon color={memoryColors.backMark} lines={colors.sumi} size={28} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  table: {
    flex: 1,
    backgroundColor: memoryColors.table,
  },
  paper: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 18,
  },
  pairs: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  clock: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  clockText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.sumi,
  },
  choose: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
  },
  heading: {
    gap: 2,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  sub: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: colors.ink2,
  },
  modes: {
    gap: 10,
    marginTop: 16,
  },
  mode: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  modeChosen: {
    borderWidth: 2,
    padding: 13.5,
    borderColor: colors.sumi,
  },
  modeText: {
    flex: 1,
    gap: 2,
  },
  modeName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  modeExample: {
    fontFamily: fonts.jp,
    fontSize: 15,
    color: colors.ink2,
  },
  modeAbout: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
  modeInfo: {
    marginTop: 2,
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
    paddingHorizontal: 18,
  },
  // Four to a row: a quarter of the width, less the gaps.
  cardSlot: {
    width: '22.6%',
    flexGrow: 1,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 8,
  },
  down: {
    backgroundColor: colors.sumi,
  },
  up: {
    borderWidth: 2,
    borderColor: colors.vermilion,
    backgroundColor: colors.card,
  },
  found: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: memoryColors.foundEdge,
  },
  face: {
    fontFamily: fonts.uiBold,
    fontSize: 22,
    color: colors.sumi,
  },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 24,
  },
  foundText: {
    color: memoryColors.foundText,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
    paddingHorizontal: 18,
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
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: colors.sumi,
  },
  otherMode: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },
  otherModeText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
  },
});
