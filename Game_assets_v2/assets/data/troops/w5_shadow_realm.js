// troops/w5_shadow_realm.js — W5 SHADOW REALM · demons, undead and shadow. 9 archetypes.
// (The tenth, the Hellhound, was the pilot and lives in `w5_hellhound.js`.)
//
// Faint W5 thread: near-black shrouds and hide, a CURSE-VIOLET accent, ember for the demonic
// half, a rune-eye stamped small. This is the only world whose units are darker than the ground
// they walk on, so D-22(d)'s rim light stops being decoration and becomes the thing that keeps
// them visible at all.
//
// D-28 sanctions exactly one reuse in the whole game, and it is here: the Demon Shadow King is
// **the King corrupted**, so his silhouette deliberately echoes W4's boss.

import { overlay, erase } from '../lib/draw.js';
import { grid, set, disc, ellipse, line, poly, clone } from '../lib/pixel.js';
import { W5 } from './_worlds.js';
import { clip, finish, SIZE, fxVanish, fxShield, fxSummon, fxHeal, fxInvulnShimmer } from './_troop_lib.js';

export const LEGEND = W5.legend;
const FIN = { rimCh: 'o', skip: 'kKqQ12345', aoFrom: 'cde', aoCh: 'a' };
const S = SIZE.normal, GR = 28;

/** A shroud that dissolves at the hem instead of ending — the W5 body treatment. */
function shroud(g, cx, top, bottom, halfTop, halfBot, r3, fray = 5) {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const half = Math.round(halfTop + (halfBot - halfTop) * t);
    for (let x = -half; x <= half; x++) {
      if (t > 0.75 && (x + y * 3) % 4 === 0) continue;                      // fraying
      const u = (x + half) / (2 * half || 1);
      set(g, cx + x, y, u < 0.24 ? r3[2] : u > 0.76 ? r3[0] : r3[1]);
    }
  }
  for (let i = 0; i < fray; i++) set(g, cx - halfBot + i * 2, bottom + (i % 2), r3[0]);
}

// 1 · SHADOW WRAITH — no legs, no feet. It ends in a torn hem hanging above the ground, and it
// is the only unit whose lower half you can see through. [Untargetable]
function shadowWraith(drift, ab = -1) {
  const g = grid(S, S);
  const y0 = 8 + [0, -1, 0, 1][drift];
  shroud(g, 16, y0, 25, 5, 8, ['a', 'c', 'd'], 7);
  for (let i = 0; i < 9; i++) set(g, 10 + i * 1.6, 25 + ((i + drift) % 3), 'a');
  disc(g, 16, y0 + 4, 3, 'k');                                                // hollow cowl
  set(g, 15, y0 + 4, 'o'); set(g, 18, y0 + 4, 'o');                            // two eye-lights
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++)                          // reaching arms
    set(g, 16 + s * (6 + i), y0 + 8 + Math.round(i * 0.7), i > 3 ? 'u' : 'c');
  W5.motif(g, 16, y0 + 11, 'M');
  const out = finish(g, { ...FIN, ground: 28, shadowW: 0 });
  for (let x = -5; x <= 5; x++) if (x * x <= 25) set(out, 16 + x, 29, 'q');
  if (ab >= 0) fxVanish(out, ab, 4, 16, y0 + 8, 'o');
  return out;
}

// 2 · CURSED SOLDIER — W1 plate that kept walking after the man inside stopped: split helm,
// a hole through the breastplate, violet light leaking out of both.
function cursedSoldier(pose, bob) {
  const g = grid(S, S);
  overlay(g, [
    [10, 13, 'nRRRn'], [11, 13, 'nRoRn'], [12, 13, 'nR`Rn'],                   // split helm, glowing
    [13, 13, 'nRRRn'], [14, 14, 'nRn'],
    [15, 10, 'nRRRRRRRn'], [16, 9, 'nRRRRRRRRRn'], [17, 9, 'nRRRRRRRRRn'],
    [18, 10, 'nRRRRRRRn'],
  ]);
  disc(g, 16, 17, 2.4, 'k'); disc(g, 16, 17, 1.2, 'o');                         // the hole
  overlay(g, [[19, 11, 'nRRRRRn'], [20, 11, 'nRRRRRn'], [21, 11, 'nRRRRRn']]);
  for (let y = 12; y <= 22; y++) { set(g, 7, y, 'n'); set(g, 8, y, 'R'); }      // notched blade
  poly(g, [[6, 8], [9, 8], [7, 4]], 'R'); set(g, 8, 6, 'a');
  W5.motif(g, 21, 20, 'M');
  const legs = pose === 0
    ? [[22, 12, 'nR`Rn'], [23, 12, 'nR`Rn'], [24, 11, 'nR``Rn'], [25, 11, 'nR``Rn'],
       [26, 11, 'nR``Rn'], [27, 10, 'nR```Rn'], [28, 10, 'nn```nn']]
    : [[22, 13, 'nRRn'], [23, 13, 'nRRn'], [24, 13, 'nRRn'], [25, 13, 'nRRn'],
       [26, 13, 'nRRn'], [27, 13, 'nRRn'], [28, 12, 'nnnn']];
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 8, S, 14);
    for (let y = 8; y < 22; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 3 · IMP SWARM — not one creature but FIVE, scattered across the canvas. The only unit in the
// game with no single body. Fire-resistant, not immune (D-17). [WaterborneFlight]
function impSwarm(beat) {
  const g = grid(S, S);
  const imps = [[8, 12], [17, 8], [24, 14], [12, 20], [22, 22]];
  imps.forEach(([ix, iy], n) => {
    const bob = [0, -1, -2, -1][(beat + n) % 4];
    ellipse(g, ix, iy + bob, 2.6, 2.2, 'h');                                    // little body
    set(g, ix + 1, iy + bob - 1, 'x');                                          // ember eye
    for (const s of [-1, 1]) {                                                   // bat wings
      const w = ((beat + n) % 2) ? 3 : 4;
      for (let i = 0; i < w; i++) set(g, ix + s * (2 + i), iy + bob - 1 - i, i > 1 ? 'H' : 'h');
    }
    set(g, ix, iy + bob + 3, 'h'); set(g, ix + 1, iy + bob + 4, 'a');            // tail
  });
  const out = finish(g, { ...FIN, ground: 30, shadowW: 0, rimCh: 'X' });
  for (const [ix] of imps) for (let x = -2; x <= 2; x++) set(out, ix + x, 30, 'q');
  return out;
}

// 4 · VOID PRIEST — hovers. A tall crooked staff, a hood with nothing in it, and a ring of
// bound souls orbiting his waist. [Resurrect]
function voidPriest(drift, ab = -1) {
  const g = grid(S, S);
  const y0 = 6 + [0, -1, 0, 1][drift];
  for (let y = y0 + 2; y <= 26; y++) set(g, 24, y, 'c');                        // crooked staff
  for (let i = 0; i < 4; i++) set(g, 24 - i, y0 + 1 - i, 'a');
  disc(g, 21, y0 - 3, 2.4, 'M'); disc(g, 21, y0 - 3, 1.2, 'o');
  shroud(g, 15, y0 + 2, 26, 5, 9, ['a', 'c', 'd'], 6);
  disc(g, 15, y0 + 6, 3.4, 'k'); set(g, 14, y0 + 6, 'M'); set(g, 17, y0 + 6, 'M');
  for (let i = 0; i < 5; i++) {                                                  // bound souls
    const a = (i / 5) * Math.PI * 2 + drift * 0.5;
    disc(g, 15 + Math.cos(a) * 9, y0 + 14 + Math.sin(a) * 3.4, 1.4, 'u');
    set(g, 15 + Math.cos(a) * 9, y0 + 14 + Math.sin(a) * 3.4, 'p');
  }
  W5.motif(g, 15, y0 + 11, 'M');
  const out = finish(g, { ...FIN, ground: 28, shadowW: 0 });
  for (let x = -5; x <= 5; x++) if (x * x <= 25) set(out, 15 + x, 29, 'q');
  if (ab >= 0) fxHeal(out, ab, 4, 15, y0 + 10, 'o');
  return out;
}

// 5 · ABYSSAL BEHEMOTH — a six-legged mass of hide with a ridged back and a jawless maw.
// Bigger and heavier than W3's Dune Behemoth, and built on a different animal. [Mounted]
function abyssalBehemoth(gait) {
  const g = grid(S, S);
  const lift = [0, -1, 0, -1][gait];
  ellipse(g, 16, 19 + lift, 14, 7, 'h');                                         // vast body
  ellipse(g, 13, 17 + lift, 9, 4.4, 'H');
  for (let i = 0; i < 7; i++) {                                                   // dorsal ridge
    const rx = 6 + i * 3.4;
    for (let j = 0; j < 4 + (i % 3); j++) set(g, rx, 12 + lift - j, j > 2 ? 'y' : 'H');
  }
  poly(g, [[28, 20 + lift], [32, 16 + lift], [32, 24 + lift], [27, 24 + lift]], 'h');
  for (let x = 27; x <= 31; x += 2) set(g, x, 22 + lift, 'k');                    // maw teeth
  set(g, 29, 17 + lift, 'x'); set(g, 31, 18 + lift, 'x');                         // ember eyes
  for (const [lx, ly] of [[5, 25], [10, 26], [15, 25], [19, 26], [24, 25], [27, 26]])
    for (let j = 0; j < 3; j++) set(g, lx, ly + j + lift, j > 1 ? 'k' : 'h');
  for (let i = 0; i < 5; i++) set(g, 3 - i * 0.5, 20 + i + lift, 'H');            // tail
  W5.motif(g, 12, 21 + lift, 'M');
  return finish(g, { ...FIN, ground: GR, shadowW: 15, rimCh: 'y' });
}

// 6 · SOUL EATER — gaunt and TOO TALL, with four arms and a distended ribcage. The most
// disturbing outline in the roster and the only one with more than two limbs. [DeathLeech]
function soulEater(pose, ab = -1) {
  const g = grid(S, S);
  overlay(g, [
    [4, 14, 'uuu'], [5, 13, 'uupuu'], [6, 13, 'ukpku'], [7, 14, 'upu'],           // narrow skull
  ]);
  for (let y = 8; y <= 20; y++) {                                                  // ribcage torso
    const half = 4 - Math.round(Math.abs(y - 14) * 0.2);
    for (let x = -half; x <= half; x++) set(g, 16 + x, y, y % 3 === 0 ? 'p' : 'u');
  }
  for (const [s, y0, len] of [[-1, 10, 9], [1, 10, 9], [-1, 15, 11], [1, 15, 11]]) {
    for (let i = 0; i < len; i++)                                                   // four long arms
      set(g, 16 + s * (4 + i), y0 + Math.round(i * (pose ? 0.8 : 0.5)), i > len - 3 ? 'M' : 'u');
  }
  shroud(g, 16, 20, 27, 4, 7, ['a', 'c', 'd'], 4);
  W5.motif(g, 16, 23, 'o');
  overlay(g, pose === 0 ? [[28, 13, 'uu``uu']] : [[28, 14, 'uuuu']]);
  if (ab >= 0) for (let i = 0; i < 8; i++) {                                         // souls drawn in
    const a = (i / 8) * Math.PI * 2 - ab * 0.6, r = 12 - ab * 2;
    set(g, 16 + Math.cos(a) * r, 16 + Math.sin(a) * r * 0.7, i % 2 ? 'o' : 'M');
  }
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 7 · GEM SHADE — a silhouette with a hole where the chest should be, carrying a stolen glimmer.
// Blinks toward the cave (D-09). [BlinkToGem]
function gemShade(drift, ab = -1) {
  const g = grid(S, S);
  const y0 = 9 + [0, -1, -2, -1][drift];
  poly(g, [[16, y0], [22, y0 + 8], [20, y0 + 16], [12, y0 + 16], [10, y0 + 8]], 'a');
  poly(g, [[16, y0], [22, y0 + 8], [16, y0 + 9]], 'c');
  disc(g, 16, y0 + 9, 3.4, 'k');                                                   // the hole
  disc(g, 16, y0 + 9, 1.8, 'M'); set(g, 16, y0 + 9, 'o');                          // the stolen light
  set(g, 14, y0 + 4, 'o'); set(g, 18, y0 + 4, 'o');
  for (let i = 0; i < 7; i++) set(g, 11 + i * 1.6, y0 + 17 + ((i + drift) % 2), 'a');
  W5.motif(g, 16, y0 + 13, 'M');
  const out = finish(g, { ...FIN, ground: 28, shadowW: 0 });
  for (let x = -4; x <= 4; x++) if (x * x <= 16) set(out, 16 + x, 29, 'q');
  if (ab >= 0) fxVanish(out, ab, 4, 16, y0 + 9, 'o');
  return out;
}

// 8 · DOOM KNIGHT (champion, 44) — black plate with a horned sallet and a two-handed blade
// almost as tall as he is. [ShieldMode]
function doomKnight(pose, bob, ab = -1) {
  const C = SIZE.champion, G2 = 39;
  const g = grid(C, C);
  for (const s of [-1, 1]) for (let j = 0; j < 8; j++)                              // great horns
    set(g, 22 + s * (5 + j), 16 - Math.round(j * 1.1), j > 5 ? 'y' : 'n');
  overlay(g, [
    [16, 18, 'nRRRRn'], [17, 18, 'nRooRn'], [18, 18, 'nRRRRn'], [19, 19, 'nRRn'],
    [20, 14, 'nRRRRRRRRRRn'], [21, 13, 'nRRRRRRRRRRRRn'],
    [22, 13, 'nRRRRRRRRRRRRn'], [23, 14, 'MMMMMMMMMMMM'],
    [24, 14, 'nRRRRRRRRRRn'], [25, 15, 'nRRRRRRRRn'],
  ]);
  for (let y = 4; y <= 26; y++) { set(g, 34, y, 'n'); set(g, 35, y, 'R'); set(g, 36, y, 'n'); }
  poly(g, [[33, 4], [37, 4], [35, -1]], 'R');
  for (let x = 32; x <= 38; x++) set(g, x, 27, 'M');
  W5.motif(g, 28, 24, 'o');
  const legs = [];
  for (let y = 26; y <= 38; y++) {
    const t = (y - 26) / 12;
    if (pose === 0) legs.push([y, 18 - Math.round(t * 2), 'nRR' + '`'.repeat(Math.round(t * 5) + 2) + 'RRn']);
    else legs.push([y, 19, 'nRRRRRn']);
  }
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 12, C, 14);
    for (let y = 12; y < 26; y++) for (let x = 0; x < C; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) fxShield(g, ab, 4, 22, 24, 'M', 'o');
  return finish(g, { ...FIN, ground: G2, shadowW: 11 });
}

// 9 · DEMON SHADOW KING (boss, 56) — **the King corrupted.** D-28's single sanctioned reuse:
// the same enthroned mantle and great crown as W4's King, but the velvet has gone to void, the
// gold to hex-violet, and horns have grown through the crown. Recognising him as the same man
// is the point. [MultiPhase]
function shadowKing(pose, bob, ab = -1) {
  const B = SIZE.boss, G3 = 50;
  const g = grid(B, B);
  for (let y = 20; y <= 48; y++) {                                                   // the same mantle...
    const w = 12 + Math.round((y - 20) * 0.72);
    for (let x = 28 - w; x <= 28 + w; x++) {
      const u = (x - (28 - w)) / (2 * w);
      if (y > 42 && (x + y * 3) % 5 === 0) continue;                                  // ...now fraying
      set(g, x, y, u < 0.2 ? 'd' : u > 0.8 ? 'a' : 'c');
    }
  }
  for (let y = 24; y <= 46; y += 5) for (let x = -20; x <= 20; x++)
    set(g, 28 + x, y, (x + y) % 6 ? 'a' : 'M');
  for (const s of [-1, 1]) for (let j = 0; j < 12; j++)                               // horns through the crown
    set(g, 28 + s * (8 + j), 20 - Math.round(j * 1.3), j > 8 ? 'x' : 'h');
  overlay(g, [
    [12, 22, 'M`M`M`M`M'], [13, 21, 'MooooooooM'], [14, 21, 'oMMMMMMMMMo'],
    [15, 22, 'ccdddddcc'], [16, 23, 'c`````c'],                                        // the face is gone
    [17, 23, 'c`oo`c'], [18, 24, 'c````'],
    [19, 18, 'ccddddddddddcc'], [20, 17, 'ccMMMMMMMMMMMMcc'],
    [21, 18, 'ccddddddddddcc'],
  ]);
  for (let y = 24; y <= 40; y++) set(g, 45, y, 'c');                                    // blighted sceptre
  disc(g, 45, 22, 2.6, 'M'); disc(g, 45, 22, 1.2, 'x');
  disc(g, 11, 28, 3.4, 'k'); disc(g, 11, 28, 1.8, 'o');                                 // the void orb
  W5.motif(g, 28, 32, 'o');
  if (bob) { const src = clone(g); erase(g, 0, 10, B, 12);
    for (let y = 10; y < 22; y++) for (let x = 0; x < B; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) { fxSummon(g, ab, 4, 28, G3 - 4, 'M', 'o'); fxInvulnShimmer(g, ab, 4, 28, 30, 'o', 'M'); }
  return finish(g, { ...FIN, ground: G3, shadowW: 20 });
}

function fell(painter, step, ground) {
  const g = painter, sink = [0, 4, 9][step];
  const out = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.px[y][x] === '`' || 'qQ'.includes(g.px[y][x])) continue;
    const t = Math.max(0, (ground - y) / ground);
    out.px[Math.min(g.h - 1, y + Math.round(sink * t * 1.6))][Math.max(0, x - Math.round(sink * t * 0.9))] = g.px[y][x];
  }
  return finish(out, { ground, shadowW: 9 });
}
const D = (fn, ground = GR) => clip([fell(fn, 0, ground), fell(fn, 1, ground), fell(fn, 2, ground)], 6, false);

export const SPRITES = {
  troop_shadow_wraith_idle: clip([shadowWraith(0), shadowWraith(1), shadowWraith(2), shadowWraith(3)], 4),
  troop_shadow_wraith_walk: clip([shadowWraith(0), shadowWraith(1), shadowWraith(2), shadowWraith(3)], 7),
  troop_shadow_wraith_ability: clip([0, 1, 2, 3].map(f => shadowWraith(0, f)), 10, false),
  troop_shadow_wraith_death: D(shadowWraith(0)),

  troop_cursed_soldier_idle: clip([cursedSoldier(1, 0), cursedSoldier(1, -1)], 3),
  troop_cursed_soldier_walk: clip([cursedSoldier(0, 0), cursedSoldier(1, -1), cursedSoldier(0, 0), cursedSoldier(1, -1)], 7),
  troop_cursed_soldier_death: D(cursedSoldier(1, 0)),

  troop_imp_swarm_idle: clip([impSwarm(0), impSwarm(1), impSwarm(2), impSwarm(3)], 8),
  troop_imp_swarm_fly: clip([impSwarm(0), impSwarm(1), impSwarm(2), impSwarm(3)], 12),
  troop_imp_swarm_death: D(impSwarm(0), 30),

  troop_void_priest_idle: clip([voidPriest(0), voidPriest(1), voidPriest(2), voidPriest(3)], 4),
  troop_void_priest_walk: clip([voidPriest(0), voidPriest(1), voidPriest(2), voidPriest(3)], 7),
  troop_void_priest_ability: clip([0, 1, 2, 3].map(f => voidPriest(0, f)), 8, false),
  troop_void_priest_death: D(voidPriest(0)),

  troop_abyssal_behemoth_idle: clip([abyssalBehemoth(0), abyssalBehemoth(2)], 3),
  troop_abyssal_behemoth_walk: clip([abyssalBehemoth(0), abyssalBehemoth(1), abyssalBehemoth(2), abyssalBehemoth(3)], 6),
  troop_abyssal_behemoth_death: D(abyssalBehemoth(0)),

  troop_soul_eater_idle: clip([soulEater(1), soulEater(0)], 3),
  troop_soul_eater_walk: clip([soulEater(0), soulEater(1), soulEater(0), soulEater(1)], 8),
  troop_soul_eater_ability: clip([0, 1, 2, 3].map(f => soulEater(1, f)), 9, false),
  troop_soul_eater_death: D(soulEater(1)),

  troop_gem_shade_idle: clip([gemShade(0), gemShade(1), gemShade(2), gemShade(3)], 5),
  troop_gem_shade_walk: clip([gemShade(0), gemShade(1), gemShade(2), gemShade(3)], 9),
  troop_gem_shade_carry: clip([gemShade(0), gemShade(2)], 5),
  troop_gem_shade_ability: clip([0, 1, 2, 3].map(f => gemShade(0, f)), 12, false),
  troop_gem_shade_death: D(gemShade(0)),

  troop_doom_knight_idle: clip([doomKnight(1, 0), doomKnight(1, -1)], 3),
  troop_doom_knight_walk: clip([doomKnight(0, 0), doomKnight(1, -1), doomKnight(0, 0), doomKnight(1, -1)], 7),
  troop_doom_knight_ability: clip([0, 1, 2, 3].map(f => doomKnight(1, 0, f)), 9, false),
  troop_doom_knight_death: D(doomKnight(1, 0), 39),

  troop_shadow_king_idle: clip([shadowKing(1, 0), shadowKing(1, -1)], 3),
  troop_shadow_king_walk: clip([shadowKing(0, 0), shadowKing(1, -1), shadowKing(0, 0), shadowKing(1, -1)], 5),
  troop_shadow_king_ability: clip([0, 1, 2, 3].map(f => shadowKing(1, 0, f)), 8, false),
  troop_shadow_king_death: D(shadowKing(1, 0), 50),
};
