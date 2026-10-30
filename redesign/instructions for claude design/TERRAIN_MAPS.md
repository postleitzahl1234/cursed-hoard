# Terrain-only campaign maps — authoring brief (claude design)

**New map architecture.** Maps are split into two layers:

1. **Terrain (you author this)** — a per-tile ground grid, *nothing else*. Each cell maps to a real
   terrain `tile_*` sprite. A single **gem-cave** marker sits **just inside one border**.
2. **Everything else (the engine draws procedurally — `game/LevelBuilder.java`)** — the **hero path**
   (a ≥3-tile-wide, border-length, naturally-curving lane that never touches the edges, from a
   spawn just inside the opposite border to the cave), the **tree obstacles**, and the **enemy
   buildings**. **Do NOT bake any of these into the terrain.**

This keeps terrain at its native tile resolution and lets the engine own all the interactive,
gameplay-critical placement.

## Deliverable

A JS module **`assets/data/terrain_maps.js`** exporting the **25** terrain grids
(5 worlds × 5 levels), plus the cave position for each. Add it to `Gallery.html`'s `MODULES` array
and to `scripts/export-sprites.mjs`.

```js
export const TERRAIN = {
  // key: "w<World>_l<Level>"  (w1_l1 … w5_l5)
  w1_l1: {
    cave: [cx, cy],            // tile coords, MUST be within 3 tiles of one border
    grid: [                    // 32 wide × 30 tall; row 0 = TOP of the field
      "aaaaAAaa…",             // each char → a tile via LEGEND below
      …                        // 30 rows of 32 chars
    ],
  },
  …
};
export const LEGEND = { a: "tile_grass_base", A: "tile_grass_base_alt", c: "tile_grass_clover", … };
```

- **Grid is 32×30** (the engine tile grid; 1 char = 1 tile). Row 0 is the **top** of the playfield.
- **Every char must map (via `LEGEND`) to a real terrain `tile_*` key** — base, alt-base, and the
  biome's detail tiles (clover/fern/flowers, ice/glacier/drift, dune ridge/rock, hedge/parterre,
  ash/hexwood…). Compose them painterly so the ground reads rich, **not a flat single tile**.
- **Water** is allowed as terrain (use the biome water tile, e.g. `tile_grass_brook`,
  `tile_sand_oasis_water`, `tile_garden_canal`): paint **calm lakes/ponds + a feeder**; keep them
  away from the cave and the four borders. The engine treats water tiles as impassable, so it routes
  the path around them — keep at least a 4-tile-wide land gap somewhere between any water body and
  each border so a path can always pass.
- **Cave**: exactly one, **within 3 tiles of a border** (the engine puts the spawn opposite). Mark
  its tile in `cave:`; you may also paint a rocky tile under it, but the cave sprite itself is drawn
  by the engine.
- **No paths, no trees/obstacles, no buildings, no spawns, no enemies.** Leave open ground — the
  engine fills it with the path, copses and the enemy settlement.

## Per-world terrain tile vocabulary (compose from these)

| World | Base | Detail / variation | Water |
|---|---|---|---|
| W1 Great Grasslands | `tile_grass_base`, `tile_grass_base_alt` | `tile_grass_clover/fern/flowers/tall`, `tile_jungle_base/mud` | `tile_grass_brook` |
| W2 Holy Mountains | `tile_mountain_base`, `tile_mountain_base_alt` | `tile_mountain_ice/glacier/drift/snow_to_ice` | `tile_mountain_frozen_river` |
| W3 Sea of Sand | `tile_sand_base`, `tile_sand_base_alt` | `tile_orange_dune_base/ridge/rock`, `tile_orange_dune_base_alt` | `tile_sand_oasis_water` |
| W4 Royal Gardens | `tile_garden_lawn`, `tile_garden_lawn_to_paver` | `tile_garden_flowerbed/hedge/parterre/gearworks` | `tile_garden_canal` |
| W5 Shadow Realm | `tile_shadow_base`, `tile_shadow_base_alt` | `tile_shadow_ash/hexwood` | `tile_shadow_cursed_water` |

## Engine integration (for reference)

`LevelBuilder.generate(seed, world)` currently fills placeholder flat terrain. When `terrain_maps.js`
ships, it reads each cell's `tile_*` key + the `cave` marker from `TERRAIN["w<W>_l<L>"]`, then draws
the path/obstacles/buildings on top. **Validate in the Gallery (0 issues)** and confirm all 25 keys
plus their legends land in `sprites.json`.
