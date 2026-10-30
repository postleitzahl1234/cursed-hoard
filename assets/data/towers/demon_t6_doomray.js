// towers/demon_t6_doomray.js — DEMON · TIER 6 · Doomray (beam apex).
// Massing: the skull haloed by a ring of focusing runes, on the tallest beam ziggurat. The halo
// is a hard circle around the crown — nothing else in the faction has an enclosing curve, which
// is what separates it from its parent (a bare skull on a slightly shorter stack).

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t6_doomray', faction: 'DEMON', tier: 6,
  silhouette: 'daemon skull inside a HALO of focusing runes, on the tallest beam stack',
  canvas: [64, 96], ground: 86, pivot: [32, 24],
  levers: { height: 82, terraces: 6, width: 44, stairs: 1, braziers: 6, crown: 'runed halo' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 9; x <= 55; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  terrace(g, CX, 76, 22, 8, 2, BASALT);
  terrace(g, CX, 68, 19, 6, 2, BASALT);
  terrace(g, CX, 60, 16, 6, 2, BASALT);
  terrace(g, CX, 52, 14, 6, 2, BASALT);
  terrace(g, CX, 44, 11, 6, 2, BASALT);
  terrace(g, CX, 36, 9, 6, 2, BASALT);
  lavaSeams(g, 11, 46, 43, 38, 23, 0.05);
  stair(g, CX, GROUND - 4, 48, 4);
  glyphBand(g, CX, 81, 20, 13);
  glyphBand(g, CX, 73, 17, 14);
  glyphBand(g, CX, 65, 14, 15);

  // the halo: a ring of runes standing around the crown
  for (let a = 0; a < 360; a += 6) {
    const r = a * Math.PI / 180;
    set(g, CX + Math.cos(r) * 21, 24 + Math.sin(r) * 19, a % 30 < 15 ? 'O' : 'h');
  }
  for (let a = 0; a < 360; a += 45) {
    const r = a * Math.PI / 180;
    const rx = CX + Math.cos(r) * 21, ry = 24 + Math.sin(r) * 19;
    disc(g, rx, ry, 2, 'e'); set(g, rx, ry, 'X');
  }

  ellipse(g, CX, 26, 13, 10, 'o');
  ellipse(g, CX, 25, 11, 8, 'O');
  ellipse(g, CX - 3, 21, 4, 3, 'h');
  for (const s of [-1, 1]) {
    ellipse(g, CX + s * 5, 25, 3, 2.6, 'k');
    disc(g, CX + s * 5, 25, 1.8, 'f'); set(g, CX + s * 5, 25, 'X');
    line(g, CX + s * 11, 24, CX + s * 17, 10, 'z', 2);
    set(g, CX + s * 17, 9, 'Z');
  }
  ellipse(g, CX, 34, 5, 3.5, 'k');

  for (const [bx, by] of [[CX - 19, 78], [CX + 19, 78], [CX - 15, 66], [CX + 15, 66], [CX - 10, 54], [CX + 10, 54]]) {
    brazier(g, bx, by, 3, 5);
  }
  shrineDoor(g, CX, 42, 3, 6);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 11, 79, 53, 79, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 4, 26, 3.1, 'q');
  contactShadow(g, CX, GROUND + 4, 17, 2.0, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 8, ramp: OBSIDIAN, eye: 'X', flare: 'X', horns: true },
  plume: { h: 4, lean: 2, chars: ['E', 'f', 'F'] },
  soft: 'eEfFxX',
  extra: (g, px, py, dir, frame) => {
    const lx = px + dir.x * 9, ly = py + dir.y * 9;
    ellipse(g, lx, ly, 5, 4, 'e');
    ellipse(g, lx, ly, 3.4, 2.6, 'f');
    ellipse(g, lx, ly, 1.8, 1.4, 'X');
    if (frame === 1) {
      for (let i = 1; i <= 18; i++) {                       // the piercing ray, with heat-haze
        const w = i > 12 ? 1 : 3;
        for (let o = -w; o <= w; o++) {
          set(g, lx + dir.x * (4 + i * 1.4) - dir.y * o, ly + dir.y * (4 + i * 1.4) + dir.x * o,
              Math.abs(o) === w ? 'F' : Math.abs(o) > 1 ? 'x' : 'X');
        }
      }
    }
  },
};

export const SPRITES = {
  demon_t6_doomray_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t6_doomray', idolRig, AIM, { fps: 8, frames: 2 }),
};
