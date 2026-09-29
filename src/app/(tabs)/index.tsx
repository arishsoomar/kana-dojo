import { Redirect, router, useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { type KarasuMove } from '@/components/alive-karasu';
import { BeltPlaque } from '@/components/belt-plaque';
import { CoachFloor, FLOOR_KARASU, FLOOR_SPACE } from '@/components/coach-floor';
import { DuelPlaque } from '@/components/duel-plaque';
import { ExamPlaque } from '@/components/exam-plaque';
import { FlameIcon } from '@/components/flame-icon';
import { karasuFeet } from '@/components/karasu';
import { KarasuFlight, type Point } from '@/components/karasu-flight';
import { PlaqueIcon } from '@/components/plaque-icon';
import { PlaqueTile, STAMP_LANDS_MS } from '@/components/plaque-tile';
import { ProgressRing } from '@/components/progress-ring';
import { ScriptPicker } from '@/components/script-picker';
import { colors, fonts, wallColors } from '@/constants/theme';
import { setScript } from '@/core/answers';
import { duelRow, scrolls } from '@/core/duel';
import { rowKind, type RowId, type Script } from '@/core/kana';
import { pairId } from '@/core/pairs';
import { learnPath, type LearnPath, type PathUnit, type Plaque } from '@/core/path';
import { karasuSays } from '@/core/sayings';
import { greenNeeded } from '@/core/unlock';
import { useDailyGoal } from '@/hooks/use-daily-goal';
import { useHaptics } from '@/hooks/use-haptics';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useStreak } from '@/hooks/use-streak';
import { clearWallNews, NO_NEWS, useWallNews } from '@/hooks/wall-news';

// Plaques hang four to a rail when the screen is wide enough (most rows have exactly four
// plaques, so a row fits on one rail), and three on narrow screens, like the mock.
const SLOT_WIDTH = 60;
const WALL_PADDING = 24;
const MIN_GAP = 18;
function perRailFor(width: number): number {
  return Math.min(Math.max(Math.floor((width - 2 * WALL_PADDING + MIN_GAP) / (SLOT_WIDTH + MIN_GAP)), 3), 4);
}

// How long a line Karasu says when tapped stays in his bubble.
const SAID_MS = 6000;
// How long wall news is kept after the Learn screen shows it: long enough for it to play.
const NEWS_MS = 3000;
// A belt plaque being hung clears the news itself when Karasu lands; this is in case he
// never does.
const FLIGHT_NEWS_MS = 14000;
// How long the wall takes to scroll to the row, and shows the empty peg, before Karasu sets off.
const SCROLL_SETTLES_MS = 900;
// Once he's landed, the wall stays on the new plaque this long before going back to the
// current row.
const ADMIRE_MS = 1500;

// Karasu hanging a belt plaque: the row, where he flies between, whether it's on its peg, and
// whether he's back on the floor.
type Flight = { row: RowId; from: Point; to: Point; width: number; placed: boolean; landed: boolean };

type Box = { x: number; y: number; width: number; height: number };
function measure(view: View | null): Promise<Box | null> {
  return new Promise((resolve) => {
    if (!view) resolve(null);
    else view.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

// Beside a unit's board: what kind of kana the row holds, for rows after the basic ones.
const KIND_TAGS = {
  basic: null,
  dakuten: 'dakuten ゛',
  handakuten: 'handakuten ゜',
  yoon: 'yōon',
  extended: 'extended katakana',
} as const;

function KindTag({ row }: { row: RowId }) {
  const tag = KIND_TAGS[rowKind(row)];
  return tag && <Text style={styles.kindTag}>{tag}</Text>;
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
  const haptics = useHaptics();
  // What Karasu says when tapped, shown for a few seconds instead of his usual line.
  const [said, setSaid] = useState<string | null>(null);
  const [karasuMove, setKarasuMove] = useState<{ kind: KarasuMove; id: number } | null>(null);
  const saidTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // What happened while a lesson was open: seals to stamp, rows to flip, and belt plaques to
  // hang. It's only shown
  // once the Learn tab is in view again, so it plays where it can be seen.
  const focused = useIsFocused();
  const waiting = useWallNews();
  const news = focused ? waiting : NO_NEWS;
  const reduceMotion = useReducedMotion();
  // With motion, Karasu flies each new belt plaque up to its peg (and thunks it on himself).
  const flies = news.hung.length > 0 && !reduceMotion;

  const feel = useEffectEvent((stamped: boolean, opened: boolean, hung: boolean) => {
    if (stamped) setTimeout(() => haptics.thunk(), STAMP_LANDS_MS);
    if (hung && !flies) haptics.thunk();
    if (opened) haptics.success();
  });
  useEffect(() => {
    if (news === NO_NEWS) return;
    feel(news.stamped.length > 0, news.opened.length > 0, news.hung.length > 0);
    // Once it has played, clear it, so it doesn't play again.
    const timer = setTimeout(clearWallNews, flies ? FLIGHT_NEWS_MS : NEWS_MS);
    return () => clearTimeout(timer);
  }, [news, flies]);
  // The script shown here is remembered, and chosen during onboarding.
  const script = progress.settings.script;

  // The belt plaque Karasu is about to hang, if any. The wall scrolls to its row, then once it
  // has settled, Karasu's flight is measured out: from his feet on the floor to its peg.
  const hanging = flies ? (news.hung.find((h) => h.script === script) ?? null) : null;
  const [flight, setFlight] = useState<Flight | null>(null);
  const wallArea = useRef<View>(null);
  const peg = useRef<View>(null);
  const takeOff = useEffectEvent(async (row: RowId) => {
    const [area, target] = await Promise.all([measure(wallArea.current), measure(peg.current)]);
    if (!area || !target) {
      // Nowhere to fly: it's simply hung.
      clearWallNews();
      return;
    }
    const feet = karasuFeet(rank, FLOOR_KARASU.size);
    setFlight({
      row,
      from: { x: FLOOR_KARASU.left + feet.x, y: area.height - FLOOR_KARASU.bottom - feet.height + feet.y },
      to: { x: target.x - area.x + target.width / 2, y: target.y - area.y + target.height },
      width: area.width,
      placed: false,
      landed: false,
    });
  });
  useEffect(() => {
    if (!hanging) return;
    const timer = setTimeout(() => void takeOff(hanging.row), SCROLL_SETTLES_MS);
    return () => {
      clearTimeout(timer);
      // Leaving the tab mid-flight: it plays again from the start next time.
      setFlight(null);
    };
  }, [hanging]);
  // This plaque's trip, from take-off until the wall moves on.
  const trip = hanging && flight?.row === hanging.row ? flight : null;
  // Karasu is up off the floor.
  const flying = trip && !trip.landed ? trip : null;

  function hooked() {
    setFlight((f) => f && { ...f, placed: true });
    haptics.thunk();
  }

  function landed() {
    setFlight((f) => f && { ...f, landed: true });
    setKarasuMove((m) => ({ kind: 'cheer', id: (m?.id ?? 0) + 1 }));
    setTimeout(clearWallNews, ADMIRE_MS);
  }
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

  function talk() {
    setSaid(karasuSays(progress, Math.random, said ?? undefined));
    setKarasuMove((m) => ({ kind: 'hop', id: (m?.id ?? 0) + 1 }));
    haptics.right();
    if (saidTimer.current) clearTimeout(saidTimer.current);
    saidTimer.current = setTimeout(() => setSaid(null), SAID_MS);
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
      ...u.plaques.map(({ plaque, state }, i) => (
        <PlaqueTile
          key={plaque.id}
          plaque={plaque}
          state={state}
          onPress={() => openPlaque(plaque)}
          stamp={news.stamped.includes(plaque.id)}
          reveal={news.opened.some((o) => o.script === script && o.row === u.row) ? i : null}
        />
      )),
      u.belt !== 'white' && (
        <BeltPlaque
          key="belt"
          belt={u.belt}
          waiting={hanging?.row === u.row && !trip?.placed}
          pegRef={hanging?.row === u.row ? peg : undefined}
        />
      ),
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

      <View ref={wallArea} style={styles.wallArea}>
        <Shoji width={width} />
        {/* A new script or a new current unit is a new wall, which scrolls to that unit. While a
            belt plaque is being hung, it shows that plaque's row instead. */}
        <Wall
          key={`${script}:${unit.row}`}
          perRail={perRailFor(width)}
          still={trip !== null}
          showRow={news.hung.find((h) => h.script === script)?.row ?? unit.row}
          units={path.units.map((u) => ({
            unit: u,
            items: itemsFor(u),
            note:
              u === firstLocked && needed > 0
                ? `Opens when ${needed} more ${rowKana(unit)} row ${needed === 1 ? 'kana reaches' : 'kana reach'} green belt.`
                : null,
          }))}
        />
        <CoachFloor
          rank={rank}
          line={said ?? coachLine(path, needed)}
          action={action}
          onKarasuPress={talk}
          move={karasuMove}
          away={flying !== null}
        />
        {flying && hanging && (
          <KarasuFlight
            from={flying.from}
            to={flying.to}
            width={flying.width}
            rank={rank}
            belt={path.units.find((u) => u.row === hanging.row)?.belt ?? 'green'}
            size={FLOOR_KARASU.size}
            onHung={hooked}
            onLanded={landed}
          />
        )}
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

// The dojo wall: every unit's plaques on rails. It scrolls, and opens at `showRow` (normally
// the current unit), so its rails are the ones in view. If `showRow` changes, it glides there.
// While `still`, it can't be scrolled (Karasu is flying to a peg on it).
function Wall({ units, showRow, perRail, still }: { units: WallUnit[]; showRow: RowId; perRail: number; still: boolean }) {
  const scroller = useRef<ScrollView>(null);
  const scrolled = useRef(false);
  // Where each unit starts, once it's been laid out.
  const unitTops = useRef(new Map<RowId, number>());

  function onUnitLayout(row: RowId, event: LayoutChangeEvent) {
    unitTops.current.set(row, event.nativeEvent.layout.y);
    if (row !== showRow || scrolled.current) return;
    scrolled.current = true;
    scroller.current?.scrollTo({ y: event.nativeEvent.layout.y, animated: false });
  }

  useEffect(() => {
    // Before the first layout, onUnitLayout does the first scroll instead.
    const y = unitTops.current.get(showRow);
    if (y !== undefined) scroller.current?.scrollTo({ y, animated: true });
  }, [showRow]);

  return (
    <ScrollView ref={scroller} scrollEnabled={!still} contentContainerStyle={{ paddingBottom: FLOOR_SPACE }}>
      {units.map(({ unit, items, note }) => (
        <View key={unit.row} style={styles.unit} onLayout={(e) => onUnitLayout(unit.row, e)}>
          <View style={styles.unitLabel}>
            {/* The unit's name on a small wooden board, and beside it, for the rows after the
                basic ones, what kind of kana they are. */}
            <View style={styles.boardRow}>
              <View style={[styles.board, !unit.open && styles.boardLocked]}>
                <Text style={[styles.boardText, !unit.open && styles.boardTextLocked]}>
                  Unit {unit.number} · <Text style={styles.kana}>{rowKana(unit)}</Text> row
                </Text>
              </View>
              <KindTag row={unit.row} />
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
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kindTag: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.woodDark,
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
