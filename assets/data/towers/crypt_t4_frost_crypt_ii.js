// towers/crypt_t4_frost_crypt_ii.js — CRYPT · TIER 4 · Frost Crypt II (Frost branch).
// Massing: a glacier-spire with a CAGED FROZEN ORB on top — a bulbous crown on a broad-
// shouldered shaft. Its parent (Frost Crypt I) is a hard thin obelisk with a flat ring; this
// widens, and the cage is a hollow ball where the obelisk had a spike.

import { grid, rows, set, line, disc, poly, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, battlement, lancet, finial, cryptDoor, cornerTurret } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t4_frost_crypt_ii', faction: 'CRYPT', tier: 4,
  silhouette: 'glacier-spire under a caged frozen orb — bulbous crown, broad shoulders',
  canvas: [64, 96], ground: 86, pivot: [32, 22],
  levers: { height: 72, ledges: 2, lancets: 3, finials: 2, charges: 2, crown: 'caged orb' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 14; x <= 50; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  spire(g, CX, 38, GROUND, 12, 16, STONE);
  speckle(g, 17, 42, 31, 40, 'R', 0.07, 51, 'sSt');

  // glacier sheeting — heavier ice than the T3, wrapping both flanks
  for (let y = 40; y <= 80; y++) {
    const t = (y - 40) / 40, half = Math.round(12 + 4 * t);
    for (let x = -half; x <= -half + 4; x++) set(g, CX + x, y, (x + y) % 3 ? 'I' : 'i');
    for (let x = half - 2; x <= half; x++) set(g, CX + x, y, (x + y) % 4 ? 'i' : 'I');
  }

  battlement(g, CX, 42, 14, 5, 2, STONE);
  cornerTurret(g, CX - 16, 56, 16, 4, true);
  cornerTurret(g, CX + 16, 56, 16, 4, true);

  // the cage: four ribs arching over a frozen orb
  ellipse(g, CX, 30, 9, 8, 'I');
  ellipse(g, CX, 29, 7, 6, 'c');
  ellipse(g, CX - 2, 27, 3, 2.5, 'C');
  for (const dx of [-9, -4, 4, 9]) {
    for (let j = 0; j < 16; j++) {
      const t = j / 15;
      set(g, CX + dx * (1 - t * 0.25), 38 - j, j > 12 ? 'g' : 'S');
    }
  }
  for (let x = -10; x <= 10; x++) set(g, CX + x, 38, 'R');
  finial(g, CX, 21, 5);

  lancet(g, CX, 50, 10);
  lancet(g, CX, 66, 7);
  cryptDoor(g, CX, GROUND - 4, 5, 13);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 19, 41, 45, 41, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.24 });
  outline(g, 'k', { soft: 'qQcCiI' });
  contactShadow(g, CX, GROUND + 4, 21, 3.0, 'q');
  contactShadow(g, CX, GROUND + 4, 13, 1.9, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 15,
  lantern: { r: 5, throw: 8, ramp: ICE, glow: 'c', flare: 'C' },
  charges: { n: 2, r: 3.5, ch: 'c', glow: 'C' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t4_frost_crypt_ii_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t4_frost_crypt_ii', lanternRig, AIM, { fps: 6, frames: 2 }),
};
