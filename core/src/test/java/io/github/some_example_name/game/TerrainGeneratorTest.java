package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayDeque;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** Contract for the editor's GEN mode: never water, and biomes form large contiguous masses. */
class TerrainGeneratorTest {

    private static String family(String tile) {
        // biome family by key prefix; dune belongs to sand, jungle is its own
        if (tile.startsWith("tile_grass_")) return "grass";
        if (tile.startsWith("tile_mountain_")) return "mountain";
        if (tile.startsWith("tile_sand_") || tile.startsWith("tile_orange_dune_")) return "sand";
        if (tile.startsWith("tile_garden_")) return "garden";
        if (tile.startsWith("tile_shadow_")) return "shadow";
        if (tile.startsWith("tile_jungle_")) return "jungle";
        return "other";
    }

    @Test
    void generatedTerrainHasNoWaterAndLargeBiomeMasses() {
        for (long seed = 1; seed <= 8; seed++) {
            MapBlueprint bp = new MapBlueprint();
            TerrainGenerator.generate(bp, seed);

            // 1) no water tiles, ever
            for (int c = 0; c < MapBlueprint.COLS; c++)
                for (int r = 0; r < MapBlueprint.ROWS; r++) {
                    String t = bp.terrain[c][r];
                    assertNotNull(t);
                    assertFalse(t.contains("water") || t.contains("brook") || t.contains("canal")
                            || t.contains("river") || t.contains("oasis"),
                            "seed " + seed + " produced water tile " + t);
                }

            // 2) each biome mass is ONE uniform tile: distinct tiles == distinct families
            Map<String, Integer> total = new HashMap<>();
            java.util.Set<String> tiles = new java.util.HashSet<>();
            Map<String, String> famTile = new HashMap<>();
            for (int c = 0; c < MapBlueprint.COLS; c++)
                for (int r = 0; r < MapBlueprint.ROWS; r++) {
                    String t = bp.terrain[c][r];
                    String fam = family(t);
                    total.merge(fam, 1, Integer::sum);
                    tiles.add(t);
                    String prev = famTile.putIfAbsent(fam, t);
                    if (prev != null) assertEquals(prev, t, "seed " + seed + " family " + fam + " mixes tiles");
                }
            assertTrue(total.size() >= 2, "seed " + seed + " produced only " + total.keySet());
            assertEquals(total.size(), tiles.size(), "seed " + seed + ": expected one uniform tile per biome");

            for (String fam : total.keySet()) {
                int largest = largestComponent(bp, fam);
                assertTrue(largest >= Math.max(60, (int) (total.get(fam) * 0.7f)),
                        "seed " + seed + " family " + fam + ": largest mass " + largest
                                + " of " + total.get(fam) + " cells is too fragmented");
            }
        }
    }

    @Test
    void acrossSeedsTheWholeTileVocabularyIsReachable() {
        java.util.Set<String> seen = new java.util.HashSet<>();
        for (long seed = 1; seed <= 300; seed++) {
            MapBlueprint bp = new MapBlueprint();
            TerrainGenerator.generate(bp, seed);
            for (int c = 0; c < MapBlueprint.COLS; c++)
                for (int r = 0; r < MapBlueprint.ROWS; r++) seen.add(bp.terrain[c][r]);
        }
        // 26 tiles across the six biome vocabularies — uniform masses must still reach ~all of them
        assertTrue(seen.size() >= 24, "only " + seen.size() + " distinct tiles appeared: " + seen);
    }

    private int largestComponent(MapBlueprint bp, String fam) {
        boolean[][] seen = new boolean[MapBlueprint.COLS][MapBlueprint.ROWS];
        int best = 0;
        for (int c = 0; c < MapBlueprint.COLS; c++)
            for (int r = 0; r < MapBlueprint.ROWS; r++) {
                if (seen[c][r] || !family(bp.terrain[c][r]).equals(fam)) continue;
                int size = 0;
                ArrayDeque<int[]> q = new ArrayDeque<>();
                q.add(new int[] {c, r});
                seen[c][r] = true;
                while (!q.isEmpty()) {
                    int[] cur = q.poll();
                    size++;
                    int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
                    for (int[] d : dirs) {
                        int nc = cur[0] + d[0], nr = cur[1] + d[1];
                        if (!MapBlueprint.inBounds(nc, nr) || seen[nc][nr]) continue;
                        if (!family(bp.terrain[nc][nr]).equals(fam)) continue;
                        seen[nc][nr] = true;
                        q.add(new int[] {nc, nr});
                    }
                }
                best = Math.max(best, size);
            }
        return best;
    }
}
