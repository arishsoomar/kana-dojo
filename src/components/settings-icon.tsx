import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/constants/theme';

// A cog, for settings.
export function SettingsIcon({ size = 22, color = colors.ink2 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
      <Circle cx={12} cy={12} r={5.2} />
      <Circle cx={12} cy={12} r={2} />
    </Svg>
  );
}
