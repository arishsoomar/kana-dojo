import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltCeremony } from '@/components/belt-ceremony';
import { BeltIcon } from '@/components/belt-icon';
import { BulbIcon } from '@/components/bulb-icon';
import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { KanaFrame } from '@/components/kana-frame';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import { awardedBelt, EXAM_LENGTH, EXAM_PASS, examDue } from '@/core/exam';
import { overallRank } from '@/core/rank';
import { KANA, ROWS, type Kana, type RowId, type Script } from '@/core/kana';
import { unlockedKana } from '@/core/unlock';
import { useExam } from '@/hooks/use-exam';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// `/exam?script=hiragana&row=ka` takes that row's due belt exam, if it has one.
export default function ExamScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ script?: string; row?: string }>();
  const { progress } = useProgress();
  const script: Script = params.script === 'katakana' ? 'katakana' : 'hiragana';
  const row = ROWS.find((r) => r === params.row);
  // The exam is fixed when the screen opens, even though passing it changes what's due.
  const [belt] = useState(() => (row ? examDue(progress, script, row) : null));

  if (!row || !belt) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.emptyText}>{"There's no belt exam to take here right now."}</Text>
        <PrimaryButton label="Back" onPress={close} />
      </View>
    );
  }
  return <Exam script={script} row={row} belt={belt} />;
}

// The first kana of a row in a script, e.g. "か" for the ka row, or null if there's no such row.
function rowChar(script: Script, row: RowId | undefined): string | null {
  return KANA.find((k) => k.script === script && k.row === row)?.char ?? null;
}

function Exam({ script, row, belt }: { script: Script; row: RowId; belt: Belt }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const exam = useExam(script, row, belt);
  const rank = useRank();
  const rowName = rowChar(script, row) ?? row;
  const beltName = `${belt} belt`;
  const nextRow = ROWS[ROWS.indexOf(row) + 1];
  // Remembered from before the exam, for the ceremony: the belt the row had, and whether
  // the next row was already open.
  const [before] = useState(() => ({
    belt: awardedBelt(progress, script, row),
    nextOpen: unlockedKana(progress, script).some((k) => k.row === nextRow),
    rank: overallRank(progress),
  }));

  if (exam.result?.status === 'passed') {
    const nextOpenNow = unlockedKana(progress, script).some((k) => k.row === nextRow);
    return (
      <BeltCeremony
        belt={belt}
        from={before.belt}
        rowChar={rowName}
        correct={exam.result.correct}
        total={EXAM_LENGTH}
        nextRowChar={nextOpenNow && !before.nextOpen ? rowChar(script, nextRow) : null}
        rank={rank}
        fromRank={before.rank}
        onDone={close}
      />
    );
  }

  // Not passed: no ceremony, just the result and a retake.
  if (exam.result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          title="Not this time"
          headline={{ label: 'Correct', value: `${exam.result.correct}/${EXAM_LENGTH}` }}
          note={`You need ${EXAM_PASS}. Retake it right away; nothing is lost.`}
          summary={exam.result.summary}
          secondary={{ label: 'Retake', onPress: exam.retake }}
          onContinue={close}
          rank={rank}
        />
      </View>
    );
  }

  const missesLeft = EXAM_LENGTH - EXAM_PASS - exam.misses;
  const seconds = Math.ceil(exam.remainingMs / 1000);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave exam" onPress={close} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Belt exam</Text>
        <View style={styles.timer} aria-label={`${seconds} seconds left`}>
          <Text style={styles.timerText}>
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <View>
            <Text style={styles.sub}>
              <Text style={styles.kana}>{rowName}</Text> row, {beltName}
            </Text>
            <Text style={styles.score}>
              {exam.correct} of {EXAM_LENGTH} correct
            </Text>
          </View>
          <BeltIcon belt={belt} width={62} />
        </View>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(exam.correct / EXAM_LENGTH) * 100}%` }]} />
        </View>
        <View style={styles.markRow}>
          <Text style={styles.mark}>
            Pass mark: {EXAM_PASS} of {EXAM_LENGTH}
          </Text>
          <Text style={styles.mark}>
            {missesLeft} {missesLeft === 1 ? 'miss' : 'misses'} left
          </Text>
        </View>

        {exam.kana && <KanaFrame char={exam.kana.char} />}

        <View style={styles.choices}>
          {exam.choices.map((choice) => (
            <ChoiceTile
              key={choice.char}
              label={choice.romaji[0]}
              state={tileState(choice, exam.flash)}
              disabled={exam.flash !== null}
              onPress={() => exam.answer(choice)}
            />
          ))}
        </View>

        <View style={styles.hint}>
          <BulbIcon size={16} />
          <Text style={styles.hintText}>No hints during an exam. Fail and you can retake it right away.</Text>
        </View>
      </View>
    </View>
  );
}

// Only the picked answer shows right or wrong; the correct one isn't revealed (no hints).
function tileState(choice: Kana, flash: { guess: Kana; correct: boolean } | null): TileState {
  if (!flash || flash.guess !== choice) return 'idle';
  return flash.correct ? 'correct' : 'wrong';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  empty: {
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    textAlign: 'center',
    color: colors.sumi,
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
  timer: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.sumi,
  },
  timerText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.card,
  },
  body: {
    flex: 1,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  score: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 17,
    color: colors.sumi,
  },
  track: {
    height: 8,
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.edge,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.pine,
  },
  markRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 14,
  },
  mark: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  hintText: {
    flex: 1,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
});
