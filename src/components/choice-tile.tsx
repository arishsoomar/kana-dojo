import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

// One answer option. Selection is shown with a thicker, darker border, not a fill.
export function ChoiceTile({ label, selected, onPress }: Props) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      onPress={onPress}
      style={[styles.tile, selected && styles.selected]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const BORDER = 1.5;
const SELECTED_BORDER = 2;
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
  selected: {
    borderWidth: SELECTED_BORDER,
    borderColor: colors.sumi,
    padding: PADDING - (SELECTED_BORDER - BORDER),
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 19,
    color: colors.sumi,
  },
});
