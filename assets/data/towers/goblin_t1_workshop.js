// towers/goblin_t1_workshop.js — GOBLIN · TIER 1 · Goblin Workshop.
// Massing: a small LOPSIDED brass shack — deliberately asymmetric, leaning right, with one
// smokestack. The faction floor: everything above it is bigger and straighter.

import { grid, rows, set, line, disc, ellipse, rect } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, boiler, grime } from './_goblin_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t1_workshop', faction: 'GOBLIN', tier: 1,
  silhouette: 'small LOPSIDED brass shack leaning right, one smokestack',
  canvas: [64, 96], ground: 86, pivot: [34, 52],
  levers: { height: 42, masses: 1, stacks: 1, gauges: 1, bays: 0, barrelLen: 14 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 14; x <= 50; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // the shack — each row shifted, so the walls are not parallel
  for (let y = 58; y <= GROUND; y++) {
    const lean = Math.round((GROUND - y) * 0.14);
    for (let x = 16 + lean; x <= 48 - Math.round(lean * 0.4); x++) {
      const u = (x - 16 - lean) / 32;
      set(g, x, y, u < 0.16 ? 'A' : u < 0.42 ? 'b' : u < 0.74 ? 'B' : u < 0.9 ? 'A' : 'a');
    }
  }
  for (const y of [64, 74, 82]) for (let x = 17; x <= 47; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  rivets(g, 18, 60, 44, 60, 3, 'C');
  grime(g, 16, 58, 33, 28, 7, 0.09);

  // a crooked corrugated roof
  for (let x = 12; x <= 52; x++) {
    const y = 58 - Math.round((x - 12) * 0.12);
    set(g, x, y, x % 3 ? 'B' : 'A'); set(g, x, y + 1, 'A'); set(g, x, y + 2, 'a');
  }
  chimney(g, 44, 56, 14, 2, false);
  gauge(g, 24, 68, 2);
  hatchDoor(g, 30, GROUND - 2, 4, 12);
  strut(g, 16, 84, 22, 66);
  pipe(g, [[36, 70], [44, 70], [44, 62]], 3, BRASS);

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 17, 59, 47, 59, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 20, 2.8, 'q');
  contactShadow(g, CX, GROUND + 3, 13, 1.8, 'Q');
  return g;
}

// A single spring-loaded bolt-arm poking out of a window — the crudest weapon in the faction.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 5, ry: 4, ramp: BRASS },
  barrel: { len: 14, girth: 3, ramp: IRON, taper: 0.9, rings: [] },
  muzzle: null,
  recoil: 3,
  flash: { r: 2.5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    const sx = px - dir.x * 4, sy = py - dir.y * 4 + (frame === 1 ? 0 : 2);
    for (let i = 0; i < 5; i++) disc(g, sx - i * 1.2, sy, 1.2, i % 2 ? 'B' : 'b');   // the spring
  },
};

export const SPRITES = {
  goblin_t1_workshop_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t1_workshop', barrelRig, TURRET, { fps: 6, frames: 2 }),
};
