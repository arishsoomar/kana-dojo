import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { Furigana } from '@/components/furigana';
import { GrammarPractice } from '@/components/grammar-practice';
import { LeaveDialog } from '@/components/leave-dialog';
import { LessonComplete } from '@/components/lesson-complete';
import { PrimaryButton } from '@/components/primary-button';
import { SpeakerIcon } from '@/components/speaker-icon';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { VOCAB } from '@/content/vocab';
import { parseRuby, rubyText, type Example, type GrammarLesson } from '@/core/grammar';
import { lessonById, useGrammarLesson } from '@/hooks/use-grammar';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/kana');
}

// A grammar lesson: its explanations and examples, then its exercises.
export default function GrammarLessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = typeof id === 'string' ? lessonById(id) : null;
  const insets = useSafeAreaInsets();
  if (!lesson) {
    return (
      <View style={[styles.screen, styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.body}>There&apos;s no lesson here.</Text>
        <PrimaryButton label="Back" onPress={leave} />
      </View>
    );
  }
  return <Lesson lesson={lesson} />;
}

function Lesson({ lesson }: { lesson: GrammarLesson }) {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const run = useGrammarLesson(lesson);
  const [leaving, setLeaving] = useState(false);
  const practising = run.phase === 'practice';

  // Android's back button asks first while practising.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!practising || run.result) return false;
      setLeaving(true);
      return true;
    });
    return () => subscription.remove();
  }, [practising, run.result]);

  if (run.result) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
        <LessonComplete
          summary={run.result.summary}
          onContinue={leave}
          title="Lesson complete"
          headline={{ label: 'Right', value: `${run.result.right}/${run.result.total}` }}
          rank={rank}
          celebrate={run.result.right === run.result.total}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable role="button" aria-label="Leave lesson" onPress={() => (practising ? setLeaving(true) : leave())} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        {practising ? (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${run.fraction * 100}%` }]} />
          </View>
        ) : (
          <Text style={styles.barTitle}>Unit {lesson.unit}</Text>
        )}
      </View>

      {practising ? <GrammarPractice run={run} /> : <Learn lesson={lesson} onPractice={run.startPractice} />}
      <LeaveDialog visible={leaving} onStay={() => setLeaving(false)} onLeave={leave} />
    </View>
  );
}

// The explanations: each section with its examples (tap one to hear it), and the lesson's
// words, marked new if they haven't been started in the deck yet.
function Learn({ lesson, onPractice }: { lesson: GrammarLesson; onPractice: () => void }) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const words = lesson.words.map((w) => VOCAB.find((v) => v.word === w)).filter((w) => w !== undefined);
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>{lesson.title}</Text>
      <Text style={styles.goal}>{lesson.goal}</Text>

      {lesson.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.body}>{section.text}</Text>
          {section.examples.map((example) => (
            <ExampleRow key={example.ja} example={example} />
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Words in this lesson</Text>
        <View style={styles.words}>
          {words.map((w) => (
            <View key={w.id} style={styles.word}>
              <Furigana furigana={w.furigana} size={17} />
              <Text style={styles.wordMeaning} numberOfLines={1}>
                {w.meanings[0]?.split('; ')[0]}
                {progress.words[String(w.id)] === undefined ? ' · new' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <PrimaryButton label="Practice" onPress={onPractice} />
    </ScrollView>
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  barTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.ink2,
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
    backgroundColor: colors.pine,
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
  },
  exampleEn: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  word: {
    maxWidth: 150,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  wordMeaning: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 11,
    color: colors.ink2,
  },
});
