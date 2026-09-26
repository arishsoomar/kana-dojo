import { KANA, rowKind } from '@/core/kana';
import { mnemonicBase } from '@/core/tips';

import { KANA_PICTURES } from './kana-pictures';

describe('kana pictures', () => {
  it('has a mnemonic picture for each of the 46 basic kana in both scripts', () => {
    const basic = KANA.filter((k) => rowKind(k.row) === 'basic');
    expect(basic).toHaveLength(92);
    expect(basic.filter((k) => KANA_PICTURES[k.char] === undefined).map((k) => k.char)).toEqual([]);
  });

  it('gives every kana a picture through its base kana', () => {
    expect(KANA.filter((k) => KANA_PICTURES[mnemonicBase(k).char] === undefined).map((k) => k.char)).toEqual([]);
  });
});
