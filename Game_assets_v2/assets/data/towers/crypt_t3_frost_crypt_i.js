// towers/crypt_t3_frost_crypt_i.js — CRYPT · TIER 3 · Frost Crypt I (Frost branch).
// Massing: an OBELISK — straight battered sides, no roof, a crystalline crown ring and an
// icicle fringe. Where T1/T2 are rounded or gabled masonry, this is a hard four-sided shaft:
// the branch choice is legible from the outline alone.

import { grid, rows, set, line, disc, poly, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, lancet, finial, cryptDoor } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t3_frost_crypt_i', faction: 'CRYPT', tier: 3,
  silhouette: 'ice-clad OBELISK — straight sides, crystal crown ring, icicle fringe',
  canvas: [64, 96], ground: 86, pivot: [32, 26],
  levers: { height: 66, ledges: 0, lancets: 2, finials: 0, charges: 2, crown: 'crystal ring' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 18; x <= 46; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  spire(g, CX, 32, GROUND, 8, 11, STONE);
  poly(g, [[CX, 20], [CX + 8, 32], [CX - 8, 32]], 'S');           // the obelisk pyramidion
  poly(g, [[CX, 20], [CX, 32], [CX - 8, 32]], 't');
  speckle(g, 22, 34, 21, 48, 'R', 0.07, 31, 'sSt');

  // ice cladding running down the NW face — the branch's material tell
  for (let y = 26; y <= 78; y++) {
    const t = (y - 26) / 52;
    const half = Math.round(4 + 5 * t);
    for (let x = -half; x <= -half + 3; x++) set(g, CX + x, y, (x + y) % 3 ? 'I' : 'i');
  }

  // the crystalline crown ring
  ellipse(g, CX, 34, 13, 4, 'I');
  ellipse(g, CX, 34, 11, 2.5, 'c');
  for (let a = 0; a < 360; a += 45) {
    const rx = CX + Math.cos(a * Math.PI / 180) * 13, ry = 34 + Math.sin(a * Math.PI / 180) * 4;
    for (let j = 0; j < 4; j++) set(g, rx, ry - j, j === 3 ? 'C' : 'c');
  }

  // icicle fringe under the ring
  for (let x = -12; x <= 12; x += 3) {
    const h = 3 + ((x + 36) % 7 > 4 ? 3 : 0);
    for (let j = 0; j < h; j++) set(g, CX + x, 38 + j, j === h - 1 ? 'C' : 'c');
  }

  lancet(g, CX, 48, 11);
  lancet(g, CX, 66, 7);
  cryptDoor(g, CX, GROUND - 3, 4, 12);
  // OUTLINE EVENT: great icicle spurs breaking out of the shaft, so the obelisk is not just a
  // narrower mausoleum.
  for (const s of [-1, 1]) {
    for (const [sy, len] of [[46, 16], [60, 12], [72, 9]]) {
      for (let j = 0; j < len; j++) {
        const t = j / len, half = Math.max(0, Math.round(2.4 * (1 - t)));
        for (let x = -half; x <= half; x++) set(g, CX + s * (9 + j) + x, sy + Math.round(j * 0.55), t > 0.75 ? 'C' : t > 0.4 ? 'c' : 'I');
      }
    }
  }


  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 24, 33, 40, 33, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.24 });
  outline(g, 'k', { soft: 'qQcCiI' });
  contactShadow(g, CX, GROUND + 3, 16, 2.6, 'q');
  contactShadow(g, CX, GROUND + 3, 10, 1.7, 'Q');
  return g;
}

// TWO frost-charges now, and a brighter lantern.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 13,
  lantern: { r: 4, throw: 7, ramp: ICE, glow: 'c', flare: 'C' },
  charges: { n: 2, r: 2.5, ch: 'c', glow: 'C' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t3_frost_crypt_i_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t3_frost_crypt_i', lanternRig, AIM, { fps: 6, frames: 2 }),
};
