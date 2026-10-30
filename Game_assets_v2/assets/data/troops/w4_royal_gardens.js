// troops/w4_royal_gardens.js — W4 ROYAL GARDENS · the court and its clockwork. 11 archetypes.
//
// Faint W4 thread: deep court velvet over polished brass, ROYAL GOLD trim, a fleur stamped
// small. The richest palette in the game — and the only world that fields true machines, so a
// clockwork sentinel and a siege wagon must read as machinery, not as men in armour (D-28).

import { overlay, erase } from '../lib/draw.js';
import { grid, set, disc, ellipse, line, poly, clone } from '../lib/pixel.js';
import { W4 } from './_worlds.js';
import { clip, finish, SIZE, fxShield, fxSummon, fxInvulnShimmer, fxSupportAura } from './_troop_lib.js';

export const LEGEND = W4.legend;
const FIN = { rimCh: 'e', skip: 'kKqQ12345', aoFrom: 'cde', aoCh: 'a' };
const S = SIZE.normal, GR = 28;

/** Court velvet: a stiff tabard-and-hose body. Sizes differ per unit; the shape does not repeat. */
function livery(g, cx, top, bottom, halfTop, halfBot) {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const half = Math.round(halfTop + (halfBot - halfTop) * t);
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half || 1);
      set(g, cx + x, y, u < 0.24 ? 'e' : u > 0.76 ? 'a' : 'd');
    }
  }
}

// 1 · HOUSEHOLD GUARD — a halberd twice his height and a plumed morion.
function householdGuard(pose, bob) {
  const g = grid(S, S);
  for (let y = 2; y <= 26; y++) { set(g, 23, y, 'p'); set(g, 24, y, 'P'); }
  poly(g, [[22, 0], [26, 4], [22, 7]], 'j'); poly(g, [[25, 3], [29, 5], [25, 7]], 'i');
  overlay(g, [
    [8, 15, 'M'], [9, 14, 'oMo'],                                                   // plume
    [10, 13, 'pPPPp'], [11, 13, 'pP44P'], [12, 13, 'pP2k4'], [13, 14, 'p233'],
    [14, 11, 'pPPPPPPp'], [15, 11, 'pPPPPPPp'],
  ]);
  livery(g, 15, 16, 27, 5, 8);
  for (let y = 17; y <= 25; y++) set(g, 15, y, 'M');
  W4.motif(g, 18, 21, 'o');
  overlay(g, pose === 0 ? [[28, 11, 'pp``pp']] : [[28, 12, 'pppp']]);
  if (bob) { const src = clone(g); erase(g, 0, 8, S, 14);
    for (let y = 8; y < 22; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 2 · KINGSGUARD — gilded plate; broad, gold-banded, a closed visor and a short sword.
function kingsguard(pose, bob) {
  const g = grid(S, S);
  overlay(g, [
    [8, 13, 'MoooM'],                                                                // gold comb
    [9, 13, 'pPPPp'], [10, 13, 'pPkPp'], [11, 13, 'pPPPp'], [12, 14, 'pPp'],
    [13, 9, 'pPPPPPPPPp'], [14, 8, 'pPPPPPPPPPPp'], [15, 8, 'pPPPPPPPPPPp'],
    [16, 9, 'MoooooooooM'],                                                          // gold band
    [17, 9, 'pPPPPPPPPp'], [18, 10, 'pPPPPPPp'], [19, 10, 'pPPPPPPp'],
    [20, 10, 'ddeedddd'], [21, 10, 'ddeedddd'],
  ]);
  for (let y = 12; y <= 22; y++) { set(g, 6, y, 'p'); set(g, 7, y, 'P'); }
  poly(g, [[5, 9], [8, 9], [6, 5]], 'j');
  W4.motif(g, 22, 20, 'o');
  const legs = pose === 0
    ? [[22, 11, 'pPP`PPp'], [23, 11, 'pPP`PPp'], [24, 11, 'pPP`PPp'], [25, 10, 'pPP``PPp'],
       [26, 10, 'pPP``PPp'], [27, 10, 'pPP``PPp'], [28, 9, 'ppp``ppp']]
    : [[22, 12, 'pPPPPp'], [23, 12, 'pPPPPp'], [24, 12, 'pPPPPp'], [25, 12, 'pPPPPp'],
       [26, 12, 'pPPPPp'], [27, 12, 'pPPPPp'], [28, 11, 'pppppp']];
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 6, S, 15);
    for (let y = 6; y < 21; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// 3 · ROYAL ENGINEER — a brass BACKPACK boiler with a venting pipe; stooped under its weight.
// [SteamShield]
function royalEngineer(pose, ab = -1) {
  const g = grid(S, S);
  for (let y = 12; y <= 24; y++) for (let x = 6; x <= 13; x++) set(g, x, y, x < 8 ? 'C' : x > 11 ? 'a' : 'P');
  for (let x = 6; x <= 13; x += 3) for (let y = 12; y <= 24; y++) set(g, x, y, 'p');
  for (let y = 4; y <= 12; y++) set(g, 8, y, 'p');                                    // vent pipe
  set(g, 8, 3, 'C');
  if (ab >= 0) for (let i = 0; i < 4; i++) disc(g, 8 + i, 2 - i, 1.4 + i * 0.3, 'e');
  overlay(g, [[13, 15, 'ppP'], [14, 15, 'p44'], [15, 15, 'p2k4'], [16, 16, 'p23']]);
  livery(g, 18, 17, 27, 5, 7);
  for (let i = 0; i < 6; i++) set(g, 22 + i, 20 + Math.round(i * 0.4), 'P');          // wrench
  set(g, 27, 22, 'C'); set(g, 27, 23, 'C');
  W4.motif(g, 18, 22, 'o');
  overlay(g, pose === 0 ? [[28, 15, 'pp``pp']] : [[28, 16, 'pppp']]);
  if (ab >= 0) fxShield(g, ab, 4, 17, 19, 'C', 'P');
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// 4 · COURT CONJURER — a wide horned hat and an ORB floating free of the hands. [AllyShield]
function courtConjurer(pose, ab = -1) {
  const g = grid(S, S);
  for (let x = 8; x <= 24; x++) set(g, x, 11, 'a');                                    // wide hat brim
  for (let x = 10; x <= 22; x++) set(g, x, 10, 'c');
  poly(g, [[16, 3], [21, 10], [11, 10]], 'd'); poly(g, [[16, 3], [16, 10], [11, 10]], 'e');
  set(g, 16, 2, 'o'); set(g, 12, 9, 'M'); set(g, 20, 9, 'M');
  overlay(g, [[12, 14, 'd44'], [13, 14, 'd2k4'], [14, 15, 'd23']]);
  livery(g, 16, 15, 27, 5, 9);
  for (let y = 17; y <= 26; y += 3) for (let x = -8; x <= 8; x++) set(g, 16 + x, y, (x + y) % 4 ? 'd' : 'M');
  const oy = 17 + (pose ? -1 : 1);
  disc(g, 25, oy, 3, 'M'); disc(g, 25, oy, 1.6, 'o');                                  // the floating orb
  W4.motif(g, 16, 22, 'o');
  overlay(g, pose === 0 ? [[28, 13, 'dd``dd']] : [[28, 14, 'dddd']]);
  if (ab >= 0) fxShield(g, ab, 4, 16, 19, 'o', 'M');
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// 5 · CLOCKWORK SENTINEL — a MACHINE. A brass drum body slung under a rotor, no legs, no face.
// Mechanical + lightning-vulnerable (D-17). [PropellerFlight]
function clockworkSentinel(beat) {
  const g = grid(S, S);
  const spin = beat % 2;
  for (let i = -12; i <= 12; i++) set(g, 16 + i, 7, spin ? (i % 2 ? 'P' : 'p') : 'p');  // rotor
  if (spin) for (let i = -12; i <= 12; i += 2) set(g, 16 + i, 6, 'a');
  for (let y = 8; y <= 11; y++) set(g, 16, y, 'p');
  ellipse(g, 16, 16, 7, 6, 'P');                                                        // drum body
  ellipse(g, 14, 15, 4.4, 3.6, 'C');
  for (let y = 11; y <= 21; y += 4) for (let x = 9; x <= 23; x++) set(g, x, y, 'p');
  disc(g, 16, 16, 2.6, 'M'); disc(g, 16, 16, 1.2, 'o');                                 // the eye-lens
  for (const s of [-1, 1]) {                                                             // gimballed arms
    for (let i = 0; i < 6; i++) set(g, 16 + s * (7 + i), 18 + i, i > 3 ? 'a' : 'p');
    disc(g, 16 + s * 13, 24, 1.6, 'P');
  }
  for (let i = 0; i < 5; i++) set(g, 16, 23 + i, i % 2 ? 'p' : 'a');                     // exhaust stalk
  const out = finish(g, { ...FIN, ground: 30, shadowW: 0, rimCh: 'C' });
  for (let x = -5; x <= 5; x++) if (x * x <= 25) set(out, 16 + x, 30, 'q');
  return out;
}

// 6 · ROYAL STANDARD BEARER — the standard is a rigid GONFALON on a crossbar, not a hanging
// banner: a hard rectangle high above the line. [FearlessAura]
function standardBearer(pose, ab = -1) {
  const g = grid(S, S);
  for (let y = 3; y <= 26; y++) { set(g, 12, y, 'p'); set(g, 13, y, 'P'); }
  for (let x = 12; x <= 26; x++) set(g, x, 4, 'P');                                     // crossbar
  for (let y = 5; y <= 15; y++) for (let x = 14; x <= 26; x++) set(g, x, y, (x + y) % 5 ? 'd' : 'M');
  for (let x = 14; x <= 26; x += 3) set(g, x, 16, 'M');
  W4.motif(g, 20, 10, 'o');
  overlay(g, [[14, 16, 'pPP'], [15, 16, 'p44'], [16, 16, 'p2k4'], [17, 17, 'p23']]);
  livery(g, 19, 18, 27, 5, 7);
  overlay(g, pose === 0 ? [[28, 16, 'pp``pp']] : [[28, 17, 'pppp']]);
  if (ab >= 0) fxSupportAura(g, ab, 4, 19, GR, 'M', 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 7 · ROYAL FALCONER — a man with a BIRD on the fist and a hood-plume; the bird is the read.
// [WaterborneFlight]
function royalFalconer(beat) {
  const g = grid(S, S);
  const flap = [0, -2, -3, -2][beat];
  for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {                                 // falcon wings
    const t = i / 8;
    set(g, 22 + s * (2 + i), 9 + flap * (1 - t) + Math.round(t * 3), t < 0.5 ? 'P' : 'p');
  }
  ellipse(g, 22, 12, 2.6, 3, 'a'); set(g, 24, 11, 'M');                                  // falcon body
  set(g, 22, 15, 'p'); set(g, 22, 16, 'p');
  overlay(g, [
    [12, 12, 'cd'], [11, 13, 'M'],                                                        // hood plume
    [13, 12, 'd44'], [14, 12, 'd2k4'], [15, 13, 'd23'],
    [16, 11, 'ddeeedd'], [17, 11, 'ddeeedd'],
  ]);
  for (let x = 18; x <= 22; x++) set(g, x, 17, 'a');                                      // the gauntlet
  livery(g, 15, 18, 27, 5, 7);
  W4.motif(g, 15, 22, 'o');
  overlay(g, [[28, 12, 'dd``dd']]);
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 8 · ROYAL PRINCE — mounted on a slim white palfrey; gilded, crowned, carries a gem when it
// grabs one (D-09). Distinct from W1's Golden Prince: lighter horse, no barding, a lance.
function royalPrince(gait) {
  const g = grid(S, S);
  const lift = [0, -1, -1, 0][gait];
  ellipse(g, 15, 20 + lift, 10, 4.4, 'e');                                                // pale horse
  ellipse(g, 13, 19 + lift, 6.4, 3, 'd');
  poly(g, [[23, 21 + lift], [27, 14 + lift], [29, 15 + lift], [26, 22 + lift]], 'e');
  ellipse(g, 28, 13 + lift, 2.8, 2.2, 'd'); set(g, 30, 13 + lift, 'e');
  for (const [lx, ly] of [[9, 24], [13, 25], [20, 24], [23, 25]])
    for (let j = 0; j < 3; j++) set(g, lx, ly + j + lift, j > 1 ? 'k' : 'e');
  for (let x = 10; x <= 20; x++) set(g, x, 16 + lift, 'M');                                // caparison hem
  overlay(g, [
    [8 + lift, 13, 'oMoMo'],                                                              // crown
    [9 + lift, 14, 'd44'], [10 + lift, 14, 'd2k4'], [11 + lift, 14, 'd233'],
    [12 + lift, 12, 'ddeeedd'], [13 + lift, 12, 'ddMMMdd'], [14 + lift, 13, 'ddeed'],
  ]);
  for (let y = 4 + lift; y <= 16 + lift; y++) set(g, 21, y, 'P');
  poly(g, [[21, 2 + lift], [23, 6 + lift], [19, 6 + lift]], 'j');
  W4.motif(g, 11, 21 + lift, 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 11 });
}

function princeCarry(pose) {
  const g = grid(S, S);
  overlay(g, [
    [8, 13, 'oMoMo'], [9, 14, 'd44'], [10, 14, 'd2k4'], [11, 14, 'd233'],
    [12, 11, 'ddeeeedd'], [13, 11, 'ddMMMMdd'], [14, 12, 'ddeeed'],
  ]);
  ellipse(g, 16, 17, 3, 3.4, 'M'); ellipse(g, 16, 17, 1.8, 2, 'o');                       // the gem
  livery(g, 16, 18, 27, 5, 7);
  overlay(g, pose === 0 ? [[28, 13, 'dd``dd']] : [[28, 14, 'dddd']]);
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 9 · SIEGE WAGON — a MACHINE on wheels. No legs at all; a boxed ram behind a bolted screen.
// [SteamShield]
function siegeWagon(roll, ab = -1) {
  const g = grid(S, S);
  for (const wx of [8, 16, 24]) {                                                          // wheels
    disc(g, wx, 25, 3.4, 'p'); disc(g, wx, 25, 2, 'P');
    for (let a = roll * 30; a < 360; a += 60) {
      const t = a * Math.PI / 180;
      set(g, wx + Math.cos(t) * 3, 25 + Math.sin(t) * 3, 'a');
    }
  }
  for (let y = 13; y <= 22; y++) for (let x = 4; x <= 28; x++)                              // hull
    set(g, x, y, x < 7 ? 'e' : x > 25 ? 'a' : 'd');
  for (let y = 14; y <= 21; y += 3) for (let x = 4; x <= 28; x++) set(g, x, y, 'p');
  for (let x = 4; x <= 28; x += 5) for (let y = 13; y <= 22; y++) set(g, x, y, 'P');
  for (let y = 11; y <= 13; y++) for (let x = 6; x <= 26; x++) set(g, x, y, 'M');           // gold rail
  for (let y = 17; y <= 20; y++) for (let x = 28; x <= 31; x++) set(g, x, y, 'p');          // the ram
  set(g, 31, 18, 'C'); set(g, 31, 19, 'C');
  for (let i = 0; i < 4; i++) set(g, 10 + i, 9 - i, i > 2 ? 'a' : 'p');                     // stack
  W4.motif(g, 16, 17, 'o');
  if (ab >= 0) fxShield(g, ab, 4, 16, 17, 'C', 'P');
  return finish(g, { ...FIN, ground: GR, shadowW: 13 });
}

// 10 · LORD COMMANDER (champion, 44) — the grandest plate in the game: winged pauldrons,
// a shoulder cape, a commander's baton. [ShieldMode]
function lordCommander(pose, bob, ab = -1) {
  const C = SIZE.champion, G2 = 39;
  const g = grid(C, C);
  for (let i = 0; i < 14; i++) line(g, 6 + i, 16 + Math.round(i * 0.4), 6 + i, 36, i < 4 ? 'M' : i < 9 ? 'd' : 'a');
  overlay(g, [
    [10, 21, 'oMMMo'],
    [12, 20, 'pPPPPp'], [13, 20, 'pPkkPp'], [14, 20, 'pPPPPp'], [15, 21, 'pPPp'],
    [16, 14, 'pPPPPPPPPPPPp'], [17, 13, 'pPPPPPPPPPPPPPp'],
  ]);
  for (const s of [-1, 1]) for (let j = 0; j < 7; j++)                                       // winged pauldrons
    set(g, 22 + s * (8 + j), 15 - Math.round(j * 0.9), j > 4 ? 'o' : 'M');
  overlay(g, [
    [18, 13, 'pPPPPPPPPPPPPPp'], [19, 14, 'MooooooooooooM'],
    [20, 14, 'pPPPPPPPPPPPPp'], [21, 15, 'pPPPPPPPPPPp'], [22, 15, 'pPPPPPPPPPPp'],
  ]);
  for (let y = 18; y <= 28; y++) { set(g, 34, y, 'P'); }                                     // baton
  set(g, 34, 17, 'o'); set(g, 34, 29, 'o');
  W4.motif(g, 22, 26, 'o');
  const legs = [];
  for (let y = 23; y <= 38; y++) {
    const t = (y - 23) / 15;
    if (pose === 0) legs.push([y, 17 - Math.round(t * 2), 'pPP' + '`'.repeat(Math.round(t * 6) + 2) + 'PPp']);
    else legs.push([y, 18, 'pPPPPPp']);
  }
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 10, C, 13);
    for (let y = 10; y < 23; y++) for (let x = 0; x < C; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) fxShield(g, ab, 4, 22, 22, 'o', 'M');
  return finish(g, { ...FIN, ground: G2, shadowW: 12 });
}

// 11 · THE KING (boss, 56) — enthroned bulk: an enormous fur-trimmed mantle, a great crown,
// orb and sceptre. He barely walks. [ContinuousSummon + OverchargePulse + ShieldMode]
function king(pose, bob, ab = -1) {
  const B = SIZE.boss, G3 = 50;
  const g = grid(B, B);
  for (let y = 20; y <= 48; y++) {                                                            // the mantle
    const w = 12 + Math.round((y - 20) * 0.72);
    for (let x = 28 - w; x <= 28 + w; x++) {
      const u = (x - (28 - w)) / (2 * w);
      set(g, x, y, u < 0.2 ? 'e' : u > 0.8 ? 'a' : 'd');
    }
  }
  for (let y = 24; y <= 46; y += 5) for (let x = -20; x <= 20; x++)                           // ermine bands
    set(g, 28 + x, y, (x + y) % 6 ? 'a' : 'e');
  overlay(g, [
    [12, 22, 'o`M`o`M`o'], [13, 21, 'oMMMMMMMMo'], [14, 21, 'MoooooooooM'],                   // great crown
    [15, 22, 'ddeeeeedd'], [16, 23, 'd44444d'], [17, 23, 'd2kk4d'], [18, 24, 'd2334'],
    [19, 18, 'ddeeeeeeeeeedd'], [20, 17, 'ddMMMMMMMMMMMMdd'],
    [21, 18, 'ddeeeeeeeeeedd'],
  ]);
  for (let y = 24; y <= 40; y++) { set(g, 45, y, 'P'); }                                       // sceptre
  disc(g, 45, 22, 2.6, 'o'); disc(g, 45, 22, 1.2, 'M');
  disc(g, 11, 28, 3.4, 'M'); disc(g, 11, 28, 1.8, 'o');                                        // orb
  W4.motif(g, 28, 32, 'o');
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
  troop_household_guard_idle: clip([householdGuard(1, 0), householdGuard(1, -1)], 3),
  troop_household_guard_walk: clip([householdGuard(0, 0), householdGuard(1, -1), householdGuard(0, 0), householdGuard(1, -1)], 8),
  troop_household_guard_death: D(householdGuard(1, 0)),

  troop_kingsguard_idle: clip([kingsguard(1, 0), kingsguard(1, -1)], 3),
  troop_kingsguard_walk: clip([kingsguard(0, 0), kingsguard(1, -1), kingsguard(0, 0), kingsguard(1, -1)], 7),
  troop_kingsguard_death: D(kingsguard(1, 0)),

  troop_royal_engineer_idle: clip([royalEngineer(1), royalEngineer(0)], 3),
  troop_royal_engineer_walk: clip([royalEngineer(0), royalEngineer(1), royalEngineer(0), royalEngineer(1)], 8),
  troop_royal_engineer_ability: clip([0, 1, 2, 3].map(f => royalEngineer(1, f)), 9, false),
  troop_royal_engineer_death: D(royalEngineer(1)),

  troop_court_conjurer_idle: clip([courtConjurer(1), courtConjurer(0)], 4),
  troop_court_conjurer_walk: clip([courtConjurer(0), courtConjurer(1), courtConjurer(0), courtConjurer(1)], 8),
  troop_court_conjurer_ability: clip([0, 1, 2, 3].map(f => courtConjurer(1, f)), 9, false),
  troop_court_conjurer_death: D(courtConjurer(1)),

  troop_clockwork_sentinel_idle: clip([clockworkSentinel(0), clockworkSentinel(1)], 12),
  troop_clockwork_sentinel_fly: clip([clockworkSentinel(0), clockworkSentinel(1)], 16),
  troop_clockwork_sentinel_death: D(clockworkSentinel(0), 30),

  troop_royal_standard_bearer_idle: clip([standardBearer(1), standardBearer(0)], 3),
  troop_royal_standard_bearer_walk: clip([standardBearer(0), standardBearer(1), standardBearer(0), standardBearer(1)], 8),
  troop_royal_standard_bearer_ability: clip([0, 1, 2, 3].map(f => standardBearer(1, f)), 9, false),
  troop_royal_standard_bearer_death: D(standardBearer(1)),

  troop_royal_falconer_idle: clip([royalFalconer(0), royalFalconer(1), royalFalconer(2), royalFalconer(3)], 6),
  troop_royal_falconer_fly: clip([royalFalconer(0), royalFalconer(1), royalFalconer(2), royalFalconer(3)], 9),
  troop_royal_falconer_death: D(royalFalconer(0)),

  troop_royal_prince_idle: clip([royalPrince(0), royalPrince(2)], 4),
  troop_royal_prince_walk: clip([royalPrince(0), royalPrince(1), royalPrince(2), royalPrince(3)], 9),
  troop_royal_prince_carry: clip([princeCarry(0), princeCarry(1)], 5),
  troop_royal_prince_death: D(royalPrince(0)),

  troop_siege_wagon_idle: clip([siegeWagon(0), siegeWagon(1)], 3),
  troop_siege_wagon_walk: clip([siegeWagon(0), siegeWagon(1), siegeWagon(2), siegeWagon(3)], 7),
  troop_siege_wagon_ability: clip([0, 1, 2, 3].map(f => siegeWagon(1, f)), 9, false),
  troop_siege_wagon_death: D(siegeWagon(0)),

  troop_lord_commander_idle: clip([lordCommander(1, 0), lordCommander(1, -1)], 3),
  troop_lord_commander_walk: clip([lordCommander(0, 0), lordCommander(1, -1), lordCommander(0, 0), lordCommander(1, -1)], 7),
  troop_lord_commander_ability: clip([0, 1, 2, 3].map(f => lordCommander(1, 0, f)), 9, false),
  troop_lord_commander_death: D(lordCommander(1, 0), 39),

  troop_king_idle: clip([king(1, 0), king(1, -1)], 3),
  troop_king_walk: clip([king(0, 0), king(1, -1), king(0, 0), king(1, -1)], 5),
  troop_king_ability: clip([0, 1, 2, 3].map(f => king(1, 0, f)), 8, false),
  troop_king_death: D(king(1, 0), 50),
};
