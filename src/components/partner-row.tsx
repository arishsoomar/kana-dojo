import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { MON } from '@/core/mon';
import type { PartnerGoal } from '@/core/partner';

import { CheckIcon } from './check-icon';
import { FriendsIcon } from './friends-icon';
import { MonIcon } from './mon-icon';

type Choice = { userId: string; name: string };

type Props = {
  signedIn: boolean;
  myName: string | null;
  choices: readonly Choice[]; // friends to partner with
  chosen: boolean; // someone was chosen today (even if they're no longer a friend)
  partner: Choice | null; // the chosen friend
  goal: PartnerGoal | null;
  onChoose: (friend: string) => void;
  onSetUp: () => void; // sign in, or add a friend
  onTrain: () => void; // go and do the goal
};

// The fourth assignment: a goal shared with a friend, from the mock. Both of you as avatars,
// "You and Kenji: 500 XP", and one bar with both your parts. Before a partner's chosen, the
// friends to choose from; before there are friends, a way to add one.
export function PartnerRow({ signedIn, myName, choices, chosen, partner, goal, onChoose, onSetUp, onTrain }: Props) {
  if (!signedIn || choices.length === 0) {
    return (
      <Pressable role="button" onPress={onSetUp} style={styles.row}>
        <View style={styles.icon}>
          <FriendsIcon color={colors.indigoDark} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Train with a friend</Text>
          <Text style={styles.detail}>
            {signedIn ? 'Add a friend to share a daily goal.' : 'Sign in and add a friend to share a daily goal.'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  if (!chosen) {
    return (
      <View style={[styles.row, styles.column]}>
        <View style={styles.choosing}>
          <View style={styles.icon}>
            <FriendsIcon color={colors.indigoDark} />
          </View>
          <View style={styles.text}>
            <Text style={styles.title}>Choose today&apos;s partner</Text>
            <Text style={styles.detail}>A goal you share, for {MON.partner} mon each. It holds for the day.</Text>
          </View>
        </View>
        <View style={styles.chips} role="radiogroup">
          {choices.map((f) => (
            <Pressable key={f.userId} role="button" aria-label={`Partner with ${f.name}`} onPress={() => onChoose(f.userId)} style={styles.friendChip}>
              <Avatar name={f.name} color={colors.indigo} />
              <Text style={styles.friendName} numberOfLines={1}>
                {f.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  if (!partner || !goal) {
    return (
      <View style={styles.row}>
        <Text style={styles.detail}>Today&apos;s partner isn&apos;t a friend any more. Choose again tomorrow.</Text>
      </View>
    );
  }

  const { kind, mine, theirs, count, target, done } = goal;
  const title =
    kind === 'xp'
      ? `You and ${partner.name}: ${target} XP`
      : kind === 'lessons'
        ? `You and ${partner.name}: ${target} lessons`
        : `You and ${partner.name}: both play the kata`;
  const parts =
    kind === 'kata'
      ? `You: ${mine ? 'played' : 'not yet'} · ${partner.name}: ${theirs ? 'played' : 'not yet'}`
      : `You ${mine} · ${partner.name} ${theirs}`;

  return (
    <Pressable role="button" aria-label={`${title}. ${done ? 'Done' : parts}`} onPress={onTrain} style={[styles.row, done && styles.rowDone]}>
      <View style={styles.avatars}>
        <Avatar name={myName ?? 'You'} color={colors.sumi} />
        <View style={styles.second}>
          <Avatar name={partner.name} color={colors.indigo} />
        </View>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}>{parts}</Text>
        {/* One bar, with your part and theirs side by side. */}
        <View style={styles.bar}>
          {done ? (
            <View style={[styles.fill, styles.full]} />
          ) : (
            <>
              <View style={[styles.fill, { width: `${(Math.min(mine, target) / target) * 100}%`, backgroundColor: colors.indigoDark }]} />
              <View style={[styles.fill, { width: `${((count - Math.min(mine, target)) / target) * 100}%`, backgroundColor: colors.indigo }]} />
            </>
          )}
        </View>
      </View>
      {done ? (
        <View style={styles.reward}>
          <CheckIcon color={colors.pineDark} />
          <Text style={styles.rewardText}>+{MON.partner}</Text>
          <MonIcon size={16} />
        </View>
      ) : (
        <Text style={styles.count}>
          {count}/{target}
        </Text>
      )}
    </Pressable>
  );
}

// A round avatar with someone's first letter, as in the mock.
function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.initial}>{[...name.trim()][0]?.toUpperCase() ?? '?'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  // Thicker border, with padding reduced to match, so the row doesn't grow.
  rowDone: {
    padding: 9.5,
    borderWidth: 2,
    borderColor: colors.pine,
  },
  column: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  choosing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.indigoLight,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  detail: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  chevron: {
    fontFamily: fonts.uiBold,
    fontSize: 22,
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: 160,
    paddingVertical: 4,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.indigo,
    backgroundColor: colors.indigoLight,
  },
  friendName: {
    flexShrink: 1,
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.indigoDark,
  },
  avatars: {
    flexDirection: 'row',
  },
  // The second avatar tucks behind the first's edge, with a white ring between them.
  second: {
    marginLeft: -10,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.card,
    marginTop: -2,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  initial: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.card,
  },
  bar: {
    flexDirection: 'row',
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  fill: {
    height: '100%',
  },
  full: {
    width: '100%',
    backgroundColor: colors.pine,
  },
  count: {
    minWidth: 44,
    textAlign: 'right',
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardText: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 13,
    color: colors.pineDark,
  },
});
