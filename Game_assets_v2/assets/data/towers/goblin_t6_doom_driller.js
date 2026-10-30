// towers/goblin_t6_doom_driller.js — GOBLIN · TIER 6 · Doom Driller (ordnance apex).
// Massing: a colossal rig on TREADS — the heaviest brass mass in the game, and the only Goblin
// tower that sits on tracks. Its parent stands on legs behind a pipe bank; this squats on a
// tracked chassis with grinding gears exposed along both flanks.

import { grid, rows, set, line, disc, ellipse } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';
import { LEGEND, BRASS, IRON, plate, rivets, pipe, gauge, chimney, strut, hatchDoor, boiler, grime } from './_goblin_shared.js';
import { barrelRig, aimSet } from '../lib/aim.js';

export { LEGEND };

export const SPEC = {
  key: 'goblin_t6_doom_driller', faction: 'GOBLIN', tier: 6,
  silhouette: 'colossal tracked rig with exposed grinding gears — the heaviest brass mass',
  canvas: [64, 96], ground: 86, pivot: [28, 40],
  levers: { height: 72, masses: 4, stacks: 4, gauges: 4, bays: 0, barrelLen: 32 },
};

const W = 64, H = 96, CX = 30, GROUND = 86;

function base() {
  const g = grid(W, H);
  for (let x = 1; x <= 63; x++) for (let j = 0; j < 3; j++) set(g, x, GROUND - j, j === 2 ? 'r' : 'R');

  // the tracks: a continuous belt around five road wheels
  for (let x = 4; x <= 60; x++) { set(g, x, 72, 'J'); set(g, x, 84, 'J'); }
  for (let y = 72; y <= 84; y++) { set(g, 4, y, 'J'); set(g, 60, y, 'J'); }
  for (let x = 4; x <= 60; x += 3) { set(g, x, 71, 'l'); set(g, x, 85, 'l'); }
  for (const wx of [11, 22, 32, 42, 53]) {
    disc(g, wx, 78, 5, 'i'); disc(g, wx, 78, 3.5, 'I'); disc(g, wx, 78, 1.4, 'J');
  }

  // the hull
  plate(g, 6, 52, 50, 20, BRASS, 'tblr');
  for (const y of [58, 66]) for (let x = 7; x <= 55; x++) set(g, x, y, x % 5 < 2 ? 'a' : 'b');
  boiler(g, 42, 36, 8, 17);
  grime(g, 8, 26, 46, 46, 53, 0.10);

  // exposed grinding gears along both flanks
  for (const [gx, gy, r] of [[12, 58, 6], [24, 66, 5], [42, 58, 6], [52, 66, 5]]) {
    disc(g, gx, gy, r, 'A'); disc(g, gx, gy, r - 2, 'b'); disc(g, gx, gy, 1.4, 'B');
    for (let a = 0; a < 360; a += 40) {
      const rr = a * Math.PI / 180;
      set(g, gx + Math.cos(rr) * (r + 0.7), gy + Math.sin(rr) * (r + 0.7), 'C');
    }
  }

  for (const [cx, h] of [[18, 12], [24, 15], [50, 10]]) chimney(g, cx, 52, h, 2, false);
  for (const [gx, gy] of [[32, 56], [32, 64], [18, 68]]) gauge(g, gx, gy, 2);
  pipe(g, [[36, 62], [46, 62], [46, 52]], 3, BRASS);
  strut(g, 5, 70, 11, 54);
  strut(g, 57, 70, 51, 54);
  hatchDoor(g, 32, 71, 4, 9);
  // OUTLINE EVENT: a counterweight jib swung clear of the chassis. Without it the driller is a
  // wide brass box and collided with the Auger Cannon and Drone Foundry at 21-23%.
  for (let y = 12; y <= 44; y++) { set(g, 8, y, 'J'); set(g, 9, y, 'I'); }
  for (let x = 2; x <= 26; x++) { set(g, x, 12, 'J'); set(g, x, 13, 'I'); }
  for (let y = 14; y <= 24; y++) for (let x = 2; x <= 7; x++) set(g, x, y, x < 4 ? 'J' : 'i');
  for (let j = 0; j < 5; j++) set(g, 24, 14 + j, 'l');
  for (let i = 0; i < 7; i++) set(g, 10 + i * 2, 12 + Math.round(i * 0.6), 'l');


  ao(g, 'a', { from: 'bBc', radius: 1 });
  innerLine(g, 7, 51, 55, 51, 'K');
  rimLight(g, 'C', { dir: { x: 1, y: 1 }, skip: 'kKqQiIjJlteExdDgG', density: 0.22 });
  outline(g, 'k', { soft: 'qQeEx' });
  contactShadow(g, 32, GROUND + 2, 34, 3.2, 'q');
  contactShadow(g, 32, GROUND + 2, 22, 2.1, 'Q');
  return g;
}

// TWIN augers on parallel shafts — the same weapon family as the T5, doubled and lengthened.
const TURRET = {
  canvas: [W, H], pivot: SPEC.pivot,
  mantlet: { rx: 11, ry: 9, ramp: BRASS, studs: 8, studCh: 'C' },
  barrel: { len: 32, girth: 8, ramp: IRON, taper: 0.3, rings: [], ringCh: 'l' },
  muzzle: null,
  recoil: 4,
  flash: { r: 5, chars: ['e', 'E', 'x'] },
  extra: (g, px, py, dir, frame) => {
    const phase = frame === 1 ? 1.6 : 0;
    for (const s of [-1, 1]) {
      const ox = px - dir.y * s * 5, oy = py + dir.x * s * 4;
      for (let i = 5; i < 30 * dir.fore; i++) {
        const t = i / (30 * dir.fore);
        const amp = 3.4 * (1 - t * 0.7);
        const o = Math.sin(i * 0.85 + phase + (s > 0 ? Math.PI : 0)) * amp;
        const x = ox + dir.x * i - dir.y * o, y = oy + dir.y * i + dir.x * o;
        set(g, x, y, 'l'); set(g, x, y + 1, 'J');
      }
      set(g, ox + dir.x * 31 * dir.fore, oy + dir.y * 31 * dir.fore, 'l');
    }
  },
};

export const SPRITES = {
  goblin_t6_doom_driller_base: { anchor: 'foot', fps: 1, loop: true, frames: [rows(base())] },
  ...aimSet('goblin_t6_doom_driller', barrelRig, TURRET, { fps: 10, frames: 2 }),
};
