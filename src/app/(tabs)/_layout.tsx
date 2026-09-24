import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      {/* Every tab draws its own header. */}
      <Tabs.Screen name="index" options={{ title: 'Learn', headerShown: false }} />
      <Tabs.Screen name="games" options={{ title: 'Games', headerShown: false }} />
      <Tabs.Screen name="kana" options={{ title: 'Kana', headerShown: false }} />
      <Tabs.Screen name="ranks" options={{ title: 'Ranks', headerShown: false }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', headerShown: false }} />
    </Tabs>
  );
}
