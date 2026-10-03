import {
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import { ZenKakuGothicNew_700Bold } from '@expo-google-fonts/zen-kaku-gothic-new';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { FriendBanner } from '@/components/friend-banner';
import { CloudSync } from '@/hooks/cloud-sync';
import { FriendSync } from '@/hooks/friend-sync';
import { AuthProvider } from '@/hooks/use-auth';
import { FriendsProvider } from '@/hooks/use-friends';
import { VoiceChoice } from '@/hooks/use-voice';
import { ProgressProvider, useSavedProgress } from '@/hooks/use-progress';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    ZenKakuGothicNew_700Bold,
  });

  const saved = useSavedProgress();
  const fontsDone = fontsLoaded || fontError !== null;
  const ready = fontsDone && saved !== null;

  // Keep the splash screen up until fonts and saved progress have both loaded.
  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <AuthProvider>
      <ProgressProvider initial={saved}>
        <CloudSync />
        <FriendSync />
        <VoiceChoice />
        <FriendsProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* The lesson draws its own top bar with an X, and swiping back is off so X is the way out. */}
            <Stack.Screen name="lesson" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="streak" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="goal" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
            <Stack.Screen name="start" options={{ headerShown: false }} />
            <Stack.Screen name="placement" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="exam" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="duel" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="scrolls" options={{ headerShown: false }} />
            <Stack.Screen name="guide" options={{ headerShown: false }} />
            <Stack.Screen name="shed" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="sources" options={{ headerShown: false }} />
            <Stack.Screen name="practice" options={{ headerShown: false }} />
            <Stack.Screen name="words/index" options={{ headerShown: false }} />
            <Stack.Screen name="words/review" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="grammar/lesson" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="grammar/review" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="live" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="friends" options={{ headerShown: false }} />
            <Stack.Screen name="friend" options={{ headerShown: false }} />
            <Stack.Screen name="games/rain" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/forge" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/dungeon" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/memory" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/taiko" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/calligraphy" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/kata" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="games/reading" options={{ headerShown: false }} />
            <Stack.Screen name="games/read" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
          {/* Over every screen: news from friends. */}
          <FriendBanner />
        </FriendsProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}
