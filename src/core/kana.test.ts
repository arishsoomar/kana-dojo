import { KANA, ROWS, kanaForRomaji, lookalikesOf, matchesRomaji, rowKind, typingDone, type Kana } from './kana';
import { NAMED_PAIRS } from './pairs';

function kana(char: string): Kana {
  const found = KANA.find((k) => k.char === char);
  if (!found) throw new Error(`No kana ${char} in KANA`);
  return found;
}

describe('kana data', () => {
  it('has the 46 basic hiragana, 25 dakuten and handakuten, and 33 yōon', () => {
    const hiragana = KANA.filter((k) => k.script === 'hiragana');
    expect(hiragana).toHaveLength(104);
  });

  it('has the same 104 in katakana', () => {
    const katakana = KANA.filter((k) => k.script === 'katakana');
    expect(katakana).toHaveLength(104);
  });

  it('has no duplicate characters', () => {
    const chars = KANA.map((k) => k.char);
    expect(new Set(chars).size).toBe(chars.length);
  });
});

describe('matchesRomaji', () => {
  it('accepts the standard spelling', () => {
    expect(matchesRomaji(kana('か'), 'ka')).toBe(true);
  });

  it('spells ぢ and づ like じ and ず, with their own alternates too', () => {
    expect(matchesRomaji(kana('ぢ'), 'ji')).toBe(true);
    expect(matchesRomaji(kana('ぢ'), 'di')).toBe(true);
    expect(matchesRomaji(kana('ヅ'), 'zu')).toBe(true);
    expect(matchesRomaji(kana('ヅ'), 'du')).toBe(true);
    expect(matchesRomaji(kana('じ'), 'zi')).toBe(true);
  });

  it('accepts the common spellings of yōon', () => {
    expect(matchesRomaji(kana('きゃ'), 'kya')).toBe(true);
    expect(matchesRomaji(kana('しゅ'), 'shu')).toBe(true);
    expect(matchesRomaji(kana('しゅ'), 'syu')).toBe(true);
    expect(matchesRomaji(kana('チョ'), 'cho')).toBe(true);
    expect(matchesRomaji(kana('チョ'), 'tyo')).toBe(true);
    expect(matchesRomaji(kana('じゃ'), 'ja')).toBe(true);
    expect(matchesRomaji(kana('じゃ'), 'zya')).toBe(true);
    expect(matchesRomaji(kana('じゃ'), 'jya')).toBe(true);
  });

  it('accepts alternate spellings, in both scripts', () => {
    expect(matchesRomaji(kana('し'), 'si')).toBe(true);
    expect(matchesRomaji(kana('チ'), 'ti')).toBe(true);
    expect(matchesRomaji(kana('つ'), 'tu')).toBe(true);
    expect(matchesRomaji(kana('フ'), 'hu')).toBe(true);
  });

  it('rejects a wrong answer', () => {
    expect(matchesRomaji(kana('か'), 'ki')).toBe(false);
  });

  it('ignores capital letters and surrounding spaces', () => {
    expect(matchesRomaji(kana('し'), ' Shi ')).toBe(true);
  });
});

describe('rows', () => {
  it('lists rows in unlock order', () => {
    expect(ROWS).toEqual([
      'a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa',
      'ga', 'za', 'da', 'ba', 'pa',
      'kya', 'sha', 'cha', 'nya', 'hya', 'mya', 'rya', 'gya', 'ja', 'bya', 'pya',
    ]);
  });

  it('puts each kana in its row', () => {
    expect(kana('し').row).toBe('sa');
    expect(kana('ツ').row).toBe('ta');
    expect(kana('ん').row).toBe('wa');
    expect(kana('ぢ').row).toBe('da');
    expect(kana('ポ').row).toBe('pa');
    expect(kana('しょ').row).toBe('sha');
    expect(kana('ピュ').row).toBe('pya');
  });

  it('says what kind of row each is', () => {
    expect(rowKind('ka')).toBe('basic');
    expect((['ga', 'za', 'da', 'ba'] as const).map(rowKind)).toEqual(['dakuten', 'dakuten', 'dakuten', 'dakuten']);
    expect(rowKind('pa')).toBe('handakuten');
    expect((['kya', 'ja', 'pya'] as const).map(rowKind)).toEqual(['yoon', 'yoon', 'yoon']);
  });

  it('has the right number of kana in each row', () => {
    const sizes = ROWS.map(
      (row) => KANA.filter((k) => k.script === 'hiragana' && k.row === row).length,
    );
    expect(sizes).toEqual([5, 5, 5, 5, 5, 5, 5, 3, 5, 3, 5, 5, 5, 5, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  });
});

describe('lookalikes', () => {
  it('finds the other member of a pair, in both directions', () => {
    expect(lookalikesOf('シ')).toEqual(['ツ']);
    expect(lookalikesOf('ツ')).toEqual(['シ']);
  });

  it('finds both others in a group of three', () => {
    const result = lookalikesOf('ね');
    expect(result).toHaveLength(2);
    expect(result).toContain('わ');
    expect(result).toContain('れ');
  });

  it('pairs the dakuten and handakuten lookalikes', () => {
    expect(lookalikesOf('ぱ')).toEqual(['ば']);
    expect(lookalikesOf('パ')).toEqual(['バ']);
    expect(lookalikesOf('ヅ')).toEqual(['ジ']);
  });

  it('returns an empty list for a kana with no lookalikes', () => {
    expect(lookalikesOf('や')).toEqual([]);
  });

  it('treats the two kana of every named pair as lookalikes', () => {
    for (const { kana } of NAMED_PAIRS) {
      expect(lookalikesOf(kana[0])).toContain(kana[1]);
      expect(lookalikesOf(kana[1])).toContain(kana[0]);
    }
  });
});

describe('typingDone', () => {
  it('is done once the input is a whole spelling that no longer spelling starts with', () => {
    expect(typingDone('ka')).toBe(true);
    expect(typingDone('sha')).toBe(true);
    expect(typingDone('ja')).toBe(true);
    expect(typingDone('kya')).toBe(true);
    expect(typingDone('shi')).toBe(true);
    expect(typingDone('si')).toBe(true);
    expect(typingDone(' KA ')).toBe(true);
  });

  it('waits while more letters could follow', () => {
    expect(typingDone('')).toBe(false);
    expect(typingDone('k')).toBe(false);
    expect(typingDone('sh')).toBe(false);
    // "n" is ん, but it might be the start of na, ni, nu, ne or no: Enter sends it.
    expect(typingDone('n')).toBe(false);
  });

  it('waits on something that spells no kana, so a typo can be fixed', () => {
    expect(typingDone('kx')).toBe(false);
  });
});

describe('kanaForRomaji', () => {
  it('finds the kana a spelling belongs to, in the given script', () => {
    expect(kanaForRomaji('ka', 'hiragana')?.char).toBe('か');
    expect(kanaForRomaji('ti', 'katakana')?.char).toBe('チ');
    expect(kanaForRomaji(' Shi', 'hiragana')?.char).toBe('し');
  });

  it('is null for something that spells no kana', () => {
    expect(kanaForRomaji('kx', 'hiragana')).toBeNull();
    expect(kanaForRomaji('', 'hiragana')).toBeNull();
  });
});
