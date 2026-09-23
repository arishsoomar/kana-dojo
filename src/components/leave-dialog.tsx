import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import { PrimaryButton } from './primary-button';

type Props = {
  visible: boolean;
  onStay: () => void;
  onLeave: () => void;
};

// Asks before leaving a lesson part-way. Built in-app because the system alert has no buttons on web.
export function LeaveDialog({ visible, onStay, onLeave }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Leave this lesson?</Text>
          <Text style={styles.body}>Answers in this lesson won&apos;t be saved yet.</Text>
          <View style={styles.buttons}>
            <PrimaryButton label="Keep training" onPress={onStay} />
            <PrimaryButton label="Leave" tone="vermilion" onPress={onLeave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.backdrop,
  },
  card: {
    gap: 6,
    padding: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  title: {
    fontFamily: fonts.uiBlack,
    fontSize: 19,
    color: colors.sumi,
  },
  body: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.ink2,
  },
  buttons: {
    gap: 10,
    marginTop: 12,
  },
});
