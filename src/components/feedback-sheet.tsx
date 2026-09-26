import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import { BulbIcon } from './bulb-icon';
import { PrimaryButton } from './primary-button';

// What a wrong answer's correction says: the right answer ("That's ka"), what was given
// instead, and a tip for next time.
export type Correction = { title: string; detail: string; tip: string | null };

// The correction in a sheet at the bottom of the screen, with Continue.
export function FeedbackSheet({ correction, onContinue }: { correction: Correction; onContinue: () => void }) {
  return (
    <View style={styles.sheet}>
      <View style={styles.row}>
        <View style={[styles.bar, { backgroundColor: colors.vermilion }]} />
        <Words correction={correction} />
      </View>
      <Tip tip={correction.tip} />
      <View style={styles.button}>
        <PrimaryButton label="Continue" tone="vermilion" onPress={onContinue} />
      </View>
    </View>
  );
}

// The same correction for typing mode, shown in place of the question's card instead of in a
// sheet at the bottom. The keyboard stays up, so nothing on screen has to move; the answer box
// below it has the Continue button, and return continues too. `picture` is the kana or word.
export function FeedbackCard({ correction, picture }: { correction: Correction; picture: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {picture}
        <Words correction={correction} />
      </View>
      <Tip tip={correction.tip} />
    </View>
  );
}

function Words({ correction }: { correction: Correction }) {
  return (
    <View style={styles.text}>
      <Text style={[styles.title, { color: colors.vermilionDark }]}>{correction.title}</Text>
      {correction.detail !== '' && <Text style={styles.detail}>{correction.detail}</Text>}
    </View>
  );
}

function Tip({ tip }: { tip: string | null }) {
  if (!tip) return null;
  return (
    <View style={styles.tip}>
      <BulbIcon />
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
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
  // Fills the kana card's space, with a red edge like a wrong answer tile.
  card: {
    flex: 1,
    justifyContent: 'center',
    padding: 14,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.vermilion,
    backgroundColor: colors.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
