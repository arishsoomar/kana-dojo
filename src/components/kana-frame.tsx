import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Props = {
  char: string;
};

// The kana shown in a mounted frame with a bracket in each corner.
export function KanaFrame({ char }: Props) {
  return (
    <View style={styles.frame} accessibilityLabel={`Kana ${char}`}>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      <Text style={styles.kana}>{char}</Text>
    </View>
  );
}

const CORNER = 15;
const CORNER_INSET = 7;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  frame: {
    height: 158,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.edge,
    borderRadius: 6,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.sumi,
  },
  topLeft: { top: CORNER_INSET, left: CORNER_INSET, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  topRight: { top: CORNER_INSET, right: CORNER_INSET, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  bottomLeft: { bottom: CORNER_INSET, left: CORNER_INSET, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  bottomRight: { bottom: CORNER_INSET, right: CORNER_INSET, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 98,
    lineHeight: 118,
    color: colors.sumi,
  },
});
