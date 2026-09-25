import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import type { KanaDetails } from '@/core/details';
import { formatWait } from '@/core/details';
import type { Kana } from '@/core/kana';

import { BeltIcon } from './belt-icon';
import { BulbIcon } from './bulb-icon';
import { KanaFrame } from './kana-frame';
import { PrimaryButton } from './primary-button';
import { SpeakerIcon } from './speaker-icon';

type Props = {
  kana: Kana;
  details: KanaDetails;
  tip: string | null;
  onDrill: () => void;
  onSpeak: () => void; // says the kana aloud
  onClose: () => void;
};

// Everything the engine knows about one kana, in a sheet that slides up over the grid.
export function KanaDetailSheet({ kana, details, tip, onDrill, onSpeak, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const accuracy = details.accuracy === null ? '–' : `${Math.round(details.accuracy * 100)}%`;
  const speed = details.strikeSpeedMs === null ? '–' : `${(details.strikeSpeedMs / 1000).toFixed(1)}s`;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      {/* Tapping the dimmed area above the sheet closes it. */}
      <Pressable style={styles.backdrop} onPress={onClose} aria-label="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <KanaFrame char={kana.char} size={88} />
          <View>
            <Text style={styles.romaji}>{kana.romaji[0]}</Text>
            <View style={styles.belt}>
              <BeltIcon belt={details.belt} width={54} />
              <Text style={styles.beltText}>{capitalize(details.belt)} belt</Text>
            </View>
          </View>
          <Pressable role="button" aria-label={`Hear ${kana.char}`} onPress={onSpeak} hitSlop={8} style={styles.speak}>
            <SpeakerIcon color={colors.sumi} size={24} />
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <Metric label="Accuracy" value={accuracy} />
          <Metric label="Strike speed" value={speed} />
          <Metric label="Next drill" value={formatWait(details.dueInMs)} />
        </View>

        {tip && (
          <View style={styles.tip}>
            <BulbIcon />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        )}

        {details.mixUps.length > 0 && (
          <>
            <Text style={styles.mixUpsTitle}>Often mixed up with</Text>
            <View style={styles.mixUps}>
              {details.mixUps.map(({ char, count }) => (
                <View key={char} style={styles.chip}>
                  <Text style={styles.chipText}>
                    <Text style={styles.chipKana}>{char}</Text> {count} {count === 1 ? 'time' : 'times'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.button}>
          <PrimaryButton label={`Drill ${kana.char}`} onPress={onDrill} />
        </View>
      </View>
    </Modal>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  speak: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    marginLeft: 'auto',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.edge,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    paddingTop: 10,
    paddingHorizontal: 18,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.card,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    marginBottom: 14,
    borderRadius: 2,
    backgroundColor: colors.edge,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  romaji: {
    fontFamily: fonts.uiBlack,
    fontSize: 21,
    color: colors.sumi,
  },
  belt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  beltText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.sumi,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metric: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.paper,
  },
  metricLabel: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 11,
    color: colors.ink2,
  },
  metricValue: {
    fontFamily: fonts.uiBlack,
    fontSize: 18,
    color: colors.sumi,
  },
  tip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.indigoLight,
  },
  tipText: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.indigoDark,
  },
  mixUpsTitle: {
    marginTop: 12,
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  mixUps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.vermilionLight,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.vermilionDark,
  },
  chipKana: {
    fontFamily: fonts.jp,
  },
  button: {
    marginTop: 14,
  },
});
