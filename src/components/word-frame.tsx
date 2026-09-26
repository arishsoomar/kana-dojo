import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { colors, fonts } from '@/constants/theme';

// A word in the same mounted frame as a kana (corner brackets and all), sized to fit: as big as
// the frame allows, but small enough that the whole word fits on one line.
export function WordFrame({ text }: { text: string }) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  // Each kana is about one font size wide.
  const fontSize = Math.min(box.height * 0.4, (box.width - 2 * SIDE) / Math.max(text.length, 1), MAX_SIZE);

  function onLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setBox({ width, height });
  }

  return (
    <View style={styles.frame} onLayout={onLayout} aria-label={`Word ${text}`}>
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />
      {fontSize > 0 && (
        <Text style={[styles.word, { fontSize, lineHeight: fontSize * 1.25 }]} numberOfLines={1}>
          {text}
        </Text>
      )}
    </View>
  );
}

const SIDE = 24; // room left at each side of the word
const MAX_SIZE = 120;
const CORNER = 15;
const CORNER_INSET = 7;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
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
  word: {
    fontFamily: fonts.jp,
    color: colors.sumi,
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
});
