// towers/orc_t4_catapult.js — ORC · TIER 4 · Catapult (Artillery terminal of the first split).
//
// Massing: a big TRIANGULAR A-FRAME straddling a low den. The only triangle in the Orc tree —
// every other tier is a drum, a box or a column — so at 32 px it is unmistakable even against
// its own parent (Bombard, a squat semicircle).

import { grid, rows, set, rect, line, poly, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t4_catapult', faction: 'ORC', tier: 4,
  silhouette: 'big TRIANGULAR A-frame over a low den — the only triangle in the tree',
  canvas: [64, 96], ground: 86, pivot: [32, 34],
  levers: { height: 66, masses: 2, bands: 1, spikes: 0, rhombus: 2, barrelLen: 24 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 6; x <= 58; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  drum(g, CX, 64, 24, 22, 9, GREEN);
  speckle(g, 10, 66, 45, 18, 'N', 0.09, 61, 'mMo');

  // the A-frame: two heavy beams from the outer corners meeting high above the den
  for (const s of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.012) {
      const x = CX + s * (22 - 18 * t), y = 82 - 56 * t;
      set(g, x, y, s < 0 ? 'V' : 'W');
      set(g, x + s, y, s < 0 ? 'v' : 'w');
      set(g, x + s * 2, y, 'w');
    }
  }
  // the cross-beam the arm swings against, plus its knee braces
  for (let x = CX - 16; x <= CX + 16; x++) { set(g, x, 48, 'V'); set(g, x, 49, 'v'); set(g, x, 50, 'W'); }
  brace(g, CX - 14, 50, CX - 8, 40);
  brace(g, CX + 14, 50, CX + 8, 40);
  disc(g, CX, 34, 3, 'j'); disc(g, CX, 34, 1.4, 'J');    // the pivot bearing

  // counterweight box hanging behind the frame
  for (let y = 52; y <= 62; y++) for (let x = CX - 21; x <= CX - 12; x++) {
    set(g, x, y, x < CX - 19 ? 'W' : x > CX - 14 ? 'w' : 'v');
  }
  for (let x = CX - 21; x <= CX - 12; x += 3) { set(g, x, 52, 'j'); set(g, x, 62, 'i'); }

  ironBand(g, 9, 70, 47, 4, 6);
  rhombus(g, CX, 78, 4, 'M', 'n'); rhombus(g, CX, 78, 2, 'o', 'd');
  rhombus(g, CX + 17, 76, 3, 'M', 'd');
  denDoor(g, CX, GROUND - 2, 6, 12);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 10, 73, 54, 73, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.24 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 28, 3.5, 'q');
  contactShadow(g, CX, GROUND + 3, 18, 2.2, 'Q');
  return g;
}

// The swinging arm with a sling and a boulder in the cup. On the fire frame the arm has thrown,
// so the boulder is gone and the sling trails — a real before/after, not a recoil nudge.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 4, ry: 4, ramp: IRON },
  barrel: { len: 24, girth: 4, ramp: TIMBER, taper: 0.75, rings: [] },
  muzzle: null,
  recoil: 0,
  flash: null,
  extra: (g, px, py, dir, frame) => {
    const tipX = px + dir.x * 25 * dir.fore, tipY = py + dir.y * 25 * dir.fore;
    if (frame === 0) {
      for (let i = 0; i < 5; i++) set(g, tipX - dir.x * i * 0.4, tipY + 4 + i, 'w');   // sling ropes
      disc(g, tipX, tipY + 9, 4, 'r');
      disc(g, tipX - 1, tipY + 8, 2.2, 'R');
    } else {
      for (let i = 0; i < 7; i++) set(g, tipX + dir.x * i * 0.6, tipY - 3 + i * 0.6, 'W');  // sling flying
      set(g, tipX + dir.x * 8, tipY - 5, 'E');
    }
  },
};

export const SPRITES = {
  orc_t4_catapult_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t4_catapult', barrelRig, TURRET, { fps: 4, frames: 2 }),
};
