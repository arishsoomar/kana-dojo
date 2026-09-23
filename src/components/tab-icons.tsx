import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

// Cut-out details are painted in the tab bar's background color.
const cutout = colors.card;

export type TabIconProps = {
  color: string;
  size?: number;
};

export function HomeIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3 3 10.4V20a1.2 1.2 0 0 0 1.2 1.2H9.5v-6h5v6h5.3A1.2 1.2 0 0 0 21 20v-9.6z"
        fill={color}
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function GamesIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7 7h10a5 5 0 0 1 4.9 6l-.9 4.3a2.6 2.6 0 0 1-4.5 1.2L14.3 16H9.7l-2.2 2.5A2.6 2.6 0 0 1 3 17.3L2.1 13A5 5 0 0 1 7 7z"
        fill={color}
      />
      <Path d="M7.5 10v4M5.5 12h4" stroke={cutout} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={16} cy={11} r={1.2} fill={cutout} />
      <Circle cx={18} cy={13.2} r={1.2} fill={cutout} />
    </Svg>
  );
}

export function KanaIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2.5 5.4c3.2-1.4 6.4-1.3 9.5.9 3.1-2.2 6.3-2.3 9.5-.9V19.6c-3.2-1.4-6.4-1.3-9.5.9-3.1-2.2-6.3-2.3-9.5-.9z"
        fill={color}
      />
      <Path d="M12 6.4v13.8" stroke={cutout} strokeWidth={1.6} />
    </Svg>
  );
}

export function RanksIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6.5 3h11v5.5a5.5 5.5 0 0 1-11 0z" fill={color} />
      <Path
        d="M6.5 5H3.5v1.5a3.5 3.5 0 0 0 3.8 3.4M17.5 5h3v1.5a3.5 3.5 0 0 1-3.8 3.4"
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <Rect x={10.5} y={13} width={3} height={4} fill={color} />
      <Rect x={7} y={17} width={10} height={3.5} rx={1.2} fill={color} />
    </Svg>
  );
}

export function ProfileIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4.5} fill={color} />
      <Path d="M3.5 21a8.5 8 0 0 1 17 0z" fill={color} />
    </Svg>
  );
}
