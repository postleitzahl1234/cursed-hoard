// towers/orc_t6_doomsday_cannon.js — ORC · TIER 6 · Doomsday Cannon.
//
// PILOT ASSET (redesign/REVIEW.md §8). 64×96 @ 1× density.
//
// The ceiling of the Orc tree, and the direct answer to F2 in the review — in the old build
// this was the T1 Watchpost with a marginally wider 6 px ornament on its roof. Here it is a
// DIFFERENT BUILDING. Set it beside orc_t1_watchpost.js and count D-27's levers:
//
//   lever            T1 Watchpost          T6 Doomsday Cannon
//   ───────────────────────────────────────────────────────────
//   height           38 px (40% canvas)    78 px (100% canvas)
//   drums            1                     3, stacked and stepped
//   iron bands       0                     3, gold-studded
//   rim spikes       0                     11
//   rhombus boss     1 small (r=3)         3 clustered (r=6/4/4), gold-edged
//   weapon           light bolt, 16 px     siege cannon, 30 px, triple-ringed muzzle
//   trophies         none                  bone standards on the shoulders
//
// Same faction vocabulary throughout (rounded den, green primary, wood accent only, black
// iron — D-24/D-27/D-29). Same language, different sentence. That is what "structural tiers"
// has to mean or the player cannot tell their board apart.

import { grid, rows, set, rect, line, ellipse } from '../lib/pixel.js';
import { overlay, clip } from '../lib/draw.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand, spike, cylinderH }
  from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t6_doomsday_cannon',
  faction: 'ORC', tier: 6,
  silhouette: 'three stepped dens under a siege cannon; banded, spiked, trophy-hung',
  canvas: [64, 96],
  ground: 86,
  pivot: [32, 20],
  levers: { height: 78, drums: 3, bands: 3, spikes: 11, rhombus: 6, weapon: 'siege cannon' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);

  // dressed stone plinth — by T6 the Orcs have stopped improvising
  for (let x = 4; x <= 60; x++) for (let j = 0; j < 5; j++) set(g, x, GROUND - j, j >= 3 ? 'r' : 'R');
  for (let x = 4; x <= 60; x += 6) for (let j = 0; j < 5; j++) set(g, x, GROUND - j, 'r');

  // ── three stepped dens. Each step is set well back so all three read as separate masses;
  //    the tower's outline alone should say "three tiers" before any detail lands.
  drum(g, CX, 56, 27, 30, 9, GREEN);
  drum(g, CX, 38, 20, 20, 8, GREEN);
  drum(g, CX, 23, 14, 17, 7, GREEN);
  speckle(g, 6, 58, 53, 26, 'N', 0.07, 23, 'mMo');
  speckle(g, 13, 42, 39, 15, 'N', 0.07, 29, 'mMo');

  // ── buttressed timber bracing (wood stays accent — D-29) ──
  brace(g, 8, 83, 16, 68);
  brace(g, 56, 83, 48, 68);
  brace(g, 15, 64, 22, 50);
  brace(g, 49, 64, 42, 50);

  // ── spikes driven into each shoulder, then banded over: the band reads as armour
  //    because the spikes come through it, not as a railing sitting on posts.
  for (const x of [8, 14, 20, 44, 50, 56]) spike(g, x, 67, 6);
  for (const x of [15, 21, 43, 49]) spike(g, x, 48, 5);

  // ── three gold-studded iron bands, each hugging its own drum's true width ──
  ironBand(g, 6, 66, 53, 4, 7);
  ironBand(g, 12, 47, 41, 4, 5);
  ironBand(g, 18, 31, 29, 3, 4);

  // ── the rhombus cluster — the Orc signature, now large and gold-edged ──
  rhombus(g, CX, 60, 6, 'M', 'n');
  rhombus(g, CX, 60, 4, 'o', 'D');
  rhombus(g, CX, 60, 1, 'O', 'O');
  rhombus(g, CX - 18, 75, 4, 'M', 'd');
  rhombus(g, CX + 18, 75, 4, 'M', 'd');
  rhombus(g, CX, 53, 4, 'M', 'D');

  // ── den mouth: wide, iron-lintelled, seated under the lower band ──
  denDoor(g, CX, GROUND - 3, 8, 16);

  // ── bone standards on the shoulders — trophies, T6 only ──
  for (const sx of [7, 57]) {
    line(g, sx, 74, sx, 52, 'W');
    line(g, sx - 2, 56, sx + 2, 56, 'w');
    set(g, sx, 51, 'B'); set(g, sx - 1, 52, 'b'); set(g, sx + 1, 52, 'b');
    set(g, sx - 1, 54, 'b'); set(g, sx + 1, 54, 'b');
  }

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 6, 61, 58, 61, 'K');
  innerLine(g, 12, 42, 52, 42, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDbB', density: 0.24 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 4, 31, 4.0, 'q');
  contactShadow(g, CX, GROUND + 4, 21, 2.6, 'Q');
  return g;
}

// ── the rotating turret (D-23): a siege cannon, not a bolt ────────────────────
// Set this spec beside the T1's. Barrel nearly twice as long and 2.5× the girth, three
// reinforcement rings the T1 has none of, a flared muzzle, a studded armoured mantlet instead
// of a wooden cradle, and a blast radius of 6 against the T1's 2.5 px spark.
const TURRET = {
  canvas: [W, H],
  pivot: SPEC.pivot,
  mantlet: { rx: 10, ry: 8, ramp: IRON, studs: 6, studCh: 'D' },
  barrel: { len: 30, girth: 10, ramp: IRON, taper: 0.95, rings: [10, 18, 25], ringCh: 'J', ringCh2: 'i' },
  muzzle: { flare: 3, len: 3, ramp: IRON },
  recoil: 5,
  flash: { r: 6, chars: ['e', 'E', 'x'] },
  // per-tower flourish: paired vent stacks that puff on the fire frame. Nothing else in the
  // Orc tree has these, so even the turret alone identifies the tier.
  extra: (g, px, py, dir, frame) => {
    for (const s of [-1, 1]) {
      const vx = px - dir.x * 6 - dir.y * s * 6, vy = py - dir.y * 6 + dir.x * s * 4;
      for (let j = 0; j < 4; j++) set(g, vx, vy - j, j === 3 ? 'J' : 'I');
      if (frame === 1) { set(g, vx, vy - 5, 'E'); set(g, vx + s, vy - 6, 'e'); }
    }
  },
};

export const SPRITES = {
  orc_t6_doomsday_cannon_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t6_doomsday_cannon', barrelRig, TURRET, { fps: 5, frames: 2 }),
};
