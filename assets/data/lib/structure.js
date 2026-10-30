// lib/structure.js — machinery for things that stand on the ground: trees and buildings.
//
// Same contract as lib/pixel.js, lib/tileset.js and troops/_worlds.js: **nothing here encodes a
// body plan.** There is no `tree()` and no `house()`. A shared tree function would give ten
// species one silhouette in ten palettes, which is precisely failure F1 from REVIEW.md §2 —
// the shared rig — reappearing in a new family. Each species and each building is authored
// individually; this file supplies bark texture, leaf dither, masonry, and the one thing that
// genuinely *is* a derivation rather than a design: damage states.
//
// ── Why damage states are generated ─────────────────────────────────────────
// Seventeen buildings × five states is eighty-five frames. Hand-authoring them would be eighty-five
// chances to draw a roof that does not match its own pristine frame. A damage state is not a new
// design, it is the same building minus material — so it is computed: erode from the top down
// (roofs go first, foundations last), open holes on the weather side, char the exposed edges, and
// drop rubble at the base. The result is guaranteed to be the same building.

import { grid, clone, set, get, rows } from './pixel.js';
import { noise } from './shade.js';

export const EMPTY = '`';

/** Bark: vertical grain, lit on the NW side of the trunk, with the grain lines running with it. */
export function bark(g, x0, y0, w, h, ramp, seed = 0) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const t = (x - x0) / Math.max(1, w - 1);
      // a trunk is a cylinder: lit at ~30% across, falling off both ways, darkest at the E rim
      const lit = 1 - Math.abs(t - 0.3) * 1.9;
      const grain = noise(x, Math.floor(y / 3), seed) * 0.35;
      const v = lit - grain;
      set(g, x, y, v > 0.62 ? ramp[2] : v > 0.24 ? ramp[1] : ramp[0]);
    }
}

/**
 * Leaf mass: a dithered two-value interior with the NW third lifted. Takes a predicate so each
 * species supplies its own outline — the outline is the design, this only fills it.
 */
export function leaves(g, inside, ramp, seed = 0, lit = null) {
  for (let y = 0; y < g.h; y++)
    for (let x = 0; x < g.w; x++) {
      if (!inside(x, y)) continue;
      const n = noise(x, y, seed);
      // the NW face of the mass catches; measured against the mass's own local extent
      const towardKey = inside(x + 2, y + 2) && !inside(x - 3, y - 3);
      set(g, x, y, towardKey && lit && n > 0.4 ? lit : n > 0.55 ? ramp[1] : ramp[0]);
    }
}

/** Masonry: coursed blocks with a dark mortar line, lit on the top and west of each course. */
export function masonry(g, x0, y0, w, h, ramp, mortar, seed = 0, course = 5) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const row = Math.floor((y - y0) / course);
      const joint = (y - y0) % course === 0 || (x + row * 3) % 7 === 0;
      if (joint) { set(g, x, y, mortar); continue; }
      const top = (y - y0) % course === 1;
      set(g, x, y, top ? ramp[2] : noise(x, y, seed) > 0.5 ? ramp[1] : ramp[0]);
    }
}

/** A contact shadow hugging the base, so the thing sits on the ground instead of floating. */
export function ground(g, cx, halfW, y, near, far) {
  for (let dx = -halfW; dx <= halfW; dx++) {
    const t = Math.abs(dx) / halfW;
    if (get(g, cx + dx, y) !== EMPTY) continue;
    set(g, cx + dx, y, t < 0.6 ? near : far);
    if (t < 0.35) set(g, cx + dx, y + 1, far);
  }
}

/**
 * Derive `n` progressively-ruined frames from a pristine one.
 *
 * Erosion is weighted by height: a shell lands on the roof, not the footings, so the top of the
 * sprite loses material far faster than the base. Exposed edges char, and what is removed
 * reappears as rubble along the ground line — a building that simply faded out would read as
 * a transparency bug rather than as damage.
 */
export function damageStates(pristine, n, opts) {
  const { char: charChar, rubble, mortar, seed = 0 } = opts;
  const out = [pristine];
  let cur = pristine;
  for (let step = 1; step <= n; step++) {
    const g = clone(cur);
    const force = step / (n + 0.6);
    for (let y = 0; y < g.h; y++)
      for (let x = 0; x < g.w; x++) {
        if (get(g, x, y) === EMPTY) continue;
        // height weighting: 1.0 at the eaves, ~0.15 at the footings
        const hw = 1 - (y / g.h) * 0.85;
        // the weather side is the east — the side away from the key light, already in shadow
        const side = 0.7 + (x / g.w) * 0.6;
        if (noise(x, y, seed + step * 97) < force * hw * side * 0.42) set(g, x, y, EMPTY);
      }
    // char whatever is now an exposed edge, and only on the lit side, where a break shows
    for (let y = 0; y < g.h; y++)
      for (let x = 0; x < g.w; x++) {
        if (get(g, x, y) === EMPTY) continue;
        const open = get(g, x, y - 1) === EMPTY || get(g, x + 1, y) === EMPTY;
        if (open && noise(x, y, seed + step * 31) > 0.45) set(g, x, y, charChar);
      }
    // rubble: what fell has to be somewhere
    const base = g.h - 1;
    for (let x = 0; x < g.w; x++) {
      if (noise(x, step, seed + 501) > 0.72 - force * 0.3) continue;
      const hgt = 1 + Math.floor(noise(x, step, seed + 733) * force * 3);
      for (let d = 0; d < hgt; d++)
        if (get(g, x, base - d) === EMPTY) set(g, x, base - d, d === hgt - 1 ? mortar : rubble);
    }
    out.push(g);
    cur = g;
  }
  return out;
}

export const still = g => ({ anchor: 'south', fps: 1, loop: true, frames: [rows(g)] });
export const seq = gs => ({ anchor: 'south', fps: 1, loop: false, frames: gs.map(rows) });
export const blank = (w, h) => grid(w, h, EMPTY);
