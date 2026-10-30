// towers/demon_t3_hellbeam.js — DEMON · TIER 3 · Hellbeam (Beam branch).
// Massing: TALL AND NARROW — four slim terraces stacked into a tower, per D-27's "beam wing
// tall". Its branch sibling (Hellfire Pyre) is the broadest, lowest thing the faction builds,
// so the split is legible from across the board.

import { grid, rows, set, line, disc, ellipse, poly } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t3_hellbeam', faction: 'DEMON', tier: 3,
  silhouette: 'TALL narrow four-step ziggurat under a forward-aimed obsidian horn',
  canvas: [64, 96], ground: 86, pivot: [32, 26],
  levers: { height: 68, terraces: 4, width: 34, stairs: 1, braziers: 2, crown: 'focusing horn' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 14; x <= 50; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  terrace(g, CX, 70, 17, 14, 2, BASALT);
  terrace(g, CX, 56, 14, 12, 2, BASALT);
  terrace(g, CX, 43, 11, 11, 2, BASALT);
  terrace(g, CX, 32, 8, 9, 2, BASALT);
  lavaSeams(g, 16, 46, 33, 36, 7, 0.05);
  stair(g, CX, GROUND - 4, 46, 4);              // stops one terrace below the summit (D-29)
  glyphBand(g, CX, 78, 15, 3);
  glyphBand(g, CX, 63, 12, 4);

  shrineDoor(g, CX, 41, 3, 7);
  skullGlyph(g, CX - 12, 74, 'x');
  skullGlyph(g, CX + 12, 74, 'x');
  brazier(g, CX - 15, 68, 3, 5);
  brazier(g, CX + 15, 68, 3, 5);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 16, 73, 48, 73, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 21, 2.9, 'q');
  contactShadow(g, CX, GROUND + 3, 13, 1.8, 'Q');
  return g;
}

// The beam emitter: a horn with a bright focusing lens where the idol's mouth would be.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 7, ramp: OBSIDIAN, eye: 'x', flare: 'X', horns: true },
  plume: { h: 5, lean: 3, chars: ['E', 'f', 'F'] },
  soft: 'eEfFxX',
  extra: (g, px, py, dir, frame) => {
    // the lens eye, and on the fire frame a short lance of light leaving it
    const lx = px + dir.x * 7, ly = py + dir.y * 7;
    ellipse(g, lx, ly, 3.5, 3, 'f');
    ellipse(g, lx, ly, 2, 1.6, frame === 1 ? 'X' : 'x');
    if (frame === 1) {
      for (let i = 1; i <= 9; i++) {
        set(g, lx + dir.x * (3 + i * 1.6), ly + dir.y * (3 + i * 1.6), i > 6 ? 'F' : 'X');
      }
    }
  },
};

export const SPRITES = {
  demon_t3_hellbeam_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t3_hellbeam', idolRig, AIM, { fps: 7, frames: 2 }),
};
