import Svg, { Rect } from 'react-native-svg';

// Two cards, one tilted behind the other: memory match on the Games tab.
export function CardsIcon({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={5} width={11} height={15} rx={2.5} transform="rotate(-10 8.5 12.5)" fill={color} opacity={0.55} />
      <Rect x={10} y={4} width={11} height={15} rx={2.5} transform="rotate(8 15.5 11.5)" fill={color} />
    </Svg>
  );
}
