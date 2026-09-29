import { useEffect, useRef, useState } from 'react';
import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

// Turning a card over in 3D: whenever `side` changes, it turns edge-on, the face swaps while
// it can't be seen, and it turns back flat showing the other side. Returns the side to draw
// (which lags `side` by half a turn) and the style for the card. With Reduce Motion, the face
// simply changes.
export function useTurnOver<T>(side: T, halfMs: number) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(side);
  // Degrees turned: 0 flat, 90 edge-on.
  const angle = useSharedValue(0);
  const last = useRef(side);

  useEffect(() => {
    if (reduceMotion || last.current === side) return;
    last.current = side;
    angle.set(withTiming(90, { duration: halfMs, easing: Easing.in(Easing.quad) }));
    const swap = setTimeout(() => {
      setShown(side);
      // The new face comes round from the other edge.
      angle.set(-90);
      angle.set(withTiming(0, { duration: halfMs, easing: Easing.out(Easing.back(1.4)) }));
    }, halfMs);
    return () => clearTimeout(swap);
  }, [side, halfMs, angle, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ perspective: 1400 }, { rotateY: `${angle.get()}deg` }] }));
  return { shown: reduceMotion ? side : shown, style };
}
