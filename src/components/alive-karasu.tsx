import { useEffect, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { Belt } from '@/core/boxes';

import { Karasu, type KarasuMood } from './karasu';

export type KarasuMove = 'hop' | 'shake' | 'cheer';

type Props = {
  mood: KarasuMood;
  size?: number;
  rank: Belt;
  belt?: Belt;
  // A one-off move to play. A new `id` plays it again, even when it's the same move.
  move?: { kind: KarasuMove; id: number } | null;
};

// The native driver runs animations off the JavaScript thread, but it doesn't exist on web.
const useNativeDriver = Platform.OS !== 'web';

// How often he blinks (a random wait in this range, so it doesn't look mechanical), and for how long.
const BLINK_EVERY_MS = [2500, 5000] as const;
const BLINK_MS = 130;
// One slow breath, in and out.
const BREATH_MS = 1600;

// Karasu, alive: he blinks, breathes, and can hop, shake his head, or jump for joy. With the
// phone's Reduce Motion setting on, he only blinks.
export function AliveKarasu({ mood, size = 58, rank, belt, move = null }: Props) {
  const reduceMotion = useReducedMotion();
  const [blink, setBlink] = useState(false);
  // Animated values are made once and kept (useState's initializer runs only on the first render).
  const [breath] = useState(() => new Animated.Value(0)); // 0 = breathed out, 1 = in
  const [lift] = useState(() => new Animated.Value(0)); // 0 = standing, 1 = at the top of a jump
  const [tilt] = useState(() => new Animated.Value(0)); // -1 to 1, for shaking his head

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
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: BREATH_MS, easing: ease, useNativeDriver }),
        Animated.timing(breath, { toValue: 0, duration: BREATH_MS, easing: ease, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath, reduceMotion]);

  // A one-off move, played whenever `move.id` changes.
  const moveId = move?.id;
  const moveKind = move?.kind;
  useEffect(() => {
    if (!moveKind || reduceMotion) return;
    const to = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, { toValue, duration, easing: Easing.out(Easing.quad), useNativeDriver });
    const jumpOnce = (height: number) => Animated.sequence([to(lift, height, 130), to(lift, 0, 170)]);
    const animation =
      moveKind === 'shake'
        ? Animated.sequence([to(tilt, -1, 60), to(tilt, 1, 100), to(tilt, -0.6, 90), to(tilt, 0, 80)])
        : moveKind === 'cheer'
          ? Animated.sequence([jumpOnce(1), jumpOnce(0.7), jumpOnce(0.4)])
          : jumpOnce(0.45);
    animation.start();
    return () => animation.stop();
  }, [moveId, moveKind, lift, tilt, reduceMotion]);

  return (
    <Animated.View
      style={{
        // Scale and tilt from his feet, so he breathes and rocks in place instead of floating.
        transformOrigin: 'bottom',
        transform: [
          { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.28] }) },
          { rotate: tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-9deg', '9deg'] }) },
          { scaleY: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) },
        ],
      }}>
      <Karasu mood={mood} size={size} rank={rank} belt={belt} blink={blink} />
    </Animated.View>
  );
}
