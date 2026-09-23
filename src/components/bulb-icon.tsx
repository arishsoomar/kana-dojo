import Svg, { Path, Rect } from 'react-native-svg';

import { iconColors } from '@/constants/theme';

export function BulbIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5a7 7 0 0 0-4.2 12.6c.8.6 1.2 1.4 1.2 2.4h6c0-1 .4-1.8 1.2-2.4A7 7 0 0 0 12 2.5z"
        fill={iconColors.yellow}
        stroke={iconColors.yellowEdge}
        strokeWidth={1.2}
      />
      <Rect x={9} y={18.5} width={6} height={3} rx={1.2} fill={iconColors.bulbBase} />
    </Svg>
  );
}
