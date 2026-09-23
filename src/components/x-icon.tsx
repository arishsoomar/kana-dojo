import Svg, { Path } from 'react-native-svg';

export function XIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
