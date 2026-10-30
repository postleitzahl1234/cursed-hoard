// towers/crypt_t6_lightning_crypt_ii.js — CRYPT · TIER 6 · Lightning Crypt II (shared apex).
// Massing: a storm-spire BRISTLING with rods. Its parent carries one mast; this carries seven
// at splayed angles plus two coil-rings, so the crown reads as a thorn-bush rather than a spike.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, battlement, lancet, cryptDoor, ossuary, cornerTurret } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t6_lightning_crypt_ii', faction: 'CRYPT', tier: 6,
  silhouette: 'storm-spire bristling with seven splayed rods and two coil-rings — a thorn crown',
  canvas: [64, 96], ground: 86, pivot: [32, 34],
  levers: { height: 84, ledges: 3, lancets: 3, finials: 0, charges: 3, crown: 'rod thicket' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 14; x <= 50; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  spire(g, CX, 52, GROUND, 7, 11, STONE);
  speckle(g, 23, 56, 19, 26, 'R', 0.07, 101, 'sSt');

  // seven rods, splayed like a thicket
  for (const [dx, top] of [[-14, 16], [-9, 8], [-4, 3], [0, 2], [4, 4], [9, 9], [14, 18]]) {
    for (let y = top; y <= 40; y++) {
      const t = (y - top) / (40 - top);
      const x = CX + dx * (0.25 + 0.75 * t);
      set(g, x, y, 'J'); set(g, x + 1, y, 'j');
    }
    disc(g, CX + dx * 0.25, top - 1, 1.6, 'C');
  }
  // two coil-rings threaded through them
  for (const [cy, rx, ry] of [[22, 16, 4], [32, 12, 3]]) {
    for (let a = 0; a < 360; a += 4) {
      const r = a * Math.PI / 180;
      set(g, CX + Math.cos(r) * rx, cy + Math.sin(r) * ry, a % 40 < 20 ? 'j' : 'J');
    }
  }
  // a forking bolt leaping between the rods
  for (const [x0, y0, x1, y1] of [[CX - 9, 12, CX - 2, 20], [CX - 2, 20, CX + 6, 14], [CX + 6, 14, CX + 13, 22]]) {
    line(g, x0, y0, x1, y1, 'C');
  }

  battlement(g, CX, 56, 9, 3, 2, STONE);
  cornerTurret(g, CX - 12, 74, 10, 3, false);
  cornerTurret(g, CX + 12, 74, 10, 3, false);
  lancet(g, CX, 62, 9);
  lancet(g, CX, 76, 5);
  ossuary(g, CX, 82, 8, 5);
  cryptDoor(g, CX, GROUND - 4, 5, 13);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 24, 55, 40, 55, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.24 });
  outline(g, 'k', { soft: 'qQcCiI' });
  contactShadow(g, CX, GROUND + 4, 17, 2.7, 'q');
  contactShadow(g, CX, GROUND + 4, 14, 1.9, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 16,
  lantern: { r: 5, throw: 9, ramp: ICE, glow: 'C', flare: 'C' },
  charges: { n: 3, r: 2.5, ch: 'C', glow: 'c' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t6_lightning_crypt_ii_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t6_lightning_crypt_ii', lanternRig, AIM, { fps: 10, frames: 2 }),
};
