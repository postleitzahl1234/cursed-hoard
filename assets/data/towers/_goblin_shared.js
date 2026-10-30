// towers/_goblin_shared.js — the GOBLIN FACTION's palette and shape vocabulary. Nothing else.
//
// Verbs only. This file knows what a rivet is; it must never know what a Gatling Turret is.
//
// D-24: Goblin accent = BRASS steampunk (BR4 #b08636) — warm machined metal, deliberately
//       distinct from GD gold. Goblins moved OFF green so Orc could take it.
// D-27: shape grammar = busy riveted brass machinery — hangars, guns, drills.
// D-29: a small riveted IRON HATCH door at the base.
// D-26: the drone and bomber lines are launch PLATFORMS with no rotating top; their aim part is
//       the bay doors, not a turret.

import { set, get, rect, ellipse, line, poly, disc, EMPTY } from '../lib/pixel.js';
import { ramp, cylinderV, cylinderH, sphere, noise } from '../lib/shade.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK3',                                     // ink
  q: 'SH1', Q: 'SH2',                                     // contact shadow (alpha)
  a: 'BR0', A: 'BR1', b: 'BR2', B: 'BR3', c: 'BR4', C: 'BR5',   // brass — PRIMARY
  i: 'IR0', I: 'IR1', j: 'IR2', J: 'IR4', l: 'IR6',       // iron — frames, hatches, barrels
  w: 'WD1', W: 'WD3',                                     // timber — decking only, sparingly
  e: 'EM2', E: 'EM4', x: 'EM6',                           // furnace glow, exhaust
  t: 'TX1', T: 'TX3',                                     // toxin teal — coolant, goblin ooze
  g: 'GB2', G: 'GB4',                                     // goblin skin — the crew, tiny
  d: 'GD2', D: 'GD4',                                     // gold — gauge faces only
  r: 'RK1', R: 'RK3',                                     // grey rock — footing
};

export const BRASS = ramp(['a', 'A', 'b', 'B', 'c', 'C']);
export const IRON = ramp(['i', 'I', 'j', 'J', 'l']);
export const EMBERS = ramp(['e', 'E', 'x']);
export const TOXIN = ramp(['t', 'T']);

// ── Goblin verbs ──────────────────────────────────────────────────────────────

/**
 * A riveted brass plate — the Goblin mass primitive. Everything they build is plates bolted
 * to plates, so the rivet line along the edge is the faction's most-repeated motif.
 */
export function plate(g, x, y, w, h, rmp = BRASS, rivetEdges = 'tb') {
  cylinderV(g, x, y, w, h, rmp);
  if (rivetEdges.includes('t')) for (let i = 1; i < w; i += 3) set(g, x + i, y, 'C');
  if (rivetEdges.includes('b')) for (let i = 1; i < w; i += 3) set(g, x + i, y + h - 1, 'a');
  if (rivetEdges.includes('l')) for (let j = 1; j < h; j += 3) set(g, x, y + j, 'C');
  if (rivetEdges.includes('r')) for (let j = 1; j < h; j += 3) set(g, x + w - 1, y + j, 'a');
  for (let j = 0; j < h; j++) { set(g, x, y + j, 'A'); set(g, x + w - 1, y + j, 'a'); }
}

/** A run of rivets along an arbitrary line — for seams that are not plate edges. */
export function rivets(g, x0, y0, x1, y1, spacing = 3, ch = 'C') {
  const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= n; i += spacing) {
    set(g, x0 + (dx * i) / n, y0 + (dy * i) / n, ch);
    set(g, x0 + (dx * i) / n, y0 + (dy * i) / n + 1, 'a');
  }
}

/** A pipe run — the Goblin's connective tissue. Elbows are drawn as a fatter joint. */
export function pipe(g, pts, girth = 3, rmp = BRASS) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let s = 0; s <= n; s++) {
      const x = x0 + (dx * s) / n, y = y0 + (dy * s) / n;
      for (let o = -Math.floor(girth / 2); o <= Math.floor(girth / 2); o++) {
        const lit = o <= -Math.floor(girth / 2) + 0.5;
        if (Math.abs(dx) >= Math.abs(dy)) set(g, x, y + o, lit ? rmp.rim : o >= Math.floor(girth / 2) ? rmp.core : rmp.mid);
        else set(g, x + o, y, lit ? rmp.rim : o >= Math.floor(girth / 2) ? rmp.core : rmp.mid);
      }
    }
    disc(g, x1, y1, girth / 2, rmp.lit);                   // elbow
  }
}

/** A pressure gauge — a brass ring with a gold face and a needle. Pure Goblin flavour. */
export function gauge(g, cx, cy, r = 2) {
  disc(g, cx, cy, r + 0.6, 'B');
  disc(g, cx, cy, r, 'd');
  set(g, cx, cy, 'k');
  set(g, cx + 1, cy - 1, 'k');
  set(g, cx - r, cy - r, 'C');
}

/** A chimney / exhaust stack. `puff` draws smoke and ember on the fire frame. */
export function chimney(g, cx, baseY, h, r = 2, puff = false) {
  for (let j = 0; j < h; j++) {
    for (let x = -r; x <= r; x++) set(g, cx + x, baseY - j, x < 0 ? 'j' : x === r ? 'i' : 'J');
  }
  for (let x = -r - 1; x <= r + 1; x++) set(g, cx + x, baseY - h, 'l');
  set(g, cx, baseY - h + 1, 'e');
  if (puff) {
    disc(g, cx, baseY - h - 3, 2, 'e');
    disc(g, cx + 1, baseY - h - 5, 1.4, 'E');
    set(g, cx, baseY - h - 1, 'x');
  }
}

/** A diagonal iron strut — the Goblin's answer to a buttress. Always exposed, never clad. */
export function strut(g, x0, y0, x1, y1) {
  line(g, x0, y0, x1, y1, 'j', 2);
  line(g, x0, y0, x1, y1, 'J', 1);
  rivets(g, x0, y0, x1, y1, 4, 'l');
}

/** The small riveted iron hatch door at the base (D-29). Goblin doors are never grand. */
export function hatchDoor(g, cx, baseY, halfW, h) {
  for (let j = 0; j < h; j++) for (let x = -halfW; x <= halfW; x++) set(g, cx + x, baseY - j, 'i');
  for (let j = 1; j < h - 1; j++) for (let x = -halfW + 1; x <= halfW - 1; x++) set(g, cx + x, baseY - j, 'I');
  for (let j = 1; j < h; j += 2) { set(g, cx - halfW, baseY - j, 'J'); set(g, cx + halfW, baseY - j, 'J'); }
  disc(g, cx + halfW - 1, baseY - Math.round(h / 2), 1, 'c');        // handle wheel
  for (let x = -halfW - 1; x <= halfW + 1; x++) set(g, cx + x, baseY - h, 'j');
}

/** An open hangar mouth — the drone/bomber wing's defining hole (D-26). */
export function hangarMouth(g, cx, cy, w, h) {
  ellipse(g, cx, cy, w / 2, h / 2, 'k');
  ellipse(g, cx, cy - 1, w / 2 - 1, h / 2 - 1, 'i');
  for (let x = -Math.round(w / 2); x <= Math.round(w / 2); x += 3) {   // guide rails inside
    set(g, cx + x, cy + Math.round(h / 4), 'j');
  }
  for (let x = -Math.round(w / 2) - 1; x <= Math.round(w / 2) + 1; x++) {
    set(g, cx + x, cy - Math.round(h / 2) - 1, 'c');                    // brass lintel
    set(g, cx + x, cy + Math.round(h / 2) + 1, 'A');
  }
}

/** Boiler drum with banded hoops — the powerplant every Goblin tower is built around. */
export function boiler(g, cx, top, halfW, h) {
  cylinderV(g, cx - halfW, top, halfW * 2 + 1, h, BRASS);
  ellipse(g, cx, top, halfW, 2.5, 'c');
  for (let y = top + 3; y < top + h; y += 5) {
    for (let x = -halfW; x <= halfW; x++) set(g, cx + x, y, x < -halfW + 2 ? 'J' : x > halfW - 2 ? 'i' : 'j');
  }
  disc(g, cx - halfW + 2, top + h - 4, 1.6, 'e');                      // firebox grate
  set(g, cx - halfW + 2, top + h - 4, 'x');
}

/** Grime and oil staining — Goblin machinery is never clean. */
export function grime(g, x, y, w, h, seed = 7, density = 0.07) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (noise(x + i, y + j, seed) > density) continue;
    const c = get(g, x + i, y + j);
    if (c === 'c' || c === 'C' || c === 'B') set(g, x + i, y + j, 'b');
    else if (c === 'b' || c === 'B') set(g, x + i, y + j, 'A');
  }
}

export { set, get, rect, ellipse, line, poly, disc, EMPTY, cylinderV, cylinderH, sphere, ramp, noise };
