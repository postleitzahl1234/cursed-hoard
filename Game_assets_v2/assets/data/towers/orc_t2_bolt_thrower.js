// towers/orc_t2_bolt_thrower.js — ORC · TIER 2 · Bolt Thrower.
//
// Massing: the T1's den has grown a WIDE PLANKED FIRING DECK, and a crank-wheel hangs off one
// flank. The deck is what changes the outline — T1 is a plain dome, T2 is a dome wearing a hat
// two-thirds wider than itself, with an asymmetric bulge on the right.

import { grid, rows, set, rect, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t2_bolt_thrower', faction: 'ORC', tier: 2,
  silhouette: 'squat den under a wide planked firing deck; side crank-wheel breaks the outline',
  canvas: [64, 96], ground: 86, pivot: [32, 42],
  levers: { height: 48, masses: 2, bands: 1, spikes: 0, rhombus: 1, barrelLen: 20 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 12; x <= 52; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  drum(g, CX, 56, 18, 30, 8, GREEN);
  speckle(g, 15, 58, 35, 26, 'N', 0.09, 13, 'mMo');

  // the firing deck — planks laid across a timber frame, overhanging both flanks
  for (let x = 8; x <= 56; x++) {
    set(g, x, 50, 'V'); set(g, x, 51, 'v'); set(g, x, 52, 'W'); set(g, x, 53, 'w');
  }
  for (let x = 8; x <= 56; x += 5) { set(g, x, 51, 'W'); set(g, x, 52, 'w'); }   // plank seams
  brace(g, 12, 62, 20, 53);
  brace(g, 52, 62, 44, 53);
  stake(g, 9, 54, 10, 0);
  stake(g, 54, 54, 10, 0);

  // crank-wheel on the right flank — the asymmetry that stops this reading as the T1
  disc(g, 51, 62, 7, 'j');
  disc(g, 51, 62, 5, 'I');
  disc(g, 51, 62, 2, 'i');
  for (let a = 0; a < 360; a += 45) {
    line(g, 51, 62, 51 + Math.cos(a * Math.PI / 180) * 6, 62 + Math.sin(a * Math.PI / 180) * 6, 'J');
  }
  set(g, 57, 60, 'D');

  ironBand(g, 13, 64, 39, 3, 5);
  rhombus(g, CX, 72, 4, 'M', 'n');
  rhombus(g, CX, 72, 2, 'o', 'd');
  denDoor(g, CX, GROUND - 2, 6, 14);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 14, 63, 50, 63, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdD', density: 0.26 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 23, 3.3, 'q');
  contactShadow(g, CX, GROUND + 3, 15, 2.1, 'Q');
  return g;
}

// Torsion thrower: paired rope-spring bundles either side of a heavy stave. Still no muzzle,
// still no armour — but 25% more barrel than the T1 and a real mount under it.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 7, ry: 5, ramp: TIMBER },
  barrel: { len: 20, girth: 5, ramp: IRON, taper: 0.8, rings: [7], ringCh: 'j', ringCh2: 'i' },
  muzzle: null,
  recoil: 4,
  flash: { r: 3, chars: ['e', 'E', 'x'] },
  // the two skeined rope-springs, one either side of the stave
  extra: (g, px, py, dir, frame) => {
    for (const s of [-1, 1]) {
      const rx = px - dir.y * s * 6, ry = py + dir.x * s * 4;
      ellipse(g, rx, ry, 2.5, 3, frame === 1 ? 'v' : 'V');
      set(g, rx, ry - 3, 'W');
    }
  },
};

export const SPRITES = {
  orc_t2_bolt_thrower_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t2_bolt_thrower', barrelRig, TURRET, { fps: 6, frames: 2 }),
};
