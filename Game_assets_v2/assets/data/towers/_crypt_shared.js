// towers/_crypt_shared.js — the CRYPT FACTION's palette and shape vocabulary. Nothing else.
//
// Same warning as _orc_shared.js: verbs only. This file knows what a battlement is; it must
// never know what a Frost Crypt is. The moment a shared function returns a building, the 12
// Crypt tiers collapse back into recolours (D-20 / D-27).
//
// D-24: Crypt accent = ice-blue (IC3 #7cbae0).
// D-27: shape grammar = SPIRES with much smaller entrances and windows.
// D-29: side battlements whose intricacy scales with tier (T1 minor ledges → T5/6 tall stacked
//       turrets with gold finials); a small base door and lit lancet windows; the Fear/Terror
//       branch carries purple (CR) accents — purple courses, gargoyle eyes, hanging shrouds.

import { set, get, rect, ellipse, line, poly, disc, EMPTY } from '../lib/pixel.js';
import { ramp, cylinderV, cylinderH, sphere } from '../lib/shade.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK3',                                     // ink
  q: 'SH1', Q: 'SH2',                                     // contact shadow (alpha)
  r: 'RK0', R: 'RK1', s: 'RK2', S: 'RK3', t: 'RK4', T: 'RK5',   // cold grave stone — PRIMARY
  b: 'BN1', B: 'BN3', n: 'BN5',                           // bone — ossuary courses, skulls
  i: 'IC0', I: 'IC2', c: 'IC3', C: 'IC5',                 // ice-blue — the faction accent, glow
  v: 'CR1', V: 'CR3', x: 'CR5',                           // curse violet — Fear/Terror branch only
  d: 'GD1', D: 'GD3', g: 'GD5',                           // gold — finials, tracery
  j: 'IR1', J: 'IR3',                                     // wrought iron — grates, hinges
  u: 'UD1', U: 'UD3',                                     // undead flesh — bound revenants
};

export const STONE = ramp(['r', 'R', 's', 'S', 't', 'T']);
export const BONE = ramp(['b', 'b', 'B', 'n']);
export const ICE = ramp(['i', 'I', 'c', 'C']);
export const CURSE = ramp(['v', 'v', 'V', 'x']);
export const GOLD = ramp(['d', 'D', 'g']);
export const IRON = ramp(['j', 'j', 'J']);

// ── Crypt verbs ───────────────────────────────────────────────────────────────

/**
 * A tapered spire shaft. The Crypt mass primitive: always taller than it is wide, always
 * narrowing as it rises. `batter` is how much it draws in per row.
 */
export function spire(g, cx, top, bottom, halfWTop, halfWBottom, rmp = STONE) {
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const half = Math.round(halfWTop + (halfWBottom - halfWTop) * t);
    for (let x = -half; x <= half; x++) {
      const u = (x + half) / (2 * half || 1);
      let s = 1 - Math.pow(Math.min(1, u / 0.58), 1.3);
      if (u > 0.58) s = -0.28 * ((u - 0.58) / 0.42);
      set(g, cx + x, y, rmp.at((s * 0.92 + 0.12) * (rmp.n - 1)));
    }
  }
}

/** A crenellated ledge. `merlons` and `depth` are the tier dial (D-29). */
export function battlement(g, cx, y, halfW, merlons, depth, rmp = STONE) {
  for (let x = -halfW; x <= halfW; x++) {
    for (let j = 0; j < depth; j++) set(g, cx + x, y + j, j === 0 ? rmp.lit : rmp.mid);
  }
  const step = Math.max(2, Math.round((halfW * 2) / Math.max(1, merlons)));
  for (let x = -halfW; x <= halfW; x += step) {
    for (let j = 1; j <= 2; j++) { set(g, cx + x, y - j, rmp.mid); set(g, cx + x + 1, y - j, rmp.core); }
  }
  for (let x = -halfW; x <= halfW; x++) set(g, cx + x, y + depth, rmp.shadow);
}

/**
 * A lancet window — tall, pointed, and DELIBERATELY SMALL (D-27). Lit from inside, which is
 * the Crypt's only warm-ish signal and the thing that says "occupied" at 32 px.
 */
export function lancet(g, cx, top, h, glow = 'c', frame = 'r') {
  const halfW = Math.max(0, Math.round(h / 5));
  for (let j = 0; j < h; j++) {
    const y = top + j;
    const w = j < halfW * 2 ? Math.round((j / (halfW * 2 || 1)) * halfW) : halfW;
    for (let x = -w; x <= w; x++) set(g, cx + x, y, x === -w || x === w ? frame : glow);
  }
  set(g, cx, top + h, frame);
}

/** A gold finial — the tier trophy. Bigger and more of them as the tree climbs (D-29). */
export function finial(g, cx, baseY, h) {
  for (let j = 0; j < h; j++) {
    const half = j > h - 3 ? 0 : Math.max(0, Math.round((1 - j / h) * 1.4));
    for (let x = -half; x <= half; x++) set(g, cx + x, baseY - j, x < 0 ? 'g' : 'D');
  }
  set(g, cx, baseY - h, 'g');
}

/** A stacked corner turret — the T5/T6 form of `battlement` (D-29). */
export function cornerTurret(g, cx, baseY, h, halfW, withFinial = true) {
  spire(g, cx, baseY - h, baseY, halfW - 1, halfW, STONE);
  battlement(g, cx, baseY - h, halfW, 3, 1, STONE);
  lancet(g, cx, baseY - h + 4, Math.max(3, Math.round(h * 0.35)));
  if (withFinial) finial(g, cx, baseY - h - 2, 4);
}

/** The small crypt door — narrow, arched, iron-grated. Never wide (D-27/D-29). */
export function cryptDoor(g, cx, baseY, halfW, h) {
  for (let j = 0; j < h; j++) {
    const y = baseY - j;
    const arch = h - j <= halfW ? Math.round(halfW * Math.sqrt(Math.max(0, 1 - ((halfW - (h - j)) / halfW) ** 2))) : halfW;
    for (let x = -arch; x <= arch; x++) set(g, cx + x, y, 'k');
  }
  for (let j = 1; j < h - halfW; j += 2) {                 // iron grate bars
    for (let x = -halfW + 1; x <= halfW - 1; x++) set(g, cx + x, baseY - j, 'j');
  }
  for (let j = 0; j < h; j++) {                            // stone jambs
    const y = baseY - j;
    const arch = h - j <= halfW ? Math.round(halfW * Math.sqrt(Math.max(0, 1 - ((halfW - (h - j)) / halfW) ** 2))) : halfW;
    if (arch <= 0) continue;
    set(g, cx - arch - 1, y, 'S'); set(g, cx + arch + 1, y, 'R');
  }
}

/** An ossuary course — a band of skulls set into the masonry. Crypt-only decoration. */
export function ossuary(g, cx, y, halfW, spacing = 4) {
  for (let x = -halfW; x <= halfW; x += spacing) {
    disc(g, cx + x, y, 1.4, 'B');
    set(g, cx + x, y, 'n');
    set(g, cx + x - 1, y + 1, 'k'); set(g, cx + x + 1, y + 1, 'k');
  }
}

/** A hanging shroud-banner. Fear/Terror branch only — pass CURSE for the violet version. */
export function shroud(g, cx, top, h, w, rmp = ICE) {
  for (let j = 0; j < h; j++) {
    const half = Math.round((w / 2) * (1 - j / (h * 2.2)));
    for (let x = -half; x <= half; x++) {
      set(g, cx + x, top + j, x < -half + 1 ? rmp.lit : x > half - 1 ? rmp.shadow : rmp.mid);
    }
  }
  for (let x = -Math.round(w / 2); x <= Math.round(w / 2); x += 2) set(g, cx + x, top + h, rmp.shadow);
}

/** A gargoyle perched on a ledge — its eyes carry the branch colour (D-29). */
export function gargoyle(g, cx, baseY, eye = 'c') {
  poly(g, [[cx - 3, baseY], [cx + 3, baseY], [cx + 2, baseY - 3], [cx - 2, baseY - 4]], 'S');
  set(g, cx - 2, baseY - 4, 'T'); set(g, cx + 3, baseY - 2, 'R');
  line(g, cx - 3, baseY - 3, cx - 5, baseY - 6, 's', 1);    // folded wing
  line(g, cx + 3, baseY - 3, cx + 5, baseY - 6, 'R', 1);
  set(g, cx - 1, baseY - 3, eye); set(g, cx + 1, baseY - 3, eye);
}

export { set, get, rect, ellipse, line, poly, disc, EMPTY, cylinderV, cylinderH, sphere, ramp };
