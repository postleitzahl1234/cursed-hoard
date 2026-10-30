// towers/goblin_t5_auger_cannon.js — GOBLIN · TIER 5 · Auger Cannon (ordnance terminal).
// Massing: a braced gun-house with a bank of EXHAUST PIPES running down one whole flank — the
// pipes are the outline, a ribbed column that no other Goblin tower has.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, boiler, grime } from './_goblin_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t5_auger_cannon', faction: 'GOBLIN', tier: 5,
  silhouette: 'braced gun-house with a ribbed bank of exhaust pipes down one whole flank',
  canvas: [64, 96], ground: 86, pivot: [28, 42],
  levers: { height: 62, masses: 3, stacks: 5, gauges: 3, bays: 0, barrelLen: 28 },
};

const W = 64, H = 96, CX = 30, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 6; x <= 58; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  plate(g, 10, 50, 34, 36, BRASS, 'tblr');
  for (const y of [58, 68, 78]) for (let x = 11; x <= 43; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  boiler(g, 26, 34, 9, 18);
  grime(g, 10, 34, 34, 52, 47, 0.09);

  // the pipe bank — five ribbed stacks climbing the right flank
  for (let i = 0; i < 5; i++) {
    const px = 46 + i * 3, top = 30 + i * 6;
    for (let y = top; y <= 82; y++) set(g, px, y, y % 4 ? 'J' : 'l');
    for (let y = top; y <= 82; y++) set(g, px + 1, y, 'i');
    set(g, px, top - 1, 'l');
    set(g, px, top - 2, i % 2 ? 'e' : 'E');
  }
  for (let y = 40; y <= 80; y += 8) for (let x = 45; x <= 59; x++) set(g, x, y, 'I');

  for (const [gx, gy] of [[16, 60], [16, 70], [36, 60]]) gauge(g, gx, gy, 2);
  pipe(g, [[24, 62], [16, 62], [16, 50]], 3, BRASS);
  strut(g, 7, 84, 13, 56);
  strut(g, 44, 84, 40, 56);
  hatchDoor(g, 26, GROUND - 3, 4, 11);
  // OUTLINE EVENT: the pipe bank raised into a proper stack cluster, clearing the roof by 20px.
  for (let i = 0; i < 5; i++) {
    const px = 46 + i * 3, top = 8 + i * 5;
    for (let y = top; y <= 32; y++) { set(g, px, y, y % 4 ? 'J' : 'l'); set(g, px + 1, y, 'i'); }
    set(g, px, top - 1, 'l');
    set(g, px, top - 2, i % 2 ? 'e' : 'E');
  }
  for (let x = 44; x <= 60; x++) set(g, x, 34, 'I');


  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 11, 49, 43, 49, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, 32, GROUND + 4, 29, 3.1, 'q');
  contactShadow(g, 32, GROUND + 4, 19, 2.0, 'Q');
  return g;
}

// A giant auger BIT mounted where a barrel would be — a helical screw, not a tube.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 9, ry: 7, ramp: BRASS, studs: 6, studCh: 'C' },
  barrel: { len: 28, girth: 7, ramp: IRON, taper: 0.35, rings: [], ringCh: 'l' },
  muzzle: null,
  recoil: 3,
  flash: { r: 4, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    // the helix: a spiral flute wound along the bit, offset on the fire frame so it reads as spinning
    const phase = frame === 1 ? 1.6 : 0;
    for (let i = 4; i < 28 * dir.fore; i++) {
      const t = i / (28 * dir.fore);
      const amp = 4 * (1 - t * 0.65);
      const o = Math.sin(i * 0.85 + phase) * amp;
      const x = px + dir.x * i - dir.y * o, y = py + dir.y * i + dir.x * o;
      set(g, x, y, 'l'); set(g, x, y + 1, 'J');
    }
    set(g, px + dir.x * 29 * dir.fore, py + dir.y * 29 * dir.fore, 'l');
  },
};

export const SPRITES = {
  goblin_t5_auger_cannon_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t5_auger_cannon', barrelRig, TURRET, { fps: 10, frames: 2 }),
};
