// towers/orc_t5_harpoon_cannon.js — ORC · TIER 5 · Harpoon Cannon (bolt terminal).
//
// Massing: ASYMMETRIC. A stone pier with a huge chain-spool bolted to one flank, so the
// silhouette has a lump on the right that no other Orc tower has. Nautical, not siege.

import { grid, rows, set, rect, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand, spike } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t5_harpoon_cannon', faction: 'ORC', tier: 5,
  silhouette: 'stone pier with a chain-spool drum bolted to its flank — asymmetric, nautical',
  canvas: [64, 96], ground: 86, pivot: [30, 44],
  levers: { height: 58, masses: 2, bands: 2, spikes: 2, rhombus: 2, barrelLen: 34 },
};

const W = 64, H = 96, CX = 30, GROUND = 86;

function base() {
  const g = grid(W, H);
  // dressed stone pier — coursed, not rubble; this tier has money
  for (let y = 60; y <= GROUND; y++) for (let x = 8; x <= 46; x++) {
    set(g, x, y, x < 12 ? 'R' : x > 42 ? 'r' : (y % 5 === 0 ? 'r' : 'R'));
  }
  for (let x = 8; x <= 46; x += 7) for (let y = 60; y <= GROUND; y++) set(g, x, y, 'r');

  drum(g, CX, 52, 17, 20, 7, GREEN);              // turf gun-house on the pier head
  speckle(g, 14, 54, 33, 16, 'N', 0.09, 71, 'mMo');

  // the chain-spool — the whole point of this tower's outline
  disc(g, 52, 64, 10, 'i');
  disc(g, 52, 64, 8, 'I');
  for (let r = 2; r <= 7; r += 2) {                // coiled chain, wrap by wrap
    for (let a = 0; a < 360; a += 24) {
      set(g, 52 + Math.cos(a * Math.PI / 180) * r, 64 + Math.sin(a * Math.PI / 180) * r * 0.9, a % 48 ? 'j' : 'J');
    }
  }
  disc(g, 52, 64, 2, 'J');
  line(g, 46, 58, 52, 62, 'j', 2);                // the chain running up to the gun
  brace(g, 44, 78, 52, 70);

  ironBand(g, 9, 62, 37, 4, 5);
  ironBand(g, 12, 74, 31, 3, 4);
  spike(g, 13, 61, 6); spike(g, 43, 61, 6);
  rhombus(g, CX, 68, 4, 'M', 'n'); rhombus(g, CX, 68, 2, 'o', 'D');
  rhombus(g, CX, 79, 3, 'M', 'd');
  denDoor(g, CX, GROUND - 2, 6, 13);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 10, 61, 46, 61, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.24 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, 32, GROUND + 3, 27, 3.3, 'q');
  contactShadow(g, 32, GROUND + 3, 17, 2.1, 'Q');
  return g;
}

// One huge barbed harpoon — the longest single shaft in the tree, trailing a chain.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 8, ry: 7, ramp: IRON, studs: 5, studCh: 'D' },
  barrel: { len: 34, girth: 6, ramp: IRON, taper: 0.55, rings: [12, 22], ringCh: 'J', ringCh2: 'i' },
  muzzle: null,
  recoil: 7,
  flash: { r: 3.5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    if (frame === 1) return;
    // the barbs, near the tip — two swept-back hooks
    const tx = px + dir.x * 32 * dir.fore, ty = py + dir.y * 32 * dir.fore;
    for (const s of [-1, 1]) {
      line(g, tx, ty, tx - dir.x * 5 - dir.y * s * 4, ty - dir.y * 5 + dir.x * s * 4, 'J', 2);
    }
    // slack chain trailing back to the spool
    for (let i = 0; i < 8; i++) set(g, px - dir.x * (4 + i * 1.6), py + 5 + Math.sin(i) * 1.5, i % 2 ? 'j' : 'i');
  },
};

export const SPRITES = {
  orc_t5_harpoon_cannon_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t5_harpoon_cannon', barrelRig, TURRET, { fps: 4, frames: 2 }),
};
