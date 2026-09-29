import { router, usePathname } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import { useFriends } from '@/hooks/use-friends';
import { useHaptics } from '@/hooks/use-haptics';

import { FriendsIcon } from './friends-icon';

// How long it stays before sliding away by itself.
const SHOW_MS = 4500;
const HIDE_MS = 200;

// News from friends, wherever you are in the app: a banner slides down from the top when
// someone asks to be your friend or accepts your request. Tap it to open Friends. On the
// Friends screen itself it stays away: the list there already shows the change.
export function FriendBanner() {
  const { news, dismissNews } = useFriends();
  const onFriends = usePathname() === '/friends';
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const haptics = useHaptics();
  // 0 hidden above the screen, 1 in place.
  const shown = useSharedValue(0);

  const arrive = useEffectEvent(() => {
    if (onFriends) {
      dismissNews();
      return;
    }
    haptics.right();
    shown.set(reduceMotion ? 1 : withSpring(1, { damping: 16, stiffness: 170 }));
  });
  const leave = useEffectEvent(() => {
    shown.set(withTiming(0, { duration: reduceMotion ? 0 : HIDE_MS }));
  });

  useEffect(() => {
    if (!news) return;
    arrive();
    const timers = [setTimeout(leave, SHOW_MS), setTimeout(dismissNews, SHOW_MS + HIDE_MS)];
    return () => timers.forEach(clearTimeout);
  }, [news, dismissNews]);

  const sliding = useAnimatedStyle(() => ({
    opacity: Math.min(shown.get(), 1),
    transform: [{ translateY: -140 * (1 - shown.get()) }],
  }));

  if (!news || onFriends) return null;
  const text = news.kind === 'request' ? `${news.name} wants to be your friend` : `${news.name} accepted your request`;

  function open() {
    shown.set(0);
    dismissNews();
    router.push('/friends');
  }

  return (
    <Animated.View style={[styles.place, { top: insets.top + 8 }, sliding]} pointerEvents="box-none">
      <Pressable role="button" aria-label={`${text}. Open Friends`} onPress={open} style={styles.banner}>
        <View style={styles.icon}>
          <FriendsIcon color={colors.card} />
        </View>
        <View style={styles.words}>
          <Text style={styles.text} numberOfLines={2}>
            {text}
          </Text>
          <Text style={styles.hint}>{news.kind === 'request' ? 'Tap to answer' : 'Tap to see'}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  place: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.sumi,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.vermilion,
  },
  words: {
    flex: 1,
  },
  text: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.card,
  },
  hint: {
    marginTop: 2,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
});
