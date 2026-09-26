import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { Result } from '@/hooks/use-lesson';

import { BulbIcon } from './bulb-icon';
import { PrimaryButton } from './primary-button';

type Props = {
  result: Result;
  onContinue: () => void;
};

// Shown after Check: what the answer was, and what it changed.
export function FeedbackSheet({ result, onContinue }: Props) {
  const tone = result.correct ? 'pine' : 'vermilion';
  const answer = result.kana.romaji[0];

  return (
    <View style={styles.sheet}>
      <View style={styles.row}>
        <View style={[styles.bar, { backgroundColor: colors[tone] }]} />
        <View style={styles.text}>
          <Text style={[styles.title, { color: result.correct ? colors.pineDark : colors.vermilionDark }]}>
            {result.correct ? `${result.fast ? 'Clean hit' : 'Got it'}, that's ${answer}` : `That's ${answer}`}
          </Text>
          <Text style={styles.detail}>{detailText(result)}</Text>
        </View>
      </View>

      {result.tip && (
        <View style={styles.tip}>
          <BulbIcon />
          <Text style={styles.tipText}>{result.tip}</Text>
        </View>
      )}

      <View style={styles.button}>
        <PrimaryButton label="Continue" tone={tone} onPress={onContinue} />
      </View>
    </View>
  );
}

function detailText(result: Result): string {
  if (!result.correct) {
    if (result.typed !== null) {
      return result.guess ? `You typed ${result.typed}, which is ${result.guess.char}.` : `You typed "${result.typed}".`;
    }
    return result.guess ? `You picked ${result.guess.romaji[0]}, which is ${result.guess.char}.` : '';
  }
  const seconds = `${(result.ms / 1000).toFixed(1)} seconds.`;
  // Only promotions are mentioned; a correct answer can't lower a belt.
  return result.beltChange ? `${seconds} ${result.kana.char} earned its ${result.beltChange.to} belt.` : seconds;
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.card,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  bar: {
    width: 5,
    borderRadius: 3,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.uiBlack,
    fontSize: 19,
  },
  detail: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.sumi,
  },
  button: {
    marginTop: 14,
  },
});
