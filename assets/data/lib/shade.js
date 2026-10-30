// lib/shade.js — light, form and grounding.
//
// This is the file that turns "flat vector" into "painted 2D" (D-08). The old humankit wrote
// exactly three values per limb with a hard split and no light model, which is why every unit
// read as a flat stick. Everything here exists to fix that.
//
// ONE GLOBAL KEY LIGHT for the whole game: upper-left (NW). Every form is lit from the same
// direction, in every sprite, forever. Inconsistent lighting is the fastest way to make a
// tileset look like it was drawn by six different people.

import { EMPTY, get, set, grid } from './pixel.js';

export const KEY = { x: -1, y: -1 };          // NW — light comes from the upper left
export const KEY_NAME = 'NW';

/**
 * A material ramp. `steps` runs DARKEST → LIGHTEST, matching palette.js convention.
 * Index helpers keep unit files readable: r.core, r.mid, r.lit, r.rim.
 */
export function ramp(steps) {
  const n = steps.length;
  return {
    steps,
    n,
    at: i => steps[Math.max(0, Math.min(n - 1, Math.round(i)))],
    shadow: steps[0],
    core: steps[Math.max(0, Math.floor(n * 0.25))],
    mid: steps[Math.floor(n * 0.5)],
    lit: steps[Math.min(n - 1, Math.floor(n * 0.75))],
    rim: steps[n - 1],
  };
}

/**
 * Shade a sphere/head/boulder: full form shading from the global key light.
 * Writes 4–6 distinct values instead of the old 3, which is most of the "painted" read.
 */
export function sphere(g, cx, cy, r, rmp) {
  for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) {
    for (let x = -Math.ceil(r); x <= Math.ceil(r); x++) {
      const d2 = x * x + y * y;
      if (d2 > r * r) continue;
      // lambert-ish: dot of the surface normal with the key direction
      const nz = Math.sqrt(Math.max(0, r * r - d2)) / r;
      const nx = x / r, ny = y / r;
      const l = (-nx * KEY.x - ny * KEY.y) / Math.SQRT2 * 0.72 + nz * 0.28;
      const t = Math.max(0, Math.min(1, (l + 0.35) / 1.15));
      set(g, cx + x, cy + y, rmp.at(t * (rmp.n - 1)));
    }
  }
}

/**
 * Shade a vertical cylinder (tower drum, barrel, limb, tree trunk).
 * Light wraps around the horizontal axis; `terminator` sets where the shadow side begins.
 */
export function cylinderV(g, x, y, w, h, rmp, terminator = 0.62) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const u = w <= 1 ? 0.5 : i / (w - 1);        // 0 = left (lit), 1 = right (shadow)
      let t = 1 - Math.pow(u / terminator, 1.35);
      if (u > terminator) t = -0.25 * ((u - terminator) / (1 - terminator));
      set(g, x + i, y + j, rmp.at((t * 0.95 + 0.08) * (rmp.n - 1)));
    }
  }
}

/** Shade a horizontal cylinder (cannon barrel, log, rolled banner). */
export function cylinderH(g, x, y, w, h, rmp, terminator = 0.55) {
  for (let j = 0; j < h; j++) {
    const v = h <= 1 ? 0.5 : j / (h - 1);          // 0 = top (lit), 1 = bottom (shadow)
    let t = 1 - Math.pow(v / terminator, 1.3);
    if (v > terminator) t = -0.3 * ((v - terminator) / (1 - terminator));
    for (let i = 0; i < w; i++) set(g, x + i, y + j, rmp.at((t * 0.95 + 0.08) * (rmp.n - 1)));
  }
}

/**
 * Rim light — D-22(d), never implemented in the old kits. Adds a bright edge on the side
 * AWAY from the key light so a dark silhouette never muddies into a dark backdrop.
 * This is what stops the Shadow Realm roster disappearing into shadow tiles.
 */
export function rimLight(g, ch, opts = {}) {
  const { dir = { x: 1, y: 1 }, skip = '', density = 1 } = opts;   // default: SE edge
  const add = [];
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.w; x++) {
      const c = g.px[y][x];
      if (c === EMPTY || skip.includes(c)) continue;
      const out = get(g, x + dir.x, y + dir.y);
      const outSide = get(g, x + dir.x, y);
      if ((out === EMPTY || out === null) || (outSide === EMPTY || outSide === null)) {
        if (density >= 1 || (x * 7 + y * 3) % Math.round(1 / density) === 0) add.push([x, y]);
      }
    }
  }
  for (const [x, y] of add) set(g, x, y, ch);
}

/**
 * Ambient occlusion — darken the seam where two forms meet (limb→torso, roof→wall,
 * anything→ground). Cheap, and it is most of what makes forms feel attached rather than pasted.
 */
export function ao(g, ch, opts = {}) {
  const { from = null, radius = 1 } = opts;
  const add = [];
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < g.px[y].length; x++) {
      const c = g.px[y][x];
      if (c === EMPTY) continue;
      if (from && !from.includes(c)) continue;
      // occluded if there is solid geometry directly above (light comes from above-left)
      let solidAbove = 0;
      for (let d = 1; d <= radius; d++) {
        const up = get(g, x, y - d);
        if (up !== EMPTY && up !== null && up !== c) solidAbove++;
      }
      if (solidAbove >= radius) add.push([x, y]);
    }
  }
  for (const [x, y] of add) set(g, x, y, ch);
}

/**
 * Contact shadow — the single cheapest trick for making a sprite sit ON the map instead of
 * floating in front of it. Every troop, tower and building gets one. Also answers Q-14
 * (flyers get a detached one, further down and smaller).
 */
export function contactShadow(g, cx, groundY, rx, ry, ch) {
  for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++) {
    for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1) continue;
      const px = cx + x, py = groundY + y;
      if (get(g, px, py) === EMPTY) set(g, px, py, ch);
    }
  }
}

/** Ordered 2×2 dither between two chars — for gradients that must stay on-palette. */
export function dither(g, x, y, w, h, a, b, bias = 0.5) {
  const M = [[0, 2], [3, 1]];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const t = M[j % 2][i % 2] / 4;
    set(g, x + i, y + j, t < bias ? a : b);
  }
}

/** Deterministic value noise in [0,1) — seeded, so every build renders identically. */
export function noise(x, y, seed = 0) {
  let n = (x * 374761393 + y * 668265263 + seed * 1442695040888963407) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return (((n ^ (n >> 16)) >>> 0) % 100000) / 100000;
}

/** Speckle a region with an accent char at low density (tufts, rust, embers). */
export function speckle(g, x, y, w, h, ch, density, seed = 0, onlyOver = null) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (noise(x + i, y + j, seed) > density) continue;
    if (onlyOver && !onlyOver.includes(get(g, x + i, y + j))) continue;
    set(g, x + i, y + j, ch);
  }
}

export { grid };
