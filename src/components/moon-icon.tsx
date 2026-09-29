import Svg, { Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

// A crescent moon: the monthly challenge's prize.
export function MoonIcon({ size = 30, color = colors.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" fill={color} />
    </Svg>
  );
}
