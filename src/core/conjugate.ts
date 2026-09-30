// How Japanese verbs and adjectives change: the forms a Genki I learner meets. Words are
// conjugated as they're written (食べる → 食べます), kanji and all; the kind of word comes from
// its dictionary tags (JMdict's parts of speech, as the deck keeps them).

export type VerbKind = 'ru' | 'u' | 'suru' | 'kuru';

export type VerbForm =
  | 'dictionary' // 食べる
  | 'masu' // 食べます
  | 'masen' // 食べません
  | 'mashita' // 食べました
  | 'masendeshita' // 食べませんでした
  | 'te' // 食べて
  | 'ta' // 食べた
  | 'nai' // 食べない
  | 'nakatta'; // 食べなかった

// The kind of verb, from its tags, or null if it isn't one. A noun that can take する (勉強,
// tagged "vs") isn't a verb itself: 勉強する is.
export function verbKind(pos: readonly string[]): VerbKind | null {
  for (const p of pos) {
    if (p === 'v1' || p === 'v1-s') return 'ru';
    if (p === 'vk') return 'kuru';
    if (p === 'vs-i') return 'suru';
    if (p.startsWith('v5') || p === 'vs-s') return 'u';
  }
  return null;
}

// A う-verb's last kana, and what it becomes: the i-row (for ます), the a-row (for ない), and
// the endings of the て and た forms.
const U_ENDINGS: Readonly<Record<string, { i: string; a: string; te: string; ta: string }>> = {
  う: { i: 'い', a: 'わ', te: 'って', ta: 'った' },
  く: { i: 'き', a: 'か', te: 'いて', ta: 'いた' },
  ぐ: { i: 'ぎ', a: 'が', te: 'いで', ta: 'いだ' },
  す: { i: 'し', a: 'さ', te: 'して', ta: 'した' },
  つ: { i: 'ち', a: 'た', te: 'って', ta: 'った' },
  ぬ: { i: 'に', a: 'な', te: 'んで', ta: 'んだ' },
  ぶ: { i: 'び', a: 'ば', te: 'んで', ta: 'んだ' },
  む: { i: 'み', a: 'ま', te: 'んで', ta: 'んだ' },
  る: { i: 'り', a: 'ら', te: 'って', ta: 'った' },
};

// The polite endings, after the ます stem.
const MASU: Partial<Record<VerbForm, string>> = {
  masu: 'ます',
  masen: 'ません',
  mashita: 'ました',
  masendeshita: 'ませんでした',
};

// A form made from the ます stem (the i-row), the ない stem (the a-row), or the て and た
// endings, given each for this verb.
function fromStems(form: VerbForm, word: string, stems: { masu: string; nai: string; te: string; ta: string }): string {
  if (form === 'dictionary') return word;
  const polite = MASU[form];
  if (polite) return stems.masu + polite;
  if (form === 'te') return stems.te;
  if (form === 'ta') return stems.ta;
  if (form === 'nai') return `${stems.nai}ない`;
  return `${stems.nai}なかった`;
}

export function conjugateVerb(word: string, pos: readonly string[], form: VerbForm): string | null {
  const kind = verbKind(pos);
  if (!kind) return null;

  if (kind === 'ru') {
    const stem = word.slice(0, -1);
    return fromStems(form, word, { masu: stem, nai: stem, te: `${stem}て`, ta: `${stem}た` });
  }

  if (kind === 'suru') {
    const stem = word.slice(0, -2); // 気にする → 気に
    return fromStems(form, word, { masu: `${stem}し`, nai: `${stem}し`, te: `${stem}して`, ta: `${stem}した` });
  }

  if (kind === 'kuru') {
    // In kanji the 来 stays and only its reading changes; in kana, く becomes き or こ.
    if (word.endsWith('来る')) {
      const stem = word.slice(0, -1);
      return fromStems(form, word, { masu: stem, nai: stem, te: `${stem}て`, ta: `${stem}た` });
    }
    const stem = word.slice(0, -2);
    return fromStems(form, word, { masu: `${stem}き`, nai: `${stem}こ`, te: `${stem}きて`, ta: `${stem}きた` });
  }

  // う-verbs. 愛する (vs-s) conjugates like 愛す.
  const base = pos.includes('vs-s') && word.endsWith('する') ? `${word.slice(0, -2)}す` : word;
  const last = base.slice(-1);
  const ending = U_ENDINGS[last];
  if (!ending) return null;
  const stem = base.slice(0, -1);
  const stems = { masu: stem + ending.i, nai: stem + ending.a, te: stem + ending.te, ta: stem + ending.ta };
  // 行く: 行って, not 行いて.
  if (pos.includes('v5k-s')) {
    stems.te = `${stem}って`;
    stems.ta = `${stem}った`;
  }
  // 問う: 問うて, not 問って.
  if (pos.includes('v5u-s')) {
    stems.te = `${base}て`;
    stems.ta = `${base}た`;
  }
  // The polite verbs (くださる, おっしゃる, なさる): い before ます.
  if (pos.includes('v5aru')) stems.masu = `${stem}い`;
  // ある: its negative is just ない.
  if (pos.includes('v5r-i') && (form === 'nai' || form === 'nakatta')) {
    return `${word.slice(0, -2)}${form === 'nai' ? 'ない' : 'なかった'}`;
  }
  return fromStems(form, word, stems);
}

// --- Adjectives ---------------------------------------------------------------------------

export type AdjectiveKind = 'i' | 'ii' | 'na';

export type AdjectiveForm = 'present' | 'negative' | 'past' | 'pastNegative' | 'te';

export function adjectiveKind(pos: readonly string[]): AdjectiveKind | null {
  if (pos.includes('adj-ix')) return 'ii';
  if (pos.includes('adj-i')) return 'i';
  if (pos.includes('adj-na')) return 'na';
  return null;
}

// An adjective in a form, plain (高い, 静かだ) or polite (高いです, 静かです). The te-form is the
// same either way (高くて, 静かで).
export function conjugateAdjective(word: string, pos: readonly string[], form: AdjectiveForm, polite: boolean): string | null {
  const kind = adjectiveKind(pos);
  if (!kind) return null;

  if (kind === 'na') {
    const forms: Record<AdjectiveForm, [plain: string, polite: string]> = {
      present: ['だ', 'です'],
      negative: ['じゃない', 'じゃないです'],
      past: ['だった', 'でした'],
      pastNegative: ['じゃなかった', 'じゃなかったです'],
      te: ['で', 'で'],
    };
    return word + forms[form][polite ? 1 : 0];
  }

  // い-adjectives: 高 + く, かった… いい changes from よい (かっこいい → かっこよかった).
  const stem = kind === 'ii' ? `${word.slice(0, -2)}よ` : word.slice(0, -1);
  const desu = polite ? 'です' : '';
  if (form === 'present') return word + desu;
  if (form === 'negative') return `${stem}くない${desu}`;
  if (form === 'past') return `${stem}かった${desu}`;
  if (form === 'pastNegative') return `${stem}くなかった${desu}`;
  return `${stem}くて`;
}
