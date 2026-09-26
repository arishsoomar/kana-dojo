import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import { useHaptics } from '@/hooks/use-haptics';
import { useSoundEffects } from '@/hooks/use-sound-effects';

import { BeltIcon } from './belt-icon';
import { AliveKarasu } from './alive-karasu';
import { Confetti } from './confetti';
import { PrimaryButton } from './primary-button';

type Props = {
  belt: Belt; // the belt just earned
  from: Belt; // the belt the row had before
  rowChar: string; // e.g. "か" for the ka row
  correct: number;
  total: number;
  nextRowChar: string | null; // set if passing opened the next row
  rank: Belt; // the learner's overall rank now, which sets Karasu's form
  fromRank: Belt; // the rank before this exam; Karasu starts in this form
  onDone: () => void;
};

// Native animation isn't available on web; there React Native animates in JavaScript instead.
const useNativeDriver = Platform.OS !== 'web';

const KARASU_SIZE = 160;
// The falling belt's picture, and where its band runs across it (as a share of its height).
const BELT_WIDTH = 150;
const BELT_HEIGHT = (BELT_WIDTH * 22) / 56;
const BELT_BAND = 8 / 22;

// Where Karasu's own belt sits in his picture, so the falling one lands on it: the middle of
// the band and its width, in points. The master's picture is wider, which moves it.
function waistOf(rank: Belt) {
  const [left, top, width, height] = rank === 'black' ? [-32, -4, 164, 122] : [-8, -4, 122, 122];
  const scale = KARASU_SIZE / width;
  return { x: (50 - left) * scale, y: (93 - top) * scale, width: 64 * scale, height: height * scale };
}

// How it plays out: the belt falls onto Karasu, wraps round him, he tugs the knot tight,
// and then the gong, the cheer and the words.
type Stage = 'falling' | 'tugging' | 'tied';

// The payoff for passing a belt exam. The new belt drops onto Karasu's waist and wraps round
// him, he pulls the knot tight, and the gong rings. It takes about two seconds.
export function BeltCeremony({ belt, from, rowChar, correct, total, nextRowChar, rank, fromRank, onDone }: Props) {
  const grew = rank !== fromRank;
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const haptics = useHaptics();
  const sounds = useSoundEffects();
  // Animated values are created once. (useState keeps them between renders without
  // reading a ref during render.)
  const [drop] = useState(() => new Animated.Value(0)); // 0 = above the screen, 1 = on his waist
  const [wrap] = useState(() => new Animated.Value(0)); // 1 = wrapped round him, out of sight
  const [reveal] = useState(() => new Animated.Value(0));
  const [played, setPlayed] = useState<Stage>('falling');
  // With Reduce Motion there's no animation: the belt is simply on.
  const stage: Stage = reduceMotion ? 'tied' : played;

  const tugged = useEffectEvent(() => haptics.thunk());
  const tied = useEffectEvent(() => sounds.play('gong'));

  useEffect(() => {
    if (reduceMotion) {
      tied();
      return;
    }
    const ceremony = Animated.sequence([
      Animated.delay(400),
      Animated.timing(drop, { toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver }),
      Animated.timing(wrap, { toValue: 1, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver }),
    ]);
    let timer: ReturnType<typeof setTimeout> | undefined;
    ceremony.start(({ finished }) => {
      if (!finished) return;
      setPlayed('tugging');
      tugged();
      timer = setTimeout(() => {
        setPlayed('tied');
        tied();
        Animated.timing(reveal, { toValue: 1, duration: 400, useNativeDriver }).start();
      }, 450);
    });
    return () => {
      ceremony.stop();
      clearTimeout(timer);
    };
  }, [drop, wrap, reveal, reduceMotion]);

  const beltName = `${belt.charAt(0).toUpperCase()}${belt.slice(1)} belt`;
  const waist = waistOf(fromRank);
  // It falls from well above him and shrinks to the width of his own belt as it lands.
  const fits = waist.width / BELT_WIDTH;
  const beltStyle = {
    left: waist.x - BELT_WIDTH / 2,
    top: waist.y - BELT_HEIGHT * BELT_BAND,
    transformOrigin: `50% ${BELT_BAND * 100}%`,
    opacity: drop.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
    transform: [
      { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-260, 0] }) },
      { scale: drop.interpolate({ inputRange: [0, 1], outputRange: [1, fits] }) },
      // Wrapping round: it narrows to nothing, as if going round behind him.
      { scaleX: wrap.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
    ],
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.stage}>
        <View style={styles.glow} />
        {/* Wrapped in a View so he's layered above the glow on web too, and so the belt can
            be placed on his waist. */}
        <View style={{ width: KARASU_SIZE, height: waist.height }}>
          {/* Once the belt wraps round he's wearing it and tugs it tight. When it's tied he
              cheers, and if his rank rose, he takes his new form. */}
          <AliveKarasu
            mood={stage === 'tied' ? 'proud' : 'focus'}
            rank={stage === 'tied' ? rank : fromRank}
            belt={stage === 'falling' ? from : belt}
            size={KARASU_SIZE}
            move={stage === 'tugging' ? { kind: 'tug', id: 1 } : stage === 'tied' ? { kind: 'cheer', id: 2 } : null}
          />
          {stage === 'falling' && (
            <Animated.View style={[styles.belt, beltStyle]} pointerEvents="none">
              <BeltIcon belt={belt} width={BELT_WIDTH} />
            </Animated.View>
          )}
        </View>

        <Animated.View style={[styles.words, { opacity: reduceMotion ? 1 : reveal }]}>
          <Text style={styles.title}>
            {beltName}, <Text style={styles.kana}>{rowChar}</Text> row
          </Text>
          <Text style={styles.line}>
            {correct} of {total}. Karasu ties the belt on. Your whole <Text style={styles.kana}>{rowChar}</Text> row is{' '}
            {belt} now
            {nextRowChar ? (
              <>
                , and the <Text style={styles.kana}>{nextRowChar}</Text> row is open.
              </>
            ) : (
              '.'
            )}
          </Text>
          {grew && <Text style={styles.grew}>Karasu has grown into a {rank} belt.</Text>}
          <View style={styles.chip}>
            <Text style={styles.chipText}>Plaque added</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Hang the plaque" tone="light" onPress={onDone} />
      </View>
      {stage === 'tied' && <Confetti />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.night,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // A soft vermilion glow behind Karasu.
  glow: {
    position: 'absolute',
    top: '12%',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: colors.vermilion,
    opacity: 0.18,
  },
  belt: {
    position: 'absolute',
  },
  words: {
    alignItems: 'center',
  },
  title: {
    marginTop: 26,
    fontFamily: fonts.uiBlack,
    fontSize: 27,
    textAlign: 'center',
    color: colors.card,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  line: {
    marginTop: 8,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.muted,
  },
  grew: {
    marginTop: 10,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    textAlign: 'center',
    color: colors.gold,
  },
  chip: {
    marginTop: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.nightRaised,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.card,
  },
  footer: {
    paddingHorizontal: 18,
  },
});
