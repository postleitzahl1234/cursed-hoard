// towers/crypt_t6_college_frost_ii.js — CRYPT · TIER 6 · College of Frost Engineering II.
// Massing: the orrery DOUBLED — three stacked hoops of decreasing size on frozen buttresses.
// Where the T5 is one circle, this is a cone of circles: the widest Crypt silhouette.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, battlement, lancet, finial, cryptDoor, cornerTurret } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t6_college_frost_ii', faction: 'CRYPT', tier: 6,
  silhouette: 'three stacked armillary hoops on frozen buttresses — the widest Crypt mass',
  canvas: [64, 96], ground: 86, pivot: [32, 26],
  levers: { height: 78, ledges: 4, lancets: 4, finials: 5, charges: 6, crown: 'triple orrery' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function hoop(g, cy, rx, ry, ch, node) {
  for (let a = 0; a < 360; a += 3) {
    const r = a * Math.PI / 180;
    set(g, CX + Math.cos(r) * rx, cy + Math.sin(r) * ry, ch);
  }
  for (const a of [0, 90, 180, 270]) {
    const r = a * Math.PI / 180;
    disc(g, CX + Math.cos(r) * rx, cy + Math.sin(r) * ry, 1.6, node);
  }
}

function base() {
  const g = grid(W, H);
  for (let x = 10; x <= 54; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  spire(g, CX, 40, GROUND, 11, 17, STONE);
  speckle(g, 17, 44, 31, 38, 'R', 0.07, 81, 'sSt');
  for (let y = 44; y <= 80; y++) {
    const t = (y - 44) / 36, half = Math.round(11 + 6 * t);
    for (let x = -half; x <= -half + 4; x++) set(g, CX + x, y, (x + y) % 3 ? 'I' : 'i');
    for (let x = half - 2; x <= half; x++) set(g, CX + x, y, (x + y) % 4 ? 'i' : 'I');
  }

  // frozen flying buttresses
  for (const s of [-1, 1]) {
    for (let j = 0; j < 22; j++) {
      const t = j / 21;
      set(g, CX + s * (13 + 9 * t), 52 + j, j % 4 ? 'S' : 'I');
      set(g, CX + s * (13 + 9 * t) + s, 52 + j, 'R');
    }
    for (let y = 74; y <= 84; y++) for (let x = 0; x < 5; x++) set(g, CX + s * (21 + x), y, x ? 'R' : 'S');
  }

  battlement(g, CX, 44, 13, 5, 2, STONE);
  cornerTurret(g, CX - 16, 62, 18, 4, true);
  cornerTurret(g, CX + 16, 62, 18, 4, true);

  hoop(g, 26, 19, 19, 'S', 'g');            // three hoops, stacked and shrinking
  hoop(g, 26, 21, 6, 'T', 'd');
  hoop(g, 20, 12, 12, 'T', 'g');
  disc(g, CX, 26, 5, 'c'); disc(g, CX - 1, 25, 3, 'C');
  finial(g, CX, 7, 6);

  lancet(g, CX, 54, 11);
  lancet(g, CX, 70, 7);
  cryptDoor(g, CX, GROUND - 4, 5, 13);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 18, 43, 46, 43, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.24 });
  outline(g, 'k', { soft: 'qQcCiI' });
  contactShadow(g, CX, GROUND + 4, 26, 3.2, 'q');
  contactShadow(g, CX, GROUND + 4, 16, 2.0, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 21,
  lantern: { r: 5, throw: 10, ramp: ICE, glow: 'c', flare: 'C' },
  charges: { n: 6, r: 2.5, ch: 'c', glow: 'C' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t6_college_frost_ii_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t6_college_frost_ii', lanternRig, AIM, { fps: 8, frames: 2 }),
};
