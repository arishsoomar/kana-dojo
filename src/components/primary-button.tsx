import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Props = {
  label: string;
  disabled?: boolean;
  onPress: () => void;
};

export function PrimaryButton({ label, disabled = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.sumi,
  },
  buttonDisabled: {
    backgroundColor: colors.line,
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.card,
  },
  labelDisabled: {
    color: colors.muted,
  },
});
