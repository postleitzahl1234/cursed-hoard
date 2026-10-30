// projectiles/demon.js — the 12 DEMON projectiles.
//
// Two of these are not really projectiles. The BEAM tiers are drawn live by the engine as a
// stretched quad from tower to victim (`drawBeamsAndAuras`), and it uses this sprite for the
// IMPACT GLOW at the far end. The NOVA/aura tiers use theirs as the ground ring the engine
// scales to the tower's radius. Both are authored accordingly — an impact burst and a ring —
// rather than as things that fly.

import { grid, set, ellipse, disc, line, rows, ramp, orb, trail, ring, shot, clip } from './_proj_lib.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',
  z: 'IK1', Z: 'IK4',                                   // obsidian
  e: 'EM0', E: 'EM2', f: 'EM3', F: 'EM5', x: 'EM6', X: 'EM7',
  o: 'DM0', O: 'DM2', h: 'DM4',                         // demon hide / basalt shell
  b: 'BL1', B: 'BL3',                                   // blood
  r: 'RK1', R: 'RK3',
};

const BASALT = ramp(['o', 'O', 'h']);

export const SPRITES = {
  // ── ember line ──────────────────────────────────────────────────────────────
  proj_demon_ember_puff: clip(12, 12, 3, (g, f) => {
    orb(g, 6, 6, 2.6 + f * 0.4, 'e', 'f', 'x');
    for (let i = 0; i < 3; i++) set(g, 2 + i, 6 + ((i + f) % 3 - 1), 'E');
  }, 10),

  proj_demon_flame_burst: clip(16, 14, 3, (g, f) => {
    orb(g, 9, 7, 4, 'e', 'f', 'X');
    trail(g, 5, 7, 5, ['F', 'f', 'E', 'e']);
    for (let i = 0; i < 4; i++) set(g, 12 + (i % 2), 7 + ((i + f) % 5 - 2), 'x');
  }, 12),

  // ── beam line: these are IMPACT bursts, the beam itself is engine-drawn ──────
  proj_demon_focused_flame_beam: clip(16, 16, 2, (g, f) => {
    orb(g, 8, 8, 5 - f, 'e', 'f', 'X');
    for (let a = f * 22; a < 360; a += 45) {
      const r = a * Math.PI / 180;
      line(g, 8 + Math.cos(r) * 4, 8 + Math.sin(r) * 4, 8 + Math.cos(r) * 7, 8 + Math.sin(r) * 7, 'F');
    }
  }, 14),

  proj_demon_lance_beam: clip(20, 20, 2, (g, f) => {
    orb(g, 10, 10, 6 - f, 'e', 'f', 'X');
    ellipse(g, 10, 10, 8 - f, 3 - f * 0.5, 'F');            // a flattened lance-strike flare
    for (let i = 0; i < 6; i++) set(g, 10 + Math.cos(i) * 9, 10 + Math.sin(i) * 9, 'x');
  }, 14),

  proj_demon_piercing_ray: clip(24, 24, 2, (g, f) => {
    orb(g, 12, 12, 7 - f, 'e', 'f', 'X');
    ellipse(g, 12, 12, 10 - f, 4, 'F');
    ellipse(g, 12, 12, 4, 10 - f, 'F');                      // a cross-flare: it went through
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + f * 0.4;
      set(g, 12 + Math.cos(a) * 11, 12 + Math.sin(a) * 11, 'x');
    }
  }, 14),

  proj_demon_piercing_ray_plus: clip(28, 28, 3, (g, f) => {
    orb(g, 14, 14, 8 - f, 'e', 'f', 'X');
    ellipse(g, 14, 14, 12 - f, 5, 'F');
    ellipse(g, 14, 14, 5, 12 - f, 'F');
    ring(g, 14, 14, 10 + f * 2, 10 + f * 2, 'E', 'x');       // heat-haze shell
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - f * 0.3;
      set(g, 14 + Math.cos(a) * 13, 14 + Math.sin(a) * 13, 'X');
    }
  }, 14),

  // ── pyre line: ground rings, scaled by the engine to the aura radius ─────────
  proj_demon_flame_nova: clip(24, 18, 3, (g, f) => {
    ring(g, 12, 9, 8 + f, 5 + f * 0.7, 'E', 'x');
    ring(g, 12, 9, 5 + f, 3 + f * 0.6, 'f', 'X');
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + f * 0.3;
      for (let j = 0; j < 3; j++) set(g, 12 + Math.cos(a) * (8 + f), 9 + Math.sin(a) * (5 + f * 0.7) - j, j > 1 ? 'X' : 'F');
    }
  }, 10),

  proj_demon_wide_flame_nova: clip(30, 22, 3, (g, f) => {
    ring(g, 15, 11, 12 + f, 8 + f * 0.7, 'E', 'x');
    ring(g, 15, 11, 8 + f, 5 + f * 0.6, 'f', 'X');
    ring(g, 15, 11, 4 + f, 2.6 + f * 0.5, 'F', 'X');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - f * 0.25;
      for (let j = 0; j < 4; j++) set(g, 15 + Math.cos(a) * (12 + f), 11 + Math.sin(a) * (8 + f * 0.7) - j, j > 2 ? 'X' : 'F');
    }
  }, 10),

  proj_demon_continuous_burn_field: clip(28, 20, 4, (g, f) => {
    ellipse(g, 14, 10, 12, 8, 'e');
    ellipse(g, 14, 10, 9, 6, 'E');
    for (let i = 0; i < 14; i++) {                            // churning pool, not a ring
      const a = (i / 14) * Math.PI * 2 + f * 0.5, r = 3 + (i % 4) * 2.2;
      disc(g, 14 + Math.cos(a) * r, 10 + Math.sin(a) * r * 0.66, 1.4, i % 3 ? 'f' : 'x');
    }
  }, 8),

  proj_demon_continuous_burn_field_plus: clip(34, 24, 4, (g, f) => {
    ellipse(g, 17, 12, 16, 10, 'e');
    ellipse(g, 17, 12, 12, 7.5, 'E');
    ellipse(g, 17, 12, 7, 4.5, 'f');
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2 - f * 0.4, r = 3 + (i % 5) * 2.6;
      disc(g, 17 + Math.cos(a) * r, 12 + Math.sin(a) * r * 0.66, 1.6, i % 3 ? 'x' : 'X');
    }
    for (let i = 0; i < 6; i++) {                             // fountains standing out of it
      const a = (i / 6) * Math.PI * 2 + f * 0.3;
      const fx = 17 + Math.cos(a) * 12, fy = 12 + Math.sin(a) * 8;
      for (let j = 0; j < 4; j++) set(g, fx, fy - j, j > 2 ? 'X' : 'F');
    }
  }, 8),

  // ── mortar shared: an actual thrown object, unlike the rest of the faction ───
  proj_demon_firebomb_ground_patch: clip(16, 16, 2, (g, f) => {
    shot(g, 7, 8, 5, BASALT);
    for (const [dx, dy] of [[-2, -1], [1, 2], [3, -2]]) set(g, 7 + dx, 8 + dy, f ? 'x' : 'f');
    trail(g, 2, 8, 3, ['F', 'E']);
    set(g, 5, 5, 'h');
  }, 10),

  proj_demon_lava_splash_ground_patch: clip(22, 20, 2, (g, f) => {
    shot(g, 10, 10, 7, BASALT);
    for (let i = 0; i < 7; i++) {                             // molten cracks across the shell
      const a = (i / 7) * Math.PI * 2 + f * 0.4;
      line(g, 10, 10, 10 + Math.cos(a) * 6.5, 10 + Math.sin(a) * 6.5, i % 2 ? 'f' : 'x');
    }
    trail(g, 3, 10, 5, ['X', 'F', 'f', 'E']);
    for (let i = 0; i < 4; i++) disc(g, 17 + i, 10 + ((i + f) % 3 - 1) * 3, 1.2, 'F');
  }, 10),
};
