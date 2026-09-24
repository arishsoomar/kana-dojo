import { KANA } from './kana';
import { kanaTip } from './tips';

describe('kanaTip', () => {
  it('has a memory tip for every one of the 92 kana', () => {
    const missing = KANA.filter((k) => !kanaTip(k.char)).map((k) => k.char);
    expect(missing).toEqual([]);
  });

  it("mentions each kana's sound, so the picture leads back to the answer", () => {
    const unlinked = KANA.filter((k) => !kanaTip(k.char)?.includes(k.romaji[0])).map((k) => k.char);
    expect(unlinked).toEqual([]);
  });

  it('is null for something that is not a kana', () => {
    expect(kanaTip('x')).toBeNull();
  });
});
