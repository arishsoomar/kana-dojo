import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { Furigana as FuriganaPieces } from '@/core/vocab';

type Props = {
  furigana: FuriganaPieces;
  size?: number; // of the text; the readings are a little under half this
  color?: string;
  readings?: boolean; // show the readings over the kanji (on by default)
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
};

// How big the readings are next to the text, and the space they take.
const READING_SCALE = 0.46;

// Japanese with furigana: the reading of each kanji in small kana above it. A word or a whole
// sentence; long ones wrap. Kana on their own get no reading, but keep the same line height,
// so everything sits on one baseline. With readings off, the space for them goes too.
export function Furigana({ furigana, size = 24, color = colors.sumi, readings = true, align = 'left', style }: Props) {
  const readingSize = Math.round(size * READING_SCALE);
  const readingHeight = Math.round(readingSize * 1.25);
  const text = { fontSize: size, lineHeight: Math.round(size * 1.3), color };
  const reading = { fontSize: readingSize, lineHeight: readingHeight, color };

  // Kanji with their reading stay together; kana are single characters, so lines can break
  // between any of them.
  const cells = furigana.flatMap((piece) => (piece[1] !== undefined ? [piece] : [...piece[0]].map((char) => [char] as const)));

  return (
    <View
      style={[styles.line, align === 'center' && styles.center, style]}
      aria-label={furigana.map((p) => p[0]).join('')}
      accessible>
      {cells.map((cell, i) => (
        <View key={i} style={styles.cell}>
          {readings && (
            <Text style={[styles.reading, reading]} numberOfLines={1}>
              {cell[1] ?? ' '}
            </Text>
          )}
          <Text style={[styles.text, text]}>{cell[0]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  center: {
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
  },
  // The phone's own Japanese font: at this size the dojo's heavy kana font would blur.
  reading: {
    fontWeight: '500',
  },
  text: {
    fontFamily: fonts.jp,
  },
});
