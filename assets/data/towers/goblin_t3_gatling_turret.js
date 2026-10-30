// towers/goblin_t3_gatling_turret.js — GOBLIN · TIER 3 · Gatling Turret (Ordnance branch).
// Massing: a COMPACT geared drum — short, round and dense, with an ammo belt feeding in from a
// side hopper. Its branch sibling (Drone Bay) is a tall hollow tower with a hole in it, so the
// first Goblin split reads as "squat gun" against "open hangar".

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, boiler, grime } from './_goblin_shared.js';
import { cylinderV } from '../lib/shade.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t3_gatling_turret', faction: 'GOBLIN', tier: 3,
  silhouette: 'COMPACT geared drum, low and round, ammo belt feeding from a side hopper',
  canvas: [64, 96], ground: 86, pivot: [32, 50],
  levers: { height: 44, masses: 2, stacks: 1, gauges: 2, bays: 0, barrelLen: 20 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 8; x <= 56; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // a wide low drum with a geared collar
  cylinderV(g, 12, 62, 41, 24, BRASS);
  ellipse(g, CX, 62, 20, 6, 'c');
  ellipse(g, CX, 63, 18, 5, 'b');
  for (let x = 12; x <= 52; x += 4) { set(g, x, 64, 'a'); set(g, x + 1, 64, 'C'); }
  grime(g, 12, 62, 41, 24, 17, 0.09);

  // the geared mount ring — big teeth all the way round the collar
  for (let a = 0; a < 360; a += 18) {
    const r = a * Math.PI / 180;
    const gx = CX + Math.cos(r) * 20, gy = 60 + Math.sin(r) * 6;
    set(g, gx, gy, 'C'); set(g, gx, gy - 1, 'B');
  }
  ellipse(g, CX, 58, 13, 4, 'B');
  ellipse(g, CX, 57, 11, 3, 'c');

  // ammo hopper + belt on the right flank
  for (let y = 60; y <= 76; y++) for (let x = 46; x <= 56; x++) set(g, x, y, x < 48 ? 'J' : x > 54 ? 'i' : 'I');
  for (let i = 0; i < 8; i++) {
    const bx = 46 - i * 2, by = 58 + Math.sin(i * 0.9) * 2;
    set(g, bx, by, 'J'); set(g, bx, by + 1, 'l'); set(g, bx + 1, by, 'i');
  }
  gauge(g, 20, 70, 2);
  gauge(g, 20, 78, 2);
  chimney(g, 12, 62, 10, 2, false);
  strut(g, 9, 84, 15, 66);
  strut(g, 55, 84, 49, 66);
  hatchDoor(g, CX, GROUND - 2, 5, 11);

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 13, 67, 51, 67, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 26, 3.1, 'q');
  contactShadow(g, CX, GROUND + 3, 17, 2.0, 'Q');
  return g;
}

// Six short barrels in a rotating cluster — the count is the read, not the length.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 8, ry: 6, ramp: BRASS, studs: 6, studCh: 'C' },
  barrel: { len: 20, girth: 4, ramp: IRON, taper: 1.0, rings: [8, 15], ringCh: 'J', ringCh2: 'i' },
  muzzle: null,
  recoil: 2,
  flash: { r: 4, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    const spin = frame === 1 ? 1 : 0;
    for (const [s, off] of [[-1, 3], [1, 3], [-1, 5], [1, 5]]) {
      const ox = px - dir.y * s * off * 0.6, oy = py + dir.x * s * off * 0.45 + spin;
      for (let i = 4; i < 19 * dir.fore; i++) {
        const x = ox + dir.x * i, y = oy + dir.y * i;
        set(g, x, y, 'J'); set(g, x, y + 1, 'i');
      }
      if (frame === 1) set(g, ox + dir.x * 20 * dir.fore, oy + dir.y * 20 * dir.fore, 'x');
    }
  },
};

export const SPRITES = {
  goblin_t3_gatling_turret_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t3_gatling_turret', barrelRig, TURRET, { fps: 12, frames: 2 }),
};
