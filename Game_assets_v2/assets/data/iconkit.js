// assets/data/iconkit.js — shared procedural glyph engine for §10 UI icons.
// 48×48 source (D-21 / spec §2.2), single frame, anchor center. Crisp deep-ink silhouette (D-08):
// every glyph is built from filled primitives then auto-outlined. Icons compose a few primitives
// and pass their own palette chars, so the recolour stays in each icon module's legend.

export const SZ = 48, C = 24;
export const NG = () => Array.from({ length: SZ }, () => Array(SZ).fill('`'));
export const put = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < SZ && y >= 0 && y < SZ) g[y][x] = c; };
export const D = Math.PI / 180;

export function disc(g, cx, cy, r, c) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) put(g, cx + x, cy + y, c); }
export function ring(g, cx, cy, r, c, th = 1) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (d <= r * r + r * 0.6 && d >= (r - th) * (r - th)) put(g, cx + x, cy + y, c); } }
export function seg(g, x0, y0, x1, y1, c, th = 1) { const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) || 1; for (let i = 0; i <= n; i++) { const x = x0 + dx * i / n, y = y0 + dy * i / n; if (th <= 1) put(g, x, y, c); else disc(g, x, y, th / 2, c); } }
export function rectf(g, x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, c); }
// filled convex polygon from vertex list (scanline)
export function poly(g, pts, c) {
  let miny = 1e9, maxy = -1e9; for (const p of pts) { miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); }
  for (let y = Math.floor(miny); y <= Math.ceil(maxy); y++) { const xs = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])); } xs.sort((m, n) => m - n); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++) put(g, x, y, c); }
}
// m-point star (filled)
export function starShape(g, cx, cy, rOut, rIn, m, c, rot = -90) { const pts = []; for (let i = 0; i < m * 2; i++) { const r = i % 2 ? rIn : rOut, a = (rot + i * 180 / m) * D; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } poly(g, pts, c); }
// regular polygon
export function ngon(g, cx, cy, r, n, c, rot = -90) { const pts = []; for (let i = 0; i < n; i++) { const a = (rot + i * 360 / n) * D; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } poly(g, pts, c); }
// lightning bolt down the center
export function bolt(g, cx, top, bot, c, hot) { const mid = (top + bot) / 2; const pts = [[cx + 2, top], [cx - 5, mid + 2], [cx - 1, mid + 2], [cx - 4, bot], [cx + 6, mid - 3], [cx + 1, mid - 3], [cx + 5, top]]; poly(g, pts, c); if (hot) { const p2 = [[cx + 1, top + 3], [cx - 2, mid + 1], [cx, mid + 1], [cx - 1, bot - 3], [cx + 3, mid - 2], [cx, mid - 2]]; poly(g, p2, hot); } }
// flame teardrop (cy=base)
export function flame(g, cx, base, h, w, edge, mid, core) { for (let j = 0; j < h; j++) { const t = j / h, ww = Math.round(w * Math.sin((1 - t) * Math.PI * 0.85) * (0.6 + t * 0.4)); const sway = Math.round(Math.sin(t * 3) * 1.5); for (let x = -ww; x <= ww; x++) { const c = Math.abs(x) > ww - 1 ? edge : (Math.abs(x) > ww - 3 ? mid : core); put(g, cx + x + sway, base - j, c); } } }
// six-arm snowflake
export function snowflake(g, cx, cy, r, c, hi) { for (let i = 0; i < 6; i++) { const a = i * 60 * D, ex = cx + r * Math.cos(a), ey = cy + r * Math.sin(a); seg(g, cx, cy, ex, ey, c, 2); const bx = cx + r * 0.55 * Math.cos(a), by = cy + r * 0.55 * Math.sin(a); seg(g, bx, by, bx + r * 0.3 * Math.cos((a + 50) * D), by + r * 0.3 * Math.sin((a + 50) * D), c); seg(g, bx, by, bx + r * 0.3 * Math.cos((a - 50) * D), by + r * 0.3 * Math.sin((a - 50) * D), c); } disc(g, cx, cy, 2, hi || c); }
// skull (cy=center)
export function skull(g, cx, cy, r, bone, dark) { disc(g, cx, cy - 1, r, bone); rectf(g, cx - r + 1, cy, 2 * r - 1, r, bone); // cranium + jaw block
  disc(g, cx - Math.round(r * 0.45), cy, Math.round(r * 0.32), dark); disc(g, cx + Math.round(r * 0.45), cy, Math.round(r * 0.32), dark); // eye sockets
  poly(g, [[cx, cy + 1], [cx - 2, cy + r - 2], [cx + 2, cy + r - 2]], dark);  // nose
  for (let i = -1; i <= 1; i++) put(g, cx + i * 2, cy + r, dark);              // teeth gaps
}
// coin (gold disc with rim + emboss face)
export function coin(g, cx, cy, r, rim, face, hi, faceCh) { disc(g, cx, cy, r, rim); disc(g, cx, cy, r - 2, face); disc(g, cx - 2, cy - 2, Math.round(r * 0.4), hi); }
// shield outline (cy=top), returns nothing
export function shield(g, cx, top, w, h, c, edge) { for (let j = 0; j < h; j++) { const t = j / h; const ww = t < 0.55 ? w : Math.round(w * (1 - (t - 0.55) / 0.45)); for (let x = -ww; x <= ww; x++) put(g, cx + x, top + j, (Math.abs(x) >= ww - 1 ? edge : c)); } }

// sparkle: a 4-point twinkle at (x,y)
export function sparkle(g, x, y, r, c, hi) { for (let i = -r; i <= r; i++) { put(g, x + i, y, c); put(g, x, y + i, c); } put(g, x, y, hi || c); put(g, x + 1, y, c); put(g, x, y + 1, c); }
// inner bevel highlight along the upper-left of any filled region of `fillCh` → paint `hiCh`
export function bevel(g, fillCh, hiCh) { const add = []; for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { if (g[y][x] !== fillCh) continue; const up = (g[y - 1] || [])[x], lf = g[y][x - 1]; if ((up === '`' || up === 'o' || up === undefined) || (lf === '`' || lf === 'o' || lf === undefined)) add.push([x, y]); } for (const [x, y] of add) g[y][x] = hiCh; }

export function ink(g, soft = '', width = 2) {
  for (let pass = 0; pass < width; pass++) {
    const add = [];
    for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) {
      if (g[y][x] !== '`') continue;
      let t = false;
      for (let dy = -1; dy <= 1 && !t; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const cc = (g[y + dy] || [])[x + dx];
        // pass 0: any glyph pixel triggers a border; later passes: only the existing 'o' border grows outward
        const solid = pass === 0 ? (cc && cc !== '`' && cc !== 'o' && cc !== 'O' && soft.indexOf(cc) < 0) : (cc === 'o');
        if (solid) { t = true; break; }
      }
      if (t) add.push([x, y]);
    }
    for (const [x, y] of add) g[y][x] = 'o';
  }
  return g;
}
export const rows = g => g.map(r => r.join(''));
// build a single-frame icon from a painter; soft = chars excluded from the border; border = px width
export function icon(paint, soft = '', border = 2) { const g = NG(); paint(g); ink(g, soft, border); return { anchor: 'center', fps: 1, loop: true, frames: [rows(g)] }; }
