import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors } from '@/constants/theme';

// Kami fubuki, a "paper snowstorm": pieces of red, gold, wood and white paper falling from
// the top of the screen, for the big moments. It draws over everything but can't be touched.

const PIECES = 40;
const PAPER = [colors.vermilion, colors.gold, colors.wood, colors.card, colors.vermilionLight] as const;
const useNativeDriver = Platform.OS !== 'web';

type Piece = {
  x: number; // where it starts across, as a share of the width
  drift: number; // how far it wanders sideways while falling, in points
  spin: number; // turns while falling
  delay: number;
  duration: number;
  color: string;
  wide: boolean; // some pieces are wider than tall
  fall: Animated.Value; // 0 at the top, 1 below the bottom edge
};

function makePieces(): Piece[] {
  return Array.from({ length: PIECES }, (_, i) => ({
    x: Math.random(),
    drift: (Math.random() - 0.5) * 120,
    spin: (Math.random() - 0.5) * 6,
    delay: Math.random() * 500,
    duration: 1800 + Math.random() * 1400,
    // Safe: the index is within PAPER.
    color: PAPER[i % PAPER.length]!,
    wide: Math.random() < 0.5,
    fall: new Animated.Value(0),
  }));
}

export function Confetti() {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  // Made once: each piece's path is picked when the confetti first appears.
  const [pieces] = useState(makePieces);

  useEffect(() => {
    if (reduceMotion) return;
    const all = Animated.parallel(
      pieces.map((p) =>
        Animated.timing(p.fall, {
          toValue: 1,
          duration: p.duration,
          delay: p.delay,
          easing: Easing.in(Easing.quad),
          useNativeDriver,
        }),
      ),
    );
    all.start();
    return () => all.stop();
  }, [pieces, reduceMotion]);

  if (reduceMotion) return null;
  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.piece,
            p.wide ? styles.wide : styles.tall,
            {
              left: p.x * width,
              backgroundColor: p.color,
              transform: [
                { translateY: p.fall.interpolate({ inputRange: [0, 1], outputRange: [-20, height + 20] }) },
                { translateX: p.fall.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
                { rotate: p.fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin * 360}deg`] }) },
              ],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 1,
  },
  tall: {
    width: 6,
    height: 11,
  },
  wide: {
    width: 10,
    height: 6,
  },
});
