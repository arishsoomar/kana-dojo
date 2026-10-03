import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, duelColors, fonts, jpRoom, memoryColors, rainColors } from '@/constants/theme';
import { bestScore } from '@/core/answers';
import { scrolls } from '@/core/duel';
import { dungeonId } from '@/core/dungeon';
import { FORGE_MIN_WORDS, readyWords } from '@/core/forge';
import { KATA_LENGTH, kataMet, kataNumber, kataOpen } from '@/core/kata';
import { fewestMoves } from '@/core/memory';
import { taikoId } from '@/core/taiko';
import { unlockedKana } from '@/core/unlock';
import { BrushIcon } from '@/components/brush-icon';
import { CalendarIcon } from '@/components/calendar-icon';
import { CardsIcon } from '@/components/cards-icon';
import { DrumIcon } from '@/components/drum-icon';
import { MonIcon } from '@/components/mon-icon';
import { PlayIcon } from '@/components/play-icon';
import { Yokai } from '@/components/yokai';
import { useKataCard } from '@/hooks/use-kata';
import { useReadingRoom } from '@/hooks/use-reading';
import { useMon } from '@/hooks/use-mon';
import { useProgress } from '@/hooks/use-progress';
import { supabase } from '@/storage/supabase';
import { RAIN_LESSON_ID } from '@/hooks/use-rain';

// The training hall: every game in one place.
export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const mon = useMon();
  const kata = useKataCard();
  const readingOpen = useReadingRoom().filter((s) => s.open).length;
  const kataReady = kataOpen(progress);
  const best = bestScore(progress, RAIN_LESSON_ID);
  const allScrolls = scrolls(progress);
  const won = allScrolls.filter((s) => s.state === 'won').length;
  const ready = allScrolls.filter((s) => s.state === 'ready').length;
  const words = readyWords(progress, progress.settings.script).length;
  // The deeper of the two scripts' best runs.
  // The better of the two scripts' Taiko drill scores, and whether either is open yet.
  const taikoBest = Math.max(bestScore(progress, taikoId('hiragana')) ?? 0, bestScore(progress, taikoId('katakana')) ?? 0);
  const taikoOpen = (['hiragana', 'katakana'] as const).some((s) => unlockedKana(progress, s).some((k) => k.row === 'ta'));
  // The fewest moves in any memory match mode.
  const fewest = (['hiragana', 'katakana', 'both'] as const)
    .map((mode) => fewestMoves(progress, mode))
    .filter((m): m is number => m !== null)
    .reduce<number | null>((best, m) => (best === null || m < best ? m : best), null);
  const deepest = Math.max(bestScore(progress, dungeonId('hiragana')) ?? 0, bestScore(progress, dungeonId('katakana')) ?? 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Training hall</Text>
        {/* Mon, from the mock's header: tap to spend them in the supply shed. */}
        <Pressable role="button" aria-label={`${mon.balance} mon. Open the supply shed`} onPress={() => router.push('/shed')} style={styles.mon}>
          <MonIcon />
          <Text style={styles.monText}>{mon.balance}</Text>
        </Pressable>
      </View>

      {/* The daily kata, from the mock: today's number, and whether it's been played. */}
      <Pressable role="button" aria-label={`Daily kata number ${kataNumber(kata.today)}`} onPress={() => router.push('/games/kata')} style={styles.kata}>
        <View style={styles.kataBadge}>
          <CalendarIcon />
        </View>
        <View style={styles.kataText}>
          <Text style={styles.kataName}>Daily kata #{kataNumber(kata.today)}</Text>
          <Text style={styles.kataSub}>
            {kata.result
              ? `Done: ${kata.result.right}/${kata.result.marks.length}. Next in ${kata.hoursLeft}h`
              : kataReady
                ? `${KATA_LENGTH} kana, one attempt. Resets in ${kata.hoursLeft}h`
                : `Opens at ${KATA_LENGTH} kana met (${kataMet(progress)} so far)`}
          </Text>
        </View>
        {kataReady && !kata.result && (
          <View style={styles.kataPlay}>
            <PlayIcon />
          </View>
        )}
      </Pressable>

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

        {/* Live duels need Supabase, so the card only shows when it's set up. */}
        {supabase && (
          <Pressable role="button" aria-label="Duel a friend" onPress={() => router.push('/live')} style={styles.card}>
            <View style={[styles.art, styles.duelArt]}>
              <Text style={styles.versus}>対</Text>
            </View>
            <Text style={styles.name}>Duel a friend</Text>
            <Text style={styles.sub}>Live, first to 7</Text>
          </Pressable>
        )}

        <Pressable role="button" aria-label="Yokai dungeon" onPress={() => router.push('/games/dungeon')} style={styles.card}>
          <View style={[styles.art, styles.dungeonArt]}>
            <Yokai char="ね" size={52} />
          </View>
          <Text style={styles.name}>Yokai dungeon</Text>
          <Text style={styles.sub}>{deepest > 0 ? `Deepest: floor ${deepest}` : 'Read them before they attack'}</Text>
        </Pressable>

        <Pressable role="button" aria-label="Memory match" onPress={() => router.push('/games/memory')} style={styles.card}>
          <View style={[styles.art, styles.memoryArt]}>
            <CardsIcon color={colors.woodDark} />
          </View>
          <Text style={styles.name}>Memory match</Text>
          <Text style={styles.sub}>{fewest !== null ? `Best: ${fewest} moves` : 'Find the pairs'}</Text>
        </Pressable>

        <Pressable role="button" aria-label="Taiko drill" onPress={() => router.push('/games/taiko')} style={styles.card}>
          <View style={[styles.art, styles.memoryArt]}>
            <DrumIcon size={34} />
          </View>
          <Text style={styles.name}>Taiko drill</Text>
          <Text style={styles.sub}>
            {!taikoOpen ? 'Opens at the た row' : taikoBest > 0 ? `Best: ${taikoBest.toLocaleString('en-US')}` : 'Hit them on the beat'}
          </Text>
        </Pressable>

        <Pressable role="button" aria-label="Calligraphy" onPress={() => router.push('/games/calligraphy')} style={styles.card}>
          <View style={[styles.art, styles.calligraphyArt]}>
            <Text style={styles.calligraphyKana}>か</Text>
            <BrushIcon color={colors.goldDark} />
          </View>
          <Text style={styles.name}>Calligraphy</Text>
          <Text style={styles.sub}>Stroke practice</Text>
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

        <Pressable role="button" aria-label="Reading room" onPress={() => router.push('/games/reading')} style={styles.card}>
          <View style={[styles.art, styles.readingArt]}>
            {/* A station sign: でぐち, "exit". */}
            <View style={styles.readingSign}>
              <Text style={styles.readingKana}>でぐち</Text>
            </View>
          </View>
          <Text style={styles.name}>Reading room</Text>
          <Text style={styles.sub}>{readingOpen > 0 ? `Signs and phrases, ${readingOpen} open` : 'Opens as you meet more kana'}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  monText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  kata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.sumi,
  },
  kataBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: colors.nightRaised,
  },
  kataText: {
    flex: 1,
  },
  kataName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.card,
  },
  kataSub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12.5,
    color: colors.muted,
  },
  kataPlay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
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
    ...jpRoom(15),
    color: colors.sumi,
  },
  calligraphyArt: {
    backgroundColor: colors.goldLight,
  },
  calligraphyKana: {
    fontFamily: fonts.jp,
    fontSize: 28,
    ...jpRoom(28),
    color: colors.gold,
  },
  memoryArt: {
    backgroundColor: memoryColors.table,
  },
  dungeonArt: {
    backgroundColor: colors.night,
  },
  // A word on a small wooden board, over the wood of a workshop.
  readingArt: {
    backgroundColor: colors.indigoLight,
  },
  readingSign: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: colors.indigoDark,
  },
  readingKana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    ...jpRoom(20),
    color: colors.card,
  },
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
    ...jpRoom(20),
    color: colors.sumi,
  },
  duelArt: {
    gap: 0,
    backgroundColor: duelColors.background,
  },
  duelKana: {
    fontFamily: fonts.jp,
    fontSize: 30,
    ...jpRoom(30),
    lineHeight: 38,
    color: colors.vermilion,
  },
  versus: {
    fontFamily: fonts.jp,
    fontSize: 34,
    ...jpRoom(34),
    lineHeight: 42,
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
