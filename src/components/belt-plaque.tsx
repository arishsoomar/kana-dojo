import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

import { BeltIcon } from './belt-icon';

// The gold plaque a row earns when its belt exam is passed, hung beside its lesson plaques.
export function BeltPlaque({ belt }: { belt: Belt }) {
  const name = `${belt.charAt(0).toUpperCase()}${belt.slice(1)}`;
  return (
    <View style={styles.hanger} aria-label={`${name} belt plaque`}>
      <View style={styles.peg} />
      <View style={styles.cord} />
      <View style={styles.plaque}>
        <BeltIcon belt={belt} width={38} />
        <Text style={styles.name}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hanger: {
    alignItems: 'center',
    width: 60,
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
});
