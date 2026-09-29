import { useEffect, useState } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Belt } from '@/core/boxes';

import { Karasu, type KarasuMood } from './karasu';

export type KarasuMove = 'hop' | 'shake' | 'cheer' | 'tug';

type Props = {
  mood: KarasuMood;
  size?: number;
  rank: Belt;
  belt?: Belt;
  // A one-off move to play. A new `id` plays it again, even when it's the same move.
  move?: { kind: KarasuMove; id: number } | null;
  gear?: readonly string[]; // left out, he wears the learner's own (a friend's dojo passes theirs)
};

// How often he blinks (a random wait in this range, so it doesn't look mechanical), and for how long.
const BLINK_EVERY_MS = [2500, 5000] as const;
const BLINK_MS = 130;
// One slow breath, in and out.
const BREATH_MS = 1600;

// Karasu, alive: he blinks, breathes, and can hop, shake his head, jump for joy, or tug his
// belt tight. Hops and jumps land with a squash. With the phone's Reduce Motion setting on,
// he only blinks.
export function AliveKarasu({ mood, size = 58, rank, belt, move = null, gear }: Props) {
  const reduceMotion = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const breath = useSharedValue(0); // 0 = breathed out, 1 = in
  const lift = useSharedValue(0); // 0 = standing, 1 = at the top of a jump
  const tilt = useSharedValue(0); // -1 to 1, for shaking his head
  const squeeze = useSharedValue(0); // 1 = pulled in at the waist, -1 = puffed out

  // Blinks: wait, shut the eyes briefly, and schedule the next one.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      const [min, max] = BLINK_EVERY_MS;
      timer = setTimeout(
        () => {
          setBlink(true);
          timer = setTimeout(() => {
            setBlink(false);
            next();
          }, BLINK_MS);
        },
        min + Math.random() * (max - min),
      );
    };
    next();
    return () => clearTimeout(timer);
  }, []);

  // Breathing: a slow rise and fall, forever.
  useEffect(() => {
    if (reduceMotion) return;
    // In, then back out (the `true` plays each repeat in reverse), forever.
    breath.set(withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(breath);
  }, [breath, reduceMotion]);

  // A one-off move, played whenever `move.id` changes.
  const moveId = move?.id;
  const moveKind = move?.kind;
  useEffect(() => {
    if (!moveKind || reduceMotion) return;
    const to = (toValue: number, duration: number) => withTiming(toValue, { duration, easing: Easing.out(Easing.quad) });
    // Up fast, slowing at the top, then falling faster and faster.
    const jump = (height: number) =>
      withSequence(
        withTiming(height, { duration: 140, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 160, easing: Easing.in(Easing.quad) }),
      );
    // Landing: puffed out for a moment, then springing back.
    const land = withSequence(withTiming(-0.8, { duration: 60 }), withSpring(0, { damping: 8, stiffness: 300 }));
    if (moveKind === 'shake') {
      tilt.set(withSequence(to(-1, 60), to(1, 100), to(-0.6, 90), to(0, 80)));
    } else if (moveKind === 'tug') {
      // Two pulls on the knot: in, out a little, in again, and settle.
      squeeze.set(withSequence(to(1, 80), to(-0.4, 90), to(1, 80), withSpring(0, { damping: 10 })));
    } else if (moveKind === 'cheer') {
      lift.set(withSequence(jump(1), jump(0.7), jump(0.4)));
      // He lands with a squash after the last, biggest-to-smallest jump.
      squeeze.set(withDelay(900, land));
    } else {
      lift.set(jump(0.45));
      squeeze.set(withDelay(300, land));
    }
    return () => {
      cancelAnimation(lift);
      cancelAnimation(tilt);
      cancelAnimation(squeeze);
    };
  }, [moveId, moveKind, lift, tilt, squeeze, reduceMotion]);

  const alive = useAnimatedStyle(() => ({
    transform: [
      { translateY: -size * 0.28 * lift.get() },
      { rotate: `${9 * tilt.get()}deg` },
      { scaleY: 1 + 0.035 * breath.get() + 0.08 * Math.min(squeeze.get(), 0) },
      { scaleX: interpolate(squeeze.get(), [-1, 0, 1], [1.08, 1, 0.9]) },
    ],
  }));

  return (
    // Scale and tilt from his feet, so he breathes and rocks in place instead of floating.
    <Animated.View style={[{ transformOrigin: 'bottom' }, alive]}>
      <Karasu mood={mood} size={size} rank={rank} belt={belt} blink={blink} gear={gear} />
    </Animated.View>
  );
}
