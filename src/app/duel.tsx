import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BulbIcon } from '@/components/bulb-icon';
import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { KanaFrame } from '@/components/kana-frame';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { Yokai } from '@/components/yokai';
import { colors, duelColors, fonts } from '@/constants/theme';
import { DUEL_LOSS, DUEL_WIN } from '@/core/duel';
import type { Kana } from '@/core/kana';
import { pairById, type NamedPair } from '@/core/pairs';
import { useDuel } from '@/hooks/use-duel';
import { useRank } from '@/hooks/use-rank';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// `/duel?pair=シツ` duels that named pair.
export default function DuelScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ pair?: string }>();
  const pair = params.pair ? pairById(params.pair) : null;

  if (!pair) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.emptyText}>{"There's no duel here."}</Text>
        <PrimaryButton label="Back" onPress={close} />
      </View>
    );
  }
  return <Duel pair={pair} />;
}

function Duel({ pair }: { pair: NamedPair }) {
  const insets = useSafeAreaInsets();
  const duel = useDuel(pair);
  const rank = useRank();
  const [leaving, setLeaving] = useState(false);
  const { score, result } = duel;

  // Android's back button asks first, like the X. Once the duel is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (result) {
    const won = result.status === 'won';
    return (
      <View style={[styles.results, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          title={won ? 'Duel won' : 'Not this time'}
          headline={{ label: 'Score', value: `${result.score.mine}–${result.score.theirs}` }}
          note={won ? `Scroll earned: ${pair.name}.` : `Get to ${DUEL_WIN} before they get ${DUEL_LOSS}. Try again right away.`}
          summary={result.summary}
          secondary={{ label: 'Retry', onPress: duel.retry }}
          onContinue={close}
          rank={rank}
          celebrate={won}
        />
      </View>
    );
  }

  const missesLeft = DUEL_LOSS - 1 - score.theirs;
  const [first, second] = duel.question.choices;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave duel" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={duelColors.soft} />
        </Pressable>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Duel</Text>
        </View>
        <Text style={styles.points}>
          Point {score.mine} of {DUEL_WIN}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{pair.name}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(score.mine / DUEL_WIN) * 100}%` }]} />
        </View>
        <Text style={styles.soft}>
          {missesLeft} {missesLeft === 1 ? 'miss' : 'misses'} left
        </Text>

        {/* The middle grows to fill the screen, so the answers sit at the bottom, near the thumb. */}
        <View style={styles.middle}>
          {/* The pair's two yokai, facing you down. */}
          <View style={styles.twins} aria-hidden>
            <View style={styles.twinLeft}>
              <Yokai char={first?.char ?? ''} size={126} hue="red" />
            </View>
            <View style={styles.twinRight}>
              <Yokai char={second?.char ?? ''} size={126} hue="red" />
            </View>
          </View>
          <KanaFrame char={duel.question.kana.char} size={112} />
        </View>

        <View style={styles.choices}>
          {duel.question.choices.map((choice) => (
            <ChoiceTile
              key={choice.char}
              label={choice.romaji[0]}
              state={tileState(choice, duel.question.kana, duel.miss)}
              disabled={duel.miss !== null}
              onPress={() => duel.answer(choice)}
            />
          ))}
        </View>
        <Text style={[styles.soft, styles.slow]}>{duel.slow ? 'Right, but too slow for a point.' : ' '}</Text>

        <View style={styles.tip}>
          <BulbIcon size={18} />
          <Text style={styles.tipText}>{pair.tip}</Text>
        </View>
        <Text style={[styles.soft, styles.footer]}>
          {`You've mixed these up ${duel.mixUps} ${duel.mixUps === 1 ? 'time' : 'times'}. Win ${DUEL_WIN} points to settle it.`}
        </Text>
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={close} />
    </View>
  );
}

// While a miss is showing: red on the wrong pick, and the right answer marked.
function tileState(choice: Kana, answer: Kana, miss: Kana | null): TileState {
  if (!miss) return 'idle';
  if (choice === miss) return 'wrong';
  if (choice === answer) return 'missed';
  return 'idle';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: duelColors.background,
  },
  results: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.paper,
  },
  emptyText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    textAlign: 'center',
    color: colors.sumi,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: colors.vermilion,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.card,
  },
  points: {
    marginLeft: 'auto',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: duelColors.soft,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  name: {
    marginBottom: 6,
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.card,
  },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: duelColors.track,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.vermilion,
  },
  soft: {
    marginTop: 6,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: duelColors.soft,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  twins: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  twinLeft: {
    marginRight: -24,
    transform: [{ rotate: '-6deg' }],
  },
  twinRight: {
    transform: [{ rotate: '6deg' }],
  },
  choices: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  slow: {
    textAlign: 'center',
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: duelColors.panel,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.card,
  },
  footer: {
    marginTop: 10,
  },
});
