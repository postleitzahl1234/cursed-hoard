// towers/crypt_t1_crypt.js — CRYPT · TIER 1 · Crypt.
// Massing: a small headstone spire. The shortest, narrowest thing the faction builds — one
// ledge, one tiny lancet, no finial. Everything above it in the tree earns its height.

import { grid, rows, set, line, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, BONE, ICE, GOLD, spire, battlement, lancet, finial, cryptDoor, ossuary } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t1_crypt', faction: 'CRYPT', tier: 1,
  silhouette: 'small headstone spire, one ledge, no finial — the faction floor',
  canvas: [64, 96], ground: 86, pivot: [32, 44],
  levers: { height: 44, ledges: 1, lancets: 1, finials: 0, charges: 1, crown: 'rounded headstone' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 18; x <= 46; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  spire(g, CX, 48, GROUND, 8, 12, STONE);
  // the rounded headstone top — the only crypt crown that is not pointed
  for (let j = 0; j < 7; j++) {
    const half = Math.round(8 * Math.sqrt(Math.max(0, 1 - ((7 - j) / 7) ** 2)));
    for (let x = -half; x <= half; x++) set(g, CX + x, 42 + j, x < -half + 2 ? 't' : x > half - 2 ? 'r' : 'S');
  }
  speckle(g, 22, 50, 21, 32, 'R', 0.08, 11, 'sSt');

  battlement(g, CX, 56, 10, 3, 1, STONE);
  lancet(g, CX, 60, 7);
  ossuary(g, CX, 74, 8, 5);
  cryptDoor(g, CX, GROUND - 3, 4, 12);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 22, 49, 42, 49, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.26 });
  outline(g, 'k', { soft: 'qQcC' });
  contactShadow(g, CX, GROUND + 3, 16, 2.6, 'q');
  contactShadow(g, CX, GROUND + 3, 10, 1.7, 'Q');
  return g;
}

// One pale frost-charge orbiting a small lantern. The smallest aim part in the faction.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 9,
  lantern: { r: 3, throw: 5, ramp: ICE, glow: 'c', flare: 'C' },
  charges: { n: 1, r: 2, ch: 'I', glow: 'C' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t1_crypt_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t1_crypt', lanternRig, AIM, { fps: 5, frames: 2 }),
};
