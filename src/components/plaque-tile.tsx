import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, wallColors } from '@/constants/theme';
import type { Plaque, PlaqueState } from '@/core/path';

import { CheckIcon } from './check-icon';
import { LockIcon } from './lock-icon';

type Props = {
  plaque: Plaque;
  state: PlaqueState;
  onPress: () => void;
};

// A lesson plaque hanging on the dojo wall. Kana read top to bottom, like Japanese signage.
// Done: wood with a vermilion seal. Current: dark and larger. Locked: grey, can't be tapped.
export function PlaqueTile({ plaque, state, onPress }: Props) {
  const current = state === 'current';
  const locked = state === 'locked';
  const label = plaque.kind === 'mixed' ? 'Mixed' : plaque.kana.map((k) => k.char).join('');

  return (
    <View style={styles.hanger}>
      <View style={styles.peg} />
      <View style={styles.cord} />
      <Pressable
        role="button"
        aria-label={`${plaque.kind === 'mixed' ? 'Mixed review' : label}, ${state}`}
        disabled={locked}
        onPress={onPress}
        style={[styles.plaque, current && styles.current, locked && styles.locked]}>
        {locked ? (
          <LockIcon color={wallColors.fadedInk} />
        ) : plaque.kind === 'mixed' ? (
          <Text style={[styles.mixed, current && styles.onCurrent]}>Mixed</Text>
        ) : (
          plaque.kana.map((k) => (
            <Text key={k.char} style={[styles.kana, current && styles.currentKana]}>
              {k.char}
            </Text>
          ))
        )}
        {state === 'done' && (
          <View style={styles.seal}>
            <CheckIcon color={colors.card} />
          </View>
        )}
      </Pressable>
      {current && (
        <View style={styles.begin}>
          <Text style={styles.beginText}>Begin</Text>
        </View>
      )}
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
    borderColor: colors.woodDark,
    backgroundColor: colors.wood,
  },
  current: {
    width: 60,
    height: 94,
    borderColor: colors.sumi,
    backgroundColor: colors.sumi,
  },
  locked: {
    borderColor: wallColors.fadedEdge,
    backgroundColor: wallColors.faded,
  },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    lineHeight: 24,
    color: colors.sumi,
  },
  currentKana: {
    fontSize: 26,
    lineHeight: 30,
    color: colors.card,
  },
  mixed: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.sumi,
  },
  onCurrent: {
    color: colors.card,
  },
  // The vermilion seal on a finished plaque, sitting over its bottom-right corner.
  seal: {
    position: 'absolute',
    right: -9,
    bottom: -9,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.paper,
    backgroundColor: colors.vermilion,
  },
  begin: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.sumi,
  },
  beginText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.card,
  },
});
