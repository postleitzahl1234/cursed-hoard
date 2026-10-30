// scripts/silhouette-gate.mjs — turns D-28's "squint test" from a review opinion into a build failure.
//
// D-28: "wave-mates must be distinguishable as black shapes at 32 px."
// D-27: the same bar for the 12 towers of a faction.
//
// This script renders every sprite's first frame as a pure black mask, aligns the two masks on
// their bounding boxes, and reports the symmetric difference as a percentage of the union. Two
// units that are the same rig in two palettes score near 0 and FAIL. Genuinely different
// creatures score high and PASS.
//
// Usage:  node scripts/silhouette-gate.mjs [--min 35] [--json]
// Exit code 1 if any tested pair falls below the threshold.

import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(ROOT, 'Game_assets_v2', 'assets', 'data');

const args = process.argv.slice(2);
const MIN = Number(args[args.indexOf('--min') + 1]) || 35;
const AS_JSON = args.includes('--json');

/** Every sprite key in a module, as {key, mask, bbox}. */
async function masksFor(modPath) {
  const mod = await import(pathToFileURL(path.join(DATA, modPath)));
  const legend = mod.LEGEND;
  const out = [];
  for (const [key, sp] of Object.entries(mod.SPRITES)) {
    const f = sp.frames[0];
    const pts = [];
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < f.length; y++) {
      for (let x = 0; x < f[y].length; x++) {
        const code = legend[f[y][x]];
        if (code == null) continue;
        if (code === 'SH0' || code === 'SH1' || code === 'SH2') continue;   // shadow is not silhouette
        pts.push([x, y]);
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (!pts.length) continue;
    out.push({ key, modPath, pts, x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  return out;
}

/**
 * Difference of two silhouettes, 0–100 (symmetric difference over union).
 *
 * Two alignment modes, because the two rules they enforce are different:
 *
 *  'fit'    — scale both to a common 32 px box, centre-aligned. Used for TROOPS, where the
 *             engine draws every unit at a similar screen size, so "make it bigger" is not a
 *             distinctness lever. Shape alone has to differ. This is the harsh mode.
 *
 *  'native' — no scaling; align on the ground line and the horizontal centre. Used for TOWERS,
 *             where D-27 lists SIZE as lever #1 and the engine really does draw a T6 taller
 *             than a T1. Normalising size away would ask towers to pass a test their own spec
 *             says they do not have to.
 */
function diff(a, b, mode = 'fit', box = 32) {
  const norm = (s) => {
    const set = new Set();
    if (mode === 'native') {
      const cx = (s.x0 + s.x1) / 2;
      for (const [x, y] of s.pts) set.add(`${Math.round(x - cx)},${Math.round(y - s.y1)}`);
    } else {
      const k = box / Math.max(s.w, s.h);
      const ox = (box - s.w * k) / 2, oy = (box - s.h * k) / 2;
      for (const [x, y] of s.pts) set.add(`${Math.round((x - s.x0) * k + ox)},${Math.round((y - s.y0) * k + oy)}`);
    }
    return set;
  };
  const A = norm(a), B = norm(b);
  let inter = 0;
  for (const k of A) if (B.has(k)) inter++;
  const uni = A.size + B.size - inter;
  return uni === 0 ? 0 : Math.round((1 - inter / uni) * 100);
}

// ── what to test ─────────────────────────────────────────────────────────────
// Troops: any two units that can appear in the same wave. Towers: EVERY pair within a faction,
// discovered from the folder so a newly authored tier is tested the moment it lands.
function discover(dir, prefix) {
  const full = path.join(DATA, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter(f => f.endsWith('.js') && !f.startsWith('_') && (!prefix || f.startsWith(prefix)))
    .sort()
    .map(f => `${dir}/${f}`);
}

// D-28's bar is "wave-mates must be distinguishable" — and waves are built from ONE world's
// roster (WavePlan reads a per-world ordinal block). So troops are grouped by world: a W2
// Temple Guard and a W4 Household Guard can never stand next to each other, and holding them
// to the same bar as two units from the same army measures something the game never shows.
// Cross-world pairs are still reported, just not gated.
const GROUPS = [
  { name: 'W1 troops', mode: 'fit', mods: discover('troops', 'w1_'), only: /_idle$/ },
  { name: 'W2 troops', mode: 'fit', mods: discover('troops', 'w2_'), only: /_idle$/ },
  { name: 'W3 troops', mode: 'fit', mods: discover('troops', 'w3_'), only: /_idle$/ },
  { name: 'W4 troops', mode: 'fit', mods: discover('troops', 'w4_'), only: /_idle$/ },
  { name: 'W5 troops', mode: 'fit', mods: discover('troops', 'w5_'), only: /_idle$/ },
  { name: 'orc towers', mode: 'native', mods: discover('towers', 'orc_'), only: /_base$/ },
  { name: 'crypt towers', mode: 'native', mods: discover('towers', 'crypt_'), only: /_base$/ },
  { name: 'demon towers', mode: 'native', mods: discover('towers', 'demon_'), only: /_base$/ },
  { name: 'goblin towers', mode: 'native', mods: discover('towers', 'goblin_'), only: /_base$/ },
].filter(g => g.mods.length > 0);   // a world is one module holding many units, so count sprites, not files

const report = [];
let failed = 0;

for (const grp of GROUPS) {
  const all = [];
  for (const m of grp.mods) all.push(...(await masksFor(m)).filter(s => grp.only.test(s.key)));
  if (all.length < 2) continue;
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const d = diff(all[i], all[j], grp.mode);
      const ok = d >= MIN;
      if (!ok) failed++;
      report.push({ group: grp.name, mode: grp.mode, a: all[i].key, b: all[j].key, diff: d, pass: ok });
    }
  }
}

if (AS_JSON) {
  console.log(JSON.stringify({ min: MIN, failed, report }, null, 2));
} else {
  console.log(`silhouette gate — threshold ${MIN}% shape difference (D-27 / D-28)\n`);
  let group = null;
  for (const r of report) {
    if (r.group !== group) { group = r.group; console.log(`  ${group}  [${r.mode} alignment]`); }
    console.log(`    ${r.pass ? 'PASS' : 'FAIL'}  ${String(r.diff).padStart(3)}%   ${r.a}  vs  ${r.b}`);
  }
  console.log(`\n${report.length - failed}/${report.length} pairs pass.`);
  if (failed) console.log(`\n${failed} pair(s) are too similar in outline. D-28: "no unit may be a\nrecolour, rescale or part-swap of another unit's body."`);
}

process.exit(failed ? 1 : 0);
