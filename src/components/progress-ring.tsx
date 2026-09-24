import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';

type Props = {
  // How full the ring is, from 0 to 1.
  fraction: number;
  label: string;
  size?: number;
  stroke?: number;
};

export function ProgressRing({ fraction, label, size = 58, stroke = 8 }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} fill="none" stroke={colors.line} strokeWidth={stroke} />
        {/* A dash as long as the filled share of the circle, starting from the top.
            Skipped at 0, where the rounded line ends would still draw a dot. */}
        {fraction > 0 && <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.sumi}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${fraction * circumference} ${circumference}`}
          transform={`rotate(-90 ${center} ${center})`}
        />}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.labelBox]}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.uiBlack,
    fontSize: 16,
    color: colors.sumi,
  },
});
