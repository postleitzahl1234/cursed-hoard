// Pilot renderer — rasterises the new bespoke sprite modules straight from source,
// with alpha support, multi-zoom comparison strips and a black-silhouette squint test.
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(ROOT, 'Game_assets_v2/assets/data');

const { PALETTE } = await import(pathToFileURL(path.join(DATA, 'palette.js')));

function rgba(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16),
    h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255];
}

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
  constructor(w, h, bg = '#181226') {
    this.w = w; this.h = h; this.buf = Buffer.alloc(w * h * 4);
    const [r, g, b] = rgba(bg);
    for (let i = 0; i < w * h; i++) { this.buf[i * 4] = r; this.buf[i * 4 + 1] = g; this.buf[i * 4 + 2] = b; this.buf[i * 4 + 3] = 255; }
  }
  px(x, y, [r, g, b, a]) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const o = (y * this.w + x) * 4, f = a / 255;
    this.buf[o] = Math.round(this.buf[o] * (1 - f) + r * f);
    this.buf[o + 1] = Math.round(this.buf[o + 1] * (1 - f) + g * f);
    this.buf[o + 2] = Math.round(this.buf[o + 2] * (1 - f) + b * f);
  }
  rect(x, y, w, h, col) { const c = rgba(col); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
  save(p) { fs.writeFileSync(p, png(this.w, this.h, this.buf)); }
}

/** Draw one frame (array of row-strings) at integer scale. mode: 'colour' | 'silhouette' */
function drawFrame(cv, frame, legend, ox, oy, scale, mode = 'colour') {
  for (let y = 0; y < frame.length; y++) {
    const row = frame[y];
    for (let x = 0; x < row.length; x++) {
      const code = legend[row[x]];
      if (code == null) continue;
      const hex = PALETTE[code];
      if (!hex) { console.warn('OFF-PALETTE code', code, 'char', JSON.stringify(row[x])); continue; }
      const col = mode === 'silhouette' ? [0, 0, 0, 255] : rgba(hex);
      for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) cv.px(ox + x * scale + sx, oy + y * scale + sy, col);
    }
  }
}

function frameSize(sprite) {
  let h = 0, w = 0;
  for (const f of sprite.frames) { h = Math.max(h, f.length); for (const r of f) w = Math.max(w, r.length); }
  return { w, h };
}

/** Silhouette difference between two sprites' first frames, as % of the union area. */
export function silhouetteDiff(a, la, b, lb) {
  const mask = (sp, lg) => {
    const f = sp.frames[0], s = new Set();
    for (let y = 0; y < f.length; y++) for (let x = 0; x < f[y].length; x++) if (lg[f[y][x]] != null) s.add(x + ',' + y);
    return s;
  };
  const A = mask(a, la), B = mask(b, lb);
  let inter = 0;
  for (const k of A) if (B.has(k)) inter++;
  const uni = A.size + B.size - inter;
  return uni === 0 ? 0 : Math.round((1 - inter / uni) * 100);
}

export { Canvas, drawFrame, frameSize, rgba, PALETTE };

// ── sheet: one module's sprites, each rendered at 1×/2×/4× + silhouette ────────
export async function moduleSheet(modPath, out, opts = {}) {
  const mod = await import(pathToFileURL(path.join(DATA, modPath)) + '?t=' + Date.now());
  const legend = mod.LEGEND;
  const entries = Object.entries(mod.SPRITES);
  const bg = opts.bg || '#181226';
  const zooms = opts.zooms || [1, 2, 4];
  const pad = 8;

  // layout: one row per sprite; within a row, every frame at each zoom, then the silhouette
  let rowH = 0, rowW = 0;
  for (const [, sp] of entries) {
    const { w, h } = frameSize(sp);
    rowH = Math.max(rowH, h * Math.max(...zooms) + pad * 2 + 12);
    let ww = pad;
    for (const z of zooms) ww += sp.frames.length * (w * z + 4) + 12;
    ww += w * Math.max(...zooms) + 12;
    rowW = Math.max(rowW, ww);
  }
  const cv = new Canvas(rowW + pad, rowH * entries.length + pad, bg);
  let oy = pad;
  for (const [key, sp] of entries) {
    const { w, h } = frameSize(sp);
    const maxZ = Math.max(...zooms);
    let ox = pad;
    for (const z of zooms) {
      for (const f of sp.frames) {
        drawFrame(cv, f, legend, ox, oy + (h * maxZ - h * z), z);
        ox += w * z + 4;
      }
      ox += 12;
    }
    drawFrame(cv, sp.frames[0], legend, ox, oy, maxZ, 'silhouette');
    oy += rowH;
  }
  cv.save(out);
  console.log(out, `${cv.w}×${cv.h}`, entries.map(([k, s]) => `${k}(${s.frames.length}f)`).join(' '));
  return mod;
}

/** Composite tower sheet: base + turret overlaid, side by side, at several zooms. */
export async function towerSheet(mods, out, opts = {}) {
  const loaded = [];
  for (const p of mods) loaded.push(await import(pathToFileURL(path.join(DATA, p)) + '?t=' + Date.now()));
  const zooms = opts.zooms || [1, 2, 4];
  const cells = [];
  for (const mod of loaded) {
    const keys = Object.keys(mod.SPRITES);
    const baseKey = keys.find(k => k.endsWith('_base'));
    for (const tk of keys.filter(k => !k.endsWith('_base'))) {
      const t = mod.SPRITES[tk];
      for (let f = 0; f < t.frames.length; f++) {
        cells.push({ label: tk, legend: mod.LEGEND, layers: [mod.SPRITES[baseKey].frames[0], t.frames[f]] });
      }
    }
  }
  const { w: cw, h: chh } = frameSize(loaded[0].SPRITES[Object.keys(loaded[0].SPRITES)[0]]);
  const pad = 10;
  const rowsN = zooms.length;
  let totalW = pad;
  for (const z of zooms) totalW += cells.length * (cw * z + 6) + 20;
  const cv = new Canvas(totalW, chh * Math.max(...zooms) + pad * 2, opts.bg || '#181226');
  let ox = pad;
  for (const z of zooms) {
    for (const c of cells) {
      const oy = pad + (chh * Math.max(...zooms) - chh * z);
      for (const layer of c.layers) drawFrame(cv, layer, c.legend, ox, oy, z);
      ox += cw * z + 6;
    }
    ox += 20;
  }
  cv.save(out);
  console.log(out, `${cv.w}×${cv.h}`, cells.map(c => c.label).join(' '));
}

/** Everything at true game scale on a terrain swatch — the only test that matters. */
export async function gameScale(specs, out, opts = {}) {
  const cell = 32, cols = opts.cols || 14, rowsN = opts.rows || 5;
  const cv = new Canvas(cols * cell, rowsN * cell, opts.bg || '#1a2410');
  // terrain bed
  if (opts.terrain) {
    const tm = await import(pathToFileURL(path.join(DATA, opts.terrain.mod)) + '?t=' + Date.now());
    const tile = tm.SPRITES[opts.terrain.key];
    for (let ty = 0; ty < rowsN; ty++) for (let tx = 0; tx < cols; tx++)
      drawFrame(cv, tile.frames[0], tm.LEGEND, tx * cell, ty * cell, 1);
  }
  for (const s of specs) {
    const mod = await import(pathToFileURL(path.join(DATA, s.mod)) + '?t=' + Date.now());
    for (const k of s.keys) {
      const sp = mod.SPRITES[k];
      if (!sp) { console.warn('missing', k); continue; }
      drawFrame(cv, sp.frames[s.frame || 0], mod.LEGEND, s.x, s.y, 1);
    }
  }
  cv.save(out);
  console.log(out, `${cv.w}×${cv.h}`);
}

/** Tile proof: a 6×4 field of the tile repeated, so seams and noise level are obvious. */
export async function tileField(modPath, key, out, scale = 4, cols = 6, rowsN = 4) {
  const mod = await import(pathToFileURL(path.join(DATA, modPath)) + '?t=' + Date.now());
  const sp = mod.SPRITES[key];
  const { w, h } = frameSize(sp);
  const cv = new Canvas(w * cols * scale, h * rowsN * scale, '#000000');
  for (let ty = 0; ty < rowsN; ty++) for (let tx = 0; tx < cols; tx++)
    drawFrame(cv, sp.frames[0], mod.LEGEND, tx * w * scale, ty * h * scale, scale);
  cv.save(out);
  console.log(out, `${cv.w}×${cv.h}`);
}
