// Records everything the app says (src/audio/voice-lines.ts) in two VOICEVOX voices, one female
// and one male, and writes src/constants/voice-clips.ts, the table the app plays them from.
//
// It needs the VOICEVOX engine running on this computer (https://voicevox.hiroshiba.jp, or its
// engine alone: https://github.com/VOICEVOX/voicevox_engine/releases), on its usual port 50021,
// and macOS's afconvert to squeeze each recording into a small AAC file. Lines already recorded
// are kept, so after adding words only the new ones are made.
// Run it with `npx tsx scripts/make-voices.mts`.
//
// The voices' terms ask for a credit, "VOICEVOX:<name>": it's on the sources screen
// (src/content/sources.ts).

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

import { voiceLines, type VoiceLine } from '@/audio/voice-lines';
import { KANA } from '@/core/kana';

const ENGINE = 'http://127.0.0.1:50021';
const OUT = new URL('../assets/audio/voice/', import.meta.url);
const TABLE = new URL('../src/constants/voice-clips.ts', import.meta.url);

// Calm, natural voices that allow any use with a credit: 冥鳴ひまり (Meimei Himari) and
// 青山龍星 (Aoyama Ryūsei), each in their plain style. The numbers are VOICEVOX's style ids.
const VOICES = { female: 14, male: 13 } as const;

// A little slower than normal speech, for learners: words most, sentences a little.
const WORD_SPEED = 0.85;
const SENTENCE_SPEED = 0.92;

type Query = { kana: string; speedScale: number; [key: string]: unknown };

async function query(text: string, speaker: number): Promise<Query> {
  const response = await fetch(`${ENGINE}/audio_query?text=${encodeURIComponent(text)}&speaker=${speaker}`, { method: 'POST' });
  if (!response.ok) throw new Error(`audio_query failed for ${text}: ${response.status}`);
  return (await response.json()) as Query;
}

// A reading as it sounds, in katakana, to compare with how the engine reads a word: the engine
// writes long vowels out (こうこう is コオコオ, せんせい センセエ, コーヒー コオヒイ), and marks
// accents, pauses and whispered vowels (' / 、 _ ?), which are dropped.
const VOWEL_KANA = { a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ' } as const;
type Vowel = keyof typeof VOWEL_KANA;
const SMALL: Readonly<Record<string, Vowel>> = { ャ: 'a', ュ: 'u', ョ: 'o', ァ: 'a', ィ: 'i', ゥ: 'u', ェ: 'e', ォ: 'o' };
const VOWEL_OF = new Map<string, Vowel>(
  KANA.filter((k) => k.script === 'katakana' && k.char.length === 1).flatMap((k) => {
    const last = k.romaji[0].slice(-1);
    return last in VOWEL_KANA ? [[k.char, last as Vowel] as const] : [];
  }),
);
function sounded(text: string): string {
  const kana = text.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/['/、_?？ 　]/g, '');
  let out = '';
  let vowel: Vowel | undefined;
  for (const c of kana) {
    const said = c === 'ー' && vowel ? VOWEL_KANA[vowel] : c === 'ウ' && vowel === 'o' ? 'オ' : c === 'イ' && vowel === 'e' ? 'エ' : c;
    out += said;
    vowel = SMALL[said] ?? VOWEL_OF.get(said);
  }
  return out;
}

// The query for a line: from its written form, if the voice reads that the way it should be
// read (its pitch comes from knowing the word); otherwise from the reading itself.
async function lineQuery(line: VoiceLine, speaker: number): Promise<{ query: Query; fellBack: boolean }> {
  const written = await query(line.say, speaker);
  if (!line.reading || sounded(written.kana) === sounded(line.reading)) return { query: written, fellBack: false };
  return { query: await query(line.reading, speaker), fellBack: true };
}

const fileName = (key: string) => `${createHash('sha1').update(key).digest('hex').slice(0, 12)}.m4a`;
const isSentence = (line: VoiceLine) => /[。？！、]/.test(line.say) || [...line.say].length > 10;

async function record(line: VoiceLine, voice: keyof typeof VOICES): Promise<{ file: string; fellBack: boolean }> {
  const dir = new URL(`${voice}/`, OUT);
  mkdirSync(dir, { recursive: true });
  const file = fileName(line.key);
  const target = new URL(file, dir);
  if (existsSync(target)) return { file, fellBack: false };
  const { query: q, fellBack } = await lineQuery(line, VOICES[voice]);
  q.speedScale = isSentence(line) ? SENTENCE_SPEED : WORD_SPEED;
  const response = await fetch(`${ENGINE}/synthesis?speaker=${VOICES[voice]}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(q),
  });
  if (!response.ok) throw new Error(`synthesis failed for ${line.key}: ${response.status}`);
  const wav = new URL(`${file}.wav`, dir);
  writeFileSync(wav, Buffer.from(await response.arrayBuffer()));
  // Mono AAC at 32 kbps: clear for speech, and small.
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-c', '1', '-b', '32000', wav.pathname, target.pathname]);
  rmSync(wav);
  return { file, fellBack };
}

const version = await fetch(`${ENGINE}/version`).catch(() => null);
if (!version?.ok) throw new Error(`The VOICEVOX engine isn't running at ${ENGINE}.`);

const lines = voiceLines();
const tables: Record<string, string[]> = { female: [], male: [] };
const fellBack = new Set<string>();
// VOICE=female or VOICE=male records just that one (two can run side by side); the table is
// only complete from a run that does both.
const only = process.env.VOICE;
for (const voice of Object.keys(VOICES) as (keyof typeof VOICES)[]) {
  if (only && voice !== only) continue;
  let done = 0;
  for (const line of lines) {
    const result = await record(line, voice);
    if (result.fellBack) fellBack.add(`${line.say}→${line.reading}`);
    tables[voice]!.push(`    ${JSON.stringify(line.key)}: require('../../assets/audio/voice/${voice}/${result.file}'),`);
    done += 1;
    if (done % 100 === 0) console.log(`${voice}: ${done} of ${lines.length}`);
  }
}

if (!only) writeFileSync(
  TABLE,
  `// Written by scripts/make-voices.ts: don't edit by hand.
// Recordings of everything the app says (src/audio/voice-lines.ts), in each voice, by what the
// app asks to hear. VOICEVOX:冥鳴ひまり (female) and VOICEVOX:青山龍星 (male).
import type { AudioSource } from 'expo-audio';

import type { Speaker } from '@/core/answers';

export const VOICE_CLIPS: Readonly<Record<Speaker, Readonly<Record<string, AudioSource>>>> = {
  female: {
${tables.female!.join('\n')}
  },
  male: {
${tables.male!.join('\n')}
  },
};
`,
);
// Recordings of lines no longer said (a word taken out of a deck) are deleted.
if (!only) {
  for (const voice of Object.keys(VOICES)) {
    const used = new Set(lines.map((line) => fileName(line.key)));
    const dir = new URL(`${voice}/`, OUT);
    for (const file of readdirSync(dir)) if (!used.has(file)) rmSync(new URL(file, dir));
  }
}
console.log(`Recorded ${lines.length} lines in each voice.`);
if (fellBack.size > 0) console.log(`Said from the reading, as the written form was read differently: ${[...fellBack].join(', ')}`);
