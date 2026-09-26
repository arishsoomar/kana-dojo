import { useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType, type LayoutChangeEvent } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Props = {
  text: string; // the word, in kana
  picture?: ImageSourcePropType; // a picture of it, above the word
  meaning?: string; // in English, under the word
};

// A word in the same mounted frame as a kana (corner brackets and all): a picture of it on top,
// the word in the middle, sized to fit on one line, and what it means underneath.
export function WordFrame({ text, picture, meaning }: Props) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  // The picture takes about a third of the height. Each kana is about one font size wide.
  const pictureSize = Math.min(box.height * 0.34, MAX_PICTURE);
  const fontSize = Math.min(box.height * (picture ? 0.2 : 0.4), (box.width - 2 * SIDE) / Math.max(text.length, 1), MAX_SIZE);

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
      {picture && pictureSize > 0 && (
        <Image source={picture} style={{ width: pictureSize, height: pictureSize }} accessibilityIgnoresInvertColors />
      )}
      {fontSize > 0 && (
        <Text style={[styles.word, { fontSize, lineHeight: fontSize * 1.25 }]} numberOfLines={1}>
          {text}
        </Text>
      )}
      {meaning && <Text style={styles.meaning}>{meaning}</Text>}
    </View>
  );
}

const SIDE = 24; // room left at each side of the word
const MAX_SIZE = 120;
const MAX_PICTURE = 150;
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
  meaning: {
    fontFamily: fonts.uiBold,
    fontSize: 17,
    color: colors.ink2,
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
