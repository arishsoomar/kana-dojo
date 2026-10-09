import { voiceLines } from '@/audio/voice-lines';

import { VOICE_CLIPS } from './voice-clips';

describe('voice recordings', () => {
  it('has every line in both voices (run scripts/make-voices.mts after adding any)', () => {
    for (const voice of ['female', 'male'] as const) {
      expect(voiceLines().filter((l) => VOICE_CLIPS[voice][l.key] === undefined).map((l) => l.key)).toEqual([]);
    }
  });
});
