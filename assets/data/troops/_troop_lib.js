// troops/_troop_lib.js — clip assembly and ABILITY FX for troops. No anatomy lives here.
//
// D-04(d): "every ability ships its own FX sprite." D-25: troops are authored as
// idle + locomotion + (ability) + death — no attack swing. So the ability clip is where a
// unit's mechanical identity becomes visible, and it is the one clip that must never be
// generic: a Banner Sergeant's speed ring and a Pavise Guard's taunt pulse are different
// events, not one glow in two colours.
//
// The FX painters below are keyed to the actual UnitBehavior classes in the engine, so an
// ability animation always matches what the unit really does.

import { grid, set, rows, disc, ellipse, line } from '../lib/pixel.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';

/** Canvas sizes match what CursedHoardGame.drawHeroes asks for, so nothing is resampled. */
export const SIZE = { normal: 32, champion: 44, boss: 56 };

export function clip(frames, fps, loop = true, anchor = 'foot') {
  return { anchor, fps, loop, frames: frames.map(rows) };
}

/**
 * The standard finishing pass every troop runs: occlusion, rim light, ink, contact shadow.
 * `rim` is per-world — W5 needs a hot rim or its units vanish into the ground (D-22d).
 */
export function finish(g, opts = {}) {
  const { ground = 28, shadowW = 7, rimCh = null, skip = 'kKqQ', inkSoft = 'qQ', aoFrom = null, aoCh = null } = opts;
  if (aoFrom && aoCh) ao(g, aoCh, { from: aoFrom, radius: 1 });
  if (rimCh) rimLight(g, rimCh, { dir: { x: 1, y: 1 }, skip, density: 0.3 });
  outline(g, 'k', { soft: inkSoft });
  contactShadow(g, Math.round(g.w / 2), ground + 2, shadowW, 1.7, 'q');
  contactShadow(g, Math.round(g.w / 2), ground + 2, Math.max(2, shadowW - 3), 1.0, 'Q');
  return g;
}

// ── ability FX, one painter per behaviour ────────────────────────────────────
// Each takes (grid, frame, total, cx, cy) and paints OVER the unit's idle pose.

/** SupportAura — an expanding speed ring at the feet. Flat ellipse: it is a ground effect. */
export function fxSupportAura(g, f, n, cx, cy, ch = 'M', hot = 'o') {
  const r = 5 + f * 5;
  for (let a = 0; a < 360; a += 12) {
    const t = a * Math.PI / 180;
    set(g, cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.38, a % 48 < 24 ? ch : hot);
  }
  if (f > 0) for (let a = 0; a < 360; a += 24) {
    const t = a * Math.PI / 180;
    set(g, cx + Math.cos(t) * (r - 4), cy + Math.sin(t) * (r - 4) * 0.38, ch);
  }
}

/** Taunt — a hard shockwave at CHEST height, punched outward. Reads as a shout, not a buff. */
export function fxTaunt(g, f, n, cx, cy, ch = 'r', hot = 'R') {
  const r = 3 + f * 6;
  for (let a = 0; a < 360; a += 10) {
    const t = a * Math.PI / 180;
    set(g, cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.62, hot);
  }
  if (f >= 1) for (let a = 0; a < 360; a += 20) {
    const t = a * Math.PI / 180;
    set(g, cx + Math.cos(t) * (r - 3), cy + Math.sin(t) * (r - 3) * 0.62, ch);
  }
}

/** ThresholdInvuln — a shimmer of scattered glints over the body, not a ring. */
export function fxInvulnShimmer(g, f, n, cx, cy, ch = 'y', dim = 'G') {
  const spots = [[-5, -9], [4, -6], [-3, 1], [6, -1], [0, -13], [-6, -3], [3, 4]];
  spots.forEach(([dx, dy], i) => {
    if ((i + f) % 2) return;
    set(g, cx + dx, cy + dy, ch);
    set(g, cx + dx, cy + dy - 1, dim);
    set(g, cx + dx + 1, cy + dy, dim);
  });
}

/** ContinuousSummon / ThresholdSummon — motes spiralling UP out of the ground. */
export function fxSummon(g, f, n, cx, cy, ch = 'M', hot = 'o') {
  for (let i = 0; i < 8; i++) {
    const a = (f / n) * Math.PI * 2 + i * 0.8;
    const r = 4 + f * 3 + (i % 3) * 2;
    const x = cx + Math.cos(a) * r, y = cy - f * 3 + Math.sin(a) * r * 0.45;
    set(g, x, y, i % 2 ? hot : ch);
    set(g, x, y - 1, ch);
  }
}

/** HealAura — soft crosses drifting upward. */
export function fxHeal(g, f, n, cx, cy, ch = 'o') {
  for (let i = 0; i < 4; i++) {
    const x = cx - 6 + i * 4, y = cy - 2 - f * 3 - (i % 2) * 3;
    set(g, x, y, ch); set(g, x - 1, y, ch); set(g, x + 1, y, ch);
    set(g, x, y - 1, ch); set(g, x, y + 1, ch);
  }
}

/** Frenzy — jagged spikes bursting off the silhouette. */
export function fxFrenzy(g, f, n, cx, cy, ch = 'M') {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + f * 0.4;
    const r0 = 6, r1 = 9 + (f % 2) * 3;
    line(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.7,
            cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.7, ch);
  }
}

/** ShieldMode / AllyShield / SteamShield — a hexagonal bubble that closes over the unit. */
export function fxShield(g, f, n, cx, cy, ch = 'H', hot = 'h') {
  const rx = 10, ry = 13, t = (f + 1) / n;
  for (let a = 0; a < 360; a += 6) {
    const r = a * Math.PI / 180;
    if (a / 360 > t) continue;                        // the bubble draws itself closed
    set(g, cx + Math.cos(r) * rx, cy + Math.sin(r) * ry, a % 30 < 15 ? ch : hot);
  }
}

/** Untargetable / vanish — the body dissolves into rising flecks. */
export function fxVanish(g, f, n, cx, cy, ch = 'M') {
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.px[y][x] === '`') continue;
    if ((x * 7 + y * 13 + f * 5) % (n + 1) === 0) g.px[y][x] = '`';
  }
  for (let i = 0; i < 6; i++) set(g, cx - 5 + i * 2, cy - 4 - f * 3 - (i % 3) * 2, ch);
}

/** DeathExplosion — a hard burst, used on the death clip rather than an ability clip. */
export function fxBurst(g, f, n, cx, cy, chars = ['M', 'o']) {
  const r = 4 + f * 6;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    set(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, chars[i % chars.length]);
    set(g, cx + Math.cos(a) * (r * 0.6), cy + Math.sin(a) * (r * 0.42), chars[0]);
  }
}

export { grid, set, rows, disc, ellipse, line, innerLine };
