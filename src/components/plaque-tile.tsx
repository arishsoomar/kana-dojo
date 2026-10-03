import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

import { colors, fonts, jpRoom, wallColors } from "@/constants/theme";
import type { Plaque, PlaqueState } from "@/core/path";

import { CheckIcon } from "./check-icon";
import { kanaFit } from "./kana-fit";
import { LockIcon } from "./lock-icon";

type Props = {
  plaque: Plaque;
  state: PlaqueState;
  onPress: () => void;
  stamp?: boolean; // just finished: the seal stamps down
  reveal?: number | null; // its row just opened: it flips over, after this many others
};

// When the seal lands (the Learn screen buzzes then), and the gap between flipping plaques.
export const STAMP_LANDS_MS = 420;
const REVEAL_STAGGER_MS = 110;
// A tapped plaque swings on its cord; the lesson opens this long after the tap.
const SWING_OPENS_AFTER_MS = 180;
// The swing: a push, then a loose spring back to still, like a pendulum (degrees a second).
const TAP_PUSH = 140;
const PENDULUM = { damping: 4, stiffness: 180, mass: 0.5 } as const;
// The seal stamps down: lands hard, squashing a little past its size, and settles.
const STAMP = { damping: 9, stiffness: 260 } as const;
const STAMP_DELAY_MS = STAMP_LANDS_MS - 140;
// A new row's plaques flip round, overshooting a little.
const FLIP = { damping: 12, stiffness: 140 } as const;

// A lesson plaque hanging on the dojo wall. Kana read top to bottom, like Japanese signage.
// Done: wood with a vermilion seal. Current: dark and larger. Locked: grey, can't be tapped.
export function PlaqueTile({
  plaque,
  state,
  onPress,
  stamp = false,
  reveal = null,
}: Props) {
  const current = state === "current";
  const locked = state === "locked";
  const reduceMotion = useReducedMotion();
  // 1 = the seal in place. It starts at 0 only when it's about to stamp.
  const seal = useSharedValue(stamp && !reduceMotion ? 0 : 1);
  // 1 = facing the front. It starts turned edge-on only when it's about to flip.
  const face = useSharedValue(reveal !== null && !reduceMotion ? 0 : 1);
  // Degrees it has swung to either side.
  const swing = useSharedValue(0);

  function tap() {
    if (reduceMotion) {
      onPress();
      return;
    }
    swing.set(withSpring(0, { ...PENDULUM, velocity: TAP_PUSH }));
    setTimeout(onPress, SWING_OPENS_AFTER_MS);
  }

  useEffect(() => {
    if (!stamp || reduceMotion) return;
    seal.set(0);
    seal.set(withDelay(STAMP_DELAY_MS, withSpring(1, STAMP)));
  }, [stamp, seal, reduceMotion]);

  useEffect(() => {
    if (reveal === null || reduceMotion) return;
    face.set(0);
    face.set(withDelay(250 + reveal * REVEAL_STAGGER_MS, withSpring(1, FLIP)));
  }, [reveal, face, reduceMotion]);

  const hanging = useAnimatedStyle(() => ({
    transform: [
      { perspective: 600 },
      { rotate: `${swing.get()}deg` },
      { rotateY: `${90 * (1 - face.get())}deg` },
    ],
  }));
  // Past 1 (the spring overshooting), it squashes a little smaller than its size.
  const stamping = useAnimatedStyle(() => ({
    opacity: Math.min(seal.get() * 1.5, 1),
    transform: [{ scale: 2.4 - 1.4 * seal.get() }],
  }));
  const label =
    plaque.kind === "mixed" ? "Mixed" : plaque.kana.map((k) => k.char).join("");

  return (
    <View style={styles.hanger}>
      <View style={styles.peg} />
      <View style={styles.cord} />
      {/* Hangs from the top, so it swings and flips around the peg. */}
      <Animated.View style={[{ transformOrigin: "top" }, hanging]}>
        <Pressable
          role="button"
          aria-label={`${plaque.kind === "mixed" ? "Mixed review" : label}, ${state}`}
          disabled={locked}
          onPress={tap}
          style={[
            styles.plaque,
            current && styles.current,
            locked && styles.locked,
          ]}
        >
          {locked ? (
            <LockIcon color={wallColors.fadedInk} />
          ) : plaque.kind === "mixed" ? (
            <Text style={[styles.mixed, current && styles.onCurrent]}>
              Mixed
            </Text>
          ) : (
            plaque.kana.map((k) => (
              <Text
                key={k.char}
                style={[
                  styles.kana,
                  current && styles.currentKana,
                  fitted(k.char, current),
                ]}
              >
                {k.char}
              </Text>
            ))
          )}
          {state === "done" && (
            <Animated.View style={[styles.seal, stamping]}>
              <CheckIcon color={colors.card} />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
      {current && (
        <View style={styles.begin}>
          <Text style={styles.beginText}>Begin</Text>
        </View>
      )}
    </View>
  );
}

// A yōon (like きゃ) is drawn smaller, so its two characters fit across the plaque.
function fitted(char: string, current: boolean) {
  const fit = kanaFit(char, 0.72);
  if (fit === 1) return null;
  const base = current ? styles.currentKana : styles.kana;
  return { fontSize: base.fontSize * fit, lineHeight: base.lineHeight * fit };
}

const styles = StyleSheet.create({
  hanger: {
    alignItems: "center",
    width: 60,
  },
  peg: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: wallColors.peg,
  },
  cord: {
    width: 2,
    height: 10,
    backgroundColor: wallColors.cord,
  },
  plaque: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    width: 52,
    height: 82,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.woodDark,
    backgroundColor: colors.wood,
  },
  current: {
    width: 60,
    height: 94,
    borderColor: colors.sumi,
    backgroundColor: colors.sumi,
  },
  locked: {
    borderColor: wallColors.fadedEdge,
    backgroundColor: wallColors.faded,
  },
  kana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    ...jpRoom(20),
    lineHeight: 24,
    color: colors.sumi,
  },
  currentKana: {
    fontSize: 26,
    ...jpRoom(26),
    lineHeight: 30,
    color: colors.card,
  },
  mixed: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.sumi,
  },
  onCurrent: {
    color: colors.card,
  },
  // The vermilion seal on a finished plaque, sitting over its bottom-right corner.
  seal: {
    position: "absolute",
    right: -9,
    bottom: -9,
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.paper,
    backgroundColor: colors.vermilion,
  },
  begin: {
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.sumi,
  },
  beginText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.card,
  },
});
