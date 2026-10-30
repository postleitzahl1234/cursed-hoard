// assets/data/icons.js — the 32 HUD icons, re-authored at 1× density.
//
// 24×24. The old set was 48×48 and the HUD drew it at **nine different sizes** — 12, 14, 16, 22,
// 24, 26, 30, 36 and 40 — so every icon on screen was a resample. The layout has been changed to
// match the art rather than the other way round: `UiChrome.ICON` is 24 and every call site uses
// it, with `UiChrome.PIP` at 12 for the status pips that ride on a unit. 12 is an exact 2:1
// reduction of 24, which is the one downscale that stays crisp.
//
// ── The structural rule ─────────────────────────────────────────────────────
// Two families would otherwise collide: the six DAMAGE TYPES (physical, magic, fire, frost,
// lightning, curse) and the five STATUSES (feared, slowed, stunned, burning, cursed). They mean
// different things and half of them share a noun. So they are separated by *format*, not by
// drawing harder:
//
//   damage type  →  a glyph on a **plated badge** — a bevelled, corner-clipped square
//   status       →  a **bare glyph**, no plate at all
//
// A plate means "this is a category". No plate means "this is happening right now". You can tell
// fire from burning without reading either one, which is the only test that matters at 24 px.
//
// Every icon carries an ink contour, because a HUD icon has to survive being drawn over a lit
// window, a snowfield and a void bed on three consecutive screens.

import { grid, set, get, rect, line, ellipse, disc } from './lib/pixel.js';
import { outline } from './lib/ink.js';

export const META = { group: 'Icons', blurb: '32 HUD icons at 24x24, 1:1 with the layout that draws them. Damage types are plated badges and statuses are bare glyphs, so the two families never read as each other.' };

export const LEGEND = {
  '`': null,
  o: 'IK0', O: 'IK1', c: 'IK3', C: 'IK5',                 // ink + plate
  s: 'IR1', S: 'IR3', t: 'IR5', T: 'IR6',                 // iron / steel
  g: 'GD1', G: 'GD3', k: 'GD5',                           // gold
  a: 'AQ2', A: 'AQ4', q: 'IC4', Q: 'IC5',                 // mana / frost
  p: 'BL3',                                               // blood
  x: 'EM2', X: 'EM4', f: 'EM6',                           // fire
  v: 'HX1', V: 'HX3', w: 'HX5',                           // curse / magic
  Y: 'VL1', z: 'VL3',                                     // lightning
  m: 'MS2', M: 'MS4',                                     // nature / speed
  b: 'BN1', B: 'BN4',                                     // bone
  u: 'UD2', U: 'UD4',                                     // fear
};

const S = 24, CX = 12, CY = 12;

const blank = () => grid(S, S);
const ink = g => { outline(g, 'o', { soft: 'fqQwz' }); return g; };
const still = g => ({ anchor: 'center', fps: 1, loop: true, frames: [g.px.map(r => r.join(''))] });

/** The badge a damage TYPE sits on. Statuses never get one — that is the whole distinction. */
function badge(g, fill, lit, dark) {
  for (let y = 2; y < S - 2; y++)
    for (let x = 2; x < S - 2; x++) {
      if (Math.abs(x - 11.5) > 8.6 && Math.abs(y - 11.5) > 8.6) continue;   // clipped corners
      set(g, x, y, fill);
    }
  for (let x = 3; x < S - 3; x++) { set(g, x, 2, lit); set(g, x, S - 3, dark); }
  for (let y = 3; y < S - 3; y++) { set(g, 2, y, lit); set(g, S - 3, y, dark); }
  return g;
}

/** Polygon fill — a star or a bolt drawn from explicit points beats one drawn by formula at 24 px. */
function poly(g, pts, pick) {
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) set(g, x, y, pick(x, y));
    }
  return g;
}

const starPts = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const rr = i % 2 === 0 ? r : r * 0.42;
  return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
});

const BOLT = [[14, 4], [8, 13], [12, 13], [10, 20], [17, 10], [13, 10]];

// ── resources ───────────────────────────────────────────────────────────────

const iconGold = () => ink((g => {                       // three coins, stacked and seen edge-on
  for (let i = 0; i < 3; i++) {
    const y = 17 - i * 5;
    ellipse(g, CX, y, 8, 3, 'g');
    ellipse(g, CX, y - 1, 8, 3, i === 2 ? 'k' : 'G');
    set(g, CX - 3, y - 1, 'k');
  }
  return g;
})(blank()));

const iconMana = () => ink((g => {                       // a round flask, half full, corked
  disc(g, CX, 15, 7, 's');
  disc(g, CX, 15, 6, 'a');
  for (let y = 15; y < 22; y++) for (let x = 5; x < 20; x++) if (get(g, x, y) === 'a') set(g, x, y, 'A');
  ellipse(g, CX, 15, 5, 1, 'q');                          // the meniscus
  rect(g, CX - 2, 4, 5, 6, 's');
  rect(g, CX - 3, 2, 7, 3, 'b');
  set(g, CX - 4, 13, 'Q');                                // specular
  return g;
})(blank()));

const iconGem = () => ink((g => {                        // a cut stone: crown, girdle, pavilion
  for (let y = 5; y <= 9; y++) {
    const w = 3 + (y - 5) * 2;
    for (let x = CX - w; x <= CX + w; x++) set(g, x, y, x < CX ? 'V' : 'v');
  }
  for (let y = 10; y <= 19; y++) {
    const w = Math.max(1, 9 - Math.round((y - 10) * 0.95));
    for (let x = CX - w; x <= CX + w; x++) set(g, x, y, x < CX - w * 0.3 ? 'V' : 'v');
  }
  for (let x = CX - 9; x <= CX + 9; x++) set(g, x, 10, 'w');        // the girdle catches hardest
  line(g, CX - 5, 5, CX - 9, 10, 'w'); line(g, CX + 5, 5, CX + 9, 10, 'w');
  line(g, CX - 9, 10, CX, 19, 'w');
  return g;
})(blank()));

const iconWave = () => ink((g => {                       // three chevrons, marching right
  for (let i = 0; i < 3; i++) {
    const x0 = 4 + i * 6, ch = i === 2 ? 'k' : 'G';
    for (let d = 0; d < 7; d++) {
      set(g, x0 + d, 5 + d, ch); set(g, x0 + d + 1, 5 + d, ch);
      set(g, x0 + d, 19 - d, ch); set(g, x0 + d + 1, 19 - d, ch);
    }
  }
  return g;
})(blank()));

// ── progression ─────────────────────────────────────────────────────────────

const iconStar = () => ink(poly(blank(), starPts(CX, CY, 10), (x, y) => (y < CY - 1 ? 'S' : 's')));
const iconStarFilled = () => ink(poly(blank(), starPts(CX, CY, 10), (x, y) => (y < CY - 1 ? 'k' : 'G')));
const iconStarLocked = () => ink(poly(blank(), starPts(CX, CY, 10), (x, y) => (y < CY - 1 ? 'C' : 'c')));

const iconLock = () => ink((g => {
  for (let d = 0; d < 7; d++) {                            // shackle
    const w = 6 - Math.round(d * 0.25);
    set(g, CX - w, 3 + d, 't'); set(g, CX + w, 3 + d, 's');
  }
  for (let x = CX - 6; x <= CX + 6; x++) set(g, x, 3, 't');
  rect(g, 5, 11, 15, 10, 'S');
  for (let x = 5; x < 20; x++) set(g, x, 11, 't');
  for (let y = 11; y < 21; y++) set(g, 19, y, 's');
  disc(g, CX, 15, 2, 'o'); rect(g, CX, 16, 2, 4, 'o');     // keyhole
  return g;
})(blank()));

// ── actions ─────────────────────────────────────────────────────────────────

const iconUpgradeArrow = () => ink((g => {
  for (let d = 0; d < 8; d++)
    for (let x = CX - d; x <= CX + d; x++) set(g, x, 4 + d, x < CX ? 'M' : 'm');
  rect(g, CX - 3, 12, 7, 8, 'm');
  for (let y = 12; y < 20; y++) set(g, CX - 3, y, 'M');
  return g;
})(blank()));

const iconSellCoin = () => ink((g => {
  disc(g, CX, CY, 9, 'g'); disc(g, CX, CY, 8, 'G');
  for (let y = 4; y < 21; y++) for (let x = 3; x < 21; x++)
    if (get(g, x, y) === 'G' && x + y < 22) set(g, x, y, 'k');
  rect(g, CX - 1, 7, 3, 11, 'g');                          // struck: a bar and two serifs
  rect(g, CX - 4, 9, 9, 2, 'g'); rect(g, CX - 4, 14, 9, 2, 'g');
  return g;
})(blank()));

const iconPause = () => ink((g => {
  rect(g, 6, 4, 5, 17, 't'); rect(g, 14, 4, 5, 17, 't');
  for (let y = 4; y < 21; y++) { set(g, 6, y, 'T'); set(g, 14, y, 'T'); }
  return g;
})(blank()));

const iconPlay = () => ink((g => {
  for (let d = 0; d < 18; d++) {
    const h = Math.max(0, Math.round(9 - Math.abs(d - 4) * 0.62));
    for (let k = -h; k <= h; k++) set(g, 6 + d, CY + k, d < 4 ? 'T' : 't');
  }
  return g;
})(blank()));

const iconRange = () => ink((g => {                       // a dashed ring with a centre pip
  for (let a = 0; a < 360; a += 6) {
    if ((a % 30) > 18) continue;
    const t = (a * Math.PI) / 180;
    set(g, Math.round(CX + Math.cos(t) * 10), Math.round(CY + Math.sin(t) * 10), 'M');
    set(g, Math.round(CX + Math.cos(t) * 9), Math.round(CY + Math.sin(t) * 9), 'm');
  }
  disc(g, CX, CY, 2, 'M');
  return g;
})(blank()));

const iconSpeed = () => ink((g => {                       // two chevrons plus motion lines
  for (let i = 0; i < 2; i++) {
    const x0 = 8 + i * 6;
    for (let d = 0; d < 7; d++) {
      set(g, x0 + d, 5 + d, 'q'); set(g, x0 + d + 1, 5 + d, 'q');
      set(g, x0 + d, 19 - d, 'a'); set(g, x0 + d + 1, 19 - d, 'a');
    }
  }
  for (let i = 0; i < 3; i++) rect(g, 2, 8 + i * 4, 4 - i, 2, 'A');
  return g;
})(blank()));

const iconArmor = () => ink((g => {                       // a heater shield with a boss
  for (let y = 3; y < 21; y++) {
    const t = (y - 3) / 18;
    const w = Math.round(9 * Math.sqrt(Math.max(0, 1 - t * t * 0.85)));
    for (let x = CX - w; x <= CX + w; x++) set(g, x, y, x < CX - w * 0.35 ? 't' : 'S');
  }
  for (let x = CX - 9; x <= CX + 9; x++) if (get(g, x, 4) !== '`') set(g, x, 3, 'T');
  disc(g, CX, 11, 3, 'T'); disc(g, CX, 11, 2, 'g');
  return g;
})(blank()));

// ── the six enchants ────────────────────────────────────────────────────────

const iconMeteor = () => ink((g => {
  disc(g, 15, 9, 6, 'x'); disc(g, 15, 9, 4, 'X'); disc(g, 14, 8, 2, 'f');
  for (let i = 0; i < 4; i++) {                            // trail, thrown back and up-left
    const len = 9 - i * 2;
    for (let d = 0; d < len; d++) set(g, 10 - d, 14 + i * 2 - Math.round(d * 0.4), d > len - 3 ? 'x' : 'X');
  }
  return g;
})(blank()));

const iconFear = () => ink((g => {                       // a hollow-eyed skull
  disc(g, CX, 10, 8, 'b'); disc(g, CX, 10, 7, 'B');
  rect(g, CX - 5, 16, 11, 5, 'B');
  for (let x = CX - 4; x <= CX + 4; x += 3) rect(g, x, 17, 2, 4, 'o');   // teeth gaps
  disc(g, CX - 4, 10, 2, 'o'); disc(g, CX + 3, 10, 2, 'o');
  set(g, CX - 4, 10, 'U'); set(g, CX + 3, 10, 'U');        // fear glows in the sockets
  return g;
})(blank()));

const iconFreeze = () => ink((g => {                      // a six-armed crystal
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    for (let d = 0; d < 10; d++) {
      const x = Math.round(CX + Math.cos(a) * d), y = Math.round(CY + Math.sin(a) * d);
      set(g, x, y, d > 7 ? 'Q' : 'q');
      if (d === 5 || d === 7) {                            // barbs
        set(g, Math.round(x + Math.cos(a + 1.0) * 2), Math.round(y + Math.sin(a + 1.0) * 2), 'a');
        set(g, Math.round(x + Math.cos(a - 1.0) * 2), Math.round(y + Math.sin(a - 1.0) * 2), 'a');
      }
    }
  }
  disc(g, CX, CY, 2, 'Q');
  return g;
})(blank()));

const iconGemWard = () => ink((g => {                     // the gem, inside a warding ring
  for (let a = 0; a < 360; a += 5) {
    const t = (a * Math.PI) / 180;
    set(g, Math.round(CX + Math.cos(t) * 10), Math.round(CY + Math.sin(t) * 10), a < 180 ? 'q' : 'a');
  }
  for (let y = 8; y <= 16; y++) {
    const w = Math.max(1, 5 - Math.abs(y - 11));
    for (let x = CX - w; x <= CX + w; x++) set(g, x, y, x < CX ? 'V' : 'v');
  }
  for (let x = CX - 5; x <= CX + 5; x++) set(g, x, 11, 'w');
  return g;
})(blank()));

const iconCursedTribute = () => ink((g => {               // a coin going over to the curse
  disc(g, 10, 13, 7, 'g'); disc(g, 10, 13, 6, 'G');
  for (let y = 6; y < 21; y++) for (let x = 3; x < 18; x++)
    if (get(g, x, y) === 'G' && x > 11) set(g, x, y, 'v');
  for (let i = 0; i < 6; i++) {
    const x = 16 + (i % 3) * 3, y = 5 + i * 2;
    set(g, x, y, 'V'); if (i % 2) set(g, x + 1, y - 1, 'w');
  }
  return g;
})(blank()));

const iconDarkOvercharge = () => ink((g => {              // a bolt inside a void ring
  for (let a = 0; a < 360; a += 8) {
    const t = (a * Math.PI) / 180;
    set(g, Math.round(CX + Math.cos(t) * 10), Math.round(CY + Math.sin(t) * 10), 'v');
    set(g, Math.round(CX + Math.cos(t) * 9), Math.round(CY + Math.sin(t) * 9), 'V');
  }
  poly(g, BOLT, x => (x < 12 ? 'z' : 'Y'));
  return g;
})(blank()));

// ── damage types: PLATED badges ─────────────────────────────────────────────

const typeIcon = paint => ink((g => { badge(g, 'c', 'C', 'o'); paint(g); return g; })(blank()));

const iconPhysical = () => typeIcon(g => {                // crossed sword and haft
  line(g, 6, 18, 17, 6, 't', 2);
  line(g, 5, 19, 8, 16, 'b', 2);
  line(g, 17, 18, 8, 8, 'T', 2);
  for (let d = 0; d < 4; d++) set(g, 7 + d, 7 + d, 'p');
});

const iconMagic = () => typeIcon(g => {                   // a rune-eye
  ellipse(g, CX, CY, 8, 5, 'V');
  ellipse(g, CX, CY, 6, 3, 'v');
  disc(g, CX, CY, 3, 'w'); disc(g, CX, CY, 1, 'o');
});

const iconFire = () => typeIcon(g => {                    // one flame tongue
  for (let y = 18; y > 5; y--) {
    const t = (18 - y) / 13, w = Math.round(5 * Math.sin(t * Math.PI * 0.9) + 1);
    for (let x = CX - w; x <= CX + w; x++)
      set(g, x + Math.round(t * 2), y, t > 0.65 ? 'f' : t > 0.3 ? 'X' : 'x');
  }
});

const iconFrost = () => typeIcon(g => {                   // a three-armed shard
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
    for (let d = 0; d < 8; d++)
      set(g, Math.round(CX + Math.cos(a) * d), Math.round(CY + Math.sin(a) * d), d > 5 ? 'Q' : 'q');
  }
  disc(g, CX, CY, 2, 'Q');
});

const iconLightning = () => typeIcon(g => poly(g, BOLT, x => (x < 12 ? 'z' : 'Y')));

const iconCurse = () => typeIcon(g => {                   // a hexagram bound in a ring
  for (let a = 0; a < 360; a += 8) {
    const t = (a * Math.PI) / 180;
    set(g, Math.round(CX + Math.cos(t) * 8), Math.round(CY + Math.sin(t) * 8), 'v');
  }
  for (let s = 0; s < 2; s++)
    for (let i = 0; i < 3; i++) {
      const a1 = (s * Math.PI) / 3 + (i / 3) * Math.PI * 2;
      const a2 = (s * Math.PI) / 3 + ((i + 1) / 3) * Math.PI * 2;
      line(g, CX + Math.cos(a1) * 7, CY + Math.sin(a1) * 7,
        CX + Math.cos(a2) * 7, CY + Math.sin(a2) * 7, 'V');
    }
});

// ── statuses: BARE glyphs, no plate ─────────────────────────────────────────

const iconFeared = () => ink((g => {                      // a fleeing figure, arms thrown up
  disc(g, CX, 6, 3, 'U');
  rect(g, CX - 2, 9, 5, 7, 'u');
  line(g, CX - 2, 10, CX - 7, 4, 'U', 2); line(g, CX + 2, 10, CX + 7, 4, 'U', 2);
  line(g, CX - 1, 16, CX - 5, 21, 'u', 2); line(g, CX + 1, 16, CX + 5, 21, 'u', 2);
  return g;
})(blank()));

const iconSlowed = () => ink((g => {                      // a clock, with drag lines behind it
  for (let a = 0; a < 360; a += 6) {
    const t = (a * Math.PI) / 180;
    set(g, Math.round(CX + Math.cos(t) * 9), Math.round(CY + Math.sin(t) * 9), 'a');
    set(g, Math.round(CX + Math.cos(t) * 8), Math.round(CY + Math.sin(t) * 8), 'A');
  }
  line(g, CX, CY, CX, CY - 6, 'q'); line(g, CX, CY, CX + 5, CY + 3, 'q');
  for (let i = 0; i < 3; i++) set(g, CX + 7 + i, CY + 6 + i, 'A');
  return g;
})(blank()));

const iconStunned = () => ink((g => {                     // three sparks orbiting, over a bar
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * 8), y = Math.round(9 + Math.sin(a) * 4);
    disc(g, x, y, 2, 'Y'); set(g, x, y, 'z');
  }
  rect(g, CX - 7, 18, 15, 3, 'Y');
  return g;
})(blank()));

const iconBurning = () => ink((g => {                     // two tongues, deliberately unplated
  for (const [ox, sc] of [[-4, 0.7], [3, 1.0]])
    for (let y = 20; y > 6; y--) {
      const t = (20 - y) / 14, w = Math.max(0, Math.round((5 * Math.sin(t * Math.PI * 0.9) + 1) * sc));
      for (let x = CX + ox - w; x <= CX + ox + w; x++)
        set(g, x + Math.round(t * 2), y, t > 0.7 ? 'f' : t > 0.35 ? 'X' : 'x');
    }
  return g;
})(blank()));

const iconCursed = () => ink((g => {                      // a hex mark, dripping
  for (let s = 0; s < 2; s++)
    for (let i = 0; i < 3; i++) {
      const a1 = (s * Math.PI) / 3 + (i / 3) * Math.PI * 2 - Math.PI / 2;
      const a2 = (s * Math.PI) / 3 + ((i + 1) / 3) * Math.PI * 2 - Math.PI / 2;
      line(g, CX + Math.cos(a1) * 8, 10 + Math.sin(a1) * 8,
        CX + Math.cos(a2) * 8, 10 + Math.sin(a2) * 8, s ? 'V' : 'w', 2);
    }
  for (let i = 0; i < 3; i++) {
    const x = CX - 5 + i * 5, len = 3 + (i % 2) * 3;
    for (let d = 0; d < len; d++) set(g, x, 18 + d, d === len - 1 ? 'w' : 'v');
  }
  return g;
})(blank()));

export const SPRITES = {
  icon_gold: still(iconGold()),
  icon_mana: still(iconMana()),
  icon_gem: still(iconGem()),
  icon_wave: still(iconWave()),
  icon_star: still(iconStar()),
  icon_star_filled: still(iconStarFilled()),
  icon_star_locked: still(iconStarLocked()),
  icon_lock: still(iconLock()),
  icon_upgrade_arrow: still(iconUpgradeArrow()),
  icon_sell_coin: still(iconSellCoin()),
  icon_pause: still(iconPause()),
  icon_play: still(iconPlay()),
  icon_range: still(iconRange()),
  icon_speed: still(iconSpeed()),
  icon_armor: still(iconArmor()),
  icon_meteor: still(iconMeteor()),
  icon_fear: still(iconFear()),
  icon_freeze: still(iconFreeze()),
  icon_gem_ward: still(iconGemWard()),
  icon_cursed_tribute: still(iconCursedTribute()),
  icon_dark_overcharge: still(iconDarkOvercharge()),
  icon_physical: still(iconPhysical()),
  icon_magic: still(iconMagic()),
  icon_fire: still(iconFire()),
  icon_frost: still(iconFrost()),
  icon_lightning: still(iconLightning()),
  icon_curse: still(iconCurse()),
  icon_feared: still(iconFeared()),
  icon_slowed: still(iconSlowed()),
  icon_stunned: still(iconStunned()),
  icon_burning: still(iconBurning()),
  icon_cursed: still(iconCursed()),
};
