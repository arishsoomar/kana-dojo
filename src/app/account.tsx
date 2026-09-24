import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { XIcon } from '@/components/x-icon';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

const CODE_LENGTH = 6;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/profile');
}

// Sign in with an email code, or sign out. Accounts are optional; progress is always kept
// on the device too.
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setError(null);
    const problem = await auth.sendCode(email.trim());
    setBusy(false);
    if (problem) setError(problem);
    else setSent(true);
  }

  async function verify() {
    setBusy(true);
    setError(null);
    const problem = await auth.verifyCode(email.trim(), code.trim());
    setBusy(false);
    if (problem) setError(problem);
    else close();
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Close" onPress={close} hitSlop={10}>
          <XIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.body}>
        {auth.email ? (
          <>
            <Text style={styles.heading}>Signed in</Text>
            <Text style={styles.text}>
              As <Text style={styles.strong}>{auth.email}</Text>. Your progress is kept on this device.
            </Text>
            <View style={styles.button}>
              <PrimaryButton label="Sign out" tone="vermilion" onPress={() => auth.signOut()} />
            </View>
          </>
        ) : !sent ? (
          <>
            <Text style={styles.heading}>Sign in</Text>
            <Text style={styles.text}>
              Enter your email and we&apos;ll send you a {CODE_LENGTH}-digit code. New here? The same code creates your
              account.
            </Text>
            <TextField
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              aria-label="Email"
            />
            <View style={styles.button}>
              <PrimaryButton label={busy ? 'Sending…' : 'Send code'} disabled={busy || !email.includes('@')} onPress={send} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.heading}>Check your email</Text>
            <Text style={styles.text}>
              We sent a code to <Text style={styles.strong}>{email.trim()}</Text>.
            </Text>
            <TextField
              value={code}
              onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH))}
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              aria-label="Code"
              style={styles.code}
            />
            <View style={styles.button}>
              <PrimaryButton label={busy ? 'Checking…' : 'Sign in'} disabled={busy || code.length !== CODE_LENGTH} onPress={verify} />
            </View>
            <Pressable role="button" onPress={() => setSent(false)} style={styles.link}>
              <Text style={styles.linkText}>Use a different email</Text>
            </Pressable>
          </>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
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
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  title: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  body: {
    gap: 12,
    paddingHorizontal: 18,
  },
  heading: {
    fontFamily: fonts.uiBlack,
    fontSize: 25,
    color: colors.sumi,
  },
  text: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink2,
  },
  strong: {
    fontFamily: fonts.uiBold,
    color: colors.sumi,
  },
  code: {
    letterSpacing: 8,
    textAlign: 'center',
    fontSize: 24,
  },
  button: {
    marginTop: 4,
  },
  link: {
    alignSelf: 'center',
    padding: 6,
  },
  linkText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: colors.vermilionDark,
  },
  error: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.vermilionDark,
  },
});
