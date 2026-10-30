// tiles/w3_sand.js — W3 Sea of Sand. Two related deserts, and they have to stay apart.
//
// This world ships the only *pair* of base biomes that share a material: pale sand and the
// orange dunes that patch over it on odd levels. Recolouring one into the other would give two
// beds that read as a lighting change rather than as two places. So the separation is
// structural, not chromatic:
//
//   * sand is FLAT — wind ripples, low relief, almost no cast shadow;
//   * orange dune is RELIEF — long crested ridges with a real lit face and a real dark face.
//
// Same palette family, opposite surface. You can tell them apart in greyscale, which is the
// test that matters.
//
// The lane is a caravan track rather than a road: bone-pale, wandering, worn by feet rather
// than cut. The oasis is the only saturated thing in the biome and it is teal, so it reads as
// water in a place where everything else is warm.

import { set } from '../lib/pixel.js';
import { noise } from '../lib/shade.js';
import { bed, field, scatter, setW, S } from '../lib/tileset.js';
import { biome } from './_biome.js';

export const META = { group: 'Tiles · W3 Sea of Sand', blurb: 'Two deserts held apart by surface rather than colour: flat wind-rippled sand against high-relief orange dunes with lit and shadowed faces, plus rock outcrops, a worn caravan track and a teal oasis.' };

const L = {
  g: 'SD1', h: 'SD2', i: 'SD3', G: 'SD4', H: 'SD0',      // pale sand bed
  j: 'SD3', k: 'SD4', l: 'SD5', J: 'SD6', W: 'GD1',      // orange dune bed + crest
  m: 'SD2', M: 'GD2',                                     // slip face — ONE step under the bed.
                                                          // A dark brown slip on pale sand came
                                                          // out as black worms crawling over the
                                                          // dunes; relief is a small step, often.
  t: 'RK2', T: 'RK4', u: 'RK0', U: 'RK5',                 // rock outcrop
  a: 'BN3', b: 'BN4', c: 'BN5', A: 'BN6', B: 'BN1',       // caravan track — PALER than the sand.
                                                          // A track is where feet have scoured
                                                          // the dark crust off; the first pass
                                                          // made it darker than the desert, which
                                                          // reads as a stone road, not a trail.
  d: 'TX1', e: 'TX2', f: 'TX3', D: 'TX4', E: 'TX0', F: 'IC4',   // oasis water
  p: 'GB2', P: 'GB4',                                     // the only green in the world
};

const RAMP = ['g', 'h', 'i'];
const OPTS = { seed: 13, lit: 'G', dark: 'H' };

/**
 * Wind ripples: long, shallow, almost parallel. Flat surface, so almost no shadow.
 *
 * The frequencies MUST be integer multiples of 2pi/32. The first version used raw radians
 * (0.55, 0.22), which does not close on the tile — so every cell started its wave mid-phase and
 * the desert came out as a hard herringbone basket-weave, the single worst lattice in the
 * project. A wave that tiles has an integer number of periods per cell; there is no other way.
 */
const K = 2 * Math.PI / S;
function ripple(g, seed, lit, dark) {
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const w = Math.sin(K * (2 * x + y) + field(x, y, seed) * 1.9);
      if (w > 0.93) setW(g, x, y, lit);
      else if (w < -0.96) setW(g, x, y, dark);
    }
  return g;
}

/** A dune crest: a long ridge with a lit windward face and a dark slip face. Real relief. */
function crest(g, count, seed, faceLit, faceDark, edge) {
  for (let i = 0; i < count; i++) {
    const y0 = Math.floor(noise(i, 1, seed) * S);
    const amp = 3 + noise(i, 2, seed + 5) * 5;
    const ph = noise(i, 3, seed + 11) * Math.PI * 2;
    for (let x = 0; x < S; x++) {
      const y = Math.round(y0 + Math.sin((2 * Math.PI * x) / S + ph) * amp);
      setW(g, x, y - 1, edge);                       // the crest line itself
      for (let d = 0; d < 3; d++) setW(g, x, y - 2 - d, faceLit);   // windward, toward the key
      for (let d = 0; d < 4; d++) setW(g, x, y + d, faceDark);      // slip face, away from it
    }
  }
  return g;
}

export const { LEGEND, SPRITES } = biome({
  legend: L,
  base: { key: 'tile_sand_base', ramp: RAMP, opts: OPTS, paint: g => ripple(g, 13, 'G', 'H') },

  variants: {
    tile_sand_base_alt: g => ripple(scatter(g, 4, 205,
      (t, x, y) => { setW(t, x, y, 'H'); setW(t, x + 1, y, 'h'); }), 205, 'G', 'H'),

    // Rock outcrop: angular and much darker than anything around it, so a level that scatters
    // these gets real landmarks in an otherwise featureless field.
    tile_orange_dune_rock: g => scatter(g, 6, 317, (t, x, y, i) => {
      const w = 4 + (i % 3), h = 3 + (i % 2);
      for (let j = 0; j < h; j++)
        for (let k = 0; k < w - j; k++) setW(t, x + k, y + j, j === 0 ? 'T' : 't');
      for (let k = 0; k < w - h; k++) setW(t, x + k + 1, y + h, 'u');
    }),
  },

  beds: {
    // The orange dunes. Note it is NOT the sand ramp recoloured — it is a different surface.
    tile_orange_dune_base: () => crest(bed(['j', 'k', 'l'], { seed: 61, lit: 'J', dark: 'm' }),
      2, 61, 'l', 'm', 'J'),
    tile_orange_dune_base_alt: () => crest(bed(['j', 'k', 'l'], { seed: 143, lit: 'J', dark: 'm' }),
      3, 143, 'l', 'm', 'W'),
    // A ridge tile is the same relief pushed to its limit: nothing but crests.
    tile_orange_dune_ridge: () => crest(bed(['j', 'k', 'l'], { seed: 199, dark: 'm' }),
      5, 199, 'l', 'm', 'M'),

    // A dried pan: polygonal cracks, dead flat. The opposite surface to both the rippled sand
    // and the relief dunes, so a level built on it is unmistakably somewhere else.
    tile_sand_cracked: () => {
      const g = bed(['h', 'i', 'G'], { seed: 251, dark: 'H' });
      const pts = Array.from({ length: 9 }, (_, i) =>
        [noise(i, 1, 257) * S, noise(i, 2, 263) * S]);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          // Voronoi edge: two nearest seeds almost equidistant ⇒ a crack runs through here
          const d = pts.map(([px, py]) => Math.hypot(
            Math.min(Math.abs(x - px), S - Math.abs(x - px)),
            Math.min(Math.abs(y - py), S - Math.abs(y - py)))).sort((a, b) => a - b);
          if (d[1] - d[0] < 0.9) setW(g, x, y, 'H');
          else if (d[1] - d[0] < 1.8) setW(g, x, y, 'h');
        }
      return g;
    },

    // The dune track. No edge kit — the orange dunes are a painted patch, never the biome the
    // generated route runs through, so the solid tile is all the editor needs.
    tile_orange_dune_path: () => ripple(bed(['a', 'b', 'c'], { seed: 231 }), 231, 'A', 'B'),
  },

  layers: [
    {
      key: 'tile_sand_path',
      ramp: ['a', 'b', 'c'], rimLit: 'A', rimDark: 'B',
      // A track worn by feet, not cut by a spade: the shallowest, most wandering edge in the game.
      depth: 6, seed: 167, rag: 1.0,
      texture: (g, x, y) => { if (noise(x, y, 23) > 0.94) set(g, x, y, 'A'); },
      fill: () => ripple(bed(['a', 'b', 'c'], { seed: 167 }), 167, 'A', 'B'),
    },
    {
      key: 'tile_sand_oasis_water',
      ramp: ['d', 'e', 'f'], rimLit: 'D', rimDark: 'E',
      depth: 8, seed: 271, rag: 0.9,
      // reed fringe: the oasis is the only place in W3 where anything grows, so the edge says so
      texture: (g, x, y) => {
        if (noise(Math.floor(x / 2), Math.floor(y / 3), 43) > 0.91) { set(g, x, y, 'F'); set(g, x + 1, y + 1, 'd'); }
      },
      fill: () => {
        const g = bed(['d', 'e', 'f'], { seed: 271, lit: 'F' });
        for (let i = 0; i < 7; i++) {
          const x = Math.floor(noise(i, 6, 89) * S), y = Math.floor(noise(i, 8, 97) * S);
          for (let s = 0; s < 4; s++) setW(g, x + Math.round(s * 0.3), y - s, s > 1 ? 'p' : 'P');
        }
        return g;
      },
    },
  ],
});
