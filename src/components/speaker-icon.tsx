import Svg, { Path } from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
  muted?: boolean; // a cross instead of sound waves
};

export function SpeakerIcon({ color, size = 22, muted = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {muted ? (
        <Path d="M16 9.5l5 5M21 9.5l-5 5" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      ) : (
        <Path
          d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}
