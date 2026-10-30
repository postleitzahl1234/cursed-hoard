// towers/goblin_t6_carpet_bomber.js — GOBLIN · TIER 6 · Carpet Bomber (shared apex).
// Massing: an airship DOCK — twin gantry towers with the heavy multi-engine bomber berthed
// between them at mid-height, not moored above. Its parent is a single thin mast with the blimp
// on top; this is a wide gantry frame with the airship inside it.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, grime } from './_goblin_shared.js';
import { hatchRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t6_carpet_bomber', faction: 'GOBLIN', tier: 6,
  silhouette: 'twin gantry towers with a heavy airship berthed BETWEEN them at mid-height',
  canvas: [64, 96], ground: 86, pivot: [32, 40],
  levers: { height: 76, masses: 4, stacks: 2, gauges: 3, bays: 2, barrelLen: 0 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 2; x <= 62; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  // twin gantry towers
  for (const gx of [9, 55]) {
    plate(g, gx - 5, 14, 11, 72, BRASS, 'tblr');
    for (let y = 22; y <= 82; y += 10) for (let x = -4; x <= 4; x++) set(g, gx + x, y, x % 3 ? 'b' : 'a');
    for (let j = 0; j < 8; j++) set(g, gx, 13 - j, 'J');
    set(g, gx, 5, 'l');
    grime(g, gx - 5, 14, 11, 72, 43, 0.09);
  }
  // the cross gantries linking them
  for (const y of [20, 66]) {
    for (let x = 14; x <= 50; x++) { set(g, x, y, 'C'); set(g, x, y + 1, 'b'); set(g, x, y + 2, 'A'); }
    strut(g, 15, y + 2, 26, y + 12);
    strut(g, 49, y + 2, 38, y + 12);
  }

  // the airship, berthed between the towers
  ellipse(g, CX, 38, 21, 10, 'A');
  ellipse(g, CX, 37, 19, 9, 'b');
  ellipse(g, CX - 7, 33, 8, 3.5, 'B');
  for (let x = -18; x <= 18; x += 7) for (let y = 30; y <= 46; y++) set(g, CX + x, y, 'a');
  for (const [ex, s] of [[-13, -1], [13, 1]]) {                 // engine nacelles
    ellipse(g, CX + ex, 48, 4, 3, 'I');
    for (let j = 0; j < 4; j++) set(g, CX + ex + s * (4 + j), 48, 'J');
  }
  for (let x = -12; x <= 12; x++) set(g, CX + x, 50, 'I');       // gondola
  for (let x = -12; x <= 12; x++) set(g, CX + x, 51, 'i');
  for (let x = -10; x <= 10; x += 4) { set(g, CX + x, 52, 'l'); set(g, CX + x, 53, 'i'); }
  for (const s of [-1, 1]) line(g, CX + s * 20, 40, CX + s * 12, 20, 'J');   // mooring lines

  for (const [gx, gy] of [[9, 72], [55, 72], [CX, 68]]) gauge(g, gx, gy, 2);
  chimney(g, 16, 66, 10, 2, false);
  chimney(g, 48, 66, 10, 2, false);
  hatchDoor(g, 9, GROUND - 3, 3, 10);
  hatchDoor(g, 55, GROUND - 3, 3, 10);

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, CX - 12, 49, CX + 12, 49, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 4, 32, 3.2, 'q');
  contactShadow(g, CX, GROUND + 4, 21, 2.1, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  bay: { w: 16, h: 8, offset: 8, ramp: IRON, doorCh: 'B' },
  rail: { len: 14, ch: 'l' },
  flare: { chars: ['e', 'x'] },
  soft: 'eEx',
  extra: (g, px, py, dir, frame) => {
    if (frame !== 1) return;
    for (let i = 0; i < 6; i++) {                 // the string of bombs
      const bx = px + dir.x * (6 + i * 5), by = py + dir.y * (4 + i * 3) + 12 + i * 4;
      disc(g, bx, by, 1.8, 'i'); set(g, bx, by - 2, 'J');
    }
  },
};

export const SPRITES = {
  goblin_t6_carpet_bomber_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t6_carpet_bomber', hatchRig, AIM, { fps: 4, frames: 2 }),
};
