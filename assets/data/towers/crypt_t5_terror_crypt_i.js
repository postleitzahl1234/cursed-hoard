// towers/crypt_t5_terror_crypt_i.js — CRYPT · TIER 5 · Terror Crypt I (Fear terminal).
// Massing: a bone-cathedral spire crowned by a GIANT SCREAMING SKULL — a huge round mass on a
// broad shaft. Where the Frost terminal crowns itself with a ring and the Lightning terminal
// with a spike, this one is a ball with a hole in it.

import { grid, rows, set, line, disc, poly, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, STONE, CURSE, BONE, spire, battlement, lancet, cryptDoor, ossuary, gargoyle, shroud } from './_crypt_shared.js';
import { lanternRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'crypt_t5_terror_crypt_i', faction: 'CRYPT', tier: 5,
  silhouette: 'broad bone-spire under a giant screaming-skull crown — a ball with a maw',
  canvas: [64, 96], ground: 86, pivot: [32, 30],
  levers: { height: 72, ledges: 2, lancets: 2, finials: 0, charges: 2, crown: 'giant skull' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 14; x <= 50; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  spire(g, CX, 46, GROUND, 9, 12, STONE);
  spire(g, CX, 66, GROUND, 17, 21, STONE);   // a broad ossuary plinth under a narrow neck
  for (let y = 42; y <= GROUND; y++) {                    // Fear line runs darker
    const half = 21;
    for (let x = -half; x <= half; x++) {
      const c = g.px[y][CX + x];
      if (c === 't') g.px[y][CX + x] = 's';
      else if (c === 'S') g.px[y][CX + x] = 'R';
    }
  }
  speckle(g, 18, 46, 29, 36, 'r', 0.09, 111, 'sSR');

  // the giant skull crown
  ellipse(g, CX, 28, 14, 12, 'b');
  ellipse(g, CX, 27, 12, 10, 'B');
  ellipse(g, CX - 3, 23, 5, 4, 'n');
  for (const s of [-1, 1]) {                              // eye sockets, lit violet
    ellipse(g, CX + s * 6, 27, 3.5, 3, 'k');
    disc(g, CX + s * 6, 27, 1.8, 'x');
    set(g, CX + s * 6, 28, 'V');
  }
  ellipse(g, CX, 37, 5, 4, 'k');                          // the screaming maw
  for (let x = -6; x <= 6; x += 3) { set(g, CX + x, 34, 'n'); set(g, CX + x, 40, 'n'); }

  battlement(g, CX, 50, 11, 4, 2, STONE);
  battlement(g, CX, 68, 18, 7, 2, STONE);
  for (let y = 50; y <= 78; y += 9) {                     // violet courses
    const half = 21;
    for (let x = -half; x <= half; x++) set(g, CX + x, y, (x + y) % 3 ? 'v' : 'V');
  }
  gargoyle(g, 12, 72, 'x');
  gargoyle(g, 52, 72, 'x');
  shroud(g, CX, 56, 12, 10, CURSE);
  lancet(g, CX, 66, 8, 'V', 'r');
  ossuary(g, CX, 80, 17, 5);
  cryptDoor(g, CX, GROUND - 4, 5, 12);

  ao(g, 'r', { from: 'sSR', radius: 1 });
  rimLight(g, 'x', { dir: { x: 1, y: 1 }, skip: 'kKqQiIcCjJdDgvVxbBnu', density: 0.20 });
  outline(g, 'k', { soft: 'qQvVx' });
  contactShadow(g, CX, GROUND + 4, 27, 3.2, 'q');
  contactShadow(g, CX, GROUND + 4, 14, 1.9, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  orbitR: 18,
  lantern: { r: 5, throw: 9, ramp: CURSE, glow: 'V', flare: 'x' },
  charges: { n: 2, r: 3.5, ch: 'V', glow: 'x' },
  soft: 'vVx',
};

export const SPRITES = {
  crypt_t5_terror_crypt_i_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('crypt_t5_terror_crypt_i', lanternRig, AIM, { fps: 6, frames: 2 }),
};
