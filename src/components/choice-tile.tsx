import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

// idle: not picked. selected: picked, not checked yet.
// After checking: correct (the right answer, picked), wrong (picked, but not the answer),
// missed (the right answer, when something else was picked).
export type TileState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed';

type Props = {
  label: string;
  state: TileState;
  disabled: boolean;
  onPress: () => void;
};

// One answer option. Selection is shown with a thicker border, not a fill.
export function ChoiceTile({ label, state, disabled, onPress }: Props) {
  return (
    <Pressable
      role="radio"
      aria-checked={state !== 'idle' && state !== 'missed'}
      disabled={disabled}
      onPress={onPress}
      style={[styles.tile, state !== 'idle' && styles.thick, styles[state]]}>
      <Text style={[styles.label, labelStyles[state]]}>{label}</Text>
    </Pressable>
  );
}

const BORDER = 1.5;
const THICK_BORDER = 2;
const PADDING = 14;

const styles = StyleSheet.create({
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    alignItems: 'center',
    padding: PADDING,
    backgroundColor: colors.card,
    borderWidth: BORDER,
    borderColor: colors.edge,
    borderRadius: 8,
  },
  // Thicker border, with padding reduced by the same amount so the tile doesn't grow.
  thick: {
    borderWidth: THICK_BORDER,
    padding: PADDING - (THICK_BORDER - BORDER),
  },
  idle: {},
  selected: { borderColor: colors.sumi },
  correct: { borderColor: colors.pine, backgroundColor: colors.pineLight },
  wrong: { borderColor: colors.vermilion, backgroundColor: colors.vermilionLight },
  missed: { borderColor: colors.pine, borderStyle: 'dashed' },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 19,
    color: colors.sumi,
  },
});

const labelStyles = StyleSheet.create({
  idle: {},
  selected: {},
  correct: { color: colors.pineDark },
  wrong: { color: colors.vermilionDark },
  missed: { color: colors.pineDark },
});
