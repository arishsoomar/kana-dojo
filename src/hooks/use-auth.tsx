import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

import { supabase } from '@/storage/supabase';

type AuthContextValue = {
  available: boolean; // false when the app has no Supabase keys
  email: string | null; // the signed-in account, or null when signed out
  userId: string | null;
  sendCode: (email: string) => Promise<string | null>; // returns an error message, or null
  verifyCode: (email: string, code: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Nothing to listen to: the only change is from the pre-rendered page to the live one.
function noSubscription() {
  return () => {};
}

// Keeps track of whether the learner is signed in. Signing in is optional; without it,
// progress lives only on the device.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // False while a web page is pre-rendered (Supabase is off there) and for the browser's
  // first render, then true. useSyncExternalStore gives a separate "server" answer, so the
  // pre-rendered page and the browser agree and React can switch over safely.
  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  const available = hydrated && supabase !== null;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function sendCode(email: string) {
    if (!supabase) return 'Accounts aren’t set up in this build.';
    // Creates the account the first time; later it just signs in.
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return error ? error.message : null;
  }

  async function verifyCode(email: string, code: string) {
    if (!supabase) return 'Accounts aren’t set up in this build.';
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    return error ? error.message : null;
  }

  async function signOut() {
    // Progress stays on the device; only the account link is removed.
    await supabase?.auth.signOut();
  }

  return (
    <AuthContext
      value={{
        available,
        email: session?.user.email ?? null,
        userId: session?.user.id ?? null,
        sendCode,
        verifyCode,
        signOut,
      }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
