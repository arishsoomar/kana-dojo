import { Circle, G, Path } from 'react-native-svg';

import { gearColors as c, karasuColors as k } from '@/constants/theme';

// Karasu's gear, drawn on his 100-wide grid (see karasu.tsx): his head is at the top, his eyes
// around y 53, his belt at y 88–100. Each piece belongs to a layer, so it sits in front of or
// behind the right parts of him. The haori, kitsune mask and bokken are the mock's drawings.

// Behind his body: things held over the shoulder.
export function GearBehind({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.includes('bokken') && <Bokken blade={c.bokken} edge={c.bokkenEdge} />}
      {ids.includes('golden-bokken') && <Bokken blade={c.golden} edge={c.goldenEdge} />}
      {ids.includes('wagasa') && (
        <>
          <Path d="M82 104L94 36" stroke={c.handle} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M68 42Q92 6 114 40Q92 32 68 42Z" fill={c.wagasa} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M92 24L80 39M92 24L92 34M92 24L104 37" stroke={c.wagasaRib} strokeWidth={1.2} />
        </>
      )}
    </>
  );
}

function Bokken({ blade, edge }: { blade: string; edge: string }) {
  return (
    <>
      <Path d="M86 104L108 26" stroke={blade} strokeWidth={5.5} strokeLinecap="round" />
      <Path d="M86 104L108 26" stroke={edge} strokeWidth={1.2} />
      <Path d="M85 86l11 3.5" stroke={c.grip} strokeWidth={3.5} strokeLinecap="round" />
    </>
  );
}

// Over his body, under his belt: jackets and the scarf.
export function GearOnBody({ ids }: { ids: readonly string[] }) {
  const haori = ids.includes('haori') ? c.haori : ids.includes('night-haori') ? c.nightHaori : null;
  return (
    <>
      {haori && (
        <>
          <Path d="M22 58Q14 84 22 104L42 106L46 64Z" fill={haori} stroke={k.outline} strokeWidth={2.2} strokeLinejoin="round" />
          <Path d="M78 58Q86 84 78 104L58 106L54 64Z" fill={haori} stroke={k.outline} strokeWidth={2.2} strokeLinejoin="round" />
          <Circle cx={30} cy={80} r={3} fill={c.haoriMon} />
          <Circle cx={70} cy={80} r={3} fill={c.haoriMon} />
        </>
      )}
      {ids.includes('scarf') && (
        <>
          <Path d="M22 72Q50 84 78 72L78 80Q50 92 22 80Z" fill={c.scarf} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M64 82L72 102L62 100Z" fill={c.scarf} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M30 78Q50 86 70 78" stroke={c.scarfStripe} strokeWidth={1.4} fill="none" />
        </>
      )}
    </>
  );
}

// On his head, in place of his rank's headband or hat.
export function GearOnHead({ ids }: { ids: readonly string[] }) {
  if (ids.includes('hachimaki')) {
    return (
      <>
        <Path d="M22 31Q50 21 78 31L78 38Q50 28 22 38Z" fill={c.hachimaki} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M23 33L7 27 10 38ZM23 36L11 45 18 49Z" fill={c.hachimaki} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
        <Circle cx={50} cy={29} r={3.2} fill={c.hachimakiSun} />
      </>
    );
  }
  if (ids.includes('kasa')) {
    return (
      <>
        <Path d="M4 32L50 2L96 32Q50 42 4 32Z" fill={c.straw} stroke={k.outline} strokeWidth={2.2} strokeLinejoin="round" />
        <Path d="M50 2V36M27 17L36 36M73 17L64 36" stroke={c.strawLines} strokeWidth={1.3} />
      </>
    );
  }
  if (ids.includes('sakura')) {
    return (
      <>
        {[
          [30, 24],
          [50, 16],
          [70, 24],
        ].map(([x = 0, y = 0]) => (
          <G key={x}>
            {[0, 72, 144, 216, 288].map((angle) => (
              <Circle
                key={angle}
                cx={x + 4 * Math.cos((angle * Math.PI) / 180)}
                cy={y + 4 * Math.sin((angle * Math.PI) / 180)}
                r={3.4}
                fill={c.sakura}
                stroke={k.outline}
                strokeWidth={0.8}
              />
            ))}
            <Circle cx={x} cy={y} r={2} fill={c.sakuraCenter} />
          </G>
        ))}
      </>
    );
  }
  if (ids.includes('eboshi')) {
    return (
      <>
        <Path d="M38 26L41 2Q52 -6 62 4L62 26Q50 30 38 26Z" fill={c.eboshi} stroke={k.hatEdge} strokeWidth={1.5} strokeLinejoin="round" />
        <Path d="M40 27Q50 33 60 27" stroke={c.eboshiTie} strokeWidth={2} fill="none" />
      </>
    );
  }
  return null;
}

// In front of his face, and things held in front of him.
export function GearInFront({ ids }: { ids: readonly string[] }) {
  return (
    <>
      {ids.includes('glasses') && (
        <>
          <Circle cx={38} cy={53} r={9.5} fill="none" stroke={c.glasses} strokeWidth={2.2} />
          <Circle cx={62} cy={53} r={9.5} fill="none" stroke={c.glasses} strokeWidth={2.2} />
          <Path d="M47.5 52h5M28.5 51l-7-3M71.5 51l7-3" stroke={c.glasses} strokeWidth={2} strokeLinecap="round" />
          <Path d="M32 48l3-2M56 48l3-2" stroke={c.glassesShine} strokeWidth={1.4} strokeLinecap="round" />
        </>
      )}
      {/* Masks are worn pushed up to the side of the head, as at a festival. */}
      {ids.includes('kitsune') && (
        <G transform="rotate(22 78 26)">
          <Path d="M69 22L67 10 74 16H84L91 10 89 22Q91 33 79 36Q67 33 69 22Z" fill={c.kitsune} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M72 24l5 1.5M86 24l-5 1.5" stroke={k.outline} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M75 17l2.5 3M83 17l-2.5 3M79 29v3" stroke={c.kitsuneMarks} strokeWidth={1.8} strokeLinecap="round" />
        </G>
      )}
      {ids.includes('oni-mask') && (
        <G transform="rotate(22 78 26)">
          <Path d="M70 15l-4-9 7 6ZM88 15l4-9-7 6Z" fill={c.oniHorn} stroke={k.outline} strokeWidth={1.6} strokeLinejoin="round" />
          <Path d="M69 22L69 14Q79 9 89 14L89 22Q91 33 79 36Q67 33 69 22Z" fill={c.oni} stroke={k.outline} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M71 20l6 2M87 20l-6 2" stroke={k.outline} strokeWidth={2.2} strokeLinecap="round" />
          <Circle cx={74.5} cy={24} r={1.8} fill={c.oniEyes} />
          <Circle cx={83.5} cy={24} r={1.8} fill={c.oniEyes} />
          <Path d="M74 30q5 3 10 0" stroke={k.outline} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </G>
      )}
      {ids.includes('fan') && (
        <>
          <Path d="M82 88L70 62A28 28 0 0 1 104 72Z" fill={c.fanPaper} stroke={k.outline} strokeWidth={1.8} strokeLinejoin="round" />
          <Path d="M82 88L78 62M82 88L88 62M82 88L97 65" stroke={c.fanRib} strokeWidth={1} />
          <Path d="M70 62A28 28 0 0 1 104 72" stroke={c.fanRim} strokeWidth={3} fill="none" />
        </>
      )}
    </>
  );
}

// Whether he's holding something, which takes the place of the master's staff.
export function holdsSomething(ids: readonly string[]): boolean {
  return ['bokken', 'golden-bokken', 'wagasa', 'fan'].some((id) => ids.includes(id));
}

// Whether he's wearing something on his head, which takes the place of his rank's headband or hat.
export function wearsHeadgear(ids: readonly string[]): boolean {
  return ['hachimaki', 'kasa', 'sakura', 'eboshi'].some((id) => ids.includes(id));
}
