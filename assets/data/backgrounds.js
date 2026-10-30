// assets/data/backgrounds.js — the 12 screen backdrops, plus the load bar and the splash.
//
// 128×72 — deliberately a *tenth* of the 1280×720 screen, and deliberately the ONLY art in this
// project that is authored below its draw size.
//
// ── Why this one family breaks the 1:1 rule ─────────────────────────────────
// Everything else here is 1:1 because a resampled sprite loses its pixel grid. A background has
// the opposite requirement: it must sit *behind* text and panels without competing, so it wants
// to be soft, and it is stretched 10× to a full screen where any authored detail would be a
// 10 px blob anyway. Painting a 1280×720 backdrop by hand would be 92,000 pixels of work to
// produce something that must not be looked at.
//
// So these are composed as **value fields and horizons** rather than as pictures: a sky ramp, a
// silhouetted skyline, a ground band, one light source. At 10× that reads as depth. The rule
// that replaces 1:1 here is: **nothing brighter than the UI chrome, and no hard edge above the
// horizon**, so the menus always win the foreground.
//
// The two loading-bar pieces and the splash title are the exceptions inside the exception — they
// carry real edges, because they are read rather than looked past.

import { grid, set, get, rect, disc, line } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'Backgrounds', blurb: '12 backdrops at 128x72 composed as value fields and horizons rather than pictures, so they stretch to full screen as depth and never compete with the menus in front of them.' };

export const LEGEND = {
  '`': null,
  o: 'IK0', O: 'IK1', c: 'IK2', C: 'IK3', d: 'IK4', D: 'IK5', e: 'IK6',    // night ramp
  u: 'UD0', U: 'UD2', v: 'UD4',                             // dusk violet
  g: 'GD1', G: 'GD3', k: 'GD5',                             // gold light
  m: 'MS0', M: 'MS2', n: 'MS4',                             // grass
  i: 'IC0', I: 'IC2', q: 'IC4',                             // ice
  s: 'SD1', S: 'SD3', b: 'SD5',                             // sand
  a: 'AQ1', A: 'AQ3',                                       // water
  h: 'HX0', H: 'HX2', w: 'HX4',                             // hex
  r: 'BR1', R: 'BR3',                                       // brass
  x: 'EM2', X: 'EM4',                                       // ember
  t: 'IR2', T: 'IR5',                                       // iron
};

const W = 128, H = 72;
const still = g => ({ anchor: 'center', fps: 1, loop: true, frames: [g.px.map(r => r.join(''))] });
const blank = () => grid(W, H);

/** A vertical sky ramp with a soft dither between bands — no hard edge anywhere above the horizon. */
function sky(g, bands, horizon) {
  for (let y = 0; y < horizon; y++) {
    const t = y / horizon;
    const i = Math.min(bands.length - 1, Math.floor(t * bands.length));
    const nx = t * bands.length - i;
    for (let x = 0; x < W; x++) {
      const jitter = noise(x, y, 3) < nx * 0.5 && i + 1 < bands.length;
      set(g, x, y, bands[jitter ? i + 1 : i]);
    }
  }
  return g;
}

/** A silhouetted skyline. `profile(x)` returns the height above the horizon. */
function skyline(g, horizon, profile, ch, ch2) {
  for (let x = 0; x < W; x++) {
    const h = Math.max(0, Math.round(profile(x)));
    for (let d = 0; d < h; d++) set(g, x, horizon - d, d > h - 3 ? ch2 : ch);
  }
  return g;
}

/** The ground band below the horizon — always the darkest thing, so the eye stays up. */
function ground(g, horizon, lo, hi) {
  for (let y = horizon; y < H; y++)
    for (let x = 0; x < W; x++) {
      const t = (y - horizon) / (H - horizon);
      set(g, x, y, noise(x, y, 7) > 0.75 - t * 0.3 ? hi : lo);
    }
  return g;
}

/** One light source, low and warm. Depth at this scale is a light and a horizon, nothing more. */
function glow(g, cx, cy, r, ramp) {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.5) / r;
      if (d > 1) continue;
      if (noise(x, y, 11) < d * 0.9) continue;
      set(g, x, y, d < 0.3 ? ramp[2] : d < 0.65 ? ramp[1] : ramp[0]);
    }
  return g;
}

// ── the screens ─────────────────────────────────────────────────────────────

/** Menu: a ruined keep on a ridge at dusk, the game's establishing shot. */
const bgMenu = () => {
  const g = sky(blank(), ['o', 'c', 'u', 'U', 'v'], 44);
  glow(g, 92, 42, 26, ['u', 'U', 'v']);
  skyline(g, 44, x => 6 + Math.sin(x * 0.06) * 4 + noise(Math.floor(x / 7), 0, 5) * 5, 'O', 'c');
  // the keep: the one hard shape, and it is off-centre so the title has the middle
  for (let x = 22; x < 44; x++) {
    const h = x < 28 ? 22 : x < 34 ? 30 : 24;
    for (let d = 0; d < h; d++) set(g, x, 44 - d, 'o');
  }
  for (let x = 22; x < 44; x += 3) { set(g, x, 44 - (x < 28 ? 22 : x < 34 ? 30 : 24) - 1, 'o'); }
  for (const [x, y] of [[26, 32], [31, 26], [38, 34], [40, 30]]) { set(g, x, y, 'k'); set(g, x + 1, y, 'g'); }
  return ground(g, 44, 'o', 'O');
};

/** Settings: the same world, flatter and colder — a workbench, not a vista. */
const bgSettings = () => {
  const g = sky(blank(), ['o', 'c', 'C', 'd'], 40);
  skyline(g, 40, x => 4 + noise(Math.floor(x / 5), 1, 9) * 6, 'O', 'c');
  for (let y = 8; y < 34; y += 8)                              // faint schematic rules
    for (let x = 0; x < W; x += 2) set(g, x, y, 'c');
  return ground(g, 40, 'o', 'C');
};

/** Almanac: a library — shelves in silhouette, one lamp. */
const bgAlmanac = () => {
  const g = blank();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) set(g, x, y, noise(x, y, 13) > 0.8 ? 'c' : 'o');
  for (let sy = 8; sy < H - 8; sy += 16) {                     // shelves of books
    for (let x = 4; x < W - 4; x++) {
      const h = 8 + Math.round(noise(x, sy, 17) * 4);
      for (let d = 0; d < h; d++) set(g, x, sy + 12 - d, noise(x, 0, 19) > 0.5 ? 'C' : 'c');
    }
    for (let x = 4; x < W - 4; x++) set(g, x, sy + 13, 'O');   // the shelf board
  }
  return glow(g, 104, 20, 20, ['g', 'G', 'k']);
};

/** Loading: almost nothing. Anything interesting here is looked at for half a second. */
const bgLoading = () => {
  const g = sky(blank(), ['o', 'c', 'C'], H);
  return glow(g, 64, 60, 34, ['c', 'C', 'd']);
};

/** The five level-select backdrops: the same composition, one per biome. */
const levelSelect = (bands, hill, gLo, gHi, lamp) => () => {
  const g = sky(blank(), bands, 42);
  skyline(g, 42, x => 5 + Math.sin(x * 0.05 + 1) * 5 + noise(Math.floor(x / 6), 2, 23) * 4, 'O', 'c');
  ground(g, 42, gLo, gHi);
  return lamp ? glow(g, 100, 38, 22, lamp) : g;
};

const bgGrass = levelSelect(['o', 'c', 'C', 'd', 'D'], 0, 'm', 'M', ['m', 'M', 'n']);
const bgMountains = levelSelect(['o', 'c', 'C', 'i', 'I'], 0, 'i', 'I', ['i', 'I', 'q']);
const bgSand = levelSelect(['o', 'u', 'U', 'g', 'G'], 0, 's', 'S', ['g', 'G', 'k']);
const bgGardens = levelSelect(['o', 'c', 'C', 'D', 'e'], 0, 'm', 'M', ['r', 'R', 'k']);
const bgShadow = levelSelect(['o', 'o', 'c', 'h', 'H'], 0, 'o', 'c', ['h', 'H', 'w']);

// ── the exceptions: things that are read, not looked past ───────────────────

/** The load-bar frame — a real edge, because the player is watching it. */
const loadbarFrame = () => {
  const g = blank();
  rect(g, 0, 28, W, 16, 'c');
  for (let x = 0; x < W; x++) { set(g, x, 28, 'o'); set(g, x, 43, 'o'); set(g, x, 29, 'D'); }
  for (const x of [0, W - 1]) for (let y = 28; y < 44; y++) set(g, x, y, 'o');
  for (let x = 4; x < W - 4; x += 8) { set(g, x, 31, 'C'); set(g, x, 41, 'C'); }   // tick marks
  return g;
};

/** The load-bar fill — uniform on purpose, because the caller clips it by fraction. */
const loadbarFill = () => {
  const g = blank();
  for (let y = 30; y < 42; y++)
    for (let x = 0; x < W; x++) set(g, x, y, y < 33 ? 'k' : y > 39 ? 'g' : 'G');
  return g;
};

/** Splash: the crown over the hoard. The one image in this file allowed to be the subject. */
const splashTitle = () => {
  const g = sky(blank(), ['o', 'o', 'c', 'u'], H);
  glow(g, 64, 52, 34, ['u', 'U', 'v']);
  // the hoard
  for (let i = 0; i < 24; i++) {
    const x = 34 + Math.round(noise(i, 1, 29) * 60);
    const y = 52 + Math.round(noise(i, 2, 31) * 12);
    disc(g, x, y, 2, 'G'); set(g, x, y, 'k');
  }
  for (let x = 30; x < 98; x++) set(g, x, 64, 'g');
  // the crown above it
  for (let x = 48; x < 80; x++) set(g, x, 40, 'k');
  for (let x = 48; x < 80; x++) set(g, x, 41, 'G');
  for (const [cx, h] of [[52, 8], [64, 13], [76, 8]]) {
    for (let d = 0; d < h; d++) {
      const w = Math.max(0, 3 - Math.round((d / h) * 3));
      for (let dx = -w; dx <= w; dx++) set(g, cx + dx, 40 - d, d > h - 3 ? 'k' : 'G');
    }
    disc(g, cx, 40 - h - 1, 2, 'w');                            // a hexed jewel on each point
  }
  for (let x = 48; x < 80; x += 6) { set(g, x, 43, 'w'); set(g, x, 44, 'H'); }
  return g;
};

export const SPRITES = {
  bg_menu: still(bgMenu()),
  bg_settings: still(bgSettings()),
  bg_almanac: still(bgAlmanac()),
  bg_loading: still(bgLoading()),
  bg_level_select_grasslands: still(bgGrass()),
  bg_level_select_mountains: still(bgMountains()),
  bg_level_select_sand: still(bgSand()),
  bg_level_select_gardens: still(bgGardens()),
  bg_level_select_shadow: still(bgShadow()),
  chrome_loadbar_frame: still(loadbarFrame()),
  chrome_loadbar_fill: still(loadbarFill()),
  splash_title: still(splashTitle()),
};
