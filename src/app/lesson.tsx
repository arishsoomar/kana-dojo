import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoiceTile } from '@/components/choice-tile';
import { KanaFrame } from '@/components/kana-frame';
import { PrimaryButton } from '@/components/primary-button';
import { colors } from '@/constants/theme';
import type { Progress } from '@/core/answers';
import type { Kana } from '@/core/kana';
import { useQuestion } from '@/hooks/use-question';

// No saved progress yet (that's C4), so every lesson starts as a new learner.
const NEW_LEARNER: Progress = { kana: {}, confusions: [] };

export default function LessonScreen() {
  const insets = useSafeAreaInsets();
  const question = useQuestion(NEW_LEARNER, 'hiragana');
  const [selected, setSelected] = useState<Kana | null>(null);

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom + 22 }]}>
      <KanaFrame char={question.kana.char} />

      <View style={styles.choices} accessibilityRole="radiogroup">
        {question.choices.map((choice) => (
          <ChoiceTile
            key={choice.char}
            label={choice.romaji[0]}
            selected={choice === selected}
            onPress={() => setSelected(choice)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {/* Checking the answer is story C2. */}
        <PrimaryButton label="Check" disabled={selected === null} onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    backgroundColor: colors.paper,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  footer: {
    marginTop: 'auto',
  },
});
