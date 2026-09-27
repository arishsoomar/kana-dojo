import Svg, { Circle, Rect } from 'react-native-svg';

import { monColors as c } from '@/constants/theme';

// A mon: the old gold coin with a square hole.
export function MonIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill={c.coin} stroke={c.rim} strokeWidth={1.5} />
      <Circle cx={12} cy={12} r={7.2} fill="none" stroke={c.ring} strokeWidth={1} />
      <Rect x={9} y={9} width={6} height={6} fill={c.hole} stroke={c.rim} strokeWidth={1.2} />
    </Svg>
  );
}
