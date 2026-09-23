import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function LearnScreen() {
  return (
    <View>
      <Text>Learn</Text>
      {/* Temporary way into a lesson until the learn path (D3) exists. */}
      <Link href="/lesson">Start lesson</Link>
    </View>
  );
}
