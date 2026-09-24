import { Platform, StyleSheet, TextInput, type TextInputProps, type TextStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

// The field's own border already shows focus, so hide the browser's focus ring on web.
// React Native's style types don't list outlineStyle 'none' (it only exists on web), hence the cast.
const hideWebFocusRing = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

// A text box in the app's style: white, with a thick dark border.
export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} {...props} style={[styles.field, hideWebFocusRing, props.style]} />;
}

const styles = StyleSheet.create({
  field: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.sumi,
    backgroundColor: colors.card,
    fontFamily: fonts.uiBold,
    fontSize: 18,
    color: colors.sumi,
  },
});
