import { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Belt } from '@/core/boxes';

import { BELT_PLAQUE_WIDTH, BeltPlaqueCard } from './belt-plaque';
import { Karasu, karasuFeet, type KarasuMood } from './karasu';

export type Point = { x: number; y: number };

type Props = {
  from: Point; // his feet, standing on the floor
  to: Point; // the bottom of the peg the plaque hangs on
  width: number; // of the space he flies in, so his swoop down stays on screen
  rank: Belt;
  belt: Belt; // the plaque's belt
  size: number; // his size on the floor
  onHung: () => void; // the plaque is on its peg
  onLanded: () => void; // he's back where he stands
};

// How it plays out, and how long each part takes.
type Stage = 'crouch' | 'rise' | 'hook' | 'joy' | 'glide' | 'land';
const STAGE_MS: Record<Stage, number> = { crouch: 200, rise: 1100, hook: 280, joy: 520, glide: 950, land: 320 };
// How fast his wings beat while he flies up.
const FLAP_MS = 110;
// How small he gets in the air, as if flying up the wall away from you.
const AIR_SCALE = 0.3;
// How far the peg's hook pulls him down as the plaque goes on.
const DIP = 10;
// Keeps his swoop this far from the sides.
const EDGE = 44;

// Wings and face for each part: beating on the way up, spread for the flip and the glide.
const WINGS: Record<Stage, 'up' | 'down' | 'flap'> = {
  crouch: 'down',
  rise: 'flap',
  hook: 'flap',
  joy: 'up',
  glide: 'up',
  land: 'down',
};
const MOODS: Record<Stage, KarasuMood> = {
  crouch: 'focus',
  rise: 'focus',
  hook: 'focus',
  joy: 'cheer',
  glide: 'proud',
  land: 'focus',
};

// A point along a curve from a to b that bends toward c (a quadratic Bézier), and how fast it
// moves across there. Worklets: they run on the UI thread, every frame.
function along(a: number, c: number, b: number, t: number): number {
  'worklet';
  const u = 1 - t;
  return u * u * a + 2 * u * t * c + t * t * b;
}
function across(a: number, c: number, b: number, t: number): number {
  'worklet';
  return 2 * (1 - t) * (c - a) + 2 * t * (b - c);
}

// Karasu hangs a new belt plaque. He takes over from the Karasu standing on the floor, at the
// same spot and size: crouches, leaps and flaps up the wall with the plaque hanging from his
// feet, hooks it on its peg, does a flip for joy, and glides back down to land where he
// started. The Learn screen hides the floor Karasu meanwhile. About 3.4 seconds.
export function KarasuFlight({ from, to, width, rank, belt, size, onHung, onLanded }: Props) {
  const feet = karasuFeet(rank, size);
  const [stage, setStage] = useState<Stage>('crouch');
  const [flapUp, setFlapUp] = useState(false);

  // Along his path: 0 on the floor, 1 at the peg, 2 back on the floor.
  const path = useSharedValue(0);
  // 1 squashed down, -1 stretched up.
  const squash = useSharedValue(0);
  // 1 in the air (smaller), 0 on the floor.
  const air = useSharedValue(0);
  const spin = useSharedValue(0);
  const dip = useSharedValue(0);
  // 1 while he's carrying the plaque.
  const carry = useSharedValue(0);

  // Up: rising steeply, then across to the peg. Down: swinging out wide, then back in to land.
  const up = { x: from.x + (to.x - from.x) * 0.15, y: to.y + (from.y - to.y) * 0.1 };
  const down = {
    x: Math.min(Math.max(Math.max(from.x, to.x) + 110, EDGE), width - EDGE),
    y: (from.y + to.y) / 2 - 40,
  };

  const hung = useEffectEvent(onHung);
  const landed = useEffectEvent(onLanded);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = 0;
    const then = (ms: number, run: () => void) => {
      timers.push(setTimeout(run, at));
      at += ms;
    };
    then(STAGE_MS.crouch, () => {
      squash.set(withTiming(1, { duration: STAGE_MS.crouch, easing: Easing.out(Easing.quad) }));
    });
    then(STAGE_MS.rise, () => {
      setStage('rise');
      // Spring up out of the crouch, stretched, and settle as he climbs.
      squash.set(withSequence(withTiming(-1, { duration: 150 }), withSpring(0, { damping: 8 })));
      air.set(withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
      carry.set(withTiming(1, { duration: 320 }));
      path.set(withTiming(1, { duration: STAGE_MS.rise, easing: Easing.inOut(Easing.cubic) }));
    });
    then(STAGE_MS.hook / 2, () => {
      setStage('hook');
      dip.set(withTiming(DIP, { duration: STAGE_MS.hook / 2, easing: Easing.in(Easing.quad) }));
    });
    then(STAGE_MS.hook / 2, () => {
      // Hooked on: the wall's plaque takes over from the one he carried.
      carry.set(0);
      hung();
      dip.set(withSpring(0, { damping: 10 }));
    });
    then(STAGE_MS.joy, () => {
      setStage('joy');
      spin.set(withTiming(360, { duration: STAGE_MS.joy, easing: Easing.inOut(Easing.cubic) }));
    });
    then(STAGE_MS.glide, () => {
      setStage('glide');
      path.set(withTiming(2, { duration: STAGE_MS.glide, easing: Easing.inOut(Easing.quad) }));
      // Back to full size as he comes in to land.
      air.set(withDelay(STAGE_MS.glide - 400, withTiming(0, { duration: 400 })));
    });
    then(STAGE_MS.land, () => {
      setStage('land');
      squash.set(withSequence(withTiming(1, { duration: 110, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 9, stiffness: 220 })));
    });
    then(0, () => landed());
    return () => timers.forEach(clearTimeout);
  }, [path, squash, air, spin, dip, carry]);

  // Beating wings: up and down in turn, while he's flapping.
  const flapping = WINGS[stage] === 'flap';
  useEffect(() => {
    if (!flapping) return;
    const beat = setInterval(() => setFlapUp((u) => !u), FLAP_MS);
    return () => clearInterval(beat);
  }, [flapping]);
  const wings = flapping ? (flapUp ? 'up' : 'down') : WINGS[stage] === 'up' ? 'up' : 'down';

  // Which half of the trip he's on, and how far along it.
  const leg = (p: number) => {
    'worklet';
    return p <= 1 ? { a: from, c: up, b: to, t: p } : { a: to, c: down, b: from, t: p - 1 };
  };
  // Where his feet are, and how far he leans into the way he's going.
  const flying = useAnimatedStyle(() => {
    const { a, c, b, t } = leg(path.get());
    return {
      transform: [{ translateX: along(a.x, c.x, b.x, t) }, { translateY: along(a.y, c.y, b.y, t) + dip.get() }],
    };
  });
  const lean = (p: number) => {
    'worklet';
    const { a, c, b, t } = leg(p);
    return Math.min(Math.max(across(a.x, c.x, b.x, t) * 0.04, -16), 16);
  };
  const body = useAnimatedStyle(() => {
    const s = 1 - AIR_SCALE * air.get();
    const q = squash.get();
    return {
      transform: [
        { rotate: `${lean(path.get()) * air.get()}deg` },
        { scale: s },
        { scaleX: 1 + 0.14 * q },
        { scaleY: 1 - 0.18 * q },
      ],
    };
  });
  const flip = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get()}deg` }] }));
  // The plaque swings back behind him as he leans, on its cord.
  const plaque = useAnimatedStyle(() => ({
    opacity: carry.get(),
    transform: [{ scale: 0.6 + 0.4 * carry.get() }, { rotate: `${-lean(path.get()) * 1.4}deg` }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.anchor, flying]}>
        <Animated.View style={[styles.plaque, plaque]}>
          <BeltPlaqueCard belt={belt} />
        </Animated.View>
        <Animated.View
          style={[
            styles.karasu,
            { left: -feet.x, top: -feet.y, width: size, height: feet.height, transformOrigin: `${feet.x}px ${feet.y}px` },
            body,
          ]}>
          <Animated.View style={flip}>
            <Karasu mood={MOODS[stage]} rank={rank} size={size} wings={wings} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // A point with no size: his feet, and the top of the plaque's cord.
  anchor: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  plaque: {
    position: 'absolute',
    left: -BELT_PLAQUE_WIDTH / 2,
    top: 0,
    transformOrigin: 'top',
  },
  karasu: {
    position: 'absolute',
  },
});
