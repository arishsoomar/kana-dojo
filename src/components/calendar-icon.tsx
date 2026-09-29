import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

// A day on a calendar page, for the daily kata.
export function CalendarIcon({ size = 22, color = colors.vermilion }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <Rect x={3.5} y={5} width={17} height={15.5} rx={2} />
      <Path d="M3.5 10h17M8 3v4M16 3v4" />
      <Path d="M10 14.5l1.5 1.5 3-3" strokeLinejoin="round" />
    </Svg>
  );
}
