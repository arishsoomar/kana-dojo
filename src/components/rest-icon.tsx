import Svg, { Path, Rect } from 'react-native-svg';

import { colors, iconColors } from '@/constants/theme';

// A moon on a blue tile: the rest day.
export function RestIcon({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={2} y={2} width={20} height={20} rx={5} fill={colors.indigo} />
      <Path d="M15 6.5a6 6 0 1 0 2.5 10.3A5 5 0 0 1 15 6.5z" fill={colors.card} />
      <Path d="M16.5 5.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill={iconColors.star} />
    </Svg>
  );
}
