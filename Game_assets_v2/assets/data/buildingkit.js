// assets/data/buildingkit.js — architectural primitives for §7 capturable buildings.
// 72×64 canvas, foot anchor. Stone-coursed walls, crenellated battlements, properly-oriented
// pitched/gable/hip roofs (ridge horizontal at top, slopes down to overhanging eaves), towers
// with conical/crenellated/domed caps, windows, doors, chimneys, banners. Each building composes
// these into a DISTINCT silhouette; the engine scales the source to the building footprint.

export const W = 72, H = 64, FLOOR = 58, CX = 36;
export const NG = () => Array.from({ length: H }, () => Array(W).fill('`'));
export const put = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
export const rectf = (g, x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, c); };
export const line = (g, x0, y0, x1, y1, c) => { const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) || 1; for (let i = 0; i <= n; i++) put(g, x0 + dx * i / n, y0 + dy * i / n, c); };
export const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.5) put(g, cx + x, cy + y, c); };
export const rows = g => g.map(r => r.join(''));

// stone-coursed wall: lit left edge, shadowed right edge, periodic mortar courses + block joints.
export function wall(g, x, y, w, h, ramp, courseH = 4) {
  const [lo, mi, hi] = ramp;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, i < 2 ? hi : i > w - 3 ? lo : mi);
  for (let j = courseH; j < h; j += courseH) for (let i = 0; i < w; i++) put(g, x + i, y + j, lo);                 // mortar courses
  for (let j = 0; j < h; j += courseH) for (let i = (j / courseH % 2) * (courseH) ; i < w; i += courseH * 2) put(g, x + i, y + j + 1, lo);  // staggered joints
}
// crenellated battlement along the top of a wall span (merlons + embrasures)
export function battlement(g, x, y, w, ramp, merlon = 3, gap = 2) {
  const [lo, mi, hi] = ramp;
  for (let i = 0; i < w; i += merlon + gap) { for (let dx = 0; dx < merlon && i + dx < w; dx++) { put(g, x + i + dx, y, dx === 0 ? hi : 'O'); put(g, x + i + dx, y - 1, dx === 0 ? hi : lo); put(g, x + i + dx, y - 2, mi); } }
}
// properly-oriented GABLE roof: apex (ridge) at top-center, slopes down to eaves overhanging by `oh`.
export function gable(g, cx, eaveY, halfW, ramp, oh = 2) {
  const [lo, mi, hi] = ramp, ht = halfW + 2;
  for (let j = 0; j <= ht; j++) { const wHalf = Math.round((halfW) * (j / ht)); for (let x = -wHalf; x <= wHalf; x++) put(g, cx + x, eaveY - ht + j, x < -wHalf + 2 ? hi : x > wHalf - 2 ? lo : (Math.abs(x) < 2 ? mi : ((x + j) & 1 ? mi : lo))); }
  for (let x = -halfW - oh; x <= halfW + oh; x++) put(g, cx + x, eaveY, 'O');           // eave shadow line (overhang)
  for (let j = 0; j <= ht; j++) put(g, cx, eaveY - ht + j, hi);                          // ridge highlight
}
// HIP roof (trapezoid): short ridge on top, four slopes; reads as a 3/4 pitched roof.
export function hip(g, cx, eaveY, halfW, ridgeHalf, h, ramp, oh = 2) {
  const [lo, mi, hi] = ramp;
  for (let j = 0; j <= h; j++) { const t = j / h, wHalf = Math.round(ridgeHalf + (halfW - ridgeHalf) * t); for (let x = -wHalf; x <= wHalf; x++) put(g, cx + x, eaveY - h + j, x < -wHalf + 2 ? hi : x > wHalf - 2 ? lo : mi); }
  for (let x = -ridgeHalf; x <= ridgeHalf; x++) put(g, cx + x, eaveY - h, hi);            // ridge
  for (let x = -halfW - oh; x <= halfW + oh; x++) put(g, cx + x, eaveY, 'O');
}
// conical spire cap (towers)
export function spire(g, cx, baseY, halfW, h, ramp) { const [lo, mi, hi] = ramp; for (let j = 0; j <= h; j++) { const wHalf = Math.round(halfW * (1 - j / h)); for (let x = -wHalf; x <= wHalf; x++) put(g, cx + x, baseY - j, x < 0 ? hi : x > wHalf - 1 ? lo : mi); } }
// dome cap
export function dome(g, cx, baseY, r, ramp) { const [lo, mi, hi] = ramp; for (let y = 0; y <= r; y++) { const wHalf = Math.round(Math.sqrt(Math.max(0, r * r - y * y * 1.4))); for (let x = -wHalf; x <= wHalf; x++) put(g, cx + x, baseY - y, x < -wHalf + 2 ? hi : x > wHalf - 2 ? lo : mi); } }
export function windowLit(g, x, y, w, h, frame, glass) { rectf(g, x - 1, y - 1, w + 2, h + 2, frame); rectf(g, x, y, w, h, glass); for (let j = 0; j < h; j++) put(g, x + (w >> 1), y + j, frame); line(g, x, y + (h >> 1), x + w - 1, y + (h >> 1), frame); }
export function archDoor(g, cx, baseY, w, h, c, glow) { const hw = w >> 1; for (let y = 0; y < h; y++) { const t = (h - y) / h; const ww = y < h - hw ? hw : Math.round(hw * Math.sqrt(Math.max(0, 1 - ((y - (h - hw)) / hw) ** 2))); for (let x = -ww; x <= ww; x++) put(g, cx + x, baseY - y, c); } if (glow) { for (let x = -1; x <= 1; x++) put(g, cx + x, baseY - 1, glow); } }
export function chimney(g, x, baseY, w, h, ramp, smoke) { const [lo, mi, hi] = ramp; rectf(g, x, baseY - h, w, h, mi); for (let j = 0; j < h; j++) put(g, x, baseY - h + j, hi); rectf(g, x - 1, baseY - h - 1, w + 2, 2, lo); if (smoke) for (let s = 0; s < 4; s++) put(g, x + (w >> 1) + (s & 1), baseY - h - 2 - s * 2, smoke); }
export function banner(g, x, topY, pole, cloth1, cloth2) { for (let y = topY; y < topY + 16; y++) put(g, x, y, pole); put(g, x, topY - 1, 'd'); for (let j = 0; j < 9; j++) for (let i = 1; i <= 6 - (j > 6 ? (j - 6) * 2 : 0); i++) put(g, x + i, topY + 1 + j, i === 1 ? cloth1 : ((i + j) & 1 ? cloth2 : cloth1)); }
export function rubble(g, halfW, ramp) { const [lo, mi, hi] = ramp; for (let i = -halfW; i <= halfW; i++) { const h = 1 + ((i * 7 % 4) + 4) % 4; for (let j = 0; j < h; j++) put(g, CX + i, FLOOR - j, (i + j) & 1 ? lo : mi); } for (let i = -halfW; i <= halfW; i += 3) put(g, CX + i, FLOOR - (((i * 5 % 3) + 3) % 3), hi); }
export function foundation(g, cx, halfW, ramp) { const [lo, mi, hi] = ramp; rectf(g, cx - halfW, FLOOR - 4, 2 * halfW + 1, 5, mi); for (let x = -halfW; x <= halfW; x++) put(g, cx + x, FLOOR - 4, hi); for (let x = -halfW; x <= halfW; x += 4) put(g, cx + x, FLOOR - 2, lo); }

// auto-ink (skip soft glow chars)
export function ink(g, soft = '') { const add = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (g[y][x] !== '`') continue; let t = false; for (let dy = -1; dy <= 1 && !t; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const c = (g[y + dy] || [])[x + dx]; if (c && c !== '`' && c !== 'o' && c !== 'O' && soft.indexOf(c) < 0) { t = true; break; } } if (t) add.push([x, y]); } for (const [x, y] of add) g[y][x] = 'o'; return g; }
export const stat = (g, soft) => ({ anchor: 'foot', fps: 1, loop: false, frames: [rows(ink(g, soft))] });
export const five = (fn) => ({ anchor: 'foot', fps: 1, loop: false, frames: [0, 1, 2, 3, 4].map(s => rows(ink(fn(s), fn._soft || ''))) });
