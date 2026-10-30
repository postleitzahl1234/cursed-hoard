// towers/demon_t6_infernal_caldera.js — DEMON · TIER 6 · Infernal Caldera (pyre apex).
// Massing: the caldera RISEN — a volcano-mouth on a basalt mound. Where its parent is the
// shortest thing in the game, this is the tallest Demon mass, so the pyre wing ends by
// inverting its own silhouette rather than widening again. Also an aura tower: no aim part.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t6_infernal_caldera', faction: 'DEMON', tier: 6,
  silhouette: 'a volcano-mouth risen on a basalt mound — the tallest Demon mass',
  canvas: [64, 96], ground: 86, pivot: null,
  levers: { height: 84, terraces: 1, width: 62, stairs: 0, braziers: 0, crown: 'erupting mouth' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 0; x < 64; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // the mound: a steep cone, wide at the foot, drawn as one continuous mass with no terraces
  for (let y = 14; y <= GROUND; y++) {
    const t = (y - 14) / (GROUND - 14);
    const half = Math.round(5 + 26 * Math.pow(t, 0.82));
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half);
      let s = 1 - Math.pow(Math.min(1, u / 0.55), 1.25);
      if (u > 0.55) s = -0.3 * ((u - 0.55) / 0.45);
      set(g, CX + x, y, BASALT.at((s * 0.62 + (1 - t) * 0.22) * (BASALT.n - 1)));
    }
  }
  lavaSeams(g, 4, 40, 57, 44, 41, 0.06);

  // lava rivers running the whole way down the flanks
  for (const [x0, drift] of [[-9, -0.35], [4, 0.28], [14, 0.42], [-19, -0.2]]) {
    for (let y = 22; y <= 84; y++) {
      const t = (y - 22) / 62;
      const x = CX + x0 + drift * (y - 22) + Math.sin(y * 0.5) * 1.5;
      const w = 1 + Math.round(t * 2);
      for (let o = -w; o <= w; o++) set(g, x + o, y, Math.abs(o) === w ? 'e' : Math.abs(o) > 0 ? 'E' : 'f');
    }
  }

  // the mouth
  ellipse(g, CX, 16, 10, 4, 'k');
  ellipse(g, CX, 16, 8, 3, 'e');
  ellipse(g, CX, 15, 6, 2, 'E');
  ellipse(g, CX - 1, 15, 3, 1.2, 'f');
  for (let i = 0; i < 7; i++) {                       // fountains erupting from it
    const dx = -8 + i * 3, h = 6 + ((i * 3) % 7);
    for (let j = 0; j < h; j++) {
      const t = j / h;
      set(g, CX + dx + Math.round(dx * t * 0.5), 13 - j, t > 0.7 ? 'X' : t > 0.35 ? 'x' : 'F');
    }
  }
  for (const s of [-1, 1]) {                          // rim horns at the mouth
    line(g, CX + s * 11, 18, CX + s * 17, 8, 'z', 2);
    set(g, CX + s * 17, 7, 'Z');
  }

  glyphBand(g, CX, 74, 24, 27);
  skullGlyph(g, CX - 18, 66, 'X');
  skullGlyph(g, CX + 18, 66, 'X');

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 8, 62, 56, 62, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.20 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 34, 3.3, 'q');
  contactShadow(g, CX, GROUND + 3, 22, 2.1, 'Q');
  return g;
}

export const SPRITES = {
  demon_t6_infernal_caldera_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
};
