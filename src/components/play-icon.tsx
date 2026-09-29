import Svg, { Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

// A play triangle.
export function PlayIcon({ size = 16, color = colors.sumi }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5z" fill={color} />
    </Svg>
  );
}
