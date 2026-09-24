import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

import { BeltIcon } from './belt-icon';
import { Karasu } from './karasu';
import { PrimaryButton } from './primary-button';

type Props = {
  belt: Belt; // the belt just earned
  from: Belt; // the belt the row had before
  rowChar: string; // e.g. "か" for the ka row
  correct: number;
  total: number;
  nextRowChar: string | null; // set if passing opened the next row
  rank: Belt; // the learner's overall rank now, which sets Karasu's form
  fromRank: Belt; // the rank before this exam; Karasu starts in this form
  onDone: () => void;
};

// Native animation isn't available on web; there React Native animates in JavaScript instead.
const useNativeDriver = Platform.OS !== 'web';

// The payoff for passing a belt exam. The new belt drops onto Karasu, he puts it on,
// and the words appear. It takes about a second and a half.
export function BeltCeremony({ belt, from, rowChar, correct, total, nextRowChar, rank, fromRank, onDone }: Props) {
  const grew = rank !== fromRank;
  const insets = useSafeAreaInsets();
  // Animated values are created once. (useState keeps them between renders without
  // reading a ref during render.)
  const [drop] = useState(() => new Animated.Value(0));
  const [reveal] = useState(() => new Animated.Value(0));
  const [tied, setTied] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(drop, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver }),
    ]).start(() => {
      setTied(true);
      Animated.timing(reveal, { toValue: 1, duration: 400, useNativeDriver }).start();
    });
  }, [drop, reveal]);

  const beltName = `${belt.charAt(0).toUpperCase()}${belt.slice(1)} belt`;
  const beltStyle = {
    opacity: drop,
    transform: [{ translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-160, 0] }) }],
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.stage}>
        <View style={styles.glow} />
        {/* Wrapped in a View so he's layered above the glow on web too. */}
        <View>
          {/* When the belt is tied he puts it on, and if the rank rose, he takes his new form. */}
          <Karasu mood={tied ? 'proud' : 'focus'} rank={tied ? rank : fromRank} belt={tied ? belt : from} size={160} />
        </View>
        <Animated.View style={[styles.belt, beltStyle]}>
          <BeltIcon belt={belt} width={150} />
        </Animated.View>

        <Animated.View style={[styles.words, { opacity: reveal }]}>
          <Text style={styles.title}>
            {beltName}, <Text style={styles.kana}>{rowChar}</Text> row
          </Text>
          <Text style={styles.line}>
            {correct} of {total}. Karasu ties the belt on. Your whole <Text style={styles.kana}>{rowChar}</Text> row is{' '}
            {belt} now
            {nextRowChar ? (
              <>
                , and the <Text style={styles.kana}>{nextRowChar}</Text> row is open.
              </>
            ) : (
              '.'
            )}
          </Text>
          {grew && <Text style={styles.grew}>Karasu has grown into a {rank} belt.</Text>}
          <View style={styles.chip}>
            <Text style={styles.chipText}>Plaque added</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Hang the plaque" tone="light" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.night,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // A soft vermilion glow behind Karasu.
  glow: {
    position: 'absolute',
    top: '12%',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: colors.vermilion,
    opacity: 0.18,
  },
  belt: {
    marginTop: 10,
  },
  words: {
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
    fontFamily: fonts.uiBlack,
    fontSize: 27,
    textAlign: 'center',
    color: colors.card,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  line: {
    marginTop: 8,
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    color: colors.muted,
  },
  grew: {
    marginTop: 10,
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    textAlign: 'center',
    color: colors.gold,
  },
  chip: {
    marginTop: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.nightRaised,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.card,
  },
  footer: {
    paddingHorizontal: 18,
  },
});
