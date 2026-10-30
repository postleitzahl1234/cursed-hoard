// towers/crypt_t5_college_frost_i.js — CRYPT · TIER 5 · College of Frost Engineering I.
// Massing: a frost-ORRERY. A mechanical armillary ring stands around the spire's head, so the
// silhouette is a tower inside a circle — no other Crypt tower has an enclosing curve.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, ICE, spire, battlement, lancet, finial, cryptDoor, cornerTurret } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t5_college_frost_i', faction: 'CRYPT', tier: 5,
  silhouette: 'spire standing inside a mechanical armillary RING — an enclosing curve',
  canvas: [64, 96], ground: 86, pivot: [32, 30],
  levers: { height: 70, ledges: 2, lancets: 3, finials: 3, charges: 4, crown: 'armillary ring' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

/** One tilted orrery hoop, drawn as an ellipse of brass-cold stone with gold nodes. */
function hoop(g, cy, rx, ry, ch, node) {
  for (let a = 0; a < 360; a += 3) {
    const r = a * Math.PI / 180;
    set(g, CX + Math.cos(r) * rx, cy + Math.sin(r) * ry, ch);
  }
  for (const a of [0, 90, 180, 270]) {
    const r = a * Math.PI / 180;
    disc(g, CX + Math.cos(r) * rx, cy + Math.sin(r) * ry, 1.4, node);
  }
}

function base() {
  const g = grid(W, H);
  for (let x = 16; x <= 48; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  // SHORT AND FAT. The orrery above does all the vertical work, so the shaft deliberately
  // squats — the gate scored this against the T2 mausoleum when both shafts were 9→14 over the
  // same run, and a faction of spires cannot rely on its crowns alone to stay separable.
  spire(g, CX, 54, GROUND, 14, 19, STONE);
  speckle(g, 15, 58, 35, 24, 'R', 0.07, 71, 'sSt');
  for (let y = 58; y <= 80; y++) {
    const t = (y - 58) / 22, half = Math.round(14 + 5 * t);
    for (let x = -half; x <= -half + 4; x++) set(g, CX + x, y, (x + y) % 3 ? 'I' : 'i');
  }

  battlement(g, CX, 58, 15, 6, 2, STONE);
  cornerTurret(g, CX - 17, 70, 12, 3, true);
  cornerTurret(g, CX + 17, 70, 12, 3, true);

  // the armillary: one big vertical hoop and one flat equatorial hoop
  hoop(g, 30, 15, 15, 'S', 'g');
  hoop(g, 30, 17, 5, 'T', 'd');
  disc(g, CX, 30, 4, 'c'); disc(g, CX - 1, 29, 2, 'C');
  finial(g, CX, 13, 5);

  lancet(g, CX, 64, 9);
  lancet(g, CX, 78, 5);
  cryptDoor(g, CX, GROUND - 4, 4, 12);

  ao(g, 'r', { from: 'sSt', radius: 1 });
  innerLine(g, 17, 57, 47, 57, 'K');
  rimLight(g, 'T', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVx', density: 0.24 });
  outline(g, 'k', { soft: 'qQcCiI' });
  contactShadow(g, CX, GROUND + 4, 24, 3.1, 'q');
  contactShadow(g, CX, GROUND + 4, 12, 1.8, 'Q');
  return g;
}

// Four charges orbiting in formation — the densest Frost aim part before the T6.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 17,
  lantern: { r: 4, throw: 9, ramp: ICE, glow: 'c', flare: 'C' },
  charges: { n: 4, r: 2.5, ch: 'c', glow: 'C' },
  soft: 'cCiI',
};

export const SPRITES = {
  crypt_t5_college_frost_i_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t5_college_frost_i', lanternRig, AIM, { fps: 7, frames: 2 }),
};
