import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import { kanaFit } from './kana-fit';

type Props = {
  char: string;
  // A fixed square size. Without it, the frame fills the space it's given.
  size?: number;
};

// The kana shown in a mounted frame with a bracket in each corner.
// The kana is sized from the frame's height, so it fills the frame on any screen.
export function KanaFrame({ char, size }: Props) {
  const [height, setHeight] = useState(0);
  const fontSize =
    (size ? size * FIXED_KANA_SHARE : Math.min(Math.max(height * KANA_SHARE, MIN_KANA), MAX_KANA)) * kanaFit(char);

  function onLayout(event: LayoutChangeEvent) {
    setHeight(event.nativeEvent.layout.height);
  }

  return (
    <View
      style={[styles.frame, size === undefined ? styles.fill : { width: size, height: size }]}
      onLayout={onLayout}
      accessibilityLabel={`Kana ${char}`}>
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
// In a fixed-size frame the kana is a bit larger relative to the frame.
const FIXED_KANA_SHARE = 0.6;

const CORNER = 15;
const CORNER_INSET = 7;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.edge,
    borderRadius: 6,
  },
  // Without a fixed size: fill whatever height the screen gives it, but never shorter than the mock's 158.
  fill: {
    flex: 1,
    minHeight: 158,
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
