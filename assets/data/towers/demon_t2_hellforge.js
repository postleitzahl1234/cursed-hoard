// towers/demon_t2_hellforge.js — DEMON · TIER 2 · Hellforge.
// Massing: two terraces, wide and heavy — anvil bulk. Chained iron slabs across the face and a
// venting fire-grate. Broad where the T1 was small, but still nowhere near the pyre wing's spread.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BASALT, OBSIDIAN, EMBER, terrace, stair, shrineDoor, glyphBand, brazier, skullGlyph, lavaSeams } from './_demon_shared.js';
import { idolRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'demon_t2_hellforge', faction: 'DEMON', tier: 2,
  silhouette: 'two heavy terraces, anvil bulk, chained iron face and a venting grate',
  canvas: [64, 96], ground: 86, pivot: [32, 38],
  levers: { height: 48, terraces: 2, width: 50, stairs: 1, braziers: 2, crown: 'forge grate' },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 5; x <= 59; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  terrace(g, CX, 62, 25, 22, 3, BASALT);
  terrace(g, CX, 46, 17, 14, 3, BASALT);
  lavaSeams(g, 8, 66, 49, 18, 5, 0.05);
  stair(g, CX, GROUND - 4, 66, 5);
  glyphBand(g, CX, 76, 22, 2);

  // chained iron slabs — the forge's tell, drawn across the lower riser
  for (const sx of [CX - 16, CX + 16]) {
    for (let y = 68; y <= 80; y++) for (let x = -4; x <= 4; x++) set(g, sx + x, y, x < -2 ? 'Z' : x > 2 ? 'k' : 'z');
    for (let j = 0; j < 5; j++) { set(g, sx - 5, 68 + j * 3, 'O'); set(g, sx + 5, 69 + j * 3, 'O'); }
  }
  // the venting grate on the upper terrace
  for (let x = -10; x <= 10; x++) for (let y = 50; y <= 56; y++) set(g, CX + x, y, 'k');
  for (let x = -9; x <= 9; x += 3) for (let y = 51; y <= 55; y++) set(g, CX + x, y, y % 2 ? 'E' : 'f');
  for (let x = -11; x <= 11; x++) set(g, CX + x, 49, 'y');

  brazier(g, CX - 21, 60, 4, 6);
  // OUTLINE EVENT: a chain-hoist gantry cantilevered clear of the mass, plus its post.
  // Without it this tower is a wide trapezoid and scores 14-22% against four siblings.
  for (let y = 20; y <= 46; y++) { set(g, 50, y, 'Z'); set(g, 51, y, 'z'); }
  for (let x = 34; x <= 62; x++) { set(g, x, 20, 'Z'); set(g, x, 21, 'z'); }
  for (let j = 0; j < 9; j++) set(g, 60, 22 + j, j % 2 ? 'O' : 'o');
  ellipse(g, 60, 33, 3, 2.5, 'H');  ellipse(g, 60, 33, 1.6, 1.2, 'E');
  for (let j = 0; j < 5; j++) set(g, 38, 22 + j, 'z');

  brazier(g, CX + 21, 60, 4, 6);
  skullGlyph(g, CX - 9, 72, 'x');
  skullGlyph(g, CX + 9, 72, 'x');
  shrineDoor(g, CX, 60, 4, 9);

  ao(g, 'o', { from: 'OhH', radius: 1 });
  innerLine(g, 8, 65, 56, 65, 'K');
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxXbBdDnNzZ', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEfFxX' });
  contactShadow(g, CX, GROUND + 3, 29, 3.2, 'q');
  contactShadow(g, CX, GROUND + 3, 19, 2.0, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  idol: { r: 6, ramp: OBSIDIAN, eye: 'f', flare: 'x', horns: true },
  plume: { h: 9, lean: 6, chars: ['E', 'f', 'F', 'x'] },
  soft: 'eEfFxX',
};

export const SPRITES = {
  demon_t2_hellforge_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('demon_t2_hellforge', idolRig, AIM, { fps: 6, frames: 2 }),
};
