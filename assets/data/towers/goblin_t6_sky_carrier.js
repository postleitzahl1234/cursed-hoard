// towers/goblin_t6_sky_carrier.js — GOBLIN · TIER 6 · Sky Carrier (drone apex).
// Massing: a grounded carrier DECK ON STILTS — a wide flat flight deck held above open air.
// The widest Goblin silhouette, and the only one whose main mass is horizontal.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, hangarMouth, grime } from './_goblin_shared.js';
import { hatchRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t6_sky_carrier', faction: 'GOBLIN', tier: 6,
  silhouette: 'a wide flight DECK on stilts with open air beneath — the widest Goblin mass',
  canvas: [64, 96], ground: 86, pivot: [32, 34],
  levers: { height: 64, masses: 3, stacks: 2, gauges: 3, bays: 4, barrelLen: 0 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (const fx of [8, 22, 42, 56]) for (let j = 0; j < 4; j++) set(g, fx, GROUND - j, 'r');

  // four stilts, with cross-bracing — open air between them
  for (const [footX, topX] of [[8, 12], [22, 24], [42, 40], [56, 52]]) {
    for (let y = GROUND; y >= 52; y--) {
      const t = (GROUND - y) / (GROUND - 52);
      const x = footX + (topX - footX) * t;
      set(g, x, y, 'J'); set(g, x + 1, y, 'I'); set(g, x + 2, y, 'i');
    }
  }
  for (const y of [62, 74]) { strut(g, 10, y + 8, 54, y - 4); strut(g, 54, y + 8, 10, y - 4); }

  // the deck itself — a long flat slab overhanging both ends
  plate(g, 2, 44, 60, 9, BRASS, 'tb');
  for (let x = 2; x <= 61; x++) { set(g, x, 43, 'C'); set(g, x, 53, 'a'); }
  for (let x = 4; x <= 60; x += 6) { set(g, x, 44, 'a'); set(g, x + 1, 44, 'C'); }
  grime(g, 2, 44, 60, 9, 37, 0.08);

  // the island: a small superstructure at one end
  plate(g, 44, 28, 14, 16, BRASS, 'tblr');
  hangarMouth(g, 51, 36, 9, 7);
  chimney(g, 47, 28, 12, 2, false);
  chimney(g, 55, 28, 9, 2, false);
  for (let j = 0; j < 12; j++) set(g, 41, 28 - j, 'J');           // mast
  set(g, 41, 16, 'l');

  // launch catapults on the deck, plus three parked drones
  for (const cx of [10, 22, 34]) {
    for (let x = 0; x < 9; x++) set(g, cx + x, 42, x % 2 ? 'J' : 'l');
    ellipse(g, cx + 4, 39, 3.5, 2, 'B');
    for (const s of [-1, 1]) line(g, cx + 4 + s * 3, 37, cx + 4 + s * 6, 36, 'J');
  }
  gauge(g, 6, 48, 2);
  gauge(g, 50, 48, 2);
  gauge(g, 30, 48, 2);

  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 3, 43, 61, 43, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, CX, GROUND + 3, 32, 3.2, 'q');
  contactShadow(g, CX, GROUND + 3, 21, 2.1, 'Q');
  return g;
}

const AIM = {
  canvas: [W, H], pivot: SPEC.pivot,
  bay: { w: 14, h: 9, offset: 10, ramp: IRON, doorCh: 'B' },
  rail: { len: 20, ch: 'l' },
  flare: { chars: ['e', 'x'] },
  soft: 'eEx',
  extra: (g, px, py, dir, frame) => {
    // a swarm of drones already airborne over the deck, drifting downrange
    for (let i = 0; i < 5; i++) {
      const dx = px + dir.x * (8 + i * 5) + ((i % 2) ? 3 : -3);
      const dy = py + dir.y * (6 + i * 3) - 14 - (i % 3) * 4;
      ellipse(g, dx, dy, 2.4, 1.4, 'B');
      set(g, dx - 3, dy - 1, 'J'); set(g, dx + 3, dy - 1, 'J');
      if (frame === 1) set(g, dx, dy + 2, 'x');
    }
  },
};

export const SPRITES = {
  goblin_t6_sky_carrier_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t6_sky_carrier', hatchRig, AIM, { fps: 8, frames: 2 }),
};
