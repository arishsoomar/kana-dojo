import { clockWord, hourWord } from '@/core/time';

import { GENKI_CARDS } from './genki';
import { romajiOf } from './romaji';

const card = (written: string) => GENKI_CARDS.find((w) => w.word === written)!;

describe('how a word is said, in romaji', () => {
  it('gives every GENKI card one', () => {
    expect(GENKI_CARDS.filter((w) => !romajiOf(w)).map((w) => w.word)).toEqual([]);
  });

  it('spaces the words of a phrase, keeps particles apart, and reads は as wa', () => {
    expect(romajiOf(card('おはようございます'))).toBe('ohayō gozaimasu');
    expect(romajiOf(card('こんにちは'))).toBe('konnichiwa');
    expect(romajiOf(card('男の人'))).toBe('otoko no hito');
    expect(romajiOf(card('たばこを吸う'))).toBe('tabako o suu');
    expect(romajiOf(card('そうですか'))).toBe('sō desu ka');
    expect(romajiOf(card('勉強する'))).toBe('benkyō suru');
  });

  it('hyphens a suffix', () => {
    expect(romajiOf(card('～さん'))).toBe('-san');
    expect(romajiOf(card('～をください'))).toBe('-o kudasai');
  });

  it("works the rest out from the reading, keeping a verb's final う", () => {
    expect(romajiOf(card('高校'))).toBe('kōkō');
    expect(romajiOf(card('思う'))).toBe('omou');
    expect(romajiOf(card('湖'))).toBe('mizuumi');
  });

  it('spaces a time between its hour and its minutes', () => {
    expect(romajiOf(clockWord(3, 15))).toBe('sanji jūgofun');
    expect(romajiOf(clockWord(4, 30))).toBe('yoji han');
    expect(romajiOf(hourWord(9))).toBe('kuji');
  });
});
