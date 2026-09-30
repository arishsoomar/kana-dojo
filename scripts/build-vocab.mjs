// Builds the word deck: the 2,500 most frequent Japanese words, with their readings,
// meanings, furigana and an example sentence. It joins four open sources:
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

const WORDS = 2500;
const CACHE = new URL('../.cache/vocab/', import.meta.url);
const OUT = new URL('../src/content/vocab.json', import.meta.url);
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
  });
}
console.log(`Chosen ${chosen.size} words. Skipped:`, skipped);

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

  let pieces; // worked out once, only if the sentence is wanted
  for (const t of tokens) {
    if (!t.entry || !chosen.has(t.entry.seq)) continue;
    // Checked examples first, then shorter ones.
    const score = (t.checked ? 0 : 100) + [...text].length;
    const current = best.get(t.entry.seq);
    if (current && current.score <= score) continue;
    pieces ??= sentenceFurigana(text, tokens);
    if (!pieces) break;
    best.set(t.entry.seq, { score, example: { ja: pieces, en: translation } });
  }
}

// --- Writing ------------------------------------------------------------------------------

const words = [...chosen.values()].map((w) => ({ ...w, example: best.get(w.id)?.example ?? null }));
writeFileSync(OUT, `${JSON.stringify(words, null, 0).replace(/\},\{"id"/g, '},\n{"id"')}\n`);
const withExamples = words.filter((w) => w.example).length;
console.log(`Wrote ${words.length} words to src/content/vocab.json, ${withExamples} with an example sentence.`);
