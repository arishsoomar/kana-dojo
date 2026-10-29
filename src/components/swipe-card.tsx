import { useImperativeHandle, useState, type ReactNode, type Ref, type SyntheticEvent } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  Keyframe,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, fonts } from '@/constants/theme';
import { hold, keepQuiet, release } from '@/hooks/quiet-time';

// How far a card must be dragged to count, as a share of the screen's width: where it's let go,
// plus how far it would coast in COAST seconds at the speed it's flicked. A quick flick from the
// middle counts; a flick back towards the middle doesn't.
const THRESHOLD = 0.28;
const COAST = 0.12;
const FLY_MS = 220;

export type SwipeCardHandle = {
  // Sends the card off to the right (know it) or the left (still learning), as a swipe would.
  fling: (know: boolean) => void;
};

type Props = {
  ref?: Ref<SwipeCardHandle>;
  onSwipe: (know: boolean) => void;
  onThreshold?: () => void; // the drag has gone far enough to count, or come back
  active?: boolean; // the card on top; one waiting in the pile underneath can't be swiped
  onLeave?: () => void; // it's starting to go (swiped, or a button)
  children: ReactNode;
};

// A card you can swipe: right if you know it, left if you're still learning. It follows the
// finger, tilting as it goes, with a stamp saying which way it'll count; let go past the line
// (or flick it towards one) and it flies off, otherwise it springs back. A tap still reaches
// the card, and an up-and-down drag still scrolls. With Reduce Motion, it doesn't fly: it just
// counts.
export function SwipeCard({ ref, onSwipe, onThreshold, active = true, onLeave, children }: Props) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const gone = useSharedValue(false);
  // Once it's on its way out, it can't be tapped (turned over, or its word played).
  const [leaving, setLeaving] = useState(false);
  // Going: nothing new is drawn while it flies off and the next card rises.
  function leave() {
    setLeaving(true);
    keepQuiet(FLY_MS + 260);
    onLeave?.();
  }
  // While a finger's dragging it, nothing new is drawn either.
  const holding = useSharedValue(false);
  // On the web, letting go of a drag also clicks whatever's under the pointer, which would turn
  // the card over (or play its sound): a click straight after a drag is swallowed, and so is
  // any click on a card that's going or waiting underneath (pointerEvents alone doesn't stop
  // them reaching its buttons on the web).
  const dragged = useSharedValue(false);
  const swallowDragClick = (e: SyntheticEvent) => {
    if (active && !leaving && !dragged.get()) return;
    dragged.set(false);
    e.stopPropagation();
    e.preventDefault();
  };

  function flyOff(know: boolean) {
    'worklet';
    if (gone.get()) return;
    gone.set(true);
    if (reduceMotion) {
      scheduleOnRN(onSwipe, know);
      return;
    }
    x.set(
      withTiming((know ? 1 : -1) * width * 1.4, { duration: FLY_MS, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) scheduleOnRN(onSwipe, know);
      }),
    );
  }

  // The buttons call this from React, where with Reduce Motion it just counts.
  useImperativeHandle(ref, () => ({
    fling: (know: boolean) => {
      leave();
      if (!reduceMotion) return flyOff(know);
      if (gone.get()) return;
      gone.set(true);
      onSwipe(know);
    },
  }));

  const pan = Gesture.Pan()
    .enabled(active)
    // Sideways only: a tap turns the card over, and up and down scrolls.
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onBegin(() => {
      dragged.set(false);
    })
    .onStart(() => {
      dragged.set(true);
      holding.set(true);
      scheduleOnRN(hold);
    })
    .onFinalize(() => {
      if (!holding.get()) return;
      holding.set(false);
      scheduleOnRN(release, 300); // time to spring back, if it does
    })
    .onUpdate((e) => {
      if (gone.get()) return;
      x.set(e.translationX);
      y.set(e.translationY * 0.2);
    })
    .onEnd((e) => {
      if (gone.get()) return;
      const coasted = e.translationX + e.velocityX * COAST;
      if (Math.abs(coasted) > width * THRESHOLD) {
        scheduleOnRN(leave);
        flyOff(coasted > 0);
      } else {
        x.set(withSpring(0, { damping: 18, stiffness: 220 }));
        y.set(withSpring(0, { damping: 18, stiffness: 220 }));
      }
    });

  // A tick as the drag crosses the line, either way.
  useAnimatedReaction(
    () => Math.abs(x.get()) > width * THRESHOLD,
    (past, before) => {
      if (onThreshold && before !== null && past !== before && !gone.get()) scheduleOnRN(onThreshold);
    },
  );

  const moving = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { rotate: `${(x.get() / width) * 14}deg` }],
  }));
  const knowStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [16, width * THRESHOLD], [0, 1], 'clamp') }));
  const learningStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [-width * THRESHOLD, -16], [1, 0], 'clamp') }));

  return (
    // On the web, up and down is left to the browser, so the page still scrolls.
    <GestureDetector gesture={pan} touchAction="pan-y">
      <Animated.View
        style={moving}
        pointerEvents={leaving || !active ? 'none' : 'auto'}
        {...(Platform.OS === 'web' ? { onClickCapture: swallowDragClick } : {})}>
        {children}
        {/* The stamps only show the drag: the buttons say the same to a screen reader. */}
        <Animated.View aria-hidden pointerEvents="none" style={[styles.stamp, styles.knowStamp, knowStamp]}>
          <Text style={[styles.stampText, styles.knowText]}>Know it</Text>
        </Animated.View>
        <Animated.View aria-hidden pointerEvents="none" style={[styles.stamp, styles.learningStamp, learningStamp]}>
          <Text style={[styles.stampText, styles.learningText]}>Still learning</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

// The next card rising from the pile as the last one goes (a keyframe, so it runs on the web too).
export const riseFromPile = new Keyframe({
  0: { opacity: 0.6, transform: [{ scale: 0.94 }, { translateY: 12 }] },
  100: { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }] },
}).duration(200);

// The edge of the next card, peeking out under this one.
export function Pile() {
  return <View aria-hidden pointerEvents="none" style={styles.pile} />;
}

const styles = StyleSheet.create({
  stamp: {
    position: 'absolute',
    top: 18,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 3,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  knowStamp: {
    left: 16,
    borderColor: colors.pine,
    transform: [{ rotate: '-12deg' }],
  },
  learningStamp: {
    right: 16,
    borderColor: colors.vermilion,
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    fontFamily: fonts.uiBlack,
    fontSize: 18,
    textTransform: 'uppercase',
  },
  knowText: {
    color: colors.pineDark,
  },
  learningText: {
    color: colors.vermilionDark,
  },
  pile: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    bottom: -8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
});
