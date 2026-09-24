import type { BottomTabBarProps } from 'expo-router/tabs';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

import { GamesIcon, HomeIcon, KanaIcon, ProfileIcon, RanksIcon, type TabIconProps } from './tab-icons';

const icons: Record<string, ComponentType<TabIconProps>> = {
  index: HomeIcon,
  games: GamesIcon,
  kana: KanaIcon,
  ranks: RanksIcon,
  profile: ProfileIcon,
};

export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View role="tablist" style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = icons[route.name];
        if (!Icon) throw new Error(`No tab icon for route "${route.name}"`);
        const label = descriptors[route.key]?.options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            role="tab"
            aria-label={label}
            aria-selected={focused}
            style={styles.tab}
            onPress={() => {
              if (!focused) navigation.navigate(route.name);
            }}>
            <Icon color={focused ? colors.sumi : colors.muted} />
            {focused && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
  },
  tab: {
    width: 48,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.vermilion,
  },
});
