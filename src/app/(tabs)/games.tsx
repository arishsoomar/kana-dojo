import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, rainColors } from '@/constants/theme';

// The training hall: every game in one place. The first version has Kana Rain only.
export default function GamesScreen() {
  const insets = useSafeAreaInsets();

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
          <Text style={styles.sub}>Type them before they land</Text>
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
