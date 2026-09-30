// Choosing the phone's best Japanese voice. On iOS the voices come in three qualities: a small
// built-in one, and Enhanced and Premium ones to download, which sound far more natural.
// Their ids say which ("com.apple.voice.premium.ja-JP.Kyoko"); expo-speech also marks the
// better ones as Enhanced.

export type DeviceVoice = { identifier: string; name: string; language: string; quality: 'Default' | 'Enhanced' };

export type VoiceLevel = 'premium' | 'enhanced' | 'basic';

export type ChosenVoice = { identifier: string; name: string; level: VoiceLevel };

function levelOf(voice: DeviceVoice): VoiceLevel {
  const id = voice.identifier.toLowerCase();
  if (id.includes('premium')) return 'premium';
  if (id.includes('enhanced') || voice.quality === 'Enhanced') return 'enhanced';
  return 'basic';
}

const RANK: Readonly<Record<VoiceLevel, number>> = { premium: 3, enhanced: 2, basic: 1 };

// Every Japanese voice of these, the best first (in their own order within a level).
export function japaneseVoices(voices: readonly DeviceVoice[]): ChosenVoice[] {
  return voices
    .filter((v) => /^ja([-_]|$)/i.test(v.language))
    .map((v) => ({ identifier: v.identifier, name: v.name, level: levelOf(v) }))
    .sort((a, b) => RANK[b.level] - RANK[a.level]);
}

// The best Japanese voice of these, or null if there's none.
export function bestJapaneseVoice(voices: readonly DeviceVoice[]): ChosenVoice | null {
  return japaneseVoices(voices)[0] ?? null;
}

// The voice to speak with: the one the learner chose, while it's still installed, or else the
// best there is.
export function voiceToUse(voices: readonly DeviceVoice[], chosen: string | null): ChosenVoice | null {
  const all = japaneseVoices(voices);
  return all.find((v) => v.identifier === chosen) ?? all[0] ?? null;
}
