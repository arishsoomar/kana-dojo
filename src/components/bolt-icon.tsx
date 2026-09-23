import Svg, { Path } from 'react-native-svg';

import { iconColors } from '@/constants/theme';

export function BoltIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M13.6 2 4.6 13.4h6.2L9.6 22l9.8-12.6h-6.4L13.6 2z"
        fill={iconColors.yellow}
        stroke={iconColors.yellowEdge}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
