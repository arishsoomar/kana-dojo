import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { Karasu } from '@/components/karasu';
import { LockIcon } from '@/components/lock-icon';
import { MonIcon } from '@/components/mon-icon';
import { PrimaryButton } from '@/components/primary-button';
import { RestIcon } from '@/components/rest-icon';
import { colors, fonts } from '@/constants/theme';
import { buyGear, buyRestDay, equip, GEAR, gearById, owns, REST_DAY_PRICE, unequip, type GearItem } from '@/core/gear';
import { useHaptics } from '@/hooks/use-haptics';
import { useMon } from '@/hooks/use-mon';
import { useProgress } from '@/hooks/use-progress';
import { useRank } from '@/hooks/use-rank';
import { useStreak } from '@/hooks/use-streak';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// The supply shed, from the mock: spend mon on a rest day, or gear for Karasu. Gear is all
// for looks; some can only be earned. Tap a piece to see it on Karasu, then buy, wear or take
// it off.
export default function ShedScreen() {
  const insets = useSafeAreaInsets();
  const { progress, updateProgress } = useProgress();
  const { balance, feats } = useMon();
  const streak = useStreak();
  const rank = useRank();
  const haptics = useHaptics();
  const worn = progress.settings.gear;
  const [picked, setPicked] = useState<GearItem | null>(null);

  // Karasu as he'd look with the picked piece on: his gear, with it in its slot.
  const preview = picked ? [...worn.filter((id) => gearById(id)?.slot !== picked.slot), picked.id] : worn;

  function buyRest() {
    const next = buyRestDay(progress, Date.now(), streak.restDays, balance);
    if (!next) return;
    haptics.success();
    updateProgress(next);
  }

  function buy(item: GearItem) {
    const next = buyGear(progress, item, Date.now(), balance, feats);
    if (!next) return;
    haptics.success();
    // A new piece goes straight on.
    updateProgress(equip(next, item));
  }

  const toBuy = GEAR.filter((g) => g.price !== null);
  const toEarn = GEAR.filter((g) => g.unlock);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Supply shed</Text>
        <View style={styles.balance} aria-label={`${balance} mon`}>
          <MonIcon />
          <Text style={styles.balanceText}>{balance}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (picked ? 170 : 24) }]}>
        <Text style={styles.heading}>Supplies</Text>
        <Pressable
          role="button"
          aria-label={`Buy a rest day for ${REST_DAY_PRICE} mon`}
          onPress={buyRest}
          disabled={streak.restDays >= streak.maxRestDays || balance < REST_DAY_PRICE}
          style={styles.supply}>
          <RestIcon size={40} />
          <View style={styles.supplyText}>
            <Text style={styles.supplyName}>Rest day</Text>
            <Text style={styles.supplySub}>
              {streak.restDays} of {streak.maxRestDays} held
              {streak.restDays >= streak.maxRestDays ? ' · You hold the most you can' : ' · Keeps your streak through a missed day'}
            </Text>
          </View>
          <Price amount={REST_DAY_PRICE} short={balance < REST_DAY_PRICE} />
        </Pressable>

        <Text style={styles.heading}>Karasu&apos;s gear</Text>
        <View style={styles.grid}>
          {toBuy.map((item) => (
            <GearCard
              key={item.id}
              item={item}
              rank={rank}
              owned={owns(progress, item, feats)}
              wearing={worn.includes(item.id)}
              picked={picked?.id === item.id}
              short={balance < (item.price ?? 0)}
              onPress={() => setPicked(item)}
            />
          ))}
        </View>

        <Text style={styles.heading}>Earned by training</Text>
        <View style={styles.grid}>
          {toEarn.map((item) => (
            <GearCard
              key={item.id}
              item={item}
              rank={rank}
              owned={owns(progress, item, feats)}
              wearing={worn.includes(item.id)}
              picked={picked?.id === item.id}
              short={false}
              onPress={() => setPicked(item)}
            />
          ))}
        </View>

        <View style={styles.note}>
          <MonIcon />
          <Text style={styles.noteText}>
            Mon come from lessons, games, duels, belt exams and every day you train. They can&apos;t be bought with money, and
            nothing here makes the training easier.
          </Text>
        </View>
      </ScrollView>

      {/* The picked piece: Karasu wearing it, and what can be done with it. */}
      {picked && (
        <View style={[styles.tray, { paddingBottom: insets.bottom + 14 }]}>
          <Karasu mood="proud" rank={rank} size={96} gear={preview} />
          <View style={styles.trayText}>
            <Text style={styles.trayName}>{picked.name}</Text>
            <Text style={styles.traySub}>
              {picked.unlock
                ? owns(progress, picked, feats)
                  ? `Earned: ${picked.unlock.about.toLowerCase()}`
                  : `${picked.unlock.about} to earn it (${Math.min(feats[picked.unlock.feat], picked.unlock.count)} of ${picked.unlock.count})`
                : `${picked.price} mon`}
            </Text>
            <TrayButton
              item={picked}
              owned={owns(progress, picked, feats)}
              wearing={worn.includes(picked.id)}
              short={balance < (picked.price ?? 0)}
              onBuy={() => buy(picked)}
              onWear={() => updateProgress(equip(progress, picked))}
              onTakeOff={() => updateProgress(unequip(progress, picked))}
            />
          </View>
        </View>
      )}
    </View>
  );
}

type TrayButtonProps = {
  item: GearItem;
  owned: boolean;
  wearing: boolean;
  short: boolean;
  onBuy: () => void;
  onWear: () => void;
  onTakeOff: () => void;
};

function TrayButton({ item, owned, wearing, short, onBuy, onWear, onTakeOff }: TrayButtonProps) {
  if (wearing) return <PrimaryButton label="Take it off" tone="light" onPress={onTakeOff} />;
  if (owned) return <PrimaryButton label="Wear it" tone="pine" onPress={onWear} />;
  if (item.unlock) return <PrimaryButton label="Not earned yet" disabled onPress={() => {}} />;
  return <PrimaryButton label={short ? 'Not enough mon yet' : `Buy for ${item.price} mon`} tone="gold" disabled={short} onPress={onBuy} />;
}

type GearCardProps = {
  item: GearItem;
  rank: ReturnType<typeof useRank>;
  owned: boolean;
  wearing: boolean;
  picked: boolean;
  short: boolean;
  onPress: () => void;
};

// One piece of gear: Karasu wearing just it, and its price, "Owned", "Wearing", or a lock.
function GearCard({ item, rank, owned, wearing, picked, short, onPress }: GearCardProps) {
  const locked = !owned && item.unlock !== undefined;
  return (
    <Pressable
      role="button"
      aria-label={`${item.name}${wearing ? ', wearing' : owned ? ', owned' : ''}`}
      onPress={onPress}
      style={[styles.card, wearing && styles.cardWearing, picked && styles.cardPicked]}>
      <View style={locked && styles.lockedArt}>
        <Karasu mood="focus" rank={rank} size={66} gear={[item.id]} />
      </View>
      <Text style={styles.cardName} numberOfLines={1}>
        {item.name}
      </Text>
      {wearing ? (
        <Text style={[styles.cardFoot, styles.wearingText]}>Wearing</Text>
      ) : owned ? (
        <Text style={styles.cardFoot}>Owned</Text>
      ) : locked ? (
        <View style={styles.lockRow}>
          <LockIcon color={colors.muted} />
        </View>
      ) : (
        <Price amount={item.price ?? 0} short={short} small />
      )}
    </Pressable>
  );
}

function Price({ amount, short, small = false }: { amount: number; short: boolean; small?: boolean }) {
  return (
    <View style={[styles.price, small && styles.priceSmall]}>
      <MonIcon size={small ? 13 : 16} />
      <Text style={[styles.priceText, small && styles.priceTextSmall, short && styles.priceShort]}>{amount}</Text>
    </View>
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
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.sumi,
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  balanceText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 17,
    color: colors.sumi,
  },
  content: {
    gap: 9,
    paddingHorizontal: 18,
  },
  heading: {
    marginTop: 10,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  supply: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  supplyText: {
    flex: 1,
  },
  supplyName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  supplySub: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.ink2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  card: {
    alignItems: 'center',
    width: '31.3%',
    flexGrow: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  cardWearing: {
    borderWidth: 2,
    borderColor: colors.pine,
  },
  cardPicked: {
    borderWidth: 2,
    borderColor: colors.sumi,
  },
  lockedArt: {
    opacity: 0.4,
  },
  cardName: {
    marginTop: 2,
    fontFamily: fonts.uiBold,
    fontSize: 11,
    color: colors.sumi,
  },
  cardFoot: {
    marginTop: 2,
    fontFamily: fonts.uiExtraBold,
    fontSize: 11,
    color: colors.ink2,
  },
  wearingText: {
    color: colors.pineDark,
  },
  lockRow: {
    marginTop: 1,
    transform: [{ scale: 0.7 }],
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  priceSmall: {
    marginTop: 2,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  priceText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  priceTextSmall: {
    fontSize: 11,
  },
  priceShort: {
    color: colors.muted,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink2,
  },
  tray: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    paddingHorizontal: 18,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    backgroundColor: colors.card,
  },
  trayText: {
    flex: 1,
    gap: 6,
  },
  trayName: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 17,
    color: colors.sumi,
  },
  traySub: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.ink2,
  },
});
