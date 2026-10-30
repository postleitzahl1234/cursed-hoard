// towers/crypt_t3_fear_crypt_i.js — CRYPT · TIER 3 · Fear Crypt I (Fear branch).
// Massing: a LEANING, blackened gravestone spire trailing a curse-violet wisp. It is the only
// tower in the game that is not upright — the tilt alone separates it from its branch sibling
// (Frost Crypt I, a rigid obelisk) at any size. D-29: the Fear line carries CR violet accents.

import { grid, rows, set, line, disc, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, CURSE, BONE, lancet, cryptDoor, ossuary, gargoyle, shroud } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t3_fear_crypt_i', faction: 'CRYPT', tier: 3,
  silhouette: 'LEANING blackened gravestone spire trailing a violet wisp — the only tilted tower',
  canvas: [64, 96], ground: 86, pivot: [30, 32],
  levers: { height: 62, ledges: 1, lancets: 1, finials: 0, charges: 1, crown: 'broken cap, tilted' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 16; x <= 48; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // the leaning shaft — each row shifts left as it rises
  for (let y = 30; y <= GROUND; y++) {
    const t = (y - 30) / (GROUND - 30);
    const lean = Math.round((1 - t) * -5);
    const half = Math.round(7 + 6 * t);
    const cx = CX + lean;
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half);
      let s = 1 - Math.pow(Math.min(1, u / 0.55), 1.3);
      if (u > 0.55) s = -0.28 * ((u - 0.55) / 0.45);
      set(g, cx + x, y, STONE.at((s * 0.72 + 0.06) * (STONE.n - 1)));   // darker than the Frost line
    }
  }
  // a broken, jagged cap rather than a roof
  for (let x = -7; x <= 7; x++) {
    const notch = ((x + 40) % 5 > 2) ? 3 : 0;
    for (let j = 0; j < 4 - notch; j++) set(g, 27 + x, 30 - j, j === 3 - notch ? 'S' : 'R');
  }
  speckle(g, 18, 34, 30, 46, 'r', 0.10, 41, 'sSt');

  // violet courses bleeding through the masonry (D-29)
  for (let y = 40; y <= 78; y += 9) {
    const t = (y - 30) / (GROUND - 30);
    const half = Math.round(7 + 6 * t), cx = CX + Math.round((1 - t) * -5);
    for (let x = -half; x <= half; x++) set(g, cx + x, y, (x + y) % 3 ? 'v' : 'V');
  }
  shroud(g, 22, 44, 14, 9, CURSE);                  // a hanging violet shroud
  gargoyle(g, 40, 50, 'x');                          // gargoyle with violet eyes
  lancet(g, 28, 56, 9, 'V', 'r');
  ossuary(g, CX, 74, 10, 6);
  // OUTLINE EVENT: a half-collapsed buttress propping the leaning shaft, plus a snapped finial
  // lying against it. The lean alone was too subtle — it scored 22-23% against two siblings.
  for (let j = 0; j < 26; j++) {
    const t = j / 25;
    const x = 44 + Math.round(10 * Math.pow(t, 0.8)), y = 46 + j;
    set(g, x, y, 'S'); set(g, x + 1, y, 'R');
  }
  for (let y = 68; y <= 84; y++) for (let x = 52; x <= 57; x++) set(g, x, y, x < 54 ? 'S' : 'R');
  for (let j = 0; j < 5; j++) { set(g, 50 - j, 44 + j, 'v'); set(g, 51 - j, 44 + j, 'V'); }
  for (let j = 0; j < 8; j++) set(g, 14 + j, 40 - Math.round(j * 0.7), 'R');

  cryptDoor(g, CX, GROUND - 3, 4, 12);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  rimLight(g, 'x', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVxbBnu', density: 0.20 });
  outline(g, 'k', { soft: 'qQvVx' });
  contactShadow(g, CX, GROUND + 3, 18, 2.7, 'q');
  contactShadow(g, CX, GROUND + 3, 11, 1.7, 'Q');
  return g;
}

// A single spectral skull-charge; the lantern burns violet, not blue.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 12,
  lantern: { r: 4, throw: 7, ramp: CURSE, glow: 'V', flare: 'x' },
  charges: { n: 1, r: 3, ch: 'V', glow: 'x' },
  soft: 'vVx',
};

export const SPRITES = {
  crypt_t3_fear_crypt_i_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t3_fear_crypt_i', lanternRig, AIM, { fps: 5, frames: 2 }),
};
