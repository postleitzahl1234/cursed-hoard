// assets/data/worldmap.js — the 30 overworld pieces: 25 level nodes plus 5 shared markers.
//
// 40×40. These sit on the campaign map, the screen a player sees between every level, so they
// carry one job: **state before flavour.**
//
// ── State reads from the SETTING, not from the colour ───────────────────────
// A node is a medallion in a socket, and whether it is locked, open or beaten is read from the
// metal around the stone — an empty socket with a bar across it, a plain iron claw setting, or a
// gold setting with rays. Same convention as the skill-tree nodes in ui_chrome.js, deliberately.
// Colour changes too, but colour is the second signal.
//
// ── World identity, and how levels within a world differ ────────────────────
// The stone in the middle carries the biome; the notches on the rim carry the level number. Five
// grassland nodes are visibly one family and visibly five different levels, without a digit
// anywhere — which matters, because a bitmap digit at 40 px is four pixels tall and unreadable.
//
// Each world's boss level (L5) breaks its own rim with spikes. "This one is different" is the
// single most useful thing an overworld screen can tell you.

import { grid, set, get, disc, line, rect } from './lib/pixel.js';
import { outline } from './lib/ink.js';
import { noise } from './lib/shade.js';

export const META = { group: 'Overworld', blurb: '25 level medallions plus 5 shared markers at 40x40. Lock state reads from the metal setting, world from the stone, level from countable rim notches, and every boss level breaks its own rim.' };

export const LEGEND = {
  '`': null,
  o: 'IK0', c: 'IK3', C: 'IK5',                             // ink + shadow
  s: 'IR1', S: 'IR3', t: 'IR5', T: 'IR6',                   // iron setting
  g: 'GD1', G: 'GD3', k: 'GD5',                             // gold setting
  // one stone per world
  1: 'MS1', 2: 'MS3', 3: 'MS5',                             // W1 grass
  4: 'IC1', 5: 'IC3', 6: 'IC5',                             // W2 ice
  7: 'SD2', 8: 'SD4', 9: 'SD6',                             // W3 sand
  a: 'BR2', b: 'BR4', d: 'GD4',                             // W4 brass
  e: 'HX1', f: 'HX3', h: 'HX5',                             // W5 hex
  n: 'BN2', N: 'BN5',                                       // signboard
  w: 'WD1', W: 'WD3',                                       // timber
  r: 'BL2', R: 'GR2',                                       // banner cloth
};

const S = 40, CX = 20, CY = 20;
const still = g => ({ anchor: 'center', fps: 1, loop: true, frames: [g.px.map(r => r.join(''))] });
const blank = () => grid(S, S);

const STONE = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['a', 'b', 'd'], ['e', 'f', 'h']];

/**
 * @param world 0..4
 * @param level 0..4 — drives the rim notch count; at 4 the rim also grows spikes
 * @param state 'locked' | 'open' | 'beaten'
 */
function nodeSprite(world, level, state) {
  const g = blank();
  const [lo, mid, hi] = STONE[world];
  const setting = state === 'beaten' ? ['g', 'G', 'k'] : ['s', 'S', 't'];

  // the setting: an outer ring of metal, lit on its NW arc
  disc(g, CX, CY, 15, 'o');
  disc(g, CX, CY, 14, setting[1]);
  disc(g, CX, CY, 12, setting[0]);
  for (let a = 150; a < 300; a += 4) {
    const t = (a * Math.PI) / 180;
    set(g, Math.round(CX + Math.cos(t) * 13), Math.round(CY + Math.sin(t) * 13), setting[2]);
  }

  // rim notches: one per level, so the level is countable without a digit
  for (let i = 0; i <= level; i++) {
    const a = -Math.PI / 2 + (i - level / 2) * 0.55;
    const x = Math.round(CX + Math.cos(a) * 14), y = Math.round(CY + Math.sin(a) * 14);
    disc(g, x, y, 2, setting[2]); set(g, x, y, state === 'beaten' ? 'k' : 'T');
  }

  // the boss rim
  if (level === 4) for (let a = 0; a < 360; a += 45) {
    const t = (a * Math.PI) / 180;
    for (let d = 0; d < 5; d++) {
      const r = 14 + d, w = d > 2 ? 0 : 1;
      for (let k = -w; k <= w; k++)
        set(g, Math.round(CX + Math.cos(t) * r + Math.cos(t + 1.57) * k),
          Math.round(CY + Math.sin(t) * r + Math.sin(t + 1.57) * k), d > 3 ? setting[2] : setting[1]);
    }
  }

  if (state === 'locked') {
    disc(g, CX, CY, 10, 'o'); disc(g, CX, CY, 9, 'c');        // an empty socket
    rect(g, CX - 12, CY - 2, 25, 5, 'S');                      // barred across
    for (let x = CX - 12; x < CX + 13; x++) set(g, x, CY - 2, 'T');
  } else {
    for (let y = CY - 10; y <= CY + 10; y++)
      for (let x = CX - 10; x <= CX + 10; x++) {
        if (Math.hypot(x - CX, y - CY) > 10) continue;
        const l = (CX - x) * 0.05 + (CY - y) * 0.06 + noise(x, y, 7 + world) * 0.25;
        set(g, x, y, l > 0.3 ? hi : l > 0 ? mid : lo);
      }
    // a facet cross, so the stone reads as cut rather than as a coloured disc
    for (let d = -9; d <= 9; d++) {
      if (get(g, CX + d, CY) !== '`') set(g, CX + d, CY, mid);
      if (get(g, CX, CY + d) !== '`') set(g, CX, CY + d, mid);
    }
    set(g, CX - 4, CY - 4, hi); set(g, CX - 3, CY - 5, hi);    // the catch-light
    if (state === 'beaten') for (let a = 0; a < 360; a += 90) {
      const t = ((a + 45) * Math.PI) / 180;
      line(g, CX + Math.cos(t) * 16, CY + Math.sin(t) * 16,
        CX + Math.cos(t) * 19, CY + Math.sin(t) * 19, 'k');
    }
  }
  outline(g, 'o', { soft: 'k' });
  return g;
}

// ── the five shared markers ─────────────────────────────────────────────────

/** Three stars on a ribbon — the "fully cleared" flag. Not a node, so it is not a medallion. */
const nodeStar3 = () => {
  const g = blank();
  const star = (cx, cy, r) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 === 0 ? r : r * 0.42;
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    });
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        let inside = false;
        for (let i = 0, j = 9; i < 10; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) set(g, x, y, y < cy ? 'k' : 'G');
      }
  };
  rect(g, 4, 24, 33, 6, 'r');                                  // the ribbon behind them
  for (let x = 4; x < 37; x++) set(g, x, 24, 'R');
  star(11, 19, 7); star(29, 19, 7);
  star(20, 15, 9);                                             // the middle one sits proud
  outline(g, 'o', { soft: 'k' });
  return g;
};

/** A signpost — the trailhead marker. */
const nodeSignpost = () => {
  const g = blank();
  for (let y = 12; y < 36; y++) {
    for (let x = 18; x <= 21; x++) set(g, x, y, x < 20 ? 'W' : 'w');
    if (y % 5 === 0) set(g, 18, y, 'w');
  }
  for (const [y, dir] of [[12, 1], [21, -1]]) {                 // two arms, pointing apart
    const x0 = dir > 0 ? 20 : 6;
    rect(g, x0, y, 14, 7, 'n');
    for (let x = x0; x < x0 + 14; x++) set(g, x, y, 'N');
    const tip = dir > 0 ? x0 + 13 : x0;
    for (let d = 0; d < 4; d++) { set(g, tip + dir * d, y + 3 - d, 'n'); set(g, tip + dir * d, y + 3 + d, 'n'); }
    for (let i = 0; i < 4; i++) set(g, x0 + 3 + i * 2, y + 3, 'W');    // lettering, as marks
  }
  for (let x = 14; x < 26; x++) set(g, x, 36, 'c');             // its shadow
  outline(g, 'o', {});
  return g;
};

/** A hanging banner — the world header. */
const nodeBanner = () => {
  const g = blank();
  for (let x = 3; x < 37; x++) { set(g, x, 5, 'W'); set(g, x, 6, 'w'); }   // the rail
  for (let y = 7; y < 32; y++)
    for (let x = 7; x < 33; x++) set(g, x, y, noise(x, y, 3) > 0.7 ? 'R' : 'r');
  for (let d = 0; d < 6; d++)                                   // the swallowtail hem
    for (let x = 7 + d; x < 33 - d; x++) if ((x - 7) % 13 < 13 - d * 2) set(g, x, 32 + d, 'r');
  for (let y = 7; y < 32; y++) { set(g, 7, y, 'R'); set(g, 32, y, 'o'); }
  for (let x = 10; x < 30; x++) { set(g, x, 12, 'k'); set(g, x, 26, 'k'); }
  disc(g, 20, 19, 5, 'k'); disc(g, 20, 19, 3, 'G');
  outline(g, 'o', { soft: 'k' });
  return g;
};

const WORLD_KEY = ['grasslands', 'mountains', 'sand', 'gardens', 'shadow'];

export const SPRITES = {
  node_unlocked: still(nodeSprite(0, 0, 'open')),
  node_locked: still(nodeSprite(0, 0, 'locked')),
  node_star3: still(nodeStar3()),
  node_signpost: still(nodeSignpost()),
  node_banner: still(nodeBanner()),
};
WORLD_KEY.forEach((wk, w) => {
  for (let l = 0; l < 5; l++) SPRITES[`node_${wk}_l${l + 1}`] = still(nodeSprite(w, l, 'open'));
});
