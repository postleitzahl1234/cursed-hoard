// towers/_manifest.js — the contract every tower file must satisfy.
//
// Source of truth for the armament column is `redesign/instructions for claude design/TOWERS.md`
// (D-20 / D-27 / D-29). This file makes that prose MACHINE-READABLE so the build can check it:
//
//   • `massing`  — the one-line silhouette. Two towers in a faction may never share one.
//   • `levers`   — D-27 requires ≥5 differences from the tier's predecessor. Tracked as numbers
//                  so `scripts/tower-levers.mjs` can count them instead of trusting the artist.
//   • `aim`      — which rig in lib/aim.js turns toward the target:
//                    'barrel'  Orc + Goblin gun/ordnance  (D-23)
//                    'lantern' Crypt — rune-lantern swings, spire stays put
//                    'idol'    Demon — shrine idol's head turns, plume leans downrange
//                    'hatch'   Goblin drone/bomber — bay doors face the lane (D-26, no turret)
//
// A tower is DONE when its file exists, its SPEC matches this row, it emits a `_base` plus five
// `_aim_<facing>` sprites, and it passes scripts/silhouette-gate.mjs against its faction siblings.

export const MANIFEST = {
  // ── ORC · timber, iron and green turf. Rounded "den" masses; rhombus boss. ──────────────
  orc_t1_watchpost: {
    tier: 1, faction: 'ORC', aim: 'barrel', file: 'orc_t1_watchpost.js',
    massing: 'one low turf den, 40% canvas height, bare stake scaffold',
    armament: 'hand-spanned crossbow on a squat log post; one iron bolt in a notched rest',
    levers: { height: 38, masses: 1, bands: 0, spikes: 0, rhombus: 1, barrelLen: 16 },
  },
  orc_t2_bolt_thrower: {
    tier: 2, faction: 'ORC', aim: 'barrel', file: 'orc_t2_bolt_thrower.js',
    massing: 'squat den under a wide planked firing deck; side crank-wheel breaks the outline',
    armament: 'torsion bolt-thrower: two skeined rope-springs + a thick stave on a planked frame',
    levers: { height: 48, masses: 2, bands: 1, spikes: 0, rhombus: 1, barrelLen: 20 },
  },
  orc_t3_crossbow_nest: {
    tier: 3, faction: 'ORC', aim: 'barrel', file: 'orc_t3_crossbow_nest.js',
    massing: 'ELEVATED nest box on four splayed stilts — open air under the tower, unique in the tree',
    armament: 'rotating timber turret with a fan of 3-4 small crossbows + side quiver-racks',
    levers: { height: 60, masses: 2, bands: 1, spikes: 2, rhombus: 2, barrelLen: 18 },
  },
  orc_t4_ballista: {
    tier: 4, faction: 'ORC', aim: 'barrel', file: 'orc_t4_ballista.js',
    massing: 'TALL AND LEAN — a narrow drum tower, the thinnest Orc silhouette',
    armament: 'full war-ballista: long limbs, sinew bundles, spear-bolt in an iron-banded channel',
    levers: { height: 72, masses: 2, bands: 2, spikes: 3, rhombus: 2, barrelLen: 30 },
  },
  orc_t3_bombard: {
    tier: 3, faction: 'ORC', aim: 'barrel', file: 'orc_t3_bombard.js',
    massing: 'SQUAT AND BROAD — one wide low drum, wider than it is tall',
    armament: 'stubby cast-iron mortar on a timber cradle, muzzle skyward, fused bomb in the mouth',
    levers: { height: 42, masses: 1, bands: 1, spikes: 0, rhombus: 3, barrelLen: 12 },
  },
  orc_t4_catapult: {
    tier: 4, faction: 'ORC', aim: 'barrel', file: 'orc_t4_catapult.js',
    massing: 'big TRIANGULAR A-FRAME dominating a low den — the only triangle in the Orc tree',
    armament: 'counterweight catapult: tall A-frame, swinging arm, sling + boulder in the cup',
    levers: { height: 66, masses: 2, bands: 1, spikes: 0, rhombus: 2, barrelLen: 24 },
  },
  orc_t5_harpoon_cannon: {
    tier: 5, faction: 'ORC', aim: 'barrel', file: 'orc_t5_harpoon_cannon.js',
    massing: 'stone pier with a chain-spool drum bolted to its flank — asymmetric, nautical',
    armament: 'deck-gun harpoon launcher: one huge barbed harpoon on a coiled-chain spool',
    levers: { height: 58, masses: 2, bands: 2, spikes: 2, rhombus: 2, barrelLen: 34 },
  },
  orc_t6_dread_harpoon: {
    tier: 6, faction: 'ORC', aim: 'barrel', file: 'orc_t6_dread_harpoon.js',
    massing: 'twin-drum engine behind a jutting skull-iron prow — reads as a ship, not a tower',
    armament: 'twin-track harpoon engine: two barbed harpoons, paired chain-drums, skull prow',
    levers: { height: 70, masses: 3, bands: 3, spikes: 5, rhombus: 3, barrelLen: 38 },
  },
  orc_t5_scattergun_rig: {
    tier: 5, faction: 'ORC', aim: 'barrel', file: 'orc_t5_scattergun_rig.js',
    massing: 'OPEN BRACED FRAMEWORK — you can see through it; almost no solid mass',
    armament: 'splayed fan of short scatter-barrels on a braced rig with an ammo belt',
    levers: { height: 56, masses: 1, bands: 1, spikes: 4, rhombus: 1, barrelLen: 14 },
  },
  orc_t6_war_rig: {
    tier: 6, faction: 'ORC', aim: 'barrel', file: 'orc_t6_war_rig.js',
    massing: 'armoured box carriage with a tall smoke-stack — boxy, not rounded; the odd one out',
    armament: 'triple-barrel rotating rig on an armored carriage, ammo hoppers + smoke-stack',
    levers: { height: 68, masses: 3, bands: 3, spikes: 4, rhombus: 2, barrelLen: 22 },
  },
  orc_t5_siege_mortar: {
    tier: 5, faction: 'ORC', aim: 'barrel', file: 'orc_t5_siege_mortar.js',
    massing: 'SUNKEN — dug into a stone revetment, the lowest profile of any T5/T6 in the game',
    armament: 'wide-bore mortar: a fat blast-scarred tube in a dug-in stone base, oversized shell',
    levers: { height: 40, masses: 2, bands: 2, spikes: 0, rhombus: 2, barrelLen: 18 },
  },
  orc_t6_doomsday_cannon: {
    tier: 6, faction: 'ORC', aim: 'barrel', file: 'orc_t6_doomsday_cannon.js',
    massing: 'three stepped dens under a siege cannon; banded, spiked, trophy-hung — largest Orc mass',
    armament: 'colossal iron-banded cannon on a riveted siege-platform, barrel-rings + chains',
    levers: { height: 78, masses: 3, bands: 3, spikes: 10, rhombus: 6, barrelLen: 30 },
  },

  // ── CRYPT · spires, tiny windows, orbiting charges. Fear branch carries CR violet. ──────
  crypt_t1_crypt:             { tier: 1, faction: 'CRYPT', aim: 'lantern', massing: 'small headstone spire, single ledge', armament: 'one pale frost-charge orbits the peak and drops as the shot' },
  crypt_t2_crypt_ii:          { tier: 2, faction: 'CRYPT', aim: 'lantern', massing: 'taller mausoleum spire, ringed finial', armament: 'brighter ice-charge circles; carved frost-runes' },
  crypt_t3_frost_crypt_i:     { tier: 3, faction: 'CRYPT', aim: 'lantern', massing: 'ice-clad obelisk, crystalline crown ring, icicle fringe', armament: 'TWO frost-charges orbit' },
  crypt_t4_frost_crypt_ii:    { tier: 4, faction: 'CRYPT', aim: 'lantern', massing: 'glacier-spire with a caged frozen orb on top', armament: 'heavier charges, drifting freeze-mist' },
  crypt_t3_fear_crypt_i:      { tier: 3, faction: 'CRYPT', aim: 'lantern', massing: 'blackened gravestone spire trailing a violet wisp', armament: 'a single spectral skull-charge orbits' },
  crypt_t4_fear_crypt_ii:     { tier: 4, faction: 'CRYPT', aim: 'lantern', massing: 'wraith-shrine: skull finial, tattered shroud — ragged outline', armament: 'TWO wailing curse-charges circling' },
  crypt_t5_college_frost_i:   { tier: 5, faction: 'CRYPT', aim: 'lantern', massing: 'frost-orrery spire: a mechanical armillary ring', armament: 'several charges orbiting in formation' },
  crypt_t6_college_frost_ii:  { tier: 6, faction: 'CRYPT', aim: 'lantern', massing: 'the orrery doubled — stacked armillary rings, frozen buttresses', armament: 'a dense crown of charges' },
  crypt_t5_lightning_crypt_i: { tier: 5, faction: 'CRYPT', aim: 'lantern', massing: 'conductor-spire topped by an iron Tesla finial', armament: 'a single volt-charge crackles' },
  crypt_t6_lightning_crypt_ii:{ tier: 6, faction: 'CRYPT', aim: 'lantern', massing: 'storm-spire bristling with rods + coil-rings', armament: 'a forking chain-bolt leaps between them' },
  crypt_t5_terror_crypt_i:    { tier: 5, faction: 'CRYPT', aim: 'lantern', massing: 'bone-cathedral spire with a giant screaming-skull crown', armament: 'a terror-wave pulses from the maw' },
  crypt_t6_terror_crypt_ii:   { tier: 6, faction: 'CRYPT', aim: 'lantern', massing: 'the cathedral risen — stacked skulls, shroud-draped belfry', armament: 'rolling curse-fog, wider pulse' },

  // ── DEMON · Aztec stepped pyramids. Beam wing TALL, pyre wing SHORTEST/BROADEST (D-27). ─
  demon_t1_imp_brazier:       { tier: 1, faction: 'DEMON', aim: 'idol', massing: 'small horned obsidian brazier on one terrace', armament: 'flickering coal-mouth spitting a short ember burst' },
  demon_t2_hellforge:         { tier: 2, faction: 'DEMON', aim: 'idol', massing: 'chained iron forge-altar, anvil-like bulk, two terraces', armament: 'a wider fire-grate venting flame' },
  demon_t3_hellbeam:          { tier: 3, faction: 'DEMON', aim: 'idol', massing: 'TALL narrow ziggurat under a forward-aimed obsidian horn', armament: 'glowing focusing-lens eye channels a steady ray' },
  demon_t4_searing_lance:     { tier: 4, faction: 'DEMON', aim: 'idol', massing: 'taller, sleeker, sharper — the leanest Demon mass', armament: 'twin-horn lance-emitter on a swivel, focusing collar' },
  demon_t3_hellfire_pyre:     { tier: 3, faction: 'DEMON', aim: 'idol', massing: 'ROUND AND LOW — an open lava-font bowl on a broad stepped altar', armament: 'erupts a ring of flame around itself' },
  demon_t4_pyroclasm_altar:   { tier: 4, faction: 'DEMON', aim: 'idol', massing: 'cracked magma altar, broader still, overflowing lava channels', armament: 'a wider, fiercer flame-nova' },
  demon_t5_abyssal_ray:       { tier: 5, faction: 'DEMON', aim: 'idol', massing: 'a great daemon-skull emitter crowning a tall ziggurat', armament: 'eyes ablaze, a deep throat-lens projecting a heavy ray' },
  demon_t6_doomray:           { tier: 6, faction: 'DEMON', aim: 'idol', massing: 'the skull haloed with focusing-runes and side-horns — tallest beam mass', armament: 'extreme piercing ray, heat-haze' },
  demon_t5_brimstone_battery: { tier: 5, faction: 'DEMON', aim: 'idol', massing: 'a lava-cradle mortar on a mid ziggurat — the SAME weapon as T6, scaled weaker (D-29)', armament: 'lobs firebombs' },
  demon_t6_magma_mortar:      { tier: 6, faction: 'DEMON', aim: 'idol', massing: 'a heavy single magma-mortar on a basalt carriage — same line, full size', armament: 'big lava-shells + ground-fire trail' },
  demon_t5_lake_of_fire:      { tier: 5, faction: 'DEMON', aim: null,   massing: 'a WIDE SUNKEN caldera ringed with horns — broadest, lowest', armament: 'a continuous burning pool churns around the tower' },
  demon_t6_infernal_caldera:  { tier: 6, faction: 'DEMON', aim: null,   massing: 'a volcano-mouth risen on a basalt mound — tallest Demon mass', armament: 'lava fountains, vast sustained burn-field' },

  // ── GOBLIN · riveted brass machinery. Drone/bomber = launch platforms, no turret (D-26). ─
  goblin_t1_workshop:         { tier: 1, faction: 'GOBLIN', aim: 'barrel', massing: 'lopsided brass shack with a smokestack', armament: 'a single spring-loaded bolt-arm out a window' },
  goblin_t2_tinker_tower:     { tier: 2, faction: 'GOBLIN', aim: 'barrel', massing: 'taller riveted contraption, gauges + a spinning gear', armament: 'a faster piston bolt-arm' },
  goblin_t3_drone_bay:        { tier: 3, faction: 'GOBLIN', aim: 'hatch',  massing: 'brass tower with ONE open hangar hatch', armament: '1-2 little rotor-drones parked/launching on a rail' },
  goblin_t4_drone_swarm:      { tier: 4, faction: 'GOBLIN', aim: 'hatch',  massing: 'double hangar-rig, antennae and signal-flags', armament: 'multiple launch rails + parked drones' },
  goblin_t3_gatling_turret:   { tier: 3, faction: 'GOBLIN', aim: 'barrel', massing: 'geared mount on a compact riveted drum', armament: 'a cranked multi-barrel brass gatling, ammo belt feeding in' },
  goblin_t4_spike_cannon:     { tier: 4, faction: 'GOBLIN', aim: 'barrel', massing: 'heavy braced block with a hopper on top', armament: 'single-barrel spike-thrower with a recoil spring' },
  goblin_t5_drone_foundry:    { tier: 5, faction: 'GOBLIN', aim: 'hatch',  massing: 'a chimneyed foundry-keep with several bays', armament: 'mass-produces drones; a swarm hovers above' },
  goblin_t6_sky_carrier:      { tier: 6, faction: 'GOBLIN', aim: 'hatch',  massing: 'a grounded carrier DECK ON STILTS — widest Goblin silhouette', armament: 'launch catapults + a dense drone swarm overhead' },
  goblin_t5_bomber_drone:     { tier: 5, faction: 'GOBLIN', aim: 'hatch',  massing: 'a TALL TETHERED MAST — the thinnest Goblin silhouette', armament: 'launches one big bomber-blimp; bomb-racks visible' },
  goblin_t6_carpet_bomber:    { tier: 6, faction: 'GOBLIN', aim: 'hatch',  massing: 'a larger airship-dock with gantries', armament: 'a heavy multi-engine bomber + strings of bombs' },
  goblin_t5_auger_cannon:     { tier: 5, faction: 'GOBLIN', aim: 'barrel', massing: 'braced gun-house, exhaust pipes down one flank', armament: 'a giant auger-bit mounted as the barrel' },
  goblin_t6_doom_driller:     { tier: 6, faction: 'GOBLIN', aim: 'barrel', massing: 'a colossal rig on treads and braces — heaviest brass mass', armament: 'twin augers, exhaust pipes + grinding gears' },
};

/** Every tower key, in tree order. */
export const KEYS = Object.keys(MANIFEST);

/** The 12 keys of one faction. */
export const byFaction = f => KEYS.filter(k => MANIFEST[k].faction === f);

/** Rows that have an authored file yet — the rebuild's progress marker. */
export const authored = () => KEYS.filter(k => MANIFEST[k].file);
