// assets/data/fx_abilities.js — the 24 ability clips, one per UnitBehavior.
//
// 40×40, 4 frames. These are the visible half of the work done in BEHAVIOURS.md: each behaviour
// calls `Hero.triggerAbility()` at the moment its effect fires, `Hero.animState()` returns
// "ability", and the renderer plays the matching clip. **The art and the mechanic are the same
// event** — so a clip that does not describe what the behaviour actually does is a lie the player
// will learn from.
//
// ── How 24 clips stay apart ─────────────────────────────────────────────────
// Not by palette. Twenty-four glows in twenty-four colours would be one effect worn 24 times —
// the shared-rig failure again. They are grouped by **what the effect DOES to space**, and inside
// each group by a second, different lever:
//
//   OUTWARD (a thing given or thrown)      banner · taunt · rally · death_blast · gold_steal
//   INWARD  (a thing taken or drawn in)    absorb_heal · death_leech · mutual_heal · resurrect
//   AROUND  (a thing wrapped or enclosed)  reflect · steam_shield · ally_shield · orbiting_charge
//   UPWARD  (a thing rising or ascending)  ascension · sing_notes · vanish · blink_gem
//   OBSCURING (a thing hidden)             sandstorm · darkness_cloud · phase_flicker
//   ON THE GROUND (a thing left behind)    ground_fire · ember_shimmer · blood_frenzy · cleanse
//
// Direction is the primary read and it survives being 40 px on a busy field. Colour is the
// secondary read, for when two clips in one group fire at once.
//
// See lib/fxlib.js for why nothing here carries an ink contour or the NW key light.

import { blank, clip, ring, burst, motes, pillar, bubble, cloud, arc, shimmer, flames, dissolve, FX_LEGEND }
  from './lib/fxlib.js';
import { set, get, line, disc } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'FX · abilities', blurb: 'The 24 ability clips at 40x40, one per UnitBehavior, grouped by what each effect does to space — outward, inward, around, upward, obscuring, or left on the ground — so direction carries the read before colour does.' };

export const LEGEND = {
  '`': null, ...FX_LEGEND,
  m: 'MS2', M: 'MS4', n: 'MS6',                             // rally / nature
  g: 'GD2', G: 'GD4', k: 'GD5',                             // gold, holy
  a: 'AQ2', A: 'AQ4', q: 'IC5',                             // water, steam, shield
  r: 'BL1', R: 'BL3', p: 'GR2',                             // blood
  v: 'HX1', V: 'HX3', w: 'HX5',                             // hex / void
  u: 'UD1', U: 'UD3',                                       // shadow
  x: 'EM2', X: 'EM4', f: 'EM6',                             // fire, embers
  s: 'SD2', S: 'SD4', d: 'SD6',                             // sand
  i: 'IK2', I: 'IK4',                                       // darkness
  y: 'VL1', z: 'VL3',                                       // charge
  b: 'BN2', B: 'BN5',                                       // bone
  t: 'IR3', T: 'IR6',                                       // steel
};

const S = 40, CX = 20, CY = 20, GY = CY + 9;                 // GY = the unit's feet
const F = [0, 1, 2, 3];
const t4 = f => f / 3;

const RALLY = ['m', 'M', 'n'], GOLD = ['g', 'G', 'k'], WATER = ['a', 'A', 'q'];
const BLOOD = ['r', 'R', 'p'], HEX = ['v', 'V', 'w'], SHADE = ['u', 'U', 'w'];
const FIRE = ['x', 'X', 'f'], SAND = ['s', 'S', 'd'], DARK = ['i', 'I', 'U'];
const CHARGE = ['y', 'y', 'z'], BONE = ['b', 'B', 'q'], STEEL = ['t', 'T', 'q'];

// ── OUTWARD: something given, or thrown ─────────────────────────────────────

/** Banner pulse: a calm ground ring. The gentlest outward clip — it is a buff, not a blow. */
const bannerPulse = f => ring(blank(S, S), CX, GY, t4(f), RALLY, { r0: 5, r1: 17, flat: 0.36 });

/** Taunt: a shockwave at CHEST height, thrown fast and hard. Same family, opposite energy. */
const tauntPulse = f => {
  const g = ring(blank(S, S), CX, CY - 2, t4(f), BLOOD, { r0: 3, r1: 19, flat: 0.85, thick: 3 });
  return burst(g, CX, CY - 2, t4(f), BLOOD, { n: 6, r0: 4, r1: 20, len: 3, seed: 3 });
};

/** Rally: three rings staggered in time — a call going out and being answered. */
const rally = f => {
  const g = blank(S, S);
  for (let i = 0; i < 3; i++) {
    const t = (t4(f) + i * 0.33) % 1;
    ring(g, CX, GY, t, GOLD, { r0: 3, r1: 18, flat: 0.36, thick: 1 });
  }
  return g;
};

/** Death blast: everything leaves at once and the centre is left empty. */
const deathBlast = f => {
  const g = blank(S, S);
  const t = t4(f);
  ring(g, CX, CY, t, FIRE, { r0: 2, r1: 20, flat: 0.9, thick: 3 });
  burst(g, CX, CY, t, FIRE, { n: 12, r0: 3, r1: 21, len: 5 - f, seed: 5 });
  if (f === 0) disc(g, CX, CY, 4, 'f');
  return g;
};

/** Gold steal: coins arc AWAY toward the top-right corner — theft has a direction. */
const goldSteal = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 5; i++) {
    const p = Math.min(1, t + i * 0.12);
    const x = Math.round(CX + p * 16), y = Math.round(CY + 4 - p * 20 + Math.sin(p * 3) * 3);
    disc(g, x, y, 2, 'G'); set(g, x, y, 'k'); set(g, x + 1, y + 1, 'g');
  }
  return g;
};

// ── INWARD: something taken, or drawn in ────────────────────────────────────

/** Absorb: motes converge on the unit. The mirror of summon_cast in fx.js, deliberately. */
const converge = (ramp, seed) => f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 10; i++) {
    const ph = 1 - ((t + noise(i, 1, seed)) % 1);
    const a = (i / 10) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * 17 * ph), y = Math.round(CY + Math.sin(a) * 15 * ph);
    set(g, x, y, ph < 0.3 ? ramp[2] : ph < 0.65 ? ramp[1] : ramp[0]);
    if (ph < 0.45) set(g, x, y + 1, ramp[0]);
  }
  return g;
};
const absorbHeal = converge(GOLD, 7);

/** Death leech: arcs reach OUT to corpses and drag life back. Inward, but with visible cables. */
const deathLeech = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const ex = CX + Math.cos(a) * 16, ey = CY + Math.sin(a) * 14;
    arc(g, ex, ey, CX, CY, t, HEX, { jag: 3, seed: 11 + i });
  }
  disc(g, CX, CY, 2 + f, 'v');
  return g;
};

/** Mutual heal: a single cable between two bodies, pulsing both ways. */
const mutualHeal = f => {
  const g = blank(S, S);
  arc(g, 6, CY, S - 7, CY, t4(f), RALLY, { jag: 2, seed: 13 });
  for (const x of [6, S - 7]) { disc(g, x, CY, 3, 'M'); disc(g, x, CY, 1, 'n'); }
  const p = Math.round(6 + (S - 13) * t4(f));
  disc(g, p, CY, 2, 'n');                                    // the packet, visibly travelling
  return g;
};

/** Resurrect: a pillar of light with the body reassembling inside it. */
const resurrect = f => {
  const g = blank(S, S);
  const t = t4(f);
  pillar(g, CX, 4, GY, t, GOLD, { halfW: 6 });
  motes(g, CX, GY, 1 - t, GOLD, { n: 8, spread: 8, rise: 22, seed: 17 });
  for (let dx = -7; dx <= 7; dx++) set(g, CX + dx, GY, 'k');  // the floor it stands back up on
  return g;
};

// ── AROUND: something wrapped, or enclosed ──────────────────────────────────

const reflectFlash = f => {
  const g = bubble(blank(S, S), CX, CY, t4(f), STEEL, { rx: 16, ry: 18 });
  // the reflection: sparks bouncing back OFF the membrane, not passing through it
  for (let i = 0; i < 5; i++) {
    const a = -0.6 + (i / 4) * 1.2;
    const r = 16 - f * 2;
    set(g, Math.round(CX + Math.cos(a) * r), Math.round(CY + Math.sin(a) * r), 'q');
  }
  return g;
};

const steamShield = f => {
  const g = bubble(blank(S, S), CX, CY, t4(f), WATER, { rx: 17, ry: 17 });
  return cloud(g, CX, CY + 4, t4(f), WATER, { rx: 15, ry: 8, seed: 19 });
};

/** Ally shield: the bubble is thrown, so it is OFF-CENTRE and travels. */
const allyShield = f => {
  const g = blank(S, S);
  const t = t4(f);
  const cx = Math.round(8 + t * 22);
  bubble(g, cx, CY, Math.min(1, t * 1.4), WATER, { rx: 11, ry: 13 });
  for (let i = 0; i < 3; i++) set(g, cx - 12 - i * 2, CY, 'a');   // its trail
  return g;
};

/** Orbiting charge: bolts circling at a fixed radius. Around, but never closing. */
const orbitingCharge = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 3; i++) {
    const a = t * Math.PI * 2 + (i / 3) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * 13), y = Math.round(CY + Math.sin(a) * 11);
    disc(g, x, y, 2, 'y'); set(g, x, y, 'z');
    arc(g, x, y, CX, CY, t, CHARGE, { jag: 2, seed: 23 + i });
  }
  return g;
};

// ── UPWARD: something rising ────────────────────────────────────────────────

const ascensionPillar = f => {
  const g = pillar(blank(S, S), CX, 2, GY, t4(f), GOLD, { halfW: 7 });
  return motes(g, CX, GY, t4(f), GOLD, { n: 10, spread: 7, rise: 30, seed: 29 });
};

/** Sing: notes rising in a staggered column — the only clip built from discrete glyphs. */
const singNotes = f => {
  const g = blank(S, S);
  for (let i = 0; i < 4; i++) {
    const ph = (t4(f) + i * 0.25) % 1;
    const x = Math.round(CX - 8 + i * 5 + Math.sin(ph * 5) * 2);
    const y = Math.round(GY - ph * 26);
    disc(g, x, y, 2, 'M');                                   // the note head
    for (let d = 0; d < 5; d++) set(g, x + 2, y - d, 'n');    // its stem
    set(g, x + 3, y - 5, 'n');                                // the flag
  }
  return g;
};

/** Vanish: the body dissolves upward into flecks and the outline is gone by the last frame. */
const vanish = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let y = GY; y > GY - 24; y--) {
    const p = (GY - y) / 24;
    const w = Math.round(5 * (1 - p * 0.5));
    for (let dx = -w; dx <= w; dx++) {
      if (noise(CX + dx, y, 31) < t * 0.9 + p * 0.4) continue;
      set(g, CX + dx, y, p > 0.6 ? SHADE[2] : SHADE[1]);
    }
  }
  return motes(g, CX, GY - 6, t, SHADE, { n: 8, spread: 8, rise: 20, seed: 31 });
};

/** Blink to gem: a departure flash, a trail, and an arrival flash. Two places at once. */
const blinkGem = f => {
  const g = blank(S, S);
  const t = t4(f);
  burst(g, 9, CY + 4, Math.min(1, t * 2), HEX, { n: 7, r0: 1, r1: 9, len: 3, seed: 37 });
  const ax = Math.round(9 + t * 22);
  for (let i = 0; i < 6; i++) set(g, Math.round(9 + (ax - 9) * (i / 6)), CY + 4 - i, 'v');
  if (t > 0.4) burst(g, 31, CY - 4, (t - 0.4) / 0.6, HEX, { n: 7, r0: 1, r1: 10, len: 3, seed: 41 });
  return g;
};

// ── OBSCURING: something hidden ─────────────────────────────────────────────

const sandstorm = f => {
  const g = cloud(blank(S, S), CX, CY, t4(f), SAND, { rx: 19, ry: 13, seed: 43 });
  for (let i = 0; i < 14; i++) {                             // streaks, all running one way
    const y = Math.round(4 + noise(i, 1, 47) * 32);
    const x = Math.round(((noise(i, 2, 47) + t4(f)) % 1) * 36);
    for (let d = 0; d < 4; d++) set(g, x + d, y, d === 3 ? 'd' : 'S');
  }
  return g;
};

const darknessCloud = f => {
  const g = cloud(blank(S, S), CX, CY, t4(f), DARK, { rx: 18, ry: 15, seed: 53 });
  for (let i = 0; i < 4; i++) {                              // eyes opening inside it
    const a = (i / 4) * Math.PI * 2 + t4(f);
    const x = Math.round(CX + Math.cos(a) * 8), y = Math.round(CY + Math.sin(a) * 6);
    if (f > 0) { set(g, x, y, 'w'); set(g, x - 1, y, 'v'); set(g, x + 1, y, 'v'); }
  }
  return g;
};

/** Phase flicker: the silhouette is there, gone, there, gone. Obscuring by absence. */
const phaseFlicker = f => {
  const g = blank(S, S);
  for (let y = CY - 12; y <= GY; y++)
    for (let x = CX - 6; x <= CX + 6; x++) {
      if ((y + f) % 3 === 0) continue;                        // the scanline gap IS the effect
      set(g, x, y, noise(x, y, 59) > 0.6 ? SHADE[1] : SHADE[0]);
    }
  return dissolve(g, f % 2 ? 0.5 : 0.15, 61);
};

// ── ON THE GROUND: something left behind ────────────────────────────────────

const groundFire = f => {
  const g = flames(blank(S, S), CX, GY, t4(f), FIRE, { n: 7, spread: 15, h: 13, seed: 67 });
  for (let dx = -16; dx <= 16; dx++)                          // the scorched footprint
    if (noise(dx, 0, 71) > 0.35) set(g, CX + dx, GY + 1, 'x');
  return g;
};

const emberShimmer = f => {
  const g = shimmer(blank(S, S), CX, CY + 2, t4(f), FIRE, { rx: 16, ry: 12, n: 16, seed: 73 });
  return ring(g, CX, GY, t4(f) * 0.5, FIRE, { r0: 8, r1: 15, flat: 0.35, thick: 1 });
};

/** Blood frenzy: spatter on the floor and a rising heat haze. Stays low and stays put. */
const bloodFrenzy = f => {
  const g = blank(S, S);
  const t = t4(f);
  for (let i = 0; i < 12; i++) {
    const a = noise(i, 1, 79) * Math.PI * 2, r = 5 + noise(i, 2, 79) * 12;
    const x = Math.round(CX + Math.cos(a) * r), y = Math.round(GY + Math.sin(a) * r * 0.35);
    set(g, x, y, noise(i, 3, 79) > 0.5 ? 'R' : 'r');
  }
  for (let i = 0; i < 5; i++) {
    const ph = (t + i * 0.2) % 1;
    set(g, Math.round(CX - 8 + i * 4 + Math.sin(ph * 6) * 2), Math.round(GY - ph * 14), 'p');
  }
  return g;
};

/** Cleanse: a ring that CONTRACTS — sweeping something off rather than pushing it out. */
const cleanseFlash = f => {
  const g = blank(S, S);
  const t = 1 - t4(f);                                       // note the inversion
  ring(g, CX, CY, t, WATER, { r0: 3, r1: 18, flat: 0.75, thick: 2 });
  if (f === 3) disc(g, CX, CY, 3, 'q');
  return g;
};

export const SPRITES = {
  // outward
  fx_banner_pulse: clip(F.map(bannerPulse), 12, true),
  fx_taunt_pulse: clip(F.map(tauntPulse), 16),
  fx_rally: clip(F.map(rally), 12, true),
  fx_death_blast: clip(F.map(deathBlast), 16),
  fx_gold_steal: clip(F.map(goldSteal), 14),
  // inward
  fx_absorb_heal: clip(F.map(absorbHeal), 12),
  fx_death_leech: clip(F.map(deathLeech), 14),
  fx_mutual_heal: clip(F.map(mutualHeal), 12, true),
  fx_resurrect: clip(F.map(resurrect), 10),
  // around
  fx_reflect_flash: clip(F.map(reflectFlash), 16),
  fx_steam_shield: clip(F.map(steamShield), 12, true),
  fx_ally_shield: clip(F.map(allyShield), 14),
  fx_orbiting_charge: clip(F.map(orbitingCharge), 14, true),
  // upward
  fx_ascension_pillar: clip(F.map(ascensionPillar), 10),
  fx_sing_notes: clip(F.map(singNotes), 10, true),
  fx_vanish: clip(F.map(vanish), 14),
  fx_blink_gem: clip(F.map(blinkGem), 16),
  // obscuring
  fx_sandstorm: clip(F.map(sandstorm), 12, true),
  fx_darkness_cloud: clip(F.map(darknessCloud), 10, true),
  fx_phase_flicker: clip(F.map(phaseFlicker), 16, true),
  // left on the ground
  fx_ground_fire: clip(F.map(groundFire), 12, true),
  fx_ember_shimmer: clip(F.map(emberShimmer), 10, true),
  fx_blood_frenzy: clip(F.map(bloodFrenzy), 12, true),
  fx_cleanse_flash: clip(F.map(cleanseFlash), 14),
};
