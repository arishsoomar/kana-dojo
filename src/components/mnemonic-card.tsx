import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';
import { KANA_PICTURES } from '@/constants/kana-pictures';
import type { Kana } from '@/core/kana';
import { kanaTip, mnemonicBase } from '@/core/tips';
import { useTurnOver } from '@/hooks/use-turn-over';

import { KanaFrame } from './kana-frame';

// Half a turn: edge-on, then flat again with the other side up.
const HALF_TURN_MS = 130;

type Props = {
  kana: Kana;
  flipped: boolean; // showing the mnemonic side
  onFlip: () => void;
};

// The kana card in a lesson. Tap it to turn it over: the back has the kana's mnemonic, a
// picture that ties its shape to its sound, with the tip and the sound itself. Tap again to
// turn it back.
export function MnemonicCard({ kana, flipped, onFlip }: Props) {
  // It turns over in 3D; `showing` is the side up at this moment.
  const { shown: showing, style: turning } = useTurnOver(flipped, HALF_TURN_MS);
  const [height, setHeight] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    setHeight(event.nativeEvent.layout.height);
  }

  const base = mnemonicBase(kana);
  const picture = KANA_PICTURES[base.char];
  const pictureSize = Math.min(height * 0.36, 150);

  return (
    <Pressable
      role="button"
      aria-label={flipped ? `Mnemonic for ${kana.char}. Tap to turn back` : 'Tap for a memory tip'}
      onPress={onFlip}
      style={styles.fill}
      onLayout={onLayout}>
      <Animated.View style={[styles.fill, turning]}>
        {showing ? (
          <View style={styles.back}>
            {picture && pictureSize > 0 && (
              <Image source={picture} style={{ width: pictureSize, height: pictureSize }} accessibilityIgnoresInvertColors />
            )}
            <Text style={styles.sound}>
              <Text style={styles.kana}>{kana.char}</Text> · {kana.romaji[0]}
            </Text>
            <Text style={styles.tip}>{kanaTip(kana.char)}</Text>
            <Text style={styles.turnBack}>Tap to turn it back</Text>
          </View>
        ) : (
          <View style={styles.fill}>
            <KanaFrame char={kana.char} />
            <Text style={styles.hint}>Tap for a tip</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  back: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 158,
    paddingHorizontal: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.goldLight,
  },
  sound: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 24,
    color: colors.sumi,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  tip: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    color: colors.sumi,
  },
  turnBack: {
    marginTop: 4,
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.goldDark,
  },
  // Tucked into the bottom of the card, between the corner brackets.
  hint: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.muted,
  },
});
