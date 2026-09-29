import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { dojoColors as c } from '@/constants/theme';
import type { BonsaiStage } from '@/core/dojo';

// The dojo's bonsai, which grows with the streak: a bare pot, a sprout, a young tree, a full
// tree, and a tree in blossom.
export function Bonsai({ stage, size = 60 }: { stage: BonsaiStage; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      {stage === 1 && <Path d="M30 40v-8M30 35c-3-3-6-3-7-1 2 2 5 2 7 1zM30 33c3-3 6-3 7-1-2 2-5 2-7 1z" stroke={c.leaf} strokeWidth={2} fill={c.leaf} />}
      {stage >= 2 && (
        <Path
          d={stage === 2 ? 'M30 40v-12M30 32l-5-4' : 'M30 40v-18M30 30l-7-6M30 26l6-5'}
          stroke={c.trunk}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      )}
      {stage === 2 && (
        <>
          <Circle cx={25} cy={27} r={5} fill={c.leaf} />
          <Circle cx={32} cy={24} r={6} fill={c.leafLight} />
        </>
      )}
      {stage >= 3 && (
        <>
          <Circle cx={22} cy={22} r={6} fill={c.leaf} />
          <Circle cx={37} cy={19} r={7} fill={c.leaf} />
          <Circle cx={30} cy={16} r={6} fill={c.leafLight} />
        </>
      )}
      {stage === 4 &&
        [
          [20, 20],
          [25, 24],
          [28, 13],
          [34, 17],
          [39, 22],
          [41, 16],
        ].map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill={c.blossom} />)}
      <Rect x={9} y={40} width={42} height={5} rx={1.5} fill={c.pot} stroke={c.potEdge} strokeWidth={1.8} />
      {stage === 0 && <Rect x={12} y={38.5} width={36} height={2} fill={c.soil} />}
      <Path d="M12 44h36l-4 12H16z" fill={c.pot} stroke={c.potEdge} strokeWidth={1.8} />
    </Svg>
  );
}
