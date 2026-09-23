import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

import { XIcon } from './x-icon';

type Props = {
  // How much of the lesson is done, from 0 to 1.
  fraction: number;
  onClose: () => void;
};

export function LessonTopBar({ fraction, onClose }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable role="button" aria-label="Leave lesson" onPress={onClose} hitSlop={10}>
        <XIcon color={colors.ink2} />
      </Pressable>
      <View
        style={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}>
        <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.edge,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.sumi,
  },
});
