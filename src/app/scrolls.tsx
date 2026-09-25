import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { colors, fonts, scrollColors, wallColors } from '@/constants/theme';
import { scrolls, type Scroll } from '@/core/duel';
import { pairId } from '@/core/pairs';
import { useProgress } from '@/hooks/use-progress';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/games');
}

// The scroll collection: one slot per named pair. Won scrolls show the pair's tip; a ready
// pair starts its duel; the rest are locked until they've been mixed up enough.
export default function ScrollsScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const all = scrolls(progress);
  const won = all.filter((s) => s.state === 'won');
  const slots = all.filter((s) => s.state !== 'won');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={close} hitSlop={10}>
          <BackIcon color={colors.sumi} />
        </Pressable>
        <Text style={styles.title}>Technique scrolls</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            {won.length} of {all.length}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {won.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No scrolls yet. Win a duel to earn your first.</Text>
          </View>
        )}
        {won.map((scroll) => (
          <WonScroll key={pairId(scroll.pair)} scroll={scroll} />
        ))}

        <View style={styles.grid}>
          {slots.map((scroll) => (
            <Slot key={pairId(scroll.pair)} scroll={scroll} />
          ))}
        </View>

        <Text style={styles.note}>
          You earn a scroll by winning a duel. Each one keeps the trick for telling that pair apart, so your
          trophies double as a reference. A pair is ready to duel once you&apos;ve mixed it up 3 times.
        </Text>
      </ScrollView>
    </View>
  );
}

// "Sep 14", in the device's own timezone.
function shortDate(at: number): string {
  return new Date(at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function WonScroll({ scroll }: { scroll: Scroll }) {
  const { pair, firstWin } = scroll;
  return (
    <View style={styles.scroll}>
      <View style={styles.scrollKana}>
        <Text style={styles.bigKana}>{pair.kana[0]}</Text>
        <Text style={styles.bigKana}>{pair.kana[1]}</Text>
      </View>
      <Text style={styles.scrollName}>{pair.name}</Text>
      <Text style={styles.scrollTip}>{pair.tip}</Text>
      {firstWin && (
        <View style={styles.scrollFoot}>
          <Text style={styles.scrollResult}>
            Won {firstWin.score.mine} to {firstWin.score.theirs} on {shortDate(firstWin.at)}
          </Text>
          <View style={styles.hanko}>
            <Text style={styles.hankoText}>勝</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// A pair not won yet: tap a ready one to duel it.
function Slot({ scroll }: { scroll: Scroll }) {
  const { pair } = scroll;
  const ready = scroll.state === 'ready';
  const label = `${pair.kana.join(' ')}, ${ready ? 'ready to duel' : 'locked'}`;
  const content = (
    <>
      <Text style={styles.slotKana}>{pair.kana[0]}</Text>
      <Text style={styles.slotKana}>{pair.kana[1]}</Text>
      <Text style={[styles.slotState, ready && styles.slotReady]}>{ready ? 'Ready' : 'Locked'}</Text>
    </>
  );

  if (!ready) {
    return (
      <View style={[styles.slot, styles.slotLocked]} aria-label={label}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={() => router.push({ pathname: '/duel', params: { pair: pairId(pair) } })}
      style={styles.slot}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.edge,
    backgroundColor: colors.card,
  },
  chipText: {
    fontFamily: fonts.uiBold,
    fontSize: 12,
    color: colors.sumi,
  },
  content: {
    gap: 12,
    paddingHorizontal: 18,
  },
  empty: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.edge,
  },
  emptyText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    textAlign: 'center',
    color: colors.ink2,
  },
  scroll: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 4,
    borderWidth: 2,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderColor: wallColors.rail,
    backgroundColor: scrollColors.paper,
  },
  scrollKana: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  bigKana: {
    fontFamily: fonts.jp,
    fontSize: 52,
    lineHeight: 64,
    color: colors.sumi,
  },
  scrollName: {
    marginTop: 4,
    fontFamily: fonts.uiExtraBold,
    fontSize: 17,
    textAlign: 'center',
    color: colors.sumi,
  },
  scrollTip: {
    marginTop: 8,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
  scrollFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1.5,
    borderTopColor: scrollColors.rule,
  },
  scrollResult: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  hanko: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.vermilion,
    transform: [{ rotate: '-4deg' }],
  },
  hankoText: {
    fontFamily: fonts.jp,
    fontSize: 20,
    lineHeight: 26,
    color: colors.card,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  slot: {
    flexBasis: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  slotLocked: {
    opacity: 0.55,
  },
  slotKana: {
    fontFamily: fonts.jp,
    fontSize: 20,
    lineHeight: 26,
    color: colors.sumi,
  },
  slotState: {
    flex: 1,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    textAlign: 'right',
    color: colors.ink2,
  },
  slotReady: {
    fontFamily: fonts.uiBold,
    color: colors.vermilionDark,
  },
  note: {
    marginTop: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
});
