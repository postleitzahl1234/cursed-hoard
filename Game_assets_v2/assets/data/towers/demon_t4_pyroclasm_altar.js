// towers/demon_t4_pyroclasm_altar.js — DEMON · TIER 4 · Pyroclasm Altar (Pyre branch).
// Massing: broader still than the Pyre, and CRACKED — lava channels overflow the terrace edge
// and run down onto the ground, so the footprint bleeds past the stone.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t4_pyroclasm_altar', faction: 'DEMON', tier: 4,
  silhouette: 'the broadest Demon footprint — two low terraces with lava overflowing onto the ground',
  canvas: [64, 96], ground: 86, pivot: [32, 46],
  levers: { height: 46, terraces: 2, width: 64, stairs: 1, braziers: 6, crown: 'cracked magma altar' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 0; x < 64; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // lava spilling past the stone, onto the ground — the outline is not all masonry
  for (let i = 0; i < 5; i++) {
    const sx = 4 + i * 14;
    for (let y = 78; y <= GROUND; y++) {
      const wob = Math.round(Math.sin((y + i * 3) * 0.7) * 2);
      for (let x = -3; x <= 3; x++) set(g, sx + x + wob, y, Math.abs(x) > 2 ? 'e' : Math.abs(x) > 1 ? 'E' : 'f');
    }
  }

  terrace(g, CX, 66, 31, 18, 4, BASALT);
  terrace(g, CX, 52, 22, 12, 3, BASALT);
  lavaSeams(g, 2, 70, 61, 14, 17, 0.09);
  stair(g, CX, GROUND - 4, 56, 6);
  glyphBand(g, CX, 78, 28, 9);

  // the cracked altar top with channels radiating out of it
  ellipse(g, CX, 48, 15, 5, 'e');
  ellipse(g, CX, 48, 12, 4, 'E');
  ellipse(g, CX - 2, 47, 8, 2.4, 'f');
  for (let i = 0; i < 6; i++) {
    const a = i * 60 * Math.PI / 180;
    line(g, CX, 48, CX + Math.cos(a) * 20, 48 + Math.sin(a) * 7, 'E', 2);
    line(g, CX, 48, CX + Math.cos(a) * 16, 48 + Math.sin(a) * 5.5, 'f');
  }
  for (const s of [-1, 1]) {
    line(g, CX + s * 23, 52, CX + s * 29, 40, 'z', 2);
    set(g, CX + s * 29, 39, 'Z');
  }
  // OUTLINE EVENT: two cantilevered spouts throwing lava clear of the footprint, so the
  // broadest Demon tower is no longer just the widest trapezoid.
  for (const s of [-1, 1]) {
    // a tall mast far out on each flank, carrying the spout head well above everything
    for (let y = 18; y <= 62; y++) { set(g, CX + s * 28, y, 'Z'); set(g, CX + s * 29, y, 'z'); }
    for (let i = 0; i < 8; i++) set(g, CX + s * (22 + i), 18 + Math.round(i * 0.4), 'Z');
    ellipse(g, CX + s * 22, 22, 3.5, 3, 'H'); ellipse(g, CX + s * 22, 22, 2, 1.6, 'E');
    for (let j = 0; j < 20; j++) set(g, CX + s * 22, 26 + j, j > 14 ? 'e' : j > 7 ? 'E' : 'f');
  }
  for (const [bx, by] of [[CX - 22, 70], [CX + 22, 70], [CX - 14, 68], [CX + 14, 68], [CX - 9, 56], [CX + 9, 56]]) {
    brazier(g, bx, by, 3, 4);
  }
  skullGlyph(g, CX, 74, 'X');
  shrineDoor(g, CX, 76, 4, 8);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 2, 69, 62, 69, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.20 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 35, 3.5, 'q');
  contactShadow(g, CX, GROUND + 3, 23, 2.2, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 6, ramp: OBSIDIAN, eye: 'x', flare: 'X', horns: true },
  plume: { h: 15, lean: 10, chars: ['E', 'f', 'F', 'x', 'X'] },
  soft: 'eEfFxX',
};

export const SPRITES = {
  demon_t4_pyroclasm_altar_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t4_pyroclasm_altar', idolRig, AIM, { fps: 7, frames: 2 }),
};
