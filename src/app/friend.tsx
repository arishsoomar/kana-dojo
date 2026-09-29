import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { BeltIcon } from '@/components/belt-icon';
import { DojoRoom } from '@/components/dojo-room';
import { FlameIcon } from '@/components/flame-icon';
import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts } from '@/constants/theme';
import { friendSeen, seenText } from '@/core/friends';
import { useFriends } from '@/hooks/use-friends';
import { useHaptics } from '@/hooks/use-haptics';
import { useToday } from '@/hooks/use-today';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/friends');
}

// Their Karasu bows back this long after you bow.
const BOW_BACK_MS = 250;

// A friend's dojo, to look around: their room as they last shared it, Karasu in their gear,
// and their rank and streak. Nothing here can be changed, but you can bow (礼), once a day:
// their Karasu bows back, and their dojo shows you bowed. Opened from the friends list.
export default function FriendDojoScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { friends, status, bowedToday, bow } = useFriends();
  const today = useToday();
  const haptics = useHaptics();
  const friend = friends.find((f) => f.userId === id && f.state === 'accepted');
  const summary = friend?.summary ?? null;
  const [bowing, setBowing] = useState(false);
  const [bowBack, setBowBack] = useState<{ kind: 'bow'; id: number } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const bowed = friend !== undefined && bowedToday.includes(friend.userId);

  async function bowToThem() {
    if (!friend || bowing) return;
    setBowing(true);
    setProblem(null);
    haptics.right();
    setTimeout(() => setBowBack((m) => ({ kind: 'bow', id: (m?.id ?? 0) + 1 })), BOW_BACK_MS);
    const outcome = await bow(friend.userId);
    setBowing(false);
    if (outcome === 'missing') setProblem('Bowing needs a one-time setup on the server: run supabase/migrations/20261003000000_bows.sql in the SQL editor.');
    else if (outcome === 'error') setProblem("Couldn't reach the dojo. Check your connection.");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {friend ? `${friend.name}'s dojo` : 'Dojo'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {!friend ? (
          <Text style={styles.body}>{status === 'loading' ? 'Opening the door…' : "You're not friends with them any more."}</Text>
        ) : !summary ? (
          <Text style={styles.body}>{friend.name} hasn&apos;t opened the app since you became friends, so there&apos;s nothing to see yet.</Text>
        ) : (
          <>
            <DojoRoom room={summary.room} rank={summary.rank} gear={summary.gear} move={bowBack} />

            {bowed ? (
              <View style={styles.bowed}>
                <Text style={styles.rei}>礼</Text>
                <Text style={[styles.body, styles.grow]}>You bowed to {friend.name}&apos;s dojo today. They&apos;ll see it in theirs.</Text>
              </View>
            ) : (
              <PrimaryButton label={bowing ? 'Bowing…' : '礼  Bow'} disabled={bowing} onPress={() => void bowToThem()} />
            )}
            {problem && <Text style={styles.error}>{problem}</Text>}

            <View style={styles.rankRow}>
              <BeltIcon belt={summary.rank} width={46} />
              <View style={styles.grow}>
                <Text style={styles.rank}>{capitalize(summary.rank)} belt</Text>
                <Text style={styles.small}>{seenText(friendSeen(summary, today))}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <FlameIcon />
              <Text style={styles.stat}>{summary.streak}</Text>
              <Text style={styles.small}>day streak</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
    gap: 14,
    paddingHorizontal: 18,
  },
  body: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  bowed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rei: {
    fontFamily: fonts.jp,
    fontSize: 28,
    color: colors.vermilion,
  },
  error: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
  rank: {
    fontFamily: fonts.uiBlack,
    fontSize: 20,
    color: colors.sumi,
  },
  small: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  stat: {
    fontFamily: fonts.uiBlack,
    fontSize: 18,
    color: colors.sumi,
  },
});
