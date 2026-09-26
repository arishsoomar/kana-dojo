// Makes the app's sound effects from scratch, as plain maths, so there's no recording and no
// licence to worry about. Run it with `node scripts/make-sounds.mjs`; it writes WAV files to
// assets/audio/effects/.
//
// - taiko.wav: one "don" on a big drum, for the end of a lesson.
// - gong.wav: a temple gong, for a belt tied on.

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
