import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { beltColors, colors, karasuColors as k } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

export type KarasuMood = 'focus' | 'proud' | 'stern' | 'cheer' | 'gentle';

type Props = {
  mood: KarasuMood;
  size?: number;
  belt?: Belt; // the belt he's wearing
};

// Karasu at the first stage (green belt), drawn from the mocks.
// Mood changes the eyes; 'cheer' also raises the wings and opens the beak.
export function Karasu({ mood, size = 58, belt = 'green' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="-8 -4 122 122" accessibilityLabel={`Karasu, ${mood}`}>
      {/* Wings, behind the body */}
      <Path d={mood === 'cheer' ? WINGS_UP_LEFT : WINGS_DOWN_LEFT} fill={k.wing} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
      <Path d={mood === 'cheer' ? WINGS_UP_RIGHT : WINGS_DOWN_RIGHT} fill={k.wing} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
      {/* Head tuft */}
      <Path d="M44 20L38 4 48 13 54 2 56 18Z" fill={k.body} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
      {/* Shadow, body, chest */}
      <Ellipse cx={50} cy={112} rx={28} ry={3.5} fill={k.shadow} />
      <Path
        d="M50 16C68 16 78 30 78 46C86 60 86 78 80 90C74 102 62 106 50 106C38 106 26 102 20 90C14 78 14 60 22 46C22 30 32 16 50 16Z"
        fill={k.body}
        stroke={k.outline}
        strokeWidth={3}
      />
      <Ellipse cx={50} cy={84} rx={17} ry={14} fill={k.chest} />
      <Path d="M42 80l8 5 8-5M44 88l6 4 6-4" fill="none" stroke={k.chestLines} strokeWidth={2} strokeLinecap="round" />
      <Ellipse cx={36} cy={28} rx={6} ry={3} transform="rotate(-30 36 28)" fill={k.sheen} />
      {/* Headband */}
      <Path d="M22 31Q50 21 78 31L78 38Q50 28 22 38Z" fill={colors.vermilion} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M23 33L7 27 10 38ZM23 36L11 45 18 49Z" fill={colors.vermilion} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
      <Eyes mood={mood} />
      <Beak open={mood === 'cheer'} />
      {/* Belt and feet */}
      <Path d="M19 88Q50 98 81 88L82 95Q50 105 18 95Z" fill={beltColors[belt]} stroke={k.outline} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M47 99l-4 9M53 99l4 9" stroke={beltColors[belt]} strokeWidth={4.5} strokeLinecap="round" />
      <Path d="M40 106v6M36 112h8M60 106v6M56 112h8" stroke={k.beak} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

const WINGS_DOWN_LEFT = 'M20 64Q8 82 16 98Q26 86 28 72Z';
const WINGS_DOWN_RIGHT = 'M80 64Q92 82 84 98Q74 86 72 72Z';
const WINGS_UP_LEFT = 'M24 58Q2 44 2 18Q18 32 32 50Z';
const WINGS_UP_RIGHT = 'M76 58Q98 44 98 18Q82 32 68 50Z';

function Beak({ open }: { open: boolean }) {
  if (open) {
    return (
      <>
        <Path d="M43 58H57L50 64Z" fill={k.beak} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M44 66H56L50 74Z" fill={k.beak} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M45 64.5h10" stroke={k.mouth} strokeWidth={2.5} />
      </>
    );
  }
  return (
    <>
      <Path d="M43 59H57L50 73Z" fill={k.beak} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M45 62h10" stroke={k.outline} strokeWidth={1.3} />
    </>
  );
}

function Eyes({ mood }: { mood: KarasuMood }) {
  if (mood === 'proud' || mood === 'cheer') {
    // Closed, smiling eyes.
    return <Path d="M31 55q7-7 14 0M55 55q7-7 14 0" fill="none" stroke={k.eye} strokeWidth={3.4} strokeLinecap="round" />;
  }

  // Open eyes; the brows set the expression.
  const brows =
    mood === 'stern' ? 'M29 40l16 7M71 40l-16 7' : mood === 'gentle' ? 'M29 46l14-4M71 46l-14-4' : 'M30 44l14 3M70 44l-14 3';
  return (
    <>
      <Circle cx={38} cy={53} r={7} fill={k.eye} />
      <Circle cx={62} cy={53} r={7} fill={k.eye} />
      <Circle cx={39.5} cy={54} r={3.4} fill={k.outline} />
      <Circle cx={60.5} cy={54} r={3.4} fill={k.outline} />
      <Path d={brows} stroke={k.brow} strokeWidth={mood === 'stern' ? 3.8 : 3.2} strokeLinecap="round" />
    </>
  );
}
