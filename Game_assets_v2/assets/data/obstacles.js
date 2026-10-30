// assets/data/obstacles.js — the ten lane-blockers, re-authored at 1× density.
//
// 40×52, which is exactly the size `CursedHoardGame.drawTiledPlayfield` draws them at, so nothing
// is resampled. The old set was 48×48 at 2× density and reached the screen through a resize.
//
// ── The rule these ten exist to obey ────────────────────────────────────────
// D-28's bar is silhouette. Ten species differing only in leaf colour are one tree in ten
// palettes — failure F1 from REVIEW.md §2 (the shared rig) wearing a different hat. So each is
// separated by **mass**, the lesson learned on the Crypt towers and re-applied to the W3 troops,
// never by props:
//
//   oak           broad lumpy dome on a short thick bole
//   birch         narrow upright spindle, pale barred bark
//   willow        a curtain — the canopy hangs BELOW its own attachment line
//   pine          tall stepped triangle, tiers you can count
//   ashwood       dead: skeletal branching, almost no mass at all
//   palm          bare tall stem, mass only at the very top, radiating
//   blossom       a wide low umbrella, wider than it is tall
//   hexwood       asymmetric claw leaning off one side of its own trunk
//   jungle_giant  buttressed base, flat canopy at the very top of the frame
//   bramble       no trunk whatsoever — a low wide tangle
//
// Read as black shapes these are varied, but be honest about how varied: see the measured
// figures in redesign/PLAYFIELD.md §7. Five broadleaf crowns on one 40x52 canvas overlap by
// construction, and the 35% bar D-28 sets is a *unit* bar — it exists because a player must tell
// a healer from a tank at a glance. Scenery does not carry that load. The footprints below were
// still pushed apart until the worst pair came down substantially, because "the bar does not
// apply" is an argument that gets abused the moment it is accepted without a number beside it.
//
// ── The trunk/canopy band ───────────────────────────────────────────────────
// The engine draws each tree twice: `drawVBand(..., 0, 0.42)` for every trunk, then
// `drawVBand(..., 0.42, 1)` for every canopy, so overlapping treetops never sit behind a
// neighbour's trunk. The split is at 42% of the height measured from the bottom, so on this
// 52 px canvas the trunk band is rows 31…51 and the canopy band is rows 0…30. Anything a species
// wants read as canopy has to live above row 31 — which is why the willow's strands stop where
// they do, and why the bramble having no trunk lets a thicket overlap its neighbours properly.

import { set, line } from './lib/pixel.js';
import { noise } from './lib/shade.js';
import { bark, leaves, ground, still, blank } from './lib/structure.js';

export const META = { group: 'Obstacles', blurb: 'Ten lane-blockers at 1x density, separated by mass rather than palette: broad oak, spindle birch, weeping willow, tiered pine, dead ash, bare-stemmed palm, low blossom umbrella, leaning hexwood claw, buttressed jungle giant and a trunkless bramble.' };

export const LEGEND = {
  '`': null,
  // trunks
  w: 'WD1', W: 'WD3', e: 'WD4', r: 'WD0',                 // ordinary bark
  b: 'BN2', B: 'BN4', n: 'BN0',                           // birch bark — pale, but not glowing.
                                                          // At BN3/BN5 a stand of birch was the
                                                          // brightest thing on the map, brighter
                                                          // than the units it stands behind.
  k: 'IK1', K: 'IK3',                                     // dead / charred wood
  u: 'UD0', U: 'UD2', v: 'HX2',                           // hexwood
  // canopies
  g: 'MS1', G: 'MS3', h: 'MS4',                           // broad-leaf green
  p: 'PN1', P: 'PN3', q: 'PN4',                           // needle green
  j: 'GN1', J: 'GN3', l: 'GB3', L: 'GB5',                 // jungle / palm frond
  y: 'GD4',                                               // autumn catch
  f: 'BL2', F: 'BL4', z: 'DM3',                           // blossom pink
  x: 'HX1', X: 'HX3',                                     // hex foliage
  m: 'GN0',                                               // deep shade inside a mass
  // ground
  '!': 'SH1', ';': 'SH0',
};

const W = 40, H = 52, CX = 20, BASE = H - 2;

const ell = (cx, cy, rx, ry, wob = 0, seed = 0) => (x, y) => {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1 + (wob ? (noise(Math.floor(x / 3), Math.floor(y / 3), seed) - 0.5) * wob : 0);
};
const union = (...fs) => (x, y) => fs.some(f => f(x, y));

function tree(paint) {
  const g = blank(W, H);
  paint(g);
  ground(g, CX, 13, BASE + 1, '!', ';');
  return g;
}

// ── the ten ─────────────────────────────────────────────────────────────────

const oak = () => tree(g => {
  bark(g, CX - 4, 22, 8, BASE - 21, ['w', 'W', 'e'], 3);
  for (const [dx, dy] of [[-6, 19], [6, 20]]) line(g, CX, 25, CX + dx, dy, 'w', 2);
  // three overlapping lobes: a dome made of one ellipse is a lollipop
  leaves(g, union(ell(CX - 9, 14, 12, 8, 0.5, 7), ell(CX + 9, 12, 12, 8, 0.5, 11),
    ell(CX, 19, 15, 6, 0.5, 19)), ['g', 'G'], 23, 'h');
});

const birch = () => tree(g => {
  // Narrow and upright, but a TREE: the first pass ran the trunk from row 14 to the base with a
  // 7-wide canopy on top and a stand of them read as a field of maize. A spindle is still mostly
  // crown — it is the crown's proportion that is narrow, not the crown's share of the shape.
  bark(g, CX - 2, 24, 5, BASE - 23, ['n', 'b', 'B'], 5);
  for (let y = 26; y < BASE; y += 4)                       // the bars are the species
    if (noise(y, 1, 9) > 0.35) { set(g, CX - 2, y, 'k'); set(g, CX - 1, y, 'k'); }
  leaves(g, union(ell(CX, 11, 6, 11, 0.45, 31), ell(CX + 1, 19, 4, 5, 0.5, 37)), ['g', 'G'], 41, 'y');
});

const willow = () => tree(g => {
  bark(g, CX - 3, 22, 7, BASE - 21, ['w', 'W', 'e'], 13);
  leaves(g, ell(CX, 9, 10, 6, 0.4, 47), ['m', 'g'], 53, 'G');
  // the strands: this canopy hangs BELOW where it attaches, which no other tree here does
  for (let x = CX - 16; x <= CX + 16; x += 2) {
    const len = 8 + Math.floor(noise(x, 3, 59) * 12);
    const top = 13 + Math.floor(noise(x, 7, 61) * 4);
    for (let d = 0; d < len && top + d < 31; d++)
      set(g, x + (d > len - 3 ? 1 : 0), top + d, d > len - 4 ? 'm' : noise(x, d, 67) > 0.5 ? 'g' : 'G');
  }
});

const pine = () => tree(g => {
  bark(g, CX - 3, 34, 6, BASE - 33, ['r', 'w', 'W'], 17);
  for (let t = 0; t < 4; t++) {                            // tiers you can count
    const top = 2 + t * 8, half = 5 + t * 3.6;
    for (let y = top; y < top + 11 && y < 36; y++) {
      const wdt = Math.round(half * ((y - top) / 11));
      for (let x = CX - wdt; x <= CX + wdt; x++) {
        const n = noise(x, y, 71 + t);
        set(g, x, y, x < CX - wdt * 0.35 && n > 0.4 ? 'q' : n > 0.55 ? 'P' : 'p');
      }
    }
  }
});

const ashwood = () => tree(g => {
  // Dead: the design IS the absence of mass. Nothing else in the set is see-through.
  bark(g, CX - 3, 20, 6, BASE - 19, ['k', 'K', 'r'], 23);
  const limb = (x0, y0, a, len, d) => {
    let x = x0, y = y0;
    for (let s = 0; s < len; s++) {
      set(g, Math.round(x), Math.round(y), s > len * 0.6 ? 'k' : 'K');
      x += Math.cos(a); y += Math.sin(a);
      if (d > 0 && s === Math.floor(len * 0.55)) {
        limb(x, y, a - 0.6, len * 0.55, d - 1);
        limb(x, y, a + 0.55, len * 0.5, d - 1);
      }
    }
  };
  limb(CX, 22, -2.3, 13, 2);
  limb(CX, 20, -0.85, 14, 2);
  limb(CX, 26, -2.55, 10, 1);
});

const palm = () => tree(g => {
  // A bare stem with mass only at the very top — the one tree whose middle is empty.
  for (let y = 12; y <= BASE; y++) {
    const lean = Math.round(Math.sin((y - 12) / 30) * 3);
    bark(g, CX + lean - 2, y, 4, 1, ['w', 'W', 'e'], 29);
    if (y % 3 === 0) set(g, CX + lean - 2, y, 'r');
  }
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    for (let s = 0; s < 15; s++) {
      const droop = (s / 15) * (s / 15) * 5;
      const px = Math.round(CX + 3 + Math.cos(a) * s), py = Math.round(12 + Math.sin(a) * s * 0.45 + droop);
      set(g, px, py, s < 4 ? 'j' : s < 10 ? 'J' : 'l');
      set(g, px, py + 1, 'j');
      if (s % 2 === 0) set(g, px, py - 1, s < 8 ? 'L' : 'J');
    }
  }
});

const blossom = () => tree(g => {
  // Wider than it is tall, and low — an umbrella. The only tree with that proportion.
  bark(g, CX - 2, 30, 5, BASE - 29, ['r', 'w', 'W'], 31);
  for (const [dx, dy] of [[-7, 27], [7, 28]]) line(g, CX, 32, CX + dx, dy, 'w', 1);
  leaves(g, union(ell(CX, 26, 19, 5, 0.35, 79), ell(CX - 9, 23, 9, 4, 0.4, 83),
    ell(CX + 9, 23, 9, 4, 0.4, 89)), ['z', 'f'], 97, 'F');
});

const hexwood = () => tree(g => {
  // Asymmetric: the whole mass leans off one side of its own trunk. Nothing else does.
  bark(g, CX - 3, 18, 6, BASE - 17, ['u', 'U', 'v'], 37);
  const claw = (x0, y0, a, len) => {
    let x = x0, y = y0, ang = a;
    for (let s = 0; s < len; s++) {
      set(g, Math.round(x), Math.round(y), 'U');
      set(g, Math.round(x), Math.round(y) - 1, 'v');
      ang += 0.16; x += Math.cos(ang) * 1.1; y += Math.sin(ang) * 1.1;
    }
  };
  claw(CX, 20, -2.9, 12);
  claw(CX + 1, 24, -2.5, 10);
  leaves(g, union(ell(CX - 11, 14, 9, 7, 0.55, 101), ell(CX - 6, 7, 6, 5, 0.5, 103)), ['x', 'X'], 107, 'v');
});

const jungleGiant = () => tree(g => {
  // Buttressed: the trunk flares hard at the base and the canopy is flat and at the very top.
  bark(g, CX - 5, 16, 10, BASE - 15, ['r', 'w', 'W'], 41);
  for (let d = 0; d < 9; d++) {
    const spread = Math.round((9 - d) * 0.9);
    bark(g, CX - 5 - spread, BASE - d, 10 + spread * 2, 1, ['r', 'w', 'W'], 41);
  }
  leaves(g, union(ell(CX, 5, 19, 5, 0.35, 109), ell(CX - 11, 8, 8, 3, 0.4, 113),
    ell(CX + 12, 7, 8, 3, 0.4, 127)), ['m', 'j'], 131, 'J');
});

const bramble = () => tree(g => {
  // No trunk at all. Its trunk band holds only thorn canes, so almost the whole thicket draws in
  // the canopy pass — which is exactly how a bramble should overlap the tree beside it.
  leaves(g, union(ell(CX - 7, 34, 11, 9, 0.6, 137), ell(CX + 7, 33, 11, 9, 0.6, 139),
    ell(CX, 27, 10, 7, 0.6, 149)), ['m', 'g'], 151, 'G');
  for (let i = 0; i < 16; i++) {                            // thorn canes breaking the outline
    const a = (i / 16) * Math.PI * 2;
    const x0 = CX + Math.cos(a) * 9, y0 = 32 + Math.sin(a) * 7;
    for (let s = 0; s < 6; s++) {
      const px = Math.round(x0 + Math.cos(a) * s), py = Math.round(y0 + Math.sin(a) * s * 0.7);
      if (py < 20 || py > BASE) continue;
      set(g, px, py, s > 3 ? 'k' : 'w');
    }
  }
});

export const SPRITES = {
  obstacle_tree_oak: still(oak()),
  obstacle_tree_birch: still(birch()),
  obstacle_tree_willow: still(willow()),
  obstacle_tree_pine: still(pine()),
  obstacle_tree_ashwood: still(ashwood()),
  obstacle_tree_palm: still(palm()),
  obstacle_tree_blossom: still(blossom()),
  obstacle_tree_hexwood: still(hexwood()),
  obstacle_tree_jungle_giant: still(jungleGiant()),
  obstacle_bush_bramble: still(bramble()),
};
