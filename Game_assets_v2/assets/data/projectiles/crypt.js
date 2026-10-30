// projectiles/crypt.js — the 12 CRYPT projectiles.
//
// Crypt does not throw objects, it releases CHARGES — the same orbiting motes you see banked
// around the spire. So the whole line is glow-cored orbs, and the tiers separate by count,
// corona size and colour school: frost (ice blue) → curse (violet) → lightning (volt white).

import { grid, set, ellipse, disc, line, rows, ramp, orb, trail, fork, ring, clip } from './_proj_lib.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',
  i: 'IC0', I: 'IC2', c: 'IC3', C: 'IC5',      // frost
  v: 'CR1', V: 'CR3', x: 'CR5',                // curse violet
  h: 'HX2', H: 'HX4',                          // arcane fringe on curse
  b: 'BN2', B: 'BN5',                          // bone motes
  r: 'RK2', R: 'RK4',                          // grave dust
  d: 'GD2', D: 'GD4',                          // gold rune flecks
  w: 'IC4', W: 'IC5',                          // volt highlight (shares the ice family, brighter)
};

export const SPRITES = {
  // ── frost line: the corona grows and the core brightens tier by tier ─────────
  proj_crypt_descending_ice_charge: clip(12, 12, 2, (g, f) => {
    orb(g, 6, 6, 3 + f * 0.4, 'i', 'I', 'c');
    set(g, 5, 5, 'C');
  }, 6),

  proj_crypt_ice_charge: clip(14, 14, 2, (g, f) => {
    orb(g, 7, 7, 4 + f * 0.4, 'i', 'I', 'c');
    set(g, 6, 6, 'C');
    for (const [dx, dy] of [[5, 0], [-5, 0], [0, 5], [0, -5]]) set(g, 7 + dx, 7 + dy, 'I');
  }, 6),

  proj_crypt_frost_charge: clip(16, 16, 2, (g, f) => {
    orb(g, 8, 8, 5, 'i', 'I', 'c');
    ellipse(g, 8, 8, 4.4, 4.4, 'C');
    ellipse(g, 8, 8, 2.4, 2.4, 'C');
    for (let a = f * 45; a < 360; a += 90) {                 // four icicle spurs
      const r = a * Math.PI / 180;
      line(g, 8 + Math.cos(r) * 5, 8 + Math.sin(r) * 5, 8 + Math.cos(r) * 7.5, 8 + Math.sin(r) * 7.5, 'c');
    }
  }, 8),

  proj_crypt_heavy_frost_charge: clip(20, 20, 2, (g, f) => {
    orb(g, 10, 10, 7, 'i', 'I', 'c');
    ellipse(g, 10, 10, 5.6, 5.6, 'C');
    for (let a = f * 30; a < 360; a += 60) {
      const r = a * Math.PI / 180;
      line(g, 10 + Math.cos(r) * 7, 10 + Math.sin(r) * 7, 10 + Math.cos(r) * 9.5, 10 + Math.sin(r) * 9.5, 'C');
    }
    trail(g, 4, 10, 3, ['I', 'i']);
  }, 8),

  // ── fear line: violet, ragged, with a skull mote at T4 ──────────────────────
  proj_crypt_spectral_charge: clip(16, 16, 3, (g, f) => {
    orb(g, 8, 8, 5, 'v', 'V', 'x');
    for (let i = 0; i < 5; i++) {                            // wisps trailing off
      const a = (i / 5) * Math.PI * 2 + f * 0.5;
      set(g, 8 + Math.cos(a) * 6.5, 8 + Math.sin(a) * 6.5, i % 2 ? 'V' : 'h');
    }
  }, 9),

  proj_crypt_wraith_charge: clip(20, 20, 3, (g, f) => {
    orb(g, 10, 10, 6, 'v', 'V', 'x');
    disc(g, 10, 9, 3, 'B');                                  // the skull inside
    set(g, 9, 9, 'k'); set(g, 11, 9, 'k');
    for (let x = 9; x <= 11; x += 2) set(g, x, 12, 'b');
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 - f * 0.6;
      set(g, 10 + Math.cos(a) * 8, 10 + Math.sin(a) * 8, i % 2 ? 'H' : 'x');
    }
  }, 9),

  // ── frost terminal: a formation volley, not a single charge ──────────────────
  proj_crypt_orbiting_frost_volley: clip(24, 24, 3, (g, f) => {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + f * 0.5;
      orb(g, 12 + Math.cos(a) * 7, 12 + Math.sin(a) * 7, 3, 'i', 'I', 'C');
    }
    ellipse(g, 12, 12, 2, 2, 'c');
  }, 12),

  proj_crypt_orbiting_frost_volley_plus: clip(28, 28, 3, (g, f) => {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + f * 0.4;
      orb(g, 14 + Math.cos(a) * 10, 14 + Math.sin(a) * 10, 3.4, 'i', 'I', 'C');
    }
    orb(g, 14, 14, 4, 'I', 'c', 'C');
    for (let a = 0; a < 360; a += 8) {
      const r = (a + f * 12) * Math.PI / 180;
      set(g, 14 + Math.cos(r) * 13, 14 + Math.sin(r) * 13, 'i');
    }
  }, 12),

  // ── lightning shared: forks, not orbs ───────────────────────────────────────
  proj_crypt_forking_bolt: clip(24, 18, 3, (g, f) => {
    fork(g, 2, 9, 21, 9, 'w', 'W', f * 2);
    fork(g, 12, 9, 20, 3, 'c', 'W', f * 2 + 1);
    disc(g, 21, 9, 2, 'W');
  }, 16),

  proj_crypt_forking_bolt_plus: clip(30, 24, 3, (g, f) => {
    fork(g, 2, 12, 27, 12, 'w', 'W', f * 2);
    fork(g, 10, 12, 24, 4, 'c', 'W', f * 2 + 1);
    fork(g, 14, 12, 26, 21, 'c', 'W', f * 2 + 3);
    disc(g, 27, 12, 2.6, 'W'); disc(g, 27, 12, 1.2, 'C');
    for (let i = 0; i < 5; i++) set(g, 4 + i * 5, 12 + ((i + f) % 3 - 1) * 3, 'I');
  }, 18),

  // ── terror terminal: expanding rings, no core ────────────────────────────────
  proj_crypt_terror_wave: clip(28, 22, 3, (g, f) => {
    ring(g, 14, 11, 6 + f * 4, 4 + f * 2.6, 'v', 'x');
    ring(g, 14, 11, 3 + f * 3, 2 + f * 2, 'V', 'x');
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      set(g, 14 + Math.cos(a) * (7 + f * 4), 11 + Math.sin(a) * (5 + f * 2.6), 'H');
    }
  }, 10, false),

  proj_crypt_terror_wave_plus: clip(32, 26, 4, (g, f) => {
    ring(g, 16, 13, 5 + f * 3.4, 3.4 + f * 2.4, 'v', 'x');
    ring(g, 16, 13, 8 + f * 3.4, 5.4 + f * 2.4, 'V', 'x');
    ring(g, 16, 13, 11 + f * 3.4, 7.4 + f * 2.4, 'h', 'H');
    disc(g, 16, 13, 3, 'B');                                  // a screaming skull at the origin
    set(g, 15, 13, 'k'); set(g, 17, 13, 'k');
    for (let x = 15; x <= 17; x += 2) set(g, x, 16, 'b');
  }, 10, false),
};
