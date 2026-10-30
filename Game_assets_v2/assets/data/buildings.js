// assets/data/buildings.js — the 17 structures. Landmarks, not scenery.
//
// Canvases match the engine's draw sizes exactly, so nothing is resampled:
//   keeps (castle · citadel · stronghold · laboratory · portal)   96×96
//   gem cave                                                      80×80
//   everything else                                               72×72
//
// ── Why they got bigger ─────────────────────────────────────────────────────
// At 68/56/52 a keep was barely two cells tall and lost against the ground it stood on. 96 is
// exactly the width of a building's own 3×2 blueprint footprint — the building is as wide as the
// plot it owns, which is the natural anchor and stops the size being an arbitrary number. It also
// buys roughly double the pixel area, which is what actually pays for detail: at 68 px a window
// was two pixels and read as noise; at 96 it can have a frame, a sill and a lit interior.
//
// ── Why they stand off the landscape ────────────────────────────────────────
// Three deliberate separations, none of which is "make it brighter":
//
//   1. **An ink contour.** D-08's weighted exterior line, heavier on the SE where the form turns
//      from the key. NOTHING on the ground has one — tiles are edge-to-edge fill and trees carry
//      only their own shading — so the outline alone reads as "this is an object, not terrain".
//   2. **Warm interior light.** Every occupied building has lit windows in the ember/gold range.
//      The ground never uses those hues except for W5's embers, so a lit window is unambiguous.
//   3. **A real cast shadow**, wide and offset SE, sitting the mass on the ground. A building with
//      no shadow floats; a building with a shadow displaces.
//
// ── Distinctness ────────────────────────────────────────────────────────────
// D-28 applies here as it does to units. Each is separated by **massing** — how many volumes,
// how they stack, what the outline does against the sky:
//
//   village        three separate gables, no single dominant mass
//   castle         one square block, four corner turrets, crenellated flat top
//   tavern         long and LOW, one huge chimney off-centre, hanging sign
//   citadel        vertical — a spire far taller than it is wide
//   palm_spring    barely a building: a low dome beside open water
//   stronghold     a stepped ziggurat, every step visible in the outline
//   power_station  a squat drum with two tall stacks — an industrial pair
//   laboratory     a glass hemisphere on a brass frame; the only curved top
//   shadow_pool    a ring of standing stones, hollow in the middle
//   portal         a freestanding arch — the only building you can see through
//   gold mines     timber A-frame → winch tower → stone headframe across three tiers
//   mana wells     a bare ring → a roofed well → an obelisk with a floating shard
//   gem cave       a cave MOUTH: an opening, the only concave silhouette in the set
//
// ── Damage ──────────────────────────────────────────────────────────────────
// Capturable buildings need five frames. The four ruined states are *derived*, not drawn (see
// lib/structure.js). Eighty-five hand-authored frames would be eighty-five chances to draw a roof
// that does not match its own pristine state; a damage state is the same building minus material,
// so computing it is the only way to guarantee the ruin is a ruin of THIS building.

import { grid, set, get, rect, line, ellipse } from './lib/pixel.js';
import { outline, innerLine } from './lib/ink.js';
import { noise } from './lib/shade.js';
import { masonry, bark, damageStates, seq, blank } from './lib/structure.js';

export const META = { group: 'Buildings', blurb: 'Seventeen structures at 1x density on 96/80/72 px canvases, separated by massing rather than roof colour, each with an ink contour, lit windows and a cast shadow so it reads as an object on the terrain rather than part of it. Four derived damage states apiece.' };

export const LEGEND = {
  '`': null,
  // ink + shadow — the two things the ground never has
  o: 'IK0', O: 'IK1', c: 'IK2', C: 'IK3',
  '!': 'SH1', ';': 'SH0',
  // stone
  s: 'RK2', S: 'RK4', t: 'RK5', T: 'RK1',                 // cold grey ashlar
  y: 'HS1', Y: 'HS3', h: 'HS4',                           // warm holy stone
  d: 'SD2', D: 'SD4', E: 'SD5',                           // desert adobe
  // roofs — saturated, and deliberately NOT in any terrain ramp
  1: 'DM2', 2: 'DM4', 3: 'BL2',                           // fired clay tile
  4: 'AQ1', 5: 'AQ3', 6: 'IC3',                           // slate
  n: 'BN2', N: 'BN4',                                     // thatch
  // materials
  w: 'WD1', W: 'WD3', e: 'WD4', r: 'WD0',                 // timber
  m: 'BR1', M: 'BR3', b: 'BR5',                           // brass
  i: 'IR1', I: 'IR3', z: 'IR5',                           // iron
  g: 'GD2', G: 'GD4', k: 'GD5',                           // gold
  a: 'AQ2', A: 'AQ4', q: 'IC4',                           // water / glass
  u: 'UD1', U: 'UD3', v: 'HX2', V: 'HX4',                 // void / hex
  x: 'EM2', X: 'EM4', f: 'EM6',                           // firelight — the window signal
  p: 'PN2', P: 'MS3',                                     // planting
};

const KEEP = 96, CAVE = 80, SMALL = 72;

/** The three separations from §2 of the header, applied once, to everything. */
function finish(g) {
  const B = g.h - 1, CX = g.w >> 1, half = Math.round(g.w * 0.42);
  // cast shadow first, so the contour is not drawn around it
  for (let dx = -half; dx <= half; dx++) {
    const t = Math.abs(dx - half * 0.12) / half;             // offset SE, away from the key
    if (t > 1) continue;
    const depth = Math.round((1 - t * t) * 3.2);
    for (let d = 0; d <= depth; d++)
      if (get(g, CX + dx, B - d) === '`') set(g, CX + dx, B - d, d < depth ? '!' : ';');
  }
  outline(g, 'o', { soft: '!;xXfqV' });
  return g;
}

const build = (size, paint) => {
  const g = blank(size, size);
  paint(g, size, size - 4, size >> 1);
  return finish(g);
};

/** A lit window: frame, sill, and a warm interior. The single strongest "inhabited" signal. */
function window_(g, x, y, w, h, frame = 'r') {
  rect(g, x - 1, y - 1, w + 2, h + 2, frame, true);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++)
      set(g, x + i, y + j, j === 0 ? 'f' : noise(x + i, y + j, 7) > 0.4 ? 'X' : 'x');
  for (let i = -1; i <= w; i++) set(g, x + i, y + h + 1, 'C');   // sill shadow
}

/** Crenellations: the notch pattern IS the fortified reading. */
function crenel(g, x0, x1, y, ch, dark) {
  for (let x = x0; x <= x1; x++) {
    if (((x - x0) >> 1) % 2) continue;
    set(g, x, y, ch); set(g, x, y - 1, ch); set(g, x, y - 2, dark);
  }
}

/** A tiled gable: two pitches meeting at a ridge, courses drawn, lit on the west slope. */
function gable(g, cx, y0, half, h, dark, mid, ridge) {
  for (let d = 0; d < h; d++) {
    const wdt = Math.round(half * (d / h));
    for (let x = cx - wdt; x <= cx + wdt; x++)
      set(g, x, y0 + d, d % 3 === 0 ? 'o' : x < cx - wdt * 0.25 ? mid : dark);
  }
  for (let x = cx - half; x <= cx + half; x++) set(g, x, y0 + h, ridge);
  for (let x = cx - half - 1; x <= cx + half + 1; x++) set(g, x, y0 + h + 1, 'o');  // eaves line
}

// ── W1 ──────────────────────────────────────────────────────────────────────

const village = () => build(SMALL, (g, S, B, CX) => {
  // Three gables, none dominant: the silhouette is a settlement, not a building.
  const hut = (x, top, half, hh, lit) => {
    const wallTop = top + hh + 2;
    rect(g, x - half, wallTop, half * 2 + 1, B - wallTop, 'w', true);
    for (let yy = wallTop; yy <= B; yy++)
      for (let xx = x - half; xx <= x + half; xx++) {
        if (noise(xx, yy, 5) > 0.62) set(g, xx, yy, 'W');
        if ((yy - top - hh) % 7 === 0) set(g, xx, yy, 'r');       // timber framing
      }
    gable(g, x, top, half + 4, hh, 'n', 'N', 'r');
    if (lit) window_(g, x - 3, wallTop + 4, 5, 4);
    rect(g, x - 2, B - 7, 5, 7, 'C', true);                        // doorway
  };
  // Three huts that do not touch. The first pass had them at half-widths 9/8/12 spaced 17 apart,
  // so all three overlapped and the "settlement" massing collapsed into one lumpy building —
  // which is the one thing this species is not allowed to be.
  // Squat and WIDE. At half-widths 6/6/9 with tall gables these read as three little turrets —
  // a hut is a broad low box under a big roof, and the proportion is the whole species.
  hut(CX - 23, 40, 9, 7, true);
  hut(CX + 23, 44, 8, 6, false);
  hut(CX, 28, 11, 9, true);
  for (let i = 0; i < 9; i++) {                                    // a fence rail tying them together
    const x = CX - 28 + i * 7;
    set(g, x, B - 4, 'r'); set(g, x, B - 3, 'w'); set(g, x, B - 2, 'w');
  }
  for (let x = CX - 28; x <= CX + 28; x++) if (get(g, x, B - 5) === '`') set(g, x, B - 5, 'r');
});

const castle = () => build(KEEP, (g, S, B, CX) => {
  // One square block, four turrets, flat crenellated top. Reads as a solid rectangle.
  masonry(g, CX - 24, 32, 49, B - 31, ['s', 'S', 't'], 'T', 7, 6);
  crenel(g, CX - 24, CX + 24, 32, 't', 'T');
  innerLine(g, CX - 24, 44, CX + 24, 44, 'O');                     // string course
  for (const sx of [-1, 1]) {
    const x = CX + sx * 30;
    masonry(g, x - 6, 18, 13, B - 17, ['s', 'S', 't'], 'T', 11, 6);
    crenel(g, x - 6, x + 6, 18, 't', 'T');
    gable(g, x, 8, 8, 9, '4', '5', '6');                           // slate turret cap
    window_(g, x - 1, 34, 3, 6);
    window_(g, x - 1, 50, 3, 6);
  }
  window_(g, CX - 12, 42, 4, 7); window_(g, CX + 9, 42, 4, 7);
  window_(g, CX - 12, 58, 4, 7); window_(g, CX + 9, 58, 4, 7);
  // gate: an arched opening with a portcullis, not a black rectangle
  for (let y = B; y > B - 22; y--) {
    const t = (B - y) / 22, wdt = Math.round(7 * Math.sqrt(Math.max(0, 1 - t * t * 0.55)));
    for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, y, 'C');
  }
  for (let y = B - 4; y > B - 20; y -= 3) for (let x = CX - 6; x <= CX + 6; x++) set(g, x, y, 'i');
  for (let x = CX - 6; x <= CX + 6; x += 3) for (let y = B - 20; y <= B; y++) set(g, x, y, 'i');
  for (let d = 0; d < 8; d++) { set(g, CX - 8 - d, B - 22 + d, 'S'); set(g, CX + 8 + d, B - 22 + d, 'S'); }
  // banners either side of the gate
  for (const sx of [-1, 1]) {
    rect(g, CX + sx * 14, 46, 5, 16, '1', true);
    for (let y = 46; y < 62; y += 4) set(g, CX + sx * 16, y, '2');
    set(g, CX + sx * 16, 63, '1'); set(g, CX + sx * 16 - 1, 62, '1');
  }
});

// ── W2 ──────────────────────────────────────────────────────────────────────

const tavern = () => build(SMALL, (g, S, B, CX) => {
  // Long and LOW with one huge off-centre chimney. Proportion is the whole species.
  rect(g, 8, 40, S - 16, B - 39, 'w', true);
  for (let yy = 40; yy <= B; yy++)
    for (let xx = 8; xx < S - 8; xx++) {
      if (noise(xx, yy, 13) > 0.58) set(g, xx, yy, 'W');
      if ((xx - 8) % 11 === 0) set(g, xx, yy, 'r');                // half-timbered posts
    }
  gable(g, CX, 26, 30, 13, 'n', 'N', 'r');
  masonry(g, CX + 16, 10, 11, 34, ['s', 'S', 't'], 'T', 17, 5);    // the chimney
  for (let i = 0; i < 7; i++) set(g, CX + 20 + (i & 1), 9 - i, i > 3 ? 'C' : 'c');
  window_(g, CX - 20, 46, 5, 5); window_(g, CX - 6, 46, 5, 5); window_(g, CX + 6, 46, 5, 5);
  rect(g, CX - 3, B - 12, 7, 12, 'C', true);
  for (let y = B - 12; y > B - 16; y--) rect(g, CX - 3 + (B - 12 - y), y, 7 - (B - 12 - y) * 2, 1, 'C', true);
  line(g, CX - 24, 36, CX - 24, 44, 'i');                          // hanging sign
  rect(g, CX - 29, 44, 11, 8, 'e', true);
  set(g, CX - 24, 48, 'g'); set(g, CX - 25, 47, 'G'); set(g, CX - 23, 47, 'G');
});

const citadel = () => build(KEEP, (g, S, B, CX) => {
  // Vertical: a single spire, far taller than wide. The tallest outline in the set.
  masonry(g, CX - 16, 52, 33, B - 51, ['y', 'Y', 'h'], 'T', 19, 6);
  masonry(g, CX - 11, 22, 23, 31, ['y', 'Y', 'h'], 'T', 23, 6);
  for (const sx of [-1, 1]) {                                       // flying buttresses
    for (let d = 0; d < 12; d++) {
      const x = CX + sx * (11 + d), y = 54 + Math.round(d * 1.5);
      set(g, x, y, 'Y'); set(g, x, y + 1, 'y'); set(g, x, y - 1, 'h');
    }
    masonry(g, CX + sx * 24 - 3, 62, 7, B - 61, ['y', 'Y', 'h'], 'T', 27, 5);
  }
  for (let d = 0; d < 20; d++) {                                    // the steeple
    const wdt = Math.round(9 * (d / 20));
    for (let x = CX - wdt; x <= CX + wdt; x++)
      set(g, x, 2 + d, d % 3 === 0 ? 'o' : x < CX - wdt * 0.3 ? '6' : '5');
  }
  set(g, CX, 0, 'k'); set(g, CX, 1, 'G');
  ellipse(g, CX, 36, 7, 7, 'q');                                    // rose window
  ellipse(g, CX, 36, 5, 5, 'X');
  for (let a = 0; a < 8; a++) {
    const t = (a / 8) * Math.PI * 2;
    line(g, CX, 36, Math.round(CX + Math.cos(t) * 7), Math.round(36 + Math.sin(t) * 7), 'y');
  }
  window_(g, CX - 12, 60, 4, 9); window_(g, CX + 9, 60, 4, 9);
  for (let y = B; y > B - 16; y--) {                                // arched door
    const t = (B - y) / 16, wdt = Math.round(6 * Math.sqrt(Math.max(0, 1 - t * t * 0.5)));
    for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, y, 'C');
  }
  for (let d = 0; d < 5; d++) rect(g, CX - 12 + d, B - d, 25 - d * 2, 1, 'h', true);   // steps
});

// ── W3 ──────────────────────────────────────────────────────────────────────

const palmSpring = () => build(SMALL, (g, S, B, CX) => {
  // Barely a building: a low dome beside open water. Mostly negative space.
  ellipse(g, CX + 13, B - 7, 19, 7, 'a');
  ellipse(g, CX + 13, B - 8, 15, 5, 'A');
  for (let i = 0; i < 16; i++) set(g, CX + 3 + i, B - 11 + (i & 1), 'q');
  for (let d = 0; d < 17; d++) {                                    // the adobe dome
    const wdt = Math.round(17 * Math.sqrt(Math.max(0, 1 - (d / 17) ** 2)));
    for (let x = CX - 17 - wdt; x <= CX - 17 + wdt; x++)
      set(g, x, B - d, x < CX - 17 - wdt * 0.3 ? 'E' : noise(x, d, 3) > 0.5 ? 'D' : 'd');
  }
  for (let i = 0; i < 4; i++) rect(g, CX - 30, B - 6 - i * 4, 26, 1, 'r', true);   // roof beams
  window_(g, CX - 24, B - 14, 4, 4);
  rect(g, CX - 20, B - 9, 6, 9, 'C', true);
  for (let y = 24; y < B - 8; y++) bark(g, CX + 8, y, 4, 1, ['w', 'W', 'e'], 29);  // the palm
  for (let i = 0; i < 6; i++) {
    const a = Math.PI + (i / 5) * Math.PI;
    for (let s = 0; s < 13; s++)
      set(g, Math.round(CX + 10 + Math.cos(a) * s), Math.round(24 + Math.sin(a) * s * 0.5 + (s * s) / 16),
        s < 7 ? 'P' : 'p');
  }
});

const stronghold = () => build(KEEP, (g, S, B, CX) => {
  // A ziggurat: every step is visible in the outline, and nothing else here steps.
  for (let t = 0; t < 4; t++) {
    const half = 34 - t * 7, top = 26 + t * 14;
    masonry(g, CX - half, top, half * 2 + 1, B - top, ['d', 'D', 'E'], 'T', 31 + t, 7);
    crenel(g, CX - half, CX + half, top, 'E', 'T');
    innerLine(g, CX - half, top + 8, CX + half, top + 8, 'O');
    if (t < 3) { window_(g, CX - half + 6, top + 12, 4, 5); window_(g, CX + half - 9, top + 12, 4, 5); }
  }
  for (let y = B; y > B - 20; y--) {                                // arched gate
    const t = (B - y) / 20, wdt = Math.round(8 * Math.sqrt(Math.max(0, 1 - t * t * 0.6)));
    for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, y, 'C');
  }
  for (const sx of [-1, 1]) {                                       // brazier pair
    const x = CX + sx * 20;
    rect(g, x - 1, B - 12, 3, 12, 'w', true);
    ellipse(g, x, B - 14, 4, 3, 'i');
    ellipse(g, x, B - 16, 3, 3, 'X'); set(g, x, B - 18, 'f');
  }
});

// ── W4 ──────────────────────────────────────────────────────────────────────

const powerStation = () => build(SMALL, (g, S, B, CX) => {
  // An industrial PAIR: squat drum, two tall stacks. Two masses, very different heights.
  for (let y = 40; y <= B; y++)
    for (let x = CX - 22; x <= CX + 8; x++) {
      const t = (x - (CX - 22)) / 30, lit = 1 - Math.abs(t - 0.28) * 1.8;
      set(g, x, y, lit > 0.62 ? 'M' : lit > 0.2 ? 'm' : 'i');
    }
  for (let y = 40; y <= B; y += 8) for (let x = CX - 22; x <= CX + 8; x++) set(g, x, y, 'b');
  for (let x = CX - 22; x <= CX + 8; x += 7) for (let y = 42; y <= B - 2; y += 8) set(g, x, y, 'z');  // rivets
  for (const [x, top] of [[CX + 13, 8], [CX + 21, 18]]) {
    rect(g, x - 3, top, 7, B - top, 'i', true);
    rect(g, x - 3, top, 2, B - top, 'z', true);
    for (let y = top + 6; y < B; y += 9) rect(g, x - 4, y, 9, 2, 'I', true);   // stack bands
    rect(g, x - 5, top, 11, 3, 'I', true);
    for (let i = 0; i < 6; i++) set(g, x + (i & 1) - (i >> 2), top - 2 - i, i > 3 ? 'C' : 'c');
  }
  ellipse(g, CX - 13, 50, 6, 5, 'i');                               // firebox
  ellipse(g, CX - 13, 50, 4, 3, 'X'); ellipse(g, CX - 13, 50, 2, 1, 'f');
  line(g, CX - 22, 34, CX + 8, 34, 'i', 2);
  ellipse(g, CX - 4, 34, 5, 4, 'M'); ellipse(g, CX - 4, 34, 2, 2, 'q');        // pressure gauge
});

const laboratory = () => build(KEEP, (g, S, B, CX) => {
  // A glass hemisphere on a brass frame — the only curved-topped building in the set.
  masonry(g, CX - 28, 62, 57, B - 61, ['s', 'S', 't'], 'T', 41, 6);
  for (let d = 0; d < 30; d++) {
    const wdt = Math.round(28 * Math.sqrt(Math.max(0, 1 - (d / 30) ** 2)));
    for (let x = CX - wdt; x <= CX + wdt; x++) {
      const t = (x - CX + wdt) / Math.max(1, wdt * 2);
      set(g, x, 62 - d, t < 0.32 ? 'q' : t < 0.72 ? 'A' : 'a');
    }
  }
  for (let a = 1; a < 6; a++) {                                     // brass ribs over the glass
    const t = (a / 6) * Math.PI;
    for (let d = 0; d < 30; d++) {
      const wdt = 28 * Math.sqrt(Math.max(0, 1 - (d / 30) ** 2));
      set(g, Math.round(CX + Math.cos(t) * wdt), 62 - d, 'M');
    }
  }
  for (let d = 0; d < 30; d += 8) {                                 // latitude rings
    const wdt = Math.round(28 * Math.sqrt(Math.max(0, 1 - (d / 30) ** 2)));
    for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, 62 - d, 'm');
  }
  for (let x = CX - 28; x <= CX + 28; x++) { set(g, x, 62, 'b'); set(g, x, 63, 'm'); }
  ellipse(g, CX, 44, 8, 8, 'V'); ellipse(g, CX, 44, 5, 5, 'q');     // the thing in the jar
  rect(g, CX - 2, 6, 5, 20, 'i', true);                             // antenna
  for (let i = 0; i < 4; i++) rect(g, CX - 5, 10 + i * 5, 11, 1, 'z', true);
  ellipse(g, CX, 4, 4, 4, 'V'); ellipse(g, CX, 4, 2, 2, 'q');
  window_(g, CX - 20, 68, 5, 6); window_(g, CX + 16, 68, 5, 6);
  rect(g, CX - 5, B - 13, 11, 13, 'C', true);
  for (let i = 0; i < 3; i++) { rect(g, CX - 5, B - 13 - i, 11 - i * 2, 1, 'C', true); }
});

// ── W5 ──────────────────────────────────────────────────────────────────────

const shadowPool = () => build(SMALL, (g, S, B, CX) => {
  // A RING: hollow in the middle. Nothing else in the set has a hole in its centre.
  ellipse(g, CX, B - 12, 24, 11, 'u');
  ellipse(g, CX, B - 12, 20, 9, 'v');
  ellipse(g, CX, B - 13, 15, 6, 'U');
  for (let i = 0; i < 5; i++) {                                     // ripple rings on the surface
    const r = 4 + i * 3;
    ellipse(g, CX, B - 13, r, Math.max(1, Math.round(r * 0.4)), i & 1 ? 'V' : 'v');
  }
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 0.1 + (i / 8) * Math.PI * 0.8;
    const x = Math.round(CX + Math.cos(a) * 28), yb = Math.round(B - 12 + Math.sin(a) * 13);
    const h = 13 + ((i * 7) % 11);
    masonry(g, x - 3, yb - h, 7, h, ['s', 'S', 't'], 'T', 43 + i, 5);
    set(g, x, yb - h - 1, 'V'); set(g, x - 1, yb - h - 2, 'v'); set(g, x + 1, yb - h - 2, 'v');
    for (let d = 3; d < h; d += 5) { set(g, x - 1, yb - d, 'v'); set(g, x + 1, yb - d - 1, 'V'); }
  }
});

const cursedPortal = () => build(KEEP, (g, S, B, CX) => {
  // A freestanding arch — the only building you can see the map through.
  for (const sx of [-1, 1]) {
    masonry(g, CX + sx * 26 - 8, 28, 17, B - 27, ['u', 'U', 's'], 'c', 47, 6);
    for (let y = 34; y < B - 6; y += 12) {                          // hex sigils down the piers
      set(g, CX + sx * 26, y, 'V'); set(g, CX + sx * 26 - 2, y + 1, 'v');
      set(g, CX + sx * 26 + 2, y + 1, 'v'); set(g, CX + sx * 26, y + 2, 'v');
    }
  }
  for (let d = 0; d < 22; d++) {                                    // the arch ring
    const t = d / 22, wdt = 26 + Math.round(8 * (1 - Math.sqrt(1 - (1 - t) ** 2)));
    for (let x = CX - wdt - 8; x <= CX + wdt + 8; x++)
      if (Math.abs(Math.abs(x - CX) - wdt) < 9) set(g, x, 28 - d + 12, x < CX ? 'U' : 'u');
  }
  masonry(g, CX - 36, 8, 73, 14, ['u', 'U', 's'], 'c', 53, 6);      // lintel
  for (let x = CX - 34; x <= CX + 34; x += 8) { set(g, x, 6, 'v'); set(g, x, 5, 'V'); }
  for (let y = 34; y <= B - 4; y++)                                 // the gate itself
    for (let x = CX - 19; x <= CX + 19; x++) {
      const t = Math.hypot((x - CX) / 19, (y - (B - 4)) / 48);
      if (t > 1) continue;
      const n = noise(x, y, 59), sw = Math.sin((y * 0.4 + x * 0.2)) * 0.2;
      set(g, x, y, n > 0.62 + t * 0.3 + sw ? 'V' : n > 0.34 ? 'v' : 'c');
    }
  for (const sx of [-1, 1]) { set(g, CX + sx * 26, 3, 'V'); set(g, CX + sx * 26, 4, 'v'); }
});

// ── economy ─────────────────────────────────────────────────────────────────

const goldMine = tier => build(SMALL, (g, S, B, CX) => {
  // The three tiers grow: A-frame → winch tower → stone headframe. Height IS the tier.
  const h = [20, 32, 44][tier - 1];
  for (const sx of [-1, 1]) {
    line(g, CX + sx * 16, B, CX, B - h, 'w', 3);
    line(g, CX + sx * 16, B, CX + sx * 16, B - 6, 'r', 2);
  }
  for (let i = 1; i <= 3; i++) {                                     // cross bracing
    const f = i / 4;
    line(g, Math.round(CX - 16 * (1 - f)), Math.round(B - h * f), Math.round(CX + 16 * (1 - f)), Math.round(B - h * f), 'w', 2);
  }
  if (tier >= 2) {
    rect(g, CX - 9, B - h - 12, 19, 13, 'W', true);
    for (let x = CX - 9; x <= CX + 9; x += 5) rect(g, x, B - h - 12, 1, 13, 'r', true);
    gable(g, CX, B - h - 20, 12, 8, 'n', 'N', 'r');
    ellipse(g, CX, B - h - 5, 6, 6, 'i'); ellipse(g, CX, B - h - 5, 3, 3, 'I');   // the winch
    for (let a = 0; a < 6; a++) {
      const t = (a / 6) * Math.PI * 2;
      line(g, CX, B - h - 5, Math.round(CX + Math.cos(t) * 6), Math.round(B - h - 5 + Math.sin(t) * 6), 'z');
    }
  }
  if (tier === 3) {
    masonry(g, CX - 20, B - 24, 41, 24, ['s', 'S', 't'], 'T', 67, 6);
    window_(g, CX - 15, B - 18, 4, 5); window_(g, CX + 11, B - 18, 4, 5);
    for (let i = 0; i < 3; i++) {                                    // ore carts on a rail
      rect(g, CX - 16 + i * 12, B - 6, 8, 5, 'i', true);
      rect(g, CX - 15 + i * 12, B - 7, 6, 1, 'G', true);
      set(g, CX - 15 + i * 12, B - 1, 'z'); set(g, CX - 10 + i * 12, B - 1, 'z');
    }
    for (let x = CX - 20; x <= CX + 20; x += 3) set(g, x, B, 'r');
  }
  for (let y = B; y > B - 12; y--) {                                 // the adit
    const t = (B - y) / 12, wdt = Math.round(7 * Math.sqrt(Math.max(0, 1 - t * t)));
    for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, y, 'C');
  }
  for (let i = 0; i < 4 + tier * 2; i++) {                           // spilled ore
    const x = CX - 8 + Math.round(noise(i, 1, 91) * 16);
    set(g, x, B - Math.round(noise(i, 2, 93) * 3), i & 1 ? 'g' : 'G');
  }
});

const manaWell = tier => build(SMALL, (g, S, B, CX) => {
  // ring → roofed well → obelisk with a floating shard. The outline changes kind, not just size.
  masonry(g, CX - 15, B - 14, 31, 14, ['s', 'S', 't'], 'T', 71, 5);
  ellipse(g, CX, B - 14, 13, 5, 'a'); ellipse(g, CX, B - 14, 9, 3, 'A');
  ellipse(g, CX, B - 15, 5, 2, 'q');
  for (let x = CX - 15; x <= CX + 15; x += 4) set(g, x, B - 13, 'T');   // coping stones
  if (tier >= 2) {
    for (const sx of [-1, 1]) {
      rect(g, CX + sx * 13, B - 38, 3, 25, 'w', true);
      line(g, CX + sx * 13, B - 30, CX + sx * 6, B - 36, 'r', 1);      // knee braces
    }
    gable(g, CX, B - 50, 19, 12, 'n', 'N', 'r');
    line(g, CX, B - 37, CX, B - 20, 'i');
    rect(g, CX - 4, B - 20, 9, 6, 'e', true);
    rect(g, CX - 4, B - 20, 9, 1, 'r', true);
    ellipse(g, CX, B - 42, 3, 3, 'i');                                 // the pulley
  }
  if (tier === 3) {
    for (let d = 0; d < 34; d++) {                                     // the obelisk
      const wdt = 6 - Math.round(d / 9);
      for (let x = CX - wdt; x <= CX + wdt; x++)
        set(g, x, B - 14 - d, x < CX - wdt * 0.3 ? 'h' : noise(x, d, 5) > 0.5 ? 'Y' : 'y');
      if (d % 7 === 3) for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, B - 14 - d, 'v');
    }
    for (let d = 0; d < 6; d++) {
      const wdt = 3 - Math.round(d / 2);
      for (let x = CX - wdt; x <= CX + wdt; x++) set(g, x, B - 48 - d + 6, 'q');
    }
    ellipse(g, CX, B - 58, 4, 6, 'A'); ellipse(g, CX, B - 58, 2, 4, 'q');
    set(g, CX - 1, B - 60, 'q');
    for (let i = 0; i < 5; i++) {                                      // motes orbiting the shard
      const a = (i / 5) * Math.PI * 2;
      set(g, Math.round(CX + Math.cos(a) * 9), Math.round(B - 58 + Math.sin(a) * 7), 'A');
    }
  }
});

const gemCave = () => build(CAVE, (g, S, B, CX) => {
  // An OPENING, not a structure: a rock face with a dark mouth. The only concave silhouette.
  for (let y = 14; y <= B; y++) {
    const half = Math.round(35 * Math.sqrt(Math.max(0, 1 - ((y - B) / (B - 10)) ** 2)));
    for (let x = CX - half; x <= CX + half; x++) {
      const n = noise(x, y, 73);
      set(g, x, y, x < CX - half * 0.45 ? (n > 0.5 ? 't' : 'S') : n > 0.62 ? 'S' : 's');
    }
  }
  for (let i = 0; i < 7; i++) {                                        // strata lines across the face
    const y0 = 20 + i * 8;
    for (let x = CX - 34; x <= CX + 34; x++) {
      const y = y0 + Math.round(Math.sin(x * 0.12 + i) * 2);
      if (get(g, x, y) !== '`') set(g, x, y, 'T');
    }
  }
  for (let y = B; y > B - 34; y--) {                                   // the mouth
    const t = (B - y) / 34, half = Math.round(17 * Math.sqrt(Math.max(0, 1 - t * t)));
    for (let x = CX - half; x <= CX + half; x++)
      set(g, x, y, Math.abs(x - CX) > half - 3 ? 'C' : 'c');
  }
  for (let i = 0; i < 6; i++) {                                        // stalactites in the opening
    const x = CX - 14 + i * 6, len = 3 + Math.round(noise(i, 3, 11) * 5);
    for (let d = 0; d < len; d++) set(g, x, B - 32 + d, d > len - 2 ? 'c' : 'T');
  }
  // the hoard: this is the thing the whole game is about, so it is the brightest point on it
  for (const [x, y, ch] of [[CX - 9, B - 6, 'V'], [CX + 7, B - 9, 'q'], [CX, B - 4, 'G'],
    [CX + 12, B - 5, 'V'], [CX - 4, B - 11, 'q'], [CX - 14, B - 3, 'G']]) {
    set(g, x, y, ch); set(g, x, y - 1, 'v'); set(g, x + 1, y, 'v'); set(g, x - 1, y, 'v');
    set(g, x, y - 2, ch === 'G' ? 'k' : 'V');
  }
});

// ── assembly ────────────────────────────────────────────────────────────────

const DMG = { char: 'c', rubble: 's', mortar: 'T' };
const states = (g, seed) => seq(damageStates(g, 4, { ...DMG, seed }));

export const SPRITES = {
  bld_grass_village: states(village(), 3),
  bld_grass_castle: states(castle(), 7),
  bld_mountain_tavern: states(tavern(), 11),
  bld_mountain_citadel: states(citadel(), 13),
  bld_sand_palm_spring: states(palmSpring(), 17),
  bld_sand_stronghold: states(stronghold(), 19),
  bld_garden_power_station: states(powerStation(), 23),
  bld_garden_laboratory: states(laboratory(), 29),
  bld_shadow_pool: states(shadowPool(), 31),
  bld_shadow_cursed_portal: states(cursedPortal(), 37),
  bld_gold_mine_t1: states(goldMine(1), 41),
  bld_gold_mine_t2: states(goldMine(2), 43),
  bld_gold_mine_t3: states(goldMine(3), 47),
  bld_mana_well_t1: states(manaWell(1), 53),
  bld_mana_well_t2: states(manaWell(2), 59),
  bld_mana_well_t3: states(manaWell(3), 61),
  bld_gem_cave: states(gemCave(), 67),
};
