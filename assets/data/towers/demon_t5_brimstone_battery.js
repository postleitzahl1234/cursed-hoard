// towers/demon_t5_brimstone_battery.js — DEMON · TIER 5 · Brimstone Battery (shared middle).
// Massing: a mid-height three-step ziggurat carrying a lava-cradle mortar.
//
// D-29 is explicit about this one: it is the SAME WEAPON as the T6 Magma Mortar, scaled down
// and weaker — not a different multi-mouth rig. So the mortar here shares the T6's shape and
// differs only in size and furniture, while the BUILDINGS under them differ properly.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t5_brimstone_battery', faction: 'DEMON', tier: 5,
  silhouette: 'mid three-step ziggurat with a lava-cradle mortar — the T6 weapon, scaled weaker',
  canvas: [64, 96], ground: 86, pivot: [32, 40],
  levers: { height: 54, terraces: 3, width: 46, stairs: 1, braziers: 2, crown: 'small magma mortar' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 8; x <= 56; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  terrace(g, CX, 68, 23, 16, 3, BASALT);
  terrace(g, CX, 56, 17, 10, 3, BASALT);
  terrace(g, CX, 46, 12, 8, 2, BASALT);
  lavaSeams(g, 10, 60, 45, 24, 29, 0.05);
  stair(g, CX, GROUND - 4, 58, 5);
  glyphBand(g, CX, 78, 20, 21);

  // the cradle the mortar rests in — an obsidian saddle with an ember bed
  ellipse(g, CX, 44, 11, 4, 'z');
  ellipse(g, CX, 43, 9, 3, 'Z');
  for (let x = -7; x <= 7; x += 3) set(g, CX + x, 43, 'E');

  brazier(g, CX - 19, 70, 3, 5);
  // OUTLINE EVENT: a forward shell-hoist arm, low and stubby (the T6 derrick is tall and back).
  for (let x = 46; x <= 60; x++) { set(g, x, 40, 'Z'); set(g, x, 41, 'z'); }
  for (let y = 40; y <= 62; y++) { set(g, 46, y, 'z'); set(g, 47, y, 'Z'); }
  for (let j = 0; j < 7; j++) set(g, 58, 42 + j, j % 2 ? 'O' : 'o');
  ellipse(g, 58, 50, 3, 2.4, 'H'); ellipse(g, 58, 50, 1.6, 1.2, 'E');

  brazier(g, CX + 19, 70, 3, 5);
  skullGlyph(g, CX - 12, 62, 'x');
  skullGlyph(g, CX + 12, 62, 'x');
  shrineDoor(g, CX, 54, 3, 7);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 10, 71, 54, 71, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 27, 3.1, 'q');
  contactShadow(g, CX, GROUND + 3, 17, 2.0, 'Q');
  return g;
}

/** The magma-mortar shape. Shared with the T6 by design (D-29) — `s` scales the whole thing. */
export function magmaMortar(s) {
  return (g, px, py, dir, frame) => {
    const len = 12 * s, girth = 7 * s;
    for (let i = 0; i < len * dir.fore; i++) {
      const x = px + dir.x * i, y = py + dir.y * i;
      for (let o = -girth / 2; o <= girth / 2; o++) {
        const u = (o + girth / 2) / girth;
        set(g, x, y + o, u < 0.25 ? 'H' : u > 0.78 ? 'o' : 'h');
      }
    }
    const tx = px + dir.x * len * dir.fore, ty = py + dir.y * len * dir.fore;
    ellipse(g, tx, ty, girth * 0.55, girth * 0.45, 'O');       // the glowing bore
    ellipse(g, tx, ty, girth * 0.36, girth * 0.28, frame === 1 ? 'X' : 'E');
    for (const b of [0.35, 0.7]) {                              // banding
      const bx = px + dir.x * len * b * dir.fore, by = py + dir.y * len * b * dir.fore;
      for (let o = -girth / 2 - 1; o <= girth / 2 + 1; o++) set(g, bx, by + o, 'z');
    }
    if (frame === 1) {
      ellipse(g, tx + dir.x * 4, ty + dir.y * 4, 4 * s, 3 * s, 'E');
      ellipse(g, tx + dir.x * 4, ty + dir.y * 4, 2.4 * s, 1.8 * s, 'X');
    }
  };
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 5, ramp: OBSIDIAN, eye: 'f', flare: 'X', horns: true },
  plume: { h: 4, lean: 3, chars: ['E', 'f', 'F'] },
  soft: 'eEfFxX',
  extra: magmaMortar(1.0),
};

export const SPRITES = {
  demon_t5_brimstone_battery_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t5_brimstone_battery', idolRig, AIM, { fps: 5, frames: 2 }),
};
