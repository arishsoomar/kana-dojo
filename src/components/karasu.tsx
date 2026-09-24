import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { beltColors, colors, karasuColors as k } from '@/constants/theme';
import type { Belt } from '@/core/boxes';

export type KarasuMood = 'focus' | 'proud' | 'stern' | 'cheer' | 'gentle';

type Props = {
  mood: KarasuMood;
  size?: number;
  // The learner's overall rank. It sets Karasu's form: a white-belt fledgling, a green- or
  // brown-belt student, or a black-belt master with a staff.
  rank: Belt;
  // The belt he's wearing. Normally his rank's belt; the belt ceremony shows a new one.
  belt?: Belt;
};

// Karasu, drawn from the mocks. Rank changes his form; mood changes his face.
export function Karasu({ mood, size = 58, rank, belt = rank }: Props) {
  const fledgling = rank === 'white';
  const master = rank === 'black';
  const body = fledgling ? k.fledglingBody : k.body;
  // The master's spread wings and staff need a wider picture.
  const wide = master;

  return (
    <Svg
      width={size}
      height={wide ? (size * 122) / 164 : size}
      viewBox={wide ? '-32 -4 164 122' : '-8 -4 122 122'}
      accessibilityLabel={`Karasu, ${rank} belt, ${mood}`}>
      <Wings master={master} cheer={mood === 'cheer'} />
      <Tuft fledgling={fledgling} body={body} />

      {/* Shadow, body, chest */}
      <Ellipse cx={50} cy={112} rx={28} ry={3.5} fill={k.shadow} />
      <Path
        d="M50 16C68 16 78 30 78 46C86 60 86 78 80 90C74 102 62 106 50 106C38 106 26 102 20 90C14 78 14 60 22 46C22 30 32 16 50 16Z"
        fill={body}
        stroke={k.outline}
        strokeWidth={3}
      />
      <Ellipse cx={50} cy={84} rx={17} ry={14} fill={k.chest} />
      <Path d="M42 80l8 5 8-5M44 88l6 4 6-4" fill="none" stroke={k.chestLines} strokeWidth={2} strokeLinecap="round" />
      <Ellipse cx={36} cy={28} rx={6} ry={3} transform="rotate(-30 36 28)" fill={k.sheen} />

      {/* Green and brown belts wear a headband (gold at brown); the master wears a small hat. */}
      {!fledgling && !master && <Headband color={rank === 'brown' ? colors.gold : colors.vermilion} />}
      {master && (
        <Path d="M42 30L50 17 58 30 55 36H45Z" fill={k.hat} stroke={k.hatEdge} strokeWidth={1.5} strokeLinejoin="round" />
      )}

      <Eyes mood={mood} fledgling={fledgling} />
      <Beak open={mood === 'cheer'} fledgling={fledgling} />

      {master && (
        <>
          <Circle cx={36} cy={74} r={4} fill={k.eye} stroke={k.outline} strokeWidth={1.2} />
          <Circle cx={50} cy={72} r={4} fill={k.eye} stroke={k.outline} strokeWidth={1.2} />
          <Circle cx={64} cy={74} r={4} fill={k.eye} stroke={k.outline} strokeWidth={1.2} />
        </>
      )}
      <BeltKnot belt={belt} master={master} />
      <Path d="M40 106v6M36 112h8M60 106v6M56 112h8" stroke={k.beak} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

function Wings({ master, cheer }: { master: boolean; cheer: boolean }) {
  if (master) {
    return (
      <>
        <Path
          d="M24 62C4 44-14 42-26 50c8 2 12 6 14 10-8 0-14 4-16 10 8-2 14 0 18 4-6 2-9 7-9 12 12-6 24-6 36-2z"
          fill={k.wing}
          stroke={k.outline}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        <Path
          d="M76 62c20-18 38-20 50-12-8 2-12 6-14 10 8 0 14 4 16 10-8-2-14 0-18 4 6 2 9 7 9 12-12-6-24-6-36-2z"
          fill={k.wing}
          stroke={k.outline}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
        {/* The staff, with a gold ring at the top */}
        <Path d="M108 8v104" stroke={k.staff} strokeWidth={3.5} strokeLinecap="round" />
        <Circle cx={108} cy={10} r={7} fill="none" stroke={colors.gold} strokeWidth={2.5} />
      </>
    );
  }
  const left = cheer ? 'M24 58Q2 44 2 18Q18 32 32 50Z' : 'M20 64Q8 82 16 98Q26 86 28 72Z';
  const right = cheer ? 'M76 58Q98 44 98 18Q82 32 68 50Z' : 'M80 64Q92 82 84 98Q74 86 72 72Z';
  return (
    <>
      <Path d={left} fill={k.wing} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
      <Path d={right} fill={k.wing} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
    </>
  );
}

function Tuft({ fledgling, body }: { fledgling: boolean; body: string }) {
  return fledgling ? (
    <Path d="M42 20L34 2 46 12 52 0 56 12 66 4 58 20Z" fill={k.chest} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
  ) : (
    <Path d="M44 20L38 4 48 13 54 2 56 18Z" fill={body} stroke={k.outline} strokeWidth={2.5} strokeLinejoin="round" />
  );
}

function Headband({ color }: { color: string }) {
  return (
    <>
      <Path d="M22 31Q50 21 78 31L78 38Q50 28 22 38Z" fill={color} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M23 33L7 27 10 38ZM23 36L11 45 18 49Z" fill={color} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
    </>
  );
}

function Eyes({ mood, fledgling }: { mood: KarasuMood; fledgling: boolean }) {
  if (mood === 'proud' || mood === 'cheer') {
    // Closed, smiling eyes.
    return <Path d="M31 55q7-7 14 0M55 55q7-7 14 0" fill="none" stroke={k.eye} strokeWidth={3.4} strokeLinecap="round" />;
  }

  // Open eyes (bigger on the fledgling); the brows set the expression.
  const eye = fledgling ? 8 : 7;
  const pupil = fledgling ? 4 : 3.4;
  const brows =
    mood === 'stern' ? 'M29 40l16 7M71 40l-16 7' : mood === 'gentle' ? 'M29 46l14-4M71 46l-14-4' : 'M30 44l14 3M70 44l-14 3';
  return (
    <>
      <Circle cx={38} cy={53} r={eye} fill={k.eye} />
      <Circle cx={62} cy={53} r={eye} fill={k.eye} />
      <Circle cx={39.5} cy={54} r={pupil} fill={k.outline} />
      <Circle cx={60.5} cy={54} r={pupil} fill={k.outline} />
      {fledgling && mood === 'focus' ? (
        // No frown on the fledgling: bright highlights instead.
        <>
          <Circle cx={41.5} cy={51.5} r={1.6} fill={k.eye} />
          <Circle cx={62.5} cy={51.5} r={1.6} fill={k.eye} />
        </>
      ) : (
        <Path d={brows} stroke={k.brow} strokeWidth={mood === 'stern' ? 3.8 : 3.2} strokeLinecap="round" />
      )}
    </>
  );
}

function Beak({ open, fledgling }: { open: boolean; fledgling: boolean }) {
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
      <Path
        d={fledgling ? 'M45 59H55L50 70Z' : 'M43 59H57L50 73Z'}
        fill={k.beak}
        stroke={k.outline}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path d="M45 62h10" stroke={k.outline} strokeWidth={1.3} />
    </>
  );
}

// The belt around his middle, with its knot and tails. A black belt gets a red stripe.
function BeltKnot({ belt, master }: { belt: Belt; master: boolean }) {
  const fill = beltColors[belt];
  const edge = belt === 'white' ? k.lightBeltEdge : k.outline;
  return (
    <>
      <Path d="M19 88Q50 98 81 88L82 95Q50 105 18 95Z" fill={fill} stroke={edge} strokeWidth={1.8} strokeLinejoin="round" />
      <Rect x={45} y={91} width={10} height={9} rx={2} fill={fill} stroke={edge} strokeWidth={1.8} />
      <Path d="M47 99l-4 9M53 99l4 9" stroke={fill} strokeWidth={4.5} strokeLinecap="round" />
      {belt === 'white' && <Path d="M47 99l-4 9M53 99l4 9" stroke={k.lightBeltEdge} strokeWidth={1} opacity={0.7} />}
      {master && belt === 'black' && <Path d="M55.5 103l2-.8" stroke={colors.vermilion} strokeWidth={2.2} />}
    </>
  );
}
