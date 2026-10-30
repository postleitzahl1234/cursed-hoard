// towers/crypt_t5_lightning_crypt_i.js — CRYPT · TIER 5 · Lightning Crypt I (shared middle).
// Massing: a conductor-spire — a thin shaft carrying one very tall iron ROD. Extreme vertical:
// nearly a third of its height is a 2 px-wide spike, which nothing else in the faction has.

import { grid, rows, set, line, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, battlement, lancet, cryptDoor, ossuary } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t5_lightning_crypt_i', faction: 'CRYPT', tier: 5,
  silhouette: 'thin conductor-spire under one very tall iron rod — extreme vertical spike',
  canvas: [64, 96], ground: 86, pivot: [32, 40],
  levers: { height: 82, ledges: 2, lancets: 2, finials: 0, charges: 1, crown: 'Tesla rod' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 20; x <= 44; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  spire(g, CX, 46, GROUND, 7, 11, STONE);
  speckle(g, 23, 50, 19, 32, 'R', 0.07, 91, 'sSt');

  // the rod: a single iron mast running from the spire head almost to the canvas top
  for (let y = 4; y <= 46; y++) { set(g, CX, y, 'J'); set(g, CX + 1, y, 'j'); }
  for (const y of [12, 22, 32]) {                       // insulator collars
    for (let x = -3; x <= 3; x++) set(g, CX + x, y, Math.abs(x) > 1 ? 'j' : 'T');
    set(g, CX - 4, y, 'c'); set(g, CX + 5, y, 'c');
  }
  disc(g, CX, 5, 2.4, 'C'); disc(g, CX, 5, 1.2, 'c');   // the collecting sphere
  // arcs crawling down the rod
  for (let i = 0; i < 7; i++) set(g, CX + ((i % 2) ? 2 : -1), 8 + i * 5, 'C');

  battlement(g, CX, 50, 9, 3, 2, STONE);
  for (const sx of [CX - 11, CX + 11]) {                 // stubby side pylons
    for (let y = 54; y <= 70; y++) for (let x = -2; x <= 2; x++) set(g, sx + x, y, x < 0 ? 'S' : x > 1 ? 'r' : 's');
    for (let j = 0; j < 8; j++) { set(g, sx, 53 - j, 'j'); }
    disc(g, sx, 44, 1.6, 'C');
  }
  lancet(g, CX, 58, 9);
  ossuary(g, CX, 76, 8, 5);
  cryptDoor(g, CX, GROUND - 3, 4, 12);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 24, 49, 40, 49, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.24 });
  outline(g, 'k', { soft: 'qQcCiI' });
  contactShadow(g, CX, GROUND + 3, 16, 2.6, 'q');
  contactShadow(g, CX, GROUND + 3, 10, 1.7, 'Q');
  return g;
}

// A single volt-charge that crackles rather than drifts.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 12,
  lantern: { r: 4, throw: 8, ramp: ICE, glow: 'C', flare: 'C' },
  charges: { n: 1, r: 2.5, ch: 'C', glow: 'c' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t5_lightning_crypt_i_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t5_lightning_crypt_i', lanternRig, AIM, { fps: 9, frames: 2 }),
};
