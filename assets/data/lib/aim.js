// lib/aim.js — the 8-way AIM PART: how a tower shows you what it is shooting at.
//
// ── the problem ──────────────────────────────────────────────────────────────
// D-23 chose discrete hand-drawn facings over free rotation, because no-AA ink-line art (D-08)
// goes flat and muddy when the GPU rotates it to an arbitrary angle. That decision is right,
// but taken literally it means hand-drawing 5 facings × ~3 attack frames × 48 towers ≈ 700
// sprites, which is why the old build never did it (and why its Turret class ended up abusing
// the frame array as a facing table, making facing and attack animation mutually exclusive).
//
// ── the solution ─────────────────────────────────────────────────────────────
// Author each tower's weapon ONCE as a spec — barrel length, girth, rings, muzzle, mantlet,
// per-tower extras — and PROJECT it into the five authored facings. A barrel pointing NE really
// is the same barrel seen from a different angle, so generating that projection is honest; what
// would NOT be honest is generating the building, which is why nothing here draws a structure.
// The tower files still own their spec, so the 48 aim parts stay as distinct as the 48 towers.
//
// Authored: E, NE, N, SE, S.  Mirrored by the engine at draw time: W, NW, SW.
//
// ── faction aim parts ────────────────────────────────────────────────────────
// Orc / Goblin gun towers  → `barrelRig`   the whole turret swings (D-23/D-26)
// Crypt                    → `lanternRig`  the spire stays put; a rune-lantern turns in its
//                                          upper window and the orbiting charges collapse
//                                          toward the target before release
// Demon                    → `idolRig`     the shrine idol's head turns and the brazier plume
//                                          leans downrange; beams already draw to the target
// Goblin drone/bomber      → `hatchRig`    no turret (D-26) — the bay doors face the lane and
//                                          the launch flare exits on that side

import { grid, set, rect, ellipse, line, poly, disc, EMPTY } from './pixel.js';
import { cylinderH, cylinderV, ramp, sphere } from './shade.js';
import { outline } from './ink.js';

/** The five authored facings, in the order tower files should declare them. */
export const FACINGS = ['e', 'ne', 'n', 'se', 's'];

/**
 * Direction vectors for a 3/4 top-down view. Y is compressed because the camera looks down at
 * the board: a barrel pointing "north" is mostly pointing AWAY from us, so it foreshortens hard
 * and we see its top; pointing "south" it comes toward us and we see the bore.
 */
// `fore` shortens the run; `y` sets how fast it climbs or descends per step. N and S are tuned
// so the barrel still CLEARS THE MANTLET rather than vanishing inside it — a turret whose
// barrel disappears when it aims up or down reads as broken, not as foreshortened.
export const DIR = {
  e:  { x:  1.00, y:  0.00, fore: 1.00, tilt:  0 },
  ne: { x:  0.86, y: -0.42, fore: 0.93, tilt: -1 },
  n:  { x:  0.00, y: -0.86, fore: 0.62, tilt: -2 },   // pointing away — we see its top
  se: { x:  0.86, y:  0.42, fore: 0.93, tilt:  1 },
  s:  { x:  0.00, y:  0.95, fore: 0.62, tilt:  2 },   // pointing at us — the bore shows
};

/**
 * A tapered tube from the pivot along `dir`, shaded so the lit side always faces NW regardless
 * of which way the tube points. This is the whole trick: the LIGHT does not rotate with the art.
 */
function tube(g, px, py, dir, len, girth, rmp, opts = {}) {
  const { taper = 1.0, startAt = 0 } = opts;
  const steps = Math.max(1, Math.round(len * dir.fore));
  for (let i = startAt; i <= steps; i++) {
    const t = i / steps;
    const x = px + dir.x * i, y = py + dir.y * i;
    const halfH = Math.max(1, (girth * (1 - t * (1 - taper))) / 2);
    for (let j = -Math.ceil(halfH); j <= Math.ceil(halfH); j++) {
      // v: 0 at the lit top edge, 1 at the shadowed bottom edge — fixed to the world, not the tube
      const v = (j + halfH) / (2 * halfH);
      let s = 1 - Math.pow(Math.min(1, v / 0.55), 1.3);
      if (v > 0.55) s = -0.3 * ((v - 0.55) / 0.45);
      set(g, x, y + j, rmp.at((s * 0.95 + 0.1) * (rmp.n - 1)));
    }
  }
}

/** A reinforcement ring at distance `d` along the barrel — reads as a hard band across the tube. */
function ring(g, px, py, dir, d, girth, ch, ch2) {
  const x = px + dir.x * d * dir.fore, y = py + dir.y * d * dir.fore;
  const half = Math.ceil(girth / 2) + 1;
  for (let j = -half; j <= half; j++) set(g, x, y + j, Math.abs(j) >= half - 1 ? ch2 : ch);
}

/**
 * ORC / GOBLIN — the full turret: armoured mantlet + barrel + muzzle.
 * `spec` is bespoke per tower; that is what keeps 18 turrets from becoming one turret.
 *
 * spec = {
 *   mantlet: {rx, ry, ramp, studs?, studCh?},
 *   barrel:  {len, girth, ramp, taper?, rings?: [d,...], ringCh?},
 *   muzzle:  {flare, len, ramp} | null,
 *   recoil:  px pulled back on the fire frame,
 *   flash:   {r, chars:[outer,mid,core]} | null,
 *   extra:   (g, px, py, dir, frame) => void      ← per-tower flourish, drawn last
 * }
 */
export function barrelRig(spec, facing, frame = 0) {
  const g = grid(spec.canvas[0], spec.canvas[1]);
  const dir = DIR[facing];
  const [px, py0] = spec.pivot;
  const py = py0 + (dir.tilt || 0);
  const back = frame === 1 ? (spec.recoil || 0) : 0;
  const bx = px - dir.x * back, by = py - dir.y * back;

  // barrel first when it points away (N/NE), so the mantlet covers its root;
  // mantlet first when it points toward us (S/SE), so the barrel sits in front of it
  const barrelBehind = facing === 'n' || facing === 'ne';

  const drawMantlet = () => {
    const m = spec.mantlet;
    ellipse(g, px, py, m.rx, m.ry, m.ramp.mid);
    cylinderH(g, px - m.rx, py - m.ry, m.rx * 2 + 1, m.ry * 2 + 1, m.ramp);
    // re-cut to the ellipse so the cylinder shading does not square off the silhouette
    for (let y = py - m.ry - 1; y <= py + m.ry + 1; y++) {
      for (let x = px - m.rx - 1; x <= px + m.rx + 1; x++) {
        const d = ((x - px) / m.rx) ** 2 + ((y - py) / m.ry) ** 2;
        if (d > 1 && m.ramp.steps.includes(g.px[y]?.[x])) set(g, x, y, EMPTY);
      }
    }
    if (m.studs) {
      for (let i = 0; i < m.studs; i++) {
        const a = (i / m.studs) * Math.PI * 2;
        set(g, px + Math.round(Math.cos(a) * (m.rx - 1.5)), py + Math.round(Math.sin(a) * (m.ry - 1.5)), m.studCh || 'D');
      }
    }
  };

  const drawBarrel = () => {
    const b = spec.barrel;
    if (facing === 's') {
      // coming at us: foreshortened length plus the bore, which is the readable cue for
      // "this one is pointing at you". The bore is drawn dark so it reads as a hole.
      tube(g, bx, by, dir, b.len * 0.62, b.girth * 1.15, b.ramp, { taper: 1.3 });
      const tipY = by + dir.y * b.len * 0.62 * dir.fore;
      ellipse(g, bx, tipY + 1, b.girth * 0.70, b.girth * 0.52, b.ramp.lit);
      ellipse(g, bx, tipY + 1, b.girth * 0.50, b.girth * 0.36, b.ramp.shadow);
      ellipse(g, bx, tipY + 1, b.girth * 0.30, b.girth * 0.22, 'k');
    } else if (facing === 'n') {
      // going away: we see the top of the barrel and its far end, never the bore
      tube(g, bx, by, dir, b.len * 0.80, b.girth * 0.95, b.ramp, { taper: 0.78 });
      const tipY = by + dir.y * b.len * 0.80 * dir.fore;
      ellipse(g, bx, tipY, b.girth * 0.42, b.girth * 0.26, b.ramp.rim);
    } else {
      tube(g, bx, by, dir, b.len, b.girth, b.ramp, { taper: b.taper != null ? b.taper : 0.92 });
    }
    for (const d of (b.rings || [])) {
      if (d > b.len) continue;
      ring(g, bx, by, dir, d - back * 0, b.girth + 1, b.ringCh || 'J', b.ringCh2 || 'i');
    }
    if (spec.muzzle && facing !== 'n') {
      const d = (facing === 's' ? b.len * 0.55 : b.len) * dir.fore;
      const mx = bx + dir.x * d, my = by + dir.y * d;
      ellipse(g, mx, my, spec.muzzle.len, (b.girth + spec.muzzle.flare) / 2, spec.muzzle.ramp.mid);
      cylinderH(g, mx - spec.muzzle.len, my - (b.girth + spec.muzzle.flare) / 2,
        spec.muzzle.len * 2 + 1, b.girth + spec.muzzle.flare + 1, spec.muzzle.ramp);
    }
  };

  if (barrelBehind) { drawBarrel(); drawMantlet(); } else { drawMantlet(); drawBarrel(); }

  if (frame === 1 && spec.flash) muzzleFlash(g, spec, facing, bx, by);
  if (spec.extra) spec.extra(g, px, py, dir, frame);
  outline(g, 'k', { soft: (spec.soft || '') + 'qQxEe' });
  return g;
}

/** Fire flash at the business end, sized by tier — a T1 spark and a T6 blast are not the same. */
function muzzleFlash(g, spec, facing, bx, by) {
  const dir = DIR[facing];
  const b = spec.barrel;
  const d = ((facing === "s" ? b.len * 0.62 : facing === "n" ? b.len * 0.80 : b.len) + 3) * dir.fore;
  const fx = bx + dir.x * d, fy = by + dir.y * d;
  const [o, m, c] = spec.flash.chars;
  const r = spec.flash.r;
  ellipse(g, fx, fy, r, r * 0.85, o);
  ellipse(g, fx, fy, r * 0.66, r * 0.55, m);
  ellipse(g, fx, fy, r * 0.34, r * 0.3, c);
  for (let i = 0; i < Math.round(r); i++) {                    // sparks along the line of fire
    const t = 1 + i * 0.5;
    set(g, fx + dir.x * r * t, fy + dir.y * r * t + ((i % 3) - 1), m);
  }
}

/**
 * CRYPT — the spire never moves (D-23's reasoning holds: a rotated gothic spire muddies).
 * What turns is a rune-lantern hung in the upper window, and the banked charges that orbit the
 * spire collapse to the target's side before release. Both read clearly at 32 px.
 *
 * spec = { canvas, pivot, orbitR, lantern:{r, ramp, glow}, charges:{n, ch, glow}, soft? }
 */
export function lanternRig(spec, facing, frame = 0) {
  const g = grid(spec.canvas[0], spec.canvas[1]);
  const dir = DIR[facing];
  const [px, py] = spec.pivot;
  const L = spec.lantern;

  // the lantern swings out on the aimed side, hanging from its hook
  const lx = px + dir.x * L.throw, ly = py + dir.y * L.throw * 0.7 + 1;
  line(g, px, py - L.r - 3, lx, ly - L.r, 'i');                  // chain
  sphere(g, lx, ly, L.r, L.ramp);
  // the lit face points downrange — this is the "eye" the player reads as aiming
  const ex = lx + dir.x * (L.r * 0.55), ey = ly + dir.y * (L.r * 0.55);
  disc(g, ex, ey, Math.max(1, L.r * 0.45), frame === 1 ? L.flare : L.glow);
  if (frame === 1) {
    disc(g, ex + dir.x * 2, ey + dir.y * 2, Math.max(1, L.r * 0.3), L.flare);
    for (let i = 1; i <= 4; i++) set(g, ex + dir.x * (L.r + i * 1.6), ey + dir.y * (L.r + i * 1.6), L.glow);
  }

  // banked charges: idle they ring the spire, on the fire frame they collapse downrange
  const C = spec.charges;
  for (let i = 0; i < C.n; i++) {
    const a = (i / C.n) * Math.PI * 2 + (frame === 1 ? 0 : 0.4);
    const spread = frame === 1 ? 0.35 : 1.0;
    const ox = Math.cos(a) * spec.orbitR * spread + (frame === 1 ? dir.x * spec.orbitR * 0.9 : 0);
    const oy = Math.sin(a) * spec.orbitR * 0.42 * spread + (frame === 1 ? dir.y * spec.orbitR * 0.9 : 0);
    disc(g, px + ox, py + oy, C.r, C.ch);
    set(g, px + ox, py + oy - 1, C.glow);
  }
  if (spec.extra) spec.extra(g, px, py, dir, frame);
  outline(g, 'k', { soft: (spec.soft || '') + C.ch + C.glow + L.glow + L.flare });
  return g;
}

/**
 * DEMON — the ziggurat is immovable, so the SHRINE IDOL at its summit turns its head and the
 * brazier plume leans downrange. Beam tiers already draw a live beam to the victim; this gives
 * the pyre and mortar tiers the same "I have chosen you" read.
 *
 * spec = { canvas, pivot, idol:{r, ramp, eye, horns?}, plume:{h, chars}, soft? }
 */
export function idolRig(spec, facing, frame = 0) {
  const g = grid(spec.canvas[0], spec.canvas[1]);
  const dir = DIR[facing];
  const [px, py] = spec.pivot;
  const I = spec.idol;

  // head — an obsidian mask that turns; the horns swing with it and carry the silhouette
  sphere(g, px, py, I.r, I.ramp);
  if (I.horns) {
    for (const s of [-1, 1]) {
      const hx = px + s * I.r * 0.8 - dir.x * I.r * 0.25;
      line(g, hx, py - I.r * 0.5, hx + s * 2 + dir.x * 2, py - I.r - 3 + Math.abs(dir.y) * 1.5, I.ramp.rim, 2);
    }
  }
  // the two eyes sit on the aimed side of the mask
  for (const s of [-1, 1]) {
    const ex = px + dir.x * I.r * 0.5 - dir.y * s * I.r * 0.35;
    const ey = py + dir.y * I.r * 0.5 + dir.x * s * I.r * 0.28;
    set(g, ex, ey, frame === 1 ? I.flare : I.eye);
    set(g, ex, ey + 1, I.eye);
  }
  // the brazier plume leans downrange instead of standing straight up
  const P = spec.plume;
  for (let i = 0; i < P.h; i++) {
    const t = i / P.h;
    const x = px + dir.x * (t * P.lean) + ((i % 3) - 1) * (1 - t);
    const y = py - I.r - 1 - i + dir.y * (t * P.lean * 0.5);
    const ch = P.chars[Math.min(P.chars.length - 1, Math.floor(t * P.chars.length))];
    set(g, x, y, ch);
    if (i < P.h * 0.6) set(g, x + 1, y, ch);
  }
  if (frame === 1) {
    const fx = px + dir.x * (I.r + 4), fy = py + dir.y * (I.r + 4);
    ellipse(g, fx, fy, 4, 3, P.chars[0]);
    ellipse(g, fx, fy, 2, 1.5, I.flare);
  }
  if (spec.extra) spec.extra(g, px, py, dir, frame);
  outline(g, 'k', { soft: (spec.soft || '') + P.chars.join('') + I.flare + I.eye });
  return g;
}

/**
 * GOBLIN drone / bomber platforms — D-26 forbids a turret here, the fighting is done by separate
 * flying actors. So the PLATFORM addresses the target instead: the bay doors on the aimed side
 * stand open, the launch rail extends that way, and the release flare exits on that side.
 *
 * spec = { canvas, pivot, bay:{w, h, ramp, doorCh}, rail:{len, ch}, flare:{chars}, soft? }
 */
export function hatchRig(spec, facing, frame = 0) {
  const g = grid(spec.canvas[0], spec.canvas[1]);
  const dir = DIR[facing];
  const [px, py] = spec.pivot;
  const B = spec.bay;

  // the open bay mouth, offset to the aimed side
  const bx = px + dir.x * B.offset, by = py + dir.y * B.offset * 0.7;
  ellipse(g, bx, by, B.w / 2, B.h / 2, 'k');
  ellipse(g, bx, by - 1, B.w / 2 - 1, B.h / 2 - 1, B.ramp.shadow);
  // hinged doors thrown open on either side of the mouth
  for (const s of [-1, 1]) {
    const dx0 = bx - dir.y * s * (B.w / 2), dy0 = by + dir.x * s * (B.w / 2);
    line(g, dx0, dy0, dx0 - dir.y * s * 4 - dir.x * 2, dy0 + dir.x * s * 4 - dir.y * 2, B.doorCh, 2);
  }
  // launch rail pointing downrange
  if (spec.rail) {
    line(g, bx, by, bx + dir.x * spec.rail.len, by + dir.y * spec.rail.len, spec.rail.ch, 2);
    set(g, bx + dir.x * spec.rail.len, by + dir.y * spec.rail.len, 'J');
  }
  if (frame === 1 && spec.flare) {
    const fx = bx + dir.x * (B.w * 0.6), fy = by + dir.y * (B.w * 0.6);
    ellipse(g, fx, fy, 3.5, 2.5, spec.flare.chars[0]);
    ellipse(g, fx, fy, 2, 1.4, spec.flare.chars[1]);
  }
  if (spec.extra) spec.extra(g, px, py, dir, frame);
  outline(g, 'k', { soft: (spec.soft || '') + 'xEe' });
  return g;
}

/**
 * Build the full aim-part sprite set for one tower. Returns
 * { `${key}_aim_e`: clip, `${key}_aim_ne`: …, _n, _se, _s } — five keys, each carrying its own
 * attack animation. The engine mirrors E→W, NE→NW, SE→SW at draw time, so 5 authored facings
 * cover all 8 (D-23) and facing is no longer entangled with the frame index.
 */
export function aimSet(key, rig, spec, { fps = 6, frames = 2 } = {}) {
  const out = {};
  for (const f of FACINGS) {
    out[`${key}_aim_${f}`] = {
      anchor: 'foot', fps, loop: true,
      frames: Array.from({ length: frames }, (_, i) => rig(spec, f, i).px.map(r => r.join(''))),
    };
  }
  return out;
}

export { ramp };
