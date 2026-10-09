import { hepburn } from './hepburn';

describe('Hepburn romaji for a reading', () => {
  it('spells each kana the standard way', () => {
    expect(hepburn('だいがく')).toBe('daigaku');
    expect(hepburn('しゃしん')).toBe('shashin');
    expect(hepburn('ちかてつ')).toBe('chikatetsu');
    expect(hepburn('ふじさん')).toBe('fujisan');
  });

  it('writes long o, u, a and e with a macron', () => {
    expect(hepburn('こうこう')).toBe('kōkō');
    expect(hepburn('おおきい')).toBe('ōkii');
    expect(hepburn('ゆうびんきょく')).toBe('yūbinkyoku');
    expect(hepburn('おかあさん')).toBe('okāsan');
    expect(hepburn('ええ')).toBe('ē');
    expect(hepburn('コーヒー')).toBe('kōhī');
  });

  it('keeps えい and いい as they are written', () => {
    expect(hepburn('えいご')).toBe('eigo');
    expect(hepburn('せんせい')).toBe('sensei');
    expect(hepburn('いい')).toBe('ii');
  });

  it('doubles the consonant after っ, with tch before ch', () => {
    expect(hepburn('きって')).toBe('kitte');
    expect(hepburn('いっしょ')).toBe('issho');
    expect(hepburn('まっちゃ')).toBe('matcha');
    expect(hepburn('ベッド')).toBe('beddo');
  });

  it("marks ん before a vowel or y with an apostrophe", () => {
    expect(hepburn('きんえん')).toBe("kin'en");
    expect(hepburn('こんや')).toBe("kon'ya");
    expect(hepburn('こんばん')).toBe('konban');
  });

  it('reads を as o', () => {
    expect(hepburn('きをつける')).toBe('kiotsukeru');
  });

  it("keeps a verb's final う apart from the vowel before it", () => {
    expect(hepburn('おもう', { verbU: true })).toBe('omou');
    expect(hepburn('いう', { verbU: true })).toBe('iu');
    expect(hepburn('おもう')).toBe('omō');
  });

  it('gives null for text it cannot read', () => {
    expect(hepburn('食べる')).toBeNull();
  });
});
