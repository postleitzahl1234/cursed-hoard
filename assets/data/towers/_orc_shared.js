// towers/_orc_shared.js — the ORC FACTION's palette and shape vocabulary. Nothing else.
//
// Read the underscore as a warning. This file may contain: the faction's legend, its material
// ramps, and *verbs* that describe how Orcs build (a stake, a rivet band, a rhombus boss).
// It may NOT contain a tower. No drum, no roof, no assembled structure, no "buildOrcTower".
// The moment a shared function returns a building, all 12 tiers become recolours again — which
// is exactly the failure D-20/D-27 exist to prevent and exactly what towerkit.js did.
//
// D-24: Orc accent = war-green (MS).
// D-29: green stays PRIMARY; brown wood is ACCENT ONLY — braces, scaffold, palisade stakes,
//       door frames, end-grain. Black-iron fittings. No rope lashings, no arrow-slit rod row.
// D-27: Orc shape grammar = rounded "den", central symmetric rhombus decoration.

import { set, get, rect, ellipse, line, poly, EMPTY } from '../lib/pixel.js';
import { ramp, cylinderV, cylinderH } from '../lib/shade.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK3',                                     // ink: contour, interior
  q: 'SH1', Q: 'SH2',                                     // contact shadow (alpha)
  n: 'MS0', N: 'MS1', m: 'MS2', M: 'MS3', o: 'MS4', O: 'MS5',   // war-green — PRIMARY material
  w: 'WD0', W: 'WD2', v: 'WD3', V: 'WD5',                 // timber — ACCENT ONLY (D-29)
  i: 'IR0', I: 'IR2', j: 'IR4', J: 'IR6',                 // black iron — fittings, barrels
  d: 'GD1', D: 'GD3',                                     // gold — rivets, tier trophies
  e: 'EM2', E: 'EM4', x: 'EM6',                           // muzzle flash / forge glow
  b: 'BN2', B: 'BN5',                                     // bone trophies
  r: 'RK1', R: 'RK3',                                     // stone footing
};

export const GREEN = ramp(['n', 'N', 'm', 'M', 'o', 'O']);
export const TIMBER = ramp(['w', 'w', 'W', 'v', 'V']);
export const IRON = ramp(['i', 'i', 'I', 'j', 'J']);
export const STONE = ramp(['r', 'r', 'R']);

// ── Orc verbs. Each does ONE small thing. None of them knows what a tower looks like. ──

/** A driven timber stake — the Orc palisade motif. Always vertical, always end-grain lit. */
export function stake(g, x, yTop, h, lean = 0) {
  for (let j = 0; j < h; j++) {
    const xx = x + Math.round((j / h) * lean);
    set(g, xx, yTop + j, j < 2 ? 'V' : 'W');
    set(g, xx + 1, yTop + j, 'w');
  }
  set(g, x, yTop, 'V');
}

/** A hammered iron band around a drum. `studs` spaces gold rivets along it.
 *  Uses the DARK iron ramp by default — a band lit to IR6 reads as scaffolding, not armour. */
export function ironBand(g, x, y, w, h, studs = 0, rmp = ramp(['i', 'i', 'I', 'I', 'j'])) {
  cylinderH(g, x, y, w, h, rmp);
  if (studs > 0) {
    for (let i = 0; i < studs; i++) {
      const px = Math.round(x + (w - 1) * ((i + 0.5) / studs));
      set(g, px, y + Math.floor(h / 2), 'D');
      set(g, px, y + Math.floor(h / 2) + 1, 'd');
    }
  }
}

/** The central symmetric rhombus boss (D-27). Size scales with tier; that is the point. */
export function rhombus(g, cx, cy, r, fill, edge) {
  for (let dy = -r; dy <= r; dy++) {
    const span = r - Math.abs(dy);
    for (let dx = -span; dx <= span; dx++) {
      set(g, cx + dx, cy + dy, Math.abs(dx) === span || Math.abs(dy) === r ? edge : fill);
    }
  }
}

/** An angled timber brace — the only structural use of wood the Orcs allow themselves. */
export function brace(g, x0, y0, x1, y1) {
  line(g, x0, y0, x1, y1, 'W', 2);
  line(g, x0, y0, x1, y1, 'v', 1);
}

/** A rim spike. Tier escalation hangs off how many of these there are and how big. */
export function spike(g, x, baseY, h) {
  for (let j = 0; j < h; j++) {
    const half = Math.max(0, Math.round((1 - j / h) * 1.6));
    for (let i = -half; i <= half; i++) set(g, x + i, baseY - j, i < 0 ? 'j' : 'I');
  }
  set(g, x, baseY - h, 'J');
}

/** A rounded den drum: elliptical cap + straight flank, NW-lit. The Orc mass primitive. */
export function drum(g, cx, top, halfW, height, capH, rmp = GREEN) {
  cylinderV(g, cx - halfW, top + capH, halfW * 2 + 1, height - capH, rmp);
  // elliptical cap, shaded by the same horizontal light wrap so the cap and flank agree
  for (let dy = -capH; dy <= 0; dy++) {
    const span = Math.round(halfW * Math.sqrt(Math.max(0, 1 - (dy / capH) ** 2)));
    for (let dx = -span; dx <= span; dx++) {
      const u = (dx + halfW) / (halfW * 2);
      let t = 1 - Math.pow(u / 0.62, 1.35);
      if (u > 0.62) t = -0.25 * ((u - 0.62) / 0.38);
      const lift = 1 + (dy / capH) * 0.5;                  // the cap catches more light on top
      set(g, cx + dx, top + capH + dy, rmp.at((t * 0.9 + 0.1 + lift * 0.35) * (rmp.n - 1)));
    }
  }
}

/** Arched doorway with a timber frame — Orc doors are wide and low, like a den mouth. */
export function denDoor(g, cx, baseY, halfW, h) {
  for (let j = 0; j < h; j++) {
    const y = baseY - j;
    const span = j > h - halfW ? Math.round(halfW * Math.sqrt(Math.max(0, 1 - ((j - (h - halfW)) / halfW) ** 2))) : halfW;
    for (let dx = -span; dx <= span; dx++) set(g, cx + dx, y, dx < -span + 2 ? 'i' : 'k');
  }
  // timber frame — wood as accent, exactly as D-29 permits
  for (let j = 0; j < h; j++) {
    const y = baseY - j;
    const span = j > h - halfW ? Math.round(halfW * Math.sqrt(Math.max(0, 1 - ((j - (h - halfW)) / halfW) ** 2))) : halfW;
    if (span <= 0) continue;
    set(g, cx - span - 1, y, 'W'); set(g, cx + span + 1, y, 'w');
  }
}

export { set, get, rect, ellipse, line, poly, EMPTY, cylinderV, cylinderH, ramp };
