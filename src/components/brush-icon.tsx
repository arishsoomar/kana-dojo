import Svg, { Path } from 'react-native-svg';

// A calligraphy brush, from the mock.
export function BrushIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20.5 3.5 11 13l-1.5-1.5L19 2z" fill={color} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9.5 12.5c-2.4-.3-4.4 1.4-4.6 3.7-.2 1.8-1 3-2.4 3.8 3.6 1.4 8.2.4 8.9-3.5z" fill={color} />
    </Svg>
  );
}
