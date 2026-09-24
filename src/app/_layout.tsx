import {
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
import { ZenKakuGothicNew_900Black } from '@expo-google-fonts/zen-kaku-gothic-new';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ProgressProvider, useSavedProgress } from '@/hooks/use-progress';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    ZenKakuGothicNew_900Black,
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
    <ProgressProvider initial={saved}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* The lesson draws its own top bar with an X, and swiping back is off so X is the way out. */}
        <Stack.Screen name="lesson" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="streak" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="goal" options={{ headerShown: false }} />
        <Stack.Screen name="exam" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="games/rain" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </ProgressProvider>
  );
}
