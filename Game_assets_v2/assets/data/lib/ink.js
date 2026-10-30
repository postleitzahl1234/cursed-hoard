// lib/ink.js — the "ink-line gothic" half of D-08.
//
// The old kit drew a single 1px exterior ring and called it done. "Ink-line gothic" means two
// things: a WEIGHTED exterior contour (heavier where the form turns away from the light) and
// INTERIOR lines that separate overlapping forms. Without the interior lines a silhouette is a
// blob; with them it reads as drawn.

import { EMPTY, get, set } from './pixel.js';

/**
 * Exterior contour. `soft` chars (glow/FX) are never outlined so auras stay open.
 * weight: 'even' = uniform 1px; 'weighted' = 2px on the shadow side (SE), 1px elsewhere.
 */
export function outline(g, ch, opts = {}) {
  const { soft = '', weight = 'weighted' } = opts;
  const add = [];
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      if (g.px[y][x] !== EMPTY) continue;
      let touch = false, shadowSide = false;
      for (let dy = -1; dy <= 1 && !touch; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const c = get(g, x + dx, y + dy);
          if (c === null || c === EMPTY || c === ch || soft.includes(c)) continue;
          touch = true;
          if (dx <= 0 && dy <= 0) shadowSide = true;   // solid up-left ⇒ we are on the SE edge
          break;
        }
      }
      if (touch) add.push([x, y, shadowSide]);
    }
  }
  for (const [x, y] of add) set(g, x, y, ch);
  if (weight === 'weighted') {
    const add2 = [];
    for (const [x, y, shadowSide] of add) {
      if (!shadowSide) continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (get(g, x + dx, y + dy) === EMPTY) add2.push([x + dx, y + dy]);
      }
    }
    for (const [x, y] of add2) set(g, x, y, ch);
  }
}

/**
 * Interior ink — draw a line only where it lands on solid pixels. Use it to separate a limb
 * from a torso, a roof from a wall, a barrel from its mount.
 */
export function innerLine(g, x0, y0, x1, y1, ch) {
  const dx = x1 - x0, dy = y1 - y0;
  const n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + (dx * i) / n), y = Math.round(y0 + (dy * i) / n);
    if (get(g, x, y) !== EMPTY && get(g, x, y) !== null) set(g, x, y, ch);
  }
}

/** Ink the boundary between two named material groups (e.g. armour vs cloth). */
export function seam(g, aChars, bChars, ch) {
  const add = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const c = g.px[y][x];
    if (!aChars.includes(c)) continue;
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const n = get(g, x + dx, y + dy);
      if (n && bChars.includes(n)) { add.push([x, y]); break; }
    }
  }
  for (const [x, y] of add) set(g, x, y, ch);
}
