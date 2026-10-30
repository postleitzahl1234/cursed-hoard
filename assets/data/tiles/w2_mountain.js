// tiles/w2_mountain.js — W2 Holy Mountains. COLD, and the only *bright* ground in the game.
//
// The design problem here is the inverse of every other biome's. Snow wants to be pale, and the
// units that walk on it are W2's bleached-robe army — pale on pale. So the bed is pushed down
// into the mid ice-blues (IC1–IC3) rather than white, and the only near-white values are kept
// for a lit drift crest. Cold reads from *hue*, not from brightness.
//
// The second identity signal is straightness: ice cracks and fissures are the one place in the
// wilderness worlds where a boundary is allowed to be a straight line, because that is what ice
// actually does. The frozen river therefore takes a lower raggedness than a brook (0.55 against
// grassland's 1.0) — a frozen watercourse is a fractured plate, not a flowing bank.

import { set } from '../lib/pixel.js';
import { noise } from '../lib/shade.js';
import { bed, field, scatter, setW, S } from '../lib/tileset.js';
import { biome } from './_biome.js';

export const META = { group: 'Tiles · W2 Holy Mountains', blurb: 'Cold ground read through hue rather than brightness: ice-blue snow bed, rock breaking through, deep drifts, glacial sheets and fissured ice, plus auto-edge kits for the packed-stone road and the frozen river.' };

const L = {
  // Snow is NEUTRAL with cold shadows. The first pass put the bed on the cyan ramp (IC1-IC3)
  // and a whole level of it read as a swimming pool — "cold" came out as "wet". Snow takes the
  // iron greys; the blue is spent only in the shadow and the catch-light, which is where cold
  // actually lives.
  g: 'IR4', h: 'IR5', i: 'IR6', G: 'IC5', H: 'IC1',      // snow bed + cold catch + cold shadow
  s: 'IC5', S: 'IC4',                                     // catch-light on a crest
  t: 'RK1', T: 'RK3', u: 'RK0', U: 'RK5',                 // rock breaking through
  d: 'AQ2', e: 'AQ3', f: 'AQ4', D: 'IC5', E: 'AQ0', F: 'IC4',  // glacial ice / frozen river
  n: 'AQ1', N: 'AQ5',                                     // fissure core / lit fracture
  // Scattered ice gets its OWN, much paler ramp. The variety tiles are strewn at 14% across the
  // whole level, so anything saturated becomes confetti — the same failure the Royal Gardens
  // flowerbeds had. Deep AQ blue stays reserved for the frozen river, which is one deliberate
  // feature per map and is *supposed* to be the thing your eye goes to.
  '1': 'IC1', '2': 'IC2', '3': 'IC3', '4': 'IC4', '5': 'IC0',
  a: 'RK2', b: 'RK3', c: 'RK4', A: 'RK6', B: 'RK0',       // packed stone road — one step up from
                                                          // the first pass, which read as tar
                                                          // against the snow rather than as stone
  p: 'PN1', P: 'PN3',                                     // snow-laden pine needles
};

const RAMP = ['g', 'h', 'i'];
const OPTS = { seed: 9, lit: 'G', dark: 'H' };

/** Straight fracture lines. Deliberately the only ruled geometry in the wilderness biomes. */
function fissures(g, count, seed, core, lit) {
  for (let i = 0; i < count; i++) {
    let x = Math.floor(noise(i, 1, seed) * S), y = Math.floor(noise(i, 2, seed + 7) * S);
    const dx = noise(i, 3, seed + 13) > 0.5 ? 1 : -1;
    const dy = 0.4 + noise(i, 4, seed + 19) * 1.2;
    const len = 7 + Math.floor(noise(i, 5, seed + 23) * 12);
    for (let s = 0; s < len; s++) {
      setW(g, Math.round(x), Math.round(y), core);
      setW(g, Math.round(x) - 1, Math.round(y), lit);   // the NW side of the crack catches
      x += dx; y += dy;
    }
  }
  return g;
}

export const { LEGEND, SPRITES } = biome({
  legend: L,
  base: {
    key: 'tile_mountain_base', ramp: RAMP, opts: OPTS,
    paint: g => scatter(g, 5, 44, (t, x, y) => { setW(t, x, y, 'G'); setW(t, x + 1, y + 1, 'H'); }),
  },

  variants: {
    // Rock breaking through the snow — the shape has to be angular, because everything else in
    // this biome is a soft drift and the contrast is the point.
    tile_mountain_base_alt: g => scatter(g, 7, 151, (t, x, y, i) => {
      const w = 3 + (i % 3), h = 2 + (i % 2);
      for (let j = 0; j < h; j++)
        for (let k = 0; k < w - j; k++) setW(t, x + k, y + j, j === 0 ? 'T' : 't');
      for (let k = 0; k < w - h; k++) setW(t, x + k, y + h, 'u');   // its own shadow
    }),

    // Deep drift: the one place near-white is spent, and only on the lit crest of a ridge.
    tile_mountain_drift: g => {
      for (let x = 0; x < S; x++) {
        const crest = 6 + Math.round(field(x, 3, 77) * 20);
        for (let y = crest; y < crest + 5 && y < S; y++) setW(g, x, y, y < crest + 2 ? 'i' : 'h');
        setW(g, x, crest - 1, 's');
        if (noise(x % S, 8, 31) > 0.72) setW(g, x, crest - 2, 'S');
      }
      return g;
    },
  },

  beds: {
    // Glassy ice: a tighter, flatter bed than snow — ice is smooth, and smooth means fewer
    // value changes, not more.
    tile_mountain_ice: () => fissures(bed(['2', '3', '4'], { seed: 88 }), 5, 300, '1', '4'),

    // Glacier: the same material one step deeper and much more heavily fractured.
    tile_mountain_glacier: () => fissures(bed(['1', '2', '3'], { seed: 122, lit: '4' }), 11, 411, '5', '4'),

    // Scree: a talus slope, all loose angular fragments and NO snow. W2 had only four variety
    // tiles, so its five levels were forced to share a palette however the generator sliced it
    // (measured: six of seven tiles appeared in all five). More material is the only real fix.
    tile_mountain_scree: () => {
      const g = bed(['t', 'a', 'b'], { seed: 167, lit: 'U', dark: 'u' });
      for (let i = 0; i < 40; i++) {
        const x = Math.floor(noise(i, 1, 173) * S), y = Math.floor(noise(i, 2, 179) * S);
        const w = 2 + Math.floor(noise(i, 3, 181) * 3), h = 1 + Math.floor(noise(i, 4, 191) * 3);
        for (let j = 0; j < h; j++)
          for (let k = 0; k < w - j; k++) setW(g, x + k, y + j, j === 0 ? 'U' : 'a');
        for (let k = 0; k < Math.max(1, w - h); k++) setW(g, x + k + 1, y + h, 'u');   // its shadow
      }
      return g;
    },

    // Snow under pines: the same bed with fallen needles and litter. Green in a world that has
    // none, so a level that uses it reads as the treeline rather than the summit.
    tile_mountain_pine_snow: () => {
      const g = bed(RAMP, { seed: 211, lit: 'G', dark: 'H' });
      for (let i = 0; i < 26; i++) {
        const x = Math.floor(noise(i, 5, 223) * S), y = Math.floor(noise(i, 6, 227) * S);
        const a = noise(i, 7, 229) * Math.PI;
        for (let k = 0; k < 4; k++)
          setW(g, x + Math.round(Math.cos(a) * k), y + Math.round(Math.sin(a) * k), k < 2 ? 'P' : 'p');
      }
      return g;
    },
  },

  layers: [
    {
      key: 'tile_mountain_path',
      ramp: ['a', 'b', 'c'], rimLit: 'A', rimDark: 'B',
      depth: 7, seed: 131, rag: 0.85,
      texture: (g, x, y) => { if (noise(x, y, 55) > 0.93) set(g, x, y, 'A'); },
      fill: () => {
        const g = bed(['a', 'b', 'c'], { seed: 131 });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) {
            const n = noise(x, y, 29);
            if (n > 0.965) set(g, x, y, 'A');
            else if (n < 0.035) set(g, x, y, 'B');
          }
        return g;
      },
    },
    {
      key: 'tile_mountain_frozen_river',
      ramp: ['d', 'e', 'f'], rimLit: 'D', rimDark: 'E',
      // A frozen watercourse is a fractured plate, not a flowing bank — so its edge is much
      // straighter than the grassland brook's, and it is the same generator that says so.
      depth: 8, seed: 233, rag: 0.55,
      texture: (g, x, y) => {
        if (noise(Math.floor(x / 3), Math.floor(y / 4), 91) > 0.9) { set(g, x, y, 'N'); set(g, x + 1, y, 'n'); }
      },
      fill: () => fissures(bed(['d', 'e', 'f'], { seed: 233, lit: 'F' }), 8, 512, 'n', 'N'),
    },
  ],
});
