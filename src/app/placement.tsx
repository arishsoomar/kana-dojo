import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { KanaFrame } from '@/components/kana-frame';
import { Karasu } from '@/components/karasu';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { finishOnboarding } from '@/core/answers';
import { KANA, ROWS, type Kana, type RowId } from '@/core/kana';
import { usePlacement } from '@/hooks/use-placement';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

// The first hiragana of a row, e.g. "か" for the ka row.
function rowChar(row: RowId | undefined): string {
  return KANA.find((k) => k.script === 'hiragana' && k.row === row)?.char ?? '';
}

// The grading test during onboarding. Rows answered well are skipped in the learn path.
export default function PlacementScreen() {
  const insets = useSafeAreaInsets();
  const { updateProgress, currentProgress } = useProgress();
  const rank = useRank();
  const test = usePlacement();

  function enter() {
    updateProgress(finishOnboarding(currentProgress()));
    router.replace('/');
  }

  if (test.done) {
    const placed = test.placedRows;
    const nextRow = ROWS[placed.length];
    return (
      <View style={[styles.screen, styles.result, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.resultBody}>
          <Karasu mood={placed.length > 0 ? 'cheer' : 'gentle'} rank={rank} size={146} />
          <Text style={styles.resultTitle}>
            {placed.length === 0
              ? "We'll start at the beginning"
              : `You know ${placed.length} ${placed.length === 1 ? 'row' : 'rows'}`}
          </Text>
          <Text style={styles.resultText}>
            {placed.length === 0 ? (
              'No problem: the あ row is where everyone starts.'
            ) : (
              <>
                <Text style={styles.kana}>{placed.map(rowChar).join('、')}</Text>
                {placed.length === 1 ? ' starts' : ' start'} at green belt.
                {nextRow ? (
                  <>
                    {' '}
                    You&apos;ll begin with the <Text style={styles.kana}>{rowChar(nextRow)}</Text> row.
                  </>
                ) : (
                  ' Every hiragana row is open.'
                )}
              </>
            )}
          </Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Enter the dojo" onPress={enter} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Stop the test" onPress={test.stop} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Grading test</Text>
        <Text style={styles.rowLabel}>
          <Text style={styles.kana}>{rowChar(test.row)}</Text> row · {test.questionInRow}/{test.rowLength}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.hint}>Answer what you know. Skip ahead with the X any time.</Text>
        {test.kana && <KanaFrame char={test.kana.char} />}
        <View style={styles.choices}>
          {test.choices.map((choice) => (
            <ChoiceTile
              key={choice.char}
              label={choice.romaji[0]}
              state={tileState(choice, test.flash)}
              disabled={test.flash !== null}
              onPress={() => test.answer(choice)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// Only the picked answer shows right or wrong.
function tileState(choice: Kana, flash: { guess: Kana; correct: boolean } | null): TileState {
  if (!flash || flash.guess !== choice) return 'idle';
  return flash.correct ? 'correct' : 'wrong';
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
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  rowLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
  },
  hint: {
    marginBottom: 12,
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginBottom: 12,
  },
  result: {
    justifyContent: 'space-between',
  },
  resultBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  resultTitle: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  resultText: {
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
