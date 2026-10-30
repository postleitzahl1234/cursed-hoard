// towers/goblin_t3_drone_bay.js — GOBLIN · TIER 3 · Drone Bay (Drone branch).
// Massing: a tall narrow tower with ONE big open HANGAR MOUTH punched through it — the
// silhouette has a hole. D-26: no turret here; the aim part is the bay doors and launch rail,
// which face the lane while the actual fighting is done by separate drone actors.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, hangarMouth, grime } from './_goblin_shared.js';
import { hatchRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t3_drone_bay', faction: 'GOBLIN', tier: 3,
  silhouette: 'tall narrow tower with ONE open hangar mouth — a hole in the outline',
  canvas: [64, 96], ground: 86, pivot: [32, 44],
  levers: { height: 56, masses: 2, stacks: 1, gauges: 1, bays: 1, barrelLen: 0 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 16; x <= 48; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  plate(g, 19, 32, 26, 54, BRASS, 'tblr');
  for (const y of [40, 52, 64, 76]) for (let x = 20; x <= 44; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  grime(g, 19, 32, 26, 54, 19, 0.09);

  hangarMouth(g, CX, 44, 20, 14);           // the hole
  for (let x = 22; x <= 42; x++) { set(g, x, 30, 'B'); set(g, x, 31, 'A'); }   // roof lip
  chimney(g, 22, 30, 12, 2, false);
  gauge(g, 40, 62, 2);
  pipe(g, [[24, 60], [16, 60], [16, 74]], 3, BRASS);
  strut(g, 16, 84, 21, 62);
  strut(g, 48, 84, 43, 62);
  hatchDoor(g, CX, GROUND - 2, 4, 11);

  // one drone parked on the rail below the mouth
  ellipse(g, CX + 6, 56, 3.5, 2, 'B');
  for (const s of [-1, 1]) line(g, CX + 6 + s * 3, 54, CX + 6 + s * 6, 53, 'J');
  set(g, CX + 6, 58, 'i');

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 20, 31, 44, 31, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.24 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 19, 2.8, 'q');
  contactShadow(g, CX, GROUND + 3, 12, 1.8, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  bay: { w: 16, h: 11, offset: 6, ramp: IRON, doorCh: 'B' },
  rail: { len: 13, ch: 'J' },
  flare: { chars: ['e', 'x'] },
  soft: 'eEx',
};

export const SPRITES = {
  goblin_t3_drone_bay_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t3_drone_bay', hatchRig, AIM, { fps: 5, frames: 2 }),
};
