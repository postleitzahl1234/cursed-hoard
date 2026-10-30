// towers/goblin_t4_drone_swarm.js — GOBLIN · TIER 4 · Drone Swarm (Drone branch).
// Massing: a DOUBLE hangar rig — two towers of unequal height bridged by a gantry, so the
// outline has two holes and a notch between them. Antennae and signal-flags break the top edge.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, hangarMouth, grime } from './_goblin_shared.js';
import { hatchRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t4_drone_swarm', faction: 'GOBLIN', tier: 4,
  silhouette: 'TWO hangar towers of unequal height bridged by a gantry — two holes, one notch',
  canvas: [64, 96], ground: 86, pivot: [30, 40],
  levers: { height: 66, masses: 3, stacks: 2, gauges: 2, bays: 2, barrelLen: 0 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 5; x <= 59; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  plate(g, 8, 26, 22, 60, BRASS, 'tblr');       // tall tower
  plate(g, 36, 44, 20, 42, BRASS, 'tblr');      // short tower
  for (const [x0, x1, ys] of [[9, 29, [36, 50, 64, 78]], [37, 55, [54, 68, 80]]]) {
    for (const y of ys) for (let x = x0; x <= x1; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  }
  grime(g, 8, 26, 48, 60, 23, 0.09);

  hangarMouth(g, 19, 40, 15, 12);
  hangarMouth(g, 46, 58, 13, 10);

  // the gantry bridging them
  for (let x = 28; x <= 38; x++) { set(g, x, 52, 'C'); set(g, x, 53, 'b'); set(g, x, 54, 'A'); }
  strut(g, 29, 54, 36, 62);

  // antennae + signal flags along the top edges
  for (const [ax, ay, h] of [[12, 26, 14], [26, 26, 10], [40, 44, 12], [52, 44, 8]]) {
    for (let j = 0; j < h; j++) set(g, ax, ay - j, 'J');
    set(g, ax, ay - h, 'l');
    for (let x = 1; x <= 4; x++) set(g, ax + x, ay - h + 1 + (x > 2 ? 1 : 0), 'T');
  }
  chimney(g, 33, 44, 10, 2, false);
  gauge(g, 24, 66, 2);
  gauge(g, 50, 74, 2);
  pipe(g, [[14, 70], [6, 70], [6, 82]], 3, BRASS);
  hatchDoor(g, 18, GROUND - 2, 4, 11);
  hatchDoor(g, 46, GROUND - 2, 3, 9);

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 9, 25, 29, 25, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 29, 3.1, 'q');
  contactShadow(g, CX, GROUND + 3, 19, 2.0, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  bay: { w: 18, h: 12, offset: 7, ramp: IRON, doorCh: 'B' },
  rail: { len: 16, ch: 'J' },
  flare: { chars: ['e', 'x'] },
  soft: 'eEx',
  extra: (g, px, py, dir, frame) => {                  // a second, smaller rail on the short tower
    const bx = 46 + dir.x * 5, by = 58 + dir.y * 4;
    line(g, bx, by, bx + dir.x * 10, by + dir.y * 10, 'J', 2);
    if (frame === 1) { disc(g, bx + dir.x * 11, by + dir.y * 11, 2, 'e'); set(g, bx + dir.x * 11, by + dir.y * 11, 'x'); }
  },
};

export const SPRITES = {
  goblin_t4_drone_swarm_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t4_drone_swarm', hatchRig, AIM, { fps: 6, frames: 2 }),
};
