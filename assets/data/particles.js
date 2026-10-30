// assets/data/particles.js — the eight impact particles, re-authored at 1× density.
//
// 32×32, 4 frames. These are the shortest-lived things in the game — a hit spark is on screen for
// four frames at 16 fps — so the rule here is the opposite of everything else: **read in one frame
// or do not bother.** No gradients, no subtlety, one silhouette idea per particle.
//
// They are separated by physics, which is what an eye actually reads at this speed:
//
//   arrow      a shaft that STOPS dead and shivers — kinetic, no spread at all
//   bone       hard chips that tumble outward and then fall
//   spark      a fast radial star that shrinks to nothing
//   smoke      a slow mass that rises and widens
//   blood      an arc that spatters down, and the only one that leaves a stain
//   explosion  a shell that expands AND hollows out
//   magic_glow a ring that pulses in place, going nowhere
//   soul       one wisp that drifts up and dissolves
//
// Three fall, three rise, one hangs, one stops. That spread is the whole design — and it is why
// the set stays readable when four of them fire in the same half-second.

import { blank, clip, burst, ring, dissolve, FX_LEGEND } from './lib/fxlib.js';
import { set, get, line, disc } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'Particles', blurb: 'Eight impact particles at 32x32, separated by physics rather than colour: three fall, three rise, one hangs and one stops dead.' };

export const LEGEND = {
  '`': null, ...FX_LEGEND,
  w: 'WD1', W: 'WD4', t: 'IR4',                             // shaft + steel
  b: 'BN1', B: 'BN4', n: 'BN6',                             // bone
  y: 'GD3', Y: 'GD5', z: 'EM7',                             // spark
  s: 'IK3', S: 'IK5', d: 'IK6',                             // smoke
  r: 'BL1', R: 'BL3', p: 'GR2',                             // blood
  x: 'EM2', X: 'EM4', f: 'EM6',                             // explosion
  v: 'HX1', V: 'HX3', q: 'HX5',                             // magic
  c: 'IC2', C: 'IC4', Q: 'IC5',                             // soul
};

const S = 32, CX = 16, CY = 16;
const F = [0, 1, 2, 3];
const t4 = f => f / 3;

// ── the eight ───────────────────────────────────────────────────────────────

/** Kinetic: the shaft arrives, buries itself and shivers. It does not spread at all. */
const arrow = f => {
  const g = blank(S, S);
  const jitter = f === 0 ? 0 : (f % 2 ? 1 : -1);
  line(g, CX - 9 + jitter, CY + 7, CX + 6 + jitter, CY - 6, 'w', 2);
  line(g, CX + 4 + jitter, CY - 4, CX + 8 + jitter, CY - 8, 't', 2);
  for (let i = 0; i < 3; i++) {                              // fletching
    set(g, CX - 8 + jitter + i, CY + 6 - i, 'W');
    set(g, CX - 10 + jitter + i, CY + 6 - i, 'W');
  }
  if (f > 0) for (let i = 0; i < 4; i++) {                    // dust kicked at the impact point
    const a = Math.PI + noise(i, f, 3) * Math.PI;
    set(g, Math.round(CX + 7 + Math.cos(a) * f * 2), Math.round(CY - 6 + Math.sin(a) * f * 2), 's');
  }
  return g;
};

/** Hard chips: they tumble outward, then fall. Angular, never round. */
const bone = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + noise(i, 1, 5);
    const r = 3 + t * 12;
    const x = Math.round(CX + Math.cos(a) * r);
    const y = Math.round(CY + Math.sin(a) * r * 0.7 + t * t * 9);   // gravity
    const L = 2 + (i % 2);
    for (let d = 0; d < L; d++) set(g, x + d, y + (d % 2), d === 0 ? 'n' : 'B');
    set(g, x, y + 1, 'b');
  }
  return g;
};

/** A fast radial star, shrinking to nothing. The only particle that gets smaller. */
const spark = f => {
  const g = blank(S, S);
  burst(g, CX, CY, t4(f), ['y', 'Y', 'z'], { n: 8, r0: 2, r1: 13, len: 4 - f, seed: 7 });
  if (f < 2) disc(g, CX, CY, 2 - f, 'z');
  return g;
};

/** A slow mass, rising and widening. The opposite of spark on every axis. */
const smoke = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 5; i++) {
    const r = 3 + t * 5 + i * 0.6;
    const cy = CY + 6 - t * 13 - i * 1.5;
    const cx = CX + Math.sin(t * 3 + i) * 3;
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y > r * r) continue;
        if (noise(Math.round(cx + x), Math.round(cy + y), 11 + i) < 0.42 + t * 0.25) continue;
        set(g, Math.round(cx + x), Math.round(cy + y), i > 3 ? 'd' : i > 1 ? 'S' : 's');
      }
  }
  return g;
};

/** Spatter: thrown up, then down — and it STAINS. The only particle that leaves a mark. */
const blood = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.85 + (i / 6) * Math.PI * 0.7;
    const sp = 8 + noise(i, 2, 13) * 6;
    const x = Math.round(CX + Math.cos(a) * sp * t);
    const y = Math.round(CY + Math.sin(a) * sp * t + t * t * 16);
    set(g, x, y, 'R'); set(g, x, y + 1, 'r');
    if (i % 2 === 0) set(g, x + 1, y, 'p');
  }
  if (f === 3) for (let i = 0; i < 9; i++) {                  // the stain it leaves behind
    const x = CX - 8 + Math.round(noise(i, 4, 17) * 16);
    set(g, x, CY + 12, 'r'); if (i % 3 === 0) set(g, x, CY + 13, 'r');
  }
  return g;
};

/** A shell that expands AND hollows — a filled fireball reads as a ball, not a detonation. */
const explosion = f => {
  const g = blank(S, S);
  const t = t4(f);
  const r = 4 + t * 12, inner = t * 9;
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++) {
      const d = Math.hypot(x, y);
      if (d > r || d < inner) continue;
      const e = (d - inner) / Math.max(1, r - inner);
      if (noise(CX + x, CY + y, 19) < 0.25) continue;
      set(g, CX + x, CY + y, e > 0.65 ? 'x' : e > 0.3 ? 'X' : 'f');
    }
  return g;
};

/** A ring pulsing in place. It goes nowhere, which is what makes it read as *sustained* magic. */
const magicGlow = f => {
  const g = blank(S, S);
  const pulse = 0.5 + 0.5 * Math.sin(t4(f) * Math.PI * 2);
  ring(g, CX, CY, pulse, ['v', 'V', 'q'], { r0: 5, r1: 12, flat: 1, thick: 2 });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + t4(f) * 2;
    set(g, Math.round(CX + Math.cos(a) * 4), Math.round(CY + Math.sin(a) * 4), 'q');
  }
  return g;
};

/** One wisp, drifting up and dissolving. A single object where the others are many. */
const soul = f => {
  const g = blank(S, S);
  const t = t4(f);
  const cy = Math.round(CY + 8 - t * 18);
  for (let y = 0; y < 11; y++) {
    const p = y / 11;
    const w = Math.max(0, Math.round(4 * (1 - p) * (1 - t * 0.4)));
    const wob = Math.sin(t * 5 + p * 4) * 2;
    for (let x = -w; x <= w; x++)
      set(g, Math.round(CX + x + wob), cy + y, p < 0.3 ? 'Q' : p < 0.7 ? 'C' : 'c');
  }
  if (get(g, CX, cy + 2) !== '`') { set(g, CX - 1, cy + 2, 'c'); set(g, CX + 1, cy + 2, 'c'); }
  return dissolve(g, t * 0.6, 23);
};

export const SPRITES = {
  particle_arrow: clip(F.map(arrow), 16),
  particle_bone: clip(F.map(bone), 14),
  particle_spark: clip(F.map(spark), 18),
  particle_smoke: clip(F.map(smoke), 10),
  particle_blood: clip(F.map(blood), 14),
  particle_explosion: clip(F.map(explosion), 16),
  particle_magic_glow: clip(F.map(magicGlow), 10, true),
  particle_soul: clip(F.map(soul), 9),
};
