// troops/w1_grasslands.js — W1 GREAT GRASSLANDS · the General's Host. All 10 archetypes.
//
// One file per WORLD, not per unit — at 53 archetypes this is the only layout where the
// distinctness requirement is checkable while authoring: the ten bodies sit side by side in one
// buffer, so a silhouette that repeats is obvious as you type it. D-28's real protection is
// unchanged and is what matters: there is **no shared body function anywhere**. Every unit below
// hand-places its own anatomy. `_worlds.js` supplies a palette and a wheat motif; it cannot
// supply a shape.
//
// The faint W1 thread: undyed linen over honest iron, a GRASS-GREEN sash or trim on every unit,
// and a wheat sprig stamped somewhere small. Poor at the bottom of the roster, gilded at the top.
//
// Clip set per D-25: idle + walk + death, plus ability where the unit has a UnitBehavior, plus
// carry for the gem specialist. No attack swing.

import { fromSpans, overlay, erase } from '../lib/draw.js';
import { grid, set, disc, ellipse, line, poly, clone } from '../lib/pixel.js';
import { W1, sash } from './_worlds.js';
import { clip, finish, SIZE, innerLine,
         fxSupportAura, fxTaunt, fxInvulnShimmer, fxSummon } from './_troop_lib.js';

export const LEGEND = W1.legend;

const FIN = { rimCh: 'e', skip: 'kKqQ12345', aoFrom: 'acd', aoCh: 'a' };
const S = SIZE.normal, GR = 28;

// ═══ 1 · PEASANT ══════════════════════════════════════════════════════════════
// Conscripted farmer. Wide conical straw hat and a shouldered pitchfork — the smallest mass in
// the roster and the only wide-brim silhouette in the game.
const PEASANT = [
  [1, 2, 'j`j`j'], [2, 2, 'I`I`I'], [3, 2, 'I`I`I'], [4, 2, 'iiiii'],
  [5, 4, 'v'], [6, 4, 'v'], [7, 5, 'v'], [8, 5, 'W'], [9, 6, 'v'], [10, 6, 'W'],
  [11, 6, 'v'], [12, 7, 'W'], [13, 7, 'v'], [14, 8, 'W'], [15, 8, 'v'],
  [16, 9, 'W'], [17, 9, 'v'], [18, 10, 'W'], [19, 10, 'v'],
  [6, 15, 'dca'], [7, 14, 'ddcca'], [8, 14, 'ddccaa'], [9, 13, 'dddcccaa'],
  [10, 12, 'ddddcccaaa'], [11, 9, 'cdeedddddcccaaa'], [12, 11, 'aaaaaaaaaaaa'],
  [13, 15, '3444'], [14, 15, '34k43'], [15, 15, '2343'], [16, 16, '23'],
  [16, 13, 'Wc``cW'], [17, 12, 'WcdccWWww'], [18, 11, 'WWcdccWWwww'],
  [19, 10, 'W2ccccWWWww'], [20, 13, 'WccWWWw'],
  [21, 13, 'mMMMmmm'], [22, 13, 'WccWWWw'],
  [23, 13, 'wrw`rrw'], [24, 13, 'wRw`rRw'], [25, 13, 'wRw`rRw'],
  [26, 14, '23`32'], [27, 14, '23`32'], [28, 12, 'Wvvw`vvW'],
  [18, 20, 'ww'], [19, 20, 'ww'], [20, 20, 'ww'], [21, 20, 'w2'],
];
const PEASANT_LEGS = [
  [[23, 12, 'wrw``rrw'], [24, 11, 'wRw```rRw'], [25, 11, 'wRw```rRw'], [26, 11, '23````32'], [27, 10, '23`````32'], [28, 9, 'Wvvw```vvW']],
  [[23, 13, 'wrwrrw'], [24, 13, 'wRwrRw'], [25, 13, 'wRwrRw'], [26, 14, '2332'], [27, 14, '2332'], [28, 13, 'WvvvvW']],
  [[23, 12, 'wrw``rrw'], [24, 12, 'wRw``rRw'], [25, 12, 'wRw```rRw'], [26, 12, '23```32'], [27, 11, '23````32'], [28, 10, 'Wvvw``vvW']],
  [[23, 13, 'wrwrrw'], [24, 13, 'wRwrRw'], [25, 13, 'wRwrRw'], [26, 14, '2332'], [27, 14, '2332'], [28, 13, 'WvvvvW']],
];

function peasant(legIdx, bob) {
  const g = fromSpans(S, S, PEASANT);
  erase(g, 10, 23, 14, 6); overlay(g, PEASANT_LEGS[legIdx]);
  W1.motif(g, 20, 19, 'o');
  if (bob) { const src = clone(g); erase(g, 0, 0, S, 23);
    for (let y = 0; y < 23; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// ═══ 2 · GUARD ════════════════════════════════════════════════════════════════
// Levy spearman. Bolt upright where the Peasant stoops, with a broad ROUND SHIELD filling one
// flank and a spear standing a full head above him — a vertical + a circle, no brim anywhere.
function guard(pose, bob) {
  const g = grid(S, S);
  for (let y = 2; y <= 24; y++) { set(g, 9, y, 'v'); set(g, 10, y, 'W'); }        // spear haft
  poly(g, [[9, 2], [11, 6], [8, 6]], 'j'); set(g, 10, 1, 'j');                    // spearhead
  ellipse(g, 20, 18, 6, 6.5, 'i');                                                // round shield
  ellipse(g, 20, 18, 4.5, 5, 'I'); disc(g, 20, 18, 1.6, 'j');
  for (let a = 0; a < 360; a += 60) { const t = a * Math.PI / 180; set(g, 20 + Math.cos(t) * 5, 18 + Math.sin(t) * 5.4, 'W'); }
  overlay(g, [
    [10, 13, 'IiI'], [11, 12, 'iIIIi'], [12, 12, 'I343I'],                        // kettle helm + face
    [13, 13, '2k4'], [14, 13, '233'],
    [15, 12, 'iIIIi'], [16, 11, 'iIIIIIi'], [17, 11, 'iIIIIIi'],                  // mail shoulders
    [18, 11, 'iIIIIIi'], [19, 12, 'iIIIIi'],
    [20, 12, 'mMMMm'],                                                            // W1 green sash
    [21, 12, 'iIIIi'], [22, 12, 'iIIIi'],
  ]);
  const legs = pose === 0
    ? [[23, 12, 'iI`Ii'], [24, 12, 'iI`Ii'], [25, 11, '23``32'], [26, 11, '23``32'], [27, 11, '23``32'], [28, 10, 'ii``ii']]
    : [[23, 13, 'iIIi'], [24, 13, 'iIIi'], [25, 13, '2332'], [26, 13, '2332'], [27, 13, '2332'], [28, 12, 'iiii']];
  overlay(g, legs);
  W1.motif(g, 20, 22, 'o');
  if (bob) { const src = clone(g); erase(g, 0, 8, S, 15);
    for (let y = 8; y < 23; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// ═══ 3 · OUTRIDER ═════════════════════════════════════════════════════════════
// The first mount in the game. A lean courser — long body, high head, thin legs — with a rider
// sitting well above the crowd line. Nothing else in W1 is horizontal.
function outrider(gait) {
  const g = grid(S, S);
  const lift = [0, -1, -2, -1][gait];
  ellipse(g, 15, 19 + lift, 10, 4.5, 'W');                                        // barrel
  ellipse(g, 13, 18 + lift, 6, 3.4, 'v');
  poly(g, [[23, 20 + lift], [27, 13 + lift], [29, 14 + lift], [26, 21 + lift]], 'W');   // neck
  ellipse(g, 28, 12 + lift, 3, 2.4, 'v'); set(g, 30, 12 + lift, 'W');              // head
  set(g, 27, 11 + lift, 'w'); set(g, 29, 11 + lift, 'w');                          // ears
  for (const [lx, ly, sw] of [[8, 22, gait % 2], [12, 23, 1 - gait % 2], [20, 22, gait % 2], [23, 23, 1 - gait % 2]]) {
    for (let j = 0; j < 6; j++) set(g, lx + (sw ? Math.round(j * 0.4) : -Math.round(j * 0.3)), ly + j + lift, j > 4 ? 'k' : 'W');
  }
  for (let i = 0; i < 6; i++) set(g, 5 - i * 0.6, 17 + i + lift, 'w');             // tail
  overlay(g, [                                                                      // rider
    [8 + lift, 15, 'iIi'], [9 + lift, 15, 'I34'], [10 + lift, 15, '2k3'],
    [11 + lift, 13, 'iIIIIi'], [12 + lift, 13, 'iIIIIi'],
    [13 + lift, 13, 'mMMMm'], [14 + lift, 14, 'iIIi'],
  ]);
  for (let y = 4 + lift; y <= 14 + lift; y++) set(g, 21, y, 'v');                  // lance
  poly(g, [[21, 2 + lift], [23, 6 + lift], [19, 6 + lift]], 'j');
  W1.motif(g, 12, 20 + lift, 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 10 });
}

// ═══ 4 · KNIGHT ═══════════════════════════════════════════════════════════════
// Full plate. The BROADEST infantry outline in W1 — a slab of a man behind a heater shield,
// with a flat-topped greathelm that has no face at all.
function knight(pose, bob) {
  const g = grid(S, S);
  // heater shield on the FAR arm, so it frames the body instead of hiding it
  poly(g, [[22, 13], [28, 13], [28, 21], [25, 26], [22, 21]], 'I');
  poly(g, [[22, 13], [25, 13], [25, 25], [22, 21]], 'j');
  W1.motif(g, 25, 19, 'o');
  overlay(g, [
    [9, 13, 'iIIIi'], [10, 13, 'iIIIi'], [11, 13, 'iIkIi'],                       // greathelm, faceless
    [12, 13, 'iIIIi'], [13, 13, 'iIIIi'], [14, 14, 'iIi'],
    [15, 10, 'iIIIIIIIi'], [16, 9, 'iIIIIIIIIIi'],                                // pauldrons — the width
    [17, 9, 'iIIIIIIIIIi'], [18, 10, 'iIIIIIIIi'],
    [19, 10, 'mMMMMMMMm'],                                                         // W1 green
    [20, 10, 'iIIIIIIIi'], [21, 11, 'iIIIIIi'], [22, 11, 'iIIIIIi'],
  ]);
  for (let y = 13; y <= 22; y++) { set(g, 7, y, 'i'); set(g, 8, y, 'I'); }        // sword, point down
  poly(g, [[6, 10], [9, 10], [7, 5]], 'j');
  for (let x = 6; x <= 9; x++) set(g, x, 11, 'j');
  const legs = pose === 0
    ? [[23, 11, 'iII`IIi'], [24, 11, 'iII`IIi'], [25, 11, 'iII`IIi'],
       [26, 10, 'iII``IIi'], [27, 10, 'iII``IIi'], [28, 9, 'iii``iii']]
    : [[23, 12, 'iIIIIi'], [24, 12, 'iIIIIi'], [25, 12, 'iIIIIi'],
       [26, 12, 'iIIIIi'], [27, 12, 'iIIIIi'], [28, 11, 'iiiiii']];
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 8, S, 14);
    for (let y = 8; y < 22; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// ═══ 5 · PALADIN ══════════════════════════════════════════════════════════════
// A giant behind a TOWER SHIELD that reaches from ground to chin — a rectangle on legs, which
// no other unit in the game is. Cape flares behind. [SlowImmunity]
function paladin(pose, bob) {
  const g = grid(S, S);
  for (let y = 12; y <= 27; y++) {                                                 // cape, behind
    const w = 4 + Math.round((y - 12) * 0.45);
    for (let x = 4; x < 4 + w; x++) set(g, x, y, x < 6 ? 'M' : x < 9 ? 'm' : 'a');
  }
  // tower shield: full height, but only 8 wide so the man still reads beside it
  for (let y = 9; y <= 27; y++) for (let x = 21; x <= 28; x++) {
    set(g, x, y, x < 23 ? 'j' : x > 26 ? 'i' : 'I');
  }
  for (let x = 21; x <= 28; x++) { set(g, x, 9, 'G'); set(g, x, 27, 'g'); }
  W1.motif(g, 25, 18, 'o');
  overlay(g, [
    [9, 13, 'iIIIi'], [10, 13, 'iIkIi'], [11, 13, 'iIIIi'], [12, 14, 'iIi'],      // barbute
    [8, 13, 'yGy'],                                                                // gold crest
    [13, 10, 'iIIIIIIIIi'], [14, 9, 'iIIIIIIIIIIi'], [15, 9, 'iIIIIIIIIIIi'],
    [16, 10, 'mMMMMMMMMm'], [17, 10, 'iIIIIIIIIi'], [18, 11, 'iIIIIIIi'],
    [19, 11, 'iIIIIIIi'], [20, 11, 'iIIIIIIi'],
  ]);
  for (let y = 12; y <= 21; y++) { set(g, 3, y, 'w'); set(g, 4, y, 'W'); }        // hammer haft
  for (let y = 8; y <= 12; y++) for (let x = 1; x <= 7; x++) set(g, x, y, x < 3 ? 'j' : 'i');
  const legs = pose === 0
    ? [[21, 12, 'iII`IIi'], [22, 12, 'iII`IIi'], [23, 12, 'iII`IIi'], [24, 12, 'iII`IIi'],
       [25, 11, 'iII``IIi'], [26, 11, 'iII``IIi'], [27, 11, 'iII``IIi'], [28, 10, 'iii``iii']]
    : [[21, 13, 'iIIIIi'], [22, 13, 'iIIIIi'], [23, 13, 'iIIIIi'], [24, 13, 'iIIIIi'],
       [25, 13, 'iIIIIi'], [26, 13, 'iIIIIi'], [27, 13, 'iIIIIi'], [28, 12, 'iiiiii']];
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 6, S, 15);
    for (let y = 6; y < 21; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 9 });
}

// ═══ 6 · BANNER SERGEANT ══════════════════════════════════════════════════════
// The tallest thing in the roster, and almost all of it is BANNER. [SupportAura → speed ring]
function bannerSergeant(pose, bob, abilityFrame = -1) {
  const g = grid(S, S);
  for (let y = 1; y <= 24; y++) { set(g, 8, y, 'w'); set(g, 9, y, 'W'); }           // pole
  set(g, 8, 0, 'G'); set(g, 9, 0, 'y');
  for (let y = 2; y <= 14; y++) {                                                    // the banner cloth
    const w = 11 - Math.round(Math.abs(y - 8) * 0.5);
    for (let x = 10; x < 10 + w; x++) set(g, x, y, x < 12 ? 'o' : x > 10 + w - 3 ? 'm' : 'M');
  }
  for (let y = 2; y <= 14; y += 3) set(g, 20, y, 'G');
  W1.motif(g, 15, 10, 'e');
  overlay(g, [
    [12, 14, 'iIIi'], [13, 14, 'I34I'], [14, 14, '2k43'], [15, 14, '2332'],
    [16, 12, 'iIIIIIi'], [17, 12, 'iIIIIIi'], [18, 13, 'mMMMm'],
    [19, 12, 'iIIIIi'], [20, 12, 'iIIIi'], [21, 13, 'iIi'],
  ]);
  const legs = pose === 0
    ? [[22, 12, 'iI`Ii'], [23, 12, 'iI`Ii'], [24, 11, '23``32'], [25, 11, '23``32'], [26, 11, '23``32'], [27, 11, '23``32'], [28, 10, 'ii``ii']]
    : [[22, 13, 'iIIi'], [23, 13, 'iIIi'], [24, 13, '2332'], [25, 13, '2332'], [26, 13, '2332'], [27, 13, '2332'], [28, 12, 'iiii']];
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 10, 12, 20, 10);
    for (let y = 12; y < 22; y++) for (let x = 10; x < 30; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (abilityFrame >= 0) fxSupportAura(g, abilityFrame, 4, 16, GR, 'M', 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 7, inkSoft: 'qQ' });
}

// ═══ 7 · PAVISE GUARD ═════════════════════════════════════════════════════════
// A WALL. The pavise is a full-height rectangle wider than the man behind it, so the silhouette
// is a box with boots — the squattest, blockiest outline in W1. [Taunt → shockwave]
function paviseGuard(pose, abilityFrame = -1) {
  const g = grid(S, S);
  overlay(g, [
    [8, 14, 'iIIi'], [9, 14, 'iIkI'], [10, 14, 'iIIi'],
    [11, 11, 'iIIIIIIIi'], [12, 11, 'iIIIIIIIi'],
  ]);
  for (let y = 10; y <= 27; y++) for (let x = 4; x <= 24; x++) {                    // the pavise
    const u = (x - 4) / 20;
    set(g, x, y, u < 0.12 ? 'v' : u < 0.28 ? 'W' : u > 0.9 ? 'w' : 'W');
  }
  for (let x = 4; x <= 24; x += 5) for (let y = 10; y <= 27; y++) set(g, x, y, 'w');
  for (let x = 4; x <= 24; x++) { set(g, x, 10, 'i'); set(g, x, 27, 'i'); }
  for (let y = 12; y <= 25; y += 6) for (let x = 4; x <= 24; x++) set(g, x, y, 'i');
  for (let y = 14; y <= 22; y++) for (let x = 11; x <= 17; x++) set(g, x, y, 'M');  // green boss panel
  W1.motif(g, 14, 20, 'o');
  const legs = pose === 0
    ? [[26, 8, 'iI``II'], [27, 8, 'iI``II'], [28, 7, 'ii``ii']]
    : [[26, 9, 'iIIi'], [27, 9, 'iIIi'], [28, 8, 'iiii']];
  overlay(g, legs);
  overlay(g, [[26, 20, 'iI'], [27, 20, 'iI'], [28, 19, 'ii']]);                     // far boot
  if (abilityFrame >= 0) fxTaunt(g, abilityFrame, 4, 14, 18, 'w', 'v');
  return finish(g, { ...FIN, ground: GR, shadowW: 10, inkSoft: 'qQ' });
}

// ═══ 8 · KNIGHT LIEUTENANT (champion, 44px) ═══════════════════════════════════
// Winged helm, greatsword held high, back-banner. Champion scale. [ThresholdInvuln → shimmer]
function knightLieutenant(pose, bob, abilityFrame = -1) {
  const C = SIZE.champion, G2 = 39;
  const g = grid(C, C);
  for (let y = 8; y <= 26; y++) {                                                  // back banner
    const w = 8 - Math.round(Math.abs(y - 17) * 0.3);
    for (let x = 6; x < 6 + w; x++) set(g, x, y, x < 8 ? 'o' : 'M');
  }
  for (let y = 6; y <= 30; y++) { set(g, 14, y, 'w'); set(g, 15, y, 'W'); }
  for (const s2 of [-1, 1]) for (let j = 0; j < 5; j++)                            // helm wings
    set(g, 22 + s2 * (5 + j), 14 - Math.round(j * 0.8), j > 2 ? 'y' : 'G');
  overlay(g, [
    [13, 19, 'iIIIIi'], [14, 19, 'iI44Ii'], [15, 19, 'iI2k4i'], [16, 20, 'i233i'],
    [17, 15, 'iIIIIIIIIIIi'], [18, 14, 'iIIIIIIIIIIIIi'], [19, 14, 'iIIIIIIIIIIIIi'],
    [20, 15, 'mMMMMMMMMMMm'],
    [21, 15, 'iIIIIIIIIIIi'], [22, 16, 'iIIIIIIIIi'], [23, 16, 'iIIIIIIIIi'],
  ]);
  for (let y = 6; y <= 24; y++) { set(g, 33, y, 'i'); set(g, 34, y, 'I'); set(g, 35, y, 'j'); }
  poly(g, [[32, 6], [36, 6], [34, 1]], 'j');
  for (let x = 31; x <= 37; x++) set(g, x, 25, 'G');
  W1.motif(g, 28, 21, 'o');
  const legs = pose === 0
    ? [[24, 16, 'iII``IIi'], [25, 16, 'iII``IIi'], [26, 16, 'iII``IIi'], [27, 16, 'iII``IIi'],
       [28, 15, 'iII````IIi'], [29, 15, 'iII````IIi'], [30, 15, 'iII````IIi'],
       [31, 14, 'iI``````Ii'], [32, 14, 'iI``````Ii'], [33, 14, 'iI``````Ii'],
       [34, 13, 'iI````````Ii'], [35, 13, 'iI````````Ii'], [36, 13, 'iI````````Ii'],
       [37, 12, 'iii````````iii'], [38, 12, 'iii````````iii']]
    : [[24, 17, 'iIIIIIi'], [25, 17, 'iIIIIIi'], [26, 17, 'iIIIIIi'], [27, 17, 'iIIIIIi'],
       [28, 17, 'iIIIIIi'], [29, 17, 'iIIIIIi'], [30, 17, 'iIIIIIi'], [31, 17, 'iIIIIIi'],
       [32, 17, 'iIIIIIi'], [33, 17, 'iIIIIIi'], [34, 17, 'iIIIIIi'], [35, 17, 'iIIIIIi'],
       [36, 17, 'iIIIIIi'], [37, 16, 'iiiiiiiii'], [38, 16, 'iiiiiiiii']];
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 10, C, 14);
    for (let y = 10; y < 24; y++) for (let x = 0; x < C; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (abilityFrame >= 0) fxInvulnShimmer(g, abilityFrame, 4, 22, 20, 'y', 'G');
  return finish(g, { ...FIN, ground: G2, shadowW: 11, inkSoft: 'qQ' });
}

// ═══ 9 · GOLDEN PRINCE ════════════════════════════════════════════════════════
// Mounted and crowned, on a caparisoned DESTRIER — heavy, draped, short-necked, the opposite of
// the Outrider's lean courser. On grabbing a gem he dismounts (D-09), which is the `carry` clip.
function goldenPrince(gait) {
  const g = grid(S, S);
  const lift = [0, -1, -1, 0][gait];
  // caparisoned destrier — heavy, draped, short-necked. GOLD BARDING.
  ellipse(g, 14, 20 + lift, 10, 5, 'g');
  ellipse(g, 13, 19 + lift, 7, 3.4, 'G');
  for (let x = 6; x <= 22; x += 4) for (let y = 18 + lift; y <= 25 + lift; y++) set(g, x, y, 'y');
  poly(g, [[22, 21 + lift], [25, 16 + lift], [27, 17 + lift], [25, 22 + lift]], 'g');
  ellipse(g, 26, 15 + lift, 3, 2.4, 'G'); set(g, 28, 15 + lift, 'y');
  set(g, 25, 13 + lift, 'y'); set(g, 27, 13 + lift, 'y');
  for (const [lx, ly] of [[8, 25], [12, 26], [19, 25], [22, 26]]) {
    for (let j = 0; j < 3; j++) set(g, lx, ly + j + lift, j > 1 ? 'k' : 'g');
  }
  // the rider: DARK IRON so he separates from his own horse, crowned in gold
  overlay(g, [
    [7 + lift, 12, 'yGGGy'],                                                        // crown
    [8 + lift, 13, 'I44I'], [9 + lift, 13, 'I2k4'], [10 + lift, 13, 'i233'],
    [11 + lift, 11, 'iIIIIIIi'], [12 + lift, 11, 'iIIIIIIi'],
    [13 + lift, 11, 'mMMMMMm'],
    [14 + lift, 12, 'iIIIIi'], [15 + lift, 12, 'iIIIIi'], [16 + lift, 13, 'iIIi'],
  ]);
  for (let y = 6 + lift; y <= 16 + lift; y++) set(g, 19, y, 'W');                   // upright sword
  poly(g, [[19, 3 + lift], [21, 7 + lift], [17, 7 + lift]], 'j');
  W1.motif(g, 10, 21 + lift, 'e');
  return finish(g, { ...FIN, ground: GR, shadowW: 11 });
}

/** The carry clip: dismounted, slowed, a gem held at the chest (D-09). */
function princeCarry(pose) {
  const g = grid(S, S);
  overlay(g, [
    [8, 14, 'yGy'], [9, 14, 'G44'], [10, 14, '2k43'], [11, 14, '2332'],
    [12, 12, 'gGGGGg'], [13, 11, 'gGGGGGGg'], [14, 11, 'gGGGGGGg'],
    [15, 12, 'mMMMMm'], [16, 12, 'gGGGg'], [17, 12, 'gGGGg'],
  ]);
  ellipse(g, 15, 16, 3, 3.4, 'M'); ellipse(g, 15, 16, 1.8, 2, 'o');                 // the gem
  const legs = pose === 0
    ? [[18, 12, 'gG`Gg'], [19, 12, 'gG`Gg'], [20, 12, 'gG`Gg'], [21, 12, 'gG`Gg'],
       [22, 12, 'gG`Gg'], [23, 12, 'gG`Gg'], [24, 12, 'gG`Gg'], [25, 12, 'gG`Gg'],
       [26, 12, 'gG`Gg'], [27, 12, 'gG`Gg'], [28, 11, 'gg``gg']]
    : [[18, 13, 'gGGg'], [19, 13, 'gGGg'], [20, 13, 'gGGg'], [21, 13, 'gGGg'],
       [22, 13, 'gGGg'], [23, 13, 'gGGg'], [24, 13, 'gGGg'], [25, 13, 'gGGg'],
       [26, 13, 'gGGg'], [27, 13, 'gGGg'], [28, 12, 'gggg']];
  overlay(g, legs);
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// ═══ 10 · THE GENERAL (boss, 56px) ════════════════════════════════════════════
// The host's head. Crowned greathelm, vast cape, greatsword planted. Boss scale.
// [ContinuousSummon + ThresholdSummon → a summoning rite]
function general(pose, bob, abilityFrame = -1) {
  const B = SIZE.boss, G3 = 50;
  const g = grid(B, B);
  for (let y = 18; y <= 46; y++) {                                                  // the great cape
    const w = 10 + Math.round((y - 18) * 0.55);
    for (let x = 4; x < 4 + w; x++) set(g, x, y, x < 7 ? 'M' : x < 13 ? 'm' : 'a');
  }
  overlay(g, [
    [16, 24, 'yGyGyGy'], [17, 24, 'yGGGGGy'],                                       // crown
    [18, 24, 'iIIIIIi'], [19, 24, 'iIIkIIi'], [20, 24, 'iIIIIIi'],
    [21, 24, 'iIIIIIi'], [22, 25, 'iIIIi'],
    [23, 17, 'iIIIIIIIIIIIIIIi'], [24, 16, 'iIIIIIIIIIIIIIIIIi'],
    [25, 16, 'iIIIIIIIIIIIIIIIIi'],
    [26, 17, 'yGGGGGGGGGGGGGGy'],
    [27, 17, 'iIIIIIIIIIIIIIIi'], [28, 18, 'mMMMMMMMMMMMMm'],
    [29, 18, 'iIIIIIIIIIIIIi'], [30, 18, 'iIIIIIIIIIIIIi'], [31, 19, 'iIIIIIIIIIIi'],
  ]);
  for (let y = 8; y <= 32; y++) { set(g, 42, y, 'i'); set(g, 43, y, 'I'); set(g, 44, y, 'j'); set(g, 45, y, 'I'); }
  poly(g, [[41, 8], [46, 8], [43, 2]], 'j');
  for (let x = 39; x <= 48; x++) { set(g, x, 33, 'y'); set(g, x, 34, 'G'); }
  W1.motif(g, 36, 28, 'o');
  const legs = [];
  for (let y = 32; y <= 49; y++) {
    const t = (y - 32) / 17;
    if (pose === 0) {
      const gap = Math.round(t * 8);
      legs.push([y, 20 - Math.round(t * 3), 'iII' + '`'.repeat(gap + 2) + 'IIi']);
    } else {
      legs.push([y, 22, 'iIIIIIIi']);
    }
  }
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 14, B, 18);
    for (let y = 14; y < 32; y++) for (let x = 0; x < B; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (abilityFrame >= 0) fxSummon(g, abilityFrame, 4, 28, G3 - 4, 'M', 'o');
  return finish(g, { ...FIN, ground: G3, shadowW: 15, inkSoft: 'qQ' });
}

// ── death: everything folds toward the ground, keeping its identifying prop ────
function fell(painter, step, cx, ground) {
  const g = painter;
  const sink = [0, 4, 9][step];
  const out = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.px[y][x] === '`' || 'qQ'.includes(g.px[y][x])) continue;
    const t = Math.max(0, (ground - y) / ground);
    const ny = Math.min(g.h - 1, y + Math.round(sink * t * 1.6));
    const nx = Math.min(g.w - 1, Math.max(0, x - Math.round(sink * t * 0.9)));
    out.px[ny][nx] = g.px[y][x];
  }
  return finish(out, { ground, shadowW: 9, inkSoft: 'qQ' });
}

const BOB = [0, -1, 0, -1];
const walk4 = fn => clip([fn(0, BOB[0]), fn(1, BOB[1]), fn(2, BOB[2]), fn(3, BOB[3])], 8);

export const SPRITES = {
  troop_peasant_idle: clip([peasant(1, 0), peasant(1, -1)], 3),
  troop_peasant_walk: clip([peasant(0, 0), peasant(1, -1), peasant(2, 0), peasant(3, -1)], 8),
  troop_peasant_death: clip([fell(peasant(1, 0), 0, 15, GR), fell(peasant(1, 0), 1, 15, GR), fell(peasant(1, 0), 2, 15, GR)], 6, false),

  troop_guard_idle: clip([guard(1, 0), guard(1, -1)], 3),
  troop_guard_walk: clip([guard(0, 0), guard(1, -1), guard(0, 0), guard(1, -1)], 8),
  troop_guard_death: clip([fell(guard(1, 0), 0, 16, GR), fell(guard(1, 0), 1, 16, GR), fell(guard(1, 0), 2, 16, GR)], 6, false),

  troop_outrider_idle: clip([outrider(0), outrider(2)], 4),
  troop_outrider_walk: clip([outrider(0), outrider(1), outrider(2), outrider(3)], 10),
  troop_outrider_death: clip([fell(outrider(0), 0, 15, GR), fell(outrider(0), 1, 15, GR), fell(outrider(0), 2, 15, GR)], 6, false),

  troop_knight_idle: clip([knight(1, 0), knight(1, -1)], 3),
  troop_knight_walk: clip([knight(0, 0), knight(1, -1), knight(0, 0), knight(1, -1)], 7),
  troop_knight_death: clip([fell(knight(1, 0), 0, 16, GR), fell(knight(1, 0), 1, 16, GR), fell(knight(1, 0), 2, 16, GR)], 6, false),

  troop_paladin_idle: clip([paladin(1, 0), paladin(1, -1)], 3),
  troop_paladin_walk: clip([paladin(0, 0), paladin(1, -1), paladin(0, 0), paladin(1, -1)], 6),
  troop_paladin_death: clip([fell(paladin(1, 0), 0, 16, GR), fell(paladin(1, 0), 1, 16, GR), fell(paladin(1, 0), 2, 16, GR)], 6, false),

  troop_banner_sergeant_idle: clip([bannerSergeant(1, 0), bannerSergeant(1, -1)], 3),
  troop_banner_sergeant_walk: clip([bannerSergeant(0, 0), bannerSergeant(1, -1), bannerSergeant(0, 0), bannerSergeant(1, -1)], 8),
  troop_banner_sergeant_ability: clip([0, 1, 2, 3].map(f => bannerSergeant(1, 0, f)), 9, false),
  troop_banner_sergeant_death: clip([fell(bannerSergeant(1, 0), 0, 16, GR), fell(bannerSergeant(1, 0), 1, 16, GR), fell(bannerSergeant(1, 0), 2, 16, GR)], 6, false),

  troop_pavise_guard_idle: clip([paviseGuard(1), paviseGuard(1)], 2),
  troop_pavise_guard_walk: clip([paviseGuard(0), paviseGuard(1), paviseGuard(0), paviseGuard(1)], 6),
  troop_pavise_guard_ability: clip([0, 1, 2, 3].map(f => paviseGuard(1, f)), 10, false),
  troop_pavise_guard_death: clip([fell(paviseGuard(1), 0, 14, GR), fell(paviseGuard(1), 1, 14, GR), fell(paviseGuard(1), 2, 14, GR)], 6, false),

  troop_knight_lieutenant_idle: clip([knightLieutenant(1, 0), knightLieutenant(1, -1)], 3),
  troop_knight_lieutenant_walk: clip([knightLieutenant(0, 0), knightLieutenant(1, -1), knightLieutenant(0, 0), knightLieutenant(1, -1)], 7),
  troop_knight_lieutenant_ability: clip([0, 1, 2, 3].map(f => knightLieutenant(1, 0, f)), 10, false),
  troop_knight_lieutenant_death: clip([fell(knightLieutenant(1, 0), 0, 22, 39), fell(knightLieutenant(1, 0), 1, 22, 39), fell(knightLieutenant(1, 0), 2, 22, 39)], 6, false),

  troop_golden_prince_idle: clip([goldenPrince(0), goldenPrince(2)], 4),
  troop_golden_prince_walk: clip([goldenPrince(0), goldenPrince(1), goldenPrince(2), goldenPrince(3)], 9),
  troop_golden_prince_carry: clip([princeCarry(0), princeCarry(1), princeCarry(0), princeCarry(1)], 5),
  troop_golden_prince_death: clip([fell(goldenPrince(0), 0, 15, GR), fell(goldenPrince(0), 1, 15, GR), fell(goldenPrince(0), 2, 15, GR)], 6, false),

  troop_general_idle: clip([general(1, 0), general(1, -1)], 3),
  troop_general_walk: clip([general(0, 0), general(1, -1), general(0, 0), general(1, -1)], 6),
  troop_general_ability: clip([0, 1, 2, 3].map(f => general(1, 0, f)), 9, false),
  troop_general_death: clip([fell(general(1, 0), 0, 28, 50), fell(general(1, 0), 1, 28, 50), fell(general(1, 0), 2, 28, 50)], 5, false),
};
