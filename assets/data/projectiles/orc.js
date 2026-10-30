// projectiles/orc.js — the 12 ORC projectiles. One per tier, none reused (D-06).
//
// Orc ordnance is iron and stone: bolts, harpoons, bombs, shells. The tier read is size and
// count — a T1 bolt is 9 px of iron, a T6 doomsday shell is a banded 20 px cylinder with a
// fuse. All authored pointing EAST; the engine free-rotates them to the flight angle.

import { grid, set, ellipse, disc, line, rows, ramp, shaft, fletch, shot, orb, trail, clip } from './_proj_lib.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',
  i: 'IR1', I: 'IR3', j: 'IR5', J: 'IR6',      // iron
  w: 'WD1', W: 'WD3', v: 'WD5',                // wood shafts
  r: 'RK1', R: 'RK3', T: 'RK5',                // stone
  e: 'EM2', E: 'EM4', x: 'EM6',                // fuse spark / burn
  d: 'GD2', D: 'GD4',                          // brass banding
  n: 'MS1', N: 'MS3',                          // green war-paint fletching
};

const IRON = ramp(['i', 'I', 'j', 'J']);
const STONE = ramp(['r', 'R', 'T']);

export const SPRITES = {
  // ── bolt line: each tier is longer, thicker, and gains furniture ────────────
  proj_orc_short_bolt: clip(14, 8, 1, g => {
    shaft(g, 2, 3, 6, 2, 3, 'I', 'j');
    set(g, 1, 3, 'w'); set(g, 1, 4, 'w');
  }, 1),

  proj_orc_iron_bolt: clip(18, 9, 1, g => {
    shaft(g, 2, 4, 9, 2, 4, 'I', 'j');
    fletch(g, 2, 4, 2, 'W');
  }, 1),

  proj_orc_rapid_bolt: clip(16, 12, 2, (g, f) => {          // fires in pairs, alternating
    shaft(g, 2, 2 + f, 7, 1, 3, 'j', 'J');
    shaft(g, 1, 7 - f, 7, 1, 3, 'I', 'j');
  }, 14),

  proj_orc_ballista_spear: clip(28, 10, 1, g => {
    shaft(g, 2, 4, 17, 3, 6, 'W', 'v');
    for (const x of [7, 12]) for (let o = -1; o < 4; o++) set(g, x, 4 + o, 'i');
    fletch(g, 2, 5, 3, 'n');
  }, 1),

  // ── lob line: round shot, growing and gaining bands ─────────────────────────
  proj_orc_arcing_bomb: clip(14, 14, 2, (g, f) => {
    shot(g, 6, 8, 5, IRON);
    line(g, 8, 3, 10 + f, 1 - f, 'W');
    set(g, 10 + f, 0, f ? 'x' : 'E');
  }, 8),

  proj_orc_boulder: clip(18, 18, 2, (g, f) => {
    shot(g, 9, 9, 8, STONE);
    for (const [dx, dy] of [[-3, -2], [2, 3], [4, -3], [-2, 4]]) set(g, 9 + dx + f, 9 + dy, 'r');
    set(g, 5, 5, 'T');
  }, 6),

  // ── harpoon terminal: barbed, and the T6 trails a chain ─────────────────────
  proj_orc_barbed_harpoon: clip(26, 12, 1, g => {
    shaft(g, 2, 5, 15, 3, 5, 'I', 'j');
    for (const s of [-1, 1]) line(g, 20, 6, 15, 6 + s * 4, 'J');
    fletch(g, 2, 6, 2, 'W');
  }, 1),

  proj_orc_chained_dread_harpoon: clip(32, 14, 2, (g, f) => {
    shaft(g, 8, 6, 16, 4, 6, 'I', 'J');
    for (const s of [-1, 1]) { line(g, 27, 7, 21, 7 + s * 5, 'J'); line(g, 24, 7, 19, 7 + s * 4, 'j'); }
    for (let i = 0; i < 4; i++) {                          // the trailing chain
      const x = 6 - i * 2, y = 7 + Math.round(Math.sin(i + f) * 2);
      ellipse(g, x, y, 1.4, 1.2, 'i'); set(g, x, y, 'I');
    }
    set(g, 12, 6, 'd'); set(g, 17, 6, 'd');
  }, 9),

  // ── scatter terminal: a spread of pellets, count is the tier ────────────────
  proj_orc_pellet_spray: clip(20, 16, 2, (g, f) => {
    for (const [dx, dy] of [[0, 0], [4, -3], [4, 3], [8, -5], [8, 5], [9, 0]]) {
      disc(g, 4 + dx + f, 8 + dy, 1.4, 'I'); set(g, 4 + dx + f, 8 + dy, 'j');
    }
  }, 14),

  proj_orc_triple_barrel_spray: clip(26, 20, 2, (g, f) => {
    for (const [dx, dy] of [[0, 0], [3, -4], [3, 4], [7, -7], [7, 7], [8, -2], [8, 2],
                            [12, -8], [12, 8], [13, -4], [13, 4], [14, 0]]) {
      disc(g, 4 + dx + f, 10 + dy, 1.6, 'I'); set(g, 4 + dx + f, 10 + dy, 'J');
    }
  }, 16),

  // ── mortar terminal: fat fused shells ───────────────────────────────────────
  proj_orc_mortar_shell: clip(18, 16, 2, (g, f) => {
    for (let y = 4; y <= 12; y++) for (let x = 4; x <= 13; x++) {
      const u = (x - 4) / 9;
      set(g, x, y, u < 0.25 ? 'j' : u > 0.8 ? 'i' : 'I');
    }
    ellipse(g, 4, 8, 2, 4.5, 'I'); ellipse(g, 13, 8, 2, 4.5, 'j');
    for (const x of [7, 11]) for (let y = 4; y <= 12; y++) set(g, x, y, 'd');
    line(g, 13, 6, 16 + f, 3 - f, 'W');
    set(g, 16 + f, 2 - f, f ? 'x' : 'E');
  }, 8),

  proj_orc_doomsday_shell: clip(26, 20, 2, (g, f) => {
    for (let y = 5; y <= 15; y++) for (let x = 4; x <= 20; x++) {
      const u = (x - 4) / 16;
      set(g, x, y, u < 0.22 ? 'j' : u > 0.82 ? 'i' : 'I');
    }
    ellipse(g, 4, 10, 2.4, 5.5, 'J'); ellipse(g, 20, 10, 2.4, 5.5, 'i');
    for (const x of [8, 12, 16]) for (let y = 5; y <= 15; y++) set(g, x, y, 'D');
    for (const x of [8, 12, 16]) { set(g, x, 5, 'd'); set(g, x, 15, 'd'); }
    line(g, 20, 7, 24 + f, 3 - f, 'W');
    disc(g, 24 + f, 2 - f, 1.6, f ? 'x' : 'E');
    trail(g, 4, 10, 4, ['e', 'E']);
  }, 8),
};
