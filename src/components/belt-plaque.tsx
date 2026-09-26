import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

import { BeltIcon } from './belt-icon';
import { Karasu } from './karasu';

type Props = {
  belt: Belt;
  rank: Belt; // the learner's rank, for the Karasu who hangs it
  hang?: boolean; // just earned: Karasu flies in with it and hangs it on its peg
};

const useNativeDriver = Platform.OS !== 'web';

// When the plaque reaches its peg (the Learn screen thunks then). Before that, the wall
// scrolls to the row and Karasu flies in with it.
const FLY_DELAY_MS = 450;
const FLY_MS = 850;
export const HANG_LANDS_MS = FLY_DELAY_MS + FLY_MS;

// Where Karasu and the plaque fly in from: down and to the right, from the floor.
const FROM_X = 170;
const FROM_Y = 320;
const KARASU_SIZE = 40;

// The gold plaque a row earns when its belt exam is passed, hung beside its lesson plaques.
// When it's just been earned, a small Karasu carries it in by its cord, hooks it on the peg,
// and flies off while it swings.
export function BeltPlaque({ belt, rank, hang = false }: Props) {
  const name = `${belt.charAt(0).toUpperCase()}${belt.slice(1)}`;
  const reduceMotion = useReducedMotion();
  const moving = hang && !reduceMotion;
  // 0 = far away, 1 = on its peg. It starts away only when it's about to be hung.
  const [carry] = useState(() => new Animated.Value(moving ? 0 : 1));
  // 0 = Karasu holding it, 1 = Karasu gone.
  const [leave] = useState(() => new Animated.Value(moving ? 0 : 1));
  // -1 to 1: how far it swings once let go.
  const [swing] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!moving) return;
    carry.setValue(0);
    leave.setValue(0);
    const to = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, { toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver });
    const hanging = Animated.sequence([
      Animated.delay(FLY_DELAY_MS),
      Animated.timing(carry, { toValue: 1, duration: FLY_MS, easing: Easing.out(Easing.cubic), useNativeDriver }),
      // Let go: it swings on its cord while Karasu flies up and away.
      Animated.parallel([
        Animated.sequence([to(swing, 1, 160), to(swing, -0.7, 240), to(swing, 0.4, 200), to(swing, 0, 180)]),
        Animated.timing(leave, { toValue: 1, duration: 650, easing: Easing.in(Easing.quad), useNativeDriver }),
      ]),
    ]);
    hanging.start();
    return () => {
      // If it's cut short, it still ends up hung, with Karasu gone.
      hanging.stop();
      carry.setValue(1);
      leave.setValue(1);
      swing.setValue(0);
    };
  }, [moving, carry, leave, swing]);

  const flying = {
    transform: [
      // Across steadily and up with a slowing rise, so the path curves in toward the peg.
      { translateX: carry.interpolate({ inputRange: [0, 1], outputRange: [FROM_X, 0] }) },
      { translateY: carry.interpolate({ inputRange: [0, 0.6, 1], outputRange: [FROM_Y, 30, 0] }) },
    ],
  };

  return (
    <View style={[styles.hanger, moving && styles.above]} aria-label={`${name} belt plaque`}>
      <View style={styles.peg} />
      <Animated.View style={flying}>
        {/* It hangs from the top of its cord, so it swings around the peg. */}
        <Animated.View
          style={{
            alignItems: 'center',
            transformOrigin: 'top',
            transform: [{ rotate: swing.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) }],
          }}>
          <View style={styles.cord} />
          <View style={styles.plaque}>
            <BeltIcon belt={belt} width={38} />
            <Text style={styles.name}>{name}</Text>
          </View>
        </Animated.View>
        {moving && (
          <Animated.View
            style={[
              styles.karasu,
              {
                opacity: leave.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
                transform: [
                  { translateX: leave.interpolate({ inputRange: [0, 1], outputRange: [0, -110] }) },
                  { translateY: leave.interpolate({ inputRange: [0, 1], outputRange: [0, -150] }) },
                ],
              },
            ]}
            pointerEvents="none">
            {/* Wings up, as if flying, with the cord in his feet. */}
            <Karasu mood="cheer" rank={rank} size={KARASU_SIZE} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hanger: {
    alignItems: 'center',
    width: 60,
  },
  // Drawn over the plaques beside and below it while it flies in.
  above: {
    zIndex: 10,
  },
  peg: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: wallColors.peg,
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
  // Just above the cord, so his feet hold its top.
  karasu: {
    position: 'absolute',
    top: -KARASU_SIZE + 4,
    alignSelf: 'center',
  },
});
