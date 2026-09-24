import Svg, { Path } from 'react-native-svg';

import { iconColors } from '@/constants/theme';

export function FlameIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.2c.7 3 4.4 4.7 5.8 8.3 1.7 4.4-.9 10.7-5.8 10.7s-7.6-4.3-6.3-8.5c.6-2.1 2-3.2 2.7-4.4.3 1.6 1.2 2.7 2.2 3-.4-3.2.1-6.4 1.4-9.1z"
        fill={iconColors.flame}
      />
      <Path
        d="M12 12.2c1.6 1.4 3.1 2.8 2.7 5.1-.3 1.8-1.4 2.9-2.7 2.9s-2.5-1-2.7-2.7c-.3-2.1.9-3.3 2.7-5.3z"
        fill={iconColors.yellow}
      />
    </Svg>
  );
}
