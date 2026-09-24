import Svg, { Ellipse, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

export function HeartIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21.2l-1.4-1.3C5.4 15.3 2 12.2 2 8.4 2 5.3 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.3 22 8.4c0 3.8-3.4 6.9-8.6 11.5L12 21.2z"
        fill={color}
      />
      <Ellipse cx={7.2} cy={7.6} rx={2.2} ry={1.4} transform="rotate(-35 7.2 7.6)" fill={colors.card} opacity={0.45} />
    </Svg>
  );
}
