// towers/demon_t5_lake_of_fire.js — DEMON · TIER 5 · Lake of Fire (pyre terminal).
// Massing: a WIDE SUNKEN CALDERA ringed with horns — the shortest and broadest thing in the
// game. It has no aim part: an aura tower has no single target to face (D-05e bounds the
// radius; nothing here tracks), so `SpriteKeys.towerAim` finds no art and the renderer draws
// the structure plain. That absence is deliberate, not an omission.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t5_lake_of_fire', faction: 'DEMON', tier: 5,
  silhouette: 'a wide SUNKEN caldera ringed with horns — shortest and broadest in the game',
  canvas: [64, 96], ground: 86, pivot: null,          // aura tower: nothing to aim
  levers: { height: 32, terraces: 1, width: 64, stairs: 0, braziers: 0, crown: 'burning pool' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 0; x < 64; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // a low outward-sloping rim — the ground rises to meet the pool rather than a tower standing on it
  for (let y = 62; y <= GROUND; y++) {
    const t = (y - 62) / (GROUND - 62);
    const half = Math.round(24 + 8 * t);
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half);
      let s = 1 - Math.pow(Math.min(1, u / 0.55), 1.25);
      if (u > 0.55) s = -0.3 * ((u - 0.55) / 0.45);
      set(g, CX + x, y, BASALT.at((s * 0.5 + (1 - t) * 0.3) * (BASALT.n - 1)));
    }
  }
  lavaSeams(g, 3, 66, 59, 18, 37, 0.09);
  glyphBand(g, CX, 78, 26, 25);

  // the pool itself, sunk into the rim
  ellipse(g, CX, 60, 24, 9, 'k');
  ellipse(g, CX, 60, 22, 8, 'e');
  ellipse(g, CX, 60, 18, 6, 'E');
  ellipse(g, CX, 59, 13, 4, 'f');
  ellipse(g, CX - 4, 58, 6, 2, 'F');
  for (let i = 0; i < 14; i++) {                        // churn: bubbles and licks
    const a = i * 26 * Math.PI / 180, r = 6 + (i % 4) * 4;
    const fx = CX + Math.cos(a) * r, fy = 60 + Math.sin(a) * (r * 0.34);
    disc(g, fx, fy, 1.2, i % 3 ? 'x' : 'X');
  }

  // the ring of horns standing out of the rim — the caldera's only vertical elements
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const hx = CX + Math.cos(a) * 26, hy = 66 + Math.sin(a) * 7;
    const h = 8 + (i % 3) * 3;
    for (let j = 0; j < h; j++) {
      const t = j / h, half = Math.max(0, Math.round(1.6 * (1 - t)));
      for (let x = -half; x <= half; x++) set(g, hx + x + Math.round(t * 2 * Math.sign(Math.cos(a))), hy - j, x < 0 ? 'Z' : 'z');
    }
  }
  skullGlyph(g, CX - 16, 74, 'X');
  // OUTLINE EVENT: a causeway arching over the pool — the only thing standing above the rim.
  for (let x = 6; x <= 58; x++) {
    const y = 18 + Math.round(Math.pow((x - CX) / 26, 2) * 40);
    for (let o = 0; o < 3; o++) set(g, x, y + o, o === 0 ? 'Z' : o === 1 ? 'z' : 'O');
  }
  for (const px of [10, 54]) for (let y = 54; y <= 64; y++) set(g, px, y, 'z');
  for (let j = 0; j < 6; j++) set(g, CX, 14 + j, j > 3 ? 'X' : 'F');   // a flame at the apex

  skullGlyph(g, CX + 16, 74, 'X');

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 3, 69, 61, 69, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.20 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 36, 3.4, 'q');
  contactShadow(g, CX, GROUND + 3, 24, 2.2, 'Q');
  return g;
}

export const SPRITES = {
  demon_t5_lake_of_fire_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
};
