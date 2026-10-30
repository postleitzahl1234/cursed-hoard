// lib/draw.js — sparse hand-authoring helpers.
//
// At 32×32 a sprite is ~1000 pixels and every one of them is an artistic decision. Fully
// procedural bodies produce blobs (see the old humankit). Fully literal ASCII rows are exact
// but unreadable and easy to mis-count. So: author SPANS — "at column 13, paint 'WvvWWw'" —
// which is exact, readable, and length-checked on build.
//
// Pattern per unit file:
//   1. hand-author the base pose as spans      ← the art
//   2. finish procedurally: ink, rim, shadow   ← the consistency
//   3. derive frames by overlaying limb spans  ← the animation

import { grid, set, EMPTY, rows as gridRows } from './pixel.js';

/**
 * Build a grid from sparse spans.
 * art = [ [y, x, "chars"], ... ]  — '`' inside a span means "leave transparent".
 */
export function fromSpans(w, h, art) {
  const g = grid(w, h);
  for (const [y, x, chars] of art) {
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === EMPTY) continue;
      if (x + i >= w || y >= h || x + i < 0 || y < 0) {
        throw new Error(`span out of bounds at y=${y} x=${x + i} (canvas ${w}×${h}): "${chars}"`);
      }
      set(g, x + i, y, chars[i]);
    }
  }
  return g;
}

/** Overlay spans onto an existing grid (limb swaps, gear, FX passes). */
export function overlay(g, art) {
  for (const [y, x, chars] of art) {
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === EMPTY) continue;
      set(g, x + i, y, chars[i]);
    }
  }
  return g;
}

/** Erase a rectangle back to transparent (clear a limb block before re-posing it). */
export function erase(g, x, y, w, h) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, EMPTY);
  return g;
}

/** Assert every char used resolves to a real palette code. Fails the build, not the eye. */
export function validate(g, legend, palette, label) {
  const bad = new Set();
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const ch = g.px[y][x];
    if (ch === EMPTY) continue;
    if (!(ch in legend)) { bad.add(`char ${JSON.stringify(ch)} not in LEGEND`); continue; }
    const code = legend[ch];
    if (code != null && palette && !(code in palette)) bad.add(`code ${code} not in PALETTE`);
  }
  if (bad.size) throw new Error(`${label}: ${[...bad].join('; ')}`);
  return g;
}

export function clip(frames, fps, loop = true, anchor = 'foot') {
  return { anchor, fps, loop, frames: frames.map(gridRows) };
}
