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

// The best Japanese voice of these, or null if there's none.
export function bestJapaneseVoice(voices: readonly DeviceVoice[]): ChosenVoice | null {
  const japanese = voices.filter((v) => /^ja([-_]|$)/i.test(v.language));
  const best = japanese.reduce<DeviceVoice | null>((top, v) => (!top || RANK[levelOf(v)] > RANK[levelOf(top)] ? v : top), null);
  return best ? { identifier: best.identifier, name: best.name, level: levelOf(best) } : null;
}
