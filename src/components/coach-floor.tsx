import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

import { AliveKarasu, type KarasuMove } from './alive-karasu';

// How tall the strip of floor is, and how much room Karasu and the bubble take above the
// bottom edge; the wall above leaves this much space so nothing hides behind them.
export const FLOOR_HEIGHT = 78;
export const FLOOR_SPACE = 150;

// The gaps between floor planks.
const PLANK_WIDTH = 74;
const PLANKS = 12;

type Props = {
  rank: Belt; // Karasu's form
  line: string;
  action: { label: string; onPress: () => void } | null;
  onKarasuPress: () => void; // tapping Karasu himself
  move: { kind: KarasuMove; id: number } | null;
};

// The dojo floor at the bottom of the Learn screen: Karasu standing on it, saying what to do
// next. When there's something to do, tapping the bubble does it.
export function CoachFloor({ rank, line, action, onKarasuPress, move }: Props) {
  const bubble = (
    <>
      <View style={styles.tail} />
      <Text style={styles.line}>{line}</Text>
      {action && <Text style={styles.action}>{action.label} ›</Text>}
    </>
  );

  return (
    // box-none: the empty space around Karasu and the bubble doesn't block the wall behind.
    <View style={styles.area} pointerEvents="box-none">
      <View style={styles.floor} pointerEvents="none">
        {Array.from({ length: PLANKS }, (_, i) => (
          <View key={i} style={[styles.plank, { left: (i + 1) * PLANK_WIDTH }]} />
        ))}
      </View>
      <Pressable role="button" aria-label="Talk to Karasu" onPress={onKarasuPress} style={styles.karasu}>
        <AliveKarasu mood="focus" size={96} rank={rank} move={move} />
      </Pressable>
      {action ? (
        <Pressable role="button" aria-label={`${line} ${action.label}`} onPress={action.onPress} style={styles.bubble}>
          {bubble}
        </Pressable>
      ) : (
        <View style={styles.bubble}>{bubble}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FLOOR_SPACE,
  },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FLOOR_HEIGHT,
    overflow: 'hidden',
    borderTopWidth: 5,
    borderTopColor: wallColors.floorEdge,
    backgroundColor: wallColors.floor,
  },
  plank: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: wallColors.plank,
  },
  karasu: {
    position: 'absolute',
    left: 14,
    bottom: 20,
  },
  bubble: {
    position: 'absolute',
    left: 116,
    right: 14,
    bottom: 28,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  // The bubble's point: a small rotated square showing only its left and bottom edges.
  tail: {
    position: 'absolute',
    left: -7,
    bottom: 18,
    width: 12,
    height: 12,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
    transform: [{ rotate: '45deg' }],
  },
  line: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.sumi,
  },
  action: {
    marginTop: 4,
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.vermilionDark,
  },
});
