import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

// A clock face, for time left.
export function ClockIcon({ size = 14, color = colors.ink2 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round">
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" strokeLinejoin="round" />
    </Svg>
  );
}
