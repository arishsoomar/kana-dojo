// Builds the word deck: the 2,500 most frequent Japanese words, and the words GENKI I teaches
// (scripts/genki-words.mjs), with their readings, meanings, furigana and an example sentence;
// and GENKI I's flashcards, lesson by lesson (src/content/genki.json). It joins four open
// sources:
//
//   Jiten's global frequency list (CC BY-SA 4.0, https://jiten.moe/frequency-dictionaries):
//     which words, and in what order. Made from anime, drama, films, novels, games and more.
//   JMdict (CC BY-SA 4.0, EDRDG, https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project):
//     readings, meanings and parts of speech.
//   JmdictFurigana (CC BY-SA 4.0, https://github.com/Doublevil/JmdictFurigana):
//     which kana of a reading sit over which kanji.
//   Tatoeba (CC BY 2.0 FR, https://tatoeba.org): example sentences and their translations,
//     through its Japanese index, which links each sentence to the dictionary words in it.
//
// The downloads are kept in .cache/vocab/ (not committed); the result, src/content/vocab.json,
// is. It's under CC BY-SA 4.0 like the dictionary data it comes from.
// Run it with `node scripts/build-vocab.mjs`. It needs curl and bunzip2 (both come with macOS).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

import { GENKI } from './genki-words.mjs';

const WORDS = 2500;
const CACHE = new URL('../.cache/vocab/', import.meta.url);
const OUT = new URL('../src/content/vocab.json', import.meta.url);
const GENKI_OUT = new URL('../src/content/genki.json', import.meta.url);
const KANA_SOURCE = new URL('../src/core/kana.ts', import.meta.url);

const SOURCES = {
  frequency: 'https://api.jiten.moe/api/frequency-list/download?downloadType=csv',
  jmdict: 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz',
  furigana: 'https://github.com/Doublevil/JmdictFurigana/releases/latest/download/JmdictFurigana.json',
  indices: 'https://downloads.tatoeba.org/exports/jpn_indices.tar.bz2',
  japanese: 'https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2',
  english: 'https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2',
};

// Words that aren't studied on their own: particles (の, は), auxiliaries and the copula
// (だ, です), and prefixes and suffixes (お, さん). Grammar lessons teach those. Expressions
// written only in kana are grammar too (んだ, という, でしょう), and so is a word whose first
// part of speech is a suffix (よう).
const LEFT_OUT = new Set(['prt', 'aux', 'aux-v', 'aux-adj', 'cop', 'cop-da', 'suf', 'pref', 'unc']);
function leftOut(word, pos) {
  if (pos.some((p) => LEFT_OUT.has(p))) return true;
  if (pos[0] === 'n-suf') return true;
  if (pos[0] === 'exp' && !hasKanji(word)) return true;
  // One kana on its own is a sound (ん, あ, え), not a word to study, and so is one cut off
  // with a small っ (あっ, えっ, チッ).
  return !hasKanji(word) && ([...word].length === 1 || /[っッ]$/.test(word));
}
// JMdict's labels for who says a word, and how, kept on each word (the rest, like "usually
// written in kana", aren't shown). Their names are in src/content/registers.ts.
const REGISTERS = new Set(['hon', 'hum', 'pol', 'form', 'col', 'fam', 'male', 'fem', 'chn', 'sl', 'joc', 'poet', 'dated', 'rare', 'sens', 'abbr']);
// Example sentences no longer than this, so they fit on a card.
const SENTENCE_MAX = 28;
const MEANINGS_MAX = 3; // senses shown
const GLOSSES_MAX = 3; // glosses per sense

// --- Downloading --------------------------------------------------------------------------

mkdirSync(CACHE, { recursive: true });

function cached(name, url) {
  const file = new URL(name, CACHE);
  if (!existsSync(file)) {
    console.log(`Downloading ${name}…`);
    execFileSync('curl', ['-sSL', '-A', 'kana-dojo-build', '-o', file.pathname, url]);
  }
  return file;
}

// A .bz2 download, unpacked (tar archives as well).
function unpacked(name, url, inner) {
  const target = new URL(inner, CACHE);
  if (!existsSync(target)) {
    const archive = cached(name, url);
    if (name.endsWith('.tar.bz2')) execFileSync('tar', ['xjf', archive.pathname, '-C', CACHE.pathname]);
    else execFileSync('bunzip2', ['-kf', archive.pathname]);
  }
  return readFileSync(target, 'utf8');
}

const frequencyCsv = readFileSync(cached('frequency.csv', SOURCES.frequency), 'utf8');
const jmdictXml = gunzipSync(readFileSync(cached('JMdict_e.gz', SOURCES.jmdict))).toString('utf8');
const furiganaJson = readFileSync(cached('JmdictFurigana.json', SOURCES.furigana), 'utf8').replace(/^﻿/, '');
const indicesCsv = unpacked('jpn_indices.tar.bz2', SOURCES.indices, 'jpn_indices.csv');
const japaneseTsv = unpacked('jpn_sentences.tsv.bz2', SOURCES.japanese, 'jpn_sentences.tsv');
const englishTsv = unpacked('eng_sentences.tsv.bz2', SOURCES.english, 'eng_sentences.tsv');

// --- Kana the app teaches -----------------------------------------------------------------

// Every character in the app's kana table (both scripts, yōon included), plus っ, ッ and ー.
const kanaSource = readFileSync(KANA_SOURCE, 'utf8');
const TAUGHT = new Set(['っ', 'ッ', 'ー']);
for (const m of kanaSource.matchAll(/\['[a-z]+', '([^']+)', '([^']+)'/g)) {
  for (const text of [m[1], m[2]]) if (!/^[a-z]/.test(text)) for (const c of text) TAUGHT.add(c);
}
const readable = (reading) => [...reading].every((c) => TAUGHT.has(c));

// ヶ (as in 一ヶ月, ikkagetsu) is read like a kanji, so it's counted as one.
const hasKanji = (text) => /[㐀-鿿々〆ヶヵ]/.test(text);
const isJapanese = (text) => /^[぀-ヿ㐀-鿿々〆ー]+$/.test(text);

// --- JMdict -------------------------------------------------------------------------------

const tags = (block, tag) => [...block.matchAll(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'g'))].map((m) => m[1]);
const entity = (text) => text.replace(/^&|;$/g, '');

const entries = new Map(); // ent_seq → entry
const byKanji = new Map(); // written form → entries
const byReading = new Map(); // reading → entries
const add = (map, key, value) => map.set(key, [...(map.get(key) ?? []), value]);

for (const block of jmdictXml.split('</entry>')) {
  const seq = block.match(/<ent_seq>(\d+)<\/ent_seq>/)?.[1];
  if (!seq) continue;
  const kanji = [...block.matchAll(/<k_ele>([\s\S]*?)<\/k_ele>/g)].map((m) => ({
    text: tags(m[1], 'keb')[0],
    common: tags(m[1], 'ke_pri').length > 0,
  }));
  const readings = [...block.matchAll(/<r_ele>([\s\S]*?)<\/r_ele>/g)].map((m) => ({
    text: tags(m[1], 'reb')[0],
    common: tags(m[1], 're_pri').length > 0,
    only: tags(m[1], 're_restr'), // the kanji forms it's the reading of (all, if empty)
    noKanji: m[1].includes('<re_nokanji'),
  }));
  let lastPos = [];
  const senses = [...block.matchAll(/<sense>([\s\S]*?)<\/sense>/g)].map((m) => {
    const pos = tags(m[1], 'pos').map(entity);
    // A sense with no parts of speech has the ones before it.
    if (pos.length > 0) lastPos = pos;
    return {
      pos: pos.length > 0 ? pos : lastPos,
      misc: tags(m[1], 'misc').map(entity),
      onlyKanji: tags(m[1], 'stagk'),
      onlyReading: tags(m[1], 'stagr'),
      info: tags(m[1], 's_inf'),
      glosses: tags(m[1], 'gloss'),
    };
  });
  const entry = { seq: Number(seq), kanji, readings, senses };
  entries.set(entry.seq, entry);
  for (const k of kanji) add(byKanji, k.text, entry);
  for (const r of readings) add(byReading, r.text, entry);
}
console.log(`JMdict: ${entries.size} entries`);

// Whether `reading` is a reading of `word` in this entry.
function readsAs(entry, word, reading) {
  if (!hasKanji(word)) return entry.readings.some((r) => r.text === word);
  return entry.readings.some((r) => r.text === reading && !r.noKanji && (r.only.length === 0 || r.only.includes(word)));
}

// A kana-only word counts for an entry only if the entry is written that way: it has no kanji,
// or it's usually written in kana (JMdict's "uk", on any of its senses). Otherwise いく would
// count for 行く and 逝く.
function writtenInKana(entry, word) {
  return entry.kanji.length === 0 || entry.readings.some((r) => r.text === word && r.noKanji) || entry.senses.some((s) => s.misc.includes('uk'));
}

// The dictionary entry a word from the frequency list means, or null.
function entryFor(word, reading) {
  const candidates = (hasKanji(word) ? byKanji.get(word) : byReading.get(word)) ?? [];
  const fits = candidates.filter((e) => readsAs(e, word, reading) && (hasKanji(word) || writtenInKana(e, word)));
  if (fits.length === 0) return null;
  // More than one (いる is 居る "to be", and 要る "to need"): the one used most in Tatoeba's
  // sentences, then the one marked common for this spelling, then the lowest number.
  const common = (e) => (hasKanji(word) ? e.kanji.some((k) => k.text === word && k.common) : e.readings.some((r) => r.text === word && r.common));
  const used = (e) => usage.get(e.seq) ?? 0;
  return [...fits].sort((a, b) => used(b) - used(a) || Number(common(b)) - Number(common(a)) || a.seq - b.seq)[0];
}

// The senses that apply to this spelling and reading.
function sensesFor(entry, word, reading) {
  return entry.senses.filter(
    (s) => (s.onlyKanji.length === 0 || s.onlyKanji.includes(word)) && (s.onlyReading.length === 0 || s.onlyReading.includes(reading)),
  );
}

// --- Furigana -----------------------------------------------------------------------------

const furigana = new Map(); // "text|reading" → [[ruby, rt?], …]
for (const f of JSON.parse(furiganaJson)) {
  furigana.set(`${f.text}|${f.reading}`, f.furigana.map((p) => (p.rt ? [p.ruby, p.rt] : [p.ruby])));
}

// A word's furigana: its kanji with their readings over them. Kana-only words have none.
function furiganaFor(word, reading) {
  if (!hasKanji(word)) return [[word]];
  return furigana.get(`${word}|${reading}`) ?? [[word, reading]];
}

// --- How often each entry is used ---------------------------------------------------------

// One word in Tatoeba's index line: 戻る{戻ります}, 為る(する){する}, ログアウト~, ん[03].
const TOKEN = /^([^()[\]{}~]+)(?:\(([^)]+)\))?(?:\[\d+\])?(?:\{([^}]+)\})?(~)?$/;

// The dictionary entry an index word means: its headword, narrowed by the reading if given.
function tokenEntry(headword, reading) {
  const candidates = (hasKanji(headword) ? byKanji.get(headword) : byReading.get(headword)) ?? [];
  return candidates.find((e) => !reading || e.readings.some((r) => r.text === reading)) ?? null;
}

// Times each entry appears in Tatoeba's sentences: real usage, for telling apart kana words
// that could be more than one entry.
const usage = new Map();
for (const line of indicesCsv.split('\n')) {
  for (const raw of (line.split('\t')[2] ?? '').trim().split(' ')) {
    const m = raw.match(TOKEN);
    const entry = m ? tokenEntry(m[1], m[2]) : null;
    if (entry) usage.set(entry.seq, (usage.get(entry.seq) ?? 0) + 1);
  }
}

// --- Choosing the words -------------------------------------------------------------------

const chosen = new Map(); // ent_seq → word
const skipped = { noEntry: 0, leftOut: 0, unreadable: 0, notJapanese: 0 };
for (const line of frequencyCsv.split('\n').slice(1)) {
  if (chosen.size >= WORDS) break;
  const [word, form, rankText] = line.split(',');
  if (!word || !form) continue;
  if (!isJapanese(word)) {
    skipped.notJapanese += 1;
    continue;
  }
  const reading = hasKanji(word) ? form : word;
  const entry = entryFor(word, reading);
  if (!entry) {
    skipped.noEntry += 1;
    continue;
  }
  // Seen already, under a more frequent spelling.
  if (chosen.has(entry.seq)) continue;
  const senses = sensesFor(entry, word, reading).filter((s) => !s.misc.includes('arch') && !s.misc.includes('obs'));
  const pos = senses[0]?.pos ?? [];
  // Not vulgar or insulting words (the corpus has plenty of anime villains).
  const rude = senses[0]?.misc.some((m) => m === 'vulg' || m === 'derog' || m === 'X');
  if (senses.length === 0 || leftOut(word, pos) || rude) {
    skipped.leftOut += 1;
    continue;
  }
  if (!readable(reading)) {
    skipped.unreadable += 1;
    continue;
  }
  chosen.set(entry.seq, {
    id: entry.seq,
    rank: Number(rankText),
    word,
    reading,
    furigana: furiganaFor(word, reading),
    meanings: senses.slice(0, MEANINGS_MAX).map((s) => s.glosses.slice(0, GLOSSES_MAX).join('; ')),
    pos,
    // Who says it, and how: the main meaning's register labels (honorific, humble, casual, male
    // speech…), and its usage note ("informal, rough, blunt").
    labels: (senses[0]?.misc ?? []).filter((m) => REGISTERS.has(m)),
    note: senses[0]?.info[0] ?? null,
  });
}
console.log(`Chosen ${chosen.size} words. Skipped:`, skipped);

// --- GENKI's words ------------------------------------------------------------------------

// Each word GENKI I teaches that the dictionary has is in the deck: words not among the most
// frequent are added, ranked where the frequency list has them (after every word it lists, if it
// doesn't). Greetings and set phrases count here (おはようございます), though the frequency deck
// leaves expressions in kana out; particles, suffixes and the like are still left out.
const rankOf = new Map(); // "word|reading" → rank, first listing
for (const line of frequencyCsv.split('\n').slice(1)) {
  const [word, form, rankText] = line.split(',');
  if (!word || !form) continue;
  const key = `${word}|${hasKanji(word) ? form : word}`;
  if (!rankOf.has(key)) rankOf.set(key, Number(rankText));
}
const unranked = [...rankOf.values()].reduce((a, b) => Math.max(a, b), 0) + 1;

// The most frequent words, before GENKI's are added: what example sentences are judged by.
const frequent = new Set(chosen.keys());

// GENKI writes some words in kana that the dictionary doesn't mark as usually written in kana
// (あさって for 明後日, やせる for 痩せる). For those, the entry with that reading: one where it's
// marked common, then the one used most.
function kanaEntry(word) {
  if (hasKanji(word)) return null;
  const common = (e) => e.readings.some((r) => r.text === word && r.common);
  const used = (e) => usage.get(e.seq) ?? 0;
  return [...(byReading.get(word) ?? [])].sort((a, b) => Number(common(b)) - Number(common(a)) || used(b) - used(a) || a.seq - b.seq)[0] ?? null;
}

// Furigana for a word the furigana list doesn't have (二時半, たばこを吸う, Tシャツ): its kana
// stay as they are, and each run of other characters (kanji, or letters like the T of Tシャツ)
// gets the part of the reading between them. ～ (a suffix or prefix mark) has no reading.
function alignFurigana(word, reading) {
  const known = furigana.get(`${word}|${reading}`);
  if (known) return known;
  const runs = word.match(/[ぁ-ゖァ-ヺー]+|[～〜]|[^ぁ-ゖァ-ヺー～〜]+/g) ?? [];
  const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = runs.map((r) => (/^[ぁ-ゖァ-ヺー]+$/.test(r) ? escape(r) : /^[～〜]$/.test(r) ? '' : '(.+?)')).join('');
  const m = reading.match(new RegExp(`^${pattern}$`));
  if (!m) return null;
  let group = 1;
  return runs.map((r) => (/^[ぁ-ゖァ-ヺー]+$/.test(r) || /^[～〜]$/.test(r) ? [r] : [r, m[group++]]));
}

// Each lesson's cards, in the book's order: the book's word and English, linked to the
// dictionary word it is (for its example sentence, its usage labels and the like) when one is
// found. A word's card keeps the word's id, so what's known carries over between lessons; the
// same word with another meaning (聞く: to listen, then to ask) gets a card of its own.
const genkiDecks = {};
const cardMeaning = new Map(); // card id → its meaning and reading
const unlinked = [];
let added = 0;
for (const [lesson, list] of Object.entries(GENKI)) {
  genkiDecks[lesson] = list
    .trim()
    .split('\n')
    .map((line, place) => {
      const [kana, kanjiField, meaning] = line.split(';').map((t) => t.trim());
      const hint = kanjiField.match(/^\((.+)\)$/)?.[1] ?? null;
      const shown = (!hint && kanjiField) || kana;
      const reading = kana.replace(/[～〜]/g, '');
      const furiganaPieces = alignFurigana(shown, kana.replace(/[～〜]/g, '')) ?? [[shown]];
      // Affixes (～さん) and words the dictionary lists only as grammar have no word to link.
      const affix = /[～〜]/.test(kana);
      const lookup = (hint ?? (kanjiField || kana)).replace(/[～〜]/g, '');
      // A する verb (勉強する) is in the dictionary as its noun (勉強), marked as taking する.
      const verb = lookup.endsWith('する') && lookup.length > 2 ? { word: lookup.slice(0, -2), reading: reading.slice(0, -2) } : null;
      const found = (w, r) => entryFor(w, r) ?? (hasKanji(w) ? null : kanaEntry(w));
      // With a hint, the entry whose main spelling it is: 家 read うち is "home", not 内.
      const hinted = hint ? (byKanji.get(hint) ?? []).find((e) => e.kanji[0]?.text === hint && readsAs(e, hint, reading)) : null;
      const direct = affix || hint === '-' ? null : (hinted ?? found(lookup, reading));
      const entry = direct ?? (verb && !affix && hint !== '-' ? found(verb.word, verb.reading) : null);
      const [entryWord, entryReading] = direct || !verb ? [lookup, reading] : [verb.word, verb.reading];
      const senses = entry ? sensesFor(entry, entryWord, entryReading).filter((s) => !s.misc.includes('arch') && !s.misc.includes('obs')) : [];
      const pos = senses[0]?.pos ?? [];
      const linked = entry && senses.length > 0 && !LEFT_OUT.has(pos[0]) && readable(entryReading) ? entry : null;
      if (!linked) unlinked.push(kana);
      if (linked && !chosen.has(linked.seq)) {
        added += 1;
        chosen.set(linked.seq, {
          id: linked.seq,
          rank: rankOf.get(`${entryWord}|${entryReading}`) ?? unranked + Number(lesson) * 1000 + place,
          word: entryWord,
          reading: entryReading,
          furigana: furiganaFor(entryWord, entryReading),
          meanings: senses.slice(0, MEANINGS_MAX).map((s) => s.glosses.slice(0, GLOSSES_MAX).join('; ')),
          pos,
          labels: (senses[0]?.misc ?? []).filter((m) => REGISTERS.has(m)),
          note: senses[0]?.info[0] ?? null,
        });
      }
      // Another reading of the same word (四: よん and し) is a card of its own too.
      let id = linked ? String(linked.seq) : `genki-${lesson}-${reading}`;
      const same = cardMeaning.get(id);
      if (same && (same.meaning !== meaning || same.reading !== reading)) id = `${id}-${reading}-${lesson}`;
      cardMeaning.set(id, { meaning, reading });
      return { id, word: shown, reading, furigana: furiganaPieces, meaning, vocab: linked ? linked.seq : null };
    });
}
const cards = Object.values(genkiDecks).flat();
console.log(`GENKI: ${cards.length} cards, ${cards.length - unlinked.length} linked to a dictionary word (${added} added to the deck). Not linked: ${unlinked.join(' ')}`);

// --- Example sentences --------------------------------------------------------------------

const japanese = new Map();
for (const line of japaneseTsv.split('\n')) {
  const [id, , text] = line.split('\t');
  if (id && text) japanese.set(id, text);
}
const english = new Map();
for (const line of englishTsv.split('\n')) {
  const [id, , text] = line.split('\t');
  if (id && text) english.set(id, text);
}

// A word as it appears in a sentence, with furigana: the dictionary form's furigana carried
// over to the inflected form (戻る's 戻/もど stays on 戻ります). Null if a kanji can't be
// given a reading.
function surfaceFurigana(headword, reading, surface) {
  if (!hasKanji(surface)) return [[surface]];
  const base = furigana.get(`${headword}|${reading}`);
  if (!base) return null;
  const out = [];
  let rest = surface;
  for (const part of base) {
    if (rest.startsWith(part[0])) {
      // Only kanji get a reading: not a letter, as in Ｘ線 (X-rays).
      out.push(hasKanji(part[0]) ? part : [part[0]]);
      rest = rest.slice(part[0].length);
    } else break;
  }
  if (rest && hasKanji(rest)) return null;
  if (rest) out.push([rest]);
  return out;
}

// The reading of a headword in an entry, when the index doesn't give one.
function headwordReading(entry, headword, given) {
  if (given) return given;
  if (!hasKanji(headword)) return headword;
  return entry.readings.find((r) => !r.noKanji && (r.only.length === 0 || r.only.includes(headword)))?.text ?? null;
}

// The sentence as furigana pieces, or null if any kanji in it can't be given a reading.
function sentenceFurigana(text, tokens) {
  const pieces = [];
  let at = 0;
  for (const t of tokens) {
    const found = text.indexOf(t.surface, at);
    if (found < 0 || !t.furigana) continue;
    const between = text.slice(at, found);
    if (hasKanji(between)) return null;
    if (between) pieces.push([between]);
    pieces.push(...t.furigana);
    at = found + t.surface.length;
  }
  const tail = text.slice(at);
  if (hasKanji(tail)) return null;
  if (tail) pieces.push([tail]);
  // Join neighbouring plain pieces.
  return pieces.reduce((joined, p) => {
    const last = joined[joined.length - 1];
    if (last && last.length === 1 && p.length === 1) last[0] += p[0];
    else joined.push([...p]);
    return joined;
  }, []);
}

const best = new Map(); // ent_seq → { score, example }
for (const line of indicesCsv.split('\n')) {
  const [sentenceId, meaningId, bLine] = line.split('\t');
  const text = japanese.get(sentenceId);
  const translation = english.get(meaningId);
  if (!text || !translation || !bLine || [...text].length > SENTENCE_MAX) continue;

  const tokens = bLine
    .trim()
    .split(' ')
    .map((raw) => {
      const m = raw.match(TOKEN);
      if (!m) return null;
      const [, headword, reading, form, checked] = m;
      const entry = tokenEntry(headword, reading);
      const read = entry ? headwordReading(entry, headword, reading) : null;
      const surface = form ?? headword;
      return {
        entry,
        surface,
        checked: checked === '~',
        furigana: read ? surfaceFurigana(headword, read, surface) : hasKanji(surface) ? null : [[surface]],
      };
    })
    .filter(Boolean);

  // How easy the sentence is: the share of its words among the most frequent, or grammar
  // (particles, endings), which the lessons teach.
  const grammarWord = (t) => t.entry && t.entry.senses[0]?.pos.some((p) => LEFT_OUT.has(p) || p === 'exp');
  const known = tokens.filter((t) => (t.entry && frequent.has(t.entry.seq)) || grammarWord(t)).length / Math.max(tokens.length, 1);
  const polite = /(です|ます|ません|ました|でした)[。？?！!]?$/.test(text);
  const length = [...text].length;

  let pieces; // worked out once, only if the sentence is wanted
  tokens.forEach((t, i) => {
    if (!t.entry || !chosen.has(t.entry.seq) || pieces === null) return;
    // Not when the word is only part of a longer one: あなた in あなたたち.
    const nextPos = tokens[i + 1]?.entry?.senses[0]?.pos ?? [];
    if (nextPos.includes('suf') || nextPos.includes('n-suf')) return;
    // Lower is better: checked examples first; then about 14 characters long, made of words
    // the learner will know, and polite, like the lessons.
    const score = (t.checked ? 0 : 12) + Math.abs(length - 14) + 30 * (1 - known) + (polite ? 0 : 8);
    const current = best.get(t.entry.seq);
    if (current && current.score <= score) return;
    pieces ??= sentenceFurigana(text, tokens);
    if (!pieces) return;
    best.set(t.entry.seq, { score, example: { ja: pieces, en: translation } });
  });
}

// --- Topics -------------------------------------------------------------------------------

// Topics to browse and study by. A word is in a topic when its main meaning (its first sense)
// uses one of the topic's words, as a whole word, plurals too: 食べる ("to eat") is food and
// 駅 ("station") is places. Only the main meaning, or 行く ("to go; to head towards") would be
// body, for "head". A word can be in several topics, or none (こと, それ). Numbers and
// counters are numbers whatever they mean. The ids match src/content/topics.ts.
const TOPICS = {
  food: 'food eat eating drink drinking water tasting sugary meal breakfast lunch dinner cook cooking rice meat fish vegetable fruit tea coffee beer alcohol wine bread cake egg sugar salt soup noodle noodles taste delicious tasty hungry restaurant menu kitchen dish snack sweets candy milk juice apple chopsticks bowl beef pork sushi ramen curry flavor flavour spicy spoon plate lunchbox feast',
  places: 'station train railway airport airplane plane hotel road street city town village country travel trip journey tourist car bus taxi bicycle ship boat shop store bank hospital park map building bridge temple shrine castle japan abroad overseas address north south east west',
  people: 'person people man woman men women boy girl child children kid baby family mother father parent brother sister son daughter husband wife friend grandmother grandfather grandchild uncle aunt teacher student adult human girlfriend boyfriend lover neighbor neighbour guest customer stranger everyone somebody someone',
  time: 'time day week month year today tomorrow yesterday morning noon afternoon evening night tonight hour minute clock calendar spring summer autumn winter season date birthday holiday weekend monday tuesday wednesday thursday friday saturday sunday early late soon future past now era century moment recently lately always sometimes',
  body: 'body head face eye ear nose mouth tooth teeth hair hand arm leg foot feet finger stomach belly neck shoulder skin blood bone sick ill illness disease fever pain hurt injury wound medicine health healthy tired sleep asleep breath',
  feelings: 'feel feeling happy sad sadness angry anger love hate fear afraid scared worry worried anxious lonely glad joy fun enjoy surprise surprised embarrassed jealous envy regret sorry hope mood emotion tears cry laugh smile pleasant unpleasant boring bored excited nervous calm relief relieved disappointed shame proud pride liking fond dislike',
  nature: 'nature weather rain snow wind cloud sky sun moon star sea ocean beach mountain river lake forest tree flower grass leaf stone rock earth ground island fire water ice sunny storm thunder typhoon earthquake air',
  animals: 'animal dog cat bird fish horse cow pig chicken monkey rabbit mouse insect bug snake dragon fox wolf pet',
  home: 'house home room door window desk table chair bed clothes clothing shirt shoes hat bag box key phone telephone television computer book paper pen money umbrella toilet bath bathroom wall floor roof garden stairs furniture toy',
  work: 'work job company office meeting boss business school study studying student teacher class lesson exam examination test homework university college research project salary employee staff colleague career factory',
  numbers: 'number amount quantity half double pair dozen hundred thousand million yen percent',
  talk: 'say speak talk tell ask answer question word words language japanese english conversation story explain listen hear write read letter sentence meaning think idea opinion remember forget know understand learn',
};
const TOPIC_WORDS = Object.fromEntries(Object.entries(TOPICS).map(([id, words]) => [id, new Set(words.split(' '))]));

// Words the keywords put in the wrong topic, by a figure of speech ("grounds" for a reason,
// "to fire" a gun), and the topics they're not in.
const NOT_IN = {
  理由: ['nature'],
  訳: ['nature'],
  一体: ['nature', 'body'],
  放つ: ['nature'],
  撃つ: ['nature'],
  せっかく: ['body'],
  目指す: ['body'],
  対する: ['body'],
  向かう: ['body'],
  向ける: ['body'],
  聞こえる: ['body'],
  立つ: ['body'],
  成果: ['food'],
  好み: ['food'],
  いっぱい: ['food'],
  かい: ['food'],
  隙: ['home'],
  調子: ['home'],
  相手: ['work'],
  連中: ['work'],
  付き合う: ['work'],
  病院: ['work'],
  伝わる: ['places'],
  話しかける: ['places'],
  裏切る: ['numbers'],
  追い詰める: ['home'],
  ポイント: ['home'],
  伏せる: ['home'],
  武器: ['body'],
  譲る: ['body'],
  振り返る: ['body'],
  一気: ['body'],
  巻く: ['nature'],
  ます: ['nature'],
  性: ['nature'],
  本番: ['nature'],
  軽い: ['feelings'],
  触る: ['feelings'],
  触れる: ['feelings'],
  相手にする: ['work'],
  出会い: ['work'],
  再会: ['work'],
  通る: ['time'],
  おいおい: ['time'],
  行く: ['body'],
  星: ['body'],
  海: ['food'],
  遊ぶ: ['time'],
  楽しむ: ['time'],
  詳しい: ['time'],
  どこまでも: ['nature'],
  ふざける: ['people'],
  書く: ['home'],
};

// Words whose main meaning is a figure of speech, but which clearly belong in a topic: 肉's
// first meaning is "flesh", its second "meat".
const ALSO_IN = {
  肉: ['food'],
  うまい: ['food'],
  美味い: ['food'],
  甘い: ['food'],
};

// The topics a word's main meaning (its first sense) puts it in.
function topicsFor(word, meanings, pos) {
  const words = (meanings[0] ?? '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // not the notes in brackets: "to take (e.g. a train)"
    .split(/[^a-z]+/)
    .filter(Boolean);
  const plain = (w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);
  const counted = pos.includes('num') || pos.includes('ctr');
  return Object.keys(TOPICS).filter(
    (id) =>
      (ALSO_IN[word] ?? []).includes(id) ||
      (!(NOT_IN[word] ?? []).includes(id) &&
        ((id === 'numbers' && counted) || words.some((w) => TOPIC_WORDS[id].has(w) || TOPIC_WORDS[id].has(plain(w))))),
  );
}

for (const word of chosen.values()) word.topics = topicsFor(word.word, word.meanings, word.pos);

// --- Writing ------------------------------------------------------------------------------

// Most frequent first, GENKI's added words among the rest.
const words = [...chosen.values()].sort((a, b) => a.rank - b.rank).map((w) => ({ ...w, example: best.get(w.id)?.example ?? null }));
writeFileSync(OUT, `${JSON.stringify(words, null, 0).replace(/\},\{"id"/g, '},\n{"id"')}\n`);
// Each GENKI lesson's flashcards, in the book's order.
writeFileSync(GENKI_OUT, `${JSON.stringify(genkiDecks, null, 0).replace(/\},\{"id"/g, '},\n{"id"')}\n`);
const withExamples = words.filter((w) => w.example).length;
console.log(`Wrote ${words.length} words to src/content/vocab.json, ${withExamples} with an example sentence.`);
