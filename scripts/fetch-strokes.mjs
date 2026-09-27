// Downloads the stroke order of each single-character kana from KanjiVG
// (https://kanjivg.tagaini.net, by Ulrich Apel, CC BY-SA 3.0) and writes
// src/constants/strokes.ts: for each kana, its strokes in order, each as its SVG path (on
// KanjiVG's 109-unit grid) and as evenly spaced points along it, for judging a drawn stroke.
// Run it with `node scripts/fetch-strokes.mjs`.

import { writeFileSync } from 'node:fs';

const OUT = new URL('../src/constants/strokes.ts', import.meta.url);
const POINTS = 24; // points along each stroke

// The kana to fetch: hiragana あ to ん and katakana ア to ン, without the small ones.
const SMALL = new Set([...'ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ']);
const chars = [];
for (let code = 0x3042; code <= 0x3093; code++) chars.push(String.fromCharCode(code));
for (let code = 0x30a2; code <= 0x30f3; code++) chars.push(String.fromCharCode(code));
const wanted = chars.filter((c) => !SMALL.has(c) && !'ゐゑヰヱ'.includes(c));

// Points along an SVG path, from its M, C, S and L commands (upper and lower case), which are
// all KanjiVG uses. Each curve is sampled finely; the result is then evened out.
function samplePath(d) {
  const tokens = d.match(/[MmCcSsLlZz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  const points = [];
  let i = 0;
  let command = '';
  let x = 0;
  let y = 0;
  let lastControl = null; // for S: the previous curve's second control point
  const num = () => Number(tokens[i++]);
  const cubic = (x1, y1, x2, y2, x3, y3) => {
    for (let t = 1; t <= 20; t++) {
      const s = t / 20;
      const a = (1 - s) ** 3;
      const b = 3 * (1 - s) ** 2 * s;
      const c = 3 * (1 - s) * s ** 2;
      const e = s ** 3;
      points.push([a * x + b * x1 + c * x2 + e * x3, a * y + b * y1 + c * y2 + e * y3]);
    }
    lastControl = [x2, y2];
    x = x3;
    y = y3;
  };
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) command = tokens[i++];
    const rel = command === command.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    switch (command.toUpperCase()) {
      case 'M':
        x = ox + num();
        y = oy + num();
        points.push([x, y]);
        lastControl = null;
        command = rel ? 'l' : 'L'; // further pairs after M are lines
        break;
      case 'L':
        x = ox + num();
        y = oy + num();
        points.push([x, y]);
        lastControl = null;
        break;
      case 'C': {
        const [x1, y1, x2, y2, x3, y3] = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()];
        cubic(x1, y1, x2, y2, x3, y3);
        break;
      }
      case 'S': {
        const [x1, y1] = lastControl ? [2 * x - lastControl[0], 2 * y - lastControl[1]] : [x, y];
        const [x2, y2, x3, y3] = [ox + num(), oy + num(), ox + num(), oy + num()];
        cubic(x1, y1, x2, y2, x3, y3);
        break;
      }
      case 'Z':
        break;
      default:
        i++;
    }
  }
  return points;
}

// The same line as `n` points, evenly spaced along its length.
function resample(points, n) {
  const lengths = [0];
  for (let k = 1; k < points.length; k++) {
    lengths.push(lengths[k - 1] + Math.hypot(points[k][0] - points[k - 1][0], points[k][1] - points[k - 1][1]));
  }
  const total = lengths[lengths.length - 1];
  const out = [];
  for (let j = 0; j < n; j++) {
    const at = (total * j) / (n - 1);
    let k = 1;
    while (k < lengths.length - 1 && lengths[k] < at) k++;
    const span = lengths[k] - lengths[k - 1] || 1;
    const f = Math.min(Math.max((at - lengths[k - 1]) / span, 0), 1);
    out.push([
      Math.round((points[k - 1][0] + f * (points[k][0] - points[k - 1][0])) * 10) / 10,
      Math.round((points[k - 1][1] + f * (points[k][1] - points[k - 1][1])) * 10) / 10,
    ]);
  }
  return out;
}

const entries = [];
for (const char of wanted) {
  const code = char.codePointAt(0).toString(16).padStart(5, '0');
  const response = await fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`);
  if (!response.ok) throw new Error(`No KanjiVG file for ${char}`);
  const svg = await response.text();
  // The stroke paths, in order (their ids end in -s1, -s2...).
  const strokes = [...svg.matchAll(/<path id="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"/g)]
    .sort((a, b) => Number(a[1]) - Number(b[1]))
    .map((m) => ({ d: m[2], points: resample(samplePath(m[2]), POINTS) }));
  if (strokes.length === 0) throw new Error(`No strokes for ${char}`);
  entries.push(`  ${char}: [\n${strokes.map((s) => `    { d: '${s.d}', points: ${JSON.stringify(s.points)} },`).join('\n')}\n  ],`);
}

writeFileSync(
  OUT,
  `// Written by scripts/fetch-strokes.mjs: don't edit by hand.
// Stroke order for each single-character kana, from KanjiVG (https://kanjivg.tagaini.net),
// by Ulrich Apel. This data is shared under the Creative Commons Attribution-ShareAlike 3.0
// licence (https://creativecommons.org/licenses/by-sa/3.0/), and so is this file.
// Each stroke, in order: its SVG path on a 109-unit grid, and ${POINTS} points evenly along it.

export type Stroke = { d: string; points: readonly (readonly [number, number])[] };

export const STROKES: Readonly<Record<string, readonly Stroke[]>> = {
${entries.join('\n')}
};
`,
);
console.log(`Saved strokes for ${entries.length} kana.`);
