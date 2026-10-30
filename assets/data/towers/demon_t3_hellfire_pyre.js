// towers/demon_t3_hellfire_pyre.js — DEMON · TIER 3 · Hellfire Pyre (Pyre branch).
// Massing: ROUND AND LOW — one very broad terrace carrying an open lava font. D-27 pins the
// pyre wing as the shortest and broadest in the faction, and this is where that starts.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t3_hellfire_pyre', faction: 'DEMON', tier: 3,
  silhouette: 'a broad TWO-step altar carrying an open lava font — stepped, not a flat pan',
  canvas: [64, 96], ground: 86, pivot: [32, 42],
  levers: { height: 52, terraces: 2, width: 60, stairs: 1, braziers: 4, crown: 'open lava font' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 1; x <= 63; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // A STEPPED ALTAR, not a pan. The gate caught this at 13% against the Lake of Fire when both
  // were flat broad bowls; the spec has always called this one "a font on a stepped altar", so
  // giving it two real terraces and a staircase is both the fix and the brief.
  terrace(g, CX, 70, 30, 14, 4, BASALT);
  terrace(g, CX, 54, 22, 14, 4, BASALT);
  lavaSeams(g, 4, 60, 57, 24, 13, 0.07);
  stair(g, CX, GROUND - 4, 58, 6);
  glyphBand(g, CX, 80, 27, 8);
  glyphBand(g, CX, 64, 19, 10);

  // the font: an open bowl of lava sunk into the upper terrace
  ellipse(g, CX, 50, 16, 6, 'o');
  ellipse(g, CX, 50, 14, 5, 'e');
  ellipse(g, CX, 50, 11, 3.5, 'E');
  ellipse(g, CX, 49, 8, 2.5, 'f');
  ellipse(g, CX - 2, 48, 4, 1.4, 'F');
  for (let i = 0; i < 9; i++) {                       // licks curling off the surface
    const a = i * 40 * Math.PI / 180;
    const fx = CX + Math.cos(a) * 10, fy = 49 + Math.sin(a) * 3;
    for (let j = 0; j < 3 + (i % 3); j++) set(g, fx, fy - j, j > 2 ? 'x' : 'F');
  }
  for (const s of [-1, 1]) {                          // rim horns on the upper terrace
    line(g, CX + s * 17, 50, CX + s * 22, 38, 'z', 2);
    set(g, CX + s * 22, 37, 'Z');
  }
  for (const [bx, by] of [[CX - 26, 74], [CX + 26, 74], [CX - 18, 58], [CX + 18, 58]]) brazier(g, bx, by, 3, 4);
  // OUTLINE EVENT: four tall obsidian flame-horns. The pyre wing is briefed as broad and low
  // (D-27), so its members can only separate ABOVE the mass, never sideways.
  for (const [hx, hh] of [[CX - 28, 24], [CX - 17, 24], [CX - 6, 24], [CX + 6, 24], [CX + 17, 24], [CX + 28, 24]]) {
    for (let j = 0; j < hh; j++) {
      const t = j / hh, half = Math.max(0, Math.round(2.2 * (1 - t)));
      for (let x = -half; x <= half; x++) set(g, hx + x, 62 - j, x < 0 ? 'Z' : 'z');
    }
    for (let j = 0; j < 4; j++) set(g, hx, 62 - hh - j, j > 2 ? 'X' : j > 1 ? 'x' : 'F');
  }

  skullGlyph(g, CX - 22, 78, 'x');
  skullGlyph(g, CX + 22, 78, 'x');
  shrineDoor(g, CX, 68, 4, 8);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 4, 73, 60, 73, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.20 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 34, 3.4, 'q');
  contactShadow(g, CX, GROUND + 3, 22, 2.2, 'Q');
  return g;
}

// The pyre has no emitter to point — what turns is a small horned idol on the rim, and the
// flame plume leans toward whatever it has chosen.
const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 5, ramp: OBSIDIAN, eye: 'x', flare: 'X', horns: true },
  plume: { h: 12, lean: 8, chars: ['E', 'f', 'F', 'x', 'X'] },
  soft: 'eEfFxX',
};

export const SPRITES = {
  demon_t3_hellfire_pyre_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t3_hellfire_pyre', idolRig, AIM, { fps: 7, frames: 2 }),
};
