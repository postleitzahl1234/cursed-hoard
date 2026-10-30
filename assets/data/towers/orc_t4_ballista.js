// towers/orc_t4_ballista.js — ORC · TIER 4 · Ballista (Marksman terminal of the first split).
//
// Massing: TALL AND LEAN. Half the width of the Bombard at nearly twice the height — the
// narrowest silhouette in the Orc tree. Its parent (Crossbow Nest) is a box on legs; this is a
// single unbroken column, so the branch reads as "the same idea, grown up" without sharing an
// outline.

import { grid, rows, set, rect, line, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand, spike } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t4_ballista', faction: 'ORC', tier: 4,
  silhouette: 'TALL AND LEAN — a narrow drum column, the thinnest Orc silhouette',
  canvas: [64, 96], ground: 86, pivot: [32, 26],
  levers: { height: 72, masses: 2, bands: 2, spikes: 3, rhombus: 2, barrelLen: 30 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 16; x <= 48; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  drum(g, CX, 34, 11, 52, 7, GREEN);              // the column: halfW 11 over a 52 px run
  drum(g, CX, 68, 15, 18, 5, GREEN);              // a slight skirt where it meets the ground
  speckle(g, 20, 38, 25, 44, 'N', 0.08, 53, 'mMo');

  // long raking braces — they exaggerate the height rather than filling it out
  brace(g, 17, 84, 25, 46);
  brace(g, 47, 84, 39, 46);
  stake(g, 15, 60, 24, 1);
  stake(g, 48, 60, 24, -1);

  ironBand(g, 20, 42, 25, 3, 4);
  ironBand(g, 17, 66, 31, 3, 5);
  spike(g, 21, 41, 6); spike(g, 43, 41, 6); spike(g, CX, 30, 7);

  rhombus(g, CX, 52, 4, 'M', 'n'); rhombus(g, CX, 52, 2, 'o', 'D');
  rhombus(g, CX, 74, 3, 'M', 'd');
  denDoor(g, CX, GROUND - 3, 5, 13);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 21, 41, 43, 41, 'K');
  innerLine(g, 18, 73, 46, 73, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.26 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 19, 3.0, 'q');
  contactShadow(g, CX, GROUND + 3, 12, 1.9, 'Q');
  return g;
}

// A full war-ballista: the longest barrel so far, with the twisted-sinew bundles reading as two
// big drums either side of the channel.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 8, ry: 5, ramp: TIMBER, studs: 4, studCh: 'j' },
  barrel: { len: 30, girth: 5, ramp: IRON, taper: 0.7, rings: [9, 19], ringCh: 'J', ringCh2: 'i' },
  muzzle: null,
  recoil: 6,
  flash: { r: 3, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    // sinew bundles + the long limbs sweeping back from the head of the channel
    for (const s of [-1, 1]) {
      const rx = px - dir.y * s * 7, ry = py + dir.x * s * 5;
      disc(g, rx, ry, 3, frame === 1 ? 'W' : 'V');
      disc(g, rx, ry, 1.4, 'w');
      const lx = rx + dir.x * 9, ly = ry + dir.y * 9;
      line(g, rx, ry, lx - dir.y * s * 3, ly + dir.x * s * 3, frame === 1 ? 'v' : 'W', 2);
    }
  },
};

export const SPRITES = {
  orc_t4_ballista_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t4_ballista', barrelRig, TURRET, { fps: 5, frames: 2 }),
};
