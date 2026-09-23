import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/constants/theme';

type Tone = 'sumi' | 'pine' | 'vermilion';

type Props = {
  label: string;
  tone?: Tone;
  disabled?: boolean;
  onPress: () => void;
};

export function PrimaryButton({ label, tone = 'sumi', disabled = false, onPress }: Props) {
  return (
    <Pressable
      role="button"
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: colors[tone] }, disabled && styles.buttonDisabled]}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
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
