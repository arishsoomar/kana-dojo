import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { NamedPair } from '@/core/pairs';

// A red "boss" plaque for a duel that's ready: the pair's two kana, read top to bottom.
export function DuelPlaque({ pair, onPress }: { pair: NamedPair; onPress: () => void }) {
  return (
    <View style={styles.hanger}>
      <View style={styles.peg} />
      <View style={styles.cord} />
      <Pressable
        role="button"
        aria-label={`Duel: ${pair.kana.join(' ')}, ready`}
        onPress={onPress}
        style={styles.plaque}>
        <Text style={styles.kana}>{pair.kana[0]}</Text>
        <Text style={styles.kana}>{pair.kana[1]}</Text>
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
    gap: 2,
    width: 52,
    height: 82,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.vermilionDark,
    backgroundColor: colors.vermilion,
  },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    lineHeight: 24,
    color: colors.card,
  },
});
