import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { XIcon } from '@/components/x-icon';
import { colors, fonts, rainColors } from '@/constants/theme';
import { RAIN_LANES, targetOf, type Drop } from '@/core/rain';
import { unlockedKana } from '@/core/unlock';
import { useProgress } from '@/hooks/use-progress';
import { useRain } from '@/hooks/use-rain';

// The box around the input already shows focus, so hide the browser's own focus ring on web.
// React Native's style types don't list outlineStyle 'none' (it only exists on web), hence the cast.
const hideWebFocusRing = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null;

const TAG = 50;
const LOCKED_TAG = 62;
const TYPED_CHIP = 30; // height of the typed-text chip above the locked kana, plus its gap
const GROUND = 42;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

export default function KanaRainScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  // The kana to rain down: everything unlocked, fixed for this game.
  const [pool] = useState(() => unlockedKana(progress, 'hiragana'));
  const { rain, typed, onType, onSubmit } = useRain(pool);
  const target = targetOf(rain.drops, typed);
  const [size, setSize] = useState({ width: 0, height: 0 });

  function onLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave Kana Rain" onPress={close} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Kana Rain</Text>
      </View>

      <View style={styles.field} onLayout={onLayout}>
        <View style={[styles.cloud, styles.cloudLeft]} />
        <View style={[styles.cloud, styles.cloudRight]} />
        {size.width > 0 &&
          rain.drops.map((drop) => (
            <FallingKana
              key={drop.id}
              drop={drop}
              field={size}
              locked={drop.id === target?.id}
              typed={drop.id === target?.id ? typed : ''}
            />
          ))}
        <View style={styles.ground} />
      </View>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.inputBox}>
          <TextInput
            value={typed}
            onChangeText={onType}
            onSubmitEditing={onSubmit}
            submitBehavior="submit"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            placeholder="Type the romaji"
            placeholderTextColor={colors.muted}
            aria-label="Type the romaji"
            style={[styles.input, hideWebFocusRing]}
          />
          {target && (
            <Text style={styles.lockedOn} numberOfLines={1}>
              locked on <Text style={styles.lockedKana}>{target.kana.char}</Text>
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

type FallingKanaProps = {
  drop: Drop;
  field: { width: number; height: number };
  locked: boolean; // the kana the player's typing is aimed at
  typed: string; // shown above the locked kana
};

// One kana on its paper tag. Its lane sets how far across it is, and y sets how far down,
// so that at y = 1 the tag rests on the ground. The locked-on kana is dark and a bit bigger.
function FallingKana({ drop, field, locked, typed }: FallingKanaProps) {
  const size = locked ? LOCKED_TAG : TAG;
  const laneWidth = field.width / RAIN_LANES;
  const left = drop.lane * laneWidth + (laneWidth - size) / 2;
  const top = drop.y * (field.height - GROUND - TAG) - (size - TAG);
  return (
    // The typed chip sits above the locked kana; near the top it's pushed down to stay visible.
    <View style={[styles.drop, { left, top: Math.max(top - (locked ? TYPED_CHIP : 0), 0) }]}>
      {locked && (
        <View style={styles.typedChip}>
          <Text style={styles.typedText}>{typed}</Text>
        </View>
      )}
      <View
        style={[styles.tag, { width: size, height: size }, locked && styles.lockedTag]}
        aria-label={`Falling ${drop.kana.char}${locked ? ', locked on' : ''}`}>
        <Text style={[styles.tagKana, locked && styles.lockedTagKana]}>{drop.kana.char}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: rainColors.sky,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  field: {
    flex: 1,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    height: 26,
    borderRadius: 14,
    backgroundColor: rainColors.cloud,
  },
  cloudLeft: {
    left: -12,
    top: 14,
    width: 120,
  },
  cloudRight: {
    right: -16,
    top: 60,
    width: 120,
  },
  drop: {
    position: 'absolute',
    alignItems: 'center',
  },
  typedChip: {
    height: 24,
    marginBottom: 6,
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.sumi,
    backgroundColor: colors.card,
  },
  typedText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.sumi,
  },
  tag: {
    alignItems: 'center',
    justifyContent: 'center',
    width: TAG,
    height: TAG,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: rainColors.tagEdge,
    backgroundColor: rainColors.tag,
  },
  tagKana: {
    fontFamily: fonts.jp,
    fontSize: 24,
    lineHeight: 30,
    color: colors.sumi,
  },
  lockedTag: {
    borderColor: colors.sumi,
    backgroundColor: colors.sumi,
  },
  lockedTagKana: {
    fontSize: 32,
    lineHeight: 38,
    color: colors.card,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: GROUND,
    borderTopWidth: 5,
    borderTopColor: rainColors.groundEdge,
    backgroundColor: rainColors.ground,
  },
  bar: {
    paddingTop: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    backgroundColor: colors.card,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.sumi,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    fontFamily: fonts.uiExtraBold,
    fontSize: 20,
    color: colors.sumi,
  },
  lockedOn: {
    flexShrink: 0,
    marginLeft: 8,
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  lockedKana: {
    fontFamily: fonts.jp,
    fontSize: 16,
    color: colors.sumi,
  },
});
