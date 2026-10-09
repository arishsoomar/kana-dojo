import { isMark, splitWord } from './forge';

// A reading in Hepburn romaji, the way dictionaries and textbooks spell Japanese for English
// readers: long vowels with a macron (こうこう kōkō, コーヒー kōhī), っ doubling the next
// consonant (きって kitte, まっちゃ matcha), ん before a vowel or y with an apostrophe
// (きんえん kin'en), and を as o. えい and いい stay as written (せんせい sensei).
//
// It can't tell where one word ends and the next begins, so a phrase comes out as one word
// (おはようございます is ohayōgozaimasu), and it can't know は is read wa as a particle.
// Nor can it see the joins inside a word: a verb's final う is its own sound (思う is omou, not
// omō), so `verbU` keeps it apart. Null if the reading has something that isn't kana.
export function hepburn(reading: string, options: { verbU?: boolean } = {}): string | null {
  const parts = splitWord(reading);
  if (!parts) return null;
  const spellings = parts.map((p) => (isMark(p) ? null : p.char === 'を' || p.char === 'ヲ' ? 'o' : p.romaji[0]));
  let out = '';
  parts.forEach((part, i) => {
    const spelling = spellings[i];
    const next = spellings[i + 1] ?? '';
    if (isMark(part)) {
      if (part.mark === 'double') out += next.startsWith('ch') ? 't' : next.charAt(0);
      // A long mark: the vowel before it, long.
      else out = lengthen(out);
      return;
    }
    if (spelling === null || spelling === undefined) return;
    if (spelling === 'n') {
      out += /^[aiueoy]/.test(next) ? "n'" : 'n';
      return;
    }
    const last = out.slice(-1);
    const verbEnding = options.verbU === true && i === parts.length - 1 && spelling === 'u';
    // A vowel after the same sound (or う after お) makes it long, unless the one before was ん.
    const before = spellings[i - 1];
    const long = before !== 'n' && !verbEnding && LONG[last + spelling] !== undefined;
    out = long ? out.slice(0, -1) + LONG[last + spelling] : out + spelling;
  });
  return out;
}

// Two vowels that are read as one long one, and how it's written.
const LONG: Readonly<Record<string, string>> = { aa: 'ā', uu: 'ū', ee: 'ē', oo: 'ō', ou: 'ō' };
const MACRON: Readonly<Record<string, string>> = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };

function lengthen(text: string): string {
  const last = text.slice(-1);
  return MACRON[last] ? text.slice(0, -1) + MACRON[last] : text;
}
