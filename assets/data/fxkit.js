// assets/data/fxkit.js — shared procedural FX engine for the ability / enchant / status effects.
// 2× density (D-21): a 40×40 bounded canvas (anchor center), no off-palette colours. Each helper
// stamps a recognizable behaviour primitive (expanding ring, radial burst, rising motes, light
// pillar, rolling cloud, chevron stack, orbiting charge, aura halo) so effects read at the larger
// size with real motion. Effects compose several primitives per frame and auto-ink their edges.

export const SZ = 40, C = 20;
export const NG = () => Array.from({ length: SZ }, () => Array(SZ).fill('`'));
export const put = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < SZ && y >= 0 && y < SZ) g[y][x] = c; };
export const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r) put(g, cx + x, cy + y, c); };
export const seg = (g, x0, y0, x1, y1, c) => { const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) || 1; for (let i = 0; i <= n; i++) put(g, x0 + dx * i / n, y0 + dy * i / n, c); };
export const D = Math.PI / 180;

// expanding ring (optionally squashed to sx for ground perspective)
export function ring(g, cx, cy, r, c, sx = 1, step = 12) { for (let a = 0; a < 360; a += step) put(g, cx + r * Math.cos(a * D), cy + r * sx * Math.sin(a * D), c); }
export function ring2(g, cx, cy, r, outer, inner, sx = 1) { ring(g, cx, cy, r, outer, sx); if (r - 2 > 0) ring(g, cx, cy, r - 2, inner, sx); }
// radial burst: spokes from center out to r
export function burst(g, cx, cy, r, c, n = 8, rot = 0) { for (let i = 0; i < n; i++) { const a = rot + i * 360 / n; seg(g, cx, cy, cx + r * Math.cos(a * D), cy + r * Math.sin(a * D), c); } }
// rising motes: n dots drifting upward by phase, wobbling
export function motes(g, cx, baseY, n, phase, cols, spread = 12) { for (let i = 0; i < n; i++) { const t = ((phase + i / n) % 1); const y = baseY - t * 26; const x = cx + Math.sin((i * 2.3 + phase * 6.28)) * spread * (0.4 + t); const c = cols[i % cols.length]; put(g, x, y, c); put(g, x, y - 1, cols[(i + 1) % cols.length]); } }
// vertical light pillar with shimmer band at phase
export function pillar(g, cx, w, top, bot, edge, core, shimmerY) { for (let y = top; y <= bot; y++) for (let x = cx - w; x <= cx + w; x++) put(g, x, y, (x <= cx - w + 1 || x >= cx + w - 1) ? edge : core); if (shimmerY != null) for (let x = cx - w; x <= cx + w; x++) put(g, x, shimmerY, 'w' in {} ? 'w' : core); }
// rolling cloud: overlapping discs across a band, darker core
export function cloud(g, cx, cy, rad, phase, edge, mid, core) { const lobes = 6; for (let i = 0; i < lobes; i++) { const a = i / lobes * 6.28 + phase; const lx = cx + Math.cos(a) * rad * 0.7, ly = cy + Math.sin(a) * rad * 0.4; disc(g, lx, ly, Math.round(rad * 0.5), mid); } disc(g, cx, cy, Math.round(rad * 0.7), mid); disc(g, cx, cy, Math.round(rad * 0.45), core); }
// chevron stack rising (rally) — k chevrons, animated upward by phase
export function chevrons(g, cx, n, phase, edge, fill) { for (let i = 0; i < n; i++) { const y = C + 14 - ((i + phase) % n) * 10; for (let j = 0; j <= 5; j++) { put(g, cx - j, y + j, j === 5 ? edge : fill); put(g, cx + j, y + j, j === 5 ? edge : fill); } put(g, cx, y, fill); } }
// aura halo: filled translucent-looking ring around a center (two radii)
export function halo(g, cx, cy, r, cols, sx = 1) { for (let rr = r; rr >= r - 2 && rr > 0; rr--) ring(g, cx, cy, rr, cols[(r - rr) % cols.length], sx, 10); }

// 8-neighbour ink outline, skipping soft glow chars
export function ink(g, soft = '') { const add = []; for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { if (g[y][x] !== '`') continue; let t = false; for (let dy = -1; dy <= 1 && !t; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const cc = (g[y + dy] || [])[x + dx]; if (cc && cc !== '`' && cc !== 'o' && cc !== 'O' && soft.indexOf(cc) < 0) { t = true; break; } } if (t) add.push([x, y]); } for (const [x, y] of add) g[y][x] = 'o'; return g; }
export const rows = g => g.map(r => r.join(''));

// build a clip from a per-frame painter fn(frameIndex)->grid; soft chars stay un-inked
export function clip(anchor, fps, loop, n, paint, soft = '') {
  const frames = []; for (let k = 0; k < n; k++) frames.push(rows(ink(paint(k), soft)));
  return { anchor, fps, loop, frames };
}
