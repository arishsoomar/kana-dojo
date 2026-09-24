import { StyleSheet, Text, View } from 'react-native';

import { beltColors, colors, fonts } from '@/constants/theme';
import type { GridCell } from '@/core/grid';

import { LockIcon } from './lock-icon';

// One kana in the belt grid: character, romaji, and a stripe in its belt color.
// Black belts are drawn inverted, with a vermilion stripe.
export function KanaCell({ cell }: { cell: GridCell }) {
  const { kana, belt, locked } = cell;

  if (locked) {
    return (
      <View style={[styles.cell, styles.locked]} aria-label={`${kana.char}, locked`}>
        <LockIcon color={colors.muted} />
      </View>
    );
  }

  const black = belt === 'black';
  return (
    <View style={[styles.cell, black && styles.blackCell]} aria-label={`${kana.char}, ${kana.romaji[0]}, ${belt} belt`}>
      <Text style={[styles.kana, black && styles.onBlack]}>{kana.char}</Text>
      <Text style={[styles.romaji, black && styles.romajiOnBlack]}>{kana.romaji[0]}</Text>
      <View
        style={[
          styles.stripe,
          { backgroundColor: black ? colors.vermilion : beltColors[belt] },
          belt === 'white' && styles.whiteStripe,
          black && styles.blackStripe,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  locked: {
    justifyContent: 'center',
    paddingVertical: 14,
    borderColor: colors.line,
    backgroundColor: colors.line,
  },
  blackCell: {
    borderColor: beltColors.black,
    backgroundColor: beltColors.black,
  },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 19,
    lineHeight: 22,
    color: colors.sumi,
  },
  onBlack: {
    color: colors.card,
  },
  romaji: {
    paddingBottom: 5,
    fontFamily: fonts.uiBold,
    fontSize: 10,
    color: colors.ink2,
  },
  romajiOnBlack: {
    color: colors.muted,
  },
  stripe: {
    alignSelf: 'stretch',
    height: 5,
  },
  whiteStripe: {
    borderTopWidth: 1.5,
    borderTopColor: colors.edge,
  },
  blackStripe: {
    height: 4,
  },
});
