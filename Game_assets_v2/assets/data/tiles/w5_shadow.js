// tiles/w5_shadow.js — W5 Shadow Realm. The hardest biome to make legible.
//
// TROOPS_STATUS.md says W5's army is "darker than the ground it walks on". That is a lovely
// line about the units and a serious problem for the ground: if the bed goes as dark as it
// wants to, the units vanish into it and the level becomes unplayable.
//
// So this biome inverts the usual relationship. The bed sits in the IK range — genuinely dark —
// but the LANE is bone-pale, the brightest road in the game. The player reads the level by the
// road, not by the ground, and the silhouettes of dark units land on a light path. The cursed
// water is the only saturated thing here, and it is hex-violet, which no unit wears as a body
// colour.
//
// The one motif is the rune-eye, and it is used sparingly. A ground covered in glowing sigils
// is a screensaver.

import { set } from '../lib/pixel.js';
import { noise } from '../lib/shade.js';
import { bed, field, scatter, setW, S } from '../lib/tileset.js';
import { biome } from './_biome.js';

export const META = { group: 'Tiles · W5 Shadow Realm', blurb: 'A genuinely dark bed made playable by inverting the usual contrast: the ground is void-black, the lane is the palest road in the game, and hex-violet is reserved for cursed water so no unit colour competes with it.' };

const L = {
  g: 'IK2', h: 'IK3', i: 'IK4', G: 'IK5', H: 'IK0',      // void ground
  v: 'UD1', V: 'UD3', x: 'HX1', X: 'HX3',                 // curse veins / rune glow
  s: 'RK0', t: 'RK1', u: 'RK2', U: 'RK4',                 // ash
  z: 'EM1', Z: 'EM3',                                     // banked embers in the ash
  p: 'UD0', q: 'UD2', P: 'HX2', Q: 'HX4',                 // hexwood
  a: 'BN0', b: 'BN1', c: 'BN2', A: 'BN4', B: 'IK0',       // the bone road
  d: 'HX0', e: 'HX1', f: 'HX2', D: 'HX4', E: 'CR0', F: 'HX5',   // cursed water
};

const RAMP = ['g', 'h', 'i'];
const OPTS = { seed: 17, lit: 'G', dark: 'H' };

/** The rune-eye: a closed lid with one lit lash. Small, and rare. */
function runeEye(t, x, y, core, glow) {
  setW(t, x - 1, y, core); setW(t, x, y, glow); setW(t, x + 1, y, core);
  setW(t, x, y - 1, core); setW(t, x, y + 1, core);
}

export const { LEGEND, SPRITES } = biome({
  legend: L,
  base: {
    key: 'tile_shadow_base', ramp: RAMP, opts: OPTS,
    paint: g => scatter(g, 4, 29, (t, x, y) => runeEye(t, x, y, 'v', 'V')),
  },

  variants: {
    // Curse veins running under the surface: the only structure in an otherwise formless bed.
    tile_shadow_base_alt: g => {
      for (let i = 0; i < 4; i++) {
        let x = Math.floor(noise(i, 1, 133) * S), y = Math.floor(noise(i, 2, 137) * S);
        for (let s = 0; s < 16; s++) {
          setW(g, Math.round(x), Math.round(y), s % 3 === 0 ? 'x' : 'v');
          x += Math.sin(s * 0.7 + i) * 1.4;
          y += 1;
        }
      }
      return g;
    },
  },

  beds: {
    // Ash: grey, dead and *flatter* than the void ground, with embers banked in the hollows.
    // Grey next to violet-black is the reason this reads as a different surface at all.
    tile_shadow_ash: () => {
      const g = bed(['s', 't', 'u'], { seed: 53, lit: 'U', dark: 'H' });
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          if (field(x, y, 53) < 0.14) { set(g, x, y, 'z'); if (noise(x, y, 7) > 0.72) set(g, x, y, 'Z'); }
        }
      return g;
    },

    // Hexwood: a petrified root mat. Woody structure, but the wood is violet — this is the tile
    // that says the forest here died of something rather than of fire.
    tile_shadow_hexwood: () => {
      const g = bed(['p', 'g', 'q'], { seed: 79, dark: 'H' });
      for (let i = 0; i < 7; i++) {
        let x = Math.floor(noise(i, 3, 181) * S), y = Math.floor(noise(i, 4, 187) * S);
        const dx = noise(i, 5, 191) > 0.5 ? 1.1 : -1.1;
        for (let s = 0; s < 14; s++) {
          setW(g, Math.round(x), Math.round(y), 'q');
          setW(g, Math.round(x), Math.round(y) - 1, 'P');    // NW face of the root catches
          x += dx; y += 0.6;
        }
      }
      return scatter(g, 3, 199, (t, x, y) => runeEye(t, x, y, 'P', 'Q'));
    },
    // A bone field. W5's only pale material outside the road, and the one tile in the world that
    // is *lighter* than the ground rather than another shade of void.
    tile_shadow_bone: () => {
      const g = bed(RAMP, { seed: 271, lit: 'G', dark: 'H' });
      for (let i = 0; i < 22; i++) {
        const x = Math.floor(noise(i, 1, 277) * S), y = Math.floor(noise(i, 2, 281) * S);
        const a = noise(i, 3, 283) * Math.PI;
        const len = 3 + Math.floor(noise(i, 4, 293) * 4);
        for (let k = 0; k < len; k++) {
          const px = x + Math.round(Math.cos(a) * k), py = y + Math.round(Math.sin(a) * k);
          setW(g, px, py, 'c');
          setW(g, px, py - 1, 'b');                       // the NW face of the shaft catches
        }
        setW(g, x, y, 'a'); setW(g, x + Math.round(Math.cos(a) * len), y + Math.round(Math.sin(a) * len), 'a');
      }
      return g;
    },

    // Obsidian: glassy black shards standing out of the ground. Same value as the void bed, but
    // a hard specular catch instead of a matte surface — it reads by *finish*, not by colour.
    tile_shadow_obsidian: () => {
      const g = bed(['H', 'g', 'h'], { seed: 307 });
      for (let i = 0; i < 16; i++) {
        const x = Math.floor(noise(i, 5, 311) * S), y = Math.floor(noise(i, 6, 313) * S);
        const h = 4 + Math.floor(noise(i, 7, 317) * 6), w = 1 + Math.floor(noise(i, 8, 331) * 2);
        for (let d = 0; d < h; d++) {
          const wd = Math.max(0, w - Math.floor(d / 3));
          for (let k = -wd; k <= wd; k++) setW(g, x + k, y - d, k < 0 ? 'i' : 'H');
        }
        setW(g, x, y - h, 'X'); setW(g, x - 1, y - h + 1, 'x');    // the specular chip
      }
      return g;
    },
  },

  layers: [
    {
      key: 'tile_shadow_path',
      ramp: ['a', 'b', 'c'], rimLit: 'A', rimDark: 'B',
      // The brightest road in the game, on the darkest ground. See the file header — this is a
      // legibility decision, not a flourish.
      depth: 7, seed: 149, rag: 0.95,
      texture: (g, x, y) => {
        if (noise(x, y, 83) > 0.95) set(g, x, y, 'A');
        else if (noise(x, y, 84) > 0.96) set(g, x, y, 'a');
      },
      fill: () => {
        const g = bed(['a', 'b', 'c'], { seed: 149 });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) {
            const n = noise(x, y, 37);
            if (n > 0.968) set(g, x, y, 'A');
            else if (n < 0.03) set(g, x, y, 'B');
          }
        return g;
      },
    },
    {
      key: 'tile_shadow_cursed_water',
      ramp: ['d', 'e', 'f'], rimLit: 'D', rimDark: 'E',
      depth: 8, seed: 257, rag: 1.0,
      // This wanted to be a concentric pulse — rings spreading from the middle of the pool. It
      // cannot be. A motif centred in the cell is centred in EVERY cell, so a pool six tiles
      // wide came out as a grid of identical rosettes: the lattice failure in its purest form.
      // A tiling cell can hold texture, never composition. So the surface is a sparse creep of
      // hex-glints instead, and the "cursed" reading is carried by hue, which does tile.
      texture: (g, x, y) => {
        if (noise(x, y, 11) > 0.94) { set(g, x, y, 'F'); set(g, x + 1, y + 1, 'd'); }
      },
      fill: () => {
        const g = bed(['d', 'e', 'f'], { seed: 257, lit: 'F' });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) {
            if (noise(x, y, 11) > 0.945) { set(g, x, y, 'F'); set(g, x + 1, y + 1, 'd'); }
            else if (noise(x, y, 12) > 0.97) set(g, x, y, 'D');
          }
        return scatter(g, 2, 263, (t, x, y) => runeEye(t, x, y, 'd', 'D'));
      },
    },
  ],
});
