import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { charmColors as c } from '@/constants/theme';
import type { Charm } from '@/core/dungeon';

// Each charm's little picture, from the mock: a paper lantern, a hint scroll, a lucky
// omamori, a cup of healing tea, and a wooden bokken.
export function CharmIcon({ charm, size = 24 }: { charm: Charm; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {charm === 'lantern' && (
        <>
          <Rect x={9} y={2} width={6} height={2.5} rx={1} fill={c.lanternCap} />
          <Ellipse cx={12} cy={12.5} rx={7} ry={8} fill={c.lanternBody} />
          <Path d="M5.5 10h13M5.3 13.5h13.4M6 17h12" stroke={c.lanternRibs} strokeWidth={1.2} />
          <Rect x={9} y={20} width={6} height={2.5} rx={1} fill={c.lanternCap} />
        </>
      )}
      {charm === 'hint' && (
        <>
          <Rect x={5} y={4} width={14} height={16} rx={2} fill={c.paper} stroke={c.wood} strokeWidth={1.4} />
          <Rect x={3} y={3} width={18} height={3} rx={1.5} fill={c.wood} />
          <Rect x={3} y={18} width={18} height={3} rx={1.5} fill={c.wood} />
          <Path d="M8.5 10h7M8.5 13h5" stroke={c.wood} strokeWidth={1.4} strokeLinecap="round" />
        </>
      )}
      {charm === 'omamori' && (
        <>
          <Path d="M12 1.8v3" stroke={c.omamoriString} strokeWidth={1.6} />
          <Path d="M6.5 7.5L12 4.5l5.5 3V20a1.8 1.8 0 0 1-1.8 1.8H8.3A1.8 1.8 0 0 1 6.5 20z" fill={c.omamoriBody} stroke={c.omamoriEdge} strokeWidth={1.2} />
          <Rect x={9} y={10} width={6} height={8} rx={1} fill={c.paper} />
          <Path d="M10.5 12.3h3M10.5 14.3h3M10.5 16.3h2" stroke={c.omamoriEdge} strokeWidth={1} />
        </>
      )}
      {charm === 'tea' && (
        <>
          <Path d="M9 3.5c-1 1.2 1 2 0 3.4M13 3c-1 1.2 1 2 0 3.4" stroke={c.steam} strokeWidth={1.3} strokeLinecap="round" fill="none" />
          <Path d="M4.5 9h15l-1.4 9.2A3 3 0 0 1 15.1 21H8.9a3 3 0 0 1-3-2.8z" fill={c.teaCup} stroke={c.teaCupEdge} strokeWidth={1.2} />
          <Ellipse cx={12} cy={9.2} rx={7.2} ry={1.6} fill={c.tea} />
        </>
      )}
      {charm === 'bokken' && (
        <>
          <Path d="M18.8 3.2l2 2-10.6 10.6-2-2z" fill={c.wood} />
          <Path d="M7.4 13.6l3 3" stroke={c.bokkenGrip} strokeWidth={2.2} strokeLinecap="round" />
          <Path d="M4 20l4.2-4.2" stroke={c.bokkenGrip} strokeWidth={3} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

// The floor chip's arched door.
export function DoorIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 21V10a7 7 0 0 1 14 0v11z" fill={c.door} />
      <Path d="M12 5v16M8 12h1.5M14.5 12H16" stroke={c.doorLines} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
