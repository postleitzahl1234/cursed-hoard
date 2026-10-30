// troops/_worlds.js — the five WORLD LANGUAGES. Palette and detailing only.
//
// ── the line this file must not cross ────────────────────────────────────────
// D-12 says all troops in a world share one visual sub-style. D-28 then clarifies it hard:
// that shared sub-style is "a palette + detailing *language* only — never a shared body/mesh",
// and "no unit may be a recolour, rescale or part-swap of another unit's body."
//
// So this file holds RAMPS, an ACCENT, and a MOTIF — the faint thread that makes a wave read as
// one army. It holds no anatomy, no pose, no silhouette. Every creature is authored from zero
// in its own file. If a function here ever returned a body, the 53 archetypes would collapse
// back into 53 recolours, which is precisely the failure the old build shipped.
//
// ── how faint is faint ───────────────────────────────────────────────────────
// The theme is carried by three cheap signals, none of which touches the outline:
//   1. a shared BASE ramp for the world's common material (linen, holy stone, sun-bleached
//      cloth, court velvet, void shroud)
//   2. one ACCENT colour, used only on trim — a sash, a hem, a crest, an eye
//   3. one MOTIF, 3–6 px, stamped somewhere small (a wheat sprig, a sunburst, a scarab…)
// Everything louder than that belongs to the individual unit.

import { ramp } from '../lib/shade.js';
import { set, disc, line, ellipse } from '../lib/pixel.js';

/** Chars every world legend must define, so unit files can rely on them. */
export const COMMON = {
  '`': null,
  k: 'IK0', K: 'IK3',            // ink: contour, interior line
  q: 'SH1', Q: 'SH2',            // contact shadow (alpha)
  1: 'SK1', 2: 'SK2', 3: 'SK3', 4: 'SK4', 5: 'SK5',   // human skin
  i: 'IR1', I: 'IR3', j: 'IR5',  // iron
  w: 'WD1', W: 'WD3', v: 'WD5',  // wood
  r: 'RK1', R: 'RK3',            // stone / grey
  b: 'BN2', B: 'BN5',            // bone
};

// ═════════════════════════════════════════════════════════════════════════════
// W1 · GREAT GRASSLANDS — the General's Host.
// A levy army: undyed linen and honest iron, with grass-green sashes. Poor at the bottom,
// gilded at the top. The motif is a WHEAT SPRIG — these are farmers before they are soldiers.
export const W1 = {
  name: 'Great Grasslands',
  legend: { ...COMMON,
    a: 'BN1', c: 'BN3', d: 'BN4', e: 'BN6',        // linen / straw
    m: 'MS1', M: 'MS3', o: 'MS5',                  // the accent: grass green
    g: 'GD1', G: 'GD3', y: 'GD5',                  // gold, for the crowned few
    n: 'IR0',                                      // black iron
  },
  base: ramp(['a', 'BN2', 'c', 'd', 'e']),
  accent: ramp(['m', 'M', 'o']),
  accentCh: 'M',
  /** A wheat sprig — three grains on a stalk. Stamped on a sash, shield or banner. */
  motif(g, x, y, ch = 'o') {
    line(g, x, y, x, y - 4, ch);
    for (const [dx, dy] of [[-1, -1], [1, -2], [-1, -3]]) set(g, x + dx, y + dy, ch);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// W2 · HOLY MOUNTAINS — clergy and zealots.
// Cream holy stone and bleached robes; everything is vertical and clean. The accent is a cold
// halo-gold, never warm. The motif is a SUNBURST — a disc with four rays.
export const W2 = {
  name: 'Holy Mountains',
  legend: { ...COMMON,
    a: 'HS0', c: 'HS1', d: 'HS2', e: 'HS3', f: 'HS4',   // holy stone / robes
    m: 'GD2', M: 'GD4', o: 'GD5',                        // halo gold accent
    h: 'IC2', H: 'IC4',                                  // mountain ice glint
    n: 'BN0',
  },
  base: ramp(['a', 'c', 'd', 'e', 'f']),
  accent: ramp(['m', 'M', 'o']),
  accentCh: 'M',
  motif(g, x, y, ch = 'o') {
    disc(g, x, y, 1.6, ch);
    for (const [dx, dy] of [[0, -3], [0, 3], [-3, 0], [3, 0]]) set(g, x + dx, y + dy, ch);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// W3 · SEA OF SAND — desert raiders.
// Sun-bleached wrappings over dark skin; everything is loose cloth and shadow. The accent is a
// hot ember-orange. The motif is a SCARAB — a small hard oval with legs.
export const W3 = {
  name: 'Sea of Sand',
  legend: { ...COMMON,
    a: 'SD1', c: 'SD2', d: 'SD4', e: 'SD6',        // sand-bleached linen
    m: 'EM2', M: 'EM4', o: 'EM6',                  // ember accent
    t: 'TX1', T: 'TX3',                            // oasis teal, rare
    n: 'BN0',
  },
  base: ramp(['a', 'c', 'd', 'e']),
  accent: ramp(['m', 'M', 'o']),
  accentCh: 'M',
  motif(g, x, y, ch = 'M') {
    ellipse(g, x, y, 2, 1.4, ch);
    for (const s of [-1, 1]) { set(g, x + s * 3, y - 1, ch); set(g, x + s * 3, y + 1, ch); }
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// W4 · ROYAL GARDENS — the court, and its clockwork.
// Deep court velvet and polished brass; the richest palette in the game. The accent is royal
// gold. The motif is a FLEUR — a three-lobed crest.
export const W4 = {
  name: 'Royal Gardens',
  legend: { ...COMMON,
    a: 'CR1', c: 'CR2', d: 'CR4', e: 'CR5',        // court velvet (deep indigo-violet)
    m: 'GD2', M: 'GD4', o: 'GD5',                  // royal gold accent
    p: 'BR2', P: 'BR4', C: 'BR5',                  // clockwork brass
    n: 'IR0',
  },
  base: ramp(['a', 'c', 'd', 'e']),
  accent: ramp(['m', 'M', 'o']),
  accentCh: 'M',
  motif(g, x, y, ch = 'o') {
    set(g, x, y - 3, ch); set(g, x, y - 2, ch);
    for (const s of [-1, 1]) { set(g, x + s * 2, y - 1, ch); set(g, x + s, y, ch); }
    set(g, x, y + 1, ch);
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// W5 · SHADOW REALM — demons, undead and shadow.
// Near-black shrouds and hide; the only world where the units are darker than the ground, so
// D-22(d)'s rim light stops being optional. Accent is curse violet, with ember for the demonic.
export const W5 = {
  name: 'Shadow Realm',
  legend: { ...COMMON,
    a: 'CR0', c: 'CR1', d: 'CR3', e: 'CR5',        // void shroud
    m: 'HX1', M: 'HX3', o: 'HX5',                  // hex-violet accent
    u: 'UD1', U: 'UD3', p: 'UD5',                  // undead flesh
    h: 'DM1', H: 'DM3', y: 'DM5',                  // demon hide
    x: 'EM4', X: 'EM6',                            // ember, for the demonic half
    n: 'IK1',
  },
  base: ramp(['a', 'c', 'd', 'e']),
  accent: ramp(['m', 'M', 'o']),
  accentCh: 'M',
  motif(g, x, y, ch = 'o') {                        // a rune: an open eye
    for (let i = -3; i <= 3; i++) set(g, x + i, y - Math.round(Math.abs(i) * 0.4) + 1, ch);
    for (let i = -3; i <= 3; i++) set(g, x + i, y + Math.round(Math.abs(i) * 0.4) - 1, ch);
    set(g, x, y, 'k');
  },
};

export const WORLDS = { W1, W2, W3, W4, W5 };

/**
 * Draw the world's accent as a SASH — the most common way the theme touches a unit without
 * touching its outline. Diagonal across the torso, two values, always under the ink pass.
 */
export function sash(g, x0, y0, x1, y1, world, thick = 2) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let i = 0; i <= n; i++) {
    const x = x0 + (dx * i) / n, y = y0 + (dy * i) / n;
    for (let o = 0; o < thick; o++) set(g, x + o, y, o === 0 ? world.accent.rim : world.accent.mid);
  }
}

export { ramp };
