import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Learn' }} />
      <Tabs.Screen name="games" options={{ title: 'Games' }} />
      {/* The kana screen draws its own "Your kana" title. */}
      <Tabs.Screen name="kana" options={{ title: 'Kana', headerShown: false }} />
      <Tabs.Screen name="ranks" options={{ title: 'Ranks' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
