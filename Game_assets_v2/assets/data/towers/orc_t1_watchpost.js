// towers/orc_t1_watchpost.js — ORC · TIER 1 · Watchpost.
//
// PILOT ASSET (redesign/REVIEW.md §8). 64×96 @ 1× density (2×2-cell footprint + headroom).
//
// The floor of the Orc tree. Everything about it says "temporary": one squat turf den, a
// scaffold of raw stakes leaning on it, a single light bolt on a wooden pintle. It is SHORT —
// it uses 40% of the canvas height while the T6 uses all of it — and that alone is the first
// of D-27's five required levers.
//
// D-23: Orc towers split into a static base + an 8-way rotating turret. Both are authored here.

import { grid, rows, set, rect, line } from '../lib/pixel.js';
import { overlay, clip } from '../lib/draw.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand, cylinderH }
  from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t1_watchpost',
  faction: 'ORC', tier: 1,
  silhouette: 'one low turf den, half canvas height, bare stake scaffold, single light bolt',
  canvas: [64, 96],
  ground: 86,
  pivot: [32, 50],                    // where the turret seats on the base
  // D-27 levers vs the next tier up, tracked explicitly so escalation is auditable:
  levers: { height: 38, drums: 1, bands: 0, spikes: 0, rhombus: 3, weapon: 'light bolt' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

// ── the static base ───────────────────────────────────────────────────────────
function base() {
  const g = grid(W, H);

  // stone footing — a scrape of rubble, nothing dressed
  for (let x = 13; x <= 51; x++) {
    const h = 2 + ((x * 7) % 3 === 0 ? 1 : 0);
    for (let j = 0; j < h; j++) set(g, x, GROUND - j, j === h - 1 ? 'R' : 'r');
  }

  // one rounded den — the whole building
  drum(g, CX, 54, 17, 32, 9, GREEN);
  speckle(g, 16, 56, 33, 28, 'N', 0.09, 11, 'mMo');       // turf clumping

  // wood is ACCENT ONLY (D-29): four raw stakes leaning on the den, nothing structural
  stake(g, 14, 62, 24, 1);
  stake(g, 18, 68, 18, 1);
  stake(g, 47, 64, 22, -1);
  stake(g, 43, 70, 16, -1);
  brace(g, 20, 84, 27, 68);
  brace(g, 45, 84, 38, 68);

  // den mouth
  denDoor(g, CX, GROUND - 2, 6, 14);

  // the Orc rhombus boss — small and single at T1
  rhombus(g, CX, 62, 3, 'M', 'n');
  rhombus(g, CX, 62, 1, 'o', 'o');

  // a turf collar at the apex for the bolt to sit in — no ironwork yet, no platform
  drum(g, CX, 47, 7, 9, 4, GREEN);
  line(g, CX - 7, 52, CX + 7, 52, 'n');

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 16, 63, 48, 63, 'K');                       // cap/flank break
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQ', density: 0.28 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 22, 3.2, 'q');
  contactShadow(g, CX, GROUND + 3, 14, 2.0, 'Q');
  return g;
}

// ── the rotating turret (D-23) ────────────────────────────────────────────────
// A single light bolt in a wooden cradle: short tube, no rings, no muzzle, no armour. Every
// number here is deliberately the smallest in the Orc tree — read it against the T6 spec.
const TURRET = {
  canvas: [W, H],
  pivot: SPEC.pivot,
  mantlet: { rx: 5, ry: 4, ramp: TIMBER },      // a wooden cradle, not armour
  barrel: { len: 16, girth: 4, ramp: IRON, taper: 0.85, rings: [] },
  muzzle: null,                                  // T1 has no muzzle furniture at all
  recoil: 3,
  flash: { r: 2.5, chars: ['e', 'E', 'x'] },     // a spark, not a blast
};

export const SPRITES = {
  orc_t1_watchpost_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t1_watchpost', barrelRig, TURRET, { fps: 6, frames: 2 }),
};
