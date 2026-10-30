// projectiles/goblin.js — the 12 GOBLIN projectiles.
//
// Goblin ordnance is scrap: spanners, rivets, gatling rounds, spikes, bombs, drill bits. The
// drone and bomber tiers do not fire from the tower at all (D-26) — those sprites are what the
// *drone actors* throw, so they are small and read at speed.

import { grid, set, ellipse, disc, line, rows, ramp, shaft, fletch, shot, orb, trail, clip } from './_proj_lib.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',
  a: 'BR1', b: 'BR2', B: 'BR3', c: 'BR4', C: 'BR5',     // brass
  i: 'IR0', I: 'IR2', j: 'IR4', J: 'IR6',               // iron
  e: 'EM2', E: 'EM4', x: 'EM6',                         // spark / fuse
  t: 'TX1', T: 'TX3',                                   // toxin coolant
  w: 'WD2', W: 'WD4',
};

const IRON = ramp(['i', 'I', 'j', 'J']);
const BRASS = ramp(['a', 'b', 'B', 'c', 'C']);

export const SPRITES = {
  // ── bolt-arm line ───────────────────────────────────────────────────────────
  proj_goblin_spanner_bolt: clip(14, 12, 2, (g, f) => {      // a literal thrown spanner
    for (let i = 0; i < 7; i++) set(g, 3 + i, 6, 'B');
    for (let i = 0; i < 7; i++) set(g, 3 + i, 5, 'c');
    set(g, 2, 5, 'C'); set(g, 2, 7, 'C'); set(g, 3, 6, 'a');
    set(g, 10, 4, 'C'); set(g, 10, 8, 'C'); set(g, 11, 6, 'B');
    if (f) { set(g, 1, 6, 'b'); set(g, 12, 6, 'b'); }
  }, 14),

  proj_goblin_goblin_bolt: clip(16, 10, 1, g => {
    shaft(g, 2, 4, 8, 2, 4, 'I', 'j');
    set(g, 2, 4, 'c'); set(g, 3, 5, 'C');
    fletch(g, 2, 5, 2, 't');
  }, 1),

  // ── drone line: what the rotor drones shoot ─────────────────────────────────
  proj_goblin_drone_bolt: clip(10, 8, 2, (g, f) => {
    for (let i = 0; i < 4; i++) set(g, 3 + i, 4, i > 2 ? 'J' : 'I');
    set(g, 7, 4, 'C');
    if (f) trail(g, 3, 4, 2, ['t']);
  }, 16),

  proj_goblin_drone_bolt_plus: clip(12, 12, 2, (g, f) => {
    for (const dy of [-2, 2]) {
      for (let i = 0; i < 5; i++) set(g, 3 + i, 6 + dy, i > 3 ? 'J' : 'I');
      set(g, 8, 6 + dy, 'C');
    }
    if (f) { trail(g, 3, 4, 2, ['t']); trail(g, 3, 8, 2, ['t']); }
  }, 16),

  // ── ordnance line ───────────────────────────────────────────────────────────
  proj_goblin_gatling_round: clip(10, 8, 2, (g, f) => {
    for (let i = 0; i < 5; i++) set(g, 2 + i, 4, i > 3 ? 'J' : 'j');
    set(g, 2, 4, 'c');                                        // brass case
    set(g, 7, 4, 'C');
    if (f) set(g, 1, 4, 'E');
  }, 20),

  proj_goblin_spike_shell: clip(18, 16, 2, (g, f) => {
    shot(g, 8, 8, 4, IRON);
    for (let i = 0; i < 8; i++) {                             // spikes bursting out
      const a = (i / 8) * Math.PI * 2 + f * 0.4;
      line(g, 8 + Math.cos(a) * 3, 8 + Math.sin(a) * 3, 8 + Math.cos(a) * 7.5, 8 + Math.sin(a) * 7.5, 'J');
    }
    set(g, 6, 6, 'j');
  }, 10),

  proj_goblin_swarm_drone_bolts: clip(16, 14, 2, (g, f) => {
    for (const [dx, dy] of [[0, 0], [4, -4], [4, 4], [8, -2], [8, 2]]) {
      for (let i = 0; i < 3; i++) set(g, 2 + dx + i + f, 7 + dy, i > 1 ? 'J' : 'I');
      set(g, 5 + dx + f, 7 + dy, 'C');
    }
  }, 18),

  proj_goblin_swarm_drone_bolts_plus: clip(20, 18, 2, (g, f) => {
    for (const [dx, dy] of [[0, 0], [3, -5], [3, 5], [7, -3], [7, 3], [10, -6], [10, 6], [11, 0]]) {
      for (let i = 0; i < 3; i++) set(g, 2 + dx + i + f, 9 + dy, i > 1 ? 'J' : 'I');
      set(g, 5 + dx + f, 9 + dy, 'C');
    }
  }, 18),

  // ── bomber line: falling ordnance, drawn nose-down ──────────────────────────
  proj_goblin_dropped_bombs: clip(14, 18, 2, (g, f) => {
    ellipse(g, 7, 8, 3.4, 5, 'I');
    ellipse(g, 6, 6, 2, 2.6, 'j');
    set(g, 7, 13, 'J');
    for (const s of [-1, 1]) line(g, 7, 3, 7 + s * 3, 0, 'i');   // tail fins
    if (f) { set(g, 7, 14, 'E'); set(g, 7, 15, 'e'); }
  }, 10),

  proj_goblin_bomb_string: clip(20, 26, 2, (g, f) => {
    for (let n = 0; n < 3; n++) {
      const cx = 5 + n * 5, cy = 5 + n * 7 + (f ? 1 : 0);
      ellipse(g, cx, cy, 2.6, 3.6, 'I');
      ellipse(g, cx - 1, cy - 1, 1.4, 1.8, 'j');
      set(g, cx, cy + 4, 'J');
      for (const s of [-1, 1]) set(g, cx + s * 2, cy - 4, 'i');
    }
  }, 10),

  // ── drill terminal: spinning augers, the phase IS the animation ──────────────
  proj_goblin_drill_round: clip(18, 12, 3, (g, f) => {
    for (let i = 0; i < 13; i++) {
      const o = Math.sin(i * 0.9 + f * 2.1) * 2.6 * (1 - i / 16);
      set(g, 3 + i, 6 + o, 'J'); set(g, 3 + i, 6 + o + 1, 'I');
    }
    for (let i = 0; i < 13; i++) set(g, 3 + i, 6, 'j');
    set(g, 16, 6, 'C');
  }, 20),

  proj_goblin_drill_round_plus: clip(24, 16, 3, (g, f) => {
    for (const dy of [-3, 3]) {
      for (let i = 0; i < 17; i++) {
        const o = Math.sin(i * 0.9 + f * 2.1 + (dy > 0 ? Math.PI : 0)) * 2.8 * (1 - i / 20);
        set(g, 3 + i, 8 + dy + o, 'J'); set(g, 3 + i, 8 + dy + o + 1, 'I');
      }
      for (let i = 0; i < 17; i++) set(g, 3 + i, 8 + dy, 'j');
      set(g, 20, 8 + dy, 'C');
    }
    for (let i = 0; i < 4; i++) set(g, 2 + i, 8, 'e');
  }, 20),
};
