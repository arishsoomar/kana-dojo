import { bestJapaneseVoice, type DeviceVoice } from './best-voice';

const voice = (identifier: string, language: string, quality: DeviceVoice['quality'] = 'Default'): DeviceVoice => ({
  identifier,
  name: identifier.split('.').at(-1) ?? identifier,
  language,
  quality,
});

describe('the best Japanese voice', () => {
  it('is a Japanese one', () => {
    expect(bestJapaneseVoice([voice('com.apple.voice.compact.en-US.Samantha', 'en-US')])).toBeNull();
    expect(bestJapaneseVoice([voice('com.apple.voice.compact.ja-JP.Kyoko', 'ja-JP')])?.name).toBe('Kyoko');
  });

  it('is premium over enhanced, and enhanced over the default', () => {
    const voices = [
      voice('com.apple.voice.compact.ja-JP.Kyoko', 'ja-JP'),
      voice('com.apple.voice.enhanced.ja-JP.Otoya', 'ja-JP', 'Enhanced'),
      voice('com.apple.voice.premium.ja-JP.Kyoko', 'ja-JP', 'Enhanced'),
    ];
    expect(bestJapaneseVoice(voices)?.identifier).toBe('com.apple.voice.premium.ja-JP.Kyoko');
    expect(bestJapaneseVoice(voices.slice(0, 2))?.identifier).toBe('com.apple.voice.enhanced.ja-JP.Otoya');
  });

  it('takes a language written with an underscore, or on its own, too', () => {
    expect(bestJapaneseVoice([voice('ja_JP-language', 'ja_JP')])).not.toBeNull();
    expect(bestJapaneseVoice([voice('Google 日本語', 'ja')])).not.toBeNull();
  });

  it('says how good it is', () => {
    expect(bestJapaneseVoice([voice('com.apple.voice.premium.ja-JP.Kyoko', 'ja-JP', 'Enhanced')])?.level).toBe('premium');
    expect(bestJapaneseVoice([voice('com.apple.voice.compact.ja-JP.Kyoko', 'ja-JP')])?.level).toBe('basic');
  });
});
