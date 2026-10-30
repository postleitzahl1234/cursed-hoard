// towers/crypt_t4_fear_crypt_ii.js — CRYPT · TIER 4 · Fear Crypt II (Fear branch).
// Massing: a wraith-shrine. Skull finial, and huge TATTERED SHROUDS hanging off both flanks so
// the outline is soft and ragged rather than architectural — the only Crypt tower whose edges
// are cloth. Its parent leans; this one billows.

import { grid, rows, set, line, disc, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, CURSE, BONE, spire, lancet, cryptDoor, ossuary, gargoyle, shroud } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t4_fear_crypt_ii', faction: 'CRYPT', tier: 4,
  silhouette: 'wraith-shrine: skull finial and huge tattered shrouds — a ragged cloth outline',
  canvas: [64, 96], ground: 86, pivot: [32, 28],
  levers: { height: 68, ledges: 1, lancets: 2, finials: 1, charges: 2, crown: 'skull finial' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 16; x <= 48; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  spire(g, CX, 34, GROUND, 6, 10, STONE);
  for (let y = 34; y <= GROUND; y++) {                 // darken it below the Frost line's value
    const t = (y - 34) / (GROUND - 34), half = Math.round(6 + 4 * t);
    for (let x = -half; x <= half; x++) if ('sSt'.includes(g.px[y][CX + x])) {
      g.px[y][CX + x] = g.px[y][CX + x] === 't' ? 's' : g.px[y][CX + x] === 'S' ? 'R' : 'R';
    }
  }
  speckle(g, 20, 38, 25, 44, 'r', 0.10, 61, 'sSR');

  // the two great shrouds — wide, ragged, hanging past the shaft on both sides
  shroud(g, 14, 40, 30, 16, CURSE);
  shroud(g, 50, 44, 26, 13, CURSE);
  for (let i = 0; i < 14; i++) {                       // torn hems
    set(g, 6 + i * 2, 70 + ((i * 5) % 4), 'v');
    set(g, 40 + i, 70 + ((i * 3) % 5), 'v');
  }

  // skull finial crowning the shaft
  disc(g, CX, 30, 5, 'n');
  disc(g, CX, 29, 4, 'B');
  set(g, CX - 2, 30, 'x'); set(g, CX + 2, 30, 'x');    // violet eye-lights
  set(g, CX - 2, 31, 'k'); set(g, CX + 2, 31, 'k');
  for (let x = -3; x <= 3; x += 2) set(g, CX + x, 34, 'k');
  for (let x = -5; x <= 5; x++) set(g, CX + x, 36, 'b');

  for (let y = 46; y <= 78; y += 8) {                  // violet courses
    const t = (y - 34) / (GROUND - 34), half = Math.round(6 + 4 * t);
    for (let x = -half; x <= half; x++) set(g, CX + x, y, (x + y) % 3 ? 'v' : 'V');
  }
  gargoyle(g, 20, 56, 'x');
  gargoyle(g, 44, 58, 'x');
  lancet(g, CX, 52, 9, 'V', 'r');
  ossuary(g, CX, 76, 9, 5);
  cryptDoor(g, CX, GROUND - 3, 4, 12);

  ao(g, 'r', { from: 'sSR', radius: 1 });
  rimLight(g, 'x', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVxbBnu', density: 0.20 });
  outline(g, 'k', { soft: 'qQvVx' });
  contactShadow(g, CX, GROUND + 3, 23, 2.9, 'q');
  contactShadow(g, CX, GROUND + 3, 14, 1.8, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 14,
  lantern: { r: 5, throw: 8, ramp: CURSE, glow: 'V', flare: 'x' },
  charges: { n: 2, r: 3, ch: 'V', glow: 'x' },
  soft: 'vVx',
};

export const SPRITES = {
  crypt_t4_fear_crypt_ii_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t4_fear_crypt_ii', lanternRig, AIM, { fps: 5, frames: 2 }),
};
