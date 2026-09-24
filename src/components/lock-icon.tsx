import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

export function LockIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" fill="none" stroke={color} strokeWidth={2.6} />
      <Rect x={5} y={10} width={14} height={11} rx={3.2} fill={color} />
      <Circle cx={12} cy={15.5} r={1.6} fill={colors.card} />
    </Svg>
  );
}
