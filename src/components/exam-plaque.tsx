import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

import { BeltIcon } from './belt-icon';

// A gold plaque for a belt exam that's ready, hung with the row's lesson plaques.
export function ExamPlaque({ belt, onPress }: { belt: Belt; onPress: () => void }) {
  return (
    <View style={styles.hanger}>
      <View style={styles.peg} />
      <View style={styles.cord} />
      <Pressable role="button" aria-label={`${belt} belt exam, ready`} onPress={onPress} style={styles.plaque}>
        <BeltIcon belt={belt} width={38} />
        <Text style={styles.name}>Exam</Text>
      </Pressable>
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
    fontSize: 12,
    color: colors.goldDark,
  },
});
