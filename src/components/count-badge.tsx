import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';

// A small red count in the top corner of an icon, like "2" requests waiting. Nothing at 0.
// Put it inside a view that wraps the icon (it's placed against that view's corner).
export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.badge} pointerEvents="none">
      <Text style={styles.text}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -7,
    right: -9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.paper,
    backgroundColor: colors.vermilion,
  },
  text: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 10,
    color: colors.card,
  },
});
