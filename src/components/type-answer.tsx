import { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { typingDone } from '@/core/kana';

type Props = {
  // Set once this question is answered wrong: the box locks, showing what was typed in red.
  wrong: boolean;
  onSubmit: (typed: string) => void;
};

// Browsers draw their own focus ring around inputs; the box's border already shows focus.
const hideWebFocusRing = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

// The answer box in typing mode. It checks the answer as soon as a whole spelling is typed
// (see typingDone), or on Enter. The lesson gives each question a fresh box, which opens the
// keyboard by itself.
export function TypeAnswer({ wrong, onSubmit }: Props) {
  const [text, setText] = useState('');

  // A wrong answer puts the keyboard away, so the feedback sheet can be seen.
  useEffect(() => {
    if (wrong) Keyboard.dismiss();
  }, [wrong]);

  function change(next: string) {
    if (wrong) return;
    setText(next);
    if (typingDone(next)) onSubmit(next);
  }

  function submit() {
    if (!wrong && text.trim() !== '') onSubmit(text);
  }

  return (
    <View style={[styles.box, wrong && styles.boxWrong]}>
      <TextInput
        value={text}
        onChangeText={change}
        onSubmitEditing={submit}
        submitBehavior="submit"
        editable={!wrong}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        returnKeyType="done"
        placeholder="Type its sound"
        placeholderTextColor={colors.muted}
        aria-label="Type its sound"
        style={[styles.input, wrong && styles.inputWrong, hideWebFocusRing]}
      />
      {/* For "n", which waits for more letters in case it's the start of na, ni, and so on. */}
      {!wrong && text.trim() !== '' && (
        <Pressable role="button" aria-label="Check" onPress={submit} hitSlop={8} style={styles.check}>
          <Text style={styles.checkText}>Check</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 12,
    paddingHorizontal: 14,
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.sumi,
    backgroundColor: colors.card,
  },
  boxWrong: {
    borderColor: colors.vermilion,
    backgroundColor: colors.vermilionLight,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontFamily: fonts.uiBold,
    fontSize: 22,
    textAlign: 'center',
    color: colors.sumi,
  },
  inputWrong: {
    color: colors.vermilionDark,
  },
  check: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.sumi,
  },
  checkText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.card,
  },
});
