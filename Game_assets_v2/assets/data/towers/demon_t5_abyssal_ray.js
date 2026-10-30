// towers/demon_t5_abyssal_ray.js — DEMON · TIER 5 · Abyssal Ray (beam terminal).
// Massing: a tall five-step ziggurat whose summit is a GREAT DAEMON SKULL rather than a shrine.
// The skull is wider than the terrace it sits on, so the outline goes back out at the top —
// the opposite of every other Demon tower, which taper all the way up.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t5_abyssal_ray', faction: 'DEMON', tier: 5,
  silhouette: 'tall ziggurat crowned by a daemon skull WIDER than its own summit',
  canvas: [64, 96], ground: 86, pivot: [32, 22],
  levers: { height: 72, terraces: 5, width: 40, stairs: 1, braziers: 4, crown: 'daemon skull' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 11; x <= 53; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  terrace(g, CX, 74, 20, 10, 2, BASALT);
  terrace(g, CX, 64, 17, 8, 2, BASALT);
  terrace(g, CX, 54, 14, 8, 2, BASALT);
  terrace(g, CX, 44, 11, 8, 2, BASALT);
  terrace(g, CX, 34, 8, 8, 2, BASALT);
  lavaSeams(g, 13, 46, 39, 38, 19, 0.05);
  stair(g, CX, GROUND - 4, 46, 4);
  glyphBand(g, CX, 80, 18, 11);
  glyphBand(g, CX, 70, 15, 12);

  // the skull crown — a wide mass over a narrow summit
  ellipse(g, CX, 26, 15, 11, 'o');
  ellipse(g, CX, 25, 13, 9, 'O');
  ellipse(g, CX - 4, 21, 5, 3.5, 'h');
  for (const s of [-1, 1]) {                     // ablaze eye sockets
    ellipse(g, CX + s * 6, 25, 3.5, 3, 'k');
    disc(g, CX + s * 6, 25, 2, 'f');
    set(g, CX + s * 6, 25, 'X');
    line(g, CX + s * 13, 24, CX + s * 20, 12, 'z', 2);      // framing horns
    set(g, CX + s * 20, 11, 'Z');
  }
  ellipse(g, CX, 34, 6, 4, 'k');                 // the throat-lens, which the aim part fills
  for (let x = -7; x <= 7; x += 3) set(g, CX + x, 31, 'O');

  for (const [bx, by] of [[CX - 17, 76], [CX + 17, 76], [CX - 12, 60], [CX + 12, 60]]) brazier(g, bx, by, 3, 5);
  // OUTLINE EVENT: two tall pylons flanking the skull (the T6 answers with a halo instead).
  for (const s of [-1, 1]) {
    for (let y = 6; y <= 44; y++) set(g, CX + s * 24, y, y % 5 ? 'Z' : 'z');
    for (let y = 6; y <= 44; y++) set(g, CX + s * 25, y, 'z');
    for (let j = 0; j < 5; j++) set(g, CX + s * 24, 5 - j, j > 3 ? 'X' : 'F');
    for (let x = 0; x < 6; x++) set(g, CX + s * (18 + x), 30, 'O');
  }

  shrineDoor(g, CX, 42, 3, 6);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 13, 77, 51, 77, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 24, 3.0, 'q');
  contactShadow(g, CX, GROUND + 3, 15, 1.9, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 8, ramp: OBSIDIAN, eye: 'X', flare: 'X', horns: true },
  plume: { h: 5, lean: 3, chars: ['E', 'f', 'F'] },
  soft: 'eEfFxX',
  extra: (g, px, py, dir, frame) => {
    const lx = px + dir.x * 9, ly = py + dir.y * 9;
    ellipse(g, lx, ly, 4.5, 3.6, 'e');
    ellipse(g, lx, ly, 3, 2.4, 'f');
    ellipse(g, lx, ly, 1.6, 1.2, frame === 1 ? 'X' : 'x');
    if (frame === 1) {
      for (let i = 1; i <= 14; i++) {
        const w = i > 9 ? 1 : 2;
        for (let o = -w; o <= w; o++) {
          set(g, lx + dir.x * (4 + i * 1.5) - dir.y * o, ly + dir.y * (4 + i * 1.5) + dir.x * o, Math.abs(o) === w ? 'F' : 'X');
        }
      }
    }
  },
};

export const SPRITES = {
  demon_t5_abyssal_ray_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t5_abyssal_ray', idolRig, AIM, { fps: 7, frames: 2 }),
};
