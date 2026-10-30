// towers/goblin_t4_spike_cannon.js — GOBLIN · TIER 4 · Spike Cannon (Ordnance branch).
// Massing: a heavy braced BLOCK with a big spike hopper sitting on its roof like a saddlebag.
// Squarer and heavier than the Gatling's round drum, and the hopper's angled top-right corner
// is the shape cue.

import { grid, rows, set, line, disc, ellipse, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, grime } from './_goblin_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t4_spike_cannon', faction: 'GOBLIN', tier: 4,
  silhouette: 'heavy square block with an angled spike hopper slung on its roof',
  canvas: [64, 96], ground: 86, pivot: [30, 44],
  levers: { height: 56, masses: 3, stacks: 1, gauges: 2, bays: 0, barrelLen: 24 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 6; x <= 58; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  plate(g, 10, 54, 44, 32, BRASS, 'tblr');
  for (const y of [62, 72, 80]) for (let x = 11; x <= 53; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  grime(g, 10, 54, 44, 32, 29, 0.09);

  // the hopper — a wedge with its top cut back on the diagonal
  poly(g, [[36, 52], [56, 52], [56, 34], [44, 40]], 'J');
  poly(g, [[36, 52], [50, 52], [50, 40], [44, 42]], 'I');
  for (let i = 0; i < 6; i++) {                      // spikes visible in the mouth
    line(g, 40 + i * 2.4, 52, 40 + i * 2.4, 46, 'l');
  }
  rivets(g, 36, 52, 56, 52, 4, 'C');

  // recoil spring on the left flank
  for (let i = 0; i < 7; i++) disc(g, 14 + i * 0.4, 46 + i * 1.6, 2, i % 2 ? 'B' : 'b');
  chimney(g, 22, 54, 12, 2, false);
  gauge(g, 18, 66, 2);
  gauge(g, 18, 76, 2);
  pipe(g, [[30, 66], [30, 58]], 3, BRASS);
  strut(g, 7, 84, 13, 58);
  strut(g, 57, 84, 51, 58);
  hatchDoor(g, CX + 4, GROUND - 3, 4, 11);
  // OUTLINE EVENT: a feed chute climbing off the hopper, angled — the block alone read as the
  // Auger Cannon's gun-house at 23%.
  for (let j = 0; j < 26; j++) {
    const x = 50 - Math.round(j * 0.35), y = 40 - j;
    for (let o = 0; o < 4; o++) set(g, x + o, y, o === 0 ? 'J' : o === 3 ? 'i' : 'I');
  }
  for (let x = 38; x <= 50; x++) set(g, x, 14, 'l');
  for (let j = 0; j < 5; j++) set(g, 40, 15 + j, 'i');


  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 11, 53, 53, 53, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 4, 28, 3.1, 'q');
  contactShadow(g, CX, GROUND + 4, 18, 2.0, 'Q');
  return g;
}

// One heavy barrel throwing iron spikes — long and thick where the Gatling was short and many.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 9, ry: 7, ramp: BRASS, studs: 5, studCh: 'C' },
  barrel: { len: 24, girth: 8, ramp: IRON, taper: 0.9, rings: [9, 17], ringCh: 'l', ringCh2: 'i' },
  muzzle: { flare: 2, len: 2, ramp: IRON },
  recoil: 6,
  flash: { r: 4.5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    if (frame === 1) return;
    const tx = px + dir.x * 25 * dir.fore, ty = py + dir.y * 25 * dir.fore;   // a spike in the mouth
    line(g, tx, ty, tx + dir.x * 6, ty + dir.y * 6, 'l', 2);
    set(g, tx + dir.x * 7, ty + dir.y * 7, 'l');
  },
};

export const SPRITES = {
  goblin_t4_spike_cannon_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t4_spike_cannon', barrelRig, TURRET, { fps: 5, frames: 2 }),
};
