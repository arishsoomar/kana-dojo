import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { BackHandler, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { ChoiceTile, type TileState } from '@/components/choice-tile';
import { Confetti } from '@/components/confetti';
import { KanaFrame } from '@/components/kana-frame';
import { LeaveDialog } from '@/components/leave-dialog';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { XIcon } from '@/components/x-icon';
import { colors, duelColors, fonts } from '@/constants/theme';
import type { Kana } from '@/core/kana';
import {
  isRoomCode,
  LIVE_MIN_SHARED,
  LIVE_WIN,
  liveOutcome,
  makeRoomCode,
  normalizeRoomCode,
  ROOM_CODE_LENGTH,
  type RoundResult,
} from '@/core/live-duel';
import { useLiveDuel } from '@/hooks/use-live-duel';
import { useRank } from '@/hooks/use-rank';
import { supabase } from '@/storage/supabase';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// Duel a friend, live: start a room and share its code, or join one with a friend's code.
// Each room gets its own key, so a rematch starts fresh.
export default function LiveDuelScreen() {
  const [code, setCode] = useState<string | null>(null);
  if (!code) return <Entrance onRoom={setCode} />;
  return <Room key={code} code={code} onRematch={setCode} />;
}

function Entrance({ onRoom }: { onRoom: (code: string) => void }) {
  const insets = useSafeAreaInsets();
  const [typed, setTyped] = useState('');

  return (
    <View style={[styles.light, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave" onPress={close} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
      </View>
      <View style={styles.middle}>
        <Text style={styles.versus}>対</Text>
        <Text style={styles.title}>Duel a friend</Text>
        <Text style={styles.sub}>
          Race a friend on the same kana, live. The first right answer takes the point, and first to {LIVE_WIN} wins. You
          both need to be in the app.
        </Text>
        {!supabase && <Text style={styles.sub}>Live duels aren&apos;t set up in this version of the app.</Text>}
      </View>
      {supabase && (
        <View style={styles.footer}>
          <PrimaryButton label="Start a room" tone="vermilion" onPress={() => onRoom(makeRoomCode(Math.random))} />
          <Text style={styles.or}>or join a friend&apos;s room</Text>
          <View style={styles.joinRow}>
            <TextField
              value={typed}
              onChangeText={(text) => setTyped(normalizeRoomCode(text).slice(0, ROOM_CODE_LENGTH))}
              placeholder="Code"
              autoCapitalize="characters"
              autoCorrect={false}
              aria-label="Room code"
              style={styles.codeField}
              onSubmitEditing={() => isRoomCode(typed) && onRoom(normalizeRoomCode(typed))}
            />
            <View style={styles.joinButton}>
              <PrimaryButton label="Join" disabled={!isRoomCode(typed)} onPress={() => onRoom(normalizeRoomCode(typed))} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function Room({ code, onRematch }: { code: string; onRematch: (code: string) => void }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const live = useLiveDuel(code, onRematch);
  const { duel, connection, question } = live;
  const [leaving, setLeaving] = useState(false);
  const inPlay = connection === 'open' && (duel.phase === 'countdown' || duel.phase === 'playing' || duel.phase === 'reveal');

  // Android's back button asks first during a duel, like the X.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!inPlay) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [inPlay]);

  const padding = { paddingTop: insets.top, paddingBottom: insets.bottom + 22 };

  // Anything that isn't a duel in progress: a message, and a way out.
  function notice(title: string, body: string, extra?: ReactNode) {
    return (
      <View style={[styles.light, padding]}>
        <View style={styles.middle}>
          <AliveKarasu mood="gentle" rank={rank} size={96} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{body}</Text>
        </View>
        <View style={styles.footer}>
          {extra}
          <PrimaryButton label="Done" tone="light" onPress={close} />
        </View>
      </View>
    );
  }

  if (connection === 'unavailable') return notice('Not available', "Live duels aren't set up in this version of the app.");
  if (connection === 'error') return notice("Couldn't connect", 'Check your connection and try again.');
  if (connection === 'full') return notice('That room is full', 'It already has two players. Ask your friend for their code again.');
  if (duel.phase === 'over') return <End live={live} rank={rank} padding={padding} />;
  if (connection === 'gone') return notice('Your friend left', 'The duel ended without a result.');
  if (duel.phase === 'too-few') {
    return notice(
      'Not enough kana in common',
      `You need ${LIVE_MIN_SHARED} kana you've both met, and you have ${live.shared ?? 0}. Learn a few more, then try again.`,
    );
  }

  if (connection === 'connecting' || duel.phase === 'waiting') {
    return (
      <View style={[styles.light, padding]}>
        <View style={styles.top}>
          <Pressable role="button" aria-label="Leave" onPress={close} hitSlop={10}>
            <XIcon color={colors.ink2} />
          </Pressable>
        </View>
        <View style={styles.middle}>
          <Text style={styles.sub}>{connection === 'connecting' ? 'Opening the room…' : 'Waiting for your friend. Your room code is'}</Text>
          <Text style={styles.code} aria-label={`Room code ${[...code].join(' ')}`}>
            {code}
          </Text>
          <Text style={styles.sub}>Your friend opens Duel a friend, taps Join and types this code.</Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label="Send the code"
            onPress={() => {
              Share.share({ message: `Duel me in Kana Dojo! Open Games, then Duel a friend, and join room ${code}.` }).catch(() => {
                // Sharing isn't available everywhere (some web browsers); the code is on screen anyway.
              });
            }}
          />
        </View>
      </View>
    );
  }

  if (duel.phase === 'countdown') {
    return (
      <View style={[styles.dark, styles.centered, padding]}>
        <StatusBar style="light" />
        <Text style={styles.soft}>Your friend is here</Text>
        <Text style={styles.countdown}>{live.countdown}</Text>
        <Text style={styles.soft}>First to {LIVE_WIN}</Text>
      </View>
    );
  }

  if (!question) return null;
  const reveal = duel.phase === 'reveal' ? duel.lastResult : null;

  return (
    <View style={[styles.dark, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave the duel" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={duelColors.soft} />
        </Pressable>
        <View style={styles.chip}>
          <Text style={styles.chipText}>Live</Text>
        </View>
        <Text style={styles.roomText}>Room {code}</Text>
      </View>

      <View style={styles.body}>
        <Score label="You" points={duel.score.mine} color={colors.vermilion} took={reveal === 'mine' || reveal === 'both'} />
        <Score label="Your friend" points={duel.score.theirs} color={colors.gold} took={reveal === 'theirs' || reveal === 'both'} />

        <View style={styles.kana}>
          <KanaFrame char={question.kana.char} size={128} />
        </View>

        <View style={styles.choices}>
          {question.choices.map((choice) => (
            <ChoiceTile
              key={choice.char}
              label={choice.romaji[0] ?? ''}
              state={tileState(choice, question.kana, live.picked, reveal !== null)}
              disabled={duel.myAttempt !== null}
              onPress={() => live.answer(choice)}
            />
          ))}
        </View>
        <Text style={[styles.soft, styles.status]}>{statusText(reveal, duel.myAttempt?.correct ?? null)}</Text>
      </View>

      <LeaveDialog
        visible={leaving}
        title="Leave the duel?"
        body="It ends for both of you, with no result."
        onStay={() => setLeaving(false)}
        onLeave={close}
      />
    </View>
  );
}

function End({ live, rank, padding }: { live: ReturnType<typeof useLiveDuel>; rank: ReturnType<typeof useRank>; padding: object }) {
  const { score } = live.duel;
  const outcome = liveOutcome(score);
  const title = outcome === 'won' ? 'You won!' : outcome === 'lost' ? 'Your friend won' : outcome === 'draw' ? 'A draw' : 'Duel over';
  return (
    <View style={[styles.light, padding]}>
      <View style={styles.middle}>
        <AliveKarasu mood={outcome === 'won' ? 'cheer' : 'proud'} rank={rank} size={110} move={outcome === 'won' ? { kind: 'cheer', id: 1 } : null} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.final}>
          {score.mine}–{score.theirs}
        </Text>
        {live.connection === 'gone' && <Text style={styles.sub}>Your friend has left the room.</Text>}
      </View>
      <View style={styles.footer}>
        {live.connection === 'open' && <PrimaryButton label="Rematch" tone="vermilion" onPress={live.playAgain} />}
        <PrimaryButton label="Done" tone="light" onPress={close} />
      </View>
      {outcome === 'won' && <Confetti />}
    </View>
  );
}

function Score({ label, points, color, took }: { label: string; points: number; color: string; took: boolean }) {
  return (
    <View style={styles.score}>
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreLabel, took && { color }]}>
          {label}
          {took ? ' +1' : ''}
        </Text>
        <Text style={styles.scorePoints}>
          {points} / {LIVE_WIN}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(points / LIVE_WIN) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// Green or red on this player's pick straight away, and the right answer marked once the round
// is settled (it's already green if they picked it).
function tileState(choice: Kana, answer: Kana, picked: string | null, revealed: boolean): TileState {
  if (choice.char === picked) return choice === answer ? 'correct' : 'wrong';
  if (revealed && choice === answer) return 'missed';
  return 'idle';
}

function statusText(reveal: RoundResult | null, myCorrect: boolean | null): string {
  if (reveal === 'mine') return 'Your point!';
  if (reveal === 'theirs') return 'Your friend was quicker.';
  if (reveal === 'both') return 'A tie: a point each.';
  if (reveal === 'none') return 'Nobody got that one.';
  if (myCorrect === true) return 'Right! Waiting for your friend…';
  if (myCorrect === false) return 'Not that one. Waiting for your friend…';
  return ' ';
}

const styles = StyleSheet.create({
  light: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  dark: {
    flex: 1,
    backgroundColor: duelColors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 40,
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  versus: {
    fontFamily: fonts.jp,
    fontSize: 64,
    lineHeight: 76,
    color: colors.vermilion,
  },
  title: {
    marginTop: 6,
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
  footer: {
    gap: 10,
    paddingHorizontal: 18,
  },
  or: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  joinRow: {
    flexDirection: 'row',
    gap: 10,
  },
  codeField: {
    flex: 1,
    letterSpacing: 6,
    textAlign: 'center',
  },
  joinButton: {
    width: 110,
  },
  code: {
    marginVertical: 6,
    fontFamily: fonts.uiBlack,
    fontSize: 56,
    letterSpacing: 10,
    color: colors.sumi,
  },
  countdown: {
    fontFamily: fonts.uiBlack,
    fontSize: 96,
    color: colors.card,
  },
  soft: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: duelColors.soft,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 6,
    backgroundColor: colors.vermilion,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.card,
  },
  roomText: {
    marginLeft: 'auto',
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: duelColors.soft,
  },
  body: {
    flex: 1,
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  score: {
    gap: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabel: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.card,
  },
  scorePoints: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: duelColors.soft,
  },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: duelColors.track,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  kana: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  status: {
    textAlign: 'center',
  },
  final: {
    fontFamily: fonts.uiBlack,
    fontSize: 38,
    color: colors.sumi,
  },
});
