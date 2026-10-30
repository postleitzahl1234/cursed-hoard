// towers/_demon_shared.js — the DEMON FACTION's palette and shape vocabulary. Nothing else.
//
// Verbs only. This file knows what a terrace is; it must never know what a Hellbeam is.
//
// D-24: Demon accent = lava-red (EM3 #e23820).
// D-27: shape grammar = pronounced AZTEC-STYLE STEPPED PYRAMIDS. Beam wing tall and narrow,
//       pyre wing shortest and broadest.
// D-29: the steps read as TERRACED RELIEF — bright tread shelves over shadowed risers. The
//       central staircase is ember-lit OBSIDIAN (not grey stone), and it stops one terrace
//       BELOW the summit, where a small shrine door sits.

import { set, get, rect, ellipse, line, poly, disc, EMPTY } from '../lib/pixel.js';
import { ramp, cylinderV, cylinderH, sphere, speckle } from '../lib/shade.js';

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',                                     // ink
  q: 'SH1', Q: 'SH2',                                     // contact shadow (alpha)
  o: 'DM0', O: 'DM1', h: 'DM2', H: 'DM3', y: 'DM4', Y: 'DM5',   // demon basalt — PRIMARY
  z: 'IK1', Z: 'IK4',                                     // obsidian — the staircase, glass-dark
  e: 'EM0', E: 'EM2', f: 'EM3', F: 'EM5', x: 'EM6', X: 'EM7',   // ember — the accent and all glow
  b: 'BL1', B: 'BL3',                                     // blood — glyph channels
  d: 'GD1', D: 'GD3',                                     // gold — idol furniture only
  n: 'BN2', N: 'BN5',                                     // bone — skull glyphs
  r: 'RK1', R: 'RK3',                                     // grey rock — plinth footing only
};

export const BASALT = ramp(['o', 'O', 'h', 'H', 'y', 'Y']);
export const OBSIDIAN = ramp(['z', 'z', 'Z', 'O']);
export const EMBER = ramp(['e', 'E', 'f', 'F', 'x', 'X']);
export const BLOOD = ramp(['b', 'b', 'B']);
export const GOLD = ramp(['d', 'D']);

// ── Demon verbs ───────────────────────────────────────────────────────────────

/**
 * ONE TERRACE of the ziggurat — the Demon mass primitive.
 *
 * D-29's "terraced relief" in three bands: a bright TREAD shelf on top catching the sky, a
 * shaded RISER face below it, and a hard shadow line where the next terrace begins. Getting
 * these three right is what makes a Demon tower read as stone steps rather than a flat trapezoid.
 */
export function terrace(g, cx, top, halfW, riserH, treadH = 2, rmp = BASALT) {
  // tread — the horizontal shelf, the lightest surface on the building
  for (let j = 0; j < treadH; j++) {
    for (let x = -halfW; x <= halfW; x++) {
      set(g, cx + x, top + j, j === 0 ? rmp.rim : rmp.lit);
    }
  }
  // riser — the vertical face, lit NW so the left third stays brighter
  for (let j = 0; j < riserH; j++) {
    const y = top + treadH + j;
    for (let x = -halfW; x <= halfW; x++) {
      const u = (x + halfW) / (2 * halfW || 1);
      let s = 1 - Math.pow(Math.min(1, u / 0.55), 1.25);
      if (u > 0.55) s = -0.3 * ((u - 0.55) / 0.45);
      const vert = 1 - (j / Math.max(1, riserH)) * 0.55;     // riser darkens toward its foot
      set(g, cx + x, y, rmp.at((s * 0.55 + vert * 0.45) * (rmp.n - 1)));
    }
  }
  // the occlusion line where this terrace meets the one below
  for (let x = -halfW; x <= halfW; x++) set(g, cx + x, top + treadH + riserH, rmp.shadow);
}

/**
 * The central staircase — EMBER-LIT OBSIDIAN, never grey (D-29). Runs from the plinth up to
 * `stopY`, which callers must place ONE TERRACE BELOW THE SUMMIT.
 */
export function stair(g, cx, baseY, stopY, halfW) {
  for (let y = stopY; y <= baseY; y++) {
    const t = (y - stopY) / Math.max(1, baseY - stopY);
    const half = Math.max(1, Math.round(halfW * (0.55 + 0.45 * t)));
    for (let x = -half; x <= half; x++) {
      set(g, cx + x, y, x < -half + 1 ? 'Z' : x > half - 1 ? 'k' : 'z');
    }
    if ((baseY - y) % 3 === 0) {                             // every third step glows from beneath
      for (let x = -half + 1; x <= half - 1; x++) set(g, cx + x, y, (x + y) % 2 ? 'E' : 'f');
    }
  }
  for (let y = stopY; y <= baseY; y += 3) {                  // ember seams running up the flanks
    set(g, cx - halfW - 1, y, 'E'); set(g, cx + halfW + 1, y, 'e');
  }
}

/** The small shrine door at the summit — the only entrance a Demon tower has (D-29). */
export function shrineDoor(g, cx, baseY, halfW, h) {
  for (let j = 0; j < h; j++) {
    for (let x = -halfW; x <= halfW; x++) set(g, cx + x, baseY - j, 'k');
  }
  for (let j = 1; j < h - 1; j++) {                          // furnace light spilling out
    for (let x = -halfW + 1; x <= halfW - 1; x++) set(g, cx + x, baseY - j, j > h - 3 ? 'E' : 'e');
  }
  for (let j = 0; j <= h; j++) { set(g, cx - halfW - 1, baseY - j, 'H'); set(g, cx + halfW + 1, baseY - j, 'O'); }
  for (let x = -halfW - 1; x <= halfW + 1; x++) set(g, cx + x, baseY - h, 'y');   // lintel
}

/** A carved glyph band across a riser — blood-cut channels, Demon-only decoration. */
export function glyphBand(g, cx, y, halfW, seed = 1) {
  for (let x = -halfW; x <= halfW; x++) set(g, cx + x, y, 'O');
  for (let x = -halfW + 2; x <= halfW - 2; x += 4) {
    set(g, cx + x, y, 'b'); set(g, cx + x + 1, y, 'B');
    set(g, cx + x, y - 1, 'O'); set(g, cx + x + 1, y + 1, 'o');
  }
}

/** A corner brazier — a bowl of fire on a terrace edge. Count and size are the tier dial. */
export function brazier(g, cx, baseY, r, flameH) {
  ellipse(g, cx, baseY, r, r * 0.55, 'H');
  ellipse(g, cx, baseY - 1, r - 1, r * 0.42, 'O');
  for (let j = 0; j < flameH; j++) {
    const t = j / flameH;
    const half = Math.max(0, Math.round((r - 1) * (1 - t)));
    for (let x = -half; x <= half; x++) {
      set(g, cx + x, baseY - 2 - j, t > 0.72 ? 'X' : t > 0.42 ? 'x' : t > 0.18 ? 'F' : 'f');
    }
  }
}

/** A skull glyph set into stone — small, and always paired with an ember eye. */
export function skullGlyph(g, cx, cy, eye = 'x') {
  disc(g, cx, cy, 1.6, 'n');
  set(g, cx, cy - 1, 'N');
  set(g, cx - 1, cy, eye); set(g, cx + 1, cy, eye);
  set(g, cx, cy + 2, 'n'); set(g, cx - 1, cy + 2, 'k'); set(g, cx + 1, cy + 2, 'k');
}

/** Lava seams cracking across a face — the Demon equivalent of weathering. */
export function lavaSeams(g, x, y, w, h, seed = 3, density = 0.05) {
  speckle(g, x, y, w, h, 'E', density, seed, 'oOhH');
  speckle(g, x, y, w, h, 'f', density * 0.4, seed + 17, 'E');
}

export { set, get, rect, ellipse, line, poly, disc, EMPTY, cylinderV, cylinderH, sphere, ramp, speckle };
