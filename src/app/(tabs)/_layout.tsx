import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="games" />
      <Tabs.Screen name="kana" />
      <Tabs.Screen name="ranks" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
