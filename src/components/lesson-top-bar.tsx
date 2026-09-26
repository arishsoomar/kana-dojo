import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

import { SpeakerIcon } from './speaker-icon';
import { XIcon } from './x-icon';

type Props = {
  // How much of the lesson is done, from 0 to 1.
  fraction: number;
  onClose: () => void;
  // Whether kana are spoken after each answer, and the button that turns it on and off.
  sound: boolean;
  onToggleSound: () => void;
  // Whether answers are typed or tapped, and the switch between them. Typed answers count
  // double toward belts, which the "×2" says.
  typing: boolean;
  onToggleTyping: () => void;
};

export function LessonTopBar({ fraction, onClose, sound, onToggleSound, typing, onToggleTyping }: Props) {
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
      <Pressable
        role="switch"
        aria-checked={typing}
        aria-label="Type answers, for double progress"
        onPress={onToggleTyping}
        hitSlop={6}
        style={styles.mode}>
        <Text style={[styles.segment, !typing && styles.segmentOn]}>Tap</Text>
        <Text style={[styles.segment, typing && styles.segmentOn]}>
          Type <Text style={[styles.double, typing && styles.doubleOn]}>×2</Text>
        </Text>
      </Pressable>
      <Pressable role="button" aria-label={sound ? 'Mute sound' : 'Turn sound on'} onPress={onToggleSound} hitSlop={10}>
        <SpeakerIcon color={colors.ink2} muted={!sound} />
      </Pressable>
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
  // Two segments; the one in use is filled.
  mode: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  segment: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  segmentOn: {
    backgroundColor: colors.sumi,
    color: colors.card,
  },
  double: {
    fontFamily: fonts.uiExtraBold,
    color: colors.vermilion,
  },
  doubleOn: {
    color: colors.gold,
  },
});
