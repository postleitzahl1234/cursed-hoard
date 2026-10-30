// towers/crypt_t2_crypt_ii.js — CRYPT · TIER 2 · Crypt II.
// Massing: the headstone has become a MAUSOLEUM — taller, with a pointed roof, a ringed gold
// finial and two low corner ledges. The T1's crown is round; this one is a spike.

import { grid, rows, set, line, disc, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, battlement, lancet, finial, cryptDoor, ossuary } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t2_crypt_ii', faction: 'CRYPT', tier: 2,
  silhouette: 'taller mausoleum spire with a pointed roof and a ringed gold finial',
  canvas: [64, 96], ground: 86, pivot: [32, 34],
  levers: { height: 58, ledges: 3, lancets: 2, finials: 1, charges: 1, crown: 'pointed roof' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 16; x <= 48; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  spire(g, CX, 40, GROUND, 9, 14, STONE);
  poly(g, [[CX, 28], [CX + 11, 42], [CX - 11, 42]], 'S');        // the pointed roof
  poly(g, [[CX, 28], [CX, 42], [CX - 11, 42]], 't');             // NW face catches the light
  for (let x = -11; x <= 11; x++) set(g, CX + x, 42, 'R');
  finial(g, CX, 27, 6);
  disc(g, CX, 24, 2.2, 'd'); disc(g, CX, 24, 1, 'g');            // the ring under the finial
  speckle(g, 20, 44, 25, 38, 'R', 0.08, 21, 'sSt');

  battlement(g, CX, 48, 12, 4, 2, STONE);
  for (const sx of [CX - 13, CX + 13]) {                          // two low corner ledges
    for (let y = 50; y <= 58; y++) for (let x = -3; x <= 3; x++) set(g, sx + x, y, x < -1 ? 'S' : x > 1 ? 'r' : 's');
    battlement(g, sx, 50, 3, 2, 1, STONE);
  }
  lancet(g, CX, 54, 9);
  lancet(g, CX, 68, 6);
  ossuary(g, CX, 78, 10, 5);
  cryptDoor(g, CX, GROUND - 3, 4, 13);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 21, 43, 43, 43, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.26 });
  outline(g, 'k', { soft: 'qQcC' });
  contactShadow(g, CX, GROUND + 3, 18, 2.8, 'q');
  contactShadow(g, CX, GROUND + 3, 11, 1.8, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 11,
  lantern: { r: 4, throw: 6, ramp: ICE, glow: 'c', flare: 'C' },
  charges: { n: 1, r: 2.5, ch: 'c', glow: 'C' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t2_crypt_ii_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t2_crypt_ii', lanternRig, AIM, { fps: 5, frames: 2 }),
};
