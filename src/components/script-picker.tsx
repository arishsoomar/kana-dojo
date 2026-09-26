import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { Script } from '@/core/kana';

import { CheckIcon } from './check-icon';
import { DownIcon } from './down-icon';

const OPTIONS: readonly { value: Script; kana: string; name: string }[] = [
  { value: 'hiragana', kana: 'ひらがな', name: 'Hiragana' },
  { value: 'katakana', kana: 'カタカナ', name: 'Katakana' },
];

type Props = {
  value: Script;
  onChange: (script: Script) => void;
};

// A small chip naming the script in kana, which opens a menu to switch scripts.
export function ScriptPicker({ value, onChange }: Props) {
  const chip = useRef<View>(null);
  // Where the menu opens: just under the chip, measured when it's tapped.
  const [menuAt, setMenuAt] = useState<{ x: number; y: number } | null>(null);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0]!;

  function open() {
    chip.current?.measureInWindow((x, y, _width, height) => setMenuAt({ x, y: y + height + 6 }));
  }

  function choose(script: Script) {
    setMenuAt(null);
    if (script !== value) onChange(script);
  }

  return (
    <>
      <Pressable
        ref={chip}
        role="button"
        aria-label={`Script: ${current.name}. Change`}
        onPress={open}
        style={styles.chip}>
        <Text style={styles.chipText}>{current.kana}</Text>
        <DownIcon color={colors.muted} />
      </Pressable>

      <Modal visible={menuAt !== null} transparent animationType="fade" onRequestClose={() => setMenuAt(null)}>
        {/* Tapping anywhere outside the menu closes it. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuAt(null)} aria-label="Close" />
        {menuAt && (
          <View style={[styles.menu, { left: menuAt.x, top: menuAt.y }]}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                role="button"
                aria-label={option.name}
                onPress={() => choose(option.value)}
                style={styles.option}>
                <Text style={styles.optionKana}>{option.kana}</Text>
                <Text style={styles.optionName}>{option.name}</Text>
                {option.value === value && <CheckIcon color={colors.sumi} />}
              </Pressable>
            ))}
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  chipText: {
    fontFamily: fonts.jp,
    fontSize: 13,
    color: colors.sumi,
  },
  menu: {
    position: 'absolute',
    minWidth: 190,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  optionKana: {
    fontFamily: fonts.jp,
    fontSize: 15,
    color: colors.sumi,
  },
  optionName: {
    flex: 1,
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
});
