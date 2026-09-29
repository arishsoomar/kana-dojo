import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

// Kami fubuki, a "paper snowstorm": pieces of red, gold, wood and white paper falling from
// the top of the screen, for the big moments. Each piece flutters as it falls, swaying and
// flipping over like paper does. It draws over everything but can't be touched.

const PIECES = 40;
const PAPER = [colors.vermilion, colors.gold, colors.wood, colors.card, colors.vermilionLight] as const;
const LONGEST_DELAY_MS = 500;
const LONGEST_FALL_MS = 3400;

type Piece = {
  x: number; // where it starts across, as a share of the width
  drift: number; // how far it wanders sideways while falling, in points
  spin: number; // turns while falling
  flutters: number; // times it sways side to side
  sway: number; // how far each sway goes, in points
  delay: number;
  duration: number;
  color: string;
  wide: boolean; // some pieces are wider than tall
};

function makePieces(): Piece[] {
  return Array.from({ length: PIECES }, (_, i) => ({
    x: Math.random(),
    drift: (Math.random() - 0.5) * 120,
    spin: (Math.random() - 0.5) * 4,
    flutters: 1.5 + Math.random() * 2.5,
    sway: 6 + Math.random() * 14,
    delay: Math.random() * LONGEST_DELAY_MS,
    duration: LONGEST_FALL_MS - Math.random() * 1400,
    // Safe: the index is within PAPER.
    color: PAPER[i % PAPER.length]!,
    wide: Math.random() < 0.5,
  }));
}

export function Confetti() {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  // Made once: each piece's path is picked when the confetti first appears.
  const [pieces] = useState(makePieces);
  // One clock for every piece, in milliseconds since it started.
  const clock = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const end = LONGEST_DELAY_MS + LONGEST_FALL_MS;
    clock.set(withTiming(end, { duration: end, easing: Easing.linear }));
  }, [clock, reduceMotion]);

  if (reduceMotion) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <PaperPiece key={i} piece={p} clock={clock} width={width} height={height} />
      ))}
    </View>
  );
}

type PieceProps = { piece: Piece; clock: SharedValue<number>; width: number; height: number };

function PaperPiece({ piece, clock, width, height }: PieceProps) {
  const falling = useAnimatedStyle(() => {
    const t = Math.min(Math.max((clock.get() - piece.delay) / piece.duration, 0), 1);
    // Paper speeds up a little, then falls steadily.
    const fall = 0.3 * t * t + 0.7 * t;
    const sway = Math.sin(t * piece.flutters * 2 * Math.PI);
    return {
      transform: [
        { translateY: -20 + fall * (height + 40) },
        { translateX: piece.drift * t + sway * piece.sway },
        { rotate: `${piece.spin * 360 * t + sway * 25}deg` },
        // Flipping over as it sways, showing its edge.
        { rotateX: `${sway * 70}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[styles.piece, piece.wide ? styles.wide : styles.tall, { left: piece.x * width, backgroundColor: piece.color }, falling]}
    />
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
