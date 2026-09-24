import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Karasu } from '@/components/karasu';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts, wallColors } from '@/constants/theme';
import { useRank } from '@/hooks/use-rank';

// The first thing a new learner sees. Karasu introduces himself and says plainly what
// the app is for, so it feels finishable. It's shown until onboarding is finished.
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const rank = useRank();

  // On to choosing a daily goal, which finishes onboarding.
  function enter() {
    router.push('/goal');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      {/* The dojo wall, with a finished-looking plaque and a locked one hanging from it. */}
      <View style={styles.rail} />
      <View style={[styles.plaque, styles.plaqueLeft]}>
        <Text style={styles.plaqueKana}>か</Text>
        <Text style={styles.plaqueKana}>き</Text>
      </View>
      <View style={[styles.plaque, styles.plaqueLocked, styles.plaqueRight]}>
        <Text style={[styles.plaqueKana, styles.plaqueKanaLocked]}>さ</Text>
        <Text style={[styles.plaqueKana, styles.plaqueKanaLocked]}>し</Text>
      </View>

      <View style={styles.body}>
        <Karasu mood="focus" rank={rank} size={170} />
        <Text style={styles.title}>I&apos;m Karasu.</Text>
        <Text style={styles.text}>
          Train with me a few minutes a day and you&apos;ll read every hiragana and katakana. We&apos;ll start with five.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Enter the dojo" onPress={enter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  rail: {
    height: 14,
    backgroundColor: wallColors.rail,
  },
  plaque: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 82,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.woodDark,
    backgroundColor: colors.wood,
  },
  plaqueLeft: {
    left: 22,
    top: 38,
    transform: [{ rotate: '-2deg' }],
  },
  plaqueRight: {
    right: 24,
    top: 44,
    transform: [{ rotate: '2deg' }],
  },
  plaqueLocked: {
    borderColor: colors.edge,
    backgroundColor: colors.line,
  },
  plaqueKana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    lineHeight: 24,
    color: colors.sumi,
  },
  plaqueKanaLocked: {
    color: colors.muted,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  title: {
    marginTop: 10,
    fontFamily: fonts.uiBlack,
    fontSize: 28,
    color: colors.sumi,
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink2,
  },
  footer: {
    paddingHorizontal: 18,
  },
});
