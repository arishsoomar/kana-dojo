import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { Karasu } from '@/components/karasu';
import { colors, fonts } from '@/constants/theme';
import { BELTS } from '@/core/boxes';
import { lessonsSince } from '@/core/profile';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// The tournament: weekly leagues against other learners, with divisions named after belts.
// Leagues need other players, which needs accounts (Epic G), so for now this shows your
// division and your own week, and says honestly that leagues come later.
export default function RanksScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const rank = useRank();
  // The time the screen opened; reading the clock during every render isn't allowed.
  const [now] = useState(() => Date.now());
  const thisWeek = lessonsSince(progress, now - WEEK_MS);
  const index = BELTS.indexOf(rank);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <View style={styles.belts}>
        {[BELTS[index - 1], rank, BELTS[index + 1]].map((belt, i) =>
          belt ? (
            <View key={belt} style={i !== 1 && styles.dim}>
              <BeltIcon belt={belt} width={i === 1 ? 72 : 46} />
            </View>
          ) : (
            <View key={`none-${i}`} style={styles.spacer} />
          ),
        )}
      </View>
      <Text style={styles.title}>{rank.charAt(0).toUpperCase() + rank.slice(1)} division</Text>
      <Text style={styles.sub}>Your division follows your rank.</Text>

      <View style={styles.card}>
        <Text style={styles.cardValue}>{thisWeek}</Text>
        <Text style={styles.cardLabel}>
          {thisWeek === 1 ? 'lesson' : 'lessons'}, games and exams finished in the last 7 days
        </Text>
      </View>

      <View style={styles.coach}>
        <Karasu mood="gentle" rank={rank} size={66} />
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>
            Weekly leagues are coming. Each week you&apos;ll train alongside about 30 learners in your division,
            and the top seven move up a belt. They need accounts, which arrive in a later update.
          </Text>
        </View>
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
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  belts: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  dim: {
    opacity: 0.35,
  },
  spacer: {
    width: 46,
  },
  title: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  sub: {
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  card: {
    alignItems: 'center',
    marginTop: 18,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  cardValue: {
    fontFamily: fonts.uiBlack,
    fontSize: 32,
    color: colors.sumi,
  },
  cardLabel: {
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  bubble: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  bubbleText: {
    fontFamily: fonts.uiBold,
    fontSize: 13.5,
    color: colors.sumi,
  },
});
