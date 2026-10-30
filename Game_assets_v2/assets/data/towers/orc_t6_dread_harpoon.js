// towers/orc_t6_dread_harpoon.js — ORC · TIER 6 · Dread Harpoon (bolt apex).
//
// Massing: TWIN drums behind a jutting skull-iron prow. It reads as a beached warship rather
// than a tower — the only Orc silhouette with two separate vertical masses side by side, and
// the only one with something sticking out horizontally at ground level.

import { grid, rows, set, rect, line, poly, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, denDoor, rhombus, ironBand, spike } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t6_dread_harpoon', faction: 'ORC', tier: 6,
  silhouette: 'twin-drum engine behind a jutting skull-iron prow — reads as a ship',
  canvas: [64, 96], ground: 86, pivot: [28, 40],
  levers: { height: 70, masses: 3, bands: 3, spikes: 5, rhombus: 3, barrelLen: 38 },
};

const W = 64, H = 96, CX = 28, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 4; x <= 54; x++) for (let j = 0; j < 4; j++) set(g, x, GROUND - j, j >= 2 ? 'r' : 'R');

  // Twin drums at markedly DIFFERENT heights, separated by a visible gap. The gate caught this
  // at 25% against the Harpoon Cannon when both masses sat at a similar level — a stepped pair
  // of towers reads nothing like one tower with a spool bolted to its side.
  drum(g, 15, 30, 12, 56, 7, GREEN);
  drum(g, 41, 56, 11, 30, 6, GREEN);
  speckle(g, 4, 32, 50, 50, 'N', 0.07, 91, 'mMo');

  // the connecting gantry, slung between them at the shorter drum's shoulder
  for (let x = 15; x <= 41; x++) { set(g, x, 56, 'V'); set(g, x, 57, 'v'); set(g, x, 58, 'W'); }
  brace(g, 20, 76, 38, 60);
  brace(g, 38, 76, 20, 60);
  brace(g, 15, 54, 26, 40);
  spike(g, 15, 28, 8);

  // paired chain-drums, one per tower
  for (const [dx, dy] of [[15, 70], [41, 74]]) {
    disc(g, dx, dy, 6, 'i'); disc(g, dx, dy, 4, 'I');
    for (let a = 0; a < 360; a += 40) set(g, dx + Math.cos(a * Math.PI / 180) * 5, dy + Math.sin(a * Math.PI / 180) * 4.5, 'j');
    disc(g, dx, dy, 1.4, 'J');
  }

  // the skull-iron prow, jutting forward at deck level
  poly(g, [[50, 62], [62, 68], [62, 74], [50, 78]], 'i');
  poly(g, [[50, 62], [60, 68], [50, 70]], 'I');
  disc(g, 57, 70, 3.5, 'B'); set(g, 57, 69, 'n');
  set(g, 56, 70, 'k'); set(g, 58, 70, 'k');                    // eye sockets
  for (let x = 54; x <= 60; x += 2) set(g, x, 73, 'k');        // teeth

  ironBand(g, 4, 42, 23, 4, 4);
  ironBand(g, 32, 62, 21, 4, 3);
  ironBand(g, 8, 78, 40, 3, 6);
  for (const sx of [7, 23]) spike(g, sx, 41, 6);
  for (const sx of [34, 50]) spike(g, sx, 61, 5);


  rhombus(g, 15, 50, 4, "M", "D"); rhombus(g, 15, 50, 2, "o", "O");
  rhombus(g, 42, 70, 3, 'M', 'd');
  rhombus(g, 15, 74, 3, "M", "d");
  denDoor(g, 15, GROUND - 2, 5, 12);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 4, 39, 26, 39, "K");
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDbBrR', density: 0.24 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, 32, GROUND + 3, 30, 3.5, 'q');
  contactShadow(g, 32, GROUND + 3, 20, 2.2, 'Q');
  return g;
}

// TWO harpoons on parallel tracks — the only twin-shaft weapon in the tree, and the longest.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 9, ry: 8, ramp: IRON, studs: 6, studCh: 'D' },
  barrel: { len: 38, girth: 5, ramp: IRON, taper: 0.6, rings: [13, 25], ringCh: 'J', ringCh2: 'i' },
  muzzle: null,
  recoil: 8,
  flash: { r: 4, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    const back = frame === 1 ? 8 : 0;
    // the second track, offset below the first
    const ox = px - dir.y * 5 - dir.x * back, oy = py + dir.x * 4 - dir.y * back;
    for (let i = 4; i < 34 * dir.fore; i++) {
      const x = ox + dir.x * i, y = oy + dir.y * i;
      set(g, x, y - 1, 'J'); set(g, x, y, 'I'); set(g, x, y + 1, 'i');
    }
    if (frame === 0) {
      for (const [bx, by] of [[px + dir.x * 36 * dir.fore, py + dir.y * 36 * dir.fore],
                              [ox + dir.x * 32 * dir.fore, oy + dir.y * 32 * dir.fore]]) {
        for (const s of [-1, 1]) line(g, bx, by, bx - dir.x * 5 - dir.y * s * 4, by - dir.y * 5 + dir.x * s * 4, 'J', 2);
      }
    }
  },
};

export const SPRITES = {
  orc_t6_dread_harpoon_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t6_dread_harpoon', barrelRig, TURRET, { fps: 4, frames: 2 }),
};
