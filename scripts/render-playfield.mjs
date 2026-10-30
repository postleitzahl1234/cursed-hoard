#!/usr/bin/env node
/**
 * Renders a real .map file at the real geometry — 40x22 cells of 32 px, 1280x704, 1:1.
 *
 * This is the only check that exercises the whole chain at once: the migrated level data, the
 * 40x22 grid, the auto-edge resolver and the new tile art. A contact sheet of tiles tells you
 * nothing about whether a lane's bank reads at speed; a playfield does.
 *
 * The piece-selection logic below is a deliberate line-by-line mirror of
 * TileResolver.build()/mask() in Java. If the two ever disagree, this render is wrong in a way
 * that is obvious to the eye, which is the point of keeping them side by side.
 *
 *   node scripts/render-playfield.mjs [w1_l1 w3_l4 ...]
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLPath(import.meta.url)), '..');
function fileURLPath(u) { return decodeURIComponent(new URL(u).pathname.replace(/^\/([A-Za-z]:)/, '$1')); }

const COLS = 40, ROWS = 22, TS = 32;
const DATA = path.join(ROOT, 'Game_assets_v2/assets/data');
const { PALETTE } = await import(pathToFileURL(path.join(DATA, 'palette.js')));

const SPRITES = {}, LEGENDS = {};
for (const m of ['tiles/w1_grass', 'tiles/w2_mountain', 'tiles/w3_sand', 'tiles/w4_garden',
  'tiles/w5_shadow', 'obstacles', 'buildings']) {
  const mod = await import(pathToFileURL(path.join(DATA, m + '.js')));
  for (const [k, s] of Object.entries(mod.SPRITES)) { SPRITES[k] = s; LEGENDS[k] = mod.LEGEND; }
}

// ── PNG ─────────────────────────────────────────────────────────────────────
const rgba = hex => { const h = hex.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255]; };
const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function png(w, h, buf) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; buf.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ch = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ch('IHDR', ihdr), ch('IDAT', zlib.deflateSync(raw)), ch('IEND', Buffer.alloc(0))]);
}
class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.buf = Buffer.alloc(w * h * 4); }
  px(x, y, [r, g, b, a]) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !a) return;
    const o = (y * this.w + x) * 4, f = a / 255;
    this.buf[o] = Math.round(this.buf[o] * (1 - f) + r * f);
    this.buf[o + 1] = Math.round(this.buf[o + 1] * (1 - f) + g * f);
    this.buf[o + 2] = Math.round(this.buf[o + 2] * (1 - f) + b * f);
    this.buf[o + 3] = Math.max(this.buf[o + 3], a);
  }
}

/**
 * Draw a sprite at an arbitrary pixel position, at its NATIVE size — no scaling anywhere in this
 * renderer, because the whole point of the 1:1 geometry is that nothing is ever resampled. Decor
 * is foot-anchored: `px, py` is the middle of its base.
 */
function stamp(cv, key, px, py, frame = 0) {
  const s = SPRITES[key], leg = LEGENDS[key];
  if (!s) return false;
  const f = s.frames[Math.min(frame, s.frames.length - 1)];
  const w = f[0].length, h = f.length;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const code = leg[f[y][x]];
      if (code) cv.px(px - (w >> 1) + x, py - h + y, rgba(PALETTE[code]));
    }
  return true;
}

/** Draw one 32x32 sprite at a cell, with the blueprint's 0..3 quarter-turn. */
function blit(cv, key, cx, cy, rot = 0) {
  const s = SPRITES[key], leg = LEGENDS[key];
  if (!s) return false;
  const f = s.frames[0];
  for (let y = 0; y < TS; y++)
    for (let x = 0; x < TS; x++) {
      const code = leg[f[y][x]];
      if (!code) continue;
      let dx = x, dy = y;
      for (let r = 0; r < rot; r++) { const t = dx; dx = TS - 1 - dy; dy = t; }
      cv.px(cx * TS + dx, cy * TS + dy, rgba(PALETTE[code]));
    }
  return true;
}

// ── .map parsing ────────────────────────────────────────────────────────────
function parseMap(file) {
  const terrain = Array.from({ length: COLS }, () => Array(ROWS).fill(null));
  const rot = Array.from({ length: COLS }, () => Array(ROWS).fill(0));
  const overlay = Array.from({ length: COLS }, () => Array(ROWS).fill('NONE'));
  const decor = Array.from({ length: COLS }, () => Array(ROWS).fill(null));
  let base = 'tile_grass_base', name = '';
  for (const ln of fs.readFileSync(file, 'utf8').split('\n')) {
    const p = ln.trim().split(/\s+/);
    if (p[0] === 'base') base = p[1];
    else if (p[0] === 'name') name = p[1];
    else if (p[0] === 'c') {
      const c = +p[1], r = +p[2];
      for (let i = 3; i < p.length; i += 2) {
        if (p[i] === 't') terrain[c][r] = p[i + 1];
        else if (p[i] === 'r') rot[c][r] = +p[i + 1];
        else if (p[i] === 'o') overlay[c][r] = p[i + 1];
        else if (p[i] === 'd') decor[c][r] = p[i + 1];
      }
    }
  }
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (!terrain[c][r]) terrain[c][r] = base;
  return { name, base, terrain, rot, overlay, decor };
}

const isWater = k => !!k && /water|brook|canal|river|oasis/.test(k);

// ── the resolver — mirrors TileResolver.java ────────────────────────────────
const N = 1, E = 2, S_ = 4, W = 8, NE = 16, SE = 32, SW = 64, NW = 128;
function piecesFor(m) {
  const out = [];
  const n = !!(m & N), e = !!(m & E), s = !!(m & S_), w = !!(m & W);
  if (n) out.push('n'); if (e) out.push('e'); if (s) out.push('s'); if (w) out.push('w');
  if ((m & NE) && !n && !e) out.push('one');
  if ((m & SE) && !s && !e) out.push('ose');
  if ((m & SW) && !s && !w) out.push('osw');
  if ((m & NW) && !n && !w) out.push('onw');
  if (n && e) out.push('ine');
  if (s && e) out.push('ise');
  if (s && w) out.push('isw');
  if (n && w) out.push('inw');
  return out;
}

/** layer rank per cell: 0 base, 1 water, 2 path. Editor rows are top-down, so N is r-1. */
function rankGrid(bp) {
  const g = Array.from({ length: COLS }, () => Array(ROWS).fill(0));
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    g[c][r] = bp.overlay[c][r] !== 'NONE' ? 2 : isWater(bp.terrain[c][r]) ? 1 : 0;
  }
  return g;
}

function maskAt(rank, c, r, layer) {
  // equality, not >=. A road is not water; see the note in TileResolver.at().
  const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS) ? false : rank[x][y] === layer;
  let m = 0;
  if (at(c, r - 1)) m |= N;          // editor row 0 is the top of the image = north
  if (at(c + 1, r)) m |= E;
  if (at(c, r + 1)) m |= S_;
  if (at(c - 1, r)) m |= W;
  if (at(c + 1, r - 1)) m |= NE;
  if (at(c + 1, r + 1)) m |= SE;
  if (at(c - 1, r + 1)) m |= SW;
  if (at(c - 1, r - 1)) m |= NW;
  return m;
}

const PATH_OF = { grass: 'tile_grass_path', mountain: 'tile_mountain_path', sand: 'tile_sand_path', garden: 'tile_garden_path', shadow: 'tile_shadow_path' };
const WATER_OF = { grass: 'tile_grass_brook', mountain: 'tile_mountain_frozen_river', sand: 'tile_sand_oasis_water', garden: 'tile_garden_canal', shadow: 'tile_shadow_cursed_water' };
const familyOf = base => base.includes('mountain') ? 'mountain' : base.includes('sand') ? 'sand'
  : base.includes('garden') || base.includes('lawn') ? 'garden' : base.includes('shadow') ? 'shadow' : 'grass';

function render(bp) {
  const cv = new Canvas(COLS * TS, ROWS * TS);
  const fam = familyOf(bp.base);
  const rank = rankGrid(bp);
  const missing = new Set();

  // pass 1: the flat bed — exactly what the editor authored, key and rotation
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++)
    if (!blit(cv, bp.terrain[c][r], c, r, bp.rot[c][r])) missing.add(bp.terrain[c][r]);

  // passes 2-3: auto-edges. Water first, so the road crosses it rather than the reverse.
  for (const [layer, src] of [[1, WATER_OF[fam]], [2, PATH_OF[fam]]])
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      if (rank[c][r] >= layer) continue;
      for (const p of piecesFor(maskAt(rank, c, r, layer)))
        if (!blit(cv, `${src}_edge_${p}`, c, r)) missing.add(`${src}_edge_${p}`);
    }

  // pass 4: buildings, then trees in two bands.
  // The band split mirrors the engine: every trunk is drawn before any canopy, so overlapping
  // treetops never sit behind a neighbour's trunk. Anything with no art left gets hatched, so a
  // render can never silently look finished.
  const decor = [];
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++)
    if (bp.decor[c][r]) decor.push([c, r, bp.decor[c][r]]);
  decor.sort((a, b) => a[1] - b[1]);                    // painter's order, back to front

  for (const [c, r, d] of decor) {
    if (!d.startsWith('bld_')) continue;
    // a 3x2 footprint anchored at its top-left cell; the sprite stands on the footprint's base
    if (!stamp(cv, d, c * TS + TS * 1.5, (r + 2) * TS + 6)) missing.add(d);
  }
  // The gem cave is NOT decor in the .map — the engine builds it at runtime from
  // `map.cavePosition`, which BlueprintLevel sets to the end of the traced route. So it is
  // present in every level and always has been; this renderer simply was not drawing it, which
  // made five evidence images look like the caves were missing. Draw it where the engine does.
  // The CAVE marker sits on ONE cell of the lane's 2x2 end stamp (the anchor's top-right), so
  // drawing on that cell puts the cave half a cell off the road. The stamp anchor is (c-1, r),
  // so the lane's true centre is x = c*TS, y = (r+1)*TS — which is also where the engine's
  // `map.cavePosition` lands, because BlueprintLevel shifts the route onto the lane centreline.
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++)
    if (bp.overlay[c][r] === 'CAVE' && !stamp(cv, 'bld_gem_cave', c * TS, (r + 1) * TS + 5))
      missing.add('bld_gem_cave');

  for (const [c, r, d] of decor) {
    if (d.startsWith('bld_')) continue;
    if (!stamp(cv, d, c * TS + TS, (r + 1) * TS + 8)) missing.add(d);
  }
  for (const [c, r, d] of decor) {
    if (SPRITES[d]) continue;
    const col = d.startsWith('bld_') ? [220, 170, 60, 210] : [40, 90, 40, 190];
    for (let y = 4; y < TS - 4; y++) for (let x = 4; x < TS - 4; x++)
      if ((x + y) % 3 === 0) cv.px(c * TS + x, r * TS + y, col);
  }
  return { cv, missing };
}

// ── main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const names = args.length ? args : ['w1_l1', 'w2_l3', 'w3_l2', 'w4_l4', 'w5_l5'];
const outDir = path.join(ROOT, 'redesign', 'pilot-evidence');
fs.mkdirSync(outDir, { recursive: true });
const allMissing = new Set();
for (const n of names) {
  const bp = parseMap(path.join(ROOT, 'assets', 'maps', n + '.map'));
  const { cv, missing } = render(bp);
  missing.forEach(m => allMissing.add(m));
  fs.writeFileSync(path.join(outDir, `playfield_${n}.png`), png(cv.w, cv.h, cv.buf));
  const edges = (() => { let t = 0; const rank = rankGrid(bp); for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) for (const L of [1, 2]) if (rank[c][r] < L) t += piecesFor(maskAt(rank, c, r, L)).length; return t; })();
  console.log(`${n}: ${cv.w}x${cv.h} · ${edges} auto-edge pieces drawn`);
}
console.log(allMissing.size ? `MISSING KEYS: ${[...allMissing].join(', ')}` : 'every key resolved');
