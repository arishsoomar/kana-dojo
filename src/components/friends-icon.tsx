import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

// Two people, side by side: friends.
export function FriendsIcon({ size = 22, color = colors.ink2 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx={8.5} cy={8} r={3.6} />
      <Path d="M1.5 20a7 6.5 0 0 1 14 0z" />
      <Circle cx={16.5} cy={7} r={3} opacity={0.7} />
      <Path d="M14.2 12.6a6 6 0 0 1 8.3 6.4h-5.3a8.6 8.6 0 0 0-3-6.4z" opacity={0.7} />
    </Svg>
  );
}
