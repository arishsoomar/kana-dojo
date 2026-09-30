import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrammarPractice } from '@/components/grammar-practice';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { useGrammarReview } from '@/hooks/use-grammar';
import { useRank } from '@/hooks/use-rank';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

// Reviewing grammar: a few exercises from each grammar point due today, each point then
// scheduled by how they went.
export default function GrammarReviewScreen() {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const run = useGrammarReview();
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X, until it's over.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (run.result || !run.ready) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [run.result, run.ready]);

  if (!run.ready) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.emptyTitle}>Nothing to review</Text>
        <Text style={styles.emptyText}>Every grammar point due today is done. Finished lessons come back here, just before you&apos;d forget them.</Text>
        <PrimaryButton label="Back" onPress={leave} />
      </View>
    );
  }

  if (run.result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={run.result.summary}
          onContinue={leave}
          title="Review done"
          headline={{ label: 'Right', value: `${run.result.right}/${run.result.total}` }}
          note={`${run.points} grammar ${run.points === 1 ? 'point' : 'points'} reviewed`}
          rank={rank}
          celebrate={run.result.right === run.result.total}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable role="button" aria-label="Leave review" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${run.fraction * 100}%` }]} />
        </View>
      </View>
      <GrammarPractice run={run} heading={run.lesson ? `Review: ${run.lesson.title}` : undefined} />
      <LeaveDialog
        visible={leaving}
        onStay={() => setLeaving(false)}
        onLeave={leave}
        title="Stop reviewing?"
        body="Nothing from this review is saved until it's finished."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  empty: {
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    fontFamily: fonts.uiBlack,
    fontSize: 22,
    color: colors.sumi,
  },
  emptyText: {
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink2,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  track: {
    flex: 1,
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.indigo,
  },
});
