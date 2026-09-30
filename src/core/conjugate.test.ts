import { adjectiveKind, conjugateAdjective, conjugateVerb, verbKind, type AdjectiveForm, type VerbForm } from './conjugate';

// Every form of a verb, in this order: dictionary, ます, ません, ました, ませんでした, て, た, ない, なかった.
const FORMS: readonly VerbForm[] = ['dictionary', 'masu', 'masen', 'mashita', 'masendeshita', 'te', 'ta', 'nai', 'nakatta'];
const all = (word: string, pos: string[]) => FORMS.map((f) => conjugateVerb(word, pos, f));

describe('what kind of verb it is', () => {
  it('reads the kind from the dictionary tags, whatever else is there', () => {
    expect(verbKind(['v1', 'vt'])).toBe('ru');
    expect(verbKind(['v5k', 'vi'])).toBe('u');
    expect(verbKind(['vs-i'])).toBe('suru');
    expect(verbKind(['vk'])).toBe('kuru');
    expect(verbKind(['n', 'vs'])).toBeNull(); // a noun that can take する: not a verb itself
    expect(verbKind(['adj-i'])).toBeNull();
  });
});

describe('る-verbs', () => {
  it('drop る', () => {
    expect(all('食べる', ['v1'])).toEqual(['食べる', '食べます', '食べません', '食べました', '食べませんでした', '食べて', '食べた', '食べない', '食べなかった']);
    expect(all('みる', ['v1'])).toEqual(['みる', 'みます', 'みません', 'みました', 'みませんでした', 'みて', 'みた', 'みない', 'みなかった']);
  });
});

describe('う-verbs', () => {
  it('change the last kana, and the て and た forms by the ending', () => {
    expect(all('書く', ['v5k'])).toEqual(['書く', '書きます', '書きません', '書きました', '書きませんでした', '書いて', '書いた', '書かない', '書かなかった']);
    expect(all('泳ぐ', ['v5g']).slice(5)).toEqual(['泳いで', '泳いだ', '泳がない', '泳がなかった']);
    expect(all('話す', ['v5s']).slice(1, 2).concat(all('話す', ['v5s']).slice(5, 8))).toEqual(['話します', '話して', '話した', '話さない']);
    expect(all('待つ', ['v5t']).slice(5, 8)).toEqual(['待って', '待った', '待たない']);
    expect(all('死ぬ', ['v5n']).slice(5, 8)).toEqual(['死んで', '死んだ', '死なない']);
    expect(all('遊ぶ', ['v5b']).slice(5, 8)).toEqual(['遊んで', '遊んだ', '遊ばない']);
    expect(all('読む', ['v5m']).slice(5, 8)).toEqual(['読んで', '読んだ', '読まない']);
    expect(all('帰る', ['v5r']).slice(1, 2).concat(all('帰る', ['v5r']).slice(5, 8))).toEqual(['帰ります', '帰って', '帰った', '帰らない']);
  });

  it('turn う into わ for the negative: 会わない', () => {
    expect(all('会う', ['v5u']).slice(5)).toEqual(['会って', '会った', '会わない', '会わなかった']);
  });

  it('keep the exceptions: 行って, ない for ある, くださいます, 問うて', () => {
    expect(all('行く', ['v5k-s']).slice(5, 8)).toEqual(['行って', '行った', '行かない']);
    expect(all('ある', ['v5r-i']).slice(7)).toEqual(['ない', 'なかった']);
    expect(conjugateVerb('ある', ['v5r-i'], 'masu')).toBe('あります');
    expect(conjugateVerb('くださる', ['v5aru'], 'masu')).toBe('くださいます');
    expect(conjugateVerb('くださる', ['v5aru'], 'nai')).toBe('くださらない');
    expect(conjugateVerb('問う', ['v5u-s'], 'te')).toBe('問うて');
    expect(conjugateVerb('問う', ['v5u-s'], 'ta')).toBe('問うた');
  });
});

describe('する and くる', () => {
  it('conjugate する, and any verb ending in it', () => {
    expect(all('する', ['vs-i'])).toEqual(['する', 'します', 'しません', 'しました', 'しませんでした', 'して', 'した', 'しない', 'しなかった']);
    expect(conjugateVerb('気にする', ['vs-i'], 'te')).toBe('気にして');
  });

  it('treat the する of 愛する like す: 愛さない', () => {
    expect(conjugateVerb('愛する', ['vs-s'], 'nai')).toBe('愛さない');
    expect(conjugateVerb('愛する', ['vs-s'], 'masu')).toBe('愛します');
    expect(conjugateVerb('愛する', ['vs-s'], 'te')).toBe('愛して');
  });

  it('conjugate くる in kana, and 来る in kanji (the kanji stays, its reading changes)', () => {
    expect(all('くる', ['vk'])).toEqual(['くる', 'きます', 'きません', 'きました', 'きませんでした', 'きて', 'きた', 'こない', 'こなかった']);
    expect(all('来る', ['vk'])).toEqual(['来る', '来ます', '来ません', '来ました', '来ませんでした', '来て', '来た', '来ない', '来なかった']);
    expect(conjugateVerb('持ってくる', ['vk'], 'nai')).toBe('持ってこない');
  });

  it('is nothing for a word that is not a verb', () => {
    expect(conjugateVerb('高い', ['adj-i'], 'masu')).toBeNull();
  });
});

describe('adjectives', () => {
  const ADJ: readonly AdjectiveForm[] = ['present', 'negative', 'past', 'pastNegative', 'te'];
  const plain = (word: string, pos: string[]) => ADJ.map((f) => conjugateAdjective(word, pos, f, false));
  const polite = (word: string, pos: string[]) => ADJ.map((f) => conjugateAdjective(word, pos, f, true));

  it('knows い- and な-adjectives, and that いい is its own', () => {
    expect(adjectiveKind(['adj-i'])).toBe('i');
    expect(adjectiveKind(['adj-ix'])).toBe('ii');
    expect(adjectiveKind(['adj-na'])).toBe('na');
    expect(adjectiveKind(['n'])).toBeNull();
  });

  it('conjugates い-adjectives', () => {
    expect(plain('高い', ['adj-i'])).toEqual(['高い', '高くない', '高かった', '高くなかった', '高くて']);
    expect(polite('高い', ['adj-i'])).toEqual(['高いです', '高くないです', '高かったです', '高くなかったです', '高くて']);
  });

  it('conjugates いい from よい, and words ending in it', () => {
    expect(plain('いい', ['adj-ix'])).toEqual(['いい', 'よくない', 'よかった', 'よくなかった', 'よくて']);
    expect(conjugateAdjective('かっこいい', ['adj-ix'], 'past', false)).toBe('かっこよかった');
  });

  it('conjugates な-adjectives, with だ or です', () => {
    expect(plain('静か', ['adj-na'])).toEqual(['静かだ', '静かじゃない', '静かだった', '静かじゃなかった', '静かで']);
    expect(polite('静か', ['adj-na'])).toEqual(['静かです', '静かじゃないです', '静かでした', '静かじゃなかったです', '静かで']);
  });

  it('is nothing for a word that is not an adjective', () => {
    expect(conjugateAdjective('食べる', ['v1'], 'past', false)).toBeNull();
  });
});
