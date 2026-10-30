// towers/goblin_t5_bomber_drone.js — GOBLIN · TIER 5 · Bomber Drone (shared middle).
// Massing: a TALL TETHERED MAST with one big bomber-blimp moored at the top. The thinnest
// Goblin silhouette and the tallest — almost all of it is a lattice mast, and the blimp is the
// only wide element, right at the very top where nothing else in the faction puts mass.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, grime } from './_goblin_shared.js';
import { hatchRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t5_bomber_drone', faction: 'GOBLIN', tier: 5,
  silhouette: 'a TALL lattice mast with one blimp moored at the very top — the thinnest mass',
  canvas: [64, 96], ground: 86, pivot: [32, 26],
  levers: { height: 84, masses: 2, stacks: 1, gauges: 1, bays: 1, barrelLen: 0 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 18; x <= 46; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // the lattice mast — four legs drawing in as they rise, with X-bracing all the way up
  for (const [footX, topX] of [[19, 28], [45, 36], [24, 29], [40, 35]]) {
    for (let y = GROUND; y >= 36; y--) {
      const t = (GROUND - y) / (GROUND - 36);
      set(g, footX + (topX - footX) * t, y, 'J');
      set(g, footX + (topX - footX) * t + 1, y, 'I');
    }
  }
  for (let i = 0; i < 6; i++) {
    const y = 78 - i * 8, spread = 13 - i * 1.4;
    strut(g, CX - spread, y + 4, CX + spread, y - 4);
    strut(g, CX + spread, y + 4, CX - spread, y - 4);
  }
  plate(g, 22, 74, 20, 12, BRASS, 'tblr');       // a small brass hut at the foot
  grime(g, 22, 74, 20, 12, 41, 0.09);
  chimney(g, 26, 74, 9, 2, false);
  gauge(g, 37, 80, 2);
  hatchDoor(g, CX, GROUND - 1, 3, 9);

  // the mooring collar
  ellipse(g, CX, 36, 7, 3, 'c');
  ellipse(g, CX, 37, 5, 2, 'b');

  // the blimp: a fat gasbag with a bomb-rack gondola slung under it
  ellipse(g, CX, 22, 17, 8, 'A');
  ellipse(g, CX, 21, 15, 7, 'b');
  ellipse(g, CX - 5, 18, 7, 3, 'B');
  for (let x = -15; x <= 15; x += 6) for (let y = 15; y <= 28; y++) set(g, CX + x, y, 'a');
  for (let x = -8; x <= 8; x++) set(g, CX + x, 30, 'I');        // gondola
  for (let x = -8; x <= 8; x++) set(g, CX + x, 31, 'i');
  for (let x = -6; x <= 6; x += 3) { set(g, CX + x, 32, 'l'); set(g, CX + x, 33, 'i'); }   // bombs on the rack
  for (const s of [-1, 1]) line(g, CX + s * 12, 28, CX + s * 8, 30, 'J');

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, CX - 8, 29, CX + 8, 29, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 18, 2.7, 'q');
  contactShadow(g, CX, GROUND + 3, 11, 1.7, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  bay: { w: 12, h: 7, offset: 6, ramp: IRON, doorCh: 'B' },
  rail: { len: 12, ch: 'J' },
  flare: { chars: ['e', 'x'] },
  soft: 'eEx',
  extra: (g, px, py, dir, frame) => {
    if (frame !== 1) return;
    for (let i = 0; i < 3; i++) {                 // bombs released, falling downrange
      const bx = px + dir.x * (8 + i * 6), by = py + dir.y * (6 + i * 4) + 10 + i * 5;
      disc(g, bx, by, 1.8, 'i'); set(g, bx, by - 2, 'J');
    }
  },
};

export const SPRITES = {
  goblin_t5_bomber_drone_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t5_bomber_drone', hatchRig, AIM, { fps: 4, frames: 2 }),
};
