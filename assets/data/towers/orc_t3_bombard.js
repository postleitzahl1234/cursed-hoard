// towers/orc_t3_bombard.js — ORC · TIER 3 · Bombard (Artillery branch).
//
// Massing: SQUAT AND BROAD — wider than it is tall, the flattest thing in the Orc tree. It is
// the deliberate opposite of its branch-sibling the Crossbow Nest (elevated, hollow, tall), so
// a player choosing between Marksman and Artillery can tell at a glance which they built.

import { grid, rows, set, rect, line, ellipse, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t3_bombard', faction: 'ORC', tier: 3,
  silhouette: 'SQUAT AND BROAD — one wide low drum, wider than it is tall',
  canvas: [64, 96], ground: 86, pivot: [32, 54],
  levers: { height: 42, masses: 1, bands: 1, spikes: 0, rhombus: 3, barrelLen: 12 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 3; x <= 61; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  // one broad low drum — halfW 28 against a height of only 30, the reverse of the Ballista
  drum(g, CX, 60, 28, 26, 11, GREEN);
  speckle(g, 6, 62, 53, 22, 'N', 0.09, 41, 'mMo');

  // splayed timber revetment holding the mass down
  for (const [x0, x1] of [[4, 14], [50, 60]]) {
    brace(g, x0, 83, x1, 66);
    stake(g, x0 + 1, 68, 17, 0);
  }
  brace(g, 18, 84, 24, 68);
  brace(g, 46, 84, 40, 68);

  ironBand(g, 5, 68, 55, 4, 8);

  // THREE rhombus bosses across the broad face — the width is what the tier buys, so the
  // decoration spreads sideways rather than stacking
  rhombus(g, CX, 76, 4, 'M', 'n'); rhombus(g, CX, 76, 2, 'o', 'd');
  rhombus(g, CX - 17, 74, 3, 'M', 'd');
  rhombus(g, CX + 17, 74, 3, 'M', 'd');

  denDoor(g, CX, GROUND - 2, 7, 12);

  // the mortar pit collar — a ring of iron the tube sits down inside
  ellipse(g, CX, 58, 11, 4, 'i');
  ellipse(g, CX, 57, 9, 3, 'I');

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 6, 71, 58, 71, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.26 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 32, 3.6, 'q');
  contactShadow(g, CX, GROUND + 3, 21, 2.3, 'Q');
  return g;
}

// A stubby cast-iron mortar: the SHORTEST barrel in the Orc tree, and the fattest for its
// length. Muzzle-heavy, with a fused bomb visible in the mouth at rest.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 8, ry: 6, ramp: TIMBER, studs: 4, studCh: 'j' },
  barrel: { len: 12, girth: 9, ramp: IRON, taper: 1.1, rings: [6], ringCh: 'j', ringCh2: 'i' },
  muzzle: { flare: 3, len: 2, ramp: IRON },
  recoil: 3,
  flash: { r: 5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    if (frame === 1) return;                       // the bomb is gone once it fires
    const bx = px + dir.x * 13, by = py + dir.y * 13;
    disc(g, bx, by, 3, 'i');
    disc(g, bx - 1, by - 1, 1.6, 'I');
    set(g, bx + 1, by - 3, 'W');                   // fuse
    set(g, bx + 2, by - 4, 'E');
  },
};

export const SPRITES = {
  orc_t3_bombard_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t3_bombard', barrelRig, TURRET, { fps: 5, frames: 2 }),
};
