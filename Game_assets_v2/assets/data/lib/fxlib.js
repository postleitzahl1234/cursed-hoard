// lib/fxlib.js — machinery for transient effects. Holds no effect.
//
// Same contract as lib/pixel.js, lib/tileset.js and lib/structure.js: this file knows how a ring
// expands, how motes rise and how a shockwave thins as it travels. It does not know what a taunt
// looks like. Twenty-four ability clips built from one `flash()` would be one effect in
// twenty-four palettes — the shared-rig failure (REVIEW.md §2 F1) in its fourth costume.
//
// ── Why FX break the rules the rest of the art follows ──────────────────────
// Two of the project's standing rules are deliberately suspended here, and it is worth saying
// why rather than letting it look like drift:
//
//   * **No ink contour.** D-08's weighted outline exists to separate solid objects from the
//     ground. An effect is *light*, not an object; outlining a glow turns it into a sticker.
//   * **No NW key light.** A flame, a rune circle and a shockwave emit their own light, so they
//     are lit radially from their own centre. Everything that casts a shadow still obeys the key;
//     nothing in this file casts one.
//
// What FX must obey instead is **legibility over the playfield**. They are drawn on top of units
// the player is trying to read, so every clip here is open in the middle or short-lived, and the
// brightest value is spent on the smallest area.

import { grid, set, get } from './pixel.js';
import { noise } from './shade.js';

/** Effects are transient and additive-looking, so they get the alpha codes the ground never uses. */
export const FX_LEGEND = { '~': 'SH0', '=': 'SH1' };

export const blank = (w, h) => grid(w, h);

/** A frame sequence, non-looping by default: an effect that loops forever is a decoration. */
export const clip = (frames, fps = 14, loop = false) => ({
  anchor: 'center', fps, loop, frames: frames.map(g => g.px.map(r => r.join(''))),
});

/**
 * An expanding ring. `t` runs 0..1 across the clip.
 *
 * `flat` squashes it vertically — a shockwave travelling along the GROUND is an ellipse, and
 * drawing it as a circle is the single most common way to make an effect look like it is
 * floating in the air instead of spreading across the floor.
 */
export function ring(g, cx, cy, t, ramp, { r0 = 2, r1 = 16, flat = 0.42, thick = 2 } = {}) {
  const r = r0 + (r1 - r0) * t;
  const fade = 1 - t;
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    for (let d = 0; d < thick; d++) {
      const rr = r - d;
      const x = Math.round(cx + Math.cos(rad) * rr);
      const y = Math.round(cy + Math.sin(rad) * rr * flat);
      set(g, x, y, d === 0 && fade > 0.4 ? ramp[2] : fade > 0.25 ? ramp[1] : ramp[0]);
    }
  }
  return g;
}

/** A radial burst of shards, thrown outward and thinning. */
export function burst(g, cx, cy, t, ramp, { n = 10, r0 = 2, r1 = 18, len = 4, seed = 0 } = {}) {
  const r = r0 + (r1 - r0) * t;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + noise(i, 1, seed) * 0.4;
    const L = Math.max(1, Math.round(len * (1 - t)));
    for (let d = 0; d < L; d++) {
      const rr = r - d;
      set(g, Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr),
        d === 0 ? ramp[2] : d < 2 ? ramp[1] : ramp[0]);
    }
  }
  return g;
}

/** Motes rising out of the ground and fading — summons, heals, souls leaving a body. */
export function motes(g, cx, cy, t, ramp, { n = 9, spread = 12, rise = 20, seed = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const ph = (t + noise(i, 2, seed)) % 1;
    const x = Math.round(cx + (noise(i, 3, seed) - 0.5) * spread * 2
      + Math.sin(ph * 6 + i) * 2);
    const y = Math.round(cy - ph * rise);
    set(g, x, y, ph < 0.35 ? ramp[2] : ph < 0.7 ? ramp[1] : ramp[0]);
    if (ph < 0.5) set(g, x, y + 1, ramp[0]);
  }
  return g;
}

/** A vertical column of light — ascension, resurrection, a portal opening. */
export function pillar(g, cx, top, bot, t, ramp, { halfW = 5 } = {}) {
  const w = Math.max(1, Math.round(halfW * Math.sin(t * Math.PI)));
  for (let y = top; y <= bot; y++)
    for (let dx = -w; dx <= w; dx++) {
      const e = Math.abs(dx) / Math.max(1, w);
      set(g, cx + dx, y, e > 0.75 ? ramp[0] : e > 0.4 ? ramp[1] : ramp[2]);
    }
  return g;
}

/** A closing bubble — shields. Drawn as an outline so the unit inside stays readable. */
export function bubble(g, cx, cy, t, ramp, { rx = 14, ry = 16 } = {}) {
  const k = 0.35 + 0.65 * Math.min(1, t * 1.6);
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    const x = Math.round(cx + Math.cos(rad) * rx * k);
    const y = Math.round(cy + Math.sin(rad) * ry * k);
    // the NW arc catches, the rest is a thin membrane — a solid bubble hides the unit
    set(g, x, y, (a > 160 && a < 280) ? ramp[2] : ramp[1]);
  }
  return g;
}

/** A drifting cloud mass — sandstorm, darkness, smoke. Open in the centre by design. */
export function cloud(g, cx, cy, t, ramp, { rx = 18, ry = 12, seed = 0 } = {}) {
  for (let y = cy - ry; y <= cy + ry; y++)
    for (let x = cx - rx; x <= cx + rx; x++) {
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      const d = dx * dx + dy * dy;
      if (d > 1) continue;
      const n = noise(Math.floor(x / 2) + Math.floor(t * 6), Math.floor(y / 2), seed);
      if (n < 0.35 + d * 0.5) continue;
      set(g, x, y, d > 0.7 ? ramp[0] : n > 0.8 ? ramp[2] : ramp[1]);
    }
  return g;
}

/** A jagged discharge between two points — lightning, leeching, a soul being pulled. */
export function arc(g, x0, y0, x1, y1, t, ramp, { jag = 3, seed = 0 } = {}) {
  const steps = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const j = (noise(i, Math.floor(t * 5), seed) - 0.5) * jag * Math.sin(p * Math.PI);
    const x = Math.round(x0 + (x1 - x0) * p - (y1 - y0) / steps * j);
    const y = Math.round(y0 + (y1 - y0) * p + (x1 - x0) / steps * j);
    set(g, x, y, ramp[2]);
    if (i % 2 === 0) set(g, x, y + 1, ramp[1]);
  }
  return g;
}

/** Sparse glitter over an area — a shimmer that says "something is enchanted here". */
export function shimmer(g, cx, cy, t, ramp, { rx = 14, ry = 14, n = 12, seed = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 2 + noise(i, 5, seed)) % 1;
    if (ph > 0.6) continue;
    const a = noise(i, 6, seed) * Math.PI * 2, rr = 0.35 + noise(i, 7, seed) * 0.65;
    const x = Math.round(cx + Math.cos(a) * rx * rr), y = Math.round(cy + Math.sin(a) * ry * rr);
    set(g, x, y, ph < 0.25 ? ramp[2] : ramp[1]);
    if (ph < 0.2) { set(g, x - 1, y, ramp[0]); set(g, x + 1, y, ramp[0]); }
  }
  return g;
}

/** Flame tongues licking upward, used for burn/ground-fire. Emits its own light. */
export function flames(g, cx, base, t, ramp, { n = 5, spread = 12, h = 14, seed = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const x0 = cx + Math.round((i / (n - 1) - 0.5) * spread * 2);
    const wob = Math.sin(t * Math.PI * 2 + i) * 1.5;
    const H = Math.round(h * (0.55 + 0.45 * noise(i, Math.floor(t * 4), seed)));
    for (let d = 0; d < H; d++) {
      const p = d / H;
      const w = Math.max(0, Math.round(3 * (1 - p) - 0.2));
      for (let dx = -w; dx <= w; dx++)
        set(g, Math.round(x0 + dx + wob * p), base - d, p > 0.72 ? ramp[2] : p > 0.35 ? ramp[1] : ramp[0]);
    }
  }
  return g;
}

/** Fade whatever is already drawn toward the alpha shadow codes — a tail on a dying effect. */
export function dissolve(g, t, seed = 0) {
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) {
      if (get(g, x, y) === '`') continue;
      if (noise(x, y, seed) < t * 0.55) set(g, x, y, '`');
    }
  return g;
}
