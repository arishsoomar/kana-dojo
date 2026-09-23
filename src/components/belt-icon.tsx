import Svg, { Path, Rect } from 'react-native-svg';

import { beltColors, beltEdges } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

// A tied belt in the given color.
export function BeltIcon({ belt, width = 52 }: { belt: Belt; width?: number }) {
  const fill = beltColors[belt];
  const edge = belt === 'white' ? beltEdges.light : beltEdges.dark;
  return (
    <Svg width={width} height={(width * 22) / 56} viewBox="0 0 56 22">
      <Rect x={0} y={4} width={56} height={8} rx={1.5} fill={fill} stroke={edge} strokeWidth={1.2} />
      <Path d="M24 11L18 21H23L27 13ZM32 11L38 21H33L29 13Z" fill={fill} stroke={edge} strokeWidth={1.2} strokeLinejoin="round" />
      <Rect x={23} y={2} width={10} height={12} rx={2} fill={fill} stroke={edge} strokeWidth={1.2} />
    </Svg>
  );
}
