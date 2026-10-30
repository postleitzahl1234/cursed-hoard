// towers/demon_t4_searing_lance.js — DEMON · TIER 4 · Searing Lance (Beam branch).
// Massing: the narrowest, sharpest Demon mass — five very slim terraces drawn in hard, so the
// tower is almost a blade. Sleeker than the Hellbeam rather than merely taller.

import { grid, rows, set, line, disc, ellipse, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t4_searing_lance', faction: 'DEMON', tier: 4,
  silhouette: 'five very slim terraces — the narrowest, sharpest Demon mass',
  canvas: [64, 96], ground: 86, pivot: [32, 18],
  levers: { height: 78, terraces: 5, width: 28, stairs: 1, braziers: 4, crown: 'twin-horn lance' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 18; x <= 46; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  terrace(g, CX, 72, 14, 12, 2, BASALT);
  terrace(g, CX, 61, 12, 9, 2, BASALT);
  terrace(g, CX, 50, 10, 9, 2, BASALT);
  terrace(g, CX, 39, 8, 9, 2, BASALT);
  terrace(g, CX, 28, 6, 9, 2, BASALT);
  lavaSeams(g, 19, 32, 27, 50, 11, 0.05);
  stair(g, CX, GROUND - 4, 40, 3);
  glyphBand(g, CX, 80, 12, 5);
  glyphBand(g, CX, 68, 10, 6);
  glyphBand(g, CX, 57, 8, 7);

  shrineDoor(g, CX, 37, 2, 6);
  for (const [bx, by] of [[CX - 13, 70], [CX + 13, 70], [CX - 9, 48], [CX + 9, 48]]) brazier(g, bx, by, 3, 5);
  // OUTLINE EVENT: flying buttresses springing clear of the shaft. Hellbeam has none.
  for (const s of [-1, 1]) {
    for (let j = 0; j < 26; j++) {
      const t = j / 25;
      const x = CX + s * (7 + 16 * Math.pow(t, 0.75)), y = 40 + j;
      set(g, x, y, 'Z'); set(g, x + s, y, 'z');
    }
    for (let y = 66; y <= 84; y++) set(g, CX + s * 23, y, y % 4 ? 'O' : 'o');
  }

  skullGlyph(g, CX, 76, 'x');

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 19, 75, 45, 75, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 18, 2.7, 'q');
  contactShadow(g, CX, GROUND + 3, 11, 1.7, 'Q');
  return g;
}

// Twin horns with a focusing collar between them — brighter and sharper than the T3's single lens.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 6, ramp: OBSIDIAN, eye: 'X', flare: 'X', horns: true },
  plume: { h: 4, lean: 2, chars: ['E', 'f', 'F'] },
  soft: 'eEfFxX',
  extra: (g, px, py, dir, frame) => {
    for (const s of [-1, 1]) {                          // the twin lance horns
      const hx = px + dir.x * 4 - dir.y * s * 4, hy = py + dir.y * 4 + dir.x * s * 3;
      line(g, hx, hy, hx + dir.x * 8, hy + dir.y * 8, 'z', 2);
      set(g, hx + dir.x * 9, hy + dir.y * 9, 'Z');
    }
    const lx = px + dir.x * 8, ly = py + dir.y * 8;      // the collar lens between them
    ellipse(g, lx, ly, 3, 2.4, 'F');
    ellipse(g, lx, ly, 1.6, 1.2, 'X');
    if (frame === 1) {
      for (let i = 1; i <= 12; i++) set(g, lx + dir.x * (3 + i * 1.5), ly + dir.y * (3 + i * 1.5), i > 8 ? 'F' : 'X');
    }
  },
};

export const SPRITES = {
  demon_t4_searing_lance_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t4_searing_lance', idolRig, AIM, { fps: 8, frames: 2 }),
};
