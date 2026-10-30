// towers/orc_t5_scattergun_rig.js — ORC · TIER 5 · Scattergun Rig (shared middle terminal).
//
// Massing: an OPEN BRACED FRAMEWORK. Almost no solid mass — you can see the background through
// it. Every other Orc tier is a filled shape, so a hollow one is instantly separable even at
// 32 px, which matters because this tower is reachable from either first-split branch and will
// often stand next to its own cousins.

import { grid, rows, set, rect, line, disc } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, drum, stake, brace, rhombus, ironBand, spike } from './_orc_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t5_scattergun_rig', faction: 'ORC', tier: 5,
  silhouette: 'OPEN BRACED FRAMEWORK — you can see through it; almost no solid mass',
  canvas: [64, 96], ground: 86, pivot: [32, 38],
  levers: { height: 56, masses: 1, bands: 1, spikes: 4, rhombus: 1, barrelLen: 14 },
};

const W = 64, H = 96, CX = 32, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (const fx of [12, 22, 42, 52]) for (let j = 0; j < 3; j++) set(g, fx, GROUND - j, 'r');

  // four uprights, splaying slightly — drawn as thin members so the gaps dominate
  const legs = [[12, 20, false], [52, 44, false], [22, 26, true], [42, 38, true]];
  for (const [footX, topX, rear] of legs) {
    for (let y = GROUND; y >= 48; y--) {
      const t = (GROUND - y) / (GROUND - 48);
      const x = footX + (topX - footX) * t;
      set(g, x, y, rear ? 'w' : 'V');
      set(g, x + 1, y, rear ? 'W' : 'W');
    }
  }
  // three levels of X-bracing — the "rig" read
  for (const y of [60, 70, 80]) {
    const spread = 10 + (GROUND - y) * 0.22;
    brace(g, CX - spread, y + 6, CX + spread, y - 6);
    brace(g, CX + spread, y + 6, CX - spread, y - 6);
    for (let x = CX - spread; x <= CX + spread; x++) set(g, x, y + 6, 'w');
  }

  // a small planked platform at the top — the only solid area on the whole tower
  for (let x = CX - 14; x <= CX + 14; x++) { set(g, x, 44, 'V'); set(g, x, 45, 'v'); set(g, x, 46, 'W'); set(g, x, 47, 'w'); }
  drum(g, CX, 38, 8, 8, 4, GREEN);
  ironBand(g, CX - 15, 47, 31, 3, 5);
  for (const sx of [CX - 13, CX - 5, CX + 5, CX + 13]) spike(g, sx, 44, 5);

  // ammo belt slung under the platform
  for (let i = 0; i < 11; i++) {
    const x = CX - 12 + i * 2.4, y = 50 + Math.sin(i * 0.7) * 3;
    set(g, x, y, 'j'); set(g, x, y + 1, 'J'); set(g, x + 1, y, 'i');
  }
  rhombus(g, CX, 40, 3, 'M', 'd');

  ao(g, 'w', { from: 'Wv', radius: 1 });
  innerLine(g, CX - 14, 44, CX + 14, 44, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdDrR', density: 0.22 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, CX, GROUND + 3, 24, 3.0, 'q');
  contactShadow(g, CX, GROUND + 3, 15, 1.9, 'Q');
  return g;
}

// A splayed FAN of short barrels — the shortest barrels at T5/T6, but five of them.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 6, ry: 5, ramp: IRON, studs: 4, studCh: 'd' },
  barrel: { len: 14, girth: 4, ramp: IRON, taper: 1.0, rings: [] },
  muzzle: null,
  recoil: 3,
  flash: { r: 4, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    // four more barrels fanned around the central one
    for (const [s, spread] of [[-1, 5], [1, 5], [-1, 9], [1, 9]]) {
      const ox = px - dir.y * s * (spread * 0.45), oy = py + dir.x * s * (spread * 0.35);
      for (let i = 4; i < 14; i++) {
        const x = ox + dir.x * i - dir.y * s * (i * 0.10), y = oy + dir.y * i + dir.x * s * (i * 0.10);
        set(g, x, y, 'I'); set(g, x, y + 1, 'i');
      }
      if (frame === 1) {
        const tx = ox + dir.x * 15, ty = oy + dir.y * 15;
        set(g, tx, ty, 'x'); set(g, tx + dir.x, ty + dir.y, 'E');
      }
    }
  },
};

export const SPRITES = {
  orc_t5_scattergun_rig_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t5_scattergun_rig', barrelRig, TURRET, { fps: 10, frames: 2 }),
};
