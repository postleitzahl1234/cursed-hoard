// towers/orc_t5_siege_mortar.js — ORC · TIER 5 · Siege Mortar (bomb terminal).
//
// Massing: SUNKEN. Dug into a stone revetment, it is the lowest-profile T5/T6 in the game —
// deliberately, because its branch parent (Catapult) is the tallest triangle in the tree. The
// artillery line therefore reads as "tall throw → dug-in tube", not as one shape twice.

import { grid, rows, set, rect, line, ellipse, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t5_siege_mortar', faction: 'ORC', tier: 5,
  silhouette: 'SUNKEN — dug into a stone revetment, the lowest profile of any T5/T6',
  canvas: [64, 96], ground: 86, pivot: [32, 58],
  levers: { height: 40, masses: 2, bands: 2, spikes: 0, rhombus: 2, barrelLen: 18 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);

  // A TRAPEZOIDAL revetment — flat top, hard battered sides. Deliberately angular: the gate
  // caught this tower at 16% against the Bombard when both were rounded domes, and "rounded
  // dome, slightly different size" is exactly the recolour failure D-27 exists to stop. A
  // dug-in emplacement is not a hut, so it should not share the hut's outline.
  for (let y = 62; y <= GROUND; y++) {
    const t = (y - 62) / (GROUND - 62);
    const half = Math.round(18 + 12 * t);                     // batter: narrow top, wide foot
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half);
      const stone = y > 72 || Math.abs(x) > half - 4;         // stone revetment below, turf cap on top
      if (stone) set(g, CX + x, y, u < 0.18 ? 'R' : u > 0.86 ? 'r' : (y % 4 === 0 || (x + 64) % 9 === 0 ? 'r' : 'R'));
      else set(g, CX + x, y, u < 0.22 ? 'o' : u < 0.62 ? 'M' : u < 0.86 ? 'm' : 'N');
    }
  }
  for (let x = -18; x <= 18; x++) set(g, CX + x, 62, 'o');    // the lit top edge of the parapet
  speckle(g, 14, 63, 37, 9, 'N', 0.09, 83, 'mM');

  // Two BASTION EARS rising at the ends, with a firing notch between them. This is the pair of
  // pixels that finally separates this tower from the Bombard: a dome has one continuous crown,
  // this has two horns and a gap. The gate scored 12% before they were added.
  for (const s of [-1, 1]) {
    const ex = CX + s * 19;
    for (let y = 50; y <= 66; y++) {
      const half = 6 - Math.round((y - 50) * 0.12);
      for (let x = -half; x <= half; x++) {
        const u = (x + half) / (2 * half);
        set(g, ex + x, y, u < 0.2 ? 'R' : u > 0.85 ? 'r' : (y % 4 === 0 ? 'r' : 'R'));
      }
    }
    for (let x = -6; x <= 6; x += 3) { set(g, ex + x, 49, 'R'); set(g, ex + x + 1, 49, 'r'); }  // crenels
    for (let x = -6; x <= 6; x++) set(g, ex + x, 50, 'R');
    ironBand(g, ex - 6, 56, 13, 3, 2);
    rhombus(g, ex, 60, 3, 'M', 'd');
  }

  // the pit, sunk into the flat top — the mortar sits below the parapet line
  ellipse(g, CX, 63, 13, 4, 'k');
  ellipse(g, CX, 62, 11, 3, 'i');
  ellipse(g, CX, 61, 9, 2, 'I');

  // timber blast-shields staked along the front face
  for (const bx of [8, 44]) {
    for (let i = 0; i < 5; i++) { line(g, bx + i * 2, 70, bx + i * 2, 82, 'W'); set(g, bx + i * 2, 69, 'V'); }
  }
  ironBand(g, 4, 72, 57, 4, 9);
  ironBand(g, 10, 82, 45, 3, 6);


  denDoor(g, CX, GROUND - 1, 6, 9);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 4, 75, 60, 75, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.24 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 34, 3.4, 'q');
  contactShadow(g, CX, GROUND + 3, 22, 2.2, 'Q');
  return g;
}

// A wide-bore blast-scarred tube. Short, but by far the fattest barrel in the tree — the
// silhouette cue is girth, not reach.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 11, ry: 6, ramp: IRON, studs: 6, studCh: 'd' },
  barrel: { len: 18, girth: 13, ramp: IRON, taper: 1.05, rings: [8, 14], ringCh: 'J', ringCh2: 'i' },
  muzzle: { flare: 4, len: 3, ramp: IRON },
  recoil: 4,
  flash: { r: 7, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    // blast scarring around the mouth, and the oversized shell waiting at rest
    const tx = px + dir.x * 17 * dir.fore, ty = py + dir.y * 17 * dir.fore;
    for (let i = 0; i < 6; i++) set(g, tx - dir.x * i, ty + ((i % 3) - 1) * 3, 'i');
    if (frame === 0) {
      disc(g, px - dir.x * 13, py + 8, 4, 'i');
      disc(g, px - dir.x * 13 - 1, py + 7, 2.4, 'I');
      set(g, px - dir.x * 13 + 2, py + 4, 'E');
    }
  },
};

export const SPRITES = {
  orc_t5_siege_mortar_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t5_siege_mortar', barrelRig, TURRET, { fps: 4, frames: 2 }),
};
