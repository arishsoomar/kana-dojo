import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { CalendarIcon } from '@/components/calendar-icon';
import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { Confetti } from '@/components/confetti';
import { FlameIcon } from '@/components/flame-icon';
import { KanaFrame } from '@/components/kana-frame';
import { LeaveDialog } from '@/components/leave-dialog';
import { PrimaryButton } from '@/components/primary-button';
import { ShareIcon } from '@/components/share-icon';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import type { Kana } from '@/core/kana';
import { KATA_LENGTH, kataMet, kataNumber, kataOpen, kataResult, kataShareText, type KataMark, type KataResult } from '@/core/kata';
import { useKata } from '@/hooks/use-kata';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useStreak } from '@/hooks/use-streak';
import { localDay } from '@/hooks/use-today';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// The daily kata: 20 kana, one attempt. Opening it once it's been played shows the result.
export default function KataScreen() {
  const { progress } = useProgress();
  const [day] = useState(() => localDay(Date.now()));
  const [started, setStarted] = useState(false);
  const done = kataResult(progress, day);

  if (started) return <Playing />;
  if (done) return <Result result={done} />;
  return <Entrance day={day} onStart={() => setStarted(true)} />;
}

function Entrance({ day, onStart }: { day: string; onStart: () => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const open = kataOpen(progress);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave the daily kata" onPress={leave} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
      </View>
      <View style={styles.middle}>
        <View style={styles.badge}>
          <CalendarIcon size={40} />
        </View>
        <Text style={styles.title}>Daily kata #{kataNumber(day)}</Text>
        {open ? (
          <Text style={styles.sub}>
            {KATA_LENGTH} kana, one attempt. Everyone gets today&apos;s kana in the same order. The clock only runs while you
            answer.
          </Text>
        ) : (
          <Text style={styles.sub}>
            Meet {KATA_LENGTH} kana to open the daily kata. You&apos;ve met {kataMet(progress)} so far.
          </Text>
        )}
      </View>
      <View style={styles.footer}>
        {open ? <PrimaryButton label="Begin" onPress={onStart} /> : <PrimaryButton label="Back to the hall" onPress={leave} />}
      </View>
    </View>
  );
}

function Playing() {
  const insets = useSafeAreaInsets();
  const kata = useKata();
  const { question, picked, result } = kata;
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X. Once it's over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  if (result) return <Result result={result} fresh />;
  if (!question) return null;

  function tileState(choice: Kana): TileState {
    if (!picked || !question) return 'idle';
    if (choice.char === question.kana.char) return picked.char === choice.char ? 'correct' : 'missed';
    return picked.char === choice.char ? 'wrong' : 'idle';
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave the daily kata" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((kata.index + (picked ? 1 : 0)) / kata.questions.length) * 100}%` }]} />
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{(kata.ms / 1000).toFixed(1)}s</Text>
        </View>
      </View>

      <Text style={styles.count}>
        {kata.index + 1} of {kata.questions.length}
      </Text>
      <View style={styles.frame}>
        <KanaFrame char={question.kana.char} />
      </View>

      <View style={styles.choices}>
        {question.choices.map((choice) => (
          <ChoiceTile
            key={choice.char}
            label={choice.romaji[0] ?? ''}
            state={tileState(choice)}
            disabled={picked !== null}
            onPress={() => kata.answer(choice)}
          />
        ))}
      </View>

      <LeaveDialog
        visible={leaving}
        title="Leave the daily kata?"
        body="There's one attempt a day. Kana you haven't answered will count as missed."
        onStay={() => setLeaving(false)}
        onLeave={() => {
          kata.giveUp();
          leave();
        }}
      />
    </View>
  );
}

// The day's result. `fresh` when it's just been played, for Karasu's cheer.
function Result({ result, fresh = false }: { result: KataResult; fresh?: boolean }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const streak = useStreak();
  const perfect = result.right === result.marks.length;

  async function share() {
    try {
      await Share.share({ message: kataShareText(result) });
    } catch {
      // Sharing isn't available everywhere (some web browsers); there's nothing more to do.
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back to the hall" onPress={leave} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
      </View>
      <View style={styles.middle}>
        <AliveKarasu mood={perfect ? 'cheer' : 'proud'} rank={rank} size={98} move={fresh ? { kind: 'cheer', id: 1 } : null} />
        <Text style={styles.number}>Daily kata #{result.number}</Text>
        <Text style={styles.score}>
          {result.right} / {result.marks.length}
        </Text>
        <Text style={styles.sub}>in {(result.ms / 1000).toFixed(1)} seconds</Text>

        <View style={styles.grid} accessibilityLabel={gridLabel(result.marks)}>
          {result.marks.map((mark, i) => (
            <View key={i} style={[styles.square, squareStyles[mark]]} />
          ))}
        </View>
        <View style={styles.legend}>
          {(['fast', 'slow', 'missed'] as const).map((mark) => (
            <View key={mark} style={styles.legendItem}>
              <View style={[styles.legendSquare, squareStyles[mark]]} />
              <Text style={styles.legendText}>{mark}</Text>
            </View>
          ))}
        </View>
        {streak.current > 0 && (
          <View style={styles.streak}>
            <FlameIcon size={14} />
            <Text style={styles.streakText}>
              {streak.current} {streak.current === 1 ? 'day' : 'days'}
            </Text>
          </View>
        )}
      </View>
      <View style={[styles.footer, styles.endButtons]}>
        <Pressable role="button" onPress={share} style={styles.shareButton}>
          <ShareIcon />
          <Text style={styles.shareText}>Share result</Text>
        </Pressable>
        <PrimaryButton label="Back to the hall" tone="light" onPress={leave} />
      </View>
      {fresh && perfect && <Confetti />}
    </View>
  );
}

function gridLabel(marks: readonly KataMark[]): string {
  const count = (mark: KataMark) => marks.filter((m) => m === mark).length;
  return `${count('fast')} fast, ${count('slow')} slow, ${count('missed')} missed`;
}

const SQUARE = 30;

const squareStyles = StyleSheet.create({
  fast: { backgroundColor: colors.pine },
  slow: { backgroundColor: colors.gold },
  missed: { backgroundColor: colors.vermilion },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 40,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  track: {
    flex: 1,
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.edge,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.sumi,
  },
  chip: {
    minWidth: 58,
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    color: colors.sumi,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: colors.sumi,
  },
  title: {
    marginTop: 10,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    textAlign: 'center',
    color: colors.sumi,
  },
  sub: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.ink2,
  },
  count: {
    paddingHorizontal: 18,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  frame: {
    flex: 1,
    padding: 18,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 18,
  },
  number: {
    marginTop: 4,
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  score: {
    fontFamily: fonts.uiBlack,
    fontSize: 38,
    lineHeight: 42,
    color: colors.sumi,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    width: SQUARE * 5 + 7 * 4,
    marginTop: 12,
  },
  square: {
    width: SQUARE,
    height: SQUARE,
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.vermilionLight,
  },
  streakText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  footer: {
    paddingHorizontal: 18,
  },
  endButtons: {
    gap: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.sumi,
  },
  shareText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.card,
  },
});
