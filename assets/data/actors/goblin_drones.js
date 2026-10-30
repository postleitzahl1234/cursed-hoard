// actors/goblin_drones.js — the 6 GOBLIN drone/bomber ACTORS, cruising + attacking.
//
// These are not towers and not projectiles. D-26 makes the Goblin drone and bomber lines
// **launch platforms with no turret** — the fighting is done by separate flying actors that the
// engine spawns, flies to the target, and returns. `SpriteKeys.droneUnit(type, attacking)` asks
// for `<tower>_unit` and `<tower>_unit_attack`, so each of the six towers owns two sprites.
//
// D-26 is explicit on two points and both are honoured here:
//   • "Drone actors are distinct per tier (Bay → Swarm → Foundry → Sky Carrier escalate by
//     design, not recolour)" — the rotor count, hull and armament all change, not the palette.
//   • "bomber drones differ from attack drones (the Bomber/Carpet airship rig ≠ the small rotor
//     seekers)" — the two bombers are gasbag airships with gondolas, a different species.
//
// Canvas: 32×32 for the rotor seekers, 48×48 for the airships, matching the engine's draw size
// exactly so nothing is resampled (1× density, A-1).

import { grid, set, ellipse, disc, line, rows, ramp, clip } from '../projectiles/_proj_lib.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',
  q: 'SH1',                                             // the shadow a flyer casts (Q-14)
  a: 'BR1', b: 'BR2', B: 'BR3', c: 'BR4', C: 'BR5',     // brass hull
  i: 'IR0', I: 'IR2', j: 'IR4', J: 'IR6',               // iron frame, guns, rotors
  e: 'EM2', E: 'EM4', x: 'EM6',                         // exhaust, muzzle flash
  t: 'TX1', T: 'TX3',                                   // toxin coolant glow
  g: 'GB2', G: 'GB4',                                   // a goblin pilot, 2 px of him
  w: 'WD2', W: 'WD4',                                   // timber gondola decking
};

/** A spinning rotor seen edge-on: a blurred disc when the frame is "hot". */
function rotor(g, cx, cy, span, blur) {
  for (let i = -span; i <= span; i++) set(g, cx + i, cy, blur ? (i % 2 ? 'I' : 'J') : 'J');
  if (blur) { for (let i = -span; i <= span; i += 2) set(g, cx + i, cy - 1, 'i'); }
  set(g, cx, cy - 1, 'j'); set(g, cx, cy - 2, 'i');      // the mast
}

/** The hull: a squat brass pod, lit NW. */
function pod(g, cx, cy, rx, ry) {
  ellipse(g, cx, cy, rx, ry, 'b');
  ellipse(g, cx - rx * 0.3, cy - ry * 0.3, rx * 0.6, ry * 0.5, 'c');
  ellipse(g, cx + rx * 0.4, cy + ry * 0.4, rx * 0.5, ry * 0.4, 'a');
  for (let i = -Math.round(rx); i <= Math.round(rx); i += 3) set(g, cx + i, cy - Math.round(ry) + 1, 'C');
}

/** A gasbag: the airships' defining mass, and nothing the seekers have. */
function gasbag(g, cx, cy, rx, ry) {
  ellipse(g, cx, cy, rx, ry, 'a');
  ellipse(g, cx, cy - 1, rx - 1, ry - 1, 'b');
  ellipse(g, cx - rx * 0.35, cy - ry * 0.45, rx * 0.45, ry * 0.4, 'B');
  for (let i = -Math.round(rx) + 2; i <= Math.round(rx) - 2; i += 5) {
    for (let y = -Math.round(ry) + 1; y <= Math.round(ry) - 1; y++) set(g, cx + i, cy + y, 'a');
  }
}

export const SPRITES = {
  // ══ ATTACK DRONES — small rotor seekers, escalating ═══════════════════════════

  // T3 · one pod, TWO rotors, a single stub gun. The floor of the line.
  goblin_t3_drone_bay_unit: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 27, 5, 1.6, 'q');
    pod(g, 16, 16, 5, 4);
    for (const dx of [-8, 8]) { line(g, 16, 15, 16 + dx, 12, 'j'); rotor(g, 16 + dx, 11, 5, f); }
    for (let i = 0; i < 4; i++) set(g, 21 + i, 17, 'J');
    if (f) { set(g, 25, 17, 'x'); set(g, 26, 17, 'E'); }
  }, 14),

  goblin_t3_drone_bay_unit_attack: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 27, 5, 1.6, 'q');
    pod(g, 16, 16, 5, 4);
    for (const dx of [-8, 8]) { line(g, 16, 15, 16 + dx, 12, 'j'); rotor(g, 16 + dx, 11, 5, true); }
    for (let i = 0; i < 4; i++) set(g, 21 + i, 17, 'J');
    disc(g, 26 + f, 17, 2 - f * 0.6, 'E'); set(g, 26 + f, 17, 'x');
  }, 18),

  // T4 · bigger pod, FOUR rotors, twin guns, a visible pilot.
  goblin_t4_drone_swarm_unit: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 28, 6, 1.8, 'q');
    pod(g, 16, 17, 6, 5);
    set(g, 15, 15, 'g'); set(g, 16, 15, 'G');
    for (const [dx, dy] of [[-9, -3], [9, -3], [-7, 4], [7, 4]]) {
      line(g, 16, 17, 16 + dx, 15 + dy, 'j'); rotor(g, 16 + dx, 14 + dy, 4, f);
    }
    for (const gy of [15, 20]) for (let i = 0; i < 4; i++) set(g, 22 + i, gy, 'J');
  }, 14),

  goblin_t4_drone_swarm_unit_attack: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 28, 6, 1.8, 'q');
    pod(g, 16, 17, 6, 5);
    set(g, 15, 15, 'g'); set(g, 16, 15, 'G');
    for (const [dx, dy] of [[-9, -3], [9, -3], [-7, 4], [7, 4]]) {
      line(g, 16, 17, 16 + dx, 15 + dy, 'j'); rotor(g, 16 + dx, 14 + dy, 4, true);
    }
    for (const gy of [15, 20]) {
      for (let i = 0; i < 4; i++) set(g, 22 + i, gy, 'J');
      disc(g, 27 + f, gy, 1.8, 'E'); set(g, 27 + f, gy, 'x');
    }
  }, 18),

  // T5 · armoured: shield plates over the pod, side ammo pods, coolant glow.
  goblin_t5_drone_foundry_unit: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 29, 7, 2, 'q');
    pod(g, 16, 18, 7, 6);
    for (let y = 13; y <= 23; y++) for (let x = 9; x <= 12; x++) set(g, x, y, x < 11 ? 'J' : 'I');  // armour
    set(g, 16, 15, 'G');
    for (const [dx, dy] of [[-10, -4], [10, -4], [-9, 5], [9, 5]]) {
      line(g, 16, 18, 16 + dx, 16 + dy, 'j'); rotor(g, 16 + dx, 15 + dy, 5, f);
    }
    for (const py of [14, 22]) { ellipse(g, 23, py, 2.4, 2, 'I'); set(g, 23, py, 't'); }
    for (let i = 0; i < 5; i++) set(g, 23 + i, 18, 'J');
    if (f) { set(g, 12, 20, 'T'); set(g, 12, 16, 'T'); }
  }, 14),

  goblin_t5_drone_foundry_unit_attack: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 29, 7, 2, 'q');
    pod(g, 16, 18, 7, 6);
    for (let y = 13; y <= 23; y++) for (let x = 9; x <= 12; x++) set(g, x, y, x < 11 ? 'J' : 'I');
    set(g, 16, 15, 'G');
    for (const [dx, dy] of [[-10, -4], [10, -4], [-9, 5], [9, 5]]) {
      line(g, 16, 18, 16 + dx, 16 + dy, 'j'); rotor(g, 16 + dx, 15 + dy, 5, true);
    }
    for (const py of [14, 22]) {
      ellipse(g, 23, py, 2.4, 2, 'I'); set(g, 23, py, 'T');
      disc(g, 27 + f, py, 2, 'E'); set(g, 27 + f, py, 'x');
    }
    for (let i = 0; i < 5; i++) set(g, 23 + i, 18, 'J');
    disc(g, 29, 18, 2.2 - f * 0.5, 'x');
  }, 20),

  // T6 · the heaviest seeker: SIX rotors, a slung turret, aerials.
  goblin_t6_sky_carrier_unit: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 30, 8, 2.2, 'q');
    pod(g, 16, 17, 9, 6);
    for (let x = 8; x <= 24; x += 4) set(g, x, 11, 'C');
    set(g, 15, 14, 'g'); set(g, 17, 14, 'G');
    for (const [dx, dy] of [[-12, -3], [12, -3], [-12, 3], [12, 3], [-4, 7], [4, 7]]) {
      line(g, 16, 17, 16 + dx, 15 + dy, 'j'); rotor(g, 16 + dx, 14 + dy, 4, f);
    }
    ellipse(g, 16, 23, 4, 2.4, 'I');                       // the slung turret
    for (let i = 0; i < 5; i++) set(g, 20 + i, 23, 'J');
    for (const ax of [11, 21]) { line(g, ax, 12, ax, 6, 'i'); set(g, ax, 5, 'T'); }   // aerials
  }, 14),

  goblin_t6_sky_carrier_unit_attack: clip(32, 32, 2, (g, f) => {
    ellipse(g, 16, 30, 8, 2.2, 'q');
    pod(g, 16, 17, 9, 6);
    for (let x = 8; x <= 24; x += 4) set(g, x, 11, 'C');
    set(g, 15, 14, 'g'); set(g, 17, 14, 'G');
    for (const [dx, dy] of [[-12, -3], [12, -3], [-12, 3], [12, 3], [-4, 7], [4, 7]]) {
      line(g, 16, 17, 16 + dx, 15 + dy, 'j'); rotor(g, 16 + dx, 14 + dy, 4, true);
    }
    ellipse(g, 16, 23, 4, 2.4, 'I');
    for (let i = 0; i < 5; i++) set(g, 20 + i, 23, 'J');
    disc(g, 27 + f, 23, 2.4, 'E'); disc(g, 27 + f, 23, 1.2, 'x');
    for (const ax of [11, 21]) { line(g, ax, 12, ax, 6, 'i'); set(g, ax, 5, 'x'); }
  }, 20),

  // ══ BOMBERS — airships. A different species, per D-26. ════════════════════════

  // T5 · one gasbag, one gondola, a rack of bombs.
  goblin_t5_bomber_drone_unit: clip(48, 48, 2, (g, f) => {
    ellipse(g, 24, 44, 12, 2.6, 'q');
    gasbag(g, 24, 18, 17, 9);
    for (const s of [-1, 1]) { line(g, 24 + s * 17, 18, 24 + s * 21, 18, 'a'); }
    for (let x = 17; x <= 31; x++) { set(g, x, 29, 'W'); set(g, x, 30, 'w'); }   // gondola
    for (let x = 18; x <= 30; x++) set(g, x, 28, 'I');
    set(g, 21, 27, 'g'); set(g, 23, 27, 'G');
    for (const s of [-1, 1]) line(g, 24 + s * 8, 27, 24 + s * 12, 24, 'i');
    for (let i = 0; i < 4; i++) { ellipse(g, 19 + i * 4, 33, 1.6, 2.2, 'I'); set(g, 19 + i * 4, 35, 'J'); }
    ellipse(g, 34, 29, 2.6, 2.2, 'j');                      // stern engine
    for (let i = 0; i < 3; i++) set(g, 37 + i, 29, f ? 'E' : 'e');
  }, 8),

  goblin_t5_bomber_drone_unit_attack: clip(48, 48, 2, (g, f) => {
    ellipse(g, 24, 44, 12, 2.6, 'q');
    gasbag(g, 24, 18, 17, 9);
    for (const s of [-1, 1]) { line(g, 24 + s * 17, 18, 24 + s * 21, 18, 'a'); }
    for (let x = 17; x <= 31; x++) { set(g, x, 29, 'W'); set(g, x, 30, 'w'); }
    for (let x = 18; x <= 30; x++) set(g, x, 28, 'I');
    set(g, 21, 27, 'g'); set(g, 23, 27, 'G');
    for (let x = 20; x <= 28; x++) set(g, x, 31, 'k');      // bay doors open
    for (let i = 0; i < 3; i++) {                            // bombs away
      const bx = 21 + i * 3, by = 34 + i * 4 + f * 2;
      ellipse(g, bx, by, 1.6, 2.2, 'I'); set(g, bx, by + 2, 'J');
    }
    ellipse(g, 34, 29, 2.6, 2.2, 'j');
    for (let i = 0; i < 3; i++) set(g, 37 + i, 29, 'x');
  }, 10),

  // T6 · a bigger hull, TWIN gasbags, four engines, a long bomb bay.
  goblin_t6_carpet_bomber_unit: clip(48, 48, 2, (g, f) => {
    ellipse(g, 24, 45, 15, 3, 'q');
    gasbag(g, 24, 14, 21, 8);
    gasbag(g, 24, 24, 17, 5);
    for (const s of [-1, 1]) line(g, 24 + s * 21, 14, 24 + s * 25, 14, 'a');
    for (let x = 13; x <= 35; x++) { set(g, x, 33, 'W'); set(g, x, 34, 'w'); set(g, x, 35, 'i'); }
    for (let x = 14; x <= 34; x++) set(g, x, 32, 'I');
    set(g, 18, 31, 'g'); set(g, 20, 31, 'G'); set(g, 28, 31, 'g');
    for (const [ex, ey] of [[9, 27], [39, 27], [11, 34], [37, 34]]) {   // four engine nacelles
      ellipse(g, ex, ey, 3, 2.4, 'j');
      for (let i = 0; i < 4; i++) set(g, ex + (ex > 24 ? i + 3 : -i - 3), ey, f ? 'E' : 'e');
      rotor(g, ex, ey - 4, 3, f);
    }
    for (let i = 0; i < 7; i++) { ellipse(g, 15 + i * 3, 38, 1.4, 2, 'I'); set(g, 15 + i * 3, 40, 'J'); }
  }, 8),

  goblin_t6_carpet_bomber_unit_attack: clip(48, 48, 2, (g, f) => {
    ellipse(g, 24, 45, 15, 3, 'q');
    gasbag(g, 24, 14, 21, 8);
    gasbag(g, 24, 24, 17, 5);
    for (const s of [-1, 1]) line(g, 24 + s * 21, 14, 24 + s * 25, 14, 'a');
    for (let x = 13; x <= 35; x++) { set(g, x, 33, 'W'); set(g, x, 34, 'w'); set(g, x, 35, 'i'); }
    for (let x = 14; x <= 34; x++) set(g, x, 32, 'I');
    set(g, 18, 31, 'g'); set(g, 20, 31, 'G'); set(g, 28, 31, 'g');
    for (let x = 15; x <= 33; x++) set(g, x, 36, 'k');       // the whole bay is open
    for (const [ex, ey] of [[9, 27], [39, 27], [11, 34], [37, 34]]) {
      ellipse(g, ex, ey, 3, 2.4, 'j');
      for (let i = 0; i < 4; i++) set(g, ex + (ex > 24 ? i + 3 : -i - 3), ey, 'x');
      rotor(g, ex, ey - 4, 3, true);
    }
    for (let i = 0; i < 6; i++) {                            // a carpet, not a single stick
      const bx = 15 + i * 4, by = 39 + (i % 3) * 3 + f * 2;
      ellipse(g, bx, by, 1.4, 2, 'I'); set(g, bx, by + 2, 'J');
    }
  }, 10),
};
