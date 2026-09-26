import Svg, { Path, Rect } from 'react-native-svg';

// A hanging plaque, for the Learn screen's unit card.
export function PlaqueIcon({ color, lines, size = 34 }: { color: string; lines: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 1.5v3" stroke={color} strokeWidth={1.6} />
      <Rect x={6.5} y={4.5} width={11} height={18} rx={1.5} fill={color} />
      <Path d="M10 9h4M10 13h4M10 17h3" stroke={lines} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
