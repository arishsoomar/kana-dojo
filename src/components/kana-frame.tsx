import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Props = {
  char: string;
};

// The kana shown in a mounted frame with a bracket in each corner.
// The kana is sized from the frame's height, so it fills the frame on any screen.
export function KanaFrame({ char }: Props) {
  const [height, setHeight] = useState(0);
  const fontSize = Math.min(Math.max(height * KANA_SHARE, MIN_KANA), MAX_KANA);

  function onLayout(event: LayoutChangeEvent) {
    setHeight(event.nativeEvent.layout.height);
  }

  return (
    <View style={styles.frame} onLayout={onLayout} accessibilityLabel={`Kana ${char}`}>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      <Text style={[styles.kana, { fontSize, lineHeight: fontSize * 1.2 }]}>{char}</Text>
    </View>
  );
}

// The kana takes about half the frame's height, between these sizes.
const KANA_SHARE = 0.5;
const MIN_KANA = 98;
const MAX_KANA = 200;

const CORNER = 15;
const CORNER_INSET = 7;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  // Fills whatever height the screen gives it, but never shorter than the mock's 158.
  frame: {
    flex: 1,
    minHeight: 158,
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
    color: colors.sumi,
  },
});
