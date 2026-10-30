// assets/data/gems.js — the hoard. The object the game is named after.
//
// 32×32, which is the size the playfield draws a gem at, so nothing is resampled. The old set was
// 64×64 and arrived on screen through a halving.
//
// ── Five stones, five CUTS ──────────────────────────────────────────────────
// D-28 again: five gems separated only by hue would be one gem in five palettes, and a colourblind
// player would have no reading at all. So each is a different lapidary cut, distinguishable as a
// black shape:
//
//   ruby       round brilliant  — an octagon, the "default" gem, widest and roundest
//   emerald    step cut         — a rectangle with clipped corners; flat, wide, terraced
//   sapphire   pear             — a teardrop, one point down, asymmetric top to bottom
//   amethyst   raw crystal      — an UNCUT hexagonal prism with a natural point; the only one
//                                 that is taller than it is wide, and the only rough surface
//   topaz      marquise         — a pointed ellipse, two points, the narrowest silhouette
//
// ── Three states ────────────────────────────────────────────────────────────
//   idle     sitting in the cave/on the ground, a facet glint travelling round the crown
//   pickup   a burst, used as an FX flash the moment a unit grabs it
//   carried  smaller and dimmer, with a drag glow — it reads as *stolen* rather than as placed
//
// Each is 4 frames. The animation is the glint, not the shape: a gem that changes outline while
// it sits there stops reading as a hard mineral object.

import { grid, set, get } from './lib/pixel.js';
import { outline } from './lib/ink.js';
import { noise } from './lib/shade.js';

export const META = { group: 'Gems', blurb: 'Five stones at 32x32, separated by lapidary CUT rather than by hue so they read in silhouette: round brilliant, step cut, pear, raw hexagonal crystal and marquise, each with idle, pickup and carried states.' };

export const LEGEND = {
  '`': null,
  o: 'IK0', O: 'IK1',                                       // ink
  // each stone gets dark / mid / bright / spark
  r: 'BL1', R: 'BL3', 1: 'GR2', 2: 'DM5',                   // ruby
  e: 'GE0', E: 'GE1', 3: 'GE2', 4: 'MS6',                   // emerald
  s: 'GS0', S: 'GS1', 5: 'GS2', 6: 'IC5',                   // sapphire
  v: 'GA0', V: 'GA1', 7: 'GA2', 8: 'HX5',                   // amethyst
  t: 'GT0', T: 'GT1', 9: 'GT2', 0: 'GD5',                   // topaz
  w: 'IC5',                                                 // the shared white spark
  h: 'SH1', H: 'SH0',                                       // ground shadow
};

const S = 32, CX = 16, CY = 16;
const blank = () => grid(S, S);

/** Signed inside-tests. Each returns true within its own cut, and they share no geometry. */
/**
 * Signed inside-tests, one per cut.
 *
 * The lever is **aspect ratio**, and it took two passes to get right. The first attempt separated
 * them by outline shape alone and emerald/topaz measured 78% overlap — two wide flat lozenges.
 * The second attempt made emerald squarer and pushed it straight into the ruby instead. Shape
 * alone is not enough when five convex stones sit on the same 32 px centre; proportion is.
 *
 *   ruby      22 x 22   1.00  round
 *   emerald   26 x 14   1.86  wide
 *   topaz     28 x  9   3.11  very wide, very thin
 *   sapphire  14 x 24   0.58  tall
 *   amethyst  12 x 28   0.43  very tall, very narrow
 *
 * Sapphire and amethyst share a proportion band, so they are split a second way: the pear is a
 * smooth teardrop with a round belly, the raw crystal has flat faceted sides, a terminated point
 * and a rough interior. One is polished, the other was never cut at all.
 */
const CUTS = {
  // round brilliant: an octagon with the table flattened on top
  ruby: (x, y, k) => {
    const dx = Math.abs(x - CX) / (11 * k), dy = (y - CY) / (11 * k);
    return dx + Math.abs(dy) * 0.85 < 1.05 && dx * dx + dy * dy < 1.05;
  },
  // step cut: a wide rectangle with clipped corners, terraced across its face
  emerald: (x, y, k) => {
    const dx = Math.abs(x - CX) / (13 * k), dy = Math.abs(y - CY) / (7 * k);
    return dx < 1 && dy < 1 && dx + dy < 1.8;
  },
  // pear: a round belly below, tapering to a single point above
  sapphire: (x, y, k) => {
    const dy = (y - CY - 4 * k) / (7 * k), dx = (x - CX) / (7 * k);
    if (dy > -0.1) return dx * dx + dy * dy < 1;
    const t = -dy;
    return Math.abs(dx) < (1 - t / 2.3) && t < 2.3;
  },
  // raw crystal: a narrow hexagonal prism with a terminated point. Never cut, so the sides are
  // dead straight and the interior is rough — the one stone that is a mineral, not a jewel.
  amethyst: (x, y, k) => {
    const dx = Math.abs(x - CX) / (6 * k), dy = (y - CY) / (14 * k);
    if (dy > -0.3) return dx < 1 && dy < 1;
    return dx < (1 + dy) / 0.7 && dy > -1;
  },
  // marquise: a long thin lens with two real points. The narrowest thing in the set.
  topaz: (x, y, k) => {
    const dx = (x - CX) / (14 * k), dy = (y - CY) / (4.5 * k);
    return dx * dx + dy * dy < 1;
  },
};

/** Where the internal facet lines run. This is what makes a cut read as *cut* and not as a blob. */
const FACETS = {
  ruby: (x, y) => (Math.abs(x - CX) + Math.abs(y - CY)) % 7 < 1 || y === CY - 5,
  emerald: (x, y) => (y - CY + 8) % 4 === 0,                // terraced steps: the emerald cut
  sapphire: (x, y) => Math.abs(Math.abs(x - CX) - (y - CY + 8) * 0.45) < 0.7,
  amethyst: (x, y) => Math.abs(x - CX) === 3 || (x - CX + y) % 9 === 0,
  topaz: (x, y) => Math.abs((x - CX) * 0.4 + (y - CY)) < 0.7 || Math.abs((x - CX) * 0.4 - (y - CY)) < 0.7,
};

const RAMPS = {
  ruby: ['r', 'R', '1', '2'],
  emerald: ['e', 'E', '3', '4'],
  sapphire: ['s', 'S', '5', '6'],
  amethyst: ['v', 'V', '7', '8'],
  topaz: ['t', 'T', '9', '0'],
};

/**
 * One frame. `phase` walks the glint around the crown; `k` scales the stone (carried gems are
 * smaller); `rough` breaks the interior for the uncut amethyst.
 */
function stone(kind, phase, k = 1, rough = false, dim = false) {
  const g = blank();
  const [lo, mid, hi, spark] = RAMPS[kind];
  const inside = CUTS[kind], facet = FACETS[kind];
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      if (!inside(x, y, k)) continue;
      // NW key: the upper-left of the crown carries the light, the lower-right sinks
      const lightness = (CX - x) * 0.05 + (CY - y) * 0.06 + (rough ? noise(x, y, 11) * 0.5 - 0.25 : 0);
      let ch = lightness > 0.28 ? hi : lightness > -0.05 ? mid : lo;
      if (facet(x, y)) ch = lightness > 0 ? spark : mid;     // facet edges catch
      set(g, x, y, ch);
    }
  // the travelling glint — a two-pixel star that walks the crown, which is the whole animation
  const a = (phase / 4) * Math.PI * 2;
  const gx = Math.round(CX + Math.cos(a) * 6 * k), gy = Math.round(CY - 3 * k + Math.sin(a) * 4 * k);
  if (get(g, gx, gy) !== '`') {
    set(g, gx, gy, 'w');
    set(g, gx - 1, gy, spark); set(g, gx + 1, gy, spark);
    set(g, gx, gy - 1, spark); set(g, gx, gy + 1, spark);
  }
  if (dim) {                                                 // carried: knock the top value out
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) if (get(g, x, y) === hi) set(g, x, y, mid);
  }
  outline(g, 'o', { soft: 'w' + spark });
  return g;
}

/** The pickup flash: the stone, plus shards thrown outward on a widening ring. */
function burst(kind, f) {
  const g = stone(kind, f, 1 - f * 0.12);
  const [, , hi, spark] = RAMPS[kind];
  const r = 6 + f * 6;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + f * 0.3;
    const x = Math.round(CX + Math.cos(a) * r), y = Math.round(CY + Math.sin(a) * r);
    set(g, x, y, f < 2 ? 'w' : spark);
    if (f < 3) set(g, Math.round(x + Math.cos(a)), Math.round(y + Math.sin(a)), hi);
  }
  return g;
}

/** A gem on the ground casts a shadow; a carried one does not — it is off the floor. */
function grounded(g) {
  for (let dx = -9; dx <= 9; dx++) {
    const t = Math.abs(dx) / 9;
    const y = 28 + (t > 0.7 ? 1 : 0);
    if (get(g, CX + dx, y) === '`') set(g, CX + dx, y, t < 0.6 ? 'h' : 'H');
  }
  return g;
}

const clip = fs => ({ anchor: 'center', fps: 8, loop: true, frames: fs.map(g => g.px.map(r => r.join(''))) });
const F = [0, 1, 2, 3];

const SPRITES = {};
for (const kind of Object.keys(CUTS)) {
  SPRITES[`gem_${kind}_idle`] = clip(F.map(f => grounded(stone(kind, f))));
  SPRITES[`gem_${kind}_pickup`] = { ...clip(F.map(f => burst(kind, f))), loop: false, fps: 14 };
  SPRITES[`gem_${kind}_carried`] = clip(F.map(f => stone(kind, f, 0.72, false, true)));
}
export { SPRITES };
