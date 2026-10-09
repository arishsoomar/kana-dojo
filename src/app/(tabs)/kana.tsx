import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { CheckIcon } from '@/components/check-icon';
import { KanaCell } from '@/components/kana-cell';
import { pronounce } from '@/audio/pronounce';
import { KanaDetailSheet } from '@/components/kana-detail-sheet';
import { ProgressRing } from '@/components/progress-ring';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { colors, fonts, jpRoom } from '@/constants/theme';
import type { Belt } from '@/core/boxes';
import { kanaDetails } from '@/core/details';
import { pairTipFor } from '@/core/feedback';
import { masteryGrid } from '@/core/grid';
import { KANA, lookalikesOf, rowKind, type Kana, type RowId, type Script } from '@/core/kana';
import { useProgress } from '@/hooks/use-progress';
import { grammarReadiness } from '@/core/readiness';
import { useGrammarDue, useGrammarPath } from '@/hooks/use-grammar';
import { useDecks } from '@/hooks/use-words';

const SECTIONS = [
  { value: 'kana', label: 'Kana' },
  { value: 'words', label: 'Words' },
  { value: 'grammar', label: 'Grammar' },
] as const;
type Section = (typeof SECTIONS)[number]['value'];

const SCRIPTS = [
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'katakana', label: 'Katakana' },
] as const;

// Highest belt first, as in the mock.
const SHOWN_BELTS: readonly Belt[] = ['black', 'brown', 'green'];

// The Study tab: your kana, the word deck, and grammar.
export default function StudyScreen() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<Section>('kana');
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.title}>Study</Text>
      <SegmentedControl options={SECTIONS} value={section} onChange={setSection} />
      {section === 'kana' ? <KanaSection /> : section === 'words' ? <WordsSection /> : <GrammarSection />}
    </ScrollView>
  );
}

// Words: GENKI I's flashcard decks, one per lesson, each with how many of its cards you know.
function WordsSection() {
  const { decks } = useDecks();
  return (
    <>
      <Text style={styles.wordsIntro}>Flashcards for every lesson of GENKI I. Study a deck as often as you like.</Text>
      {decks.map((deck) => (
        <Pressable
          key={deck.id}
          role="button"
          aria-label={`${deck.name}, ${deck.title}: ${deck.known} of ${deck.ids.length} known`}
          onPress={() => router.push({ pathname: '/words/deck', params: { id: deck.id } })}
          style={[styles.summary, styles.deck]}>
          <View style={styles.summaryText}>
            <Text style={styles.deckName}>{deck.name}</Text>
            <Text style={styles.summaryTitle}>{deck.title}</Text>
            <View style={styles.deckTrack}>
              <View style={[styles.deckFill, { width: `${(deck.known / deck.ids.length) * 100}%` }]} />
            </View>
            <Text style={styles.wordsAbout}>
              {deck.known} of {deck.ids.length} known
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </>
  );
}

// The grammar path: each unit's lessons, in order, each opening when the one before is done.
function GrammarSection() {
  const grammar = useGrammarPath();
  const due = useGrammarDue();
  return (
    <>
      {due > 0 && (
        <View style={[styles.summary, styles.wordsCard]}>
          <View>
            <Text style={styles.summaryTitle}>
              {due} grammar {due === 1 ? 'point' : 'points'} to review
            </Text>
            <Text style={styles.wordsAbout}>A few exercises from each lesson, just before you&apos;d forget it.</Text>
          </View>
          <PrimaryButton label="Review grammar" onPress={() => router.push('/grammar/review')} />
        </View>
      )}
      {grammar.done === 0 && <Readiness />}
      <Text style={styles.wordsAbout}>
        Grammar in the order beginners meet it, {grammar.done} of {grammar.total} lessons done. Every example uses words from
        your deck.
      </Text>
      {grammar.units.map(({ unit, name, lessons }) => (
        <View key={unit} style={[styles.summary, styles.wordsCard, styles.unitCard]}>
          <Text style={styles.summaryTitle}>
            Unit {unit}: {name}
          </Text>
          {lessons.map(({ lesson, state }) => (
            <Pressable
              key={lesson.id}
              role="button"
              aria-label={`${lesson.title}. ${state}`}
              disabled={state === 'locked'}
              onPress={() => router.push({ pathname: '/grammar/lesson', params: { id: lesson.id } })}
              style={[styles.lessonRow, state === 'current' && styles.lessonCurrent]}>
              <View style={[styles.lessonMark, state === 'done' && styles.lessonMarkDone, state === 'locked' && styles.lessonMarkLocked]}>
                {state === 'done' ? <CheckIcon color={colors.card} /> : <Text style={styles.lessonMarkText}>{state === 'locked' ? '' : '▶'}</Text>}
              </View>
              <View style={styles.summaryText}>
                <Text style={[styles.lessonTitle, state === 'locked' && styles.lockedText]}>{lesson.title}</Text>
                <Text style={styles.wordsAbout} numberOfLines={2}>
                  {lesson.goal}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ))}
      <Text style={styles.wordsAbout}>That covers the grammar of a first-year course. More can follow.</Text>
    </>
  );
}

// What each part of being ready for grammar is, and why.
const READINESS_TEXT = {
  hiragana: { title: 'All 46 hiragana at green belt', why: 'Particles, endings and every reading are written in hiragana.' },
  hiraganaMore: { title: 'The rest of hiragana: が, ぱ, きゃ and the like', why: 'Readings like がくせい and きょうしつ use them.' },
  words: { title: 'Some words known from the flashcards', why: "So the examples aren't all new words." },
  katakana: { title: 'Katakana basics', why: 'A few words, like トイレ, are written in katakana.' },
} as const;

// When to start grammar: what's needed first and what helps, with how far along each is.
// Advice only; nothing is locked.
function Readiness() {
  const { progress } = useProgress();
  const { items, ready } = grammarReadiness(progress);
  const card = (needed: boolean) => (
    <View style={styles.readyGroup}>
      <Text style={styles.readyGroupTitle}>{needed ? 'Needed first' : 'Helps a lot'}</Text>
      {items
        .filter((i) => i.needed === needed)
        .map((item) => {
          const done = item.done >= item.target;
          return (
            <View key={item.id} style={styles.readyItem}>
              <View style={[styles.readyMark, done && styles.lessonMarkDone]}>
                {done ? <CheckIcon color={colors.card} /> : <Text style={styles.readyCount}>{item.done}</Text>}
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.readyTitle}>
                  {READINESS_TEXT[item.id].title}
                  {done ? '' : ` (${item.done} of ${item.target})`}
                </Text>
                <Text style={styles.wordsAbout}>{READINESS_TEXT[item.id].why}</Text>
              </View>
            </View>
          );
        })}
    </View>
  );
  return (
    <View style={[styles.summary, styles.wordsCard, ready ? styles.readyCard : styles.notReadyCard]}>
      <Text style={styles.summaryTitle}>{ready ? "You're ready for grammar" : 'Before you start grammar'}</Text>
      {!ready && (
        <Text style={styles.wordsAbout}>
          You can start any time: every lesson has furigana. It goes much more smoothly once these are done.
        </Text>
      )}
      {!ready && card(true)}
      {card(false)}
    </View>
  );
}

// Your kana: the chart for each script, with belts, and a sheet for each kana.
function KanaSection() {
  const { progress } = useProgress();
  const [script, setScript] = useState<Script>('hiragana');
  const [open, setOpen] = useState<Kana | null>(null);
  const grid = masteryGrid(progress, script);

  function drill(kana: Kana) {
    setOpen(null);
    router.push({ pathname: '/lesson', params: { drill: kana.char } });
  }

  return (
    <>
      <Pressable role="button" onPress={() => router.push('/practice')} style={[styles.summary, styles.perDay]}>
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>Practice kana</Text>
          <Text style={styles.wordsAbout}>Choose rows from hiragana, katakana or both, and practise as long as you like.</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <SegmentedControl options={SCRIPTS} value={script} onChange={setScript} />

      <View style={styles.summary}>
        <ProgressRing fraction={grid.pastWhite / grid.total} label={String(grid.pastWhite)} />
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>
            {grid.pastWhite} of {grid.total} past white
          </Text>
          <View style={styles.beltCounts}>
            {SHOWN_BELTS.map((belt) => (
              <View key={belt} style={styles.beltCount} aria-label={`${grid.counts[belt]} ${belt} belt`}>
                <BeltIcon belt={belt} width={30} />
                <Text style={styles.beltCountText}>{grid.counts[belt]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.rows}>
        {grid.rows.map(({ row, belt, cells }, i) => {
          // A heading where each kind of row after the basic ones begins, saying what it is.
          const previous = grid.rows[i - 1];
          const newKind = previous !== undefined && rowKind(row) !== rowKind(previous.row);
          return (
            <Fragment key={row}>
              {newKind && <KindHeading row={row} script={script} />}
              <View style={styles.row}>
                {/* The row's name and its belt: the belt of its weakest kana. */}
                <View style={styles.rowLabel} aria-label={`${row} row, ${belt} belt`}>
                  <Text style={styles.rowName}>{row}</Text>
                  <BeltIcon belt={belt} width={24} />
                </View>
                {cells.map((cell) => (
                  <KanaCell key={cell.kana.char} cell={cell} onPress={() => setOpen(cell.kana)} />
                ))}
                {/* Short rows (ya, wa) keep the same column widths as the rest. */}
                {Array.from({ length: 5 - cells.length }, (_, n) => (
                  <View key={`empty-${n}`} style={styles.emptyCell} />
                ))}
              </View>
            </Fragment>
          );
        })}
      </View>

      {open && (
        <DetailSheet kana={open} onDrill={() => drill(open)} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

// What each kind of row after the basic ones is, with an example from this script: the
// kana it's made from, and the kana it makes.
const KIND_HEADINGS = {
  dakuten: { title: 'Dakuten ゛', about: 'Two little strokes voice the sound:', from: 'ka', to: 'ga' },
  handakuten: { title: 'Handakuten ゜', about: 'A little circle turns h into p:', from: 'ha', to: 'pa' },
  yoon: { title: 'Yōon', about: 'A small ゃ, ゅ or ょ joins the kana before it into one sound:', from: 'ki', to: 'kya' },
  extended: {
    title: 'Extended katakana',
    about: 'A small ァ ィ ゥ ェ ォ makes sounds for words from other languages:',
    from: 'fu',
    to: 'fo',
  },
} as const;

function KindHeading({ row, script }: { row: RowId; script: Script }) {
  const kind = rowKind(row);
  if (kind === 'basic') return null;
  const { title, about, from, to } = KIND_HEADINGS[kind];
  const char = (romaji: string) => KANA.find((k) => k.script === script && k.romaji[0] === romaji)?.char ?? '';
  return (
    <View style={styles.kindHeading}>
      <Text style={styles.kindTitle}>{title}</Text>
      <Text style={styles.kindAbout}>
        {about} <Text style={styles.kindKana}>{char(from)}</Text> {from} → <Text style={styles.kindKana}>{char(to)}</Text> {to}
      </Text>
    </View>
  );
}

function DetailSheet({ kana, onDrill, onClose }: { kana: Kana; onDrill: () => void; onClose: () => void }) {
  const { progress } = useProgress();
  const details = kanaDetails(progress, kana);
  // How to tell it from its most common mix-up or a lookalike. (Its own memory tip is always
  // shown, with its picture.)
  const tip = pairTipFor(kana.char, [...details.mixUps.map((m) => m.char), ...lookalikesOf(kana.char)]);
  return (
    <KanaDetailSheet kana={kana} details={details} tip={tip} onDrill={onDrill} onSpeak={() => pronounce(kana)} onClose={onClose} />
  );
}

const styles = StyleSheet.create({
  wordsIntro: {
    paddingHorizontal: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  deck: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deckName: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  deckTrack: {
    height: 8,
    marginTop: 6,
    marginBottom: 2,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  deckFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.pine,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  summaryText: {
    flex: 1,
  },
  wordsCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 14,
    padding: 16,
  },
  wordsAbout: {
    marginTop: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink2,
  },
  readyCard: {
    borderColor: colors.pine,
  },
  notReadyCard: {
    borderColor: colors.gold,
  },
  readyGroup: {
    gap: 8,
  },
  readyGroupTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  readyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  readyMark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.paper,
  },
  readyCount: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 11,
    color: colors.ink2,
  },
  readyTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.sumi,
  },
  unitCard: {
    gap: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 8,
  },
  lessonCurrent: {
    backgroundColor: colors.paper,
  },
  lessonMark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.sumi,
  },
  lessonMarkDone: {
    backgroundColor: colors.pine,
  },
  lessonMarkLocked: {
    backgroundColor: colors.line,
  },
  lessonMarkText: {
    fontSize: 11,
    color: colors.card,
  },
  lessonTitle: {
    fontFamily: fonts.jp,
    fontSize: 16,
    ...jpRoom(16),
    color: colors.sumi,
  },
  lockedText: {
    color: colors.muted,
  },
  perDay: {
    paddingVertical: 14,
  },
  chevron: {
    fontFamily: fonts.uiBold,
    fontSize: 22,
    color: colors.muted,
  },
  summaryTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  beltCounts: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  beltCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  beltCountText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.sumi,
  },
  rows: {
    gap: 8,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kindHeading: {
    marginTop: 14,
    marginBottom: 2,
    gap: 2,
  },
  kindTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  kindAbout: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  kindKana: {
    fontFamily: fonts.jp,
    color: colors.sumi,
  },
  rowLabel: {
    alignItems: 'center',
    gap: 2,
    width: 26,
  },
  rowName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 12,
    color: colors.muted,
  },
  // Same border width as a real cell (but invisible), so every column lines up.
  emptyCell: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
