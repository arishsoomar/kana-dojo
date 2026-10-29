import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { BENCH, benchCard, benchLog } from '@/dev/bench';
import { keepQuiet, whenQuiet } from '@/hooks/quiet-time';

// Half a turn of the card: edge-on, then flat with the other side up.
const HALF_TURN_MS = 120;
// How long after the card appears to get its back ready, once the card has settled in.
const READY_BACK_MS = 250;

type Props = {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean; // the side to show: the back when true
  onTap: () => void; // tapped: turn it over (the parent flips `flipped`)
  label: string;
  faceStyle: StyleProp<ViewStyle>; // each side's card: its border, background and padding
  active?: boolean; // the card on top; one waiting in the pile underneath can't be tapped
};

// A card that turns over in 3D when tapped. Both sides are drawn ahead of time (the back once
// nothing else is moving, or at once if it's tapped first), and the turn runs wholly on the
// UI thread: nothing has to be drawn, measured or decided in the middle of it, so it can't
// stutter or show the old side coming back round. The card is as tall as the side showing.
// With Reduce Motion, the side simply changes.
export function FlipCard({ front, back, flipped, onTap, label, faceStyle, active = true }: Props) {
  const reduceMotion = useReducedMotion();
  // Degrees turned: 0 the front flat, 90 edge-on, 180 the back flat.
  const angle = useSharedValue(flipped ? 180 : 0);
  const backHeight = useSharedValue(0);
  const [backReady, setBackReady] = useState(flipped);

  // The back, once the card has settled in and nothing else is moving.
  useEffect(() => whenQuiet(READY_BACK_MS, () => setBackReady(true)), []);

  // For the benchmark: when it comes to the top, and whether its back was ready by then.
  const logShown = useEffectEvent(() => benchLog({ ev: 'card-shown', backDrawn: backReady }));
  useEffect(() => {
    if (active) logShown();
  }, [active]);

  useEffect(() => {
    if (backReady) benchLog({ ev: 'back-drawn' });
  }, [backReady]);

  // The side it's turning to (or showing).
  const aimedAt = useRef(flipped);

  function turnTo(side: boolean) {
    aimedAt.current = side;
    keepQuiet(HALF_TURN_MS * 2 + 80);
    const to = side ? 180 : 0;
    if (reduceMotion) {
      angle.set(to);
      return;
    }
    const from = angle.get();
    if (side ? from >= 90 : from < 90) {
      // Already on that side (tapped again mid-turn): ease straight back, not on to edge-on.
      const ms = Math.max(40, HALF_TURN_MS * Math.min(1, Math.abs(to - from) / 90));
      angle.set(withTiming(to, { duration: ms, easing: Easing.out(Easing.quad) }));
      return;
    }
    // On to edge-on (taking only as long as is left of the way), then round to the other side.
    angle.set(
      withSequence(
        withTiming(90, { duration: HALF_TURN_MS * Math.min(1, Math.abs(90 - from) / 90), easing: Easing.in(Easing.quad) }),
        withTiming(to, { duration: HALF_TURN_MS, easing: Easing.out(Easing.back(1.4)) }),
      ),
    );
  }

  // A tap starts the turn at once, before anything else happens, then tells the parent.
  function tap() {
    setBackReady(true);
    turnTo(!aimedAt.current);
    onTap();
  }

  // If the parent turns it some other way, follow.
  useEffect(() => {
    if (flipped !== aimedAt.current) turnTo(flipped);
  });

  // The benchmark taps it the way a finger would (src/dev/bench.ts).
  useEffect(() => {
    if (BENCH && active) benchCard.tap = tap;
  });

  function measureBack(event: LayoutChangeEvent) {
    backHeight.set(event.nativeEvent.layout.height);
  }

  // Each side is seen only on its own half of the turn, and comes round from the far edge.
  const frontTurning = useAnimatedStyle(() => ({
    opacity: angle.get() < 90 ? 1 : 0,
    transform: [{ perspective: 1400 }, { rotateY: `${angle.get()}deg` }],
  }));
  const backTurning = useAnimatedStyle(() => ({
    opacity: angle.get() >= 90 ? 1 : 0,
    transform: [{ perspective: 1400 }, { rotateY: `${angle.get() - 180}deg` }],
  }));
  // The front sets the card's height; with the back showing, the card is at least the back's.
  const sized = useAnimatedStyle(() => ({ minHeight: angle.get() >= 90 ? backHeight.get() : 0 }));

  return (
    <Pressable role="button" aria-label={label} onPress={tap} disabled={!active}>
      <Animated.View style={sized}>
        <Animated.View style={[faceStyle, frontTurning]} pointerEvents={flipped ? 'none' : 'auto'} aria-hidden={flipped}>
          {front}
        </Animated.View>
        {backReady && (
          <Animated.View
            style={[faceStyle, styles.back, backTurning]}
            pointerEvents={flipped ? 'auto' : 'none'}
            aria-hidden={!flipped}
            onLayout={measureBack}>
            {back}
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Over the front, from the top, as tall as it needs.
  back: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
