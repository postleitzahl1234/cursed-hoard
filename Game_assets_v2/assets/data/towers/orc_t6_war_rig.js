// towers/orc_t6_war_rig.js — ORC · TIER 6 · War Rig (shared middle apex).
//
// Massing: a BOXY armoured carriage with a tall smoke-stack. The Orc grammar is rounded dens
// (D-27), so the one place the faction is allowed to break its own rule is at the very top of
// the shared branch, where "they bolted armour plate over the den" is the story. Squared
// corners plus a chimney make it the odd one out at a glance — which is exactly what its parent
// (Scattergun Rig, an open frame) is not.

import { grid, rows, set, rect, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao, speckle } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, GREEN, TIMBER, IRON, stake, brace, denDoor, rhombus, ironBand, spike } from './_orc_shared.js';
import { cylinderV, cylinderH } from '../lib/shade.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'orc_t6_war_rig', faction: 'ORC', tier: 6,
  silhouette: 'armoured BOX carriage with a tall smoke-stack — squared, not rounded',
  canvas: [64, 96], ground: 86, pivot: [30, 38],
  levers: { height: 68, masses: 3, bands: 3, spikes: 4, rhombus: 2, barrelLen: 22 },
};

const W = 64, H = 96, CX = 30, GROUND = 86;

function base() {
  const g = grid(W, H);

  // road wheels under the carriage — nothing else in the tree has wheels
  for (const wx of [12, 26, 40, 52]) {
    disc(g, wx, 80, 6, 'i'); disc(g, wx, 80, 4, 'I');
    for (let a = 0; a < 360; a += 60) set(g, wx + Math.cos(a * Math.PI / 180) * 4.5, 80 + Math.sin(a * Math.PI / 180) * 4.5, 'j');
    disc(g, wx, 80, 1.4, 'J');
  }
  for (let x = 6; x <= 58; x++) { set(g, x, 74, 'j'); set(g, x, 75, 'i'); }     // chassis rail

  // the armoured box — flat top, flat sides, hard corners
  cylinderV(g, 8, 44, 45, 30, GREEN);
  for (let x = 8; x <= 52; x++) { set(g, x, 44, 'o'); set(g, x, 45, 'M'); set(g, x, 73, 'n'); }
  for (let y = 44; y <= 73; y++) { set(g, 8, y, 'M'); set(g, 9, y, 'o'); set(g, 52, y, 'n'); set(g, 51, y, 'N'); }
  speckle(g, 10, 46, 41, 26, 'N', 0.07, 97, 'mMo');
  // riveted plate seams — the "armour bolted on" story
  for (const y of [52, 62]) for (let x = 9; x <= 51; x++) set(g, x, y, x % 6 < 2 ? 'j' : 'N');
  for (const x of [20, 32, 44]) for (let y = 45; y <= 72; y++) set(g, x, y, y % 5 === 0 ? 'j' : 'N');

  // ammo hoppers on the roof
  for (const hx of [14, 24]) {
    for (let y = 38; y <= 44; y++) for (let x = hx; x <= hx + 7; x++) set(g, x, y, x < hx + 2 ? 'J' : x > hx + 5 ? 'i' : 'I');
    for (let x = hx; x <= hx + 7; x += 3) set(g, x, 38, 'd');
  }

  // the smoke-stack — the tall vertical the silhouette needs so it is not just a brick
  for (let y = 18; y <= 44; y++) for (let x = 45; x <= 50; x++) set(g, x, y, x === 45 ? 'J' : x === 50 ? 'i' : 'I');
  for (let x = 43; x <= 52; x++) { set(g, x, 18, 'J'); set(g, x, 19, 'J'); }
  set(g, 47, 20, 'e'); set(g, 47, 21, 'E');
  ironBand(g, 44, 30, 8, 3, 2);

  ironBand(g, 7, 42, 47, 4, 8);
  ironBand(g, 7, 70, 47, 3, 6);
  for (const sx of [11, 19, 41, 49]) spike(g, sx, 43, 5);
  rhombus(g, CX, 58, 5, 'M', 'n'); rhombus(g, CX, 58, 3, 'o', 'D');
  rhombus(g, CX, 68, 3, 'M', 'd');
  denDoor(g, CX, 73, 5, 11);

  ao(g, 'n', { from: 'NmM', radius: 1 });
  innerLine(g, 8, 44, 52, 44, 'K');
  rimLight(g, 'O', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJdD', density: 0.22 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, 32, GROUND + 1, 30, 3.2, 'q');
  contactShadow(g, 32, GROUND + 1, 20, 2.0, 'Q');
  return g;
}

// A triple-barrel rotating rig: three medium barrels clustered, not fanned — dense, not wide.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 9, ry: 7, ramp: IRON, studs: 6, studCh: 'D' },
  barrel: { len: 22, girth: 5, ramp: IRON, taper: 0.95, rings: [8, 16], ringCh: 'J', ringCh2: 'i' },
  muzzle: { flare: 2, len: 2, ramp: IRON },
  recoil: 4,
  flash: { r: 5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    const spin = frame === 1 ? 1 : 0;
    for (const s of [-1, 1]) {
      const ox = px - dir.y * s * 4, oy = py + dir.x * s * 3 + spin;
      for (let i = 4; i < 22 * dir.fore; i++) {
        const x = ox + dir.x * i, y = oy + dir.y * i;
        set(g, x, y - 1, 'J'); set(g, x, y, 'I'); set(g, x, y + 1, 'i');
      }
      if (frame === 1) {
        const tx = ox + dir.x * 23 * dir.fore, ty = oy + dir.y * 23 * dir.fore;
        disc(g, tx, ty, 2, 'E'); set(g, tx, ty, 'x');
      }
    }
  },
};

export const SPRITES = {
  orc_t6_war_rig_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('orc_t6_war_rig', barrelRig, TURRET, { fps: 9, frames: 2 }),
};
