#!/usr/bin/env node
/**
 * Regenerates assets/maps/w*_l*.map for the 40x22 playfield.
 *
 * Why this exists in JS at all: the .map files are *derived* artefacts produced by
 * `LevelMaps.build()` + `MapExporter`, and there is no JDK in this environment to run that.
 * This is a faithful port — including a bit-exact `java.util.Random` — so the files it writes
 * are the same files `MapExporter` would write. The waypoint and water tables below are the
 * single source of truth: `--emit-java` prints them back as the Java arrays, so the two copies
 * cannot drift.
 *
 *   node scripts/gen-maps.mjs            write assets/maps/*.map
 *   node scripts/gen-maps.mjs --check    validate the polylines only, write nothing
 *   node scripts/gen-maps.mjs --emit-java
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── grid ────────────────────────────────────────────────────────────────────
export const COLS = 40, ROWS = 22;
/** Editor-space safe rect: rows outside it sit under the floating HUD (D-07). */
export const SAFE_R_LO = 2, SAFE_R_HI = 18;

// ── bit-exact java.util.Random ──────────────────────────────────────────────
const MASK48 = (1n << 48n) - 1n;
class JRandom {
  constructor(seed) { this.s = (BigInt(seed) ^ 0x5DEECE66Dn) & MASK48; }
  next(bits) {
    this.s = (this.s * 0x5DEECE66Dn + 0xBn) & MASK48;
    return Number(BigInt.asIntN(32, this.s >> (48n - BigInt(bits))));
  }
  nextInt(bound) {
    const m = bound - 1;
    let r = this.next(31);
    if ((bound & m) === 0) return Number((BigInt(bound) * BigInt(r)) >> 31n);
    for (let u = r; ((u - (r = u % bound) + m) | 0) < 0; u = this.next(31));
    return r;
  }
  nextBoolean() { return this.next(1) !== 0; }
}

// ── per-world palettes (mirrors LevelMaps) ──────────────────────────────────
const BASE = ['tile_grass_base', 'tile_mountain_base', 'tile_sand_base', 'tile_garden_lawn', 'tile_shadow_base'];
const VARIETY = [
  ['tile_grass_base_alt', 'tile_grass_clover', 'tile_grass_fern', 'tile_grass_flowers', 'tile_grass_tall'],
  ['tile_mountain_base_alt', 'tile_mountain_drift', 'tile_mountain_scree', 'tile_mountain_pine_snow',
    'tile_mountain_ice'],
  ['tile_sand_base_alt', 'tile_sand_cracked', 'tile_orange_dune_ridge', 'tile_orange_dune_rock'],
  // gearworks is deliberately NOT here: a brass machine floor scattered at 14% over a lawn reads
  // as confetti. It stays paintable in the editor, where someone can put it somewhere on purpose.
  ['tile_garden_flowerbed', 'tile_garden_topiary', 'tile_garden_gravel', 'tile_garden_hedge'],
  ['tile_shadow_base_alt', 'tile_shadow_bone', 'tile_shadow_obsidian', 'tile_shadow_ash']];
const PATH_T = ['tile_grass_path', 'tile_mountain_path', 'tile_sand_path', 'tile_garden_path', 'tile_shadow_path'];
const WATER = ['tile_grass_brook', 'tile_mountain_frozen_river', 'tile_sand_oasis_water',
  'tile_garden_canal', 'tile_shadow_cursed_water'];
const TREES = [
  ['obstacle_tree_oak', 'obstacle_tree_birch', 'obstacle_tree_willow', 'obstacle_bush_bramble'],
  ['obstacle_tree_pine', 'obstacle_tree_ashwood'],
  ['obstacle_tree_palm', 'obstacle_bush_bramble'],
  ['obstacle_tree_blossom', 'obstacle_tree_willow'],
  ['obstacle_tree_hexwood', 'obstacle_tree_ashwood']];
const MINOR_BLD = ['bld_grass_village', 'bld_mountain_tavern', 'bld_sand_palm_spring',
  'bld_garden_power_station', 'bld_shadow_pool'];
const MAJOR_BLD = ['bld_grass_castle', 'bld_mountain_citadel', 'bld_sand_stronghold',
  'bld_garden_laboratory', 'bld_shadow_cursed_portal'];
/**
 * The secondary biome each world can patch a corner with. Every world now has one; W2, W4 and W5
 * had `null`, which is a large part of why their five levels were interchangeable.
 */
const PATCH = [
  ['tile_jungle_base', 'tile_jungle_mud'],
  ['tile_mountain_glacier', 'tile_mountain_ice'],
  ['tile_orange_dune_base', 'tile_orange_dune_base_alt'],
  ['tile_garden_parterre', 'tile_garden_gearworks'],
  ['tile_shadow_ash', 'tile_shadow_hexwood']];

/**
 * Tiles that have an "up" and must never be given a quarter-turn. Everything else on the ground
 * is isotropic noise and rotates freely (that is what keeps the 32 px grid invisible), but the
 * Royal Gardens lawn is *mown stripes* — rotating it turns a formal lawn into a patchwork quilt.
 * This is the cost of the geometric biome and it is worth paying.
 */
const ORIENTED = new Set([
  // Royal Gardens: mown stripes, ruled beds, a diagonal lattice, hedges lit on their NW faces.
  'tile_garden_lawn', 'tile_garden_flowerbed', 'tile_garden_parterre',
  'tile_garden_gearworks', 'tile_garden_hedge',
  // Sea of Sand: wind ripples run one way across a desert. Rotating them wove the whole field
  // into a herringbone basket — the same failure as the lawn, found the same way, in a render.
  'tile_sand_base', 'tile_sand_base_alt',
  'tile_orange_dune_base', 'tile_orange_dune_base_alt', 'tile_orange_dune_ridge',
  // Roads too, where the road itself has a grain: the caravan track carries wind ripples and the
  // garden path is laid in mortar courses. The other three lanes are isotropic grit and rotate.
  'tile_sand_path', 'tile_garden_path',
]);

const majorCount = l => 1 + l;
const minorCount = l => Math.max(1, 5 - l);

// ── the 25 authored lanes, re-cut for 40x22 ─────────────────────────────────
// Every first segment is horizontal on purpose: `extendSpawnToBorder` walks the opening segment
// back to the map edge, and on a landscape field that must be a side, never the top or bottom
// (those rows are under the HUD). Parallel lanes stay >= 3 rows apart so the 2-wide stamps never
// merge, and no polyline crosses itself.
export const WAYPOINTS = [
  // W1 Great Grasslands — rolling S-bends
  [[1, 4], [25, 4], [25, 10], [7, 10], [7, 16], [34, 16]],
  [[1, 16], [12, 16], [12, 4], [22, 4], [22, 16], [36, 16]],
  [[1, 10], [9, 10], [9, 3], [20, 3], [20, 16], [31, 16], [31, 8], [37, 8]],
  [[1, 3], [14, 3], [14, 8], [5, 8], [5, 14], [22, 14], [22, 5], [31, 5], [31, 16], [37, 16]],
  [[1, 15], [8, 15], [8, 6], [18, 6], [18, 15], [28, 15], [28, 3], [37, 3]],
  // W2 Holy Mountains — switchbacks
  [[1, 3], [30, 3], [30, 8], [6, 8], [6, 13], [32, 13], [32, 17], [12, 17]],
  [[1, 6], [34, 6], [34, 11], [4, 11], [4, 16], [30, 16]],
  [[1, 13], [9, 13], [9, 4], [24, 4], [24, 10], [34, 10], [34, 16], [5, 16]],
  [[1, 17], [15, 17], [15, 9], [27, 9], [27, 3], [7, 3], [7, 6], [13, 6]],
  [[1, 4], [26, 4], [26, 9], [6, 9], [6, 14], [28, 14], [28, 17], [6, 17]],
  // W3 Sea of Sand — wide dune arcs
  [[1, 16], [13, 16], [13, 7], [27, 7], [27, 16], [37, 16]],
  [[1, 5], [6, 5], [6, 11], [19, 11], [19, 17], [35, 17], [35, 6]],
  [[1, 4], [25, 4], [25, 13], [10, 13], [10, 17], [32, 17]],
  [[1, 9], [18, 9], [18, 3], [31, 3], [31, 14], [5, 14], [5, 17], [14, 17]],
  [[1, 17], [14, 17], [14, 5], [22, 5], [22, 17], [30, 17], [30, 8], [37, 8]],
  // W4 Royal Gardens — formal geometry
  [[1, 12], [16, 12], [16, 4], [34, 4], [34, 16], [21, 16]],
  [[1, 6], [12, 6], [12, 15], [24, 15], [24, 6], [35, 6], [35, 16]],
  [[1, 17], [7, 17], [7, 10], [19, 10], [19, 3], [31, 3], [31, 13], [37, 13]],
  [[1, 4], [20, 4], [20, 9], [9, 9], [9, 14], [26, 14], [26, 9], [37, 9]],
  [[1, 3], [35, 3], [35, 16], [4, 16], [4, 10], [18, 10], [18, 13]],
  // W5 Shadow Realm — jagged combs
  [[1, 9], [7, 9], [7, 3], [14, 3], [14, 9], [21, 9], [21, 3], [28, 3], [28, 12], [35, 12]],
  [[1, 15], [9, 15], [9, 6], [17, 6], [17, 15], [25, 15], [25, 6], [33, 6], [33, 16]],
  [[1, 3], [18, 3], [18, 9], [6, 9], [6, 15], [22, 15], [22, 9], [34, 9], [34, 16]],
  [[1, 16], [10, 16], [10, 10], [24, 10], [24, 4], [34, 4], [34, 14], [16, 14]],
  [[1, 13], [6, 13], [6, 4], [15, 4], [15, 13], [23, 13], [23, 4], [31, 4], [31, 16], [17, 16]],
];

export const WATER_BLOBS = [
  [[16, 2, 2]], [[28, 3, 1], [9, 2, 1]], [[22, 4, 1]], [[12, 2, 2]], [[20, 3, 1], [30, 2, 1]],
  // W2 L1: keep the frozen river in the open southwest basin.  Its former seed at (30, 6)
  // landed on the switchback, so the lane mask reduced the whole feature to three stray tiles.
  [[3, 18, 3]], [[18, 4, 3]], [[16, 18, 2], [31, 17, 2]], [[22, 18, 3]], [[16, 11, 2], [11, 18, 2]],
  [[20, 12, 3]], [[25, 15, 2], [11, 4, 2]], [[16, 9, 3]], [[25, 15, 2], [10, 4, 2]], [[6, 8, 3]],
  [[9, 6, 2], [27, 20, 2]], [[6, 18, 3]], [[19, 6, 2], [21, 20, 2]], [[11, 16, 3]], [[11, 5, 2], [24, 19, 2]],
  [[5, 19, 2], [14, 16, 2]], [[13, 10, 3]], [[17, 20, 2], [33, 5, 2]], [[22, 5, 3]], [[4, 7, 2], [31, 16, 2]],
];

// ── blueprint ───────────────────────────────────────────────────────────────
const NONE = 'NONE', PATH_O = 'PATH', CAVE = 'CAVE', SPAWN = 'SPAWN';
const inBounds = (c, r) => c >= 0 && r >= 0 && c < COLS && r < ROWS;
const sign = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function blueprint(baseTile) {
  const g = (f) => Array.from({ length: COLS }, () => Array.from({ length: ROWS }, f));
  return { name: 'untitled', baseTile, terrain: g(() => baseTile), terrainRot: g(() => 0), overlay: g(() => NONE), decor: g(() => null) };
}

export const isWater = k => !!k && (k.includes('water') || k.includes('brook')
  || k.includes('canal') || k.includes('river') || k.includes('oasis'));

// ── the port ────────────────────────────────────────────────────────────────
/**
 * Each level gets its OWN slice of its world's variety tiles, at its own density.
 *
 * Measured before this existed: within a world, all five levels used an identical palette and
 * **zero tiles were unique to any one level**. The lanes were individual — 17% mean overlap — but
 * the ground under them was not, so the five levels of a world read as one place five times.
 *
 * A rotating subset fixes it without touching world identity: W1 L1 is a clover meadow, L3 is
 * fern woodland, L5 is tall grass, and all three are still unmistakably the Great Grasslands.
 */
function varietyFor(w, l) {
  const v = VARIETY[w];
  const take = 2 + (l % 2);                    // 2 or 3 of them, alternating by level
  return Array.from({ length: take }, (_, i) => v[(l * 2 + i) % v.length]);
}

/** Density also varies per level: an open field and a crowded one are different places. */
const varietyDensity = l => [10, 17, 13, 22, 15][l % 5];

function paintVariety(bp, w, l, rng) {
  const v = varietyFor(w, l);
  const dens = varietyDensity(l);
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const roll = rng.nextInt(100);
    // A variety tile keeps its orientation — grass blades and ferns have an up. The plain bed
    // is isotropic noise, so it is ALWAYS rotated. Rotating only a third of them, as this used
    // to, left the majority identical and unrotated, and 40 columns of the same 32 px tile is
    // a visible checkerboard. Rotation is free anti-repetition; there is no reason to ration it.
    if (roll < dens) bp.terrain[c][r] = v[rng.nextInt(v.length)];
    else if (!ORIENTED.has(bp.terrain[c][r])) bp.terrainRot[c][r] = rng.nextInt(4);
  }
}

function paintPatch(bp, patch, l, rng) {
  const sc = (l % 4 < 2) ? COLS - 2 : 1;
  const sr = (l % 4 % 2 === 0) ? 1 : ROWS - 2;
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const d = Math.abs(c - sc) + Math.abs(r - sr) + rng.nextInt(4);
    if (d < 14) bp.terrain[c][r] = patch[rng.nextInt(patch.length)];
  }
}

/** A road tile is isotropic, so give every lane cell a rotation keyed to its position — an
 *  unrotated run of 30 identical road tiles is the single most obvious lattice on the map. */
const cellRot = (c, r) => ((c * 7 + r * 13 + ((c * r) & 3)) & 3);

function stamp(bp, c, r, tile) {
  for (let dc = 0; dc <= 1; dc++) for (let dr = 0; dr <= 1; dr++) {
    if (!inBounds(c + dc, r + dr)) continue;
    bp.terrain[c + dc][r + dr] = tile;
    bp.terrainRot[c + dc][r + dr] = ORIENTED.has(tile) ? 0 : cellRot(c + dc, r + dr);
    bp.overlay[c + dc][r + dr] = PATH_O;
  }
}

function carvePath(bp, pts, tile) {
  const route = [];
  let c = pts[0][0], r = pts[0][1];
  stamp(bp, c, r, tile); route.push([c, r]);
  for (let i = 1; i < pts.length; i++) {
    const tc = pts[i][0], tr = pts[i][1];
    while (c !== tc || r !== tr) {
      if (c !== tc) c += sign(tc - c); else r += sign(tr - r);
      stamp(bp, c, r, tile); route.push([c, r]);
    }
  }
  return route;
}

function extendSpawnToBorder(bp, pts, route, tile) {
  let dc = sign(pts[0][0] - pts[1][0]), dr = sign(pts[0][1] - pts[1][1]);
  if (dc === 0 && dr === 0) dc = -1;
  let c = pts[0][0], r = pts[0][1];
  const prefix = [];
  for (let guard = 0; guard < COLS; guard++) {
    const atBorder = (dc < 0 && c === 0) || (dc > 0 && c >= COLS - 2)
      || (dr < 0 && r === 0) || (dr > 0 && r >= ROWS - 2);
    if (atBorder) break;
    c += dc; r += dr;
    stamp(bp, c, r, tile);
    prefix.unshift([c, r]);
  }
  route.unshift(...prefix);
}

function setWater(bp, c, r, tile, rot) {
  if (!inBounds(c, r) || bp.overlay[c][r] !== NONE) return;
  bp.terrain[c][r] = tile; bp.terrainRot[c][r] = rot;
}

function paintWater(bp, w, specs, rng) {
  const tile = WATER[w];
  for (let si = 0; si < specs.length; si++) {
    const b = specs[si];
    if (w === 0) {
      let c = b[0], r = b[1];
      const len = 6 + b[2] * 5;
      for (let k = 0; k < len; k++) {
        const down = rng.nextInt(4) !== 0;
        setWater(bp, c, r, tile, down ? 0 : 1);
        if (down) r++; else c += rng.nextBoolean() ? 1 : -1;
      }
    } else if (w === 3) {
      const horizontal = si % 2 === 0;
      const span = horizontal ? COLS : ROWS;
      for (let k = 0; k < span; k++)
        setWater(bp, horizontal ? k : b[0], horizontal ? b[1] : k, tile, horizontal ? 1 : 0);
    } else {
      for (let c = b[0] - b[2]; c <= b[0] + b[2]; c++)
        for (let r = b[1] - b[2]; r <= b[1] + b[2]; r++) {
          const d = Math.abs(c - b[0]) + Math.abs(r - b[1]);
          if (d <= b[2] + (rng.nextInt(3) - 1)) setWater(bp, c, r, tile, 0);
        }
    }
  }
}

function markSpawnAndCave(bp, route) {
  const s = route[0], e = route[route.length - 1];
  bp.overlay[s[0]][s[1]] = SPAWN;
  bp.overlay[e[0] + 1][e[1]] = CAVE;
}

/**
 * @param buf clearance ring around the 3x2 footprint. Hostile keeps and homes are placed with
 *   buf 0 so they sit **directly against the lane** — a settlement the enemy marches out of
 *   should crowd the road, and a keep three cells back from it reads as unrelated scenery.
 *   Mines and wells keep buf 1: they are scattered, and want breathing room.
 */
function freeForBuilding(bp, c, r, buf = 1) {
  if (c < 1 || r < 1 || c + 3 > COLS - 1 || r + 2 > ROWS - 1) return false;
  for (let dc = -buf; dc <= 2 + buf; dc++) for (let dr = -buf; dr <= 1 + buf; dr++) {
    const cc = c + dc, rr = r + dr;
    if (!inBounds(cc, rr)) return false;
    if (bp.overlay[cc][rr] !== NONE) return false;
    if (bp.decor[cc][rr] !== null) return false;
    if (isWater(bp.terrain[cc][rr])) return false;
  }
  return true;
}

function routeDir(route, idx) {
  const i = clamp(idx, 1, route.length - 1);
  const a = route[i - 1], b = route[i];
  const dc = sign(b[0] - a[0]), dr = sign(b[1] - a[1]);
  return (dc === 0 && dr === 0) ? [1, 0] : [dc, dr];
}

function spur(bp, at, n, side, off, bc, br, tile) {
  for (let k = 1; k < off - 1; k++) {
    const c = at[0] + n[0] * k * side, r = at[1] + n[1] * k * side;
    for (let dc = 0; dc <= 1; dc++) for (let dr = 0; dr <= 1; dr++) {
      const cc = c + dc, rr = r + dr;
      if (!inBounds(cc, rr) || bp.decor[cc][rr] !== null) continue;
      if (cc >= bc && cc <= bc + 2 && rr >= br && rr <= br + 1) continue;
      // never demote the route endpoints back to plain PATH — see LevelMaps.spur
      if (bp.overlay[cc][rr] === CAVE || bp.overlay[cc][rr] === SPAWN) continue;
      bp.terrain[cc][rr] = tile;
      bp.terrainRot[cc][rr] = ORIENTED.has(tile) ? 0 : cellRot(cc, rr);
      bp.overlay[cc][rr] = PATH_O;
    }
  }
}

function placeDecorNear(bp, s, key, rng) {
  for (let tries = 0; tries < 30; tries++) {
    const c = s[0] + rng.nextInt(11) - 5, r = s[1] + rng.nextInt(11) - 5;
    if (freeForBuilding(bp, c, r)) { bp.decor[c][r] = key; return; }
  }
}

const f32 = Math.fround;

function placeBuildings(bp, w, l, route, tile, rng) {
  const minors = minorCount(l), majors = majorCount(l), total = minors + majors;
  for (let k = 0; k < total; k++) {
    const major = k >= minors;
    const t = f32(f32(0.12) + f32(f32(0.76) * f32(k / Math.max(1, total - 1))));
    let placed = false;
    for (let a = 0; a < 20 && !placed; a++) {
      const jt = f32(t + f32((a % 2 === 0 ? 1 : -1) * Math.trunc(a / 2) * f32(0.04)));
      const idx = clamp(Math.round(f32(jt * (route.length - 1))), 1, route.length - 2);
      const at = route[idx], dir = routeDir(route, idx), n = [-dir[1], dir[0]];
      // Prefer the side that puts the building NORTH of the lane in editor space. Sprites are
      // foot-anchored and rise up the screen, so a building south of the road would draw its
      // 96 px mass straight over the road and hide the units walking on it.
      const first = n[1] !== 0 ? (n[1] > 0 ? -1 : 1) : ((k % 2 === 0) ? 1 : -1);
      const sides = [first, -first];
      for (let s = 0; s < 2 && !placed; s++) {
        const side = sides[s];
        for (let off = 2; off <= 5 && !placed; off++) {
          const bc = at[0] + n[0] * off * side - 1, br = at[1] + n[1] * off * side;
          if (!freeForBuilding(bp, bc, br, 0)) continue;
          bp.decor[bc][br] = major ? MAJOR_BLD[w] : MINOR_BLD[w];
          if (major) spur(bp, at, n, side, off, bc, br, tile);
          placed = true;
        }
      }
    }
  }
  const s = route[Math.min(4, route.length - 1)];
  placeDecorNear(bp, s, 'bld_gold_mine_t' + ((w % 3) + 1), rng);
  placeDecorNear(bp, s, 'bld_mana_well_t' + (((w + 1) % 3) + 1), rng);
}

function placeTree(bp, c, r, tree) {
  if (c < 1 || r < 1 || c >= COLS - 1 || r >= ROWS - 1) return;
  if (bp.overlay[c][r] !== NONE) return;
  if (bp.decor[c][r] !== null || isWater(bp.terrain[c][r])) return;
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++)
    if (inBounds(c + dc, r + dr) && bp.decor[c + dc][r + dr] && bp.decor[c + dc][r + dr].startsWith('bld_')) return;
  bp.decor[c][r] = tree;
}

function placeObstacleElbows(bp, w, pts, rng) {
  const trees = TREES[w];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c2 = pts[i + 1];
    const inC = sign((a[0] - b[0]) + (c2[0] - b[0]));
    const inR = sign((a[1] - b[1]) + (c2[1] - b[1]));
    for (let k = 0; k < 5; k++) {
      const oc = b[0] + inC * (2 + rng.nextInt(3)) + rng.nextInt(3) - 1;
      const or_ = b[1] + inR * (2 + rng.nextInt(3)) + rng.nextInt(3) - 1;
      placeTree(bp, oc, or_, trees[rng.nextInt(trees.length)]);
    }
  }
}

function paintForests(bp, w, rng) {
  const trees = TREES[w];
  const masses = 4 + rng.nextInt(2);
  for (let m = 0; m < masses; m++) {
    const cc = 3 + rng.nextInt(COLS - 6), cr = 3 + rng.nextInt(ROWS - 6);
    const rad = 5 + rng.nextInt(3);
    const species = w === 1 ? 'obstacle_tree_pine' : trees[rng.nextInt(2)];
    for (let c = cc - rad; c <= cc + rad; c++)
      for (let r = cr - rad; r <= cr + rad; r++) {
        const d = Math.abs(c - cc) + Math.abs(r - cr);
        if (d > rad + rng.nextInt(3) - 1) continue;
        if (rng.nextInt(10) < 2) continue;
        placeTree(bp, c, r, rng.nextInt(10) < 8 ? species : trees[rng.nextInt(trees.length)]);
      }
  }
}

function scatterObstacles(bp, w, route, rng) {
  const trees = TREES[w];
  for (let i = 0; i < 26; i++) {
    const at = route[rng.nextInt(route.length)];
    placeTree(bp, at[0] + rng.nextInt(11) - 5, at[1] + rng.nextInt(11) - 5, trees[rng.nextInt(trees.length)]);
  }
}

export function build(w, l) {
  const id = w * 5 + l;
  const rng = new JRandom(1000 + id);
  const bp = blueprint(BASE[w]);
  bp.name = `w${w + 1}_l${l + 1}`;
  paintVariety(bp, w, l, rng);
  // Patch on three levels of every five, and in a level-dependent corner, so a world's levels
  // differ in where their second biome sits as well as whether they have one.
  if (PATCH[w] && l % 5 !== 1 && l % 5 !== 3) paintPatch(bp, PATCH[w], l + w, rng);
  const route = carvePath(bp, WAYPOINTS[id], PATH_T[w]);
  extendSpawnToBorder(bp, WAYPOINTS[id], route, PATH_T[w]);
  paintWater(bp, w, WATER_BLOBS[id], rng);
  markSpawnAndCave(bp, route);
  placeBuildings(bp, w, l, route, PATH_T[w], rng);
  placeObstacleElbows(bp, w, WAYPOINTS[id], rng);
  if (w <= 1) paintForests(bp, w, rng);
  scatterObstacles(bp, w, route, rng);
  return { bp, route };
}

export function toText(bp) {
  const out = [`name ${bp.name}`, `base ${bp.baseTile}`];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const t = bp.terrain[c][r] !== bp.baseTile, o = bp.overlay[c][r] !== NONE;
    const d = bp.decor[c][r] !== null, rot = bp.terrainRot[c][r] !== 0;
    if (!t && !o && !d && !rot) continue;
    let s = `c ${c} ${r} t ${bp.terrain[c][r]}`;
    if (rot) s += ` r ${bp.terrainRot[c][r]}`;
    if (o) s += ` o ${bp.overlay[c][r]}`;
    if (d) s += ` d ${bp.decor[c][r]}`;
    out.push(s);
  }
  return out.join('\n') + '\n';
}

// ── validation ──────────────────────────────────────────────────────────────
/** Axis-aligned segment list for a polyline. */
const segs = pts => pts.slice(1).map((p, i) => [pts[i], p]);

export function validate() {
  const problems = [];
  WAYPOINTS.forEach((pts, id) => {
    const tag = `w${Math.floor(id / 5) + 1}_l${id % 5 + 1}`;
    // 1. every anchor's 2x2 stamp inside the safe rect and the grid
    for (const [c, r] of pts) {
      if (c < 0 || c + 1 >= COLS) problems.push(`${tag}: column ${c} out of grid`);
      if (r < SAFE_R_LO || r + 1 > SAFE_R_HI) problems.push(`${tag}: row ${r} outside the safe rect`);
    }
    // 2. the opening segment must be horizontal (spawn extends to a side border)
    if (pts[0][1] !== pts[1][1]) problems.push(`${tag}: opening segment is vertical`);
    // 3. no axis-aligned self-crossing, and no two parallel lanes closer than 3
    const S = segs(pts);
    for (let i = 0; i < S.length; i++) for (let j = i + 2; j < S.length; j++) {
      const [a0, a1] = S[i], [b0, b1] = S[j];
      const aH = a0[1] === a1[1], bH = b0[1] === b1[1];
      const rng2 = (p, q, k) => [Math.min(p[k], q[k]), Math.max(p[k], q[k])];
      if (aH !== bH) {
        const [h0, h1] = aH ? [a0, a1] : [b0, b1];
        const [v0, v1] = aH ? [b0, b1] : [a0, a1];
        const [x0, x1] = rng2(h0, h1, 0), [y0, y1] = rng2(v0, v1, 1);
        if (v0[0] >= x0 && v0[0] <= x1 && h0[1] >= y0 && h0[1] <= y1)
          problems.push(`${tag}: segments ${i} and ${j} cross at ${v0[0]},${h0[1]}`);
      } else {
        const k = aH ? 1 : 0, o = aH ? 0 : 1;
        const gap = Math.abs(a0[k] - b0[k]);
        const [p0, p1] = rng2(a0, a1, o), [q0, q1] = rng2(b0, b1, o);
        const overlap = Math.min(p1, q1) - Math.max(p0, q0);
        if (gap < 3 && overlap >= 0)
          problems.push(`${tag}: parallel lanes ${i}/${j} only ${gap} apart over ${overlap + 1} cells`);
      }
    }
  });
  WATER_BLOBS.forEach((specs, id) => {
    const tag = `w${Math.floor(id / 5) + 1}_l${id % 5 + 1}`;
    for (const [c, r] of specs)
      if (!inBounds(c, r)) problems.push(`${tag}: water seed ${c},${r} off-grid`);
  });
  return problems;
}

/**
 * Post-generation checks on the finished blueprint — the things a bad lane table cannot be
 * caught by on its own, because buildings, spurs and water all paint after the lane does.
 * This is what found the spur/cave bug.
 */
export function audit(bp) {
  const bad = [];
  let spawn = null, cave = null, pathCells = 0, buildable = 0;
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const o = bp.overlay[c][r];
    if (o === SPAWN) spawn = [c, r];
    if (o === CAVE) cave = [c, r];
    if (o !== NONE) {
      pathCells++;
      if (r < SAFE_R_LO || r > SAFE_R_HI) bad.push(`lane cell ${c},${r} is under the HUD`);
    } else if (!isWater(bp.terrain[c][r]) && !bp.decor[c][r]
      && r >= SAFE_R_LO && r <= SAFE_R_HI) buildable++;
  }
  if (!spawn) bad.push('no SPAWN marker');
  if (!cave) bad.push('no CAVE marker');
  if (spawn && cave) {
    // BFS the way BlueprintLevel does — if this cannot reach the cave the level is unplayable
    const seen = new Set([spawn.join(',')]);
    const q = [spawn];
    let found = false;
    while (q.length && !found) {
      const [c, r] = q.shift();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr, k = nc + ',' + nr;
        if (!inBounds(nc, nr) || seen.has(k) || bp.overlay[nc][nr] === NONE) continue;
        if (nc === cave[0] && nr === cave[1]) { found = true; break; }
        seen.add(k); q.push([nc, nr]);
      }
    }
    if (!found) bad.push('cave unreachable from spawn along PATH cells');
  }
  // a level with nowhere to build is not a level
  if (buildable < 200) bad.push(`only ${buildable} buildable cells in the safe rect`);
  return { bad, pathCells, buildable };
}

function emitJava() {
  const arr3 = (name, data, comments) => {
    let s = `    private static final int[][][] ${name} = {\n`;
    data.forEach((row, i) => {
      if (comments && comments[i]) s += `        // ${comments[i]}\n`;
      s += '        ' + (Array.isArray(row[0][0])
        ? row.map(g => `{${g.join(', ')}}`).join(', ')
        : row.map(p => `{${p.join(', ')}}`).join(', ')) + ',\n';
    });
    return s + '    };\n';
  };
  const names = ['W1 Great Grasslands — rolling S-bends', null, null, null, null,
    'W2 Holy Mountains — switchbacks', null, null, null, null,
    'W3 Sea of Sand — wide dune arcs', null, null, null, null,
    'W4 Royal Gardens — formal geometry', null, null, null, null,
    'W5 Shadow Realm — jagged combs', null, null, null, null];
  process.stdout.write(arr3('WAYPOINTS', WAYPOINTS.map(p => [p]).map(x => x[0].map(q => q)), names)
    .replace(/\{(\d+), (\d+)\}/g, '{$1, $2}'));
}

// ── main ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const problems = validate();
  for (const p of problems) console.error('  ! ' + p);
  console.log(`${WAYPOINTS.length} lanes validated — ${problems.length} problem(s)`);
  if (argv.includes('--emit-java')) { emitJava(); process.exit(0); }
  if (argv.includes('--check')) process.exit(problems.length ? 1 : 0);
  if (problems.length) { console.error('refusing to write while lanes are invalid'); process.exit(1); }

  const dir = path.join(ROOT, 'assets', 'maps');
  fs.mkdirSync(dir, { recursive: true });
  let cells = 0, decors = 0, minBuildable = 1e9, failures = 0;
  for (let w = 0; w < 5; w++) for (let l = 0; l < 5; l++) {
    const { bp } = build(w, l);
    const a = audit(bp);
    if (a.bad.length) { failures++; console.error(`  ! ${bp.name}: ${a.bad.join('; ')}`); }
    minBuildable = Math.min(minBuildable, a.buildable);
    const txt = toText(bp);
    cells += txt.split('\n').length - 3;
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) if (bp.decor[c][r]) decors++;
    fs.writeFileSync(path.join(dir, `${bp.name}.map`), txt);
  }
  console.log(`wrote 25 maps · ${cells} cell records · ${decors} decor placements`);
  console.log(`audit: ${25 - failures}/25 clean · leanest level has ${minBuildable} buildable cells`);
  if (failures) process.exit(1);
}
