import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import { PrimaryButton } from './primary-button';

type Props = {
  known: number; // this round
  learning: number; // this round
  note: string; // how the whole deck stands: "New Friends: 12 of 67 known"
  onAgain: () => void;
  onDone: () => void;
  bottom: number; // the safe area below
};

// The end of a round of flashcards: how it went, then on with the cards still being learned,
// or the whole deck again.
export function RoundDone({ known, learning, note, onAgain, onDone, bottom }: Props) {
  return (
    <View style={[styles.done, { paddingBottom: bottom + 22 }]}>
      <Text style={styles.title}>{learning === 0 ? 'You know them all!' : 'Round done'}</Text>
      <View style={styles.tally}>
        <View style={[styles.item, styles.know]}>
          <Text style={styles.value}>{known}</Text>
          <Text style={styles.label}>Know it</Text>
        </View>
        <View style={[styles.item, styles.learning]}>
          <Text style={styles.value}>{learning}</Text>
          <Text style={styles.label}>Still learning</Text>
        </View>
      </View>
      <Text style={styles.note}>{note}</Text>
      <View style={styles.buttons}>
        <PrimaryButton label={learning > 0 ? `Keep going: ${learning} still learning` : 'Start again'} onPress={onAgain} />
        <PrimaryButton label="Done" tone="light" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  done: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.uiBlack,
    fontSize: 26,
    color: colors.sumi,
  },
  tally: {
    flexDirection: 'row',
    gap: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: colors.card,
  },
  know: {
    borderColor: colors.pine,
  },
  learning: {
    borderColor: colors.vermilion,
  },
  value: {
    fontFamily: fonts.uiBlack,
    fontSize: 30,
    color: colors.sumi,
  },
  label: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  note: {
    textAlign: 'center',
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  buttons: {
    gap: 10,
    marginTop: 8,
  },
});
