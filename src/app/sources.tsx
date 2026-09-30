import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '@/components/back-icon';
import { colors, fonts } from '@/constants/theme';
import { SOURCES, type Source } from '@/content/sources';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/settings');
}

// The open resources the dojo is built on, each with who made it, what it's used for, and its
// licence, with links to both. Their licences ask for this. Opened from Settings.
export default function SourcesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Sources</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.intro}>
          Kana Dojo is built on open work that others have shared. Thank you to everyone who made it.
        </Text>
        {SOURCES.map((source) => (
          <SourceCard key={source.name} source={source} />
        ))}
      </ScrollView>
    </View>
  );
}

function SourceCard({ source }: { source: Source }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{source.name}</Text>
      <Text style={styles.by}>by {source.by}</Text>
      <Text style={styles.what}>{source.what}</Text>
      <View style={styles.links}>
        <Pressable role="link" onPress={() => void openBrowserAsync(source.url)} hitSlop={6}>
          <Text style={styles.link}>Website</Text>
        </Pressable>
        <Pressable role="link" onPress={() => void openBrowserAsync(source.licenceUrl)} hitSlop={6}>
          <Text style={styles.link}>Licence: {source.licence}</Text>
        </Pressable>
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
  intro: {
    marginBottom: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  card: {
    gap: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  name: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 16,
    color: colors.sumi,
  },
  by: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.muted,
  },
  what: {
    marginTop: 2,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink2,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 6,
  },
  link: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.indigoDark,
  },
});
