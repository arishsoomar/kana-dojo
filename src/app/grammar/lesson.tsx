import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { BackIcon } from '@/components/back-icon';
import { Furigana } from '@/components/furigana';
import { PrimaryButton } from '@/components/primary-button';
import { SegmentedControl } from '@/components/segmented-control';
import { SpeakerIcon } from '@/components/speaker-icon';
import { colors, fonts } from '@/constants/theme';
import { genkiDeck } from '@/content/genki';
import { knownCards } from '@/core/flashcards';
import { parseRuby, rubyText, sayCardIds, type Example, type GrammarLesson, type GrammarPoint } from '@/core/grammar';
import { lessonById, useMyName } from '@/hooks/use-grammar';
import { useProgress } from '@/hooks/use-progress';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

const ORDERS = [
  { value: 'order', label: 'In order' },
  { value: 'shuffled', label: 'Shuffled' },
] as const;

// A grammar lesson: each point explained with examples (tap one to hear it), then sentences to
// practise saying.
export default function GrammarLessonScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = typeof id === 'string' ? lessonById(id) : null;
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.topTitle}>{lesson ? `Lesson ${lesson.lesson}` : ''}</Text>
      </View>
      {lesson ? <Lesson lesson={lesson} /> : <Text style={styles.body}>There&apos;s no lesson here.</Text>}
    </View>
  );
}

function Lesson({ lesson }: { lesson: GrammarLesson }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [order, setOrder] = useState<(typeof ORDERS)[number]['value']>('order');
  const ids = sayCardIds(lesson);
  const known = knownCards(progress, ids).length;
  const learning = ids.length - known;
  const deck = genkiDeck(lesson.id);
  const usesName = lesson.points.some((p) => p.say.some((s) => s.ja.includes('{name}')));
  const practise = (only: boolean) =>
    router.push({
      pathname: '/grammar/say',
      params: { id: lesson.id, shuffle: order === 'shuffled' ? '1' : '0', ...(only ? { only: 'learning' } : {}) },
    });

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.goal}>{lesson.goal}</Text>

      {deck && (
        <Pressable role="button" onPress={() => router.push({ pathname: '/words/deck', params: { id: deck.id } })} style={styles.wordsRow}>
          <View style={styles.grow}>
            <Text style={styles.sectionTitle}>This lesson&apos;s words</Text>
            <Text style={styles.body}>{deck.ids.length} flashcards. Knowing them makes the sentences easier.</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      )}

      {lesson.points.map((point, i) => (
        <Point key={point.title} point={point} number={i + 1} />
      ))}

      {usesName && <NameCard />}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Say it</Text>
        <Text style={styles.body}>
          {ids.length} sentences: see the English, say it in Japanese (out loud, or in your head), then turn the card over to check and
          hear it. {known} known.
        </Text>
        <SegmentedControl options={ORDERS} value={order} onChange={setOrder} />
        <PrimaryButton label={`Practise all ${ids.length}`} onPress={() => practise(false)} />
        {known > 0 && learning > 0 && <PrimaryButton label={`Practise the ${learning} still learning`} tone="light" onPress={() => practise(true)} />}
      </View>
    </ScrollView>
  );
}

function Point({ point, number }: { point: GrammarPoint; number: number }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {number}. {point.title}
      </Text>
      <Text style={styles.body}>{point.text}</Text>
      {point.examples.map((example) => (
        <ExampleRow key={example.ja} example={example} />
      ))}
    </View>
  );
}

function ExampleRow({ example }: { example: Example }) {
  return (
    <Pressable role="button" aria-label={`${rubyText(example.ja)}: ${example.en}. Hear it`} onPress={() => speakWord(rubyText(example.ja))} style={styles.example}>
      <View style={styles.grow}>
        <Furigana furigana={parseRuby(example.ja)} size={20} />
        <Text style={styles.exampleEn}>{example.en}</Text>
      </View>
      <SpeakerIcon color={colors.muted} size={18} />
    </Pressable>
  );
}

// Your name, for the sentences about you: as it's spelled, and in katakana, the way names from
// other languages are written in Japanese (Arish is アリシュ).
function NameCard() {
  const myName = useMyName();
  const [en, setEn] = useState(myName.set ? myName.name.en : '');
  const [ja, setJa] = useState(myName.set ? myName.name.ja : '');
  const changed = en.trim() !== (myName.set ? myName.name.en : '') || ja.trim() !== (myName.set ? myName.name.ja : '');
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your name</Text>
      <Text style={styles.body}>
        Some sentences are about you. Foreign names are written in katakana, by how they sound: Arish is アリシュ, Emma is エマ.
        {myName.set ? '' : ' Until you add yours, they use Mary’s (メアリー).'}
      </Text>
      <TextInput value={en} onChangeText={setEn} placeholder="Your name, e.g. Arish" style={styles.input} placeholderTextColor={colors.muted} autoCorrect={false} />
      <TextInput value={ja} onChangeText={setJa} placeholder="In katakana, e.g. アリシュ" style={styles.input} placeholderTextColor={colors.muted} autoCorrect={false} />
      {changed && <PrimaryButton label="Save" tone="light" onPress={() => myName.save({ en, ja })} />}
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
  topTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  content: {
    gap: 14,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.uiBlack,
    fontSize: 26,
    color: colors.sumi,
  },
  goal: {
    marginTop: -8,
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    color: colors.ink2,
  },
  section: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  wordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  chevron: {
    fontFamily: fonts.uiBold,
    fontSize: 24,
    color: colors.muted,
  },
  sectionTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  body: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink2,
  },
  example: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  exampleEn: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    fontFamily: fonts.uiSemiBold,
    fontSize: 16,
    color: colors.sumi,
    backgroundColor: colors.paper,
  },
});
