// projectiles/_proj_lib.js — shared drawing verbs for projectiles. No projectile lives here.
//
// D-06: "every tower tier ships its own attack animation + a custom projectile sprite — no
// projectile/beam is reused across tiers." 48 towers, 48 projectiles, zero sharing. The engine
// enforces the no-reuse half itself: `SpriteKeys.buildProjectileMap` keeps a `claimed` set, so
// two towers can never resolve to the same sprite.
//
// Canvas is small — 12×12 up to 28×28 — and D-21 was amended to 1× density (A-1), so one source
// pixel is one screen pixel. At that size the whole read is: SILHOUETTE + one bright core.
// Anything subtler than a two-value ramp is invisible on a moving object.
//
// Projectiles free-rotate to their flight angle in the engine (§2.2), so unlike the towers these
// are authored pointing EAST and must stay legible when spun.

import { grid, set, rect, ellipse, disc, line, poly, rows, EMPTY } from '../lib/pixel.js';
import { ramp } from '../lib/shade.js';
import { outline } from '../lib/ink.js';

export { grid, set, rect, ellipse, disc, line, poly, rows, ramp, EMPTY };

/** A shaft with a head — bolts, spears, harpoons. Points east. */
export function shaft(g, x0, y, len, thick, headLen, body, head, ink = 'k') {
  for (let i = 0; i < len; i++) {
    for (let o = 0; o < thick; o++) set(g, x0 + i, y + o, o === 0 ? head : body);
  }
  for (let i = 0; i < headLen; i++) {                      // tapered point
    const h = Math.max(1, Math.round(thick * (1 - i / headLen) + 1));
    for (let o = -1; o < h; o++) set(g, x0 + len + i, y + o, o < 0 ? head : body);
  }
  if (ink) outline(g, ink, { soft: '' });
}

/** Fletching / drag vanes at the tail. */
export function fletch(g, x, y, size, ch) {
  for (let i = 0; i < size; i++) {
    set(g, x + i, y - 1 - i, ch);
    set(g, x + i, y + 1 + i, ch);
  }
}

/** A round shot — bombs, boulders, shells. `hi` lights the NW quadrant. */
export function shot(g, cx, cy, r, rmp) {
  for (let y = -Math.ceil(r); y <= Math.ceil(r); y++) {
    for (let x = -Math.ceil(r); x <= Math.ceil(r); x++) {
      const d = Math.hypot(x, y);
      if (d > r) continue;
      const l = (-x - y) / (r * 1.42);
      set(g, cx + x, cy + y, rmp.at((l * 0.5 + 0.5) * (rmp.n - 1)));
    }
  }
}

/** A glowing orb with a hot core and a soft corona — charges, embers, plasma. */
export function orb(g, cx, cy, r, outerCh, midCh, coreCh) {
  ellipse(g, cx, cy, r, r, outerCh);
  ellipse(g, cx, cy, r * 0.66, r * 0.66, midCh);
  ellipse(g, cx, cy, r * 0.34, r * 0.34, coreCh);
}

/** A comet tail streaming west (behind an east-flying projectile). */
export function trail(g, cx, cy, len, chars) {
  for (let i = 1; i <= len; i++) {
    const t = i / len;
    const h = Math.max(0, Math.round(2.2 * (1 - t)));
    const ch = chars[Math.min(chars.length - 1, Math.floor(t * chars.length))];
    for (let o = -h; o <= h; o++) set(g, cx - i, cy + o, ch);
  }
}

/** A jagged fork — lightning, cracks, shattering ice. */
export function fork(g, x0, y0, x1, y1, ch, hot, seed = 0) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  let px = x0, py = y0;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const jx = x0 + (x1 - x0) * t;
    const jy = y0 + (y1 - y0) * t + Math.sin(i * 1.7 + seed) * 2.2 * (1 - Math.abs(t - 0.5) * 1.2);
    line(g, px, py, jx, jy, ch);
    px = jx; py = jy;
  }
  set(g, x1, y1, hot);
}

/** A ring pulse — novas, terror waves, shockwaves. Drawn as an ellipse for the 3/4 view. */
export function ring(g, cx, cy, rx, ry, ch, hot) {
  for (let a = 0; a < 360; a += 3) {
    const r = a * Math.PI / 180;
    set(g, cx + Math.cos(r) * rx, cy + Math.sin(r) * ry, ch);
  }
  for (let a = 0; a < 360; a += 45) {
    const r = a * Math.PI / 180;
    set(g, cx + Math.cos(r) * rx, cy + Math.sin(r) * ry, hot);
  }
}

/** Assemble an animated clip from per-frame painters. */
export function clip(w, h, frames, painter, fps = 10, loop = true) {
  return {
    anchor: 'center', fps, loop,
    frames: Array.from({ length: frames }, (_, i) => {
      const g = grid(w, h);
      painter(g, i, frames);
      return rows(g);
    }),
  };
}
