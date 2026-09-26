import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { colors, fonts, wallColors } from "@/constants/theme";
import type { Plaque, PlaqueState } from "@/core/path";

import { CheckIcon } from "./check-icon";
import { LockIcon } from "./lock-icon";

type Props = {
  plaque: Plaque;
  state: PlaqueState;
  onPress: () => void;
  stamp?: boolean; // just finished: the seal stamps down
  reveal?: number | null; // its row just opened: it flips over, after this many others
};

const useNativeDriver = Platform.OS !== "web";
// When the seal lands (the Learn screen buzzes then), and the gap between flipping plaques.
export const STAMP_LANDS_MS = 420;
const REVEAL_STAGGER_MS = 110;
// A tapped plaque swings on its cord; the lesson opens this long after the tap.
const SWING_OPENS_AFTER_MS = 180;

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
  const [seal] = useState(
    () => new Animated.Value(stamp && !reduceMotion ? 0 : 1),
  );
  // 1 = facing the front. It starts turned edge-on only when it's about to flip.
  const [face] = useState(
    () => new Animated.Value(reveal !== null && !reduceMotion ? 0 : 1),
  );
  // -1 to 1: how far it has swung to either side.
  const [swing] = useState(() => new Animated.Value(0));

  function tap() {
    if (reduceMotion) {
      onPress();
      return;
    }
    const to = (toValue: number, duration: number) =>
      Animated.timing(swing, {
        toValue,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver,
      });
    Animated.sequence([
      to(1, 110),
      to(-0.6, 160),
      to(0.3, 140),
      to(0, 120),
    ]).start();
    setTimeout(onPress, SWING_OPENS_AFTER_MS);
  }

  useEffect(() => {
    if (!stamp || reduceMotion) return;
    seal.setValue(0);
    const drop = Animated.timing(seal, {
      toValue: 1,
      duration: 300,
      delay: STAMP_LANDS_MS - 300,
      easing: Easing.out(Easing.back(2.5)),
      useNativeDriver,
    });
    drop.start();
    return () => drop.stop();
  }, [stamp, seal, reduceMotion]);

  useEffect(() => {
    if (reveal === null || reduceMotion) return;
    face.setValue(0);
    const flip = Animated.timing(face, {
      toValue: 1,
      duration: 380,
      delay: 250 + reveal * REVEAL_STAGGER_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    });
    flip.start();
    return () => flip.stop();
  }, [reveal, face, reduceMotion]);
  const label =
    plaque.kind === "mixed" ? "Mixed" : plaque.kana.map((k) => k.char).join("");

  return (
    <View style={styles.hanger}>
      <View style={styles.peg} />
      <View style={styles.cord} />
      {/* Hangs from the top, so it swings and flips around the peg. */}
      <Animated.View
        style={{
          transformOrigin: "top",
          transform: [
            { perspective: 600 },
            {
              rotate: swing.interpolate({
                inputRange: [-1, 1],
                outputRange: ["-7deg", "7deg"],
              }),
            },
            {
              rotateY: face.interpolate({
                inputRange: [0, 1],
                outputRange: ["90deg", "0deg"],
              }),
            },
          ],
        }}
      >
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
                style={[styles.kana, current && styles.currentKana]}
              >
                {k.char}
              </Text>
            ))
          )}
          {state === "done" && (
            <Animated.View
              style={[
                styles.seal,
                {
                  opacity: seal,
                  transform: [
                    {
                      scale: seal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2.4, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
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
    lineHeight: 24,
    color: colors.sumi,
  },
  currentKana: {
    fontSize: 26,
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
