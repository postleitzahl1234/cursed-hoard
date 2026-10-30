// towers/orc_t3_crossbow_nest.js — ORC · TIER 3 · Crossbow Nest (Marksman branch).
//
// Massing: the first tower in the tree that LEAVES THE GROUND. A nest box sits on four splayed
// stilts with open air underneath, so its silhouette has a hole in the middle — nothing else in
// the Orc tree does, and that alone separates it from both its parent (T2) and its sibling
// branch (T3 Bombard, which is squat and solid).

import { grid, rows, set, rect, line, poly, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, rhombus, ironBand, spike } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t3_crossbow_nest', faction: 'ORC', tier: 3,
  silhouette: 'ELEVATED nest box on four splayed stilts — open air under the tower',
  canvas: [64, 96], ground: 86, pivot: [32, 36],
  levers: { height: 60, masses: 2, bands: 1, spikes: 2, rhombus: 2, barrelLen: 18 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);

  // four splayed stilts, converging as they rise. Drawn as pairs so the two rear legs sit
  // one value darker and the tower reads as having depth rather than being a flat frame.
  const legs = [[10, 24, false], [54, 40, false], [18, 27, true], [46, 37, true]];
  for (const [footX, topX, rear] of legs) {
    for (let y = GROUND; y >= 56; y--) {
      const t = (GROUND - y) / (GROUND - 56);
      const x = footX + (topX - footX) * t;
      set(g, x, y, rear ? 'w' : 'W');
      set(g, x + 1, y, rear ? 'W' : 'v');
    }
    for (let j = 0; j < 3; j++) set(g, footX, GROUND - j, 'r');
  }
  brace(g, 14, 70, 50, 70);                       // cross-tie
  brace(g, 16, 78, 48, 62);                       // X-bracing — the see-through structure
  brace(g, 48, 78, 16, 62);

  // the nest box — timber walls, turf roof
  for (let y = 44; y <= 58; y++) {
    const half = y < 47 ? 12 : 14;
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half);
      set(g, CX + x, y, u < 0.3 ? 'v' : u < 0.72 ? 'W' : 'w');
    }
  }
  for (let y = 46; y <= 58; y += 4) for (let x = -14; x <= 14; x++) set(g, CX + x, y, x < -8 ? 'V' : 'w');
  drum(g, CX, 36, 15, 12, 6, GREEN);              // turf cap over the nest
  speckle(g, 18, 32, 29, 10, 'N', 0.10, 31, 'mMo');

  // quiver racks either flank — the Marksman branch's tell
  for (const qx of [15, 49]) {
    for (let i = 0; i < 3; i++) {
      line(g, qx + i, 50, qx + i, 56, 'W');
      set(g, qx + i, 49, 'j');
    }
  }
  spike(g, 17, 44, 5);
  spike(g, 47, 44, 5);
  ironBand(g, 17, 57, 31, 3, 4);
  rhombus(g, CX, 51, 4, 'v', 'w');
  rhombus(g, CX, 51, 2, 'V', 'd');
  rhombus(g, CX, 66, 3, 'W', 'w');

  ao(g, 'w', { from: 'Wv', radius: 1 });
  innerLine(g, 18, 44, 46, 44, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.24 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 25, 3.2, 'q');
  contactShadow(g, CX, GROUND + 3, 16, 2.0, 'Q');
  return g;
}

// A fan of small crossbows firing in sequence — short barrels, but THREE of them.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 6, ry: 5, ramp: TIMBER },
  barrel: { len: 18, girth: 3, ramp: IRON, taper: 0.9, rings: [] },
  muzzle: null,
  recoil: 3,
  flash: { r: 2.5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    // two more stubby crossbow arms fanned above and below the main one
    for (const s of [-1, 1]) {
      const ox = px - dir.y * s * 3, oy = py + dir.x * s * 3;
      for (let i = 3; i < 13; i++) {
        const x = ox + dir.x * i, y = oy + dir.y * i;
        set(g, x, y, 'I'); set(g, x, y + 1, 'i');
      }
      // the prod, crossing the stock
      const bx = ox + dir.x * 11, by = oy + dir.y * 11;
      line(g, bx - dir.y * 3, by + dir.x * 3, bx + dir.y * 3, by - dir.x * 3, frame === 1 ? 'v' : 'W');
    }
  },
};

export const SPRITES = {
  orc_t3_crossbow_nest_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t3_crossbow_nest', barrelRig, TURRET, { fps: 8, frames: 2 }),
};
