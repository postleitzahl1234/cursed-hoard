// towers/demon_t1_imp_brazier.js — DEMON · TIER 1 · Imp Brazier.
// Massing: one small terrace carrying a horned obsidian brazier. The floor of the tree — a
// single step where the apex has five, and short enough that the brazier is half its height.

import { grid, rows, set, line, disc, ellipse, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t1_imp_brazier', faction: 'DEMON', tier: 1,
  silhouette: 'ONE small terrace under a horned brazier — the shortest Demon mass',
  canvas: [64, 96], ground: 86, pivot: [32, 48],
  levers: { height: 34, terraces: 1, width: 40, stairs: 0, braziers: 1, crown: 'coal-mouth brazier' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 10; x <= 54; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  terrace(g, CX, 60, 20, 24, 3, BASALT);
  lavaSeams(g, 13, 64, 39, 20, 3, 0.05);
  glyphBand(g, CX, 74, 17, 1);
  shrineDoor(g, CX, GROUND - 3, 4, 11);
  skullGlyph(g, CX - 13, 68, 'x');
  // OUTLINE EVENT: long swept horns reaching well past the single terrace.
  for (const s of [-1, 1]) {
    for (let j = 0; j < 22; j++) {
      const t = j / 21;
      set(g, CX + s * (11 + Math.round(9 * Math.pow(t, 1.4))), 56 - j, t > 0.8 ? 'Z' : 'z');
    }
  }

  skullGlyph(g, CX + 13, 68, 'x');

  // the brazier bowl sits directly on the single terrace
  ellipse(g, CX, 56, 11, 4, 'H');
  ellipse(g, CX, 55, 9, 3, 'O');
  for (const s of [-1, 1]) {                          // the two horns
    line(g, CX + s * 9, 56, CX + s * 13, 46, 'z', 2);
    set(g, CX + s * 13, 45, 'Z');
  }

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 12, 63, 52, 63, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 24, 3.0, 'q');
  contactShadow(g, CX, GROUND + 3, 15, 1.9, 'Q');
  return g;
}

// The smallest idol in the faction: a coal-mouth with a short flicker, no horns of its own.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 5, ramp: OBSIDIAN, eye: 'f', flare: 'x', horns: false },
  plume: { h: 7, lean: 5, chars: ['E', 'f', 'F', 'x'] },
  soft: 'eEfFxX',
};

export const SPRITES = {
  demon_t1_imp_brazier_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t1_imp_brazier', idolRig, AIM, { fps: 6, frames: 2 }),
};
