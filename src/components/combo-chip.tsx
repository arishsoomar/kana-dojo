import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';
import { COMBO_MILESTONES, COMBO_SHOWS_AT } from '@/core/lesson';

import { FlameIcon } from './flame-icon';

const useNativeDriver = Platform.OS !== 'web';

// "5 in a row!", with a flame that grows at 5 and 10. It pops each time the count goes up.
export function ComboChip({ count }: { count: number }) {
  const reduceMotion = useReducedMotion();
  const [pop] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion || count < COMBO_SHOWS_AT) return;
    pop.setValue(1.35);
    const settle = Animated.timing(pop, { toValue: 1, duration: 260, easing: Easing.out(Easing.back(2)), useNativeDriver });
    settle.start();
    return () => settle.stop();
  }, [count, pop, reduceMotion]);

  if (count < COMBO_SHOWS_AT) return null;
  const flame = count >= COMBO_MILESTONES[1] ? 26 : count >= COMBO_MILESTONES[0] ? 21 : 17;
  return (
    // Centred along the top of whatever it sits in (the kana frame), between its corner marks.
    <View style={styles.row} pointerEvents="none">
      <Animated.View style={[styles.chip, { transform: [{ scale: pop }] }]} aria-label={`${count} right in a row`}>
        <FlameIcon size={flame} />
        <Text style={styles.text}>{count} in a row!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  text: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
});
