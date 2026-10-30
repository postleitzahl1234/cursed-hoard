// assets/data/fx.js — the seven status/state overlays that ride on a unit.
//
// 40×40, 4 frames. These are the clips that sit ON TOP of a troop the player is trying to read,
// so every one of them is **open in the middle**. That is the constraint the whole file is built
// around: a filled 40×40 glow is a sticker over the unit, and the player then cannot see what is
// under it or how much health it has left.
//
// Each is separated by MOTION, not by colour, so a colourblind player still gets the reading:
//
//   support_aura    a flat ground ring EXPANDING outward — a thing being given
//   shield_bubble   a membrane CLOSING inward — a thing being kept out
//   summon_cast     motes RISING out of the floor
//   heal_glow       motes rising too, but slower and converging — the inverse of summon
//   burn            tongues licking UP from the feet
//   freeze          crystal spurs growing INWARD from the frame edge
//   stun_overlay    sparks ORBITING above the head
//
// See lib/fxlib.js for why these deliberately carry no ink contour and no NW key light.

import { blank, clip, ring, motes, bubble, flames, shimmer, FX_LEGEND } from './lib/fxlib.js';
import { set } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'FX · status', blurb: 'Seven unit overlays at 40x40, every one open in the middle so the troop underneath stays readable, and each separated by its motion rather than its colour.' };

export const LEGEND = {
  '`': null, ...FX_LEGEND,
  m: 'MS2', M: 'MS4', n: 'MS6',                             // rally green
  a: 'AQ2', A: 'AQ4', q: 'IC5',                             // shield blue
  v: 'HX1', V: 'HX3', w: 'HX5',                             // summon violet
  g: 'GD2', G: 'GD4', k: 'GD5',                             // heal gold
  x: 'EM2', X: 'EM4', f: 'EM6',                             // fire
  i: 'IC1', I: 'IC3', Q: 'IC5',                             // frost
  y: 'VL0', Y: 'VL1', z: 'VL3',                             // stun spark
};

const S = 40, CX = 20, CY = 20;
const F = [0, 1, 2, 3];
const t4 = f => f / 3;

const RALLY = ['m', 'M', 'n'], SHIELD = ['a', 'A', 'q'], SUMMON = ['v', 'V', 'w'];
const HEAL = ['g', 'G', 'k'], FIRE = ['x', 'X', 'f'], FROST = ['i', 'I', 'Q'], STUN = ['y', 'Y', 'z'];

/** Ground rings are ELLIPSES. A circle here reads as a halo floating in the air, not a footprint. */
const supportAura = f => ring(blank(S, S), CX, CY + 8, t4(f), RALLY, { r0: 4, r1: 18, flat: 0.38 });

const shieldBubble = f => bubble(blank(S, S), CX, CY, t4(f), SHIELD, { rx: 15, ry: 17 });

const summonCast = f => {
  const g = blank(S, S);
  ring(g, CX, CY + 10, t4(f) * 0.6, SUMMON, { r0: 3, r1: 12, flat: 0.35, thick: 1 });
  return motes(g, CX, CY + 10, t4(f), SUMMON, { n: 11, spread: 11, rise: 24, seed: 3 });
};

// Heal is summon's inverse: the motes CONVERGE on the unit instead of escaping it.
const healGlow = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 9; i++) {
    const ph = 1 - ((t + noise(i, 2, 7)) % 1);              // 1 → 0: inward
    const a = (i / 9) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * 15 * ph), y = Math.round(CY + Math.sin(a) * 13 * ph - 2);
    set(g, x, y, ph < 0.3 ? HEAL[2] : ph < 0.65 ? HEAL[1] : HEAL[0]);
    if (ph < 0.4) { set(g, x, y - 1, HEAL[0]); set(g, x + 1, y, HEAL[0]); }
  }
  // a cross at the centre, only on the two middle frames, so it reads as a heal and not a buff
  if (f === 1 || f === 2) {
    for (let d = -3; d <= 3; d++) { set(g, CX + d, CY - 2, HEAL[2]); set(g, CX, CY - 2 + d, HEAL[2]); }
  }
  return g;
};

const burn = f => flames(blank(S, S), CX, CY + 14, t4(f), FIRE, { n: 5, spread: 9, h: 16, seed: 11 });

// Frost grows INWARD from the frame edge, which is the opposite of every other clip here and
// the reason it reads as something closing on the unit rather than radiating from it.
const freeze = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const len = Math.round(6 + 8 * t);
    for (let d = 0; d < len; d++) {
      const r = 19 - d;
      const x = Math.round(CX + Math.cos(a) * r), y = Math.round(CY + Math.sin(a) * r * 0.9);
      set(g, x, y, d < 2 ? FROST[0] : d > len - 3 ? FROST[2] : FROST[1]);
      if (d === Math.floor(len * 0.5)) {                     // barbs
        set(g, Math.round(x + Math.cos(a + 1.2) * 2), Math.round(y + Math.sin(a + 1.2) * 2), FROST[1]);
        set(g, Math.round(x + Math.cos(a - 1.2) * 2), Math.round(y + Math.sin(a - 1.2) * 2), FROST[1]);
      }
    }
  }
  return shimmer(g, CX, CY, t, FROST, { rx: 10, ry: 10, n: 6, seed: 13 });
};

// Stun orbits ABOVE the head. Nothing else in the set occupies that band, so it never competes
// with a health bar or a carried gem.
const stunOverlay = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i / 4) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * 11), y = Math.round(8 + Math.sin(a) * 4);
    set(g, x, y, STUN[2]);
    set(g, x - 1, y, STUN[1]); set(g, x + 1, y, STUN[1]);
    set(g, x, y - 1, STUN[1]); set(g, x, y + 1, STUN[1]);
    set(g, x - 2, y, STUN[0]); set(g, x + 2, y, STUN[0]);
  }
  return g;
};

export const SPRITES = {
  fx_support_aura: clip(F.map(supportAura), 12, true),
  fx_shield_bubble: clip(F.map(shieldBubble), 12, true),
  fx_summon_cast: clip(F.map(summonCast), 14),
  fx_heal_glow: clip(F.map(healGlow), 12),
  fx_burn: clip(F.map(burn), 14, true),
  fx_freeze: clip(F.map(freeze), 10, true),
  fx_stun_overlay: clip(F.map(stunOverlay), 14, true),
};
