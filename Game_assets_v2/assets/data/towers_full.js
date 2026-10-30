// assets/data/towers_full.js — §1 the 48-tower roster at 2× density (64×128, foot anchor).
// D-23: ORC & GOBLIN = faction-distinct STATIC BASE + rotating 8-way DIRECTIONAL TURRET
// (card cycles all 8 facings firing; *_base card = bare structure). CRYPT & DEMON = single
// static F=4 sprites. Every tier escalates by ≥5 levers (size · layers/intricacy · darker colour
// · stripes+silver/gold trim · spikes · bigger weapon) and every BRANCH has its own structure —
// see towerbases.js. 4th roster field = branch.
import { G, outline, gridToRows, CX, DIRS, FACE_ORDER, turretBolt, turretCannon, turretMulti, turretGatling, turretAuger, turretCatapult, turretBoltArm, turretSpike, droneActor, bomberActor, wpBrazier, wpBeam, wpPyre, wpMortar } from './towerkit.js';
import { baseOrc, baseGoblin, baseCrypt, baseDemon } from './towerbases.js';

export const META = { group: 'Towers (full tree · 48 + D-23 turrets)', blurb: "D-23: Orc & Goblin = static base + rotating 8-way directional turret (each card cycles all 8 facings firing; the *_base card is the bare structure). Crypt & Demon = single static F=4 sprites. Four faction-distinct silhouettes, each branch its OWN building (Crypt: frost ice-obelisk · fear shroud-spire · lightning tesla-rod · college orrery · terror bone-belfry; Demon: beam horn-tower vs pyre caldera), and every tier escalates by size · intricacy/layers · darker colour · stripes + silver→gold trim · spikes · bigger weapon." };

export const LEGEND = {
  '`': null, 'o': 'IK1', 'O': 'IK0', '.': 'IK3',
  'a': 'MS1', 'u': 'MS2', 'e': 'MS3', 'E': 'MS5', 'q': 'MS6',          // mossy green (Orc body)
  'm': 'MS4',                                                          // moss-green mid accent
  '7': 'WD1', '8': 'WD3', '9': 'WD5',                                  // brown wood (orc timber accents)
  'k': 'RK1', 'K': 'RK2', 'j': 'RK3', 'J': 'RK4', 'l': 'RK5', 'L': 'RK6', // grey (smoke, dark stone)
  'T': 'AQ1', 'U': 'AQ2', 'Q': 'AQ4',                                  // cold blue ashlar (Crypt)
  'i': 'IR1', 's': 'IR3', 'I': 'IR4', 'S': 'IR5', 'g': 'IR6',          // iron / steel
  'n': 'BR1', 'N': 'BR3', 'B': 'BR4', 'b': 'BR5',                      // brass / copper (Goblin)
  'h': 'GD1', 'G': 'GD3', 'Y': 'GD5',                                  // gold trim
  'y': 'BN5',                                                          // bone (finials, skulls, tusks)
  'p': 'BL2', 'P': 'BL3',                                              // blood
  'd': 'DM1', 'D': 'DM3', 'A': 'DM5',                                  // obsidian (Demon)
  'f': 'EM2', 'F': 'EM4', 'r': 'EM5', 'R': 'EM6', '#': 'EM7',          // fire / lava
  'c': 'IC1', 'C': 'IC3', 'w': 'IC5', 'z': 'IC0',                      // ice / frost
  'v': 'CR2', 'V': 'CR4', 'x': 'HX3', 'X': 'HX5', 'H': 'HX1',          // curse / fear
  '1': 'VL1', '2': 'VL2', '3': 'VL3', '4': 'VL4',                      // volt
};

// ---- assembly ----
function staticTower(faction, tier, branch, wopt) {           // Crypt / Demon — one static sprite, F=4
  const base = faction === 'crypt' ? baseCrypt : baseDemon;
  const w = Object.assign({ branch }, wopt);
  const frames = [];
  for (let fr = 0; fr < 4; fr++) { const g = G(); base(g, tier, fr, w); outline(g); frames.push(gridToRows(g)); }
  return { anchor: 'foot', fps: 6, loop: true, frames };
}
function turretTower(faction, tier, branch, turretFn) {       // Orc / Goblin — base + rotating turret
  const base = faction === 'orc' ? baseOrc : baseGoblin;
  const frames = [];
  FACE_ORDER.forEach((face, i) => { const g = G(); const seatY = base(g, tier, branch); turretFn(g, CX, seatY, DIRS[face], i % 4); outline(g); frames.push(gridToRows(g)); });
  return { anchor: 'foot', fps: 4, loop: true, frames };
}
function staticBase(faction, tier, branch) {
  const g = G(); (faction === 'orc' ? baseOrc : baseGoblin)(g, tier, branch); outline(g);
  return { anchor: 'foot', fps: 1, loop: false, frames: [gridToRows(g)] };
}
function launchPad(tier, branch) {                            // goblin drone/bomber tower = static platform
  const g = G(); baseGoblin(g, tier, branch); outline(g);
  return { anchor: 'foot', fps: 1, loop: false, frames: [gridToRows(g)] };
}
function airActor(actorFn, tier, big, mode) {                 // flying drone/bomber actor, F=4, centre anchor
  const frames = [];
  for (let fr = 0; fr < 4; fr++) { const g = G(); actorFn(g, fr, { tier, big, mode }); outline(g); frames.push(gridToRows(g)); }
  return { anchor: 'center', fps: mode === 'attack' ? 8 : 6, loop: true, frames };
}
const T = (fn, opt = {}) => (g, x, y, d, fr) => fn(g, x, y, d, fr, opt);

// ======================= ORC — log fort + steel bolt/bomb turrets =======================
const ORC = {
  orc_t1_watchpost:       [1, 'bolt',   T(turretBolt, { limb: 6, len: 16 })],
  orc_t2_bolt_thrower:    [2, 'bolt',   T(turretBolt, { limb: 9, len: 20 })],
  orc_t3_crossbow_nest:   [3, 'bolt',   T(turretBolt, { limb: 13, len: 19 })],
  orc_t4_ballista:        [4, 'bolt',   T(turretBolt, { limb: 14, len: 27, gold: true, barbs: 1 })],
  orc_t3_bombard:         [3, 'bomb',   T(turretCannon, { bore: 4, len: 12, shell: true })],
  orc_t4_catapult:        [4, 'bomb',   T(turretCatapult, {})],
  orc_t5_harpoon_cannon:  [5, 'bolt',   T(turretBolt, { limb: 9, len: 30, barbs: 3, gold: true })],
  orc_t6_dread_harpoon:   [6, 'bolt',   T(turretBolt, { limb: 11, len: 33, barbs: 3, gold: true, twin: true })],
  orc_t5_scattergun_rig:  [5, 'shared', T(turretMulti, { n: 5, len: 13 })],
  orc_t6_war_rig:         [6, 'shared', T(turretMulti, { n: 6, len: 16 })],
  orc_t5_siege_mortar:    [5, 'bomb',   T(turretCannon, { bore: 6, len: 15, gold: true, shell: true })],
  orc_t6_doomsday_cannon: [6, 'bomb',   T(turretCannon, { bore: 8, len: 19, gold: true, shell: true })],
};
// ======================= GOBLIN — steampunk rig + brass turrets =======================
const GOBLIN = {
  goblin_t1_workshop:       [1, 'base',     T(turretBoltArm, { len: 10 })],
  goblin_t2_tinker_tower:   [2, 'base',     T(turretBoltArm, { len: 12, big: true })],
  goblin_t3_gatling_turret: [3, 'ordnance', T(turretGatling, { len: 13 })],
  goblin_t4_spike_cannon:   [4, 'ordnance', T(turretSpike, { len: 14 })],
  goblin_t5_auger_cannon:   [5, 'ordnance', T(turretAuger, {})],
  goblin_t6_doom_driller:   [6, 'ordnance', T(turretAuger, { twin: true })],
};
// drone & bomber towers = static launch platforms; the unit is a separate flying actor (see below)
const GOBLIN_AIR = {
  goblin_t3_drone_bay:      [3, 'drone',  'drone'],
  goblin_t4_drone_swarm:    [4, 'drone',  'drone'],
  goblin_t5_drone_foundry:  [5, 'drone',  'drone'],
  goblin_t6_sky_carrier:    [6, 'drone',  'drone'],
  goblin_t5_bomber_drone:   [5, 'bomber', 'bomber'],
  goblin_t6_carpet_bomber:  [6, 'bomber', 'bomber'],
};
// ======================= CRYPT — branch-distinct spires + orbiting charges =======================
const CRYPT = {
  crypt_t1_crypt:              [1, 'base',      { el: 'frost', count: 1, R: 9 }],
  crypt_t2_crypt_ii:           [2, 'base',      { el: 'frost', count: 1, R: 11 }],
  crypt_t3_frost_crypt_i:      [3, 'frost',     { el: 'frost', count: 2, R: 12 }],
  crypt_t4_frost_crypt_ii:     [4, 'frost',     { el: 'frost', count: 2, R: 14 }],
  crypt_t3_fear_crypt_i:       [3, 'fear',      { el: 'fear', count: 1, R: 12 }],
  crypt_t4_fear_crypt_ii:      [4, 'fear',      { el: 'fear', count: 2, R: 13 }],
  crypt_t5_college_frost_i:    [5, 'college',   { el: 'frost', count: 3, R: 15 }],
  crypt_t6_college_frost_ii:   [6, 'college',   { el: 'frost', count: 4, R: 17 }],
  crypt_t5_lightning_crypt_i:  [5, 'lightning', { el: 'volt', count: 1, R: 13, fork: true }],
  crypt_t6_lightning_crypt_ii: [6, 'lightning', { el: 'volt', count: 2, R: 15, fork: true }],
  crypt_t5_terror_crypt_i:     [5, 'terror',    { el: 'fear', count: 2, R: 14 }],
  crypt_t6_terror_crypt_ii:    [6, 'terror',    { el: 'fear', count: 3, R: 16 }],
};
// ======================= DEMON — beam-horn-tower vs pyre-caldera + fire =======================
const DEMON = {
  demon_t1_imp_brazier:       [1, 'base',   { fn: wpBrazier, half: 6 }],
  demon_t2_hellforge:         [2, 'base',   { fn: wpBrazier, half: 8 }],
  demon_t3_hellbeam:          [3, 'beam',   { fn: wpBeam }],
  demon_t4_searing_lance:     [4, 'beam',   { fn: wpBeam, horns: true }],
  demon_t3_hellfire_pyre:     [3, 'pyre',   { fn: wpPyre, half: 9 }],
  demon_t4_pyroclasm_altar:   [4, 'pyre',   { fn: wpPyre, half: 11 }],
  demon_t5_abyssal_ray:       [5, 'beam',   { fn: wpBeam, horns: true, skull: true }],
  demon_t6_doomray:           [6, 'beam',   { fn: wpBeam, horns: true, skull: true, halo: true }],
  demon_t5_brimstone_battery: [5, 'shared', { fn: wpMortar, bore: 6, len: 12 }],
  demon_t6_magma_mortar:      [6, 'shared', { fn: wpMortar, bore: 8, len: 15 }],
  demon_t5_lake_of_fire:      [5, 'pyre',   { fn: wpPyre, half: 13 }],
  demon_t6_infernal_caldera:  [6, 'pyre',   { fn: wpPyre, half: 14, tall: true }],
};

export const SPRITES = {};
for (const [k, [tier, br, fn]] of Object.entries(ORC)) { SPRITES[k] = turretTower('orc', tier, br, fn); SPRITES[k + '_base'] = staticBase('orc', tier, br); }
for (const [k, [tier, br, fn]] of Object.entries(GOBLIN)) { SPRITES[k] = turretTower('goblin', tier, br, fn); SPRITES[k + '_base'] = staticBase('goblin', tier, br); }
for (const [k, [tier, br, kind]] of Object.entries(GOBLIN_AIR)) {
  SPRITES[k] = launchPad(tier, br);                                              // the tower (static platform)
  const big = tier >= 6, actorFn = kind === 'bomber' ? bomberActor : droneActor;
  SPRITES[k + '_unit'] = airActor(actorFn, tier, big, 'fly');                    // flying loop
  SPRITES[k + '_unit_attack'] = airActor(actorFn, tier, big, 'attack');          // firing / bombing loop
}
for (const [k, [tier, br, wopt]] of Object.entries(CRYPT)) SPRITES[k] = staticTower('crypt', tier, br, wopt);
for (const [k, [tier, br, wopt]] of Object.entries(DEMON)) SPRITES[k] = staticTower('demon', tier, br, wopt);
