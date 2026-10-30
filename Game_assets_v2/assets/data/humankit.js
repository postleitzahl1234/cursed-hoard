// assets/data/humankit.js — 64×64 parametric humanoid builder (2× density, D-21).
// A jointed rig (hips · spine · shoulders · two arms · two legs · head) is POSED per frame and
// drawn back-to-front, then gear (armour body, helm, weapon, shield, cape) is layered on. The kit
// emits the full clip set: idle (F=2) · walk (F=4) · attack (F=4) · ability (bespoke) · death (F=3).
// 3/4 EAST view (figure faces right). Foot-anchored: feet rest on row ~60.

export const W = 64, H = 64, GROUND = 60;
export function G() { return Array.from({ length: H }, () => Array(W).fill('`')); }
export function set(g, x, y, ch) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; }
export function disc(g, cx, cy, r, ch) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + (r > 1 ? 1 : 0)) set(g, cx + x, cy + y, ch); }
export function rectf(g, x, y, w, h, ch) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(g, x + i, y + j, ch); }
function clampGrid(g) { return g.map(r => r.join('')); }

// thick shaded segment from (x0,y0)→(x1,y1), half-width hw. lit upper-left, shadow lower-right.
export function limb(g, x0, y0, x1, y1, hw, lo, mi, hi) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len, ny = dx / len;                 // unit normal
  for (let t = 0; t <= len; t += 0.5) {
    const cx = x0 + dx * (t / len), cy = y0 + dy * (t / len);
    for (let w = -hw; w <= hw; w++) {
      const ch = w <= -hw + 0.6 ? hi : w >= hw - 0.6 ? lo : mi;
      set(g, cx + nx * w, cy + ny * w, ch);
    }
  }
}
// auto ink outline (8-neighbour), skipping a set of "soft" chars (fx/glow) so auras stay un-outlined
export function outline(g, oc = 'o', soft = '') {
  const add = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== '`') continue;
    let touch = false;
    for (let dy = -1; dy <= 1 && !touch; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const c = g[ny][nx];
      if (c !== '`' && c !== oc && soft.indexOf(c) < 0) { touch = true; break; }
    }
    if (touch) add.push([x, y]);
  }
  for (const [x, y] of add) g[y][x] = oc;
}

// ---- material ramps (chars resolve through troops legend) -------------------------------
const MAT = {
  plate:   { lo: 'i', mi: 'j', hi: 'I' },
  mail:    { lo: 'i', mi: 'i', hi: 'j' },
  leather: { lo: 'q', mi: 'n', hi: 'N' },
  cloth:   { lo: 'c', mi: 'c', hi: 'C' },   // c/C are world-tinted
  bone:    { lo: 'o', mi: 'N', hi: 'q' },
  shadow:  { lo: 'O', mi: 'k', hi: 'K' },
  hide:    { lo: 'O', mi: 'k', hi: 'K' },
};
const SKIN = { lo: 's', mi: 'S', hi: 'p' };
const STEELW = { lo: 'i', mi: 'j', hi: 'I' };
const GOLD = { lo: 'd', mi: 'D', hi: 'y' };
const D = Math.PI / 180;
const pt = (jx, jy, ang, len) => [jx + len * Math.sin(ang * D), jy + len * Math.cos(ang * D)];

// =============================================================== POSE ============
// Base rig anchor points (east 3/4). Returns joints for a given pose state.
// spec.hgt raises the torso/head (taller); spec.shoW widens the shoulders (broader build).
function rig(pose, spec = {}) {
  const b = pose.bob || 0, lean = pose.lean || 0, hgt = spec.hgt || 0;
  const sw = spec.shoW != null ? spec.shoW : 3;
  const hipY = 41 - b, shoY = 27 - b - hgt, neck = 24 - b - hgt;
  const cx = 30 + lean;
  return {
    cx, hipY, shoY, neck,
    hipB: [cx - 2, hipY], hipF: [cx + 2, hipY],          // back / front hip
    shoB: [cx - sw, shoY], shoF: [cx + sw, shoY],        // back / front shoulder (width varies)
    headC: [cx + 1, neck - 5],
  };
}

function drawLeg(g, hip, thighA, kneeA, mat, boot, back) {
  const m = back ? { lo: mat.lo, mi: mat.lo, hi: mat.mi } : mat;
  const [kx, ky] = pt(hip[0], hip[1], thighA, 9);
  const [ax, ay] = pt(kx, ky, kneeA, 8);
  limb(g, hip[0], hip[1], kx, ky, 2.6, m.lo, m.mi, m.hi);     // thigh
  limb(g, kx, ky, ax, ay, 2.2, m.lo, m.mi, m.hi);            // shin
  // boot pointing east
  const bl = back ? boot.lo : boot.hi, bm = back ? boot.lo : boot.mi;
  for (let i = -1; i <= 4; i++) { set(g, ax + i, ay + 1, i >= 3 ? bl : bm); set(g, ax + i, ay + 2, bl); }
  set(g, ax + 4, ay + 1, bl);
}

function drawArm(g, sho, upA, foreA, mat, hand, back, gloss) {
  const m = back ? { lo: mat.lo, mi: mat.lo, hi: mat.mi } : mat;
  const [ex, ey] = pt(sho[0], sho[1], upA, 7);
  const [hx, hy] = pt(ex, ey, foreA, 7);
  limb(g, sho[0], sho[1], ex, ey, 2.2, m.lo, m.mi, m.hi);    // upper arm
  limb(g, ex, ey, hx, hy, 1.9, m.lo, m.mi, m.hi);           // forearm
  if (gloss && !back) set(g, sho[0] - 1, sho[1] - 1, m.hi);  // pauldron glint
  disc(g, hx, hy, 1, hand);                                  // hand/glove
  return [hx, hy];
}

// =============================================================== GEAR ===========
// build → [shoulder half-width, hip half-width, head radius]. Range is deliberately WIDE so units
// differ in mass at a glance (tiny scouts → giant brutes).
const BUILD = { tiny: [3, 3, 2], slim: [4, 3, 3], lean: [4, 4, 3], default: [5, 4, 3], wide: [6, 5, 3], burly: [7, 5, 4], hulk: [8, 6, 4], giant: [10, 7, 4] };
function drawTorso(g, r, spec) {
  const m = MAT[spec.body] || MAT.cloth;
  const [halfTop, halfBot] = BUILD[spec.build] || BUILD.default;
  const top = r.shoY - 1, bot = r.hipY + 1;
  for (let y = top; y <= bot; y++) {
    const t = (y - top) / (bot - top), hw = Math.round(halfTop + (halfBot - halfTop) * t);
    for (let x = r.cx - hw; x <= r.cx + hw; x++) {
      const ld = x - (r.cx - hw), rd = (r.cx + hw) - x;
      set(g, x, y, ld < 1 ? m.hi : rd < 1 ? m.lo : m.mi);
    }
  }
  // tabard / surcoat down the front (world-tinted cloth) for cloth+plate dressed units
  if (spec.tabard) { for (let y = r.shoY + 2; y <= bot + 2; y++) { set(g, r.cx + 1, y, 'C'); set(g, r.cx + 2, y, 'c'); } set(g, r.cx + 1, bot + 2, 'c'); }
  // chest trim band
  if (spec.trim === 'gold') { for (let x = r.cx - halfTop + 1; x <= r.cx + halfTop - 1; x++) set(g, top + 2, x > r.cx ? top + 2 : top + 2, 'D'); for (let x = r.cx - 3; x <= r.cx + 3; x++) set(g, r.shoY + 1, x, 'D'); set(g, r.cx, r.shoY + 2, 'y'); }
  if (spec.trim === 'steel') { for (let x = r.cx - 3; x <= r.cx + 3; x++) set(g, r.shoY + 1, x, 'I'); }
  // belt
  for (let x = r.cx - halfBot; x <= r.cx + halfBot; x++) set(g, bot, x, 'q');
  set(g, r.cx, bot, spec.trim === 'gold' ? 'y' : 'N');
}

function drawHead(g, r, spec) {
  const [hx, hy] = r.headC;
  const hr = (BUILD[spec.build] || BUILD.default)[2];                   // head scales with build (mass read)
  disc(g, hx, hy, hr, SKIN.mi); set(g, hx - hr + 1, hy - 1, SKIN.hi); set(g, hx + hr - 1, hy + 1, SKIN.lo);
  set(g, hx + 1, hy, 'O'); set(g, hx + 2, hy, 'O');                     // eye shadow (facing east)
  const helm = spec.head || 'bare';
  const HM = spec.helmGold ? GOLD : STEELW;
  if (helm === 'bare') { for (let i = -3; i <= 1; i++) set(g, hx + i, hy - 3, spec.hair || 'q'); set(g, hx - 3, hy - 1, spec.hair || 'q'); }
  else if (helm === 'cap') { for (let x = -3; x <= 3; x++) set(g, hx + x, hy - 3, MAT.leather.mi); for (let x = -3; x <= 3; x++) set(g, hx + x, hy - 2, MAT.leather.lo); }
  else if (helm === 'hood') { for (let y = -4; y <= 2; y++) for (let x = -4; x <= 3; x++) if (x * x * 0.6 + (y + 1) * (y + 1) <= 11 && !(y > -1 && x > -1 && x < 3)) set(g, hx + x, hy + y, x < -2 ? 'c' : 'C'); }
  else if (helm === 'helm') { for (let x = -4; x <= 3; x++) { set(g, hx + x, hy - 3, HM.hi); set(g, hx + x, hy - 2, HM.mi); } set(g, hx - 4, hy - 1, HM.mi); set(g, hx + 3, hy, HM.lo); set(g, hx - 1, hy - 1, HM.hi); }
  else if (helm === 'greathelm') { for (let y = -4; y <= 2; y++) for (let x = -4; x <= 3; x++) set(g, hx + x, hy + y, x < -2 ? HM.hi : x > 2 ? HM.lo : HM.mi); set(g, hx + 1, hy - 1, 'O'); set(g, hx + 2, hy - 1, 'O'); rectf(g, hx, hy + 1, 2, 1, 'O'); }
  else if (helm === 'barbute') { for (let y = -4; y <= 3; y++) for (let x = -4; x <= 3; x++) if (x * x * 0.7 + y * y <= 15) set(g, hx + x, hy + y, x < -2 ? HM.hi : x > 2 ? HM.lo : HM.mi); set(g, hx + 1, hy - 1, 'O'); rectf(g, hx + 1, hy, 1, 3, 'O'); }   // rounded, T-slit
  else if (helm === 'sallet') { for (let x = -4; x <= 3; x++) { set(g, hx + x, hy - 3, HM.hi); set(g, hx + x, hy - 2, HM.mi); } for (let x = 2; x <= 6; x++) set(g, hx + x, hy - 1, HM.lo); set(g, hx + 6, hy - 1, HM.mi); set(g, hx - 4, hy - 1, HM.mi); set(g, hx + 1, hy, 'O'); }   // pointed tail back
  else if (helm === 'kettle') { for (let x = -3; x <= 3; x++) { set(g, hx + x, hy - 3, HM.hi); set(g, hx + x, hy - 2, HM.mi); } for (let x = -6; x <= 6; x++) set(g, hx + x, hy - 1, HM.lo); for (let x = -6; x <= 6; x++) set(g, hx + x, hy, x % 2 ? HM.lo : HM.mi); }   // wide brim
  else if (helm === 'winged') { for (let x = -4; x <= 3; x++) { set(g, hx + x, hy - 3, HM.hi); set(g, hx + x, hy - 2, HM.mi); } set(g, hx - 1, hy - 1, HM.hi); for (const s of [-1, 1]) for (let j = 0; j < 4; j++) { set(g, hx + s * (4 + Math.floor(j / 2)), hy - 2 - j, j > 1 ? 'C' : 'w'); set(g, hx + s * (5 + Math.floor(j / 2)), hy - 2 - j, 'w'); } }   // side wings
  else if (helm === 'crown') { for (let i = -3; i <= 1; i++) set(g, hx + i, hy - 3, spec.hair || 'q'); for (let x = -3; x <= 2; x += 1) set(g, hx + x, hy - 4, x % 2 ? 'd' : 'y'); for (const xx of [-3, 0, 2]) set(g, hx + xx, hy - 5, 'y'); }
  else if (helm === 'mitre') { for (let y = -6; y <= -2; y++) { const w = 4 + (y + 6) - 6; for (let x = -3; x <= 2; x++) set(g, hx + x, hy + y, x < -1 ? 'C' : 'c'); } set(g, hx, hy - 6, 'y'); set(g, hx, hy - 4, 'd'); }
  else if (helm === 'horns') { for (let i = -3; i <= 1; i++) set(g, hx + i, hy - 3, 'k'); for (const s of [-1, 1]) for (let j = 0; j < 4; j++) set(g, hx + s * (3 + Math.floor(j / 2)), hy - 3 - j, j > 2 ? 'O' : 'K'); }
  // crest plume (taller/feathered for some)
  if (spec.crest) { const ch = spec.crestTall ? 7 : 4; for (let j = 0; j < ch; j++) set(g, hx - 1, hy - 4 - j, spec.crest); set(g, hx - 1, hy - 4 - ch, spec.crest); if (spec.crestTall) for (let j = 1; j < ch; j++) { set(g, hx - 2, hy - 4 - j, spec.crest); set(g, hx, hy - 4 - j, spec.crest); } }
}

const WEAP = {
  none: { kind: 'swing', draw(g, hand, fr, sw) {} },
  pitchfork: { kind: 'pole', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 20); limb(g, hx, hy, tx, ty, 0.6, 'w', 'w', 'W'); const px = -Math.cos(sw * D), py = Math.sin(sw * D); for (const o of [-2, 0, 2]) set(g, tx + px * o, ty + py * o, 'I'); for (const o of [-2, 0, 2]) { const [ex, ey] = pt(tx + px * o, ty + py * o, sw, 3); set(g, ex, ey, 'j'); } } },
  spear: { kind: 'pole', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 23); limb(g, hx, hy, tx, ty, 0.6, 'w', 'w', 'W'); const [ax, ay] = pt(tx, ty, sw, 3); limb(g, tx, ty, ax, ay, 0.8, 'i', 'j', 'I'); } },
  sword: { kind: 'swing', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 15); limb(g, hx, hy, tx, ty, 1, STEELW.lo, STEELW.mi, STEELW.hi); const px = -Math.cos(sw * D), py = Math.sin(sw * D); for (let i = -2; i <= 2; i++) set(g, hx + px * i, hy + py * i, 'd'); set(g, tx, ty, 'I'); } },
  greatsword: { kind: 'swing', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 23); limb(g, hx, hy, tx, ty, 1.4, STEELW.lo, STEELW.mi, STEELW.hi); const px = -Math.cos(sw * D), py = Math.sin(sw * D); for (let i = -3; i <= 3; i++) set(g, hx + px * i, hy + py * i, 'd'); set(g, tx, ty, 'I'); } },
  hammer: { kind: 'swing', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 17); limb(g, hx, hy, tx, ty, 0.8, 'w', 'w', 'W'); rectf(g, tx - 3, ty - 3, 6, 6, STEELW.mi); for (let y = -3; y < 3; y++) { set(g, tx - 3, ty + y, STEELW.hi); set(g, tx + 2, ty + y, STEELW.lo); } } },
  mace: { kind: 'swing', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 16); limb(g, hx, hy, tx, ty, 0.7, 'w', 'w', 'W'); disc(g, tx, ty, 3, STEELW.mi); for (const a of [0, 60, 120, 180, 240, 300]) set(g, tx + Math.round(4 * Math.cos(a * D)), ty + Math.round(4 * Math.sin(a * D)), STEELW.hi); } },
  staff: { kind: 'pole', draw(g, [hx, hy], fr, sw, glow) { const [tx, ty] = pt(hx, hy, sw, 26); limb(g, hx, hy, tx, ty, 0.7, 'w', 'w', 'W'); disc(g, tx, ty, 2, glow || 'b'); set(g, tx, ty, 'B'); } },
  scythe: { kind: 'pole', draw(g, [hx, hy], fr, sw) { const [tx, ty] = pt(hx, hy, sw, 22); limb(g, hx, hy, tx, ty, 0.7, 'w', 'w', 'W'); for (let i = 0; i < 7; i++) set(g, tx + i - 3, ty - 5 + Math.round(i * i / 9), STEELW.hi); } },
  claws: { kind: 'swing', draw(g, [hx, hy], fr, sw) { for (const o of [-12, 0, 12]) { const [tx, ty] = pt(hx, hy, sw + o, 6); limb(g, hx, hy, tx, ty, 0.5, 'i', 'j', 'I'); } } },
  banner: { kind: 'pole', draw(g, [hx, hy], fr, sw, glow) { const [tx, ty] = pt(hx, hy, sw, 30); limb(g, hx, hy, tx, ty, 0.7, 'w', 'w', 'W'); set(g, tx, ty, 'y'); const wob = (fr % 2) ? 1 : 0; const bx = tx + 1, by = ty + 1; for (let j = 0; j < 9; j++) for (let i = 1; i <= 6 - (j > 6 ? (j - 6) * 2 : 0); i++) set(g, bx + i + (i > 3 ? wob : 0), by + j, i === 1 ? 'C' : 'c'); } },
};

function drawShield(g, r, kind) {
  if (kind === 'none' || !kind) return;
  const sx = r.cx + 6, sy = r.shoY + 6, P = MAT.plate;
  if (kind === 'small') { disc(g, sx, sy, 4, P.mi); for (let a = 0; a < 360; a += 45) set(g, sx + Math.round(4 * Math.cos(a * D)), sy + Math.round(4 * Math.sin(a * D)), P.hi); disc(g, sx, sy, 1, 'd'); }
  else if (kind === 'kite') { for (let y = -5; y <= 6; y++) { const w = y < 2 ? 4 : Math.max(0, 4 - (y - 1)); for (let x = -w; x <= w; x++) set(g, sx + x, sy + y, x < -w + 1 ? P.hi : P.mi); } for (let y = -5; y <= 6; y++) set(g, sx, sy + y, 'C'); set(g, sx, sy - 1, 'd'); }
  else if (kind === 'pavise') { for (let y = -8; y <= 8; y++) for (let x = -5; x <= 5; x++) set(g, sx + x, sy + y, x < -4 ? P.hi : x > 4 ? P.lo : P.mi); for (let y = -8; y <= 8; y++) set(g, sx, sy + y, 'C'); for (let x = -5; x <= 5; x++) set(g, sx + x, sy, 'C'); disc(g, sx, sy, 2, 'd'); }
  // ---- 5 NEW shields ----
  else if (kind === 'heater') { for (let y = -5; y <= 6; y++) { const w = y < 1 ? 4 : Math.max(0, 4 - Math.ceil((y) * 0.8)); for (let x = -w; x <= w; x++) set(g, sx + x, sy + y, x < -w + 1 ? P.hi : x > w - 1 ? P.lo : P.mi); } for (let y = -5; y <= 2; y++) { set(g, sx - 1, sy + y, 'r'); set(g, sx + 1, sy + y, 'r'); } set(g, sx, sy - 2, 'd'); }   // flat-top heater w/ chevron
  else if (kind === 'tower') { for (let y = -8; y <= 8; y++) { const w = (y < -6) ? Math.max(0, 4 - (-6 - y) * 2) : 4; for (let x = -w; x <= w; x++) set(g, sx + x, sy + y, x < -w + 1 ? P.hi : x > w - 1 ? P.lo : P.mi); } for (let y = -6; y <= 8; y++) { set(g, sx - 2, sy + y, P.lo); set(g, sx + 2, sy + y, P.lo); } set(g, sx, sy, 'd'); set(g, sx, sy - 4, 'd'); set(g, sx, sy + 4, 'd'); }   // tall rectangular ridged
  else if (kind === 'round') { disc(g, sx, sy, 6, 'k'); for (let a = 0; a < 360; a += 30) { const ex = sx + 6 * Math.cos(a * D), ey = sy + 6 * Math.sin(a * D); for (let t = 0; t <= 1; t += 0.16) set(g, sx + (ex - sx) * t, sy + (ey - sy) * t, 'W'); } for (let a = 0; a < 360; a += 20) set(g, sx + Math.round(6 * Math.cos(a * D)), sy + Math.round(6 * Math.sin(a * D)), STEELW.mi); disc(g, sx, sy, 2, STEELW.hi); set(g, sx, sy, STEELW.lo); }   // wooden planked w/ steel boss
  else if (kind === 'targe') { disc(g, sx, sy, 5, P.mi); for (let a = 0; a < 360; a += 30) set(g, sx + Math.round(4 * Math.cos(a * D)), sy + Math.round(4 * Math.sin(a * D)), 'd'); for (let a = 0; a < 360; a += 60) set(g, sx + Math.round(5.5 * Math.cos(a * D)), sy + Math.round(5.5 * Math.sin(a * D)), P.hi); disc(g, sx, sy, 2, 'd'); set(g, sx, sy, 'y'); }   // studded round targe
  else if (kind === 'spiked') { disc(g, sx, sy, 5, P.lo); disc(g, sx - 1, sy - 1, 3, P.mi); for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) { const [tx, ty] = [sx + 7 * Math.cos(a * D), sy + 7 * Math.sin(a * D)]; set(g, tx, ty, STEELW.hi); set(g, (sx + tx) / 2, (sy + ty) / 2, STEELW.mi); } for (let j = 0; j < 4; j++) set(g, sx + j, sy, j ? STEELW.mi : STEELW.hi); set(g, sx + 4, sy, 'I'); }   // central + rim spikes
}

// rich back-banner (only for SOME units): a tall pole rising behind the figure with a long
// bicolour gonfalon + a small emblem. Drawn before the torso so it reads behind the body.
function drawBackBanner(g, r, bn) {
  const px = r.cx - 6, top = r.shoY - 18;
  for (let y = top; y <= r.hipY + 2; y++) set(g, px, y, 'w');           // pole
  set(g, px, top - 1, bn.finial || 'y');
  const c1 = bn.cloth1 || 'c', c2 = bn.cloth2 || 'C';
  for (let j = 0; j < 16; j++) { const w = 7 - (j > 12 ? (j - 12) * 2 : 0); for (let i = 1; i <= w; i++) set(g, px - i, top + 2 + j, i === w ? c1 : ((i + j) & 1 ? c1 : c2)); }
  if (bn.emblem) { for (const [dx, dy] of bn.emblem) set(g, px - 4 + dx, top + 8 + dy, bn.emblemCol || 'y'); }   // crest motif
  // tasselled fringe
  for (let i = 1; i <= 5; i++) if (i & 1) set(g, px - i, top + 2 + 16, c1);
}

function drawCape(g, r, col) {
  for (let y = r.shoY; y <= r.hipY + 10; y++) { const w = 2 + Math.round((y - r.shoY) / 3); for (let x = r.cx - 5 - w; x <= r.cx - 4; x++) set(g, x, y, x < r.cx - 4 - w ? col.lo : col.mi); }
}

// =============================================================== ASSEMBLE ========
// spec: { body, build, head, helmGold, hair, crest, weapon, shield, cape, tabard, trim,
//         glow, ability(g,fr,r), float, mount(g,r,fr), wings:'feather'|'bat', flyer }
function compose(spec, pose, weaponAngle, opt = {}) {
  const g = G();
  const r = rig(pose, spec);
  const mat = MAT[spec.body] || MAT.cloth;
  const boot = spec.body === 'plate' || spec.body === 'mail' ? MAT.plate : { lo: 'q', mi: 'q', hi: 'n', boot: 'q' };
  if (spec.mount) { spec.mount(g, r, pose.fr || 0); }
  if (spec.backBanner) drawBackBanner(g, r, spec.backBanner);
  if (spec.wings) drawWings(g, r, spec.wings, pose.wingFlap == null ? 0 : pose.wingFlap);
  if (spec.cape) drawCape(g, r, { lo: 'c', mi: 'C' });
  // back limbs
  drawArm(g, r.shoB, pose.bUpA, pose.bForeA, mat, mat.lo, true);
  drawLeg(g, r.hipB, pose.bThighA, pose.bKneeA, mat, boot, true);
  // body
  if (!spec.float && !spec.mount) drawLeg(g, r.hipF, pose.fThighA, pose.fKneeA, mat, boot, false);
  drawTorso(g, r, spec);
  drawHead(g, r, spec);
  // front arm + weapon
  const hand = drawArm(g, r.shoF, pose.fUpA, pose.fForeA, mat, mat.hi, false, spec.trim === 'gold');
  const wp = WEAP[spec.weapon] || WEAP.none;
  wp.draw(g, hand, pose.fr || 0, weaponAngle, spec.glow);
  drawShield(g, r, spec.shield);
  if (opt.ability && spec.ability) spec.ability(g, pose.fr || 0, r);
  outline(g, 'o', spec.softFx || 'gGhHbBfFeEmMrR');
  if (spec.scale && spec.scale !== 1) return clampGrid(scaleFoot(g, spec.scale));
  return clampGrid(g);
}
// foot-anchored nearest-neighbour scale: keeps the feet on GROUND, scales the whole figure so the
// roster can span a true ~3:1 size range (tiny scout → colossus) on top of build-width variation.
function scaleFoot(g, s) {
  const out = G();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = g[y][x]; if (c === '`') continue;
    const nx = Math.round(30 + (x - 30) * s), ny = Math.round(GROUND - (GROUND - y) * s);
    if (s > 1) { for (let dy = 0; dy < Math.ceil(s); dy++) for (let dx = 0; dx < Math.ceil(s); dx++) set(out, nx + dx, ny - dy, c); }
    else set(out, nx, ny, c);
  }
  return out;
}

// feathered or bat wings, drawn behind the torso. flap 0=mid,1=up,2=down.
function drawWings(g, r, kind, flap) {
  const sy = r.shoY, spread = [0, -3, 3][flap] || 0;
  for (const s of [-1, 1]) {
    const bx = r.cx + s * 4;
    if (kind === 'bat') {
      const tx = bx + s * 10, ty = sy - 6 + spread;
      for (let t = 0; t <= 1; t += 0.1) { const x = bx + (tx - bx) * t, y = sy + (ty - sy) * t; set(g, x, y, 'k'); }
      for (let f = 0; f < 3; f++) { const fx = bx + s * (4 + f * 3), fy = sy + 2 + f; for (let t = 0; t <= 1; t += 0.15) set(g, bx + (fx - bx) * t, ty + (fy - ty) * t, 'K'); }
    } else {
      for (let f = 0; f < 6; f++) { const len = 9 - Math.abs(f - 2); const ang = (s > 0 ? 60 : 120) + (f - 3) * 9 - spread * s; const [tx, ty] = pt(bx, sy - 2, ang, len); limb(g, bx, sy - 2, tx, ty, 0.8, 'N', 'q', 'p'); }
      set(g, bx, sy - 8 - spread, 'p');
    }
  }
}

// quadruped beast (hellhound / behemoth mount). spec: { hide, horns, mane, big, rider, softFx }
export function buildBeast(spec) {
  const hide = spec.hide || MAT.hide, big = spec.big;
  const draw = (k) => { const g = G();
    const bodyY = big ? 40 : 44, cx = 30, hw = big ? 13 : 10, hh = big ? 7 : 5;
    for (let y = bodyY - hh; y <= bodyY + hh; y++) for (let x = cx - hw; x <= cx + hw; x++) { const t = (y - bodyY) / hh, u = (x - cx) / hw; if (u * u + t * t <= 1.05) set(g, x, y, y < bodyY - 1 ? hide.hi : y > bodyY + 2 ? hide.lo : hide.mi); }
    const hx = cx + hw + 2, hy = bodyY - (big ? 2 : 1);
    disc(g, hx, hy, big ? 5 : 4, hide.mi); set(g, hx + 2, hy - 1, hide.hi); set(g, hx + (big ? 3 : 2), hy, 'O'); disc(g, hx + (big ? 4 : 3), hy + 2, 1, 'r');
    for (const s of [-1, 1]) { set(g, hx - 1, hy - (big ? 5 : 4), hide.lo); set(g, hx, hy - (big ? 6 : 5), hide.mi); }
    if (spec.horns) for (const s of [-1, 1]) for (let j = 0; j < 5; j++) set(g, hx - 1 + j * 0.3, hy - 5 - j, j > 3 ? 'O' : 'K');
    if (spec.mane) for (let x = cx - 2; x <= hw + cx - 2; x++) if (x % 2) { set(g, x, bodyY - hh - 1, 'e'); set(g, x, bodyY - hh - 2, 'E'); }
    for (let j = 0; j < 7; j++) set(g, cx - hw - Math.round(j * 0.6), bodyY - 2 - Math.round(j * 0.5), hide.mi);
    const ph = [[18, -18, -12, 12], [-16, 16, 14, -14], [-18, 18, 10, -10], [14, -14, -12, 12]][k % 4];
    const hips = [cx - hw + 2, cx - hw + 5, cx + hw - 5, cx + hw - 2];
    hips.forEach((hxp, i) => { const a = ph[i] || 0, [kx, ky] = pt(hxp, bodyY + hh - 1, a, big ? 9 : 7), [fx, fy] = pt(kx, ky, a * 0.4, big ? 8 : 6); limb(g, hxp, bodyY + hh - 1, kx, ky, big ? 2 : 1.6, hide.lo, hide.mi, hide.mi); limb(g, kx, ky, fx, fy, 1.4, hide.lo, hide.mi, hide.mi); for (let c = 0; c < 3; c++) set(g, fx + c, fy + 1, 'O'); });
    if (spec.rider) spec.rider(g, cx, bodyY - hh, k);
    outline(g, 'o', spec.softFx || ''); return clampGrid(g); };
  return { idle: { anchor: 'foot', fps: 2, loop: true, frames: [draw(0), draw(0)] },
    walk: { anchor: 'foot', fps: 8, loop: true, frames: [draw(0), draw(1), draw(2), draw(3)] },
    death: { anchor: 'foot', fps: 7, loop: false, frames: [draw(0), deathHeap({ body: 'hide' })] } };
}

// pose presets ------------------------------------------------------------------
// angle convention: 0 = straight DOWN; +90 = EAST (right); 180 = UP; 270 = WEST.
// Front arm carries the weapon FORWARD (hand juts east at waist height); back arm hangs behind.
const STANCE = { bThighA: 16, bKneeA: 8, fThighA: -12, fKneeA: -2, bUpA: -16, bForeA: -26, fUpA: 24, fForeA: 62, bob: 0 };
function walkPose(k) {
  const sw = [24, 0, -24, 0][k], aw = [16, 0, -16, 0][k], bob = [0, 1, 0, 1][k];
  return { fr: k, bob, fThighA: -sw, fKneeA: sw > 0 ? -2 : sw, bThighA: sw, bKneeA: sw < 0 ? 8 : 8 - sw,
    fUpA: 24 + aw * 0.4, fForeA: 62 + aw, bUpA: -16 - aw * 0.4, bForeA: -26 - aw };
}
function attackPose(k) {
  // wind-up (arm cocked back/up), wind-up, strike (arm thrusts east), recover
  const fUp = [40, 48, 70, 34][k], fFore = [10, -10, 96, 70][k];
  return { fr: k, bob: k === 2 ? 1 : 0, fThighA: -14, fKneeA: -2, bThighA: 16, bKneeA: 8, fUpA: fUp, fForeA: fFore, bUpA: -16, bForeA: -26 };
}
// flying pose: legs tuck back, hover bob, wings flap (wingFlap 0/1/2)
function flyPose(k) {
  const flap = [0, 1, 0, 2][k], bob = [0, -1, 0, 1][k];
  return { fr: k, bob, wingFlap: flap, fThighA: 26, fKneeA: 40, bThighA: 30, bKneeA: 44, fUpA: 30, fForeA: 60, bUpA: -16, bForeA: -26 };
}
// weapon tip angle by anim/frame, per weapon kind.
// REST (idle/walk/fly): weapon ALWAYS points UPWARD (held upright/shouldered) — D requirement.
function weaponAngleFor(kind, anim, k) {
  if (anim === 'attack') {
    if (kind === 'pole') return [196, 210, 92, 150][k];   // raise → thrust east → recover
    return [205, 225, 116, 60][k];                        // raise high → chop east → recover
  }
  return kind === 'pole' ? 188 : 196;                     // upright, tip skyward (slightly back)
}

export function buildHumanoid(spec) {
  const out = {};
  const kind = (WEAP[spec.weapon] || WEAP.none).kind;
  const wa = (anim, k) => weaponAngleFor(kind, anim, k);
  out.idle = { anchor: 'foot', fps: 2, loop: true, frames: [
    compose(spec, { ...STANCE, fr: 0 }, wa('idle', 0)), compose(spec, { ...STANCE, bob: 1, fr: 1 }, wa('idle', 1)) ] };
  out.walk = { anchor: 'foot', fps: 8, loop: true, frames: [0, 1, 2, 3].map(k => compose(spec, walkPose(k), wa('walk', k))) };
  if (spec.flyer) out.fly = { anchor: 'foot', fps: 9, loop: true, frames: [0, 1, 2, 3].map(k => compose(spec, flyPose(k), wa('idle', k))) };
  if (spec.ability) out.ability = { anchor: 'foot', fps: spec.abilityFps || 8, loop: spec.abilityLoop !== false,
    frames: [0, 1, 2, 3].map(k => compose(spec, { ...STANCE, bob: k % 2, fr: k }, wa('idle', k), { ability: true })) };
  out.death = { anchor: 'foot', fps: 7, loop: false, frames: [
    compose(spec, { ...STANCE, fr: 0 }, wa('idle', 0)),
    compose(spec, { ...STANCE, lean: 6, bob: -2, fThighA: -30, bThighA: 30, fUpA: 70, bUpA: 60, fForeA: 96, fr: 1 }, 120),
    deathHeap(spec) ] };
  return out;
}
function deathHeap(spec) {
  const g = G(); const m = MAT[spec.body] || MAT.cloth;
  for (let i = 0; i < 22; i++) set(g, 22 + i, GROUND - 1, m.mi);
  for (let i = 0; i < 24; i++) set(g, 21 + i, GROUND, m.lo);
  for (let i = 2; i < 20; i++) set(g, 24 + i, GROUND - 2, i % 3 ? m.mi : m.hi);
  disc(g, 26, GROUND - 2, 2, SKIN.mi);
  outline(g, 'o', spec.softFx || '');
  return clampGrid(g);
}

// =============================================================== MOUNTED =========
// A horse (east) with a seated rider. hide = {lo,mi,hi}; legPhase animates the gallop.
export function drawHorse(g, hide, k) {
  const bodyY = 42, cx = 28;
  // barrel
  for (let y = bodyY - 4; y <= bodyY + 4; y++) for (let x = cx - 9; x <= cx + 10; x++) { const t = Math.abs(y - bodyY) / 5, w = 9 + 1; if (Math.abs(x - cx - 0.5) <= w * (1 - t * t * 0.5)) set(g, x, y, y < bodyY - 1 ? hide.hi : y > bodyY + 2 ? hide.lo : hide.mi); }
  // hindquarter + chest rounding
  disc(g, cx - 7, bodyY, 5, hide.mi); disc(g, cx + 9, bodyY - 1, 4, hide.mi);
  // neck + head up-right
  for (let j = 0; j < 9; j++) { const nx = cx + 11 + Math.round(j * 0.5), ny = bodyY - 2 - j; set(g, nx, ny, hide.hi); set(g, nx + 1, ny, hide.mi); set(g, nx - 1, ny, hide.lo); }
  const hx = cx + 16, hy = bodyY - 11; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) set(g, hx + x, hy + y, x < 2 ? hide.hi : hide.mi);
  set(g, hx + 4, hy + 2, hide.lo); set(g, hx + 1, hy + 1, 'O'); set(g, hx - 1, hy, hide.lo); set(g, hx + 2, hy - 1, hide.lo);  // ear + eye
  // mane
  for (let j = 0; j < 8; j++) set(g, cx + 11 + Math.round(j * 0.5) - 1, bodyY - 2 - j, 'q');
  // tail
  for (let j = 0; j < 8; j++) set(g, cx - 12 - Math.round(j * 0.3), bodyY - 2 + j, 'q');
  // four legs, gallop phase
  const ph = [[20, -20, -10, 10], [-15, 15, 12, -12], [-20, 20, 8, -8], [15, -15, -12, 12]][k % 4];
  const hipxs = [cx - 6, cx - 4, cx + 7, cx + 9];
  hipxs.forEach((hxp, i) => { const a = ph[i] || 0, [kx, ky] = pt(hxp, bodyY + 3, a, 8), [fx, fy] = pt(kx, ky, a * 0.3, 8); limb(g, hxp, bodyY + 3, kx, ky, 1.6, hide.lo, hide.mi, i < 2 ? hide.lo : hide.mi); limb(g, kx, ky, fx, fy, 1.3, hide.lo, hide.mi, hide.mi); set(g, fx, fy + 1, 'O'); });
}
export function buildRider(spec) {
  const hide = spec.hide || { lo: 'k', mi: 'K', hi: 'q' };
  const seat = (k) => { const g = G(); drawHorse(g, hide, k);
    // seated rider: torso + head above the saddle (cx≈28, saddle y≈37)
    const r = { cx: 27, shoY: 28, hipY: 35, neck: 25, headC: [29, 20], shoF: [30, 29], shoB: [25, 29], hipF: [29, 36], hipB: [25, 36] };
    if (spec.cape) drawCape(g, r, { lo: 'c', mi: 'C' });
    // bent legs astride
    const mat = MAT[spec.body] || MAT.cloth;
    limb(g, 26, 36, 24, 44, 2, mat.lo, mat.mi, mat.hi); limb(g, 31, 36, 33, 44, 2, mat.lo, mat.mi, mat.hi);
    drawTorso(g, r, spec); drawHead(g, r, spec);
    const hand = drawArm(g, r.shoF, 30, 70, mat, mat.hi, false, spec.trim === 'gold');
    const wp = WEAP[spec.weapon] || WEAP.none; wp.draw(g, hand, k, wp.kind === 'pole' ? 192 : 44, spec.glow);
    if (spec.saddle) for (let x = 22; x <= 33; x++) set(g, x, 37, x % 3 ? 'd' : 'y');
    outline(g, 'o', spec.softFx || ''); return clampGrid(g); };
  const out = {};
  out.idle = { anchor: 'foot', fps: 2, loop: true, frames: [seat(0), seat(0)] };
  out.walk = { anchor: 'foot', fps: 8, loop: true, frames: [seat(0), seat(1), seat(2), seat(3)] };
  out.death = { anchor: 'foot', fps: 7, loop: false, frames: [seat(0), deathHeap({ body: spec.body })] };
  return out;
}
