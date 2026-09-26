import { router, useLocalSearchParams } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeltIcon } from '@/components/belt-icon';
import { DownIcon } from '@/components/down-icon';
import { Karasu } from '@/components/karasu';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { BELT_STEPS, GUIDE, type GuideBlock, type GuideTopic } from '@/content/guide';
import { useRank } from '@/hooks/use-rank';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// "How the dojo works": every rule a learner might ask about, as questions that open to show
// their answers. Opened from the Profile tab. `?topic=belts` opens with that question open.
export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const rank = useRank();
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(topic ? [topic] : []));

  function toggle(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Close" onPress={goBack} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.topTitle}>How the dojo works</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.coach}>
          <Karasu mood="gentle" rank={rank} size={64} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>Ask me anything. Tap a question to see the answer.</Text>
          </View>
        </View>

        {GUIDE.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.heading}>{section.title}</Text>
            <View style={styles.card}>
              {section.topics.map((t, i) => (
                <Topic key={t.id} topic={t} first={i === 0} open={open.has(t.id)} onToggle={() => toggle(t.id)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// One question. Tapping it shows or hides its answer.
function Topic({ topic, first, open, onToggle }: { topic: GuideTopic; first: boolean; open: boolean; onToggle: () => void }) {
  return (
    <View style={!first && styles.divider}>
      <Pressable role="button" aria-expanded={open} onPress={onToggle} style={styles.question}>
        <Rich text={topic.question} style={styles.questionText} />
        <View style={open && styles.chevronOpen}>
          <DownIcon color={colors.ink2} />
        </View>
      </Pressable>
      {open && (
        <View style={styles.answer}>
          {topic.answer.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </View>
      )}
    </View>
  );
}

function Block({ block }: { block: GuideBlock }) {
  if (typeof block === 'string') return <Rich text={block} style={styles.paragraph} />;
  if ('belts' in block) return <BeltLadder />;
  return (
    <View style={styles.bullets}>
      {block.bullets.map((line) => (
        <View key={line} style={styles.bulletRow}>
          <View style={styles.dot} />
          <Rich text={line} style={[styles.paragraph, styles.bulletText]} />
        </View>
      ))}
    </View>
  );
}

// The four belts in order, each with how a kana gets there.
function BeltLadder() {
  return (
    <View style={styles.ladder}>
      {BELT_STEPS.map((step) => (
        <View key={step.belt} style={styles.step}>
          <View style={styles.stepBelt}>
            <BeltIcon belt={step.belt} width={40} />
            <Text style={styles.stepName}>{step.belt}</Text>
          </View>
          <Text style={styles.stepHow}>{step.how}</Text>
        </View>
      ))}
    </View>
  );
}

// Text with any kana in it set in the Japanese font, which draws them properly.
const KANA_RUN = /([぀-ヿ]+)/;

function Rich({ text, style }: { text: string; style: StyleProp<TextStyle> }) {
  return (
    <Text style={style}>
      {text.split(KANA_RUN).map((part, i) =>
        // split() with a capture group puts the kana runs at the odd positions.
        i % 2 === 1 ? (
          <Text key={i} style={styles.kana}>
            {part}
          </Text>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </Text>
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
    gap: 14,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  topTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.sumi,
  },
  content: {
    paddingHorizontal: 16,
  },
  coach: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  bubble: {
    flex: 1,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  bubbleText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.sumi,
  },
  section: {
    marginTop: 18,
  },
  heading: {
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.ink2,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  question: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  questionText: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.sumi,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  answer: {
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  paragraph: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink2,
  },
  kana: {
    fontFamily: fonts.jp,
  },
  bullets: {
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  // Sits level with the middle of the first line.
  dot: {
    width: 5,
    height: 5,
    marginTop: 9,
    borderRadius: 3,
    backgroundColor: colors.vermilion,
  },
  bulletText: {
    flex: 1,
  },
  ladder: {
    gap: 2,
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.paper,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  stepBelt: {
    alignItems: 'center',
    width: 52,
    gap: 2,
  },
  stepName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 11,
    textTransform: 'capitalize',
    color: colors.sumi,
  },
  stepHow: {
    flex: 1,
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.sumi,
  },
});
