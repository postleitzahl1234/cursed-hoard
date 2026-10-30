// lib/pixel.js — geometry primitives ONLY.
//
// HARD RULE (D-28): nothing in lib/ may encode a body plan, a building plan, or a pose.
// If a helper knows what a "shoulder", a "roof" or a "leg" is, it belongs in the unit's own
// file, not here. This file knows about pixels and shapes. That is the whole point: it must be
// structurally impossible to ship two units that are the same rig in two palettes.

export const EMPTY = '`';

export function grid(w, h, fill = EMPTY) {
  return { w, h, px: Array.from({ length: h }, () => Array(w).fill(fill)) };
}

export function clone(g) {
  return { w: g.w, h: g.h, px: g.px.map(r => r.slice()) };
}

export function set(g, x, y, ch) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return;
  g.px[y][x] = ch;
}

export function get(g, x, y) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= g.w || y >= g.h) return null;
  return g.px[y][x];
}

/** Paint only where the target is currently empty (draw *behind* existing pixels). */
export function under(g, x, y, ch) {
  if (get(g, x, y) === EMPTY) set(g, x, y, ch);
}

export function rect(g, x, y, w, h, ch) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, ch);
}

export function hline(g, x, y, w, ch) { for (let i = 0; i < w; i++) set(g, x + i, y, ch); }
export function vline(g, x, y, h, ch) { for (let j = 0; j < h; j++) set(g, x, y + j, ch); }

/** Filled ellipse. rx/ry are radii; soft=true trims the 4 extreme tips for a rounder read. */
export function ellipse(g, cx, cy, rx, ry, ch, soft = false) {
  for (let y = -Math.ceil(ry); y <= Math.ceil(ry); y++) {
    for (let x = -Math.ceil(rx); x <= Math.ceil(rx); x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (d <= 1.0) {
        if (soft && d > 0.82 && (Math.abs(x) === Math.round(rx) || Math.abs(y) === Math.round(ry))) continue;
        set(g, cx + x, cy + y, ch);
      }
    }
  }
}

export function disc(g, cx, cy, r, ch) { ellipse(g, cx, cy, r, r, ch); }

/** Bresenham-ish line with optional thickness. */
export function line(g, x0, y0, x1, y1, ch, thick = 1) {
  const dx = x1 - x0, dy = y1 - y0;
  const n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= n; i++) {
    const x = x0 + (dx * i) / n, y = y0 + (dy * i) / n;
    if (thick <= 1) set(g, x, y, ch);
    else disc(g, x, y, (thick - 1) / 2, ch);
  }
}

/** Filled convex polygon by scanline. pts = [[x,y],...] */
export function poly(g, pts, ch) {
  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) set(g, x, y, ch);
    }
  }
}

/** Tapered limb/branch/barrel: a quad from (x0,y0) width w0 to (x1,y1) width w1. */
export function taper(g, x0, y0, x1, y1, w0, w1, ch) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.max(1e-3, Math.hypot(dx, dy));
  const nx = -dy / len, ny = dx / len;
  poly(g, [
    [x0 + nx * w0 / 2, y0 + ny * w0 / 2],
    [x1 + nx * w1 / 2, y1 + ny * w1 / 2],
    [x1 - nx * w1 / 2, y1 - ny * w1 / 2],
    [x0 - nx * w0 / 2, y0 - ny * w0 / 2],
  ], ch);
}

/** 4-way flood fill of `from` into `to`, starting at (x,y). */
export function flood(g, x, y, from, to) {
  const stack = [[Math.round(x), Math.round(y)]];
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (get(g, cx, cy) !== from) continue;
    set(g, cx, cy, to);
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
}

/** Mirror the left half onto the right (for bilaterally symmetric structures). */
export function mirrorX(g, axis = null) {
  const ax = axis == null ? (g.w - 1) / 2 : axis;
  for (let y = 0; y < g.h; y++) {
    for (let x = 0; x < Math.floor(ax + 0.5); x++) {
      const mx = Math.round(2 * ax - x);
      if (mx >= 0 && mx < g.w) g.px[y][mx] = g.px[y][x];
    }
  }
}

/** Symmetric set: paint (x,y) and its mirror about `axis`. */
export function sset(g, x, y, ch, axis) {
  set(g, x, y, ch);
  set(g, Math.round(2 * axis - x), y, ch);
}

/** Composite `src` onto `dst` at offset, skipping EMPTY. */
export function blit(dst, src, ox, oy) {
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const c = src.px[y][x];
    if (c !== EMPTY) set(dst, ox + x, oy + y, c);
  }
}

/** Shift the whole grid (used for bob/recoil frames). */
export function shift(g, dx, dy) {
  const out = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.px[y][x] !== EMPTY) set(out, x + dx, y + dy, g.px[y][x]);
  }
  return out;
}

/** Replace every occurrence of one char with another (cheap palette swap within a frame). */
export function swap(g, from, to) {
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.px[y][x] === from) g.px[y][x] = to;
}

/** Row-strings, the format the exporter and renderer expect. */
export function rows(g) { return g.px.map(r => r.join('')); }

/** True if the column/row is entirely empty — used by the silhouette gate. */
export function bounds(g) {
  let x0 = g.w, y0 = g.h, x1 = -1, y1 = -1;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.px[y][x] !== EMPTY) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
