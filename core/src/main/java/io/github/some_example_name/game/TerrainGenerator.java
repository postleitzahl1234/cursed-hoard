package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Seeded random terrain for the map editor: 2–4 biomes painted as <b>large contiguous masses</b>
 * (jittered Voronoi over edge-anchored seeds, so every biome forms one big region touching a
 * border). Each biome mass is <b>one uniform tile</b>, drawn at random from that biome's full
 * vocabulary — so any tile can appear, but a mass never mixes tiles. <b>No water tiles</b> —
 * water stays a deliberate, hand-painted feature. Pure (no GL), unit-tested headlessly.
 */
public final class TerrainGenerator {
    /** Non-water tile vocabulary per biome; one entry is picked per generation as the mass's tile. */
    private static final String[][] BIOMES = {
        {"tile_grass_base", "tile_grass_base_alt", "tile_grass_clover", "tile_grass_fern", "tile_grass_flowers", "tile_grass_tall"},
        {"tile_mountain_base", "tile_mountain_base_alt", "tile_mountain_ice", "tile_mountain_drift", "tile_mountain_glacier"},
        {"tile_sand_base", "tile_sand_base_alt", "tile_orange_dune_base", "tile_orange_dune_ridge", "tile_orange_dune_rock"},
        {"tile_garden_lawn", "tile_garden_flowerbed", "tile_garden_parterre", "tile_garden_gearworks"},
        {"tile_shadow_base", "tile_shadow_base_alt", "tile_shadow_ash", "tile_shadow_hexwood"},
        {"tile_jungle_base", "tile_jungle_mud"},
    };

    private TerrainGenerator() {}

    /** Replace the blueprint's terrain layer (rotations reset; overlay/decor untouched). */
    public static long generate(MapBlueprint bp, long seed) {
        Random rng = new Random(seed);
        int W = MapBlueprint.COLS, H = MapBlueprint.ROWS;

        // pick 2–4 distinct biomes; anchor each seed on a different border so masses stay large
        List<Integer> order = new ArrayList<>();
        for (int i = 0; i < BIOMES.length; i++) order.add(i);
        Collections.shuffle(order, rng);
        int count = 2 + rng.nextInt(3);
        int[][] seeds = new int[count][2];   // x, y
        String[] seedTile = new String[count];   // ONE uniform tile per biome mass, from its full set
        for (int i = 0; i < count; i++) {
            int side = i % 4;
            int x = side == 0 ? 0 : side == 1 ? W - 1 : rng.nextInt(W);
            int y = side == 2 ? 0 : side == 3 ? H - 1 : rng.nextInt(H);
            seeds[i] = new int[] {x, y};
            String[] pal = BIOMES[order.get(i)];
            seedTile[i] = pal[rng.nextInt(pal.length)];
        }

        // jittered-Voronoi paint (Manhattan distance + per-cell noise keeps borders organic)
        for (int c = 0; c < W; c++) {
            for (int r = 0; r < H; r++) {
                int best = 0, bestD = Integer.MAX_VALUE;
                for (int i = 0; i < count; i++) {
                    int d = Math.abs(c - seeds[i][0]) + Math.abs(r - seeds[i][1]) + rng.nextInt(5);
                    if (d < bestD) { bestD = d; best = i; }
                }
                bp.terrain[c][r] = seedTile[best];
                bp.terrainRot[c][r] = 0;
            }
        }
        bp.baseTile = seedTile[0];
        return seed;
    }
}
