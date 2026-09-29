import { useEffect, useRef, type Ref } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

import { BeltIcon } from './belt-icon';

type Props = {
  belt: Belt;
  // Just earned: the peg is empty while Karasu flies it in (see KarasuFlight). When this turns
  // false, it's been hooked on and swings.
  waiting?: boolean;
  // The peg, so the Learn screen can find where Karasu should fly to.
  pegRef?: Ref<View>;
};

// The swing when it's hooked on: a push, then a loose spring back to still, like a pendulum.
const HOOK_PUSH = 900;
const PENDULUM = { damping: 4, stiffness: 120, mass: 0.6 } as const;

// The gold plaque a row earns when its belt exam is passed, hung beside its lesson plaques.
export function BeltPlaque({ belt, waiting = false, pegRef }: Props) {
  const name = `${belt.charAt(0).toUpperCase()}${belt.slice(1)}`;
  const reduceMotion = useReducedMotion();
  // Degrees it has swung to either side.
  const swing = useSharedValue(0);
  const wasWaiting = useRef(waiting);

  useEffect(() => {
    if (wasWaiting.current && !waiting && !reduceMotion) {
      swing.value = withSpring(0, { ...PENDULUM, velocity: HOOK_PUSH });
    }
    wasWaiting.current = waiting;
  }, [waiting, swing, reduceMotion]);

  const swinging = useAnimatedStyle(() => ({ transform: [{ rotate: `${swing.value}deg` }] }));

  return (
    <View style={styles.hanger} aria-label={waiting ? undefined : `${name} belt plaque`}>
      <View ref={pegRef} style={styles.peg} />
      {/* Kept in the layout while it's away, so nothing around it moves when it arrives. */}
      <Animated.View style={[styles.swinging, swinging, waiting && styles.away]}>
        <BeltPlaqueCard belt={belt} />
      </Animated.View>
    </View>
  );
}

// The plaque on its cord, without the peg: what Karasu carries up the wall.
export function BeltPlaqueCard({ belt }: { belt: Belt }) {
  const name = `${belt.charAt(0).toUpperCase()}${belt.slice(1)}`;
  return (
    <View style={styles.card}>
      <View style={styles.cord} />
      <View style={styles.plaque}>
        <BeltIcon belt={belt} width={38} />
        <Text style={styles.name}>{name}</Text>
      </View>
    </View>
  );
}

// Its size, peg included, and how wide the card is.
export const BELT_PLAQUE_WIDTH = 60;
export const PEG_SIZE = 8;

const styles = StyleSheet.create({
  hanger: {
    alignItems: 'center',
    width: BELT_PLAQUE_WIDTH,
  },
  peg: {
    width: PEG_SIZE,
    height: PEG_SIZE,
    borderRadius: PEG_SIZE / 2,
    backgroundColor: wallColors.peg,
  },
  // It hangs from the top of its cord, so it swings around the peg.
  swinging: {
    transformOrigin: 'top',
  },
  away: {
    opacity: 0,
  },
  card: {
    alignItems: 'center',
    width: BELT_PLAQUE_WIDTH,
  },
  cord: {
    width: 2,
    height: 10,
    backgroundColor: wallColors.cord,
  },
  plaque: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 52,
    height: 82,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.goldLight,
  },
  name: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 11,
    color: colors.goldDark,
  },
});
