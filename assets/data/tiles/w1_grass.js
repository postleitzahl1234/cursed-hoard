// tiles/w1_grass.js — W1 Great Grasslands. WILD: everything here is organic and irregular.
//
// 32×32 @ 1× density: one source pixel is one screen pixel at the 40×22 geometry, so nothing is
// ever resampled. Supersedes the pilot tile of the same name (redesign/REVIEW.md §8/§3.3).
//
// The bed keeps the pilot's discovery — the whole surface lives inside three adjacent palette
// steps, with a rare NW-lit clump edge to give it a surface instead of a noise field. What is
// new is the auto-edge kits: the beaten-earth lane and the brook each get 12 transparent overlay
// pieces, so the engine can bleed them into whatever they border, at any shape, with no authored
// transition tiles anywhere (D-19).
//
// Contrast this biome with W4 deliberately: grass banks wander (rag 1.0), garden canals are
// masonry-ruled (rag 0.12). Same generator, opposite reading.

import { set, get } from '../lib/pixel.js';
import { noise } from '../lib/shade.js';
import { bed, field, scatter, setW, S } from '../lib/tileset.js';
import { biome } from './_biome.js';

export const META = { group: 'Tiles · W1 Great Grasslands', blurb: 'Wild organic grassland: a quiet three-step bed, wildflowers, ferns, clover, tall growth and a jungle fringe, plus full 12-piece auto-edge kits for the beaten-earth lane and the brook.' };

const L = {
  g: 'MS0', h: 'MS1', i: 'MS2', G: 'MS3', H: 'PN0',      // grass bed + lit clump + sink
  j: 'GN1', J: 'GN3',                                     // clover
  k: 'PN2', K: 'MS4',                                     // fern / tall blade
  y: 'GD3', Y: 'GD5', x: 'EM2', X: 'EM4', v: 'HX3',       // wildflowers
  a: 'WD1', b: 'WD2', c: 'WD3', A: 'WD4', B: 'WD0',       // beaten earth lane
  r: 'RK2', R: 'RK4',                                     // grit
  d: 'AQ1', e: 'AQ2', f: 'AQ3', D: 'IC3', E: 'AQ0', F: 'IC4',   // brook
  p: 'PN0', q: 'PN1', P: 'PN2', Q: 'GN2',                 // jungle fringe
  m: 'WD0', M: 'WD1', n: 'BN0',                           // jungle mud
};

const RAMP = ['g', 'h', 'i'];
const OPTS = { seed: 5, lit: 'G', dark: 'H' };

/** Six lit blades and nothing else. At 40 tiles across, more becomes a recognisable motif. */
const baseTile = g => scatter(g, 6, 61, (t, x, y) => {
  if (get(t, x, y) === 'g') return;
  setW(t, x, y, 'G'); setW(t, x, y + 1, 'i');
});

export const { LEGEND, SPRITES } = biome({
  legend: L,
  base: { key: 'tile_grass_base', ramp: RAMP, opts: OPTS, paint: baseTile },

  variants: {
    tile_grass_clover: g => scatter(g, 22, 133, (t, x, y) => {
      // trefoil: three lobes around a point, so it reads as clover rather than as a dot
      setW(t, x, y, 'J'); setW(t, x + 1, y, 'J'); setW(t, x, y + 1, 'J');
      setW(t, x + 1, y + 1, 'j');
    }),

    tile_grass_fern: g => scatter(g, 9, 207, (t, x, y) => {
      // an arched frond: spine plus alternating pinnae, drooping away from the light
      for (let s = 0; s < 6; s++) {
        const fx = x + Math.round(s * 0.7), fy = y + s;
        setW(t, fx, fy, s < 3 ? 'K' : 'k');
        if (s % 2 === 0) { setW(t, fx - 1, fy, 'k'); setW(t, fx + 1, fy + 1, 'k'); }
      }
    }),

    tile_grass_flowers: g => scatter(g, 14, 311, (t, x, y, i) => {
      const head = [['y', 'Y'], ['x', 'X'], ['v', 'Y']][i % 3];
      setW(t, x, y + 1, 'G');                       // stem catches the key light
      setW(t, x, y, head[0]);
      setW(t, x + (i % 2 ? 1 : -1), y, head[1]);    // one lit petal, off the NW side
    }),

    tile_grass_tall: g => {
      // Tall growth is a *density*, not a scatter — the blades have to interlock, or the tile
      // reads as ordinary grass with sticks in it.
      for (let x = 0; x < S; x++) {
        if (noise(x % S, 4, 88) < 0.42) continue;
        const h = 4 + Math.floor(noise(x % S, 9, 12) * 5);
        const y0 = Math.floor(noise(x % S, 2, 55) * S);
        for (let s = 0; s < h; s++) setW(g, x + Math.round(s * 0.35), y0 - s,
          s > h - 3 ? 'K' : s > 1 ? 'i' : 'h');
      }
      return g;
    },
  },

  beds: {
    // A second bed on its own seed. Laid beside the first it breaks the 32 px rhythm, which is
    // the cheapest anti-lattice trick there is — and the reason every world ships an _alt.
    tile_grass_base_alt: () => bed(RAMP, { seed: 23, lit: 'G', dark: 'H' }),

    // The jungle fringe W1's odd levels patch in. Darker and denser than the grassland: it has
    // to read as a different place, not as grass at night.
    tile_jungle_base: () => scatter(bed(['p', 'q', 'P'], { seed: 41, lit: 'Q', dark: 'H' }), 11, 97,
      (t, x, y) => { for (let s = 0; s < 4; s++) setW(t, x + s, y + Math.round(s * 0.6), s < 2 ? 'Q' : 'P'); }),

    tile_jungle_mud: () => scatter(bed(['m', 'M', 'n'], { seed: 63 }), 8, 71,
      (t, x, y) => { setW(t, x, y, 'B'); setW(t, x + 1, y, 'm'); setW(t, x, y + 1, 'm'); }),

    // The jungle's own lane and river. No edge kit: the patch biome is painted by hand in the
    // editor and never carries the generated route, so it only ever needs the solid tile.
    tile_jungle_path: () => scatter(bed(['m', 'a', 'M'], { seed: 84 }), 12, 93,
      (t, x, y) => { setW(t, x, y, 'r'); setW(t, x + 1, y + 1, 'B'); }),
    tile_jungle_river: () => {
      const g = bed(['d', 'e', 'f'], { seed: 96, lit: 'F' });
      for (let i = 0; i < 9; i++) {
        const x = Math.floor(noise(i, 2, 55) * S), y = Math.floor(noise(i, 4, 61) * S);
        for (let s = 0; s < 4; s++) setW(g, x + Math.round(s * 0.4), y - s, s > 1 ? 'p' : 'Q');
      }
      return g;
    },
  },

  layers: [
    {
      key: 'tile_grass_path',
      ramp: ['a', 'b', 'c'], rimLit: 'A', rimDark: 'B',
      depth: 7, seed: 101, rag: 1.0,
      // pressed grit is the lane's only texture; anything more and the road competes with units
      texture: (g, x, y) => {
        const n = noise(x, y, 71);
        if (n > 0.955) set(g, x, y, 'R');
        else if (n > 0.88) set(g, x, y, 'r');
      },
      // Grit is per-pixel, not a scatter of little clusters. Clusters at fixed positions are
      // exactly what makes a 32 px tile read as a lattice once the lane runs 30 cells long —
      // the first render of w1_l1 showed a ring repeating down the whole road.
      fill: () => {
        const g = bed(['a', 'b', 'c'], { seed: 101 });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) {
            const n = noise(x, y, 71);
            if (n > 0.972) set(g, x, y, 'R');
            else if (n > 0.90) set(g, x, y, 'r');
          }
        return g;
      },
    },
    {
      key: 'tile_grass_brook',
      ramp: ['d', 'e', 'f'], rimLit: 'D', rimDark: 'E',
      depth: 8, seed: 211, rag: 1.0,
      // Ripples only catch light on their NW face. A still even sheet of blue is the thing that
      // makes water look like paint instead of water.
      texture: (g, x, y) => {
        if (noise(Math.floor(x / 2), Math.floor(y / 3), 17) > 0.9) {
          set(g, x, y, 'F'); set(g, x + 1, y + 1, 'd');
        }
      },
      fill: () => {
        const g = bed(['d', 'e', 'f'], { seed: 211 });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++)
            if (field(x, y, 211) > 0.86) { set(g, x, y, 'F'); set(g, x + 1, y + 1, 'd'); }
        return g;
      },
    },
  ],
});
