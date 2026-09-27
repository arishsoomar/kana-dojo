import Svg, { Ellipse, Path } from 'react-native-svg';

import { taikoColors as c } from '@/constants/theme';

// A taiko drum with two sticks, from the mock.
export function DrumIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 8v8c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V8" fill={c.body} />
      <Ellipse cx={12} cy={8} rx={8} ry={3.2} fill={c.skin} stroke={c.body} strokeWidth={1.6} />
      <Path d="M2 2l7 6M22 2l-7 6" stroke={c.sticks} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
