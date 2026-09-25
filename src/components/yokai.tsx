import Svg, { Circle, Ellipse, Path, Text } from 'react-native-svg';

import { fonts, yokaiColors } from '@/constants/theme';

type Props = {
  char: string; // the kana written on its belly
  size?: number; // width in points; the height follows the drawing's shape
  hue?: 'red' | 'slate';
};

// A kana spirit: a round horned body with angry brows, yellow eyes, a fanged grin, and its
// kana on its belly. Drawn on a 100-wide grid, like the mock.
export function Yokai({ char, size = 120, hue = 'slate' }: Props) {
  const body = hue === 'red' ? yokaiColors.redBody : yokaiColors.slateBody;
  const dark = yokaiColors.outline;

  return (
    <Svg width={size} height={(size * 106) / 112} viewBox="-6 -6 112 106">
      <Ellipse cx={50} cy={95} rx={30} ry={4} fill={yokaiColors.shadow} />
      {/* Horns */}
      <Path d="M28 34C17 22 19 7 26 0C28 13 35 21 41 27Z" fill={yokaiColors.horn} stroke={dark} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M72 34C83 22 81 7 74 0C72 13 65 21 59 27Z" fill={yokaiColors.horn} stroke={dark} strokeWidth={3} strokeLinejoin="round" />
      {/* Body */}
      <Path d="M50 20C76 20 90 42 90 63C90 83 73 91 50 91C27 91 10 83 10 63C10 42 24 20 50 20Z" fill={body} stroke={dark} strokeWidth={3.5} />
      {/* Angry brows */}
      <Path d="M28 38l14 5M72 38l-14 5" stroke={dark} strokeWidth={4} strokeLinecap="round" />
      {/* Eyes */}
      <Ellipse cx={38} cy={50} rx={7} ry={6} fill={yokaiColors.eye} stroke={dark} strokeWidth={2.2} />
      <Ellipse cx={62} cy={50} rx={7} ry={6} fill={yokaiColors.eye} stroke={dark} strokeWidth={2.2} />
      <Circle cx={39.5} cy={51.5} r={3} fill={dark} />
      <Circle cx={60.5} cy={51.5} r={3} fill={dark} />
      {/* Grin and fang */}
      <Path d="M41 60q9 6 18 0" fill="none" stroke={dark} strokeWidth={3} strokeLinecap="round" />
      <Path d="M44.5 61.8l2.2 5 2-4.4z" fill={yokaiColors.fang} stroke={dark} strokeWidth={1.2} strokeLinejoin="round" />
      {/* Belly, with its kana */}
      <Ellipse cx={50} cy={78} rx={21} ry={12} fill={yokaiColors.belly} stroke={dark} strokeWidth={2.2} />
      <Text x={50} y={86} textAnchor="middle" fontFamily={fonts.jp} fontSize={22} fill={dark}>
        {char}
      </Text>
    </Svg>
  );
}
