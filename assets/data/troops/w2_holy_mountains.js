// troops/w2_holy_mountains.js — W2 HOLY MOUNTAINS · clergy and zealots. All 10 archetypes.
//
// Faint W2 thread: bleached cream robes over holy stone, a COLD halo-gold trim, and a sunburst
// stamped small. Everything in this army is vertical and clean — where W1 slouches and carries
// farm tools, W2 stands straight and carries relics. No shared body: ten separate anatomies.

import { overlay, erase } from '../lib/draw.js';
import { grid, set, disc, ellipse, line, poly, clone } from '../lib/pixel.js';
import { W2 } from './_worlds.js';
import { clip, finish, SIZE, fxHeal, fxFrenzy, fxInvulnShimmer, fxSummon, fxVanish } from './_troop_lib.js';

export const LEGEND = W2.legend;
const FIN = { rimCh: 'f', skip: 'kKqQ12345', aoFrom: 'cde', aoCh: 'a' };
const S = SIZE.normal, GR = 28;

/** A hooded robe: a bell of cloth with a dark cowl opening. Each unit sizes it differently. */
function robe(g, cx, top, bottom, halfTop, halfBot, ramp3) {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const half = Math.round(halfTop + (halfBot - halfTop) * t);
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half || 1);
      set(g, cx + x, y, u < 0.22 ? ramp3[2] : u > 0.78 ? ramp3[0] : ramp3[1]);
    }
  }
}

// ═══ 1 · ACOLYTE ══════════════════════════════════════════════════════════════
// The smallest robe in the army, and the only unit whose face is fully inside a cowl.
function acolyte(pose, bob) {
  const g = grid(S, S);
  robe(g, 16, 13, 27, 4, 7, ['c', 'd', 'e']);
  overlay(g, [[10, 13, 'ccdd'], [11, 12, 'cddeed'], [12, 12, 'cdkked'], [13, 13, 'cdde']]);
  disc(g, 16, 15, 2, 'a');                                                        // cowl shadow
  set(g, 17, 15, '3');
  for (let y = 12; y <= 22; y++) set(g, 22, y, 'W');                              // censer chain
  disc(g, 22, 23 + (pose ? 1 : 0), 2.4, 'M'); set(g, 22, 23 + (pose ? 1 : 0), 'o');
  W2.motif(g, 16, 21, 'M');
  overlay(g, pose === 0 ? [[28, 14, 'cc``cc']] : [[28, 15, 'cccc']]);
  if (bob) { const src = clone(g); erase(g, 0, 8, S, 16);
    for (let y = 8; y < 24; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 6 });
}

// ═══ 2 · FLAGELLANT ═══════════════════════════════════════════════════════════
// Bare-chested, half-starved, a knotted scourge whipping over his head. The only ragged,
// asymmetric outline in a world of clean verticals. [Frenzy]
function flagellant(pose, ab = -1) {
  const g = grid(S, S);
  for (let i = 0; i < 9; i++) set(g, 20 + i, 6 + Math.round(Math.sin(i * 0.9) * 3), 'a');  // scourge
  for (const t of [0, 1, 2]) line(g, 28, 8 + t, 24 + t, 3 + t * 2, 'c');
  overlay(g, [
    [9, 14, '333'], [10, 13, '34443'], [11, 13, '3k4k3'], [12, 14, '233'],         // gaunt face, no hood
    [13, 12, '2333332'], [14, 12, '2334332'],                                       // ribs
    [15, 12, '2233322'], [16, 12, '2334332'], [17, 13, '23332'],
    [18, 12, 'aMMMMa'],                                                             // rope belt
  ]);
  robe(g, 16, 19, 27, 5, 8, ['a', 'c', 'd']);
  for (let i = 0; i < 5; i++) set(g, 12 + i * 2, 22 + (i % 2) * 3, 'a');           // torn hem
  W2.motif(g, 16, 24, 'M');
  overlay(g, pose === 0 ? [[28, 13, 'cc``cc']] : [[28, 14, 'cccc']]);
  if (ab >= 0) fxFrenzy(g, ab, 4, 16, 15, 'M');
  return finish(g, { ...FIN, ground: GR, shadowW: 7 });
}

// ═══ 3 · BARD ═════════════════════════════════════════════════════════════════
// A LUTE held across the chest and a wide feathered cap — the only round-bodied instrument
// silhouette in the game. Stops walking to play. [StationaryPerformer]
function bard(pose, ab = -1) {
  const g = grid(S, S);
  ellipse(g, 11, 19, 6, 5, 'W');                                                   // lute body
  ellipse(g, 10, 18, 4, 3.4, 'v'); disc(g, 12, 19, 1.6, 'a');
  for (let y = 8; y <= 16; y++) { set(g, 17, y, 'W'); set(g, 18, y, 'v'); }        // neck
  for (let x = 16; x <= 19; x++) set(g, x, 7, 'M');
  overlay(g, [
    [8, 14, 'dee'], [9, 12, 'cddeee'], [10, 13, 'cdde'],                            // feathered cap
    [7, 18, 'M'], [8, 19, 'o'], [6, 17, 'M'],
    [11, 14, '344'], [12, 14, '3k4'], [13, 15, '33'],
    [14, 13, 'cddec'], [15, 13, 'cdMec'], [16, 13, 'cddec'],
  ]);
  robe(g, 16, 17, 27, 5, 7, ['c', 'd', 'e']);
  W2.motif(g, 18, 22, 'M');
  overlay(g, pose === 0 ? [[28, 14, 'cc``cc']] : [[28, 15, 'cccc']]);
  if (ab >= 0) for (let i = 0; i < 4; i++) {                                        // notes on the air
    const nx = 22 + i * 2, ny = 14 - ab * 2 - (i % 2) * 3;
    set(g, nx, ny, 'o'); set(g, nx + 1, ny - 1, 'M'); set(g, nx + 1, ny - 2, 'M');
  }
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// ═══ 4 · TEMPLE GUARD ═════════════════════════════════════════════════════════
// A tall crested tower-helm and a POLE-AXE held vertically — the tallest hard vertical in W2.
function templeGuard(pose, bob) {
  const g = grid(S, S);
  for (let y = 4; y <= 26; y++) { set(g, 23, y, 'W'); set(g, 24, y, 'v'); }        // haft
  poly(g, [[22, 2], [27, 6], [22, 8]], 'j');                                       // axe blade
  set(g, 23, 1, 'j'); set(g, 23, 0, 'M');
  overlay(g, [
    [7, 15, 'M'], [8, 14, 'oMo'],                                                   // helm crest
    [9, 13, 'rRRRr'], [10, 13, 'rRkRr'], [11, 13, 'rRRRr'], [12, 13, 'rRRRr'], [13, 14, 'rRr'],
    [14, 10, 'rRRRRRRRr'], [15, 9, 'rRRRRRRRRRr'], [16, 9, 'rRRRRRRRRRr'],
    [17, 10, 'mMMMMMMMm'],
    [18, 10, 'rRRRRRRRr'], [19, 11, 'rRRRRRr'], [20, 11, 'rRRRRRr'],
  ]);
  robe(g, 15, 21, 27, 6, 8, ['c', 'd', 'e']);
  W2.motif(g, 15, 24, 'M');
  overlay(g, pose === 0 ? [[28, 12, 'rr``rr']] : [[28, 13, 'rrrr']]);
  if (bob) { const src = clone(g); erase(g, 0, 6, S, 16);
    for (let y = 6; y < 22; y++) for (let x = 0; x < S; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// ═══ 5 · WAR CLERIC ═══════════════════════════════════════════════════════════
// A MITRE — the split peak nothing else has — with a mace low and a book held open. [HealAura]
function warCleric(pose, ab = -1) {
  const g = grid(S, S);
  overlay(g, [
    [6, 14, 'M`M'], [7, 13, 'oMMMo'], [8, 13, 'cdMdc'], [9, 13, 'cddec'],           // mitre
    [10, 14, 'cdd'], [11, 14, '344'], [12, 14, '3k4'], [13, 15, '33'],
  ]);
  robe(g, 16, 14, 27, 6, 9, ['c', 'd', 'e']);
  for (let y = 16; y <= 22; y++) for (let x = 21; x <= 26; x++)                     // open book
    set(g, x, y, x === 23 ? 'a' : x < 23 ? 'e' : 'f');
  for (let x = 21; x <= 26; x++) { set(g, x, 15, 'M'); set(g, x, 23, 'm'); }
  for (let y = 17; y <= 24; y++) set(g, 9, y, 'W');                                 // mace
  disc(g, 9, 26, 2.4, 'r'); disc(g, 9, 26, 1.2, 'R');
  W2.motif(g, 16, 20, 'o');
  overlay(g, pose === 0 ? [[28, 14, 'cc``cc']] : [[28, 15, 'cccc']]);
  if (ab >= 0) fxHeal(g, ab, 4, 16, 16, 'o');
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// ═══ 6 · INQUISITOR ═══════════════════════════════════════════════════════════
// A tall flat-brimmed hat and a heavy censer swinging on a long chain, well out from the body.
// [CleanseAura]
function inquisitor(pose, ab = -1) {
  const g = grid(S, S);
  for (let y = 4; y <= 10; y++) for (let x = 12; x <= 18; x++) set(g, x, y, x < 14 ? 'd' : x > 17 ? 'a' : 'c');
  for (let x = 8; x <= 22; x++) { set(g, x, 11, 'c'); set(g, x, 12, 'a'); }         // wide flat brim
  for (let x = 12; x <= 18; x++) set(g, x, 9, 'M');
  overlay(g, [[13, 14, '344'], [14, 14, '3k4'], [15, 15, '33']]);
  robe(g, 15, 16, 27, 6, 10, ['a', 'c', 'd']);
  const sw = pose ? 3 : -3;
  for (let i = 0; i < 8; i++) set(g, 22 + Math.round(i * 0.5), 14 + i, 'W');        // chain
  disc(g, 26 + sw, 23, 3, 'M'); disc(g, 26 + sw, 23, 1.6, 'o');
  for (let i = 0; i < 3; i++) set(g, 26 + sw, 26 + i, 'm');
  W2.motif(g, 15, 21, 'o');
  overlay(g, pose === 0 ? [[28, 13, 'cc``cc']] : [[28, 14, 'cccc']]);
  if (ab >= 0) for (let i = 0; i < 10; i++) {                                        // cleansing motes
    const a = (i / 10) * Math.PI * 2 + ab * 0.5, r = 6 + ab * 3;
    set(g, 15 + Math.cos(a) * r, 20 + Math.sin(a) * r * 0.5, i % 2 ? 'o' : 'M');
  }
  return finish(g, { ...FIN, ground: GR, shadowW: 8 });
}

// ═══ 7 · MONK ═════════════════════════════════════════════════════════════════
// Bald, barefoot, a plain staff. The only completely uncovered head in the army — and the
// leanest outline. Transforms into the Templar at 80% path (D-04c). [PathProgressTransform]
function monk(pose, ab = -1) {
  const g = grid(S, S);
  for (let y = 6; y <= 27; y++) set(g, 21, y, 'W');                                 // staff
  set(g, 21, 5, 'M'); disc(g, 21, 4, 1.4, 'o');
  overlay(g, [
    [10, 14, '444'], [11, 13, '34443'], [12, 13, '3k4k3'], [13, 14, '233'],         // bald head
    [14, 13, '23332'],
  ]);
  robe(g, 16, 15, 27, 5, 7, ['c', 'd', 'e']);
  for (let y = 16; y <= 24; y++) set(g, 13, y, 'M');                                // sash over one shoulder
  W2.motif(g, 18, 20, 'o');
  overlay(g, pose === 0 ? [[26, 14, '2``2'], [27, 14, '2``2'], [28, 13, '33``33']]
                        : [[26, 15, '22'], [27, 15, '22'], [28, 14, '3333']]);
  if (ab >= 0) fxVanish(g, ab, 4, 16, 18, 'o');                                     // the transform
  return finish(g, { ...FIN, ground: GR, shadowW: 6 });
}

// ═══ 8 · TEMPLAR (champion, 44) ═══════════════════════════════════════════════
// What the Monk becomes: full plate under a tabard, a huge cross-blazoned shield.
// [ThresholdInvuln]
function templar(pose, bob, ab = -1) {
  const C = SIZE.champion, G2 = 39;
  const g = grid(C, C);
  for (let y = 12; y <= 34; y++) for (let x = 26; x <= 38; x++) {                   // great shield
    set(g, x, y, x < 29 ? 'e' : x > 36 ? 'c' : 'f');
  }
  for (let y = 12; y <= 34; y++) { set(g, 32, y, 'M'); set(g, 33, y, 'm'); }        // the cross
  for (let x = 26; x <= 38; x++) { set(g, x, 20, 'M'); set(g, x, 21, 'm'); }
  overlay(g, [
    [13, 18, 'rRRRr'], [14, 18, 'rRkRr'], [15, 18, 'rRRRr'], [16, 19, 'rRr'],
    [11, 19, 'oMo'],                                                                 // halo-gold crest
    [17, 15, 'rRRRRRRRRRr'], [18, 14, 'rRRRRRRRRRRRr'], [19, 14, 'rRRRRRRRRRRRr'],
    [20, 15, 'ccddeeddccd'],                                                         // tabard
    [21, 15, 'ccdMMMMdccd'], [22, 15, 'ccddeeddccd'], [23, 16, 'ccddeeddc'],
  ]);
  for (let y = 8; y <= 26; y++) { set(g, 12, y, 'r'); set(g, 13, y, 'R'); }         // sword
  poly(g, [[11, 8], [14, 8], [12, 3]], 'j');
  W2.motif(g, 21, 26, 'o');
  const legs = [];
  for (let y = 24; y <= 38; y++) {
    const t = (y - 24) / 14;
    if (pose === 0) legs.push([y, 18 - Math.round(t * 2), 'rRR' + '`'.repeat(Math.round(t * 6) + 2) + 'RRr']);
    else legs.push([y, 19, 'rRRRRRr']);
  }
  overlay(g, legs);
  if (bob) { const src = clone(g); erase(g, 0, 10, C, 14);
    for (let y = 10; y < 24; y++) for (let x = 0; x < C; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) fxInvulnShimmer(g, ab, 4, 22, 20, 'o', 'M');
  return finish(g, { ...FIN, ground: G2, shadowW: 11 });
}

// ═══ 9 · SERAPH (flying) ══════════════════════════════════════════════════════
// WINGS. Six of them, in three pairs, and no legs at all — it never touches the ground, so it
// gets a detached shadow far below (Q-14). [WaterborneFlight]
function seraph(beat) {
  const g = grid(S, S);
  const flap = [0, -2, -3, -2][beat];
  for (const s of [-1, 1]) for (const [wy, len] of [[10, 11], [15, 13], [20, 10]]) {
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const x = 16 + s * (4 + i), y = wy + Math.round(t * 4) + flap * (1 - t);
      set(g, x, y, t < 0.3 ? 'f' : t < 0.7 ? 'e' : 'd');
      set(g, x, y + 1, 'c');
    }
  }
  overlay(g, [
    [11, 14, 'ddee'], [12, 13, 'cddeed'], [13, 13, 'cd44ed'], [14, 14, 'c4k4'],
    [15, 14, 'cdde'],
  ]);
  for (let a = 0; a < 360; a += 20) {                                                // halo
    const t = a * Math.PI / 180;
    set(g, 16 + Math.cos(t) * 6, 9 + Math.sin(t) * 2.2, 'o');
  }
  robe(g, 16, 16, 25, 4, 6, ['c', 'd', 'e']);
  for (let i = 0; i < 5; i++) set(g, 14 + i, 26 + (i % 2), 'c');                     // trailing hem
  W2.motif(g, 16, 20, 'M');
  const out = finish(g, { ...FIN, ground: 30, shadowW: 0 });
  for (let x = -5; x <= 5; x++) for (let y = -1; y <= 1; y++)                        // detached shadow
    if (x * x / 25 + y * y <= 1) set(out, 16 + x, 30 + y, 'q');
  return out;
}

// ═══ 10 · HIGH PRIEST (boss, 56) ══════════════════════════════════════════════
// A vast mitre, a crozier taller than he is, and a robe that pools on the ground.
// [CleanseAura + ContinuousSummon]
function highPriest(pose, bob, ab = -1) {
  const B = SIZE.boss, G3 = 50;
  const g = grid(B, B);
  for (let y = 6; y <= 44; y++) { set(g, 43, y, 'd'); set(g, 44, y, 'e'); }         // crozier
  for (let a = 200; a < 400; a += 8) {
    const t = a * Math.PI / 180;
    set(g, 43 + Math.cos(t) * 5, 9 + Math.sin(t) * 5, 'o');
  }
  overlay(g, [
    [8, 24, 'M```M'], [9, 23, 'oMMMMMo'], [10, 22, 'cddMMMddc'], [11, 22, 'cdddddddc'],
    [12, 22, 'cddeeeddc'], [13, 23, 'cddeddc'],                                       // the great mitre
    [14, 24, 'cd44dc'], [15, 24, 'c4k44c'], [16, 25, 'c443c'],
  ]);
  robe(g, 28, 18, 48, 8, 18, ['c', 'd', 'e']);
  for (let y = 22; y <= 46; y += 6) for (let x = -14; x <= 14; x++)                  // gold courses
    set(g, 28 + x, y, (x + y) % 4 ? 'm' : 'M');
  for (let x = 12; x <= 44; x++) set(g, x, 48, 'a');                                 // pooled hem
  W2.motif(g, 28, 30, 'o');
  if (bob) { const src = clone(g); erase(g, 0, 6, B, 20);
    for (let y = 6; y < 26; y++) for (let x = 0; x < B; x++) if (src.px[y][x] !== '`') g.px[Math.max(0, y + bob)][x] = src.px[y][x]; }
  if (ab >= 0) { fxSummon(g, ab, 4, 28, G3 - 4, 'M', 'o'); fxHeal(g, ab, 4, 28, 26, 'o'); }
  return finish(g, { ...FIN, ground: G3, shadowW: 16 });
}

// ── shared death: fold toward the ground, keeping the identifying relic ───────
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
  troop_acolyte_idle: clip([acolyte(1, 0), acolyte(1, -1)], 3),
  troop_acolyte_walk: clip([acolyte(0, 0), acolyte(1, -1), acolyte(0, 0), acolyte(1, -1)], 8),
  troop_acolyte_death: D(acolyte(1, 0)),

  troop_flagellant_idle: clip([flagellant(1), flagellant(0)], 4),
  troop_flagellant_walk: clip([flagellant(0), flagellant(1), flagellant(0), flagellant(1)], 10),
  troop_flagellant_ability: clip([0, 1, 2, 3].map(f => flagellant(1, f)), 12, false),
  troop_flagellant_death: D(flagellant(1)),

  troop_bard_idle: clip([bard(1), bard(0)], 3),
  troop_bard_walk: clip([bard(0), bard(1), bard(0), bard(1)], 7),
  troop_bard_ability: clip([0, 1, 2, 3].map(f => bard(1, f)), 7, false),
  troop_bard_death: D(bard(1)),

  troop_temple_guard_idle: clip([templeGuard(1, 0), templeGuard(1, -1)], 3),
  troop_temple_guard_walk: clip([templeGuard(0, 0), templeGuard(1, -1), templeGuard(0, 0), templeGuard(1, -1)], 7),
  troop_temple_guard_death: D(templeGuard(1, 0)),

  troop_war_cleric_idle: clip([warCleric(1), warCleric(0)], 3),
  troop_war_cleric_walk: clip([warCleric(0), warCleric(1), warCleric(0), warCleric(1)], 8),
  troop_war_cleric_ability: clip([0, 1, 2, 3].map(f => warCleric(1, f)), 8, false),
  troop_war_cleric_death: D(warCleric(1)),

  troop_inquisitor_idle: clip([inquisitor(1), inquisitor(0)], 3),
  troop_inquisitor_walk: clip([inquisitor(0), inquisitor(1), inquisitor(0), inquisitor(1)], 8),
  troop_inquisitor_ability: clip([0, 1, 2, 3].map(f => inquisitor(1, f)), 9, false),
  troop_inquisitor_death: D(inquisitor(1)),

  troop_monk_idle: clip([monk(1), monk(0)], 3),
  troop_monk_walk: clip([monk(0), monk(1), monk(0), monk(1)], 9),
  troop_monk_ability: clip([0, 1, 2, 3].map(f => monk(1, f)), 10, false),
  troop_monk_death: D(monk(1)),

  troop_templar_idle: clip([templar(1, 0), templar(1, -1)], 3),
  troop_templar_walk: clip([templar(0, 0), templar(1, -1), templar(0, 0), templar(1, -1)], 7),
  troop_templar_ability: clip([0, 1, 2, 3].map(f => templar(1, 0, f)), 10, false),
  troop_templar_death: D(templar(1, 0), 39),

  troop_seraph_idle: clip([seraph(0), seraph(1), seraph(2), seraph(3)], 6),
  troop_seraph_fly: clip([seraph(0), seraph(1), seraph(2), seraph(3)], 10),
  troop_seraph_death: D(seraph(0), 30),

  troop_high_priest_idle: clip([highPriest(1, 0), highPriest(1, -1)], 3),
  troop_high_priest_walk: clip([highPriest(0, 0), highPriest(1, -1), highPriest(0, 0), highPriest(1, -1)], 6),
  troop_high_priest_ability: clip([0, 1, 2, 3].map(f => highPriest(1, 0, f)), 8, false),
  troop_high_priest_death: D(highPriest(1, 0), 50),
};
