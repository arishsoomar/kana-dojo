import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { XIcon } from '@/components/x-icon';
import { colors, fonts, rainColors } from '@/constants/theme';
import { RAIN_LANES, type Drop } from '@/core/rain';
import { unlockedKana } from '@/core/unlock';
import { useProgress } from '@/hooks/use-progress';
import { useRain } from '@/hooks/use-rain';

const TAG = 50;
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
  const rain = useRain(pool);
  const [size, setSize] = useState({ width: 0, height: 0 });

  function onLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave Kana Rain" onPress={close} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Kana Rain</Text>
      </View>

      <View style={styles.field} onLayout={onLayout}>
        <View style={[styles.cloud, styles.cloudLeft]} />
        <View style={[styles.cloud, styles.cloudRight]} />
        {size.width > 0 && rain.drops.map((drop) => <FallingKana key={drop.id} drop={drop} field={size} />)}
        <View style={[styles.ground, { height: GROUND + insets.bottom }]} />
      </View>
    </View>
  );
}

// One kana on its paper tag. Its lane sets how far across it is, and y sets how far down,
// so that at y = 1 the tag rests on the ground.
function FallingKana({ drop, field }: { drop: Drop; field: { width: number; height: number } }) {
  const laneWidth = field.width / RAIN_LANES;
  const left = drop.lane * laneWidth + (laneWidth - TAG) / 2;
  const top = drop.y * (field.height - GROUND - TAG);
  return (
    <View style={[styles.tag, { left, top }]} aria-label={`Falling ${drop.kana.char}`}>
      <Text style={styles.tagKana}>{drop.kana.char}</Text>
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
  tag: {
    position: 'absolute',
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
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 5,
    borderTopColor: rainColors.groundEdge,
    backgroundColor: rainColors.ground,
  },
});
