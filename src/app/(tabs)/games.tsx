import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, duelColors, fonts, rainColors } from '@/constants/theme';
import { bestScore } from '@/core/answers';
import { scrolls } from '@/core/duel';
import { FORGE_MIN_WORDS, readyWords } from '@/core/forge';
import { useProgress } from '@/hooks/use-progress';
import { RAIN_LESSON_ID } from '@/hooks/use-rain';

// The training hall: every game in one place.
export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const best = bestScore(progress, RAIN_LESSON_ID);
  const allScrolls = scrolls(progress);
  const won = allScrolls.filter((s) => s.state === 'won').length;
  const ready = allScrolls.filter((s) => s.state === 'ready').length;
  const words = readyWords(progress, progress.settings.script).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Training hall</Text>

      <View style={styles.grid}>
        <Pressable role="button" aria-label="Kana Rain" onPress={() => router.push('/games/rain')} style={styles.card}>
          <View style={styles.art}>
            <View style={[styles.tag, styles.tagHigh]}>
              <Text style={styles.tagKana}>カ</Text>
            </View>
            <View style={[styles.tag, styles.tagLow]}>
              <Text style={styles.tagKana}>し</Text>
            </View>
          </View>
          <Text style={styles.name}>Kana Rain</Text>
          <Text style={styles.sub}>{best === null ? 'Type them before they land' : `Best ${best.toLocaleString('en-US')}`}</Text>
        </Pressable>

        <Pressable role="button" aria-label="Duels" onPress={() => router.push('/scrolls')} style={styles.card}>
          <View style={[styles.art, styles.duelArt]}>
            <Text style={[styles.duelKana, styles.duelLeft]}>シ</Text>
            <Text style={[styles.duelKana, styles.duelRight]}>ツ</Text>
          </View>
          <Text style={styles.name}>Duels</Text>
          <Text style={styles.sub}>
            {ready > 0 ? `${ready} ready to duel` : `${won} of ${allScrolls.length} scrolls`}
          </Text>
        </Pressable>

        <Pressable role="button" aria-label="Word Forge" onPress={() => router.push('/games/forge')} style={styles.card}>
          <View style={[styles.art, styles.forgeArt]}>
            <View style={styles.forgeBoard}>
              <Text style={styles.forgeWord}>ねこ</Text>
            </View>
          </View>
          <Text style={styles.name}>Word Forge</Text>
          <Text style={styles.sub}>
            {words >= FORGE_MIN_WORDS ? `${words} words to read` : `Opens at ${FORGE_MIN_WORDS} words (${words} so far)`}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    gap: 14,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flexBasis: '45%',
    flexGrow: 1,
    maxWidth: '50%',
    overflow: 'hidden',
    paddingBottom: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  art: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    height: 64,
    marginBottom: 8,
    backgroundColor: rainColors.sky,
  },
  tag: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: rainColors.tagEdge,
    backgroundColor: rainColors.tag,
  },
  tagHigh: {
    width: 30,
    height: 30,
    marginBottom: 12,
  },
  tagLow: {
    width: 26,
    height: 26,
    marginTop: 12,
  },
  tagKana: {
    fontFamily: fonts.jp,
    fontSize: 15,
    color: colors.sumi,
  },
  // A word on a small wooden board, over the wood of a workshop.
  forgeArt: {
    backgroundColor: colors.woodDark,
  },
  forgeBoard: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.sumi,
    backgroundColor: colors.wood,
  },
  forgeWord: {
    fontFamily: fonts.jp,
    fontSize: 20,
    color: colors.sumi,
  },
  duelArt: {
    gap: 0,
    backgroundColor: duelColors.background,
  },
  duelKana: {
    fontFamily: fonts.jp,
    fontSize: 30,
    lineHeight: 38,
    color: colors.vermilion,
  },
  duelLeft: {
    transform: [{ rotate: '-6deg' }],
  },
  duelRight: {
    transform: [{ rotate: '6deg' }],
  },
  name: {
    paddingHorizontal: 10,
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  sub: {
    paddingHorizontal: 10,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
});
