import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { speakWord } from '@/audio/pronounce';
import { BackIcon } from '@/components/back-icon';
import { colors, fonts } from '@/constants/theme';
import { setHaptics, setSound, setTyping } from '@/core/answers';
import { DAILY_GOALS } from '@/core/goal';
import { useAuth } from '@/hooks/use-auth';
import { useProgress } from '@/hooks/use-progress';
import { useJapaneseVoices } from '@/hooks/use-voice';

// On web the switch's knob colour comes from activeThumbColor, not thumbColor. React Native's
// types don't list it (it only exists on web), hence the cast.
const webThumbColor = Platform.OS === 'web' ? ({ activeThumbColor: colors.card } as object) : {};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/dojo');
}

// Settings, opened from the cog on the Dojo tab: the daily goal, sound, haptics, typing, the
// account, and the guide.
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { progress, updateProgress } = useProgress();
  const goal = DAILY_GOALS.find((g) => g.lessons === progress.settings.dailyGoal);
  const auth = useAuth();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable role="button" aria-label="Back" onPress={goBack} hitSlop={10}>
          <BackIcon color={colors.ink2} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable role="button" onPress={() => router.push('/goal')} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Daily goal</Text>
            <Text style={styles.rowSub}>
              {goal ? `${goal.name} · ${goal.minutes} minutes, ${goal.lessons} ${goal.lessons === 1 ? 'lesson' : 'lessons'} a day` : ''}
            </Text>
          </View>
          <Text style={styles.action}>Change</Text>
        </Pressable>

        {/* The same setting as the speaker button in a lesson's top bar. */}
        <Toggle
          title="Sound"
          about="Hear each kana spoken after you answer it"
          value={progress.settings.sound}
          onChange={(on) => updateProgress(setSound(progress, on))}
        />
        <VoiceRow />
        <Toggle
          title="Haptics"
          about="A tap for right answers, a buzz for misses and big moments"
          value={progress.settings.haptics}
          onChange={(on) => updateProgress(setHaptics(progress, on))}
        />
        {/* The same setting as the Tap / Type switch in a lesson's top bar. */}
        <Toggle
          title="Type answers"
          about="Type each kana's sound instead of tapping it. Counts double toward belts."
          value={progress.settings.typing}
          onChange={(on) => updateProgress(setTyping(progress, on))}
        />

        {/* Only shown when this build has accounts set up. */}
        {auth.available && (
          <Pressable role="button" onPress={() => router.push('/account')} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{auth.email ? 'Account' : 'Save your progress to an account'}</Text>
              <Text style={styles.rowSub}>{auth.email ? `Signed in as ${auth.email}` : 'Optional. Sign in with a code sent to your email.'}</Text>
            </View>
            <Text style={styles.action}>{auth.email ? 'Manage' : 'Sign in'}</Text>
          </Pressable>
        )}

        <Pressable role="button" onPress={() => router.push('/guide')} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>How the dojo works</Text>
            <Text style={styles.rowSub}>Belts, exams, duels, streaks, and everything else</Text>
          </View>
          <Text style={styles.action}>Open</Text>
        </Pressable>

        <Pressable role="button" onPress={() => router.push('/sources')} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>About: sources</Text>
            <Text style={styles.rowSub}>The dictionaries, sentences and pictures the dojo is built on</Text>
          </View>
          <Text style={styles.action}>Open</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Where to get a better Japanese voice, on each platform.
const BETTER_VOICE = Platform.select({
  ios: 'For a clearer voice, download one: Settings, Accessibility, Spoken Content, Voices, Japanese, then an Enhanced or Premium voice. Then come back here.',
  android: 'For a clearer voice, install Japanese voice data: Settings, then search for "Text-to-speech output".',
  default: "Voices come from your browser. Safari and Chrome on a Mac usually have good Japanese ones.",
});

const LEVEL_NAMES = { premium: 'Premium', enhanced: 'Enhanced', basic: 'Basic' } as const;

// The Japanese voice words are spoken in: which it is, a button to hear it, every Japanese
// voice on the device to choose from, and how to get a better one when there's no Premium one.
function VoiceRow() {
  const voices = useJapaneseVoices();
  const [choosing, setChoosing] = useState(false);
  const { current } = voices;
  const about =
    current === undefined
      ? 'Looking for voices…'
      : current === null
        ? "Your device's default voice"
        : `${current.name} (${LEVEL_NAMES[current.level]})${voices.chosen === null ? ', the best one here' : ''}`;

  function choose(id: string | null) {
    voices.choose(id);
    speakWord(SAMPLE);
  }

  return (
    <View style={[styles.row, styles.column]}>
      <View style={styles.inline}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Japanese voice</Text>
          <Text style={styles.rowSub}>{about}</Text>
        </View>
        <Pressable role="button" onPress={() => speakWord(SAMPLE)} hitSlop={8} style={styles.gap}>
          <Text style={styles.action}>Hear it</Text>
        </Pressable>
        {voices.all.length > 1 && (
          <Pressable role="button" onPress={() => setChoosing(!choosing)} hitSlop={8}>
            <Text style={styles.action}>{choosing ? 'Done' : 'Change'}</Text>
          </Pressable>
        )}
      </View>
      {choosing && (
        <View role="radiogroup" style={styles.voices}>
          <VoiceOption label="The best one here" chosen={voices.chosen === null} onPress={() => choose(null)} />
          {voices.all.map((v) => (
            <VoiceOption
              key={v.identifier}
              label={`${v.name} (${LEVEL_NAMES[v.level]})`}
              chosen={voices.chosen === v.identifier}
              onPress={() => choose(v.identifier)}
            />
          ))}
        </View>
      )}
      {current !== undefined && current?.level !== 'premium' && <Text style={styles.rowSub}>{BETTER_VOICE}</Text>}
    </View>
  );
}

// What a voice says when it's tried: "Hello. I'm studying Japanese."
const SAMPLE = 'こんにちは。日本語を勉強しています。';

function VoiceOption({ label, chosen, onPress }: { label: string; chosen: boolean; onPress: () => void }) {
  return (
    <Pressable role="radio" aria-checked={chosen} onPress={onPress} style={styles.voice}>
      <View style={[styles.radio, chosen && styles.radioOn]} />
      <Text style={styles.voiceName}>{label}</Text>
    </Pressable>
  );
}

function Toggle({ title, about, value, onChange }: { title: string; about: string; value: boolean; onChange: (on: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{about}</Text>
      </View>
      <Switch
        aria-label={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.edge, true: colors.pine }}
        thumbColor={colors.card}
        {...webThumbColor}
      />
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
    gap: 8,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
  },
  rowText: {
    flex: 1,
  },
  column: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    marginRight: 16,
  },
  voices: {
    gap: 2,
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.edge,
  },
  radioOn: {
    borderWidth: 6,
    borderColor: colors.vermilion,
  },
  voiceName: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 14,
    color: colors.sumi,
  },
  rowTitle: {
    fontFamily: fonts.uiExtraBold,
    fontSize: 14,
    color: colors.sumi,
  },
  rowSub: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.ink2,
  },
  action: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: colors.vermilionDark,
  },
});
