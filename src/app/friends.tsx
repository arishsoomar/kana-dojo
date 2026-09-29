import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { BeltIcon } from '@/components/belt-icon';
import { FlameIcon } from '@/components/flame-icon';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { colors, fonts } from '@/constants/theme';
import { formatFriendCode, NAME_MAX } from '@/core/friends';
import { useFriends } from '@/hooks/use-friends';
import type { Friend } from '@/storage/friends';

// How long "Remove" waits for its second tap.
const CONFIRM_MS = 3000;

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/dojo');
}

// Friends: your name and friend code, adding someone by theirs, requests, and your friends.
// Opened from the Dojo tab.
export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const friends = useFriends();
  const { status, profile } = friends;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        {status === 'signed-out' && (
          <Notice text="Friends need an account, so the dojo knows who you are. Signing in is free and keeps your progress safe too.">
            <PrimaryButton label="Sign in" onPress={() => router.push('/account')} />
          </Notice>
        )}
        {status === 'loading' && <Notice text="Opening the dojo's guest book…" />}
        {status === 'missing' && (
          <Notice text="Friends need a one-time setup on the server: run supabase/migrations/20261001000000_friends.sql in the Supabase dashboard's SQL editor." />
        )}
        {status === 'error' && (
          <Notice text="Couldn't reach the dojo. Check your connection.">
            <PrimaryButton label="Try again" onPress={() => void friends.refresh()} />
          </Notice>
        )}
        {status === 'no-profile' && <NameForm title="Choose your name" initial="" onSave={friends.saveName} />}

        {status === 'ready' && profile && (
          <>
            <YourCard name={profile.name} code={profile.code} onRename={friends.saveName} />
            <AddFriend onAdd={friends.add} />
            <FriendList friends={friends.friends} onAccept={friends.accept} onRemove={friends.remove} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Notice({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.body}>{text}</Text>
      {children}
    </View>
  );
}

function NameForm({ title, initial, onSave, onCancel }: { title: string; initial: string; onSave: (name: string) => Promise<string | null>; onCancel?: () => void }) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const problem = await onSave(name);
    setSaving(false);
    setError(problem);
    if (!problem) onCancel?.();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>Friends see this name. It doesn&apos;t have to be your real one.</Text>
      <TextField value={name} onChangeText={setName} placeholder="Your name" maxLength={NAME_MAX} aria-label="Your name" autoCorrect={false} />
      {error && <Text style={styles.error}>{error}</Text>}
      <PrimaryButton label={saving ? 'Saving…' : 'Save'} disabled={saving || name.trim().length === 0} onPress={() => void save()} />
      {onCancel && <PrimaryButton label="Cancel" tone="light" onPress={onCancel} />}
    </View>
  );
}

function YourCard({ name, code, onRename }: { name: string; code: string; onRename: (name: string) => Promise<string | null> }) {
  const [renaming, setRenaming] = useState(false);
  if (renaming) return <NameForm title="Change your name" initial={name} onSave={onRename} onCancel={() => setRenaming(false)} />;

  return (
    <View style={[styles.card, styles.dark]}>
      <View style={styles.row}>
        <Text style={[styles.cardTitle, styles.onDark]}>{name}</Text>
        <Pressable role="button" onPress={() => setRenaming(true)} hitSlop={8}>
          <Text style={styles.link}>Change</Text>
        </Pressable>
      </View>
      <Text style={styles.onDarkSoft}>Your friend code</Text>
      <Text style={styles.code} aria-label={`Friend code ${[...code].join(' ')}`}>
        {formatFriendCode(code)}
      </Text>
      <PrimaryButton
        label="Send your code"
        tone="light"
        onPress={() => {
          Share.share({ message: `Add me as a friend in Kana Dojo! My friend code is ${formatFriendCode(code)}.` }).catch(() => {
            // Sharing isn't available everywhere (some web browsers); the code is on screen anyway.
          });
        }}
      />
    </View>
  );
}

function AddFriend({ onAdd }: { onAdd: (code: string) => Promise<string> }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function add() {
    setAdding(true);
    const said = await onAdd(code);
    setAdding(false);
    setMessage(said);
    if (said.startsWith('Request sent') || said.includes('now friends')) setCode('');
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Add a friend</Text>
      <View style={styles.row}>
        <TextField
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          placeholder="Their code"
          autoCapitalize="characters"
          autoCorrect={false}
          aria-label="Friend code"
          style={styles.codeField}
          onSubmitEditing={() => void add()}
        />
        <View style={styles.addButton}>
          <PrimaryButton label="Add" disabled={adding || code.trim().length === 0} onPress={() => void add()} />
        </View>
      </View>
      {message && <Text style={styles.body}>{message}</Text>}
    </View>
  );
}

function FriendList({ friends, onAccept, onRemove }: { friends: Friend[]; onAccept: (id: string) => void; onRemove: (id: string) => void }) {
  const incoming = friends.filter((f) => f.state === 'incoming');
  const accepted = friends.filter((f) => f.state === 'accepted').sort((a, b) => a.name.localeCompare(b.name));
  const outgoing = friends.filter((f) => f.state === 'outgoing');

  return (
    <>
      {incoming.length > 0 && (
        <>
          <Text style={styles.heading}>Requests</Text>
          {incoming.map((f) => (
            <View key={f.userId} style={[styles.card, styles.row]}>
              <Text style={[styles.name, styles.grow]}>{f.name}</Text>
              <Pressable role="button" onPress={() => onRemove(f.userId)} hitSlop={8}>
                <Text style={styles.quiet}>Decline</Text>
              </Pressable>
              <Pressable role="button" onPress={() => onAccept(f.userId)} style={styles.accept}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}

      <Text style={styles.heading}>Your friends</Text>
      {accepted.length === 0 && <Text style={styles.body}>No friends yet. Send your code to someone, or add theirs.</Text>}
      {accepted.map((f) => (
        <View key={f.userId} style={[styles.card, styles.row]}>
          {f.summary && <BeltIcon belt={f.summary.rank} width={36} />}
          <View style={styles.grow}>
            <Text style={styles.name}>{f.name}</Text>
            {f.summary ? (
              <View style={styles.streak}>
                <FlameIcon size={14} />
                <Text style={styles.small}>
                  {f.summary.streak} {f.summary.streak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            ) : (
              <Text style={styles.small}>Hasn&apos;t trained since you became friends</Text>
            )}
          </View>
          <RemoveButton onRemove={() => onRemove(f.userId)} />
        </View>
      ))}

      {outgoing.length > 0 && (
        <>
          <Text style={styles.heading}>Waiting for them to accept</Text>
          {outgoing.map((f) => (
            <View key={f.userId} style={[styles.card, styles.row]}>
              <Text style={[styles.name, styles.grow]}>{f.name}</Text>
              <Pressable role="button" onPress={() => onRemove(f.userId)} hitSlop={8}>
                <Text style={styles.quiet}>Cancel</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}
    </>
  );
}

// "Remove", then "Tap to confirm" for a moment, so a friend isn't removed by a stray tap.
function RemoveButton({ onRemove }: { onRemove: () => void }) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  return (
    <Pressable role="button" onPress={() => (confirming ? onRemove() : setConfirming(true))} hitSlop={8}>
      <Text style={[styles.quiet, confirming && styles.danger]}>{confirming ? 'Tap to confirm' : 'Remove'}</Text>
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
    paddingBottom: 10,
    paddingHorizontal: 18,
  },
  title: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 18,
    color: colors.sumi,
  },
  content: {
    gap: 10,
    paddingHorizontal: 18,
  },
  card: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  dark: {
    borderColor: colors.sumi,
    backgroundColor: colors.sumi,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  grow: {
    flex: 1,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.uiExtraBold,
    fontSize: 17,
    color: colors.sumi,
  },
  onDark: {
    color: colors.card,
  },
  onDarkSoft: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  link: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.gold,
  },
  code: {
    fontFamily: fonts.uiBlack,
    fontSize: 36,
    letterSpacing: 4,
    color: colors.card,
  },
  body: {
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  error: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
  codeField: {
    flex: 1,
    letterSpacing: 3,
  },
  addButton: {
    width: 90,
  },
  heading: {
    marginTop: 8,
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  name: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 15,
    color: colors.sumi,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  small: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  quiet: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.ink2,
  },
  danger: {
    color: colors.vermilionDark,
  },
  accept: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.pine,
  },
  acceptText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.card,
  },
});
