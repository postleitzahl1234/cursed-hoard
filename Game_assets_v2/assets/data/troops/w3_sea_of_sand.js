// troops/w3_sea_of_sand.js — W3 SEA OF SAND · desert raiders. All 12 archetypes.
//
// Faint W3 thread: sun-bleached wrappings, an EMBER-orange accent, a scarab stamped small.
// This is the world where D-28's "non-humanoids are mandatory where the role says so" bites
// hardest — a behemoth, a vulture and a camel are three separate animals, not three riders.

import { overlay, erase } from '../lib/draw.js';
import { grid, set, disc, ellipse, line, poly, clone } from '../lib/pixel.js';
import { W3 } from './_worlds.js';
import { clip, finish, SIZE, fxVanish, fxShield, fxBurst, fxSummon, fxHeal } from './_troop_lib.js';

export const LEGEND = { ...W3.legend, z: 'IC2', Z: 'IC4', y: 'GD4' };
const FIN = { rimCh: 'e', skip: 'kKqQ12345', aoFrom: 'acd', aoCh: 'a' };
const S = SIZE.normal, GR = 28;

/** Loose desert wrappings: a body of cloth that flares at the hem and trails a tail-end. */
function wraps(g, cx, top, bottom, halfTop, halfBot, r3, trail = 0) {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const half = Math.round(halfTop + (halfBot - halfTop) * t);
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half || 1);
      set(g, cx + x, y, u < 0.24 ? r3[2] : u > 0.76 ? r3[0] : r3[1]);
    }
  }
  for (let i = 0; i < trail; i++) set(g, cx - halfBot - i, bottom - Math.round(i * 0.6), r3[1]);
}

// 1 · SAND RAIDER — light, fast, a curved blade held low. The leanest W3 outline.
function sandRaider(pose) {
  const g = grid(S, S);
  overlay(g, [[11, 14, 'ccd'], [12, 13, 'cddd'], [13, 13, 'c2k3'], [14, 14, '233']]);
  for (let x = 12; x <= 20; x++) set(g, x, 12, 'c');                                // head-cloth tail
  for (let i = 0; i < 5; i++) set(g, 20 + i, 13 + i, 'd');
  wraps(g, 17, 15, 27, 3, 4, ['a', 'c', 'd'], 5);
  for (let y = 18; y <= 26; y++) set(g, 20 + Math.round((y - 18) * 0.4), y, 'c');
  for (let i = 0; i < 9; i++) set(g, 22 + Math.round(Math.sin(i * 0.3) * 2), 18 + i, 'i');  // scimitar
  set(g, 22, 17, 'j');
  W3.motif(g, 16, 20, 'M');
  overlay(g, pose === 0 ? [[26, 13, '2``2'], [27, 13, '2``2'], [28, 12, '33``33']]
                        : [[26, 14, '22'], [27, 14, '22'], [28, 13, '3333']]);
  return finish(g, { ...FIN, ground: GR, shadowW: 6 });
}

// 2 · DUNE NOMAD — a bulky pack on the back and a walking staff; hunched under the load.
function duneNomad(pose) {
  const g = grid(S, S);
  ellipse(g, 10, 17, 6, 5, 'a');                                                     // the pack
  for (let x = 5; x <= 15; x += 3) for (let y = 13; y <= 21; y++) set(g, x, y, 'c');
  for (let y = 8; y <= 27; y++) set(g, 24, y, 'W');
  overlay(g, [[12, 16, 'cdd'], [13, 15, 'cd2k'], [14, 16, 'c23']]);
  wraps(g, 18, 19, 27, 7, 12, ['a', 'c', 'd'], 2);
  W3.motif(g, 18, 22, 'M');
  overlay(g, pose === 0 ? [[28, 15, 'cc``cc']] : [[28, 16, 'cccc']]);
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// 3 · ASH WALKER — charred to black, trailing smoke, cracked ember seams. Fire-immune (D-17).
function ashWalker(pose, t) {
  const g = grid(S, S);
  for (let i = 0; i < 7; i++) set(g, 13 + ((i + t) % 3), 8 - i, i > 4 ? 'a' : 'n'); // smoke
  overlay(g, [[11, 14, 'nnn'], [12, 13, 'nnMnn'], [13, 13, 'nMkMn'], [14, 14, 'nnn']]);
  wraps(g, 16, 14, 27, 3, 5, ['n', 'a', 'c']);
  for (let y = 14; y <= 27; y++) { set(g, 12, y, 'n'); set(g, 20, y, 'n'); }
  for (let i = 0; i < 6; i++) {                                                       // ember cracks
    const cy = 17 + i * 2;
    set(g, 13 + (i % 3), cy, (i + t) % 2 ? 'M' : 'o');
  }
  W3.motif(g, 19, 22, 'o');
  overlay(g, pose === 0 ? [[28, 13, 'nn``nn']] : [[28, 14, 'nnnn']]);
  return finish(g, { ...FIN, ground: GR, shadowW: 7, rimCh: 'M' });
}

// 4 · MIRAGE DANCER — long veils streaming from both arms; the widest, softest outline in W3.
// [Untargetable]
function mirageDancer(pose, ab = -1) {
  const g = grid(S, S);
  for (const s of [-1, 1]) for (let i = 0; i < 12; i++) {
    const t = i / 12;
    set(g, 16 + s * (4 + i), 14 + Math.round(Math.sin(i * 0.7 + pose) * 4) + Math.round(t * 6), t < 0.5 ? 'd' : 'c');
    set(g, 16 + s * (4 + i), 15 + Math.round(Math.sin(i * 0.7 + pose) * 4) + Math.round(t * 6), 'a');
  }
  overlay(g, [[12, 14, 'cdd'], [13, 14, 'd2k3'], [14, 15, '233']]);
  wraps(g, 16, 16, 26, 3, 5, ['a', 'c', 'd'], 2);
  for (let x = 13; x <= 19; x++) set(g, x, 19, 'M');
  W3.motif(g, 16, 23, 'o');
  overlay(g, pose === 0 ? [[27, 15, '2`2'], [28, 14, '33`33']] : [[27, 15, '22'], [28, 15, '33']]);
  if (ab >= 0) fxVanish(g, ab, 4, 16, 18, 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// 5 · SANDSTORM SHAMAN — a horned bone mask and a feathered totem staff. [SandstormCover]
function sandstormShaman(pose, ab = -1) {
  const g = grid(S, S);
  for (let y = 4; y <= 26; y++) set(g, 23, y, 'W');
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) set(g, 23 + s * (1 + i), 5 + i, i > 2 ? 'M' : 'B');
  disc(g, 23, 3, 2, 'b'); set(g, 23, 3, 'k');
  overlay(g, [
    [10, 12, 'B`B'],                                                                  // horns
    [11, 12, 'bBBBb'], [12, 12, 'bkBkb'], [13, 13, 'bBb'],                            // bone mask
  ]);
  wraps(g, 15, 15, 27, 6, 9, ['a', 'c', 'd'], 3);
  for (let i = 0; i < 5; i++) set(g, 10 + i * 3, 17 + (i % 2) * 2, 'M');              // fetishes
  W3.motif(g, 15, 22, 'o');
  overlay(g, pose === 0 ? [[28, 12, 'cc``cc']] : [[28, 13, 'cccc']]);
  if (ab >= 0) for (let i = 0; i < 16; i++) {                                          // sandstorm veil
    const a = (i / 16) * Math.PI * 2 + ab * 0.4, r = 7 + ab * 3;
    set(g, 15 + Math.cos(a) * r, 20 + Math.sin(a) * r * 0.6, i % 3 ? 'c' : 'd');
  }
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// 6 · DUNE BEHEMOTH — a QUADRUPED sand-beast, low and armoured, with a howdah on its back.
// Non-humanoid, per D-28. [Mounted]
function duneBehemoth(gait) {
  const g = grid(S, S);
  const lift = [0, -1, 0, -1][gait];
  ellipse(g, 15, 20 + lift, 13, 6, 'c');                                              // huge body
  ellipse(g, 13, 19 + lift, 9, 4, 'd');
  for (let x = 5; x <= 25; x += 4) for (let y = 15 + lift; y <= 21 + lift; y++) set(g, x, y, 'a');
  poly(g, [[25, 22 + lift], [30, 18 + lift], [31, 22 + lift], [26, 24 + lift]], 'c'); // blunt head
  set(g, 30, 19 + lift, 'k'); set(g, 28, 17 + lift, 'B'); set(g, 30, 17 + lift, 'B');
  for (const [lx, ly] of [[7, 25], [12, 26], [19, 25], [23, 26]])
    for (let j = 0; j < 3; j++) set(g, lx, ly + j + lift, j > 1 ? 'k' : 'c');
  for (let x = 10; x <= 20; x++) set(g, x, 12 + lift, 'W');                            // howdah
  for (let y = 8 + lift; y <= 12 + lift; y++) for (let x = 11; x <= 19; x++) set(g, x, y, x % 3 ? 'a' : 'M');
  W3.motif(g, 9, 21 + lift, 'M');
  return finish(g, { ...FIN, ground: GR, shadowW: 13 });
}

// 7 · REBEL SAPPER — powder kegs strapped front and back; short and dangerously round.
// [DeathExplosion — the burst is on his DEATH clip, not an ability]
function rebelSapper(pose) {
  const g = grid(S, S);
  for (const [kx, ky] of [[10, 20], [22, 21]]) {
    ellipse(g, kx, ky, 4, 5, 'W'); ellipse(g, kx - 1, ky - 1, 2.4, 3, 'v');
    for (let y = ky - 4; y <= ky + 4; y += 3) for (let x = kx - 4; x <= kx + 4; x++) set(g, x, y, 'i');
    line(g, kx, ky - 6, kx + 2, ky - 9, 'a'); set(g, kx + 2, ky - 10, 'o');            // fuse
  }
  overlay(g, [[12, 14, 'ccd'], [13, 14, 'c2k3'], [14, 15, '233']]);
  wraps(g, 16, 17, 25, 5, 6, ['a', 'c', 'd']);
  W3.motif(g, 16, 19, 'M');
  overlay(g, pose === 0 ? [[27, 14, '2`2'], [28, 13, '33``33']] : [[27, 14, '22'], [28, 14, '3333']]);
  return finish(g, { ...FIN, ground: GR, shadowW: 9 });
}

// 8 · GLASS SENTINEL — a faceted CONSTRUCT of desert glass. No cloth anywhere; all hard edges
// and internal light. [DamageToHeal]
function glassSentinel(pose, ab = -1) {
  const g = grid(S, S);
  poly(g, [[16, 8], [22, 14], [20, 24], [12, 24], [10, 14]], 'z');                    // faceted body
  poly(g, [[16, 8], [22, 14], [16, 18]], 'Z');
  poly(g, [[16, 8], [10, 14], [16, 18]], 'd');
  for (let y = 14; y <= 23; y++) set(g, 16, y, 'Z');
  disc(g, 16, 16, 2, 'o'); set(g, 16, 16, 'M');                                        // the core
  for (const s of [-1, 1]) for (let j = 0; j < 6; j++) set(g, 16 + s * (7 + j), 15 + j, j > 3 ? 'z' : 'Z');
  W3.motif(g, 16, 21, 'M');
  overlay(g, pose === 0 ? [[25, 13, 'z``z'], [26, 13, 'z``z'], [27, 12, 'z``` z'.replace(' ', 'z')], [28, 12, 'zz``zz']]
                        : [[25, 14, 'zz'], [26, 14, 'zz'], [27, 14, 'zz'], [28, 13, 'zzzz']]);
  if (ab >= 0) fxShield(g, ab, 4, 16, 17, 'Z', 'z');
  return finish(g, { ...FIN, ground: GR, shadowW: 7, rimCh: 'Z' });
}

// 9 · GIANT VULTURE — a BIRD. Hooked beak, bald neck, ragged wings. Flying (D-15).
function giantVulture(beat) {
  const g = grid(S, S);
  const flap = [0, -3, -5, -3][beat];
  for (const s of [-1, 1]) for (let i = 0; i < 13; i++) {
    const t = i / 13;
    const y = 16 + flap * (1 - t) + Math.round(t * 5);
    set(g, 16 + s * (3 + i), y, t < 0.4 ? 'n' : t < 0.75 ? 'a' : 'c');
    set(g, 16 + s * (3 + i), y + 1, 'n');
    if (t > 0.5) set(g, 16 + s * (3 + i), y + 2, 'a');
  }
  ellipse(g, 16, 20, 5, 4, 'n'); ellipse(g, 15, 19, 3.4, 2.6, 'a');                    // body
  poly(g, [[19, 16], [22, 12], [24, 13], [21, 18]], '2');                              // bald neck
  ellipse(g, 24, 12, 2.4, 2, 'a'); set(g, 25, 12, 'k');
  poly(g, [[26, 12], [29, 13], [26, 14]], 'M');                                         // hooked beak
  for (let i = 0; i < 4; i++) set(g, 12 - i, 22 + i, 'n');                              // tail
  for (const fx of [14, 18]) for (let j = 0; j < 3; j++) set(g, fx, 24 + j, j > 1 ? 'M' : 'n');
  const out = finish(g, { ...FIN, ground: 30, shadowW: 0, rimCh: 'd' });
  for (let x = -6; x <= 6; x++) for (let y = -1; y <= 1; y++)
    if (x * x / 36 + y * y <= 1) set(out, 16, 30 + y, 'q'), set(out, 16 + x, 30 + y, 'q');
  return out;
}

// 10 · CAMEL CARAVAN — a CAMEL, humped and long-legged, under a tall stack of bundles.
// [GroupCohesion]
function camelCaravan(gait) {
  const g = grid(S, S);
  const lift = [0, -1, -2, -1][gait];
  ellipse(g, 15, 18 + lift, 9, 4, 'd');                                                 // body
  ellipse(g, 12, 15 + lift, 4, 3.4, 'e'); ellipse(g, 18, 15 + lift, 3.4, 3, 'd');       // two humps
  poly(g, [[22, 18 + lift], [26, 10 + lift], [28, 11 + lift], [24, 19 + lift]], 'd');   // long neck
  ellipse(g, 27, 9 + lift, 2.6, 2, 'e'); set(g, 29, 9 + lift, 'd'); set(g, 28, 8 + lift, 'k');
  for (const [lx, ly, sw] of [[8, 22, gait % 2], [12, 23, 1 - gait % 2], [19, 22, gait % 2], [22, 23, 1 - gait % 2]])
    for (let j = 0; j < 6; j++) set(g, lx + (sw ? 1 : 0), ly + j + lift, j > 4 ? 'k' : 'd');
  for (let y = 8 + lift; y <= 13 + lift; y++) for (let x = 10; x <= 20; x++)             // bundles
    set(g, x, y, (x + y) % 4 ? 'a' : 'c');
  for (let x = 10; x <= 20; x += 4) for (let y = 8 + lift; y <= 13 + lift; y++) set(g, x, y, 'M');
  W3.motif(g, 15, 19 + lift, 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 11 });
}

// 11 · RENEGADE KNIGHT (champion, 44) — W1 plate gone desert: sand-scoured, cloth-wrapped,
// a kite shield strapped over the arm. [ShieldMode]
function renegadeKnight(pose, bob, ab = -1) {
  const C = SIZE.champion, G2 = 39;
  const g = grid(C, C);
  poly(g, [[26, 15], [36, 15], [36, 26], [31, 34], [26, 26]], 'r');                     // kite shield
  poly(g, [[26, 15], [31, 15], [31, 33], [26, 26]], 'R');
  for (let y = 16; y <= 32; y += 5) for (let x = 26; x <= 36; x++) set(g, x, y, 'M');
  overlay(g, [
    [13, 19, 'rRRRr'], [14, 19, 'rRkRr'], [15, 19, 'rRRRr'], [16, 20, 'rRr'],
    [12, 18, 'ccd'], [11, 19, 'cd'],                                                     // head-cloth over the helm
    [17, 14, 'rRRRRRRRRRRRr'], [18, 13, 'rRRRRRRRRRRRRRr'], [19, 13, 'rRRRRRRRRRRRRRr'],
    [20, 14, 'ccddMMMMddccd'],
    [21, 14, 'rRRRRRRRRRRRr'], [22, 15, 'rRRRRRRRRRr'], [23, 15, 'rRRRRRRRRRr'],
  ]);
  for (let i = 0; i < 8; i++) set(g, 10 - i, 22 + i, 'c');                                // torn cloak
  W3.motif(g, 22, 26, 'o');
  const legs = [];
  for (let y = 24; y <= 38; y++) {
    const t = (y - 24) / 14;
    if (pose === 0) legs.push([y, 17 - Math.round(t * 2), 'rRRR' + '`'.repeat(Math.round(t * 6) + 2) + 'RRRr']);
    else legs.push([y, 18, 'rRRRRRRRr']);
  }
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 12, C, 12);
    for (let y = 12; y < 24; y++) for (let x = 0; x < C; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) fxShield(g, ab, 4, 22, 22, 'd', 'M');
  return finish(g, { ...FIN, ground: G2, shadowW: 11 });
}

// 12 · CHIEF REBEL (boss, 56) — the raider king: a vast layered burnous, twin blades, a
// trophy-hung standard. [ContinuousSummon + GoldSteal + TowerSuppressionField]
function chiefRebel(pose, bob, ab = -1) {
  const B = SIZE.boss, G3 = 50;
  const g = grid(B, B);
  for (let y = 10; y <= 40; y++) { set(g, 46, y, 'W'); set(g, 47, y, 'v'); }             // standard
  for (let y = 12; y <= 24; y++) for (let x = 38; x <= 46; x++) set(g, x, y, (x + y) % 3 ? 'M' : 'm');
  for (let i = 0; i < 4; i++) { disc(g, 40 + i * 2, 27 + (i % 2) * 3, 1.6, 'b'); }        // skull trophies
  overlay(g, [
    [14, 24, 'ccddd'], [15, 23, 'cdddddd'], [16, 23, 'cd2kk3d'], [17, 24, 'c233d'],
    [12, 26, 'MMM'],                                                                       // ember circlet
  ]);
  wraps(g, 26, 21, 48, 7, 14, ['a', 'c', 'd'], 6);
  for (let y = 24; y <= 46; y += 6) for (let x = -16; x <= 16; x++)
    set(g, 26 + x, y, (x + y) % 5 ? 'a' : 'M');
  for (const s of [-1, 1]) for (let i = 0; i < 11; i++)                                    // twin scimitars
    set(g, 26 + s * (14 + i), 22 + i + Math.round(Math.sin(i * 0.4) * 2), i > 8 ? 'j' : 'i');
  W3.motif(g, 26, 32, 'o');
  if (bob) { const src = clone(g); erase(g, 0, 12, B, 16);
    for (let y = 12; y < 28; y++) for (let x = 0; x < B; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) fxSummon(g, ab, 4, 26, G3 - 4, 'M', 'o');
  return finish(g, { ...FIN, ground: G3, shadowW: 17 });
}

function fell(painter, step, ground) {
  const g = painter, sink = [0, 4, 9][step];
  const out = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.px[y][x] === '`' || 'qQ'.includes(g.px[y][x])) continue;
    out.px[Math.min(g.h - 1, y + Math.round(sink * Math.max(0, (ground - y) / ground) * 1.6))]
       [Math.max(0, x - Math.round(sink * Math.max(0, (ground - y) / ground) * 0.9))] = g.px[y][x];
  }
  return finish(out, { ground, shadowW: 9 });
}
const D = (fn, ground = GR) => clip([fell(fn, 0, ground), fell(fn, 1, ground), fell(fn, 2, ground)], 6, false);

export const SPRITES = {
  troop_sand_raider_idle: clip([sandRaider(1), sandRaider(0)], 3),
  troop_sand_raider_walk: clip([sandRaider(0), sandRaider(1), sandRaider(0), sandRaider(1)], 10),
  troop_sand_raider_death: D(sandRaider(1)),

  troop_dune_nomad_idle: clip([duneNomad(1), duneNomad(0)], 3),
  troop_dune_nomad_walk: clip([duneNomad(0), duneNomad(1), duneNomad(0), duneNomad(1)], 8),
  troop_dune_nomad_death: D(duneNomad(1)),

  troop_ash_walker_idle: clip([ashWalker(1, 0), ashWalker(1, 1)], 4),
  troop_ash_walker_walk: clip([ashWalker(0, 0), ashWalker(1, 1), ashWalker(0, 2), ashWalker(1, 0)], 8),
  troop_ash_walker_death: D(ashWalker(1, 0)),

  troop_mirage_dancer_idle: clip([mirageDancer(1), mirageDancer(0)], 5),
  troop_mirage_dancer_walk: clip([mirageDancer(0), mirageDancer(1), mirageDancer(0), mirageDancer(1)], 9),
  troop_mirage_dancer_ability: clip([0, 1, 2, 3].map(f => mirageDancer(1, f)), 10, false),
  troop_mirage_dancer_death: D(mirageDancer(1)),

  troop_sandstorm_shaman_idle: clip([sandstormShaman(1), sandstormShaman(0)], 3),
  troop_sandstorm_shaman_walk: clip([sandstormShaman(0), sandstormShaman(1), sandstormShaman(0), sandstormShaman(1)], 8),
  troop_sandstorm_shaman_ability: clip([0, 1, 2, 3].map(f => sandstormShaman(1, f)), 9, false),
  troop_sandstorm_shaman_death: D(sandstormShaman(1)),

  troop_dune_behemoth_idle: clip([duneBehemoth(0), duneBehemoth(2)], 3),
  troop_dune_behemoth_walk: clip([duneBehemoth(0), duneBehemoth(1), duneBehemoth(2), duneBehemoth(3)], 6),
  troop_dune_behemoth_death: D(duneBehemoth(0)),

  troop_rebel_sapper_idle: clip([rebelSapper(1), rebelSapper(0)], 3),
  troop_rebel_sapper_walk: clip([rebelSapper(0), rebelSapper(1), rebelSapper(0), rebelSapper(1)], 9),
  troop_rebel_sapper_death: clip([fell(rebelSapper(1), 0, GR), fell(rebelSapper(1), 1, GR),
    (() => { const g = fell(rebelSapper(1), 2, GR); fxBurst(g, 2, 3, 16, 22, ['M', 'o']); return g; })()], 8, false),

  troop_glass_sentinel_idle: clip([glassSentinel(1), glassSentinel(0)], 3),
  troop_glass_sentinel_walk: clip([glassSentinel(0), glassSentinel(1), glassSentinel(0), glassSentinel(1)], 7),
  troop_glass_sentinel_ability: clip([0, 1, 2, 3].map(f => glassSentinel(1, f)), 9, false),
  troop_glass_sentinel_death: D(glassSentinel(1)),

  troop_giant_vulture_idle: clip([giantVulture(0), giantVulture(1), giantVulture(2), giantVulture(3)], 6),
  troop_giant_vulture_fly: clip([giantVulture(0), giantVulture(1), giantVulture(2), giantVulture(3)], 9),
  troop_giant_vulture_death: D(giantVulture(0), 30),

  troop_camel_caravan_idle: clip([camelCaravan(0), camelCaravan(2)], 3),
  troop_camel_caravan_walk: clip([camelCaravan(0), camelCaravan(1), camelCaravan(2), camelCaravan(3)], 7),
  troop_camel_caravan_death: D(camelCaravan(0)),

  troop_renegade_knight_idle: clip([renegadeKnight(1, 0), renegadeKnight(1, -1)], 3),
  troop_renegade_knight_walk: clip([renegadeKnight(0, 0), renegadeKnight(1, -1), renegadeKnight(0, 0), renegadeKnight(1, -1)], 7),
  troop_renegade_knight_ability: clip([0, 1, 2, 3].map(f => renegadeKnight(1, 0, f)), 9, false),
  troop_renegade_knight_death: D(renegadeKnight(1, 0), 39),

  troop_chief_rebel_idle: clip([chiefRebel(1, 0), chiefRebel(1, -1)], 3),
  troop_chief_rebel_walk: clip([chiefRebel(0, 0), chiefRebel(1, -1), chiefRebel(0, 0), chiefRebel(1, -1)], 6),
  troop_chief_rebel_ability: clip([0, 1, 2, 3].map(f => chiefRebel(1, 0, f)), 9, false),
  troop_chief_rebel_death: D(chiefRebel(1, 0), 50),
};
