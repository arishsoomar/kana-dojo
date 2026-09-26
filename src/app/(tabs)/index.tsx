import { Redirect, router } from 'expo-router';
import { useRef, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { BeltPlaque } from '@/components/belt-plaque';
import { CoachFloor, FLOOR_SPACE } from '@/components/coach-floor';
import { DuelPlaque } from '@/components/duel-plaque';
import { ExamPlaque } from '@/components/exam-plaque';
import { FlameIcon } from '@/components/flame-icon';
import { PlaqueIcon } from '@/components/plaque-icon';
import { PlaqueTile } from '@/components/plaque-tile';
import { ProgressRing } from '@/components/progress-ring';
import { ScriptPicker } from '@/components/script-picker';
import { colors, fonts, wallColors } from '@/constants/theme';
import { setScript } from '@/core/answers';
import { duelRow, scrolls } from '@/core/duel';
import type { RowId, Script } from '@/core/kana';
import { pairId } from '@/core/pairs';
import { learnPath, type LearnPath, type PathUnit, type Plaque } from '@/core/path';
import { greenNeeded } from '@/core/unlock';
import { useDailyGoal } from '@/hooks/use-daily-goal';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useStreak } from '@/hooks/use-streak';

// Plaques hang four to a rail when the screen is wide enough (most rows have exactly four
// plaques, so a row fits on one rail), and three on narrow screens, like the mock.
const SLOT_WIDTH = 60;
const WALL_PADDING = 24;
const MIN_GAP = 18;
function perRailFor(width: number): number {
  return Math.min(Math.max(Math.floor((width - 2 * WALL_PADDING + MIN_GAP) / (SLOT_WIDTH + MIN_GAP)), 3), 4);
}

// The shoji grid on the wall: how far apart its lines are, and how many rows of it to draw.
const SHOJI_ROW = 96;
const SHOJI_ROWS = 14;

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { progress, updateProgress } = useProgress();
  const streak = useStreak();
  const daily = useDailyGoal();
  const rank = useRank();
  const { width } = useWindowDimensions();
  // The script shown here is remembered, and chosen during onboarding.
  const script = progress.settings.script;
  const chooseScript = (next: Script) => updateProgress(setScript(progress, next));
  const path = learnPath(progress, script);
  const unit = path.currentUnit;
  const needed = greenNeeded(progress, script, unit.row);
  // A belt exam that's ready takes priority in Karasu's suggestion.
  const examReady = path.units.find((u) => u.exam) ?? null;
  // Duels that are ready, each hung in the unit of the row that opened it.
  const readyDuels = scrolls(progress)
    .filter((s) => s.state === 'ready')
    .map((s) => s.pair)
    .filter((pair) => duelRow(pair).script === script);
  // The next row to open, which gets a note saying what opens it.
  const firstLocked = path.units.find((u) => !u.open) ?? null;

  // A new learner meets Karasu first.
  if (!progress.settings.onboarded) return <Redirect href="/welcome" />;

  function openPlaque(plaque: Plaque) {
    router.push({ pathname: '/lesson', params: { plaque: plaque.id } });
  }

  function practice() {
    router.push({ pathname: '/lesson', params: { script } });
  }

  function takeExam(u: PathUnit) {
    router.push({ pathname: '/exam', params: { script, row: u.row } });
  }

  // What tapping Karasu's bubble does: the same thing his line suggests.
  const { current } = path;
  const action = examReady
    ? { label: 'Take exam', onPress: () => takeExam(examReady) }
    : current
      ? { label: 'Begin', onPress: () => openPlaque(current) }
      : { label: 'Practice', onPress: practice };

  // Everything hung in a unit: its lesson plaques, then its belt, a ready exam, and ready duels.
  function itemsFor(u: PathUnit): ReactNode[] {
    return [
      ...u.plaques.map(({ plaque, state }) => (
        <PlaqueTile key={plaque.id} plaque={plaque} state={state} onPress={() => openPlaque(plaque)} />
      )),
      u.belt !== 'white' && <BeltPlaque key="belt" belt={u.belt} />,
      u.exam && <ExamPlaque key="exam" belt={u.exam} onPress={() => takeExam(u)} />,
      ...readyDuels
        .filter((pair) => duelRow(pair).row === u.row)
        .map((pair) => (
          <DuelPlaque
            key={pairId(pair)}
            pair={pair}
            onPress={() => router.push({ pathname: '/duel', params: { pair: pairId(pair) } })}
          />
        )),
    ].filter(Boolean);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.top}>
        <View style={styles.statsRow}>
          <ScriptPicker value={script} onChange={chooseScript} />
          <View style={styles.stats}>
            <Pressable
              role="button"
              aria-label={`Streak: ${streak.current} ${streak.current === 1 ? 'day' : 'days'}`}
              onPress={() => router.push('/streak')}
              style={styles.stat}>
              <FlameIcon />
              <Text style={[styles.statText, styles.streakCount, streak.current === 0 && styles.streakCountZero]}>
                {streak.current}
              </Text>
            </Pressable>
            <View
              style={styles.stat}
              aria-label={`Daily goal: ${daily.done} of ${daily.goal} ${daily.goal === 1 ? 'lesson' : 'lessons'} today`}>
              <ProgressRing fraction={Math.min(daily.done / daily.goal, 1)} label="" size={22} stroke={4} />
              <Text style={styles.statText}>
                {daily.done}/{daily.goal}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.unitCard}>
          <View style={styles.unitText}>
            <Text style={styles.unitNumber}>Unit {unit.number}</Text>
            <Text style={styles.unitTitle}>
              The <Text style={styles.kana}>{rowKana(unit)}</Text> row
            </Text>
            <View style={styles.unitBelt}>
              <BeltIcon belt={unit.belt} width={40} />
              <Text style={styles.unitBeltText}>
                {capitalize(unit.belt)} belt, {unit.done} of {unit.plaques.length} done
              </Text>
            </View>
          </View>
          <PlaqueIcon color={colors.card} lines={colors.sumi} />
        </View>
      </View>

      <View style={styles.wallArea}>
        <Shoji width={width} />
        {/* A new script is a new wall, which scrolls to its own current unit. */}
        <Wall
          key={script}
          perRail={perRailFor(width)}
          currentRow={unit.row}
          units={path.units.map((u) => ({
            unit: u,
            items: itemsFor(u),
            note:
              u === firstLocked && needed > 0
                ? `Opens when ${needed} more ${rowKana(unit)} row ${needed === 1 ? 'kana reaches' : 'kana reach'} green belt.`
                : null,
          }))}
        />
        <CoachFloor rank={rank} line={coachLine(path, needed)} action={action} />
      </View>
    </View>
  );
}

type WallUnit = { unit: PathUnit; items: ReactNode[]; note: string | null };

// The paper screen behind the wall: faint wooden lines, three upright and the rest across.
// It stays still while the plaques scroll over it.
function Shoji({ width }: { width: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[1, 2, 3].map((i) => (
        <View key={`v${i}`} style={[styles.shojiUpright, { left: (width * i) / 4 }]} />
      ))}
      {Array.from({ length: SHOJI_ROWS }, (_, i) => (
        <View key={`h${i}`} style={[styles.shojiAcross, { top: (i + 1) * SHOJI_ROW }]} />
      ))}
    </View>
  );
}

// The dojo wall: every unit's plaques on rails. It scrolls, and opens at the current unit,
// so its rails are the ones in view.
function Wall({ units, currentRow, perRail }: { units: WallUnit[]; currentRow: RowId; perRail: number }) {
  const scroller = useRef<ScrollView>(null);
  const scrolled = useRef(false);

  function onUnitLayout(row: RowId, event: LayoutChangeEvent) {
    if (row !== currentRow || scrolled.current) return;
    scrolled.current = true;
    scroller.current?.scrollTo({ y: event.nativeEvent.layout.y, animated: false });
  }

  return (
    <ScrollView ref={scroller} contentContainerStyle={{ paddingBottom: FLOOR_SPACE }}>
      {units.map(({ unit, items, note }) => (
        <View key={unit.row} style={styles.unit} onLayout={(e) => onUnitLayout(unit.row, e)}>
          <View style={styles.unitLabel}>
            {/* The unit's name on a small wooden board. */}
            <View style={[styles.board, !unit.open && styles.boardLocked]}>
              <Text style={[styles.boardText, !unit.open && styles.boardTextLocked]}>
                Unit {unit.number} · <Text style={styles.kana}>{rowKana(unit)}</Text> row
              </Text>
            </View>
            {unit.open && <BeltIcon belt={unit.belt} width={30} />}
          </View>
          {note && <Text style={styles.note}>{note}</Text>}
          {rails(items, perRail).map((rail, i) => (
            <View key={i} style={styles.railBlock}>
              <View style={styles.rail} />
              <View style={styles.hangers}>
                {rail}
                {/* A short rail's empty spots show bare pegs, waiting for plaques. */}
                {Array.from({ length: perRail - rail.length }, (_, j) => (
                  <View key={`gap${j}`} style={styles.slot}>
                    <View style={styles.peg} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// Items split into rails of `perRail`.
function rails(items: ReactNode[], perRail: number): ReactNode[][] {
  const out: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += perRail) out.push(items.slice(i, i + perRail));
  return out;
}

// The first kana of a unit's row, e.g. "か" for the ka row.
function rowKana(unit: PathUnit): string {
  return unit.plaques[0]?.plaque.kana[0]?.char ?? '';
}

function coachLine(path: LearnPath, needed: number): string {
  const { current } = path;
  const ready = path.units.find((u) => u.exam);
  if (ready?.exam) {
    return `Your ${rowKana(ready)} row is ready for its ${ready.exam} belt exam.`;
  }
  if (current) {
    return current.kind === 'mixed'
      ? 'Next: review the whole row.'
      : `Next: learn ${current.kana.map((k) => k.char).join(' ')}.`;
  }
  if (needed > 0) {
    const goal = `${needed} more ${rowKana(path.currentUnit)} row ${needed === 1 ? 'kana needs' : 'kana need'} green belt to open the next row.`;
    return `${goal} 3 quick right answers make a kana green.`;
  }
  return 'Every plaque is done. Keep practicing to hold your belts.';
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  top: {
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  streakCount: {
    color: colors.vermilion,
  },
  streakCountZero: {
    color: colors.muted,
  },
  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.sumi,
  },
  unitText: {
    flex: 1,
  },
  unitNumber: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  unitTitle: {
    fontFamily: fonts.uiBlack,
    fontSize: 20,
    color: colors.card,
  },
  unitBelt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  unitBeltText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  // The wall: shoji paper under a wooden beam.
  wallArea: {
    flex: 1,
    overflow: 'hidden',
    borderTopWidth: 6,
    borderTopColor: wallColors.rail,
    backgroundColor: wallColors.paper,
  },
  shojiUpright: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: wallColors.shoji,
  },
  shojiAcross: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: wallColors.shoji,
  },
  unit: {
    paddingTop: 12,
  },
  unitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 18,
  },
  board: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.woodDark,
    backgroundColor: colors.wood,
  },
  boardLocked: {
    borderColor: wallColors.fadedEdge,
    backgroundColor: wallColors.faded,
  },
  boardText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.sumi,
  },
  boardTextLocked: {
    color: wallColors.fadedInk,
  },
  note: {
    marginBottom: 8,
    paddingHorizontal: 18,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  railBlock: {
    marginBottom: 22,
  },
  rail: {
    height: 8,
    backgroundColor: wallColors.rail,
  },
  // Pulled up so each plaque's peg sits on the rail.
  hangers: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: WALL_PADDING,
  },
  slot: {
    alignItems: 'center',
    width: SLOT_WIDTH,
  },
  peg: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: wallColors.peg,
  },
});
