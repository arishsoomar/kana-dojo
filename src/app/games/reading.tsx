import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { LockIcon } from '@/components/lock-icon';
import { colors, fonts } from '@/constants/theme';
import { READING_ROUND, SIGNS_TO_OPEN } from '@/core/reading';
import { useReadingRoom, type RoomSet } from '@/hooks/use-reading';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// The reading room: Japanese as it's written in the world. The places, each with its signs,
// then everyday phrases. A place opens once enough of its signs use only kana you've met,
// and more of them join as you learn more.
export default function ReadingRoomScreen() {
  const insets = useSafeAreaInsets();
  const sets = useReadingRoom();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Reading room</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.intro}>
          Read Japanese the way it&apos;s written up in the world, using only kana you&apos;ve met. A round is{' '}
          {READING_ROUND} questions.
        </Text>
        {sets.map((set) => (
          <SetCard key={set.id} set={set} />
        ))}
      </ScrollView>
    </View>
  );
}

function SetCard({ set }: { set: RoomSet }) {
  const what = set.id === 'phrases' ? 'phrases' : 'signs';
  return (
    <Pressable
      role="button"
      aria-label={`${set.name}. ${set.open ? `${set.ready} ${what} to read` : 'Locked'}`}
      disabled={!set.open}
      onPress={() => router.push({ pathname: '/games/read', params: { set: set.id } })}
      style={[styles.card, !set.open && styles.locked]}>
      <View style={[styles.board, !set.open && styles.boardLocked]}>
        <Text style={[styles.boardKana, { fontSize: boardFontSize(set.kana) }, !set.open && styles.lockedText]} numberOfLines={1}>
          {set.kana}
        </Text>
      </View>
      <View style={styles.grow}>
        <Text style={[styles.name, !set.open && styles.lockedText]}>{set.name}</Text>
        <Text style={styles.sub}>
          {set.open
            ? `${set.ready} of ${set.total} ${what} to read${set.best !== null ? ` · Best ${set.best}/${READING_ROUND}` : ''}`
            : `Opens when ${SIGNS_TO_OPEN} ${what} use only kana you've met (${set.ready} so far)`}
        </Text>
      </View>
      {set.open ? <Text style={styles.chevron}>›</Text> : <LockIcon color={colors.muted} />}
    </Pressable>
  );
}

// The board fits its name on one line: smaller for longer names, like こんにちは.
const BOARD_TEXT_WIDTH = 66;
function boardFontSize(kana: string): number {
  return Math.min(20, Math.floor(BOARD_TEXT_WIDTH / [...kana].length));
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.sumi,
  },
  content: {
    gap: 10,
    paddingHorizontal: 18,
  },
  intro: {
    marginBottom: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  locked: {
    backgroundColor: colors.paper,
  },
  // The place's name in kana, on a small board like a sign.
  board: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 78,
    height: 46,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: colors.indigoDark,
  },
  boardLocked: {
    backgroundColor: colors.line,
  },
  boardKana: {
    fontFamily: fonts.jp,
    color: colors.card,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  lockedText: {
    color: colors.muted,
  },
  sub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  chevron: {
    fontFamily: fonts.uiBold,
    fontSize: 22,
    color: colors.muted,
  },
});
