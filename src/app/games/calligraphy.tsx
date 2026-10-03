import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AliveKarasu } from '@/components/alive-karasu';
import { BrushIcon } from '@/components/brush-icon';
import { Confetti } from '@/components/confetti';
import { LeaveDialog } from '@/components/leave-dialog';
import { PrimaryButton } from '@/components/primary-button';
import { WritingPad } from '@/components/writing-pad';
import { XIcon } from '@/components/x-icon';
import { colors, fonts, jpRoom } from '@/constants/theme';
import { CALLIGRAPHY_ROUND } from '@/core/calligraphy';
import type { Script } from '@/core/kana';
import { useCalligraphy, writableKana } from '@/hooks/use-calligraphy';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

// How long each stroke shows in "Show order".
const DEMO_MS = 700;

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// Calligraphy: choose a script, then trace five of your kana stroke by stroke, in the right
// order. Each round gets a new key, so "Write more" starts fresh.
export default function CalligraphyScreen() {
  const [script, setScript] = useState<Script | null>(null);
  const [roundNumber, setRoundNumber] = useState(0);
  if (!script) return <Entrance onStart={setScript} />;
  return <Writing key={roundNumber} script={script} onAgain={() => setRoundNumber((n) => n + 1)} />;
}

function Entrance({ onStart }: { onStart: (script: Script) => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [choice, setChoice] = useState<Script>(progress.settings.script);

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave calligraphy" onPress={leave} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
      </View>
      <View style={styles.entrance}>
        <BrushIcon color={colors.goldDark} size={72} />
        <Text style={styles.title}>Calligraphy</Text>
        <Text style={styles.sub}>
          Trace each kana stroke by stroke, in the right order. Writing a kana helps you remember how it looks.
        </Text>
        <View style={styles.scripts} role="radiogroup">
          {(['hiragana', 'katakana'] as const).map((script) => {
            const count = writableKana(progress, script).length;
            return (
              <Pressable
                key={script}
                role="radio"
                aria-checked={choice === script}
                onPress={() => setChoice(script)}
                style={[styles.scriptCard, choice === script && styles.scriptCardChosen]}>
                <Text style={styles.scriptName}>{script === 'hiragana' ? 'Hiragana' : 'Katakana'}</Text>
                <Text style={styles.scriptKana}>{script === 'hiragana' ? 'ひらがな' : 'カタカナ'}</Text>
                <Text style={styles.scriptInfo}>{count > 0 ? `${count} kana to write` : 'Learn a kana first'}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Start writing" disabled={writableKana(progress, choice).length === 0} onPress={() => onStart(choice)} />
      </View>
    </View>
  );
}

function Writing({ script, onAgain }: { script: Script; onAgain: () => void }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const writing = useCalligraphy(script);
  const { round, index, kana, strokes, done, note, result } = writing;
  const [demo, setDemo] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);

  // Android's back button asks first, like the X. Once the round is over, back just leaves.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [result]);

  // "Show order": each stroke in turn, then back to writing.
  useEffect(() => {
    if (demo === null) return;
    const timer = setTimeout(() => setDemo(demo + 1 < strokes.length ? demo + 1 : null), DEMO_MS);
    return () => clearTimeout(timer);
  }, [demo, strokes.length]);

  if (result) {
    const allClean = result.clean === result.strokes;
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.entrance}>
          <AliveKarasu mood="cheer" rank={rank} size={130} move={{ kind: 'cheer', id: 1 }} />
          <Text style={styles.title}>
            {result.kana} kana written
          </Text>
          <Text style={styles.sub}>
            {result.clean} of {result.strokes} strokes clean{allClean ? '. Every one!' : '.'}
          </Text>
        </View>
        <View style={[styles.footer, styles.endButtons]}>
          <PrimaryButton label="Write more" onPress={onAgain} />
          <PrimaryButton label="Done" tone="light" onPress={leave} />
        </View>
        {allClean && <Confetti />}
      </View>
    );
  }
  if (!kana) return null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Leave calligraphy" onPress={() => setLeaving(true)} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${((index + (done === strokes.length ? 1 : 0)) / Math.max(round.length, CALLIGRAPHY_ROUND)) * 100}%` }]} />
        </View>
        <View style={styles.strokeChip}>
          <Text style={styles.strokeChipText}>
            Stroke {Math.min(done + 1, strokes.length)} of {strokes.length}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} scrollEnabled={false}>
        <View style={styles.heading}>
          <View>
            <Text style={styles.write}>
              Write <Text style={styles.kana}>{kana.char}</Text>
            </Text>
            <Text style={styles.romaji}>{kana.romaji[0]}</Text>
          </View>
          <AliveKarasu mood={note && !note.good ? 'stern' : 'focus'} rank={rank} size={68} />
        </View>

        <WritingPad strokes={strokes} done={done} demo={demo} onStroke={writing.draw} />

        <View style={styles.noteRow}>
          {note && (
            <View style={[styles.note, note.good ? styles.noteGood : styles.noteBad]}>
              <Text style={[styles.noteText, note.good ? styles.noteGoodText : styles.noteBadText]}>{note.text}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, styles.buttons]}>
        <Pressable role="button" onPress={writing.undo} disabled={done === 0} style={[styles.ghost, done === 0 && styles.ghostDisabled]}>
          <Text style={styles.ghostText}>Undo</Text>
        </Pressable>
        <Pressable role="button" onPress={() => setDemo(0)} disabled={demo !== null} style={styles.ghost}>
          <Text style={styles.ghostText}>Show order</Text>
        </Pressable>
      </View>

      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
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
  strokeChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  strokeChipText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.sumi,
  },
  entrance: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
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
  scripts: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  scriptCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  scriptCardChosen: {
    borderWidth: 2,
    borderColor: colors.sumi,
  },
  scriptName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  scriptKana: {
    marginBottom: 4,
    fontFamily: fonts.jp,
    fontSize: 15,
    color: colors.ink2,
  },
  scriptInfo: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 18,
  },
  endButtons: {
    gap: 10,
  },
  body: {
    gap: 10,
    paddingHorizontal: 18,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  write: {
    fontFamily: fonts.uiBlack,
    fontSize: 24,
    // "Write ぼ" ends on the kana, so its ゛ needs room too.
    ...jpRoom(24),
    color: colors.sumi,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  romaji: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: colors.ink2,
  },
  noteRow: {
    minHeight: 30,
  },
  note: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  noteGood: {
    backgroundColor: colors.pineLight,
  },
  noteBad: {
    backgroundColor: colors.vermilionLight,
  },
  noteText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
  },
  noteGoodText: {
    color: colors.pineDark,
  },
  noteBadText: {
    color: colors.vermilionDark,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 'auto',
  },
  ghost: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  ghostDisabled: {
    opacity: 0.5,
  },
  ghostText: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    color: colors.sumi,
  },
});
