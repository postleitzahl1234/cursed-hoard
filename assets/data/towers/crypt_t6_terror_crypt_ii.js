// towers/crypt_t6_terror_crypt_ii.js — CRYPT · TIER 6 · Terror Crypt II (Fear apex).
// Massing: the cathedral risen. Twin tall corner turrets flanking a shroud-draped BELFRY, with
// a stack of skulls up the centre. Its parent is one round crown on one shaft; this is a
// three-tower complex — the most architecturally complex silhouette in the faction.

import { grid, rows, set, line, disc, poly, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, CURSE, BONE, spire, battlement, lancet, cryptDoor, ossuary, gargoyle, shroud, cornerTurret } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t6_terror_crypt_ii', faction: 'CRYPT', tier: 6,
  silhouette: 'twin tall turrets flanking a shroud-draped belfry — a three-tower complex',
  canvas: [64, 96], ground: 86, pivot: [32, 24],
  levers: { height: 80, ledges: 5, lancets: 5, finials: 2, charges: 3, crown: 'belfry + skull stack' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 6; x <= 58; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  // the twin flanking turrets — full-height, not the small corner kind
  for (const s of [-1, 1]) {
    const tx = CX + s * 20;
    spire(g, tx, 34, GROUND, 6, 9, STONE);
    battlement(g, tx, 36, 7, 3, 2, STONE);
    poly(g, [[tx, 24], [tx + 7, 36], [tx - 7, 36]], 'R');
    poly(g, [[tx, 24], [tx, 36], [tx - 7, 36]], 'S');
    lancet(g, tx, 42, 8, 'V', 'r');
    lancet(g, tx, 58, 6, 'V', 'r');
    gargoyle(g, tx, 40, 'x');
  }

  // the central belfry, set back and lower than the turrets
  spire(g, CX, 44, GROUND, 10, 13, STONE);
  for (let y = 44; y <= GROUND; y++) {
    const t = (y - 44) / (GROUND - 44), half = Math.round(10 + 3 * t);
    for (let x = -half; x <= half; x++) {
      const c = g.px[y][CX + x];
      if (c === 't') g.px[y][CX + x] = 's';
      else if (c === 'S') g.px[y][CX + x] = 'R';
    }
  }
  speckle(g, 22, 48, 21, 34, 'r', 0.09, 121, 'sSR');
  battlement(g, CX, 46, 11, 4, 2, STONE);

  // the bell arch, open and dark
  for (let j = 0; j < 12; j++) {
    const arch = j > 5 ? Math.round(6 * Math.sqrt(Math.max(0, 1 - ((j - 6) / 6) ** 2))) : 6;
    for (let x = -arch; x <= arch; x++) set(g, CX + x, 60 - j, 'k');
  }
  ellipse(g, CX, 54, 4, 5, 'b'); ellipse(g, CX, 53, 3, 4, 'B');

  // the skull stack climbing the belfry front
  for (let i = 0; i < 4; i++) {
    const sy = 28 - i * 0, y = 24 + i * 5;
    disc(g, CX, y, 3.2, 'b'); disc(g, CX, y - 1, 2.4, 'B');
    set(g, CX - 1, y, 'x'); set(g, CX + 1, y, 'x');
  }
  disc(g, CX, 18, 4, 'n'); disc(g, CX, 17, 3, 'B');
  set(g, CX - 2, 18, 'x'); set(g, CX + 2, 18, 'x');

  shroud(g, 12, 48, 26, 13, CURSE);
  shroud(g, 52, 50, 24, 12, CURSE);
  shroud(g, CX, 64, 16, 11, CURSE);
  for (let y = 52; y <= 80; y += 10) {
    for (let x = -12; x <= 12; x++) set(g, CX + x, y, (x + y) % 3 ? 'v' : 'V');
  }
  ossuary(g, CX, 82, 12, 5);
  cryptDoor(g, CX, GROUND - 4, 5, 13);

  ao(g, 'r', { from: 'sSR', radius: 1 });
  rimLight(g, 'x', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVxbBnu', density: 0.20 });
  outline(g, 'k', { soft: 'qQvVx' });
  contactShadow(g, CX, GROUND + 4, 28, 3.3, 'q');
  contactShadow(g, CX, GROUND + 4, 18, 2.1, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 20,
  lantern: { r: 6, throw: 10, ramp: CURSE, glow: 'V', flare: 'x' },
  charges: { n: 3, r: 3.5, ch: 'V', glow: 'x' },
  soft: 'vVx',
};

export const SPRITES = {
  crypt_t6_terror_crypt_ii_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t6_terror_crypt_ii', lanternRig, AIM, { fps: 6, frames: 2 }),
};
