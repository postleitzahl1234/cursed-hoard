// towers/goblin_t5_drone_foundry.js — GOBLIN · TIER 5 · Drone Foundry (drone terminal).
// Massing: a chimneyed FOUNDRY-KEEP — a broad blockhouse with three bays stacked up one face
// and a rank of four stacks along the roof. The roofline is the read: a comb of chimneys.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, hangarMouth, boiler, grime } from './_goblin_shared.js';
import { hatchRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t5_drone_foundry', faction: 'GOBLIN', tier: 5,
  silhouette: 'broad foundry keep with three stacked bays and a COMB of four chimneys',
  canvas: [64, 96], ground: 86, pivot: [32, 40],
  levers: { height: 70, masses: 3, stacks: 4, gauges: 3, bays: 3, barrelLen: 0 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 4; x <= 60; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  plate(g, 7, 44, 50, 42, BRASS, 'tblr');
  plate(g, 15, 32, 34, 14, BRASS, 'tblr');
  for (const y of [52, 62, 72, 80]) for (let x = 8; x <= 56; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  grime(g, 7, 32, 50, 54, 31, 0.09);

  hangarMouth(g, 20, 56, 14, 10);
  hangarMouth(g, 44, 56, 14, 10);
  hangarMouth(g, CX, 38, 16, 9);

  // the comb of chimneys
  for (const [cx, h] of [[13, 18], [24, 24], [40, 22], [51, 16]]) chimney(g, cx, 32, h, 2, false);

  boiler(g, CX, 68, 8, 16);
  for (const [gx, gy] of [[12, 70], [52, 70], [CX, 50]]) gauge(g, gx, gy, 2);
  pipe(g, [[18, 74], [8, 74], [8, 60]], 3, BRASS);
  pipe(g, [[46, 74], [56, 74], [56, 60]], 3, BRASS);
  strut(g, 5, 84, 11, 50);
  strut(g, 59, 84, 53, 50);
  hatchDoor(g, CX, GROUND - 3, 5, 12);
  // OUTLINE EVENT: a landing gantry projecting clear of the keep, so the chimney comb is not
  // the only thing distinguishing it from the Doom Driller.
  for (let x = 2; x <= 20; x++) { set(g, x, 26, 'C'); set(g, x, 27, 'b'); set(g, x, 28, 'A'); }
  for (let y = 28; y <= 44; y++) { set(g, 4, y, 'J'); set(g, 5, y, 'I'); }
  strut(g, 6, 44, 16, 30);
  ellipse(g, 10, 23, 3.5, 2, 'B');
  for (const s of [-1, 1]) line(g, 10 + s * 3, 21, 10 + s * 6, 20, 'J');


  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 8, 43, 56, 43, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 4, 31, 3.2, 'q');
  contactShadow(g, CX, GROUND + 4, 20, 2.1, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  bay: { w: 20, h: 12, offset: 8, ramp: IRON, doorCh: 'B' },
  rail: { len: 18, ch: 'J' },
  flare: { chars: ['e', 'x'] },
  soft: 'eEx',
  extra: (g, px, py, dir, frame) => {
    for (const [bx, by] of [[20, 56], [44, 56]]) {          // the two lower bays launch too
      const rx = bx + dir.x * 5, ry = by + dir.y * 4;
      line(g, rx, ry, rx + dir.x * 9, ry + dir.y * 9, 'J', 2);
      if (frame === 1) { disc(g, rx + dir.x * 10, ry + dir.y * 10, 2, 'e'); set(g, rx + dir.x * 10, ry + dir.y * 10, 'x'); }
    }
  },
};

export const SPRITES = {
  goblin_t5_drone_foundry_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t5_drone_foundry', hatchRig, AIM, { fps: 7, frames: 2 }),
};
