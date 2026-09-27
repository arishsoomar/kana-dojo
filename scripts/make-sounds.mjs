// Makes the app's sound effects from scratch, as plain maths, so there's no recording and no
// licence to worry about. Run it with `node scripts/make-sounds.mjs`; it writes WAV files to
// assets/audio/effects/.
//
// - taiko.wav: one "don" on a big drum, for the end of a lesson.
// - gong.wav: a temple gong, for a belt tied on.
// - taiko-song.wav: "Tanuki matsuri", the Taiko drill's festival song.

import { mkdirSync, writeFileSync } from 'node:fs';

const RATE = 22050; // samples per second: plenty for sounds this low
const OUT = new URL('../assets/audio/effects/', import.meta.url);

// A random number generator with a fixed seed, so the files come out the same every run.
function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

// A drum hit: a low tone whose pitch drops as the skin settles, a rounder overtone, and a
// short thump of noise where the stick lands. Then a little room around it.
function taiko() {
  const noise = seeded(7);
  const seconds = 1.1;
  const out = new Float32Array(Math.round(seconds * RATE));
  let phase1 = 0;
  let phase2 = 0;
  let low = 0; // the noise, smoothed so it thumps instead of hisses
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const pitch = 58 + 62 * Math.exp(-t / 0.05); // 120 Hz sliding down to 58 Hz
    phase1 += (2 * Math.PI * pitch) / RATE;
    phase2 += (2 * Math.PI * pitch * 1.6) / RATE;
    const body = Math.sin(phase1) * Math.exp(-t / 0.32);
    const overtone = 0.35 * Math.sin(phase2) * Math.exp(-t / 0.12);
    low += 0.08 * (noise() * 2 - 1 - low);
    const stick = 2.5 * low * Math.exp(-t / 0.018);
    out[i] = Math.tanh(1.6 * (body + overtone + stick)); // a touch of saturation, for weight
  }
  return fadeOut(room(out, 0.18), 0.3);
}

// A gong: many out-of-tune partials, the high ones blooming a moment after the strike and
// dying away sooner, over a long low hum.
function gong() {
  const seconds = 3.6;
  const out = new Float32Array(Math.round(seconds * RATE));
  const base = 98;
  // [ratio to the base, loudness, how long it rings in seconds, when it peaks in seconds]
  const partials = [
    [1, 1, 2.2, 0],
    [1.47, 0.55, 1.8, 0.03],
    [2.09, 0.5, 1.5, 0.08],
    [2.56, 0.4, 1.2, 0.12],
    [3.33, 0.3, 1.0, 0.18],
    [4.18, 0.22, 0.8, 0.22],
    [5.43, 0.15, 0.6, 0.25],
    [6.9, 0.1, 0.45, 0.28],
  ];
  for (const [ratio, loudness, rings, peak] of partials) {
    const freq = base * ratio;
    for (let i = 0; i < out.length; i++) {
      const t = i / RATE;
      const rise = peak === 0 ? 1 : Math.min(1, t / peak); // the bloom
      const shimmer = 1 + 0.002 * Math.sin(2 * Math.PI * 0.7 * t); // a slow wobble in pitch
      out[i] += loudness * rise * Math.exp(-t / rings) * Math.sin(2 * Math.PI * freq * shimmer * t);
    }
  }
  // The mallet: a soft low thump at the very start.
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    out[i] += 0.6 * Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t / 0.06);
  }
  return fadeOut(room(out, 0.25), 0.5);
}

// The Taiko drill's song, to the chart in src/core/taiko.ts (keep these in step with it):
// 100 beats a minute, 4 beats to count in, a note every other beat for 16 notes, then a note
// every beat for 32, and 3 beats to finish: 71 beats.
const BPM = 100;
const SONG_BEATS = 71;
const COUNT_IN = 4;
const WARM_UP_END = COUNT_IN + 32; // the beat the every-beat part starts

// A rim shot: a short, bright click of noise.
function ka(seed) {
  const noise = seeded(seed);
  const out = new Float32Array(Math.round(0.06 * RATE));
  let last = 0;
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const white = noise() * 2 - 1;
    const bright = white - last; // only the fizz, without the rumble
    last = white;
    out[i] = 0.6 * bright * Math.exp(-t / 0.012);
  }
  return out;
}

// A festival flute (fue) note: a pure tone with a breathy start and a little vibrato.
function fue(freq, seconds) {
  const noise = seeded(Math.round(freq));
  const out = new Float32Array(Math.round(seconds * RATE));
  for (let i = 0; i < out.length; i++) {
    const t = i / RATE;
    const swell = Math.min(1, t / 0.04) * Math.min(1, (seconds - t) / 0.08);
    const vibrato = 1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t);
    const breath = 0.05 * (noise() * 2 - 1) * Math.exp(-t / 0.05);
    out[i] = swell * (0.28 * Math.sin(2 * Math.PI * freq * vibrato * t) + breath);
  }
  return out;
}

// Adds a sound into the song at a time, at a loudness.
function mixIn(song, sound, seconds, gain) {
  const start = Math.round(seconds * RATE);
  for (let i = 0; i < sound.length && start + i < song.length; i++) song[start + i] += gain * sound[i];
}

function taikoSong() {
  const beat = 60 / BPM;
  const song = new Float32Array(Math.round((SONG_BEATS * beat + 1.2) * RATE));
  const don = taiko();
  // A melody in the Japanese yo scale (D E G A B), one note a beat in the fast part.
  const YO = [587, 659, 784, 880, 988];
  const tune = [0, 1, 2, 1, 3, 2, 1, 0, 2, 3, 4, 3, 2, 1, 2, 0];
  for (let b = 0; b < SONG_BEATS; b++) {
    const at = b * beat;
    if (b < COUNT_IN) {
      // Counting in: the sticks clicked together.
      mixIn(song, ka(b + 1), at, 1.1);
      continue;
    }
    const noteBeat = b < WARM_UP_END ? (b - COUNT_IN) % 2 === 0 : b < SONG_BEATS - 3;
    // A drum on every note, bigger on the first of each four beats.
    if (noteBeat) mixIn(song, don, at, b % 4 === 0 ? 1 : 0.75);
    // Rim clicks between: on the off-beats, and on the beats without a note.
    mixIn(song, ka(100 + b), at + beat / 2, 0.55);
    if (!noteBeat && b < SONG_BEATS - 3) mixIn(song, ka(200 + b), at, 0.7);
    // The flute joins for the fast part.
    if (b >= WARM_UP_END && b < SONG_BEATS - 3) mixIn(song, fue(YO[tune[(b - WARM_UP_END) % tune.length]], beat * 0.9), at, 1);
  }
  // A last big drum to finish.
  mixIn(song, don, (SONG_BEATS - 3) * beat, 1.2);
  return fadeOut(song, 0.6);
}

// Fades out the last part, so the sound ends in silence instead of a click.
function fadeOut(samples, seconds) {
  const fade = Math.round(seconds * RATE);
  for (let i = 0; i < fade; i++) samples[samples.length - 1 - i] *= i / fade;
  return samples;
}

// A small room: a few quiet echoes, so the sound isn't bone dry.
function room(dry, amount) {
  const wet = Float32Array.from(dry);
  for (const [ms, gain] of [
    [37, 0.5],
    [53, 0.4],
    [79, 0.3],
    [113, 0.2],
  ]) {
    const delay = Math.round((ms / 1000) * RATE);
    for (let i = delay; i < wet.length; i++) wet[i] += amount * gain * wet[i - delay];
  }
  return wet;
}

// Scales the loudest point to about -3 dB and writes a 16-bit mono WAV file.
function writeWav(name, samples) {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const scale = 0.7 / peak;
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(s * scale * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // format chunk size
  header.writeUInt16LE(1, 20); // plain PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28); // bytes per second
  header.writeUInt16LE(2, 32); // bytes per sample
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(new URL(name, OUT), Buffer.concat([header, data]));
}

mkdirSync(OUT, { recursive: true });
writeWav('taiko.wav', taiko());
writeWav('gong.wav', gong());
writeWav('taiko-song.wav', taikoSong());
