import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The project's address and publishable key come from .env.local (not committed):
//   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
// The publishable key is meant to ship inside apps; the database's row-level security is
// what stops people reading each other's data.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Web pages are pre-rendered in Node (app.json has web output "static"), where there's no
// window and no storage; the client must not start there. Apps and browsers have a window.
const inAppOrBrowser = typeof window !== 'undefined';

// Null when the app has no keys, or while pre-rendering: accounts are optional, so
// everything else still works.
export const supabase: SupabaseClient | null =
  url && key && inAppOrBrowser
    ? createClient(url, key, {
        auth: {
          // Keeps the learner signed in across launches, on every platform.
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // Sign-in is by typed email code, never by opening a link.
          detectSessionInUrl: false,
        },
      })
    : null;
