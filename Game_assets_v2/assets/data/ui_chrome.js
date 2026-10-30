// assets/data/ui_chrome.js — panels, buttons, bars and chips, re-authored for nine-slicing.
//
// ── The bug this file exists to fix ─────────────────────────────────────────
// The old chrome was a 40×30 bitmap per style, and the HUD stretched it to whatever it needed —
// a 580×64 tower panel, a 40×44 speed toggle, a 150×38 capsule. One image cannot be all of those.
// Corners smeared, bevels sheared, and the "carved stone" edge turned into a gradient.
//
// `PixelArtAtlas.drawNine` already existed and already slices with a border of
// `min(min(w,h)/3, 12)`. Nothing had ever been *authored* for it. At **24×24 that border is
// exactly 8 px**, so every frame here is designed as a 3×3 of 8 px cells:
//
//     +----+----+----+   corners drawn once, never stretched
//     | NW | N  | NE |   N/S edges tile horizontally only
//     +----+----+----+   E/W edges tile vertically only
//     | W  | M  | E  |   M tiles both ways
//     +----+----+----+
//     | SW | S  | SE |
//     +----+----+----+
//
// So corner rivets stay round at any panel size and the bevel stays 1 px whether the panel is
// 40 wide or 580. Only the middle 8×8 tiles across a large interior, which is why it has to be
// flat and quiet — anything with a feature in it turns a big panel into wallpaper.
//
// ── The light ───────────────────────────────────────────────────────────────
// Same global NW key as everything else (D-08). A raised control is lit on its N and W edges and
// dark on S and E; a *pressed* control simply swaps them, which is the entire difference between
// `ui_button_idle` and `ui_button_press`. That is why they read as one object in two states
// rather than as two different buttons.

import { grid, set, rect, disc, line } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'UI Chrome', blurb: 'Panels, buttons, capsules, bars, wave tracks, skill nodes and chips authored as true 24x24 nine-slices, so corners never stretch and the carved bevel stays 1 px at any panel size.' };

export const LEGEND = {
  '`': null,
  o: 'IK0', c: 'IK2', C: 'IK3', d: 'IK4', D: 'IK5', e: 'IK6',   // slate, dark → light
  g: 'GD1', G: 'GD3', k: 'GD5',                            // gold rim
  s: 'IR1', t: 'IR5',                                      // iron rivets
  r: 'BL1', R: 'BL3', p: 'GR2',                            // health
  a: 'AQ1', A: 'AQ3', q: 'IC4',                            // mana
  m: 'MS2', M: 'MS4',                                      // available / go
  x: 'EM3', X: 'EM5',                                      // alert
};

const N = 24;
const still = g => ({ anchor: 'center', fps: 1, loop: true, frames: [g.px.map(r => r.join(''))] });

/** A nine-slice frame. Only the outer 8 px ring is decoration; the middle 8×8 gets tiled. */
function frame({ fill, lit, dark, rim = null, rivets = false, pressed = false, noiseSeed = 0 }) {
  const g = grid(N, N);
  const hi = pressed ? dark : lit, lo = pressed ? lit : dark;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++)
      set(g, x, y, noise(x % 8, y % 8, noiseSeed) > 0.82 ? dark : fill);
  // the carved bevel — 1 px, and only ever 1 px, because drawNine never stretches this ring
  for (let x = 0; x < N; x++) { set(g, x, 0, 'o'); set(g, x, N - 1, 'o'); }
  for (let y = 0; y < N; y++) { set(g, 0, y, 'o'); set(g, N - 1, y, 'o'); }
  for (let x = 1; x < N - 1; x++) { set(g, x, 1, hi); set(g, x, N - 2, lo); }
  for (let y = 1; y < N - 1; y++) { set(g, 1, y, hi); set(g, N - 2, y, lo); }
  if (rim) {
    for (let x = 2; x < N - 2; x++) { set(g, x, 2, rim); set(g, x, N - 3, rim); }
    for (let y = 2; y < N - 2; y++) { set(g, 2, y, rim); set(g, N - 3, y, rim); }
  }
  if (rivets) for (const [rx, ry] of [[4, 4], [N - 5, 4], [4, N - 5], [N - 5, N - 5]]) {
    disc(g, rx, ry, 2, 's'); disc(g, rx, ry, 1, 't'); set(g, rx + 1, ry + 1, 'o');
  }
  return g;
}

/** A bar: 8×8, stretched horizontally by the caller. Uniform by design, so stretching is safe. */
function bar(lo, mid, hi) {
  const g = grid(8, 8);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) set(g, x, y, y < 2 ? hi : y > 5 ? lo : mid);
  for (let x = 0; x < 8; x++) { set(g, x, 0, 'o'); set(g, x, 7, 'o'); }
  return g;
}

/** The upcoming-wave track: N boxes, so the count is readable without a label. */
function waveTrack(boxes) {
  const g = grid(boxes * 8, 16);
  for (let i = 0; i < boxes; i++) {
    const x0 = i * 8;
    rect(g, x0 + 1, 3, 6, 10, 'c');
    for (let x = x0 + 1; x < x0 + 7; x++) { set(g, x, 3, 'D'); set(g, x, 12, 'o'); }
    for (let y = 3; y < 13; y++) { set(g, x0 + 1, y, 'D'); set(g, x0 + 6, y, 'o'); }
    if (i === boxes - 1) { rect(g, x0 + 2, 4, 4, 8, 'x'); set(g, x0 + 3, 5, 'X'); }  // the boss box
  }
  return g;
}

/** A skill-tree node: a socket in three states, read from the SOCKET rather than from colour. */
function node(state) {
  const g = grid(N, N);
  disc(g, 12, 12, 11, 'o');
  disc(g, 12, 12, 10, 'C');
  disc(g, 12, 12, 9, state === 'locked' ? 'c' : 'D');
  for (let a = 0; a < 360; a += 45) {                        // eight setting claws
    const t = (a * Math.PI) / 180;
    set(g, Math.round(12 + Math.cos(t) * 10), Math.round(12 + Math.sin(t) * 10),
      state === 'mastered' ? 'k' : 's');
  }
  if (state === 'locked') {                                  // an empty socket, barred
    disc(g, 12, 12, 5, 'o'); disc(g, 12, 12, 4, 'c');
    rect(g, 6, 11, 13, 3, 'C');
  } else if (state === 'available') {                        // a lit gem waiting to be spent
    disc(g, 12, 12, 5, 'm'); disc(g, 12, 12, 3, 'M');
    set(g, 10, 10, 'M');
  } else {                                                   // mastered: gold, with rays
    disc(g, 12, 12, 6, 'g'); disc(g, 12, 12, 4, 'G'); disc(g, 12, 12, 2, 'k');
    for (let a = 0; a < 360; a += 90) {
      const t = ((a + 45) * Math.PI) / 180;
      line(g, 12 + Math.cos(t) * 6, 12 + Math.sin(t) * 6,
        12 + Math.cos(t) * 9, 12 + Math.sin(t) * 9, 'k');
    }
  }
  return g;
}

// Chrome has to sit clear of EVERY biome, and W5's void ground already occupies IK2–IK4. A panel
// filled at IK2 was almost black and would have disappeared into the Shadow Realm entirely — it
// looked fine on grass, which is exactly how that kind of mistake survives. The whole set is
// lifted so the darkest chrome value is still a step above the darkest ground.
const SLATE = { fill: 'd', lit: 'D', dark: 'o' };

export const SPRITES = {
  // ── nine-slice frames (24×24 → an exact 8 px border) ─────────────────────
  ui_panel: still(frame({ ...SLATE, rivets: true, noiseSeed: 3 })),
  ui_panel_gold: still(frame({ ...SLATE, rim: 'g', rivets: true, noiseSeed: 5 })),
  ui_button_idle: still(frame({ fill: 'D', lit: 'e', dark: 'c', noiseSeed: 7 })),
  ui_button_hover: still(frame({ fill: 'e', lit: 'e', dark: 'D', rim: 'G', noiseSeed: 7 })),
  // pressed is the SAME object with its bevel inverted — that is the whole state change
  ui_button_press: still(frame({ fill: 'C', lit: 'D', dark: 'o', pressed: true, noiseSeed: 7 })),
  // a tooltip OVERLAYS content, so it is the one frame allowed to be darker than the chrome set
  ui_tooltip: still(frame({ fill: 'c', lit: 'C', dark: 'o', rim: 'g', noiseSeed: 11 })),
  ui_banner_plate: still(frame({ fill: 'D', lit: 'e', dark: 'o', rim: 'k', rivets: true, noiseSeed: 13 })),
  ui_resource_capsule: still(frame({ fill: 'C', lit: 'D', dark: 'o', noiseSeed: 17 })),

  // ── bars ─────────────────────────────────────────────────────────────────
  ui_bar_health: still(bar('r', 'R', 'p')),
  ui_bar_health_drain: still(bar('o', 'r', 'R')),
  ui_bar_health_empty: still(bar('o', 'C', 'd')),
  ui_bar_mana: still(bar('a', 'A', 'q')),
  ui_bar_mana_drain: still(bar('o', 'a', 'A')),
  ui_bar_mana_empty: still(bar('o', 'C', 'd')),

  // ── wave track ───────────────────────────────────────────────────────────
  ui_wave_track_7: still(waveTrack(7)),
  ui_wave_track_9: still(waveTrack(9)),
  ui_wave_track_11: still(waveTrack(11)),
  ui_wave_track_13: still(waveTrack(13)),
  ui_wave_track_15: still(waveTrack(15)),

  // ── skill nodes + chips ──────────────────────────────────────────────────
  ui_node_locked: still(node('locked')),
  ui_node_available: still(node('available')),
  ui_node_mastered: still(node('mastered')),
  ui_chip_close: still((g => {
    disc(g, 12, 12, 10, 'o'); disc(g, 12, 12, 9, 'C'); disc(g, 12, 12, 8, 'c');
    line(g, 7, 7, 16, 16, 'x', 2); line(g, 16, 7, 7, 16, 'x', 2);
    line(g, 7, 7, 16, 16, 'X'); line(g, 16, 7, 7, 16, 'X');
    return g;
  })(grid(N, N))),
  ui_chip_confirm: still((g => {
    disc(g, 12, 12, 10, 'o'); disc(g, 12, 12, 9, 'C'); disc(g, 12, 12, 8, 'c');
    line(g, 6, 12, 10, 17, 'm', 2); line(g, 10, 17, 18, 7, 'm', 2);
    line(g, 6, 12, 10, 17, 'M'); line(g, 10, 17, 18, 7, 'M');
    return g;
  })(grid(N, N))),
};
