// tiles/w4_garden.js — W4 Royal Gardens. GEOMETRIC + INDUSTRIAL, and the odd one out.
//
// Every other biome in this game is noise with motifs scattered over it. This one is not, and
// that is the whole identity: the Royal Gardens are the only place where a human being decided
// where each thing goes. So the lawn is *ruled stripes* rather than a bed, the parterre is a
// lattice on an exact diagonal pitch, the pavers are mortared on a grid, and — the signal that
// carries furthest — the canal takes raggedness 0.12 while every other water in the game takes
// 0.9 or more.
//
// That last one is worth stating plainly, because it is the payoff for making the edge kit
// parametric at all: one number turns an organic bank into masonry. Nobody had to author a
// second set of twelve pieces to get a different kind of place.
//
// The industrial half is brass. It appears only in the gearworks tile and in the odd rivet, so
// it stays a note rather than a theme — the gardens are still a garden.

import { grid, set } from '../lib/pixel.js';
import { noise } from '../lib/shade.js';
import { bed, scatter, setW, S } from '../lib/tileset.js';
import { biome } from './_biome.js';

export const META = { group: 'Tiles · W4 Royal Gardens', blurb: 'The only authored-looking ground in the game: ruled mown stripes, a diagonal parterre lattice, clipped hedges, mortared pavers and brass gear-works, with a masonry-lined canal whose banks are straight where every other water in the game wanders.' };

const L = {
  g: 'MS1', h: 'MS2', i: 'MS3', G: 'MS4', H: 'MS0',      // lawn
  j: 'GN1', J: 'GN3', k: 'PN1', K: 'PN3',                 // hedge / parterre box
  n: 'BN0', N: 'BN2',                                     // gravel — kept dark; a pale gravel
                                                          // square on a lawn reads as a hole
  y: 'GD3', Y: 'GD5', x: 'EM2', X: 'EM4', v: 'HX3', V: 'HX5',   // bedding flowers
  w: 'WD1', W: 'WD2',                                     // turned soil
  m: 'BR1', M: 'BR3', o: 'BR4', O: 'GD4', q: 'IR1', Q: 'IR4',   // brass + iron gearworks
  a: 'RK3', b: 'RK4', c: 'RK5', A: 'RK6', B: 'IK1',       // mortared pavers
  d: 'AQ2', e: 'AQ3', f: 'AQ4', D: 'IR5', E: 'IK1', F: 'IC4',   // canal (stone lip, not a bank)
};

export const { LEGEND, SPRITES } = biome({
  legend: L,

  // The lawn is the statement tile. Mown stripes: alternating bands of two adjacent greens, with
  // the roller's turn line catching the key light. No noise field at all — a noisy lawn would
  // put this world straight back in the wilderness.
  base: {
    key: 'tile_garden_lawn', ramp: ['g', 'h', 'i'], opts: { seed: 3 },
    paint: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          const band = Math.floor(y / 4) % 2;
          const jitter = noise(x, Math.floor(y / 4), 5) > 0.93 ? 1 : 0;   // a blade out of place
          set(g, x, y, band ^ jitter ? 'h' : 'g');
        }
      for (let y = 3; y < S; y += 4) for (let x = 0; x < S; x++) set(g, x, y, 'i');   // turn line
      return g;
    },
  },

  beds: {
    // Diagonal box lattice over gravel — the parterre. The pitch is exact; the only irregularity
    // permitted is which quarter gets a flower.
    tile_garden_parterre: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) set(g, x, y, noise(x, y, 9) > 0.6 ? 'n' : 'N');
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          if ((x + y) % 8 === 0 || (x - y + S * 2) % 8 === 0) set(g, x, y, 'k');
          if ((x + y) % 8 === 1 || (x - y + S * 2) % 8 === 1) set(g, x, y, 'K');
        }
      return scatter(g, 3, 77, (t, x, y, i) => setW(t, x, y, ['y', 'x', 'v'][i % 3]));
    },

    // Bedding: turned soil in ruled rows with the blooms planted on a pitch, not scattered.
    tile_garden_flowerbed: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) set(g, x, y, noise(x, y, 21) > 0.55 ? 'w' : 'W');
      // One bloom per 8 px, and the *low* value of each pair carries the head. At 14% scatter
      // density over a whole level these tiles are seen 60 times; a bright head on each turns
      // the field into confetti, which is the §3.3 failure this redesign exists to undo.
      for (let y = 3; y < S; y += 8)
        for (let x = 3; x < S; x += 8) {
          const i = ((x / 8) | 0) + ((y / 8) | 0);
          const [lo, hi] = [['y', 'Y'], ['x', 'X'], ['v', 'V']][i % 3];
          set(g, x, y, lo); set(g, x + 1, y, lo);
          if ((i & 1) === 0) set(g, x, y - 1, hi);          // only half of them catch the key
          set(g, x, y + 1, 'i');                            // stem
        }
      return g;
    },

    // Clipped hedge: a rectangular block, lit hard on its NW faces, with a real cast shadow on
    // the SE. This is the tile that has to read as *volume* rather than as dark grass.
    tile_garden_hedge: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) set(g, x, y, noise(x, y, 33) > 0.5 ? 'k' : 'j');
      for (let x = 0; x < S; x++) { set(g, x, 0, 'J'); set(g, x, 1, 'J'); }        // lit top face
      for (let y = 0; y < S; y++) { set(g, 0, y, 'J'); set(g, 1, y, 'j'); }        // lit west face
      for (let x = 0; x < S; x++) { set(g, x, S - 1, 'K'); set(g, x, S - 2, 'K'); }
      for (let y = 0; y < S; y++) { set(g, S - 1, y, 'K'); set(g, S - 2, y, 'K'); }
      for (let i = 0; i < 26; i++) {                                               // clipped tufts
        const x = Math.floor(noise(i, 4, 51) * S), y = Math.floor(noise(i, 6, 57) * S);
        set(g, x, y, 'J');
      }
      return g;
    },

    // Topiary: clipped spheres on a pitch, standing on the mown lawn. W4 had only three variety
    // tiles, so its five levels could not help sharing a palette. This is the most *garden* of
    // all of them — nothing says "someone maintains this" like a shrub cut into a ball.
    tile_garden_topiary: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) set(g, x, y, (Math.floor(y / 4) % 2) ? 'h' : 'g');
      for (let cy = 8; cy < S; cy += 16)
        for (let cx = 8; cx < S; cx += 16) {
          for (let dy = -6; dy <= 6; dy++)
            for (let dx = -6; dx <= 6; dx++) {
              if (dx * dx + dy * dy > 36) continue;
              const lit = dx + dy < -3;
              set(g, cx + dx, cy + dy, lit ? 'J' : dx + dy > 5 ? 'K' : 'k');
            }
          for (let d = 0; d < 3; d++) set(g, cx, cy + 6 + d, 'w');      // the stem
          for (let dx = -4; dx <= 4; dx++) set(g, cx + dx + 2, cy + 8, 'H');   // cast shadow
        }
      return g;
    },

    // A raked gravel court: parallel furrows, drawn to a rule. Pale, flat and empty — the visual
    // rest a garden full of flowerbeds and hedges needs.
    tile_garden_gravel: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) set(g, x, y, noise(x, y, 41) > 0.6 ? 'n' : 'N');
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          const f = (x + y * 2) % 6;
          if (f === 0) set(g, x, y, 'w');                               // furrow trough
          else if (f === 1) set(g, x, y, 'N');                          // its lit lip
        }
      return g;
    },

    // The industrial note: a riveted brass plate over an iron chassis, with one gear cut into it.
    tile_garden_gearworks: () => {
      const g = grid(S, S);
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) set(g, x, y, noise(x, y, 71) > 0.62 ? 'M' : 'm');
      for (let x = 0; x < S; x++) { set(g, x, 0, 'o'); set(g, x, S - 1, 'q'); }    // plate lip
      for (let y = 0; y < S; y++) { set(g, 0, y, 'o'); set(g, S - 1, y, 'q'); }
      for (let i = 0; i < 4; i++)                                                  // rivets
        for (let j = 0; j < 4; j++) {
          const x = 4 + i * 8, y = 4 + j * 8;
          set(g, x, y, 'O'); set(g, x + 1, y + 1, 'q');
        }
      // one gear, teeth on an exact pitch
      const cx = 16, cy = 16;
      for (let a = 0; a < 360; a += 6) {
        const t = (a * Math.PI) / 180;
        const r = (a % 30 < 15) ? 9 : 7;
        set(g, Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 'Q');
      }
      for (let a = 0; a < 360; a += 8) {
        const t = (a * Math.PI) / 180;
        set(g, Math.round(cx + Math.cos(t) * 3), Math.round(cy + Math.sin(t) * 3), 'q');
      }
      return g;
    },
  },

  layers: [
    {
      key: 'tile_garden_path',
      ramp: ['a', 'b', 'c'], rimLit: 'A', rimDark: 'B',
      // Mortared pavers are laid to a line. rag 0.18 is nearly straight but not machine-perfect;
      // exactly 0 would look like a UI element rather than like stone someone laid.
      depth: 7, seed: 181, rag: 0.18,
      texture: (g, x, y) => {
        const row = Math.floor(y / 5);
        if (y % 5 === 0 || (x + row * 3) % 7 === 0) set(g, x, y, 'B');   // mortar course
        else if (noise(x, y, 39) > 0.93) set(g, x, y, 'A');
      },
      fill: () => {
        const g = bed(['a', 'b', 'c'], { seed: 181 });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) {
            const row = Math.floor(y / 5);
            if (y % 5 === 0 || (x + row * 3) % 7 === 0) set(g, x, y, 'B');
            else if (y % 5 === 1) set(g, x, y, 'A');                     // lit top of each course
          }
        return g;
      },
    },
    {
      key: 'tile_garden_canal',
      ramp: ['d', 'e', 'f'], rimLit: 'D', rimDark: 'E',
      // THE tile that carries the biome. Every other water in the game wanders; this one is cut.
      depth: 8, seed: 307, rag: 0.12,
      texture: (g, x, y) => {
        if ((x + y * 2) % 11 === 0 && noise(x, y, 61) > 0.55) set(g, x, y, 'F');   // ruled ripples
      },
      fill: () => {
        const g = bed(['d', 'e', 'f'], { seed: 307 });
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) if ((x + y * 2) % 11 === 0 && noise(x, y, 61) > 0.5) set(g, x, y, 'F');
        return g;
      },
    },
  ],
});
