// assets/data/towerkit.js — 64×128 tower kit (2× density). Primitives + auto ink-outline,
// the Crypt/Demon static weapons (orbiting charges · brazier · beam · pyre · magma mortar),
// and the D-23 ORC/GOBLIN rotating TURRET system (8-way directional, 3/4 view).
// Faction-distinct BASES live in towerbases.js.

export const W = 64, H = 128, CX = 32;
export function G() { return Array.from({ length: H }, () => Array(W).fill('`')); }
export function set(g, x, y, ch) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; }
export function sset(g, x, y, ch) { set(g, x, y, ch); set(g, W - 1 - x, y, ch); }
export function rect(g, x, y, w, h, ch) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, ch); }
export function band(g, y, half, ch) { for (let x = CX - half; x <= CX - 1 + half; x++) set(g, x, y, ch); }
export function vline(g, x, y, h, ch) { for (let j = 0; j < h; j++) set(g, x, y + j, ch); }
export function hline(g, x, y, w, ch) { for (let i = 0; i < w; i++) set(g, x + i, y, ch); }
export function disc(g, cx, cy, r, ch) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + (r > 1 ? 1 : 0)) set(g, cx + x, cy + y, ch); }
export function tri(g, cx, topY, h, ch) { for (let j = 0; j < h; j++) for (let x = -j; x <= j; x++) set(g, cx + x, topY + (h - 1 - j), ch); } // upward spike
// hollow rhombus (diamond) outline of radius r centred at (cx,cy); optional lit centre dot
export function diamond(g, cx, cy, r, ch, centerCh) {
  for (let k = 0; k <= r; k++) { const dy = r - k; set(g, cx - k, cy - dy, ch); set(g, cx + k, cy - dy, ch); set(g, cx - k, cy + dy, ch); set(g, cx + k, cy + dy, ch); }
  if (centerCh) { set(g, cx, cy, centerCh); set(g, cx - 1, cy, centerCh); }
}

export function outline(g, oc = 'o') {
  const add = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== '`') continue;
    let touch = false;
    for (let dy = -1; dy <= 1 && !touch; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy; if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const c = g[ny][nx]; if (c !== '`' && c !== oc) { touch = true; break; }
    }
    if (touch) add.push([x, y]);
  }
  for (const [x, y] of add) g[y][x] = oc;
}
export function gridToRows(g) { return g.map(r => r.join('')); }

// ===================================================== CRYPT / DEMON STATIC WEAPONS
const STEEL = { lo: 'i', mi: 's', hi: 'I', br: 'S', gl: 'g' };
const FIRE = { dk: 'f', mid: 'F', hot: 'r', br: 'R', white: '#' };
const CHARGE = { frost: { o: 'c', mi: 'C', hi: 'w' }, fear: { o: 'v', mi: 'V', hi: 'X' }, volt: { o: '1', mi: '3', hi: '4' } };

// orbiting charges above a crypt peak (peak drawn by baseCrypt; here just the charges + crown)
export function wpCharges(g, cx, cy, tier, fr, opt = {}) {
  const el = CHARGE[opt.el || 'frost'], count = opt.count || 1, R = opt.R || 12;
  for (let i = 0; i < count; i++) {
    const a = (fr / 4) * Math.PI * 2 + (i / count) * Math.PI * 2;
    let px = cx + R * Math.cos(a), py = cy + R * 0.45 * Math.sin(a);
    if (fr === 2 && i === 0) { px = cx; py = cy + 9; }
    disc(g, px, py, 2, el.mi); set(g, Math.round(px), Math.round(py), el.hi); set(g, Math.round(px) - 1, Math.round(py), el.o);
  }
  if (opt.fork && fr >= 1) { let x = cx; for (let y = cy - 4; y < cy + 16; y += 2) { x += (y % 4 ? 2 : -2); set(g, x, y, '4'); set(g, x, y + 1, '3'); } }
}

function flame(g, cx, baseY, half, height, fr, c) {
  for (let j = 0; j < height; j++) {
    const t = j / height, wob = Math.sin((fr + j) * 1.3) * 1.5;
    const hw = Math.max(0, Math.round(half * (1 - t) + wob * t));
    const col = t < .3 ? c.dk : t < .55 ? c.mid : t < .8 ? c.hot : c.br;
    for (let x = -hw; x <= hw; x++) set(g, cx + x + (t > .6 ? Math.round(wob) : 0), baseY - j, col);
  }
  set(g, cx, baseY - height, '#'); set(g, cx, baseY - height + 1, c.white);
}
export function wpBrazier(g, cx, baseY, tier, fr, opt = {}) {
  const half = opt.half || 6;
  for (let y = baseY - 4; y <= baseY; y++) { band2(g, cx, y, half - (baseY - y), 'd'); band2(g, cx, y, half - (baseY - y) - 1, 'D'); }
  flame(g, cx, baseY - 3, half - 2, 10 + (fr % 2 ? 3 : 0) + (tier > 1 ? 3 : 0), fr, FIRE);
  flame(g, cx, baseY - 3, 2, 13 + (fr % 2 ? 2 : 0), fr + 1, FIRE);
}
export function wpBeam(g, cx, baseY, tier, fr, opt = {}) {
  const skull = opt.skull, halo = opt.halo, horns = opt.horns;
  for (let y = baseY - 9; y <= baseY; y++) band2(g, cx, y, 5 - Math.max(0, baseY - 6 - y), 'd');
  if (skull) { disc(g, cx, baseY - 8, 6, 'd'); set(g, cx - 3, baseY - 9, 'O'); set(g, cx + 2, baseY - 9, 'O'); }
  disc(g, cx, baseY - 9, 2, fr === 0 ? 'f' : '#'); set(g, cx - 1, baseY - 9, fr === 0 ? 'F' : 'R');
  if (horns) for (const s of [-1, 1]) for (let j = 0; j < 8; j++) set(g, cx + s * (5 + Math.round(j / 3)), baseY - 6 - j, j > 5 ? 'd' : 'D');
  if (halo) for (let a = 0; a < 360; a += 30) set(g, cx + Math.round(8 * Math.cos(a * Math.PI / 180)), baseY - 9 + Math.round(6 * Math.sin(a * Math.PI / 180)), 'r');
  if (fr >= 1) { for (let y = 5; y < baseY - 10; y++) { band2(g, cx, y, 2, 'r'); band2(g, cx, y, 1, fr >= 2 ? '#' : 'R'); } band2(g, cx, baseY - 11, 3, '#'); }
}
export function wpPyre(g, cx, baseY, tier, fr, opt = {}) {
  const half = opt.half || 9, topY = opt.tall ? baseY - 12 : baseY - 5;
  for (let y = topY; y <= baseY; y++) { const t = (y - topY) / (baseY - topY), hw = Math.round(half * (0.5 + 0.5 * t)); for (let x = cx - hw; x <= cx + hw; x++) set(g, x, y, x < cx - hw + 2 ? 'D' : x > cx + hw - 2 ? 'O' : 'd'); }
  band2(g, cx, topY, half - 1, 'O'); band2(g, cx, topY + 1, half - 2, 'f'); band2(g, cx, topY + 2, half - 3, 'r');
  for (let k = -(half - 1); k <= half - 1; k += 2) { const h = 5 + (Math.abs(k) % 3) + (fr % 2 ? 2 : 0); flame(g, cx + k, topY, 1, h, fr + k, FIRE); }
  flame(g, cx, topY, 2, 9 + (fr % 2 ? 3 : 0), fr, FIRE);
}
export function wpMortar(g, cx, baseY, tier, fr, opt = {}) {       // demon magma mortar (vertical)
  const bore = opt.bore || 8, len = opt.len || 15, topY = baseY - len;
  for (let y = topY; y <= baseY; y++) { const w = bore + (y > baseY - 3 ? 1 : 0); for (let x = cx - w; x <= cx + w; x++) set(g, x, y, x < cx - w + 2 ? STEEL.hi : x > cx + w - 2 ? STEEL.lo : STEEL.mi); }
  band2(g, cx, topY, bore + 1, 'O'); band2(g, cx, topY + 1, bore, STEEL.gl);
  if (fr === 0 || fr === 1) { disc(g, cx, topY, bore - 3, 'd'); disc(g, cx, topY - 1, bore - 4, 'O'); }
  if (fr === 2) { band2(g, cx, topY - 2, bore - 1, '#'); band2(g, cx, topY - 3, bore - 3, 'r'); disc(g, cx, topY - 7, bore - 4, 'O'); }
  if (fr === 3) band2(g, cx, topY - 1, bore - 2, 'f');
}
function band2(g, cx, y, half, ch) { for (let x = cx - half; x <= cx + half; x++) set(g, x, y, ch); }
export { band2 };

// ===================================================== D-23 ORC/GOBLIN TURRETS =====
// 8-way directional, 3/4 view. dir = unit-ish [ax,ay] with the vertical compressed so up/down
// read as foreshortened. Engine authors 5 facings (e,ne,se,n,s) + mirrors; we can draw all 8.
export const DIRS = {
  e: [1, 0], se: [0.82, 0.62], s: [0, 0.96], sw: [-0.82, 0.62],
  w: [-1, 0], nw: [-0.82, -0.62], n: [0, -0.96], ne: [0.82, -0.62],
};
export const FACE_ORDER = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne']; // clockwise for the rotating demo

function aimBarrel(g, px, py, d, t0, t1, wid, cmid, chi, clo) {
  const [ax, ay] = d, nx = -ay, ny = ax;
  for (let t = t0; t <= t1; t += 0.5) {
    const bx = px + ax * t, by = py + ay * t;
    for (let w = -wid; w <= wid; w++) set(g, bx + nx * w, by + ny * w, wid > 0 ? (w <= -wid + 1 ? chi : w >= wid - 1 ? clo : cmid) : cmid);
  }
}
function swivel(g, px, py, brass) {                                 // geared rotation mount
  for (let y = -2; y <= 3; y++) for (let x = -6; x <= 6; x++) if ((x * x) / 2.2 + y * y <= 11) set(g, px + x, py + y, y < 1 ? STEEL.hi : STEEL.lo);
  if (brass) for (let x = -6; x <= 6; x++) { if (x % 2 === 0) set(g, px + x, py + 3, 'b'); }
  set(g, px, py, STEEL.gl);
}
const fore = (d) => d[1] < -0.5 ? 0.72 : 1;                         // foreshorten when aiming away

export function turretBolt(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d, nx = -ay, ny = ax;
  const limb = opt.limb || 9, len = (opt.len || 20) * fore(d), barbs = opt.barbs || 0, gold = opt.gold, twin = opt.twin;
  swivel(g, px, py, false);
  const fwd = 4;
  for (let i = 3; i <= limb; i++) {                                 // bow limbs (perpendicular, forward)
    set(g, px + ax * fwd + nx * i, py + ay * fwd + ny * i, i > limb - 2 ? 'I' : 'e');
    set(g, px + ax * fwd - nx * i, py + ay * fwd - ny * i, i > limb - 2 ? 'I' : 'e');
  }
  if (gold) { set(g, px + ax * fwd + nx * limb, py + ay * fwd + ny * limb, 'G'); set(g, px + ax * fwd - nx * limb, py + ay * fwd - ny * limb, 'G'); }
  const back = fr === 2 ? -3 : fr === 1 ? 2 : fr === 3 ? -1 : 0;
  for (const off of (twin ? [-2, 2] : [0])) {
    const ox = nx * off, oy = ny * off;
    set(g, px + ox + ax * fwd + nx * limb, py + oy + ay * fwd + ny * limb, 'i');  // string anchor
    aimBarrel(g, px + ox, py + oy, d, fwd + back, len + back, 0, 'S', 'g', 'i');
    const hx = px + ox + ax * (len + back), hy = py + oy + ay * (len + back);
    set(g, hx, hy, 'g'); set(g, hx + ax, hy + ay, 'S');
    for (let b = 1; b <= barbs; b++) { set(g, hx - ax * b * 1.6 + nx * 1.6, hy - ay * b * 1.6 + ny * 1.6, 'S'); set(g, hx - ax * b * 1.6 - nx * 1.6, hy - ay * b * 1.6 - ny * 1.6, 'S'); }
  }
  if (fr === 2) { const tx = px + ax * (len + 1), ty = py + ay * (len + 1); set(g, tx, ty, '#'); set(g, tx + ax, ty + ay, 'r'); }
}

export function turretCannon(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d; const bore = opt.bore || 4, len = (opt.len || 13) * fore(d), gold = opt.gold, brass = opt.brass;
  const cmid = brass ? 'N' : 's', chi = brass ? 'B' : 'I', clo = brass ? 'n' : 'i';
  swivel(g, px, py, brass);
  const back = fr === 2 ? -2 : fr === 1 ? 1 : 0;
  aimBarrel(g, px, py, d, 2 + back, len + back, bore, cmid, chi, clo);
  const mx = px + ax * (len + back), my = py + ay * (len + back);
  for (let w = -bore; w <= bore; w++) set(g, mx - ay * w, my + ax * w, 'O');                 // muzzle face
  if (gold) { const gx = px + ax * (len * 0.5), gy = py + ay * (len * 0.5); for (let w = -bore; w <= bore; w++) set(g, gx - ay * w, gy + ax * w, 'G'); }
  if (fr < 2 && opt.shell) disc(g, mx + ax * 2, my + ay * 2, bore - 2, 'd');
  if (fr === 2) { disc(g, mx + ax * 3, my + ay * 3, bore - 1, '#'); disc(g, mx + ax * 5, my + ay * 5, Math.max(1, bore - 3), 'r'); }
}

export function turretMulti(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d, nx = -ay, ny = ax; const n = opt.n || 5, len = (opt.len || 12) * fore(d), brass = opt.brass;
  const cmid = brass ? 'N' : 's', chi = brass ? 'B' : 'I', clo = brass ? 'n' : 'i';
  swivel(g, px, py, brass);
  for (let k = 0; k < n; k++) {
    const off = (k - (n - 1) / 2) * 2;
    aimBarrel(g, px + nx * off, py + ny * off, d, 2, len, 0, chi, chi, clo);
    if ((fr === 2 && k % 2 === 0) || (fr === 1 && k % 2 === 1)) set(g, px + nx * off + ax * (len + 1), py + ny * off + ay * (len + 1), '#');
  }
}

export function turretGatling(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d, nx = -ay, ny = ax; const len = (opt.len || 13) * fore(d);
  swivel(g, px, py, true);
  for (const off of [-2, 0, 2]) { aimBarrel(g, px + nx * off, py + ny * off, d, 2, len, 0, 'B', 'b', 'n'); }
  if (fr === 1 || fr === 2) { const o = fr === 1 ? -2 : 2; set(g, px + nx * o + ax * (len + 1), py + ny * o + ay * (len + 1), '#'); }
  if (opt.hopper) { const hx = px - ax * 3 + nx * 6, hy = py - ay * 3 + ny * 6; rect(g, hx - 1, hy - 1, 3, 5, 'n'); }
}

export function turretAuger(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d, nx = -ay, ny = ax; const len = (opt.len || 15) * fore(d), twin = opt.twin;
  swivel(g, px, py, true);
  for (const o of (twin ? [-3, 3] : [0])) {
    aimBarrel(g, px + nx * o, py + ny * o, d, 2, len, 1, 'B', 'b', 'n');
    for (let t = 3; t <= len; t += 2) { const ph = ((t + fr * 2) % 4 < 2) ? 1 : -1; set(g, px + nx * o + ax * t + nx * ph, py + ny * o + ay * t + ny * ph, 'g'); }
    set(g, px + nx * o + ax * (len + 1), py + ny * o + ay * (len + 1), 'S');
  }
}

// GOBLIN T1/T2 — reciprocating PISTON BOLT-ARM (brass engineering; NOT a bow, NOT a cannon).
// A geared brass housing with a piston rod that punches a bolt forward on the strike frame.
export function turretBoltArm(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d, nx = -ay, ny = ax; const len = (opt.len || 11) * fore(d), big = opt.big;
  swivel(g, px, py, true);
  // brass piston housing block at the seat
  for (let t = 0; t <= 4; t++) for (let w = -3; w <= 3; w++) set(g, px + ax * t + nx * w, py + ay * t + ny * w, w <= -2 ? 'B' : w >= 2 ? 'n' : 'N');
  // spinning gear on the side (phase by frame)
  const gx = px - ax * 1 + nx * 5, gy = py - ay * 1 + ny * 5; disc(g, gx, gy, 2, 'b');
  for (let a = 0; a < 360; a += 60) set(g, gx + Math.round(2 * Math.cos((a + fr * 30) * Math.PI / 180)), gy + Math.round(2 * Math.sin((a + fr * 30) * Math.PI / 180)), 'N');
  // piston rod reciprocates: retracted on windup, thrust on strike (fr2)
  const ext = [4, 2, len, len - 3][fr];
  aimBarrel(g, px, py, d, 4, ext, 0, 'I', 's', 'i');                     // steel rod
  set(g, px + ax * ext + nx, py + ay * ext + ny, 'b'); set(g, px + ax * ext - nx, py + ay * ext - ny, 'b'); // rod collar
  // the bolt sits at the rod tip; launches on strike
  const bx = px + ax * (ext + 1), by = py + ay * (ext + 1);
  set(g, bx, by, 'S'); set(g, bx + ax, by + ay, 'g');
  if (fr === 2) { set(g, px + ax * (len + 3), py + ay * (len + 3), '#'); set(g, px + ax * (len + 4), py + ay * (len + 4), 'b'); } // muzzle puff
  if (big) { rect(g, px - ax * 2 + nx * 5 - 1, py - ay * 2 + ny * 5 - 1, 3, 4, 'n'); }   // gauge box (tinker)
}

// GOBLIN T4 — SPIKE-THROWER: heavy single barrel fed by a HOPPER of iron spikes + recoil spring.
// Fires angular iron spikes (not a round shell), so it never reads as the Orc cannon.
export function turretSpike(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d, nx = -ay, ny = ax; const len = (opt.len || 14) * fore(d);
  swivel(g, px, py, true);
  // recoil-spring coil wrapped round the breech (coil tightens on fire)
  const coil = fr === 2 ? 1 : 2;
  for (let t = 1; t <= 4; t++) { const cw = (t % 2 ? coil : coil + 1); set(g, px + ax * t + nx * cw, py + ay * t + ny * cw, 'I'); set(g, px + ax * t - nx * cw, py + ay * t - ny * cw, 'I'); }
  const back = fr === 2 ? -2 : 0;                                        // breech recoils on fire
  // heavy brass barrel
  aimBarrel(g, px, py, d, 4 + back, len + back, 1, 'N', 'B', 'n');
  // angular iron SPIKE in / leaving the muzzle (diamond-section, barbed) — the signature read
  const mx = px + ax * (len + back), my = py + ay * (len + back);
  for (let s = 0; s <= 4; s++) { const w = 1 - Math.abs(s - 1); set(g, mx + ax * s + nx, my + ay * s + ny, 'S'); set(g, mx + ax * s, my + ay * s, w >= 0 ? 'I' : 's'); set(g, mx + ax * s - nx, my + ay * s - ny, 'S'); }
  set(g, mx + ax * 4, my + ay * 4, 'g');                                 // spike tip
  if (fr === 2) { const fx = mx + ax * 6, fy = my + ay * 6; set(g, fx, fy, 'I'); set(g, fx + nx, fy + ny, 'S'); set(g, fx - nx, fy - ny, 'S'); set(g, px + ax * (len + back + 1), py + ay * (len + back + 1), '#'); } // launched spike + spark
  // hopper of spikes feeding from the rear-top
  const hx = px - ax * 4 + nx * 5, hy = py - ay * 4 + ny * 5; rect(g, hx - 1, hy - 2, 4, 6, 'n');
  for (let r = 0; r < 3; r++) { set(g, hx, hy - 1 + r * 2, 'I'); set(g, hx + 1, hy - 1 + r * 2, 'S'); }   // stacked spikes
}

export function turretCatapult(g, px, py, d, fr, opt = {}) {
  const [ax, ay] = d; swivel(g, px, py, false);
  vline(g, px, py - 8, 8, 'e'); set(g, px - 1, py - 8, 'a');                 // a-frame post
  const lift = [0.15, 0.7, 1.4, 0.5][fr];
  const tx = px + ax * 10, ty = py + ay * 10 - 12 * lift;
  for (let t = 0; t <= 1; t += 0.06) set(g, px - ax * 5 * (1 - t) + (tx - px) * t, py - 8 * (1 - t) + (ty - py + 8) * t, 'e');
  if (fr < 2) disc(g, tx, ty - 2, 3, 'd'); else disc(g, tx + ax * (fr - 1) * 6, ty - (fr - 1) * 7, 3, 'd');
}

export function turretHatch(g, px, py, d, fr, opt = {}) {           // goblin drone launcher
  const [ax, ay] = d, nx = -ay, ny = ax; swivel(g, px, py, true);
  for (let w = -5; w <= 5; w++) { set(g, px + ax * 4 + nx * w, py + ay * 4 + ny * w, 'O'); set(g, px + ax * 3 + nx * w, py + ay * 3 + ny * w, 'n'); }
  const dz = [2, 5, 9, 6][fr], dx = px + ax * (5 + dz), dy = py + ay * (5 + dz) - dz * 0.3;
  rect(g, dx - 2, dy - 1, 4, 2, 'N'); set(g, dx - 2, dy - 1, 'B');
  const span = (fr % 2) ? 4 : 2; for (let x = -span; x <= span; x++) set(g, dx + x, dy - 2, Math.abs(x) > span - 1 ? 's' : 'S');
  if (opt.foundry) { const dx2 = px - ax * 6 - nx * 6, dy2 = py - 10; rect(g, dx2 - 1, dy2, 3, 2, 'N'); for (let x = -2; x <= 2; x++) set(g, dx2 + x, dy2 - 1, Math.abs(x) > 1 ? 's' : 'S'); }
}

export function turretBomber(g, px, py, d, fr, opt = {}) {          // goblin airship-bomber mast
  const [ax, ay] = d; swivel(g, px, py, true);
  const big = opt.big, hw = big ? 9 : 7, cx = px + ax * 3, cy = py - 13;
  for (let y = cy - 4; y <= cy + 3; y++) { const t = Math.abs(y - cy) / 4, w = Math.round(hw * (1 - t * t)); for (let x = cx - w; x <= cx + w; x++) set(g, x, y, x < cx - w + 2 ? 'B' : x > cx + w - 2 ? 'n' : 'N'); }
  band2(g, cx, cy - 1, hw - 2, 'b'); band2(g, cx, cy + 2, hw - 4, 'O');
  vline(g, px, py - 9, 9, 'n'); set(g, px - 1, py - 9, 'N');
  for (const o of (big ? [-5, 0, 5] : [0])) { const dz = (fr * 5 + Math.abs(o)) % 16; disc(g, cx + o, cy + 6 + dz, 1, 'O'); }
}

// ===================================================== GOBLIN AIR-ACTORS (drones / bombers) =====
// Separate animated actors: the drone bay/foundry & bomber towers are just LAUNCH PLATFORMS;
// the flying unit is its own sprite. Distinct designs per tier; attack-drone ≠ bomber-drone.
function rotor(g, cx, cy, fr) { const span = (fr % 2) ? 5 : 3; for (let x = -span; x <= span; x++) set(g, cx + x, cy, Math.abs(x) > span - 1 ? 'i' : 'S'); set(g, cx, cy - 1, 'i'); set(g, cx, cy, 'g'); }

export function droneActor(g, fr, opt = {}) {                       // ATTACK drone — gun quadcopter, grows per tier
  const tier = opt.tier || 3, attack = opt.mode !== 'fly';
  const cx = CX, cy = 58 + ((fr % 2) ? -1 : 1);
  const cls = tier <= 3 ? 0 : tier <= 4 ? 1 : tier <= 5 ? 2 : 3;
  const bw = 5 + cls * 2;
  for (let y = cy - 2; y <= cy + 2; y++) { const t = Math.abs(y - cy) / 3, wd = Math.round(bw * (1 - t * 0.5)); for (let x = cx - wd; x <= cx + wd; x++) set(g, x, y, x < cx - wd + 2 ? 'B' : x > cx + wd - 2 ? 'n' : 'N'); }
  set(g, cx, cy - 1, 'C'); set(g, cx + 1, cy - 1, 'w');             // cockpit glass
  if (cls === 0) { vline(g, cx, cy - 4, 2, 'i'); rotor(g, cx, cy - 5, fr); }
  else if (cls === 1) { for (const s of [-1, 1]) { hline(g, cx + (s < 0 ? -bw : 0), cy - 3, bw, 'i'); rotor(g, cx + s * bw, cy - 4, fr); } vline(g, cx, cy - 6, 3, 'i'); set(g, cx, cy - 7, 'r'); }
  else { for (const [dx, dy] of [[-bw, -2], [bw, -2], [-bw, 2], [bw, 2]]) { set(g, cx + Math.round(dx / 2), cy + dy - 2, 'i'); rotor(g, cx + dx, cy + dy - 3, fr); } if (cls === 3) { disc(g, cx, cy - 4, 2, 'C'); set(g, cx, cy - 4, 'w'); } }
  const guns = cls === 0 ? 1 : cls === 1 ? 2 : cls === 2 ? 2 : 3;
  for (let k = 0; k < guns; k++) { const gx = cx + (guns === 1 ? 0 : Math.round((k - (guns - 1) / 2) * 4)); vline(g, gx, cy + 2, 3, 'S'); set(g, gx, cy + 4, 'i'); if (attack && (fr === 1 || fr === 2)) { set(g, gx, cy + 5, '#'); set(g, gx, cy + 6, 'r'); } }
  if (cls === 3) for (const s of [-1, 1]) { rect(g, cx + s * (bw + 1) - 1, cy, 2, 3, 'i'); if (attack && fr === 2) set(g, cx + s * (bw + 1), cy + 3, 'r'); }
}

export function bomberActor(g, fr, opt = {}) {                      // BOMBER drone — airship hull, bomb-drop (distinct silhouette)
  const big = opt.big, attack = opt.mode !== 'fly';
  const cx = CX, cy = 52 + ((fr % 2) ? -1 : 0), hw = big ? 13 : 9;
  for (let y = cy - 5; y <= cy + 4; y++) { const t = Math.abs(y - cy) / 5, wd = Math.round(hw * (1 - t * t)); for (let x = cx - wd; x <= cx + wd; x++) set(g, x, y, x < cx - wd + 2 ? 'B' : x > cx + wd - 2 ? 'n' : 'N'); }
  band2(g, cx, cy - 2, hw - 2, 'b'); band2(g, cx, cy + 2, hw - 5, 'O');                                  // hull stripe + belly bay
  for (const s of [-1, 1]) for (let j = 0; j < 3; j++) set(g, cx + s * (hw - 1 + j), cy + j, 'n');        // tail fins
  rect(g, cx - 3, cy + 5, 7, 3, 'i'); set(g, cx - 3, cy + 5, 'I');                                        // gondola
  for (const ex of (big ? [-7, 0, 7] : [-5, 5])) { disc(g, cx + ex, cy + 6, 1, 'b'); const span = (fr % 2) ? 3 : 2; for (let x = -span; x <= span; x++) set(g, cx + ex + x, cy + 7, Math.abs(x) > span - 1 ? 'i' : 'S'); }   // engine pods
  for (const dx of (big ? [-7, 0, 7] : [0])) { if (attack) { const dz = (fr * 5 + Math.abs(dx)) % 18; disc(g, cx + dx, cy + 9 + dz, 1, 'O'); set(g, cx + dx, cy + 8 + dz, 'i'); if (fr === 2 && dz < 6) set(g, cx + dx, cy + 9, '#'); } else set(g, cx + dx, cy + 8, 'O'); }
}
