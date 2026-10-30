// towers/demon_t6_magma_mortar.js — DEMON · TIER 6 · Magma Mortar (shared apex).
// Massing: a low BASALT CARRIAGE — a wide slab platform on obsidian runners, not a pyramid.
// It is the only Demon tower that is not a ziggurat, which is how it separates from its parent
// while carrying the same weapon at full size (D-29).

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';
import { magmaMortar } from './demon_t5_brimstone_battery.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t6_magma_mortar', faction: 'DEMON', tier: 6,
  silhouette: 'a wide basalt CARRIAGE on obsidian runners — the only non-pyramid Demon tower',
  canvas: [64, 96], ground: 86, pivot: [32, 44],
  levers: { height: 50, terraces: 2, width: 56, stairs: 0, braziers: 4, crown: 'full magma mortar' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 2; x <= 62; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // obsidian runners under the carriage
  for (const ry of [82, 76]) {
    for (let x = 4; x <= 60; x++) set(g, x, ry, (x % 7 < 3) ? 'Z' : 'z');
    for (let x = 4; x <= 60; x++) set(g, x, ry + 1, 'k');
  }
  for (const rx of [8, 22, 42, 56]) for (let y = 74; y <= 84; y++) set(g, rx, y, 'Z');

  // the slab deck — flat and broad, with a raised gun bed in the middle
  for (let y = 58; y <= 74; y++) {
    const half = 28 - Math.round((y - 58) * 0.15);
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half);
      let s = 1 - Math.pow(Math.min(1, u / 0.55), 1.25);
      if (u > 0.55) s = -0.3 * ((u - 0.55) / 0.45);
      set(g, CX + x, y, BASALT.at((s * 0.55 + (1 - (y - 58) / 16) * 0.45) * (BASALT.n - 1)));
    }
  }
  for (let x = -28; x <= 28; x++) set(g, CX + x, 57, 'Y');
  lavaSeams(g, 5, 60, 55, 14, 31, 0.06);
  glyphBand(g, CX, 70, 25, 23);

  // the raised gun bed
  for (let y = 48; y <= 58; y++) {
    const half = 15 - Math.round((y - 48) * 0.2);
    for (let x = -half; x <= half; x++) set(g, CX + x, y, x < -half + 3 ? 'y' : x > half - 3 ? 'O' : 'H');
  }
  ellipse(g, CX, 47, 13, 4, 'z');
  ellipse(g, CX, 46, 11, 3, 'Z');
  for (let x = -9; x <= 9; x += 3) set(g, CX + x, 46, 'E');

  for (const [bx, by] of [[CX - 25, 62], [CX + 25, 62], [CX - 18, 54], [CX + 18, 54]]) brazier(g, bx, by, 4, 6);
  // OUTLINE EVENT: a shell derrick. The carriage is otherwise a low slab and collided with
  // four other Demon towers at 14-22%.
  for (let y = 10; y <= 50; y++) { set(g, 12, y, 'Z'); set(g, 13, y, 'z'); }
  for (let x = 12; x <= 30; x++) { set(g, x, 10, 'Z'); set(g, x, 11, 'z'); }
  for (let j = 0; j < 12; j++) set(g, 29, 12 + j, j % 2 ? 'O' : 'o');
  ellipse(g, 29, 26, 3.5, 3, 'H'); ellipse(g, 29, 26, 2, 1.6, 'E');
  for (let j = 0; j < 6; j++) { set(g, 9 + j, 14 + j, 'z'); }

  skullGlyph(g, CX - 22, 68, 'X');
  skullGlyph(g, CX + 22, 68, 'X');
  shrineDoor(g, CX, 74, 4, 8);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 5, 59, 59, 59, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.20 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 33, 3.3, 'q');
  contactShadow(g, CX, GROUND + 3, 21, 2.1, 'Q');
  return g;
}

// Same weapon as the T5, at full scale (D-29).
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 7, ramp: OBSIDIAN, eye: 'X', flare: 'X', horns: true },
  plume: { h: 5, lean: 4, chars: ['E', 'f', 'F', 'x'] },
  soft: 'eEfFxX',
  extra: magmaMortar(1.6),
};

export const SPRITES = {
  demon_t6_magma_mortar_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t6_magma_mortar', idolRig, AIM, { fps: 5, frames: 2 }),
};
