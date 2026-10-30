// assets/data/maps.js — the 25 level-select cards.
//
// 64×60, the size the level-select grid draws them at.
//
// ── These are generated from the levels themselves ──────────────────────────
// The old cards were hand-drawn thumbnails, which made them **decorative**: they showed a picture
// of a place rather than the level you were about to play, and nothing kept them honest when a
// layout changed. This module instead imports the real `WAYPOINTS` table from
// `scripts/gen-maps.mjs` — the same single source the 25 .map files are generated from — and
// draws each card as a true miniature of that level's lane.
//
// So the card is a *map*. You can see before clicking whether this one is a long switchback or a
// short comb, where the spawn is and where the cave is. And if someone re-cuts a lane, the card
// re-cuts with it: there is nothing to keep in sync, so it cannot go stale.
//
// The biome comes from the world; the lane, its length and its shape come from the data.

import { WAYPOINTS, COLS, ROWS } from '../../../scripts/gen-maps.mjs';
import { grid, set, disc } from './lib/pixel.js';
import { noise } from './lib/shade.js';

export const META = { group: 'Level cards', blurb: '25 level-select cards at 64x60, each generated from that level\'s real waypoint polyline, so the card is a true miniature of the lane you are about to play and can never drift from it.' };

export const LEGEND = {
  '`': null,
  o: 'IK0', c: 'IK3', C: 'IK5',                             // frame + ink
  g: 'GD1', k: 'GD5',                                       // gold rule
  // five biome beds: dark / mid / lit, then that world's lane colour
  1: 'MS0', 2: 'MS2', 3: 'MS4', 4: 'WD2',                   // W1 grass · earth lane
  5: 'IR4', 6: 'IR5', 7: 'IC5', 8: 'RK3',                   // W2 snow · stone lane
  9: 'SD1', a: 'SD3', b: 'SD5', d: 'BN4',                   // W3 sand · pale track
  e: 'MS1', f: 'MS2', h: 'MS3', i: 'RK4',                   // W4 lawn · pavers
  j: 'IK2', l: 'IK4', m: 'UD2', n: 'BN2',                   // W5 void · bone road
  s: 'GE2', S: 'GR2',                                       // spawn marker / cave marker
  G: 'GD3',                                                 // difficulty pips
};

const W = 64, H = 60;
const IX = 4, IY = 4, IW = W - 8, IH = H - 8;                // the inner field, inset for the frame

const BIOME = [
  { bed: ['1', '2', '3'], lane: '4' },
  { bed: ['5', '6', '7'], lane: '8' },
  { bed: ['9', 'a', 'b'], lane: 'd' },
  { bed: ['e', 'f', 'h'], lane: 'i' },
  { bed: ['j', 'l', 'm'], lane: 'n' },
];

/** Blueprint cell → card pixel: the whole 40×22 field squeezed into the card's inner rect. */
const px = c => IX + Math.round((c / COLS) * IW);
const py = r => IY + Math.round((r / ROWS) * IH);

function card(worldIndex, levelIndex) {
  const g = grid(W, H);
  const b = BIOME[worldIndex];
  const id = worldIndex * 5 + levelIndex;
  const pts = WAYPOINTS[id];

  // the bed — quieter than a real tile, because at this size any texture becomes noise
  for (let y = IY; y < IY + IH; y++)
    for (let x = IX; x < IX + IW; x++) {
      const n = noise(x, y, 3 + id);
      set(g, x, y, n > 0.86 ? b.bed[2] : n > 0.45 ? b.bed[1] : b.bed[0]);
    }

  // the lane, walked exactly the way carvePath walks it — column first, then row
  let c = pts[0][0], r = pts[0][1];
  const stamp = (cc, rr) => {
    const x = px(cc), y = py(rr);
    for (let dy = 0; dy <= 1; dy++)
      for (let dx = 0; dx <= 2; dx++) set(g, x + dx, y + dy, b.lane);
  };
  stamp(c, r);
  for (let i = 1; i < pts.length; i++) {
    const [tc, tr] = pts[i];
    while (c !== tc || r !== tr) {
      if (c !== tc) c += Math.sign(tc - c); else r += Math.sign(tr - r);
      stamp(c, r);
    }
  }
  // extend the opening segment off the card, as the real level extends it to the map border
  const dc = Math.sign(pts[0][0] - pts[1][0]) || -1;
  for (let k = 1; k <= pts[0][0] + 2; k++) stamp(pts[0][0] + dc * k, pts[0][1]);

  // Spawn and cave: the two things anyone actually looks for on a map.
  // The spawn marker has to be CLAMPED inside the card. Every lane starts at column 1 and runs
  // off the left border, so placing the marker at the lane's true origin put it at x = -1 and it
  // vanished on all 25 cards — visible the moment they were rendered as a set, invisible in code.
  const sx = Math.max(IX + 3, Math.min(W - IX - 4, px(pts[0][0]) + dc * 5));
  disc(g, sx, py(pts[0][1]) + 1, 2, 's');
  set(g, sx, py(pts[0][1]) + 1, 'k');
  const last = pts[pts.length - 1];
  disc(g, px(last[0]) + 1, py(last[1]) + 1, 3, 'S');
  set(g, px(last[0]) + 1, py(last[1]) + 1, 'k');

  // difficulty as pips on the bottom rail — the level index is information, not decoration
  for (let i = 0; i <= levelIndex; i++) {
    const x = Math.round(W / 2 - levelIndex * 3 + i * 6);
    disc(g, x, H - 6, 2, 'G'); set(g, x, H - 6, 'k');
  }

  // the frame last, so nothing can draw over it
  for (let x = 0; x < W; x++) { set(g, x, 0, 'o'); set(g, x, 1, 'C'); set(g, x, H - 1, 'o'); set(g, x, H - 2, 'c'); }
  for (let y = 0; y < H; y++) { set(g, 0, y, 'o'); set(g, 1, y, 'C'); set(g, W - 1, y, 'o'); set(g, W - 2, y, 'c'); }
  for (let x = 2; x < W - 2; x++) { set(g, x, 2, 'g'); set(g, x, H - 3, 'g'); }
  for (let y = 2; y < H - 2; y++) { set(g, 2, y, 'g'); set(g, W - 3, y, 'g'); }
  for (const [x, y] of [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3]]) set(g, x, y, 'k');
  return g;
}

const still = g => ({ anchor: 'center', fps: 1, loop: true, frames: [g.px.map(r => r.join(''))] });

// The keys carry the authored level names; the pictures come from the data.
const NAMES = [
  'w1_l1_first_muster', 'w1_l2_the_oak_line', 'w1_l3_village_hold', 'w1_l4_castle_approach', 'w1_l5_the_generals_stand',
  'w2_l1_pilgrims_path', 'w2_l2_glacial_melt', 'w2_l3_tavern_rest', 'w2_l4_citadel_climb', 'w2_l5_the_high_priest',
  'w3_l1_dune_crossing', 'w3_l2_the_oasis', 'w3_l3_palm_spring', 'w3_l4_raiders_gauntlet', 'w3_l5_the_chief_rebel',
  'w4_l1_garden_gate', 'w4_l2_the_canal', 'w4_l3_power_station', 'w4_l4_laboratory_siege', 'w4_l5_his_majesty',
  'w5_l1_into_shadow', 'w5_l2_cursed_waterway', 'w5_l3_the_portal', 'w5_l4_shadow_pool', 'w5_l5_demon_shadow_king',
];

export const SPRITES = {};
NAMES.forEach((name, id) => {
  SPRITES[`map_${name}`] = still(card(Math.floor(id / 5), id % 5));
});
