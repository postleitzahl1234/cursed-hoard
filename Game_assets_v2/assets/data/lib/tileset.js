// lib/tileset.js — the ground layer: seamless beds and D-19 auto-edge kits.
//
// Two rules govern everything in this file, and they come straight out of REVIEW.md §3.3:
//
// 1. **The ground is quiet.** A bed lives inside three adjacent palette steps. Everything loud
//    is reserved for units, towers and FX. 880 tiles of high-contrast dither is visual soup
//    that camouflages the things the player actually has to read.
//
// 2. **Nothing here encodes a biome.** Same rule as lib/pixel.js and troops/_worlds.js: this
//    module knows about noise, boundaries and light. Which three greens make grass, and how
//    ragged a canal bank is, lives in the tiles/ modules. Otherwise every biome inherits the
//    same face and D-19 buys you nothing.
//
// ── Why the edge kit is 12 transparent overlays ──────────────────────────────
// A 47-piece blob tileset costs art per *pair* of materials. Five biomes × (base, path, water)
// would be several hundred authored tiles, and adding a sixth biome would cost another eighty.
// Instead each material that stacks on top of another gets ONE 12-piece kit, drawn over the
// neighbouring cell with a transparent interior. Cost is linear in materials, kits compose, and
// the level editor never places a transition tile by hand — which is the whole of D-19.
//
// Every piece is authored in its own orientation rather than rotated at draw time: the art
// direction has one global NW key light (D-08), and a rotated highlight points at the wrong sun.
//
// ── How a piece is drawn ─────────────────────────────────────────────────────
// Each of the 12 is described by a signed distance field: positive inside the material, zero at
// the boundary, negative outside. That gives three things for free and uniformly across all 12:
//
//   * the fill (sdf > rim depth),
//   * the boundary lip, lit or dark depending on which way the boundary faces, taken from the
//     *gradient* of the field rather than from which piece we happen to be drawing,
//   * a cast shadow in the two pixels immediately outside a dark-facing boundary, which is what
//     makes the two layers read as different heights instead of two colours.

import { grid, set, rows } from './pixel.js';
import { noise } from './shade.js';

export const S = 32;

// The cast shadow is the only thing this module paints in its own right, so it owns two legend
// codes. Every tile module spreads SHADOW_LEGEND into its LEGEND — the two alpha shadow entries
// are the only non-opaque codes in the palette (D-08 forbids anti-aliasing, but a *cast shadow*
// is a light effect, not an edge softener).
export const SHADOW_NEAR = '!';   // SH1 — directly under the overhanging lip
export const SHADOW_FAR = ';';    // SH0 — the falloff pixel
export const SHADOW_LEGEND = { [SHADOW_NEAR]: 'SH1', [SHADOW_FAR]: 'SH0' };

// ── seamless wandering boundaries ────────────────────────────────────────────
//
// A boundary has to be periodic on 32 AND continuous across the wrap, or every tile join shows
// a step. Wrapped value-noise gives period but not continuity. A short harmonic series gives
// both. Four terms with noise-derived phases do not read as a sine wave — one would.
function harmonics(seed) {
  return [1, 2, 3, 5].map((k, i) => ({
    k,
    a: [1.0, 0.55, 0.34, 0.2][i],
    p: noise(k, i, seed) * Math.PI * 2,
  }));
}

/** A seamless wander around 0, amplitude ±`amp`, as a function of one axis. */
export function wander(seed, amp) {
  const H = harmonics(seed);
  const norm = H.reduce((s, h) => s + h.a, 0);
  return t => (H.reduce((s, h) => s + h.a * Math.sin((2 * Math.PI * h.k * t) / S + h.p), 0) / norm) * amp;
}

// ── beds ─────────────────────────────────────────────────────────────────────

/**
 * Four wrapped octaves. The coarse octave is deliberately the *weakest*: a strong coarse octave
 * produces recognisable blotches, and recognisable blotches are what make a 32 px tile read as a
 * visible lattice once you lay 880 of them down. The eye spots repetition through features, not
 * through frequency.
 */
export function field(x, y, seed) {
  const a = noise(Math.floor(x / 8) % 4, Math.floor(y / 8) % 4, seed);
  const b = noise(Math.floor(x / 3) % 11, Math.floor(y / 3) % 11, seed + 91);
  const c = noise(x % S, y % S, seed + 733);
  const d = noise((x * 3 + y) % S, (y * 3 - x + 64) % S, seed + 401);
  return a * 0.20 + b * 0.30 + c * 0.28 + d * 0.22;
}

/**
 * The quiet three-value bed.
 *
 * @param ramp   [low, mid, high] — two of these carry ~90% of the surface
 * @param opts   .seed .lo .hi thresholds, .lit char for a caught clump edge, .dark for a sink
 */
export function bed(ramp, opts = {}) {
  const { seed = 5, lo = 0.42, hi = 0.80, lit = null, dark = null } = opts;
  const g = grid(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const v = field(x, y, seed);
      set(g, x, y, v < lo ? ramp[0] : v < hi ? ramp[1] : ramp[2]);
    }
  // Key light: a clump's upper-left edge catches, its lower-right sinks. This is the single
  // change that stops a bed reading as flat noise — and it stays rare on purpose.
  if (lit || dark) {
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const here = field(x, y, seed);
        const up = field(x - 1, y - 1, seed);
        const dn = field(x + 1, y + 1, seed);
        if (lit && here > up + 0.20 && here > 0.74) set(g, x, y, lit);
        else if (dark && here < dn - 0.22 && here < 0.30) set(g, x, y, dark);
      }
  }
  return g;
}

/**
 * Scatter a small motif over a bed — the one place a biome shows personality without raising
 * the contrast. `paint(g, x, y)` draws one instance; positions are seamless-wrapped.
 */
export function scatter(g, count, seed, paint) {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(noise(i, 3, seed) * S);
    const y = Math.floor(noise(i, 9, seed + 17) * S);
    paint(g, x, y, i);
  }
  return g;
}

/** Wrapped set — anything drawn off one edge reappears on the other, so motifs stay seamless. */
export function setW(g, x, y, ch) {
  set(g, ((x % S) + S) % S, ((y % S) + S) % S, ch);
}

// ── the 12-piece auto-edge kit ───────────────────────────────────────────────

/** Signed distance fields for each piece. Image coords: y grows downward, row 0 is north. */
function fields(depth, seed, rag) {
  const a = depth * 0.45 * rag;
  const wN = wander(seed + 1, a), wE = wander(seed + 2, a);
  const wS = wander(seed + 3, a), wW = wander(seed + 4, a);
  // A concave corner runs deeper than a straight edge — that is what makes an inside bend read
  // as a bend rather than as two bands that happen to touch.
  const R = depth * 1.9, r = depth * 0.95;
  const rad = (x, y, cx, cy, base, w) => base + w(Math.atan2(y - cy, x - cx) * S / (2 * Math.PI))
    - Math.hypot(x - cx, y - cy);
  const wc = [5, 6, 7, 8].map(i => wander(seed + i, depth * 0.3 * rag));
  return {
    n: (x, y) => depth + wN(x) - y,
    s: (x, y) => y - (S - 1 - depth - wS(x)),
    w: (x, y) => depth + wW(y) - x,
    e: (x, y) => x - (S - 1 - depth - wE(y)),
    one: (x, y) => rad(x, y, S - 1, 0, r, wc[0]),
    ose: (x, y) => rad(x, y, S - 1, S - 1, r, wc[1]),
    osw: (x, y) => rad(x, y, 0, S - 1, r, wc[2]),
    onw: (x, y) => rad(x, y, 0, 0, r, wc[3]),
    ine: (x, y) => rad(x, y, S - 1, 0, R, wc[0]),
    ise: (x, y) => rad(x, y, S - 1, S - 1, R, wc[1]),
    isw: (x, y) => rad(x, y, 0, S - 1, R, wc[2]),
    inw: (x, y) => rad(x, y, 0, 0, R, wc[3]),
  };
}

/**
 * Build all 12 overlays for one material.
 *
 * @param spec.ramp     [dark, mid, light] material fill
 * @param spec.rimLit   lip char where the boundary faces the NW key
 * @param spec.rimDark  lip char where it faces away
 * @param spec.depth    how far the material bleeds into the neighbouring cell (px)
 * @param spec.seed     boundary seed — different per material so no two edges share a wiggle
 * @param spec.texture  optional (g, x, y, i) called for interior pixels, for grit/ripples
 * @param spec.shadow   whether to cast onto the cell below the boundary (default true)
 * @param spec.rag      raggedness 0..1. This is a real design lever, not a tuning knob: the
 *                      Royal Gardens are the geometric biome, so their canal is masonry-lined
 *                      and their pavers are laid to a rule — rag near 0 gives a ruler-straight
 *                      bank that nothing else in the game has. Wilderness sits near 1.
 */
export function edgeKit(spec) {
  const { ramp, rimLit, rimDark, depth = 7, seed = 1, texture = null, shadow = true, rag = 1 } = spec;
  const F = fields(depth, seed, rag);
  const out = {};
  for (const [name, sdf] of Object.entries(F)) {
    const g = grid(S, S);
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const d = sdf(x, y);
        if (d < -2.4) continue;
        // Outward normal = -grad(sdf). If it points at the NW key the lip catches light.
        const gx = sdf(x + 1, y) - sdf(x - 1, y), gy = sdf(x, y + 1) - sdf(x, y - 1);
        const facingLight = (gx + gy) > 0;      // -grad · (-1,-1) > 0  ⇔  gx+gy > 0
        if (d >= 0) {
          if (d < 1.25) set(g, x, y, facingLight ? rimLit : rimDark);
          else {
            const v = field(x, y, seed + 300);
            set(g, x, y, v < 0.40 ? ramp[0] : v < 0.78 ? ramp[1] : ramp[2]);
          }
        } else if (shadow && !facingLight) {
          // contact shadow, only where the lip overhangs — two pixels, then nothing
          set(g, x, y, d > -1.3 ? SHADOW_NEAR : SHADOW_FAR);
        }
      }
    if (texture) for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (sdf(x, y) >= 1.25) texture(g, x, y, seed);
    }
    out[name] = g;
  }
  return out;
}

/** The 12 suffixes, matching `TileResolver.KIT` exactly. Order is the draw order. */
export const KIT = ['n', 'e', 's', 'w', 'one', 'ose', 'osw', 'onw', 'ine', 'ise', 'isw', 'inw'];

export const still = g => ({ anchor: 'center', fps: 1, loop: true, frames: [rows(g)] });

/** Expand an edge kit into `<baseKey>_edge_<piece>` sprite entries. */
export function kitSprites(baseKey, kit) {
  const out = {};
  for (const k of KIT) out[`${baseKey}_edge_${k}`] = still(kit[k]);
  return out;
}
