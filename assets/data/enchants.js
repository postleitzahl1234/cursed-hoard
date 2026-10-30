// assets/data/enchants.js — the six player spells, cast-to-impact.
//
// 40×40, 5 frames. These are the only effects the *player* causes, and that has a design
// consequence the rest of the FX do not carry: a spell must be **legible as a reward**. The
// player spent mana and clicked a spot; the clip has to confirm the click landed and that
// something happened there. So unlike the ability clips, these are allowed to be bright, and each
// one ends on a frame that is clearly an aftermath rather than a fade.
//
// Five frames, not four, for the same reason — the extra frame is the aftermath:
//
//   meteor           a rock falls IN from off-frame and craters      → scorched ground
//   fear             a wave of eyes opens outward                    → units scattering
//   freeze           spikes stab up from the floor                   → a frozen crust
//   gem_ward         a dome closes over the cave                     → a standing barrier
//   cursed_tribute   coins fall and rot into curse motes             → violet residue
//   dark_overcharge  a bolt strikes down and forks along the ground  → arcing residue
//
// Each also has a distinct APPROACH VECTOR — down, outward, up, closing, falling, striking — so
// the player can tell which spell fired from the first frame alone, before any colour registers.

import { blank, clip, ring, burst, motes, bubble, arc, shimmer, flames, FX_LEGEND } from './lib/fxlib.js';
import { set, get, line, disc } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'Enchants', blurb: 'The six player spells at 40x40 in five frames, each with its own approach vector — falling, spreading, rising, closing, dropping, striking — and each ending on a visible aftermath rather than a fade.' };

export const LEGEND = {
  '`': null, ...FX_LEGEND,
  x: 'EM2', X: 'EM4', f: 'EM6', o: 'IK1', c: 'IK3',         // fire + scorch
  u: 'UD1', U: 'UD3', w: 'HX5',                             // fear
  i: 'IC1', I: 'IC3', q: 'IC5', a: 'AQ2',                   // frost
  m: 'MS3', M: 'MS5',                                       // ward green
  g: 'GD2', G: 'GD4', k: 'GD5',                             // gold
  v: 'HX1', V: 'HX3',                                       // curse
  y: 'VL1', z: 'VL3', Y: 'VL4',                             // lightning
  s: 'RK2', S: 'RK5',                                       // stone, rubble
};

const S = 40, CX = 20, CY = 20, GY = 30;
const F5 = [0, 1, 2, 3, 4];
const t5 = f => f / 4;

const FIRE = ['x', 'X', 'f'], FEAR = ['u', 'U', 'w'], FROST = ['i', 'I', 'q'];
const WARD = ['m', 'M', 'q'], CURSE = ['v', 'V', 'w'], BOLT = ['y', 'z', 'Y'];

/** Meteor: it comes DOWN and in from the upper left, and leaves a crater. */
const meteor = f => {
  const g = blank(S, S);
  const t = t5(f);
  if (t < 0.55) {                                            // the descent
    const p = t / 0.55;
    const x = Math.round(2 + p * 18), y = Math.round(-2 + p * 30);
    disc(g, x, y, 4, 'X'); disc(g, x, y, 2, 'f');
    for (let d = 1; d < 10; d++)                              // the trail, thrown back up-left
      set(g, Math.round(x - d * 0.6), Math.round(y - d * 1.0), d > 6 ? 'x' : 'X');
  } else {                                                   // the impact and its aftermath
    const p = (t - 0.55) / 0.45;
    ring(g, CX, GY, p, FIRE, { r0: 3, r1: 19, flat: 0.4, thick: 3 });
    burst(g, CX, GY, p, FIRE, { n: 9, r0: 4, r1: 18, len: 4, seed: 3 });
    for (let dx = -10; dx <= 10; dx++) {                      // the crater it leaves
      const d = Math.round(3 * Math.cos((dx / 10) * 1.5));
      set(g, CX + dx, GY + 1, 'o'); if (d > 0) set(g, CX + dx, GY + 1 - d, 'c');
    }
    if (p > 0.5) flames(g, CX, GY, p, FIRE, { n: 4, spread: 8, h: 8, seed: 5 });
  }
  return g;
};

/** Fear: eyes opening outward in a spreading wave. Nothing else in the game opens an eye. */
const fear = f => {
  const g = blank(S, S);
  const t = t5(f);
  ring(g, CX, CY, t, FEAR, { r0: 2, r1: 19, flat: 0.8, thick: 2 });
  const n = 3 + f * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t;
    const r = 4 + t * 14;
    const x = Math.round(CX + Math.cos(a) * r), y = Math.round(CY + Math.sin(a) * r * 0.8);
    const open = Math.min(2, 1 + f);                          // the lids widen as it spreads
    for (let dy = -open; dy <= open; dy++)
      for (let dx = -3; dx <= 3; dx++)
        if (Math.abs(dx) * 0.6 + Math.abs(dy) < 2.4) set(g, x + dx, y + dy, 'U');
    set(g, x, y, 'w');
  }
  return g;
};

/** Freeze: spikes stab UP out of the floor, then crust over. The only upward spell. */
const freeze = f => {
  const g = blank(S, S);
  const t = t5(f);
  for (let i = 0; i < 9; i++) {
    const x = Math.round(4 + i * 4 + noise(i, 1, 7) * 2);
    const h = Math.round((6 + noise(i, 2, 7) * 12) * Math.min(1, t * 1.5));
    const w0 = 2 + (i % 2);
    for (let d = 0; d < h; d++) {
      const w = Math.max(0, Math.round(w0 * (1 - d / h)));
      for (let dx = -w; dx <= w; dx++)
        set(g, x + dx, GY - d, dx < 0 ? FROST[2] : d > h - 3 ? FROST[2] : FROST[1]);
    }
    if (h > 0) set(g, x, GY - h, 'q');
  }
  for (let dx = -18; dx <= 18; dx++)                          // the crust it leaves behind
    if (noise(dx, 0, 11) > 0.4 - t * 0.2) set(g, CX + dx, GY + 1, FROST[0]);
  if (t > 0.6) shimmer(g, CX, CY, t, FROST, { rx: 17, ry: 10, n: 10, seed: 13 });
  return g;
};

/** Gem ward: a dome CLOSING over the hoard. The only spell that ends larger than it starts. */
const gemWard = f => {
  const g = blank(S, S);
  const t = t5(f);
  bubble(g, CX, CY + 4, t, WARD, { rx: 18, ry: 16 });
  if (t > 0.35) bubble(g, CX, CY + 4, t * 0.8, WARD, { rx: 14, ry: 12 });
  // the gem it is protecting, drawn small so the barrier is the subject
  for (let y = CY + 1; y <= CY + 8; y++) {
    const w = Math.max(1, 4 - Math.abs(y - (CY + 4)));
    for (let dx = -w; dx <= w; dx++) set(g, CX + dx, y, dx < 0 ? 'M' : 'm');
  }
  for (let dx = -18; dx <= 18; dx++)                          // it stands on the ground
    if (Math.abs(dx) > 12) set(g, CX + dx, CY + 20 - Math.round(Math.abs(dx) * 0.3), 'm');
  return g;
};

/** Cursed tribute: coins FALL, and rot on the way down. Gold at the top, violet at the bottom. */
const cursedTribute = f => {
  const g = blank(S, S);
  const t = t5(f);
  for (let i = 0; i < 6; i++) {
    const ph = Math.min(1, t + i * 0.09);
    const x = Math.round(6 + i * 6 + Math.sin(ph * 4 + i) * 2);
    const y = Math.round(2 + ph * 28);
    const rotted = ph > 0.55;
    disc(g, x, y, 2, rotted ? 'V' : 'G');
    set(g, x, y, rotted ? 'w' : 'k');
    if (rotted) { set(g, x - 1, y + 2, 'v'); set(g, x + 1, y + 3, 'v'); }   // it drips
  }
  if (t > 0.5) motes(g, CX, GY, (t - 0.5) * 2, CURSE, { n: 8, spread: 15, rise: 12, seed: 17 });
  for (let dx = -16; dx <= 16; dx++)                          // violet residue on the floor
    if (t > 0.7 && noise(dx, 1, 19) > 0.5) set(g, CX + dx, GY + 2, 'v');
  return g;
};

/** Dark overcharge: a bolt STRIKES down, then forks sideways along the ground. */
const darkOvercharge = f => {
  const g = blank(S, S);
  const t = t5(f);
  if (t < 0.5) {
    arc(g, CX, 0, CX, GY, t, BOLT, { jag: 5, seed: 23 });     // the strike
    if (f === 1) { disc(g, CX, GY, 4, 'Y'); disc(g, CX, GY, 2, 'z'); }
  } else {
    const p = (t - 0.5) / 0.5;
    for (const s of [-1, 1]) {                                // forking along the floor
      arc(g, CX, GY, CX + s * 17 * p, GY + 2, p, BOLT, { jag: 3, seed: 29 + s });
      for (let i = 0; i < 2; i++)
        arc(g, CX + s * 9 * p, GY + 1, CX + s * 15 * p, GY - 5 - i * 3, p, BOLT, { jag: 2, seed: 31 + i });
    }
    ring(g, CX, GY, p, BOLT, { r0: 3, r1: 14, flat: 0.32, thick: 1 });
  }
  return g;
};

export const SPRITES = {
  enchant_meteor: clip(F5.map(meteor), 14),
  enchant_fear: clip(F5.map(fear), 14),
  enchant_freeze: clip(F5.map(freeze), 12),
  enchant_gem_ward: clip(F5.map(gemWard), 12),
  enchant_cursed_tribute: clip(F5.map(cursedTribute), 12),
  enchant_dark_overcharge: clip(F5.map(darkOvercharge), 16),
};
