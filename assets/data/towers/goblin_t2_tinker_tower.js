// towers/goblin_t2_tinker_tower.js — GOBLIN · TIER 2 · Tinker Tower.
// Massing: a tall riveted contraption built around a boiler, with a big exposed GEAR on one
// flank and a bank of gauges. Straightened up and stacked where the T1 leaned and squatted.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, boiler, grime } from './_goblin_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t2_tinker_tower', faction: 'GOBLIN', tier: 2,
  silhouette: 'upright riveted stack around a boiler, big exposed gear on one flank',
  canvas: [64, 96], ground: 86, pivot: [32, 40],
  levers: { height: 56, masses: 2, stacks: 2, gauges: 3, bays: 0, barrelLen: 18 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 12; x <= 52; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  plate(g, 16, 62, 32, 24, BRASS, 'tblr');
  boiler(g, CX, 44, 11, 20);
  plate(g, 19, 56, 26, 8, BRASS, 'tb');
  grime(g, 16, 44, 32, 42, 13, 0.09);

  // the exposed gear
  disc(g, 47, 62, 8, 'A');
  disc(g, 47, 62, 6, 'b');
  disc(g, 47, 62, 2, 'B');
  for (let a = 0; a < 360; a += 30) {
    const r = a * Math.PI / 180;
    set(g, 47 + Math.cos(r) * 8.5, 62 + Math.sin(r) * 8.5, 'C');
    set(g, 47 + Math.cos(r) * 7, 62 + Math.sin(r) * 7, 'a');
  }

  chimney(g, 20, 44, 12, 2, false);
  chimney(g, 26, 40, 16, 2, false);
  for (const [gx, gy] of [[38, 68], [38, 76], [24, 72]]) gauge(g, gx, gy, 2);
  pipe(g, [[20, 70], [14, 70], [14, 58], [20, 58]], 3, BRASS);
  strut(g, 13, 84, 19, 64);
  strut(g, 51, 84, 45, 64);
  hatchDoor(g, CX, GROUND - 2, 4, 12);

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 17, 61, 47, 61, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 22, 2.9, 'q');
  contactShadow(g, CX, GROUND + 3, 14, 1.8, 'Q');
  return g;
}

const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 6, ry: 5, ramp: BRASS, studs: 4, studCh: 'C' },
  barrel: { len: 18, girth: 4, ramp: IRON, taper: 0.85, rings: [7], ringCh: 'J', ringCh2: 'i' },
  muzzle: null,
  recoil: 4,
  flash: { r: 3, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    const sx = px - dir.x * 5, sy = py - dir.y * 5 + (frame === 1 ? 0 : 2);
    for (let i = 0; i < 6; i++) disc(g, sx - i * 1.3, sy, 1.5, i % 2 ? 'B' : 'b');
    disc(g, px - dir.x * 8, py - dir.y * 8, 2.5, 'A');
  },
};

export const SPRITES = {
  goblin_t2_tinker_tower_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t2_tinker_tower', barrelRig, TURRET, { fps: 8, frames: 2 }),
};
