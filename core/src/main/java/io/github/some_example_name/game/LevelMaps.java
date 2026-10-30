package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * The 25 authored campaign maps (5 worlds × 5 levels), built as {@link MapBlueprint}s and shipped
 * as {@code assets/maps/w<W>_l<L>.map} (see {@code MapExporter}); the map editor can open and
 * re-save any of them. Design rules (researched TD layout practice — 2–4 chokepoints, curving
 * lanes, corridor + AoE-overlap + long-range build spots):
 * <ul>
 *   <li>every path is a hand-placed waypoint polyline stamped 2 tiles wide, never touching the
 *       map border, unique per level (no two levels share a layout);</li>
 *   <li>each world uses its own biome tile family with texture variety, plus water areas
 *       (brooks, frozen rivers, oases, canals, cursed pools) that block building;</li>
 *   <li>hostile structures sit close to the lane or at the end of a short 2-wide sub-path
 *       spurring off the main path; composition follows {@link HostileBuildings};</li>
 *   <li>obstacle clusters crowd the inner elbows of turns — prime tower ground once felled.</li>
 * </ul>
 * Pure Java (no GL) so it is unit-testable and exportable headlessly.
 */
public final class LevelMaps {
    private LevelMaps() {}

    public static final int WORLDS = 5, LEVELS = 5;

    // ── per-world palettes ────────────────────────────────────────────────────
    private static final String[] BASE = {
        "tile_grass_base", "tile_mountain_base", "tile_sand_base", "tile_garden_lawn", "tile_shadow_base"};
    private static final String[][] VARIETY = {
        {"tile_grass_base_alt", "tile_grass_clover", "tile_grass_fern", "tile_grass_flowers", "tile_grass_tall"},
        {"tile_mountain_base_alt", "tile_mountain_drift", "tile_mountain_scree",
         "tile_mountain_pine_snow", "tile_mountain_ice"},
        {"tile_sand_base_alt", "tile_sand_cracked", "tile_orange_dune_ridge", "tile_orange_dune_rock"},
        // gearworks is deliberately absent: a brass machine floor scattered at 14% over a lawn
        // reads as confetti. It stays paintable in the editor, placed on purpose.
        {"tile_garden_flowerbed", "tile_garden_topiary", "tile_garden_gravel", "tile_garden_hedge"},
        {"tile_shadow_base_alt", "tile_shadow_bone", "tile_shadow_obsidian", "tile_shadow_ash"}};
    private static final String[] PATH = {
        "tile_grass_path", "tile_mountain_path", "tile_sand_path", "tile_garden_path", "tile_shadow_path"};
    private static final String[] WATER = {
        "tile_grass_brook", "tile_mountain_frozen_river", "tile_sand_oasis_water",
        "tile_garden_canal", "tile_shadow_cursed_water"};
    private static final String[][] TREES = {
        {"obstacle_tree_oak", "obstacle_tree_birch", "obstacle_tree_willow", "obstacle_bush_bramble"},
        {"obstacle_tree_pine", "obstacle_tree_ashwood"},
        {"obstacle_tree_palm", "obstacle_bush_bramble"},
        {"obstacle_tree_blossom", "obstacle_tree_willow"},
        {"obstacle_tree_hexwood", "obstacle_tree_ashwood"}};
    private static final String[] MINOR_BLD = {
        "bld_grass_village", "bld_mountain_tavern", "bld_sand_palm_spring",
        "bld_garden_power_station", "bld_shadow_pool"};
    private static final String[] MAJOR_BLD = {
        "bld_grass_castle", "bld_mountain_citadel", "bld_sand_stronghold",
        "bld_garden_laboratory", "bld_shadow_cursed_portal"};
    /**
     * Secondary biome patch per world — a large mass in one corner. Every world now has one;
     * W2, W4 and W5 were null, which was a large part of why their five levels were
     * interchangeable (see the audit in redesign/PLAYFIELD.md §8).
     */
    private static final String[][] PATCH = {
        {"tile_jungle_base", "tile_jungle_mud"},                  // grasslands → jungle fringe
        {"tile_mountain_glacier", "tile_mountain_ice"},           // mountains → glacier field
        {"tile_orange_dune_base", "tile_orange_dune_base_alt"},   // sand → orange dunes
        {"tile_garden_parterre", "tile_garden_gearworks"},        // gardens → formal/industrial quarter
        {"tile_shadow_ash", "tile_shadow_hexwood"}};              // shadow → ash waste

    /**
     * Hand-designed waypoint polylines (blueprint coords, row 0 = top; each point anchors a 2×2
     * stamp). Axis-aligned segments; parallel lanes are kept ≥3 anchors apart so the two-wide
     * lanes never merge, and no polyline self-intersects (the hero route stays unambiguous).
     */
    /**
     * Tiles with an "up", which must never be given a quarter-turn. Everything else on the ground
     * is isotropic noise and rotates freely — that is what keeps the 32 px grid invisible — but
     * the Royal Gardens lawn is *mown stripes*, and rotating it turns a formal lawn into a
     * patchwork quilt.
     */
    private static final java.util.Set<String> ORIENTED = new java.util.HashSet<>(java.util.Arrays.asList(
        // Royal Gardens: mown stripes, ruled beds, a diagonal lattice, NW-lit hedges.
        "tile_garden_lawn", "tile_garden_flowerbed", "tile_garden_parterre",
        "tile_garden_gearworks", "tile_garden_hedge",
        // Sea of Sand: wind ripples run one way across a desert; rotating them wove the field
        // into a herringbone basket.
        "tile_sand_base", "tile_sand_base_alt",
        "tile_orange_dune_base", "tile_orange_dune_base_alt", "tile_orange_dune_ridge",
        // Roads too, where the road has a grain: the caravan track carries wind ripples and the
        // garden path is laid in mortar courses. The other three lanes are isotropic grit.
        "tile_sand_path", "tile_garden_path"));

    private static final int[][][] WAYPOINTS = {
        // W1 Great Grasslands — rolling S-bends
        {{1, 4}, {25, 4}, {25, 10}, {7, 10}, {7, 16}, {34, 16}},
        {{1, 16}, {12, 16}, {12, 4}, {22, 4}, {22, 16}, {36, 16}},
        {{1, 10}, {9, 10}, {9, 3}, {20, 3}, {20, 16}, {31, 16}, {31, 8}, {37, 8}},
        {{1, 3}, {14, 3}, {14, 8}, {5, 8}, {5, 14}, {22, 14}, {22, 5}, {31, 5}, {31, 16}, {37, 16}},
        {{1, 15}, {8, 15}, {8, 6}, {18, 6}, {18, 15}, {28, 15}, {28, 3}, {37, 3}},
        // W2 Holy Mountains — switchbacks
        {{1, 3}, {30, 3}, {30, 8}, {6, 8}, {6, 13}, {32, 13}, {32, 17}, {12, 17}},
        {{1, 6}, {34, 6}, {34, 11}, {4, 11}, {4, 16}, {30, 16}},
        {{1, 13}, {9, 13}, {9, 4}, {24, 4}, {24, 10}, {34, 10}, {34, 16}, {5, 16}},
        {{1, 17}, {15, 17}, {15, 9}, {27, 9}, {27, 3}, {7, 3}, {7, 6}, {13, 6}},
        {{1, 4}, {26, 4}, {26, 9}, {6, 9}, {6, 14}, {28, 14}, {28, 17}, {6, 17}},
        // W3 Sea of Sand — wide dune arcs
        {{1, 16}, {13, 16}, {13, 7}, {27, 7}, {27, 16}, {37, 16}},
        {{1, 5}, {6, 5}, {6, 11}, {19, 11}, {19, 17}, {35, 17}, {35, 6}},
        {{1, 4}, {25, 4}, {25, 13}, {10, 13}, {10, 17}, {32, 17}},
        {{1, 9}, {18, 9}, {18, 3}, {31, 3}, {31, 14}, {5, 14}, {5, 17}, {14, 17}},
        {{1, 17}, {14, 17}, {14, 5}, {22, 5}, {22, 17}, {30, 17}, {30, 8}, {37, 8}},
        // W4 Royal Gardens — formal geometry
        {{1, 12}, {16, 12}, {16, 4}, {34, 4}, {34, 16}, {21, 16}},
        {{1, 6}, {12, 6}, {12, 15}, {24, 15}, {24, 6}, {35, 6}, {35, 16}},
        {{1, 17}, {7, 17}, {7, 10}, {19, 10}, {19, 3}, {31, 3}, {31, 13}, {37, 13}},
        {{1, 4}, {20, 4}, {20, 9}, {9, 9}, {9, 14}, {26, 14}, {26, 9}, {37, 9}},
        {{1, 3}, {35, 3}, {35, 16}, {4, 16}, {4, 10}, {18, 10}, {18, 13}},
        // W5 Shadow Realm — jagged combs
        {{1, 9}, {7, 9}, {7, 3}, {14, 3}, {14, 9}, {21, 9}, {21, 3}, {28, 3}, {28, 12}, {35, 12}},
        {{1, 15}, {9, 15}, {9, 6}, {17, 6}, {17, 15}, {25, 15}, {25, 6}, {33, 6}, {33, 16}},
        {{1, 3}, {18, 3}, {18, 9}, {6, 9}, {6, 15}, {22, 15}, {22, 9}, {34, 9}, {34, 16}},
        {{1, 16}, {10, 16}, {10, 10}, {24, 10}, {24, 4}, {34, 4}, {34, 14}, {16, 14}},
        {{1, 13}, {6, 13}, {6, 4}, {15, 4}, {15, 13}, {23, 13}, {23, 4}, {31, 4}, {31, 16}, {17, 16}},
    };

    /** Water features per level: {c, r, radius} blobs. Strips are derived per world below. */
    private static final int[][][] WATER_BLOBS = {
        {{16, 2, 2}}, {{28, 3, 1}, {9, 2, 1}}, {{22, 4, 1}}, {{12, 2, 2}}, {{20, 3, 1}, {30, 2, 1}},
        // W2 L1's frozen river occupies the open southwest basin, clear of the switchback.
        {{3, 18, 3}}, {{18, 4, 3}}, {{16, 18, 2}, {31, 17, 2}}, {{22, 18, 3}}, {{16, 11, 2}, {11, 18, 2}},
        {{20, 12, 3}}, {{25, 15, 2}, {11, 4, 2}}, {{16, 9, 3}}, {{25, 15, 2}, {10, 4, 2}}, {{6, 8, 3}},
        {{9, 6, 2}, {27, 20, 2}}, {{6, 18, 3}}, {{19, 6, 2}, {21, 20, 2}}, {{11, 16, 3}}, {{11, 5, 2}, {24, 19, 2}},
        {{5, 19, 2}, {14, 16, 2}}, {{13, 10, 3}}, {{17, 20, 2}, {33, 5, 2}}, {{22, 5, 3}}, {{4, 7, 2}, {31, 16, 2}},
    };

    // ── public API ────────────────────────────────────────────────────────────

    /** Build the authored blueprint for a level (worldIndex, levelIndex both 0-based). */
    public static MapBlueprint build(int worldIndex, int levelIndex) {
        int w = clamp(worldIndex, 0, WORLDS - 1), l = clamp(levelIndex, 0, LEVELS - 1);
        int id = w * LEVELS + l;
        Random rng = new Random(1000L + id);      // deterministic scatter per level
        MapBlueprint bp = new MapBlueprint();
        bp.name = "w" + (w + 1) + "_l" + (l + 1);
        bp.fill(BASE[w]);

        paintVariety(bp, w, l, rng);
        // Patch on three levels of every five, in a level-dependent corner, so a world's levels
        // differ in where their second biome sits as well as in whether they have one.
        if (PATCH[w] != null && l % 5 != 1 && l % 5 != 3) paintPatch(bp, PATCH[w], l + w, rng);

        List<int[]> route = carvePath(bp, WAYPOINTS[id], PATH[w]);
        extendSpawnToBorder(bp, WAYPOINTS[id], route, PATH[w]);
        paintWater(bp, w, WATER_BLOBS[id], rng);
        markSpawnAndCave(bp, route);

        placeBuildings(bp, w, l, route, PATH[w], rng);
        placeObstacleElbows(bp, w, WAYPOINTS[id], rng);
        if (w <= 1) paintForests(bp, w, rng);      // grasslands + mountains read as real woods
        scatterObstacles(bp, w, route, rng);
        return bp;
    }

    /** The canonical file name for a level's exported blueprint. */
    public static String fileName(int worldIndex, int levelIndex) {
        return "maps/w" + (worldIndex + 1) + "_l" + (levelIndex + 1) + ".map";
    }

    // ── painting helpers ──────────────────────────────────────────────────────

    /**
     * Each level gets its OWN slice of its world's variety tiles, at its own density.
     *
     * <p>Measured before this existed: within a world all five levels used an identical palette
     * and <b>zero tiles were unique to any one level</b>. The lanes were individual — 17% mean
     * overlap — but the ground under them was not, so a world's five levels read as one place
     * five times over. A rotating subset fixes it without touching world identity: W1 L1 is a
     * clover meadow, L3 is fern woodland, L5 is tall grass, and all three are unmistakably the
     * Great Grasslands.
     */
    private static String[] varietyFor(int w, int l) {
        String[] v = VARIETY[w];
        int take = 2 + (l % 2);                       // 2 or 3 of them, alternating by level
        String[] out = new String[take];
        for (int i = 0; i < take; i++) out[i] = v[(l * 2 + i) % v.length];
        return out;
    }

    /** Density varies per level too: an open field and a crowded one are different places. */
    private static final int[] VARIETY_DENSITY = {10, 17, 13, 22, 15};

    /** Scatter this level's variety tiles (plus random rotation on uniform bases) over the base. */
    private static void paintVariety(MapBlueprint bp, int w, int l, Random rng) {
        String[] var = varietyFor(w, l);
        int dens = VARIETY_DENSITY[l % 5];
        for (int c = 0; c < MapBlueprint.COLS; c++)
            for (int r = 0; r < MapBlueprint.ROWS; r++) {
                int roll = rng.nextInt(100);
                // A variety tile keeps its orientation (blades and ferns have an up); the plain
                // bed is isotropic noise and is ALWAYS rotated. Rotating only a third of them
                // left the majority identical and unrotated, and 40 columns of the same 32 px
                // tile is a visible checkerboard.
                if (roll < dens) bp.terrain[c][r] = var[rng.nextInt(var.length)];
                else if (!ORIENTED.contains(bp.terrain[c][r])) bp.terrainRot[c][r] = rng.nextInt(4);
            }
    }

    /** A large secondary-biome mass anchored in a level-dependent corner (Voronoi-ish falloff). */
    private static void paintPatch(MapBlueprint bp, String[] patch, int l, Random rng) {
        int sc = (l % 4 < 2) ? MapBlueprint.COLS - 2 : 1;
        int sr = (l % 4 % 2 == 0) ? 1 : MapBlueprint.ROWS - 2;
        for (int c = 0; c < MapBlueprint.COLS; c++)
            for (int r = 0; r < MapBlueprint.ROWS; r++) {
                int d = Math.abs(c - sc) + Math.abs(r - sr) + rng.nextInt(4);
                if (d < 14) bp.terrain[c][r] = patch[rng.nextInt(patch.length)];
            }
    }

    /** Stamp the 2-wide lane along the polyline; returns the ordered anchor route. */
    private static List<int[]> carvePath(MapBlueprint bp, int[][] pts, String pathTile) {
        List<int[]> route = new ArrayList<>();
        int c = pts[0][0], r = pts[0][1];
        stamp(bp, c, r, pathTile);
        route.add(new int[] {c, r});
        for (int i = 1; i < pts.length; i++) {
            int tc = pts[i][0], tr = pts[i][1];
            while (c != tc || r != tr) {           // axis-aligned walk (col first, then row)
                if (c != tc) c += Integer.signum(tc - c);
                else r += Integer.signum(tr - r);
                stamp(bp, c, r, pathTile);
                route.add(new int[] {c, r});
            }
        }
        return route;
    }

    /**
     * Continue the first segment backwards until the lane reaches the very map border, so heroes
     * visibly march in from off-map. The border cells are prepended to the route (the SPAWN marker
     * lands on the outermost cell).
     */
    private static void extendSpawnToBorder(MapBlueprint bp, int[][] pts, List<int[]> route, String pathTile) {
        // outward = away from the second waypoint, continuing the first segment's axis
        int dc = Integer.signum(pts[0][0] - pts[1][0]);
        int dr = Integer.signum(pts[0][1] - pts[1][1]);
        if (dc == 0 && dr == 0) dc = -1;
        int c = pts[0][0], r = pts[0][1];
        List<int[]> prefix = new ArrayList<>();
        for (int guard = 0; guard < MapBlueprint.COLS; guard++) {
            int nc = c + dc, nr = r + dr;
            // stop once the stamp already touches the border on the travel axis
            boolean atBorder = (dc < 0 && c == 0) || (dc > 0 && c >= MapBlueprint.COLS - 2)
                    || (dr < 0 && r == 0) || (dr > 0 && r >= MapBlueprint.ROWS - 2);
            if (atBorder) break;
            c = nc;
            r = nr;
            stamp(bp, c, r, pathTile);
            prefix.add(0, new int[] {c, r});
        }
        route.addAll(0, prefix);
    }

    /** A road tile is isotropic, so every lane cell takes a rotation keyed to its position —
     *  an unrotated run of 30 identical road tiles is the most obvious lattice on the map. */
    private static int cellRot(int c, int r) {
        return (c * 7 + r * 13 + ((c * r) & 3)) & 3;
    }

    private static void stamp(MapBlueprint bp, int c, int r, String pathTile) {
        for (int dc = 0; dc <= 1; dc++)
            for (int dr = 0; dr <= 1; dr++)
                if (MapBlueprint.inBounds(c + dc, r + dr)) {
                    bp.terrain[c + dc][r + dr] = pathTile;
                    bp.terrainRot[c + dc][r + dr] =
                            ORIENTED.contains(pathTile) ? 0 : cellRot(c + dc, r + dr);
                    bp.overlay[c + dc][r + dr] = MapBlueprint.Overlay.PATH;
                }
    }

    /**
     * Water areas in the world's own idiom (the water tiles differ in kind): grasslands get
     * winding brook <i>streams</i>, gardens get straight formal <i>canals</i>, mountains/sand/
     * shadow get frozen-lake / oasis / cursed-pool <i>blobs</i>. Never paints over the lane, so
     * a stream crossing it reads as a culvert under the road.
     */
    private static void paintWater(MapBlueprint bp, int w, int[][] specs, Random rng) {
        String waterTile = WATER[w];
        for (int si = 0; si < specs.length; si++) {
            int[] b = specs[si];
            if (w == 0) {                       // brook: a meandering stream flowing downhill
                int c = b[0], r = b[1], len = 6 + b[2] * 5;
                for (int k = 0; k < len; k++) {
                    boolean down = rng.nextInt(4) != 0;   // mostly downward, jinking sideways
                    setWater(bp, c, r, waterTile, down ? 0 : 1);
                    if (down) r++;
                    else c += rng.nextBoolean() ? 1 : -1;
                }
            } else if (w == 3) {                // canal: a formal channel crossing the whole map
                boolean horizontal = si % 2 == 0;
                int span = horizontal ? MapBlueprint.COLS : MapBlueprint.ROWS;
                for (int k = 0; k < span; k++)
                    setWater(bp, horizontal ? k : b[0], horizontal ? b[1] : k,
                            waterTile, horizontal ? 1 : 0);
            } else {                            // lake / oasis / pool: organic blob
                for (int c = b[0] - b[2]; c <= b[0] + b[2]; c++)
                    for (int r = b[1] - b[2]; r <= b[1] + b[2]; r++) {
                        int d = Math.abs(c - b[0]) + Math.abs(r - b[1]);
                        if (d <= b[2] + (rng.nextInt(3) - 1)) setWater(bp, c, r, waterTile, 0);
                    }
            }
        }
    }

    private static void setWater(MapBlueprint bp, int c, int r, String waterTile, int rot) {
        if (!MapBlueprint.inBounds(c, r)) return;
        if (bp.overlay[c][r] != MapBlueprint.Overlay.NONE) return;
        bp.terrain[c][r] = waterTile;
        bp.terrainRot[c][r] = rot;
    }

    private static void markSpawnAndCave(MapBlueprint bp, List<int[]> route) {
        int[] s = route.get(0), e = route.get(route.size() - 1);
        bp.overlay[s[0]][s[1]] = MapBlueprint.Overlay.SPAWN;
        bp.overlay[e[0] + 1][e[1]] = MapBlueprint.Overlay.CAVE;   // inside the 2×2 end stamp
    }

    /**
     * Hostile settlement: {@link HostileBuildings} composition, placed at spaced fractions along
     * the route, offset 3–5 cells to the side. Majors get a 2-wide sub-path spur connecting the
     * lane to their doorstep.
     */
    private static void placeBuildings(MapBlueprint bp, int w, int l, List<int[]> route,
                                       String pathTile, Random rng) {
        int minors = HostileBuildings.minorCount(l), majors = HostileBuildings.majorCount(l);
        int total = minors + majors;
        for (int k = 0; k < total; k++) {
            boolean major = k >= minors;
            float t = 0.12f + 0.76f * (k / (float) Math.max(1, total - 1));
            boolean placed = false;
            // sweep outward from the ideal spot along the route until a free 3×2 site appears
            for (int a = 0; a < 20 && !placed; a++) {
                float jt = t + (a % 2 == 0 ? 1 : -1) * (a / 2) * 0.04f;
                int idx = clamp(Math.round(jt * (route.size() - 1)), 1, route.size() - 2);
                int[] at = route.get(idx);
                int[] dir = routeDir(route, idx);
                int[] n = {-dir[1], dir[0]};                   // perpendicular
                // Prefer the side that puts the building NORTH of the lane in editor space.
                // Sprites are foot-anchored and rise up the screen, so a building south of the
                // road would draw its 96 px mass straight over the road and hide the units on it.
                int first = n[1] != 0 ? (n[1] > 0 ? -1 : 1) : ((k % 2 == 0) ? 1 : -1);
                int[] sides = {first, -first};
                for (int s = 0; s < 2 && !placed; s++) {
                    int side = sides[s];
                    for (int off = 2; off <= 5 && !placed; off++) {
                        int bc = at[0] + n[0] * off * side - 1, br = at[1] + n[1] * off * side;
                        if (!freeForBuilding(bp, bc, br, 0)) continue;
                        bp.decor[bc][br] = major ? MAJOR_BLD[w] : MINOR_BLD[w];
                        if (major) spur(bp, at, n, side, off, bc, br, pathTile);
                        placed = true;
                    }
                }
            }
        }
        // decorative economy pair near the spawn (uses the gold-mine / mana-well tiers)
        int[] s = route.get(Math.min(4, route.size() - 1));
        int mineTier = (w % 3) + 1, wellTier = ((w + 1) % 3) + 1;
        placeDecorNear(bp, s, "bld_gold_mine_t" + mineTier, rng);
        placeDecorNear(bp, s, "bld_mana_well_t" + wellTier, rng);
    }

    /** A short 2-wide PATH spur from the lane toward a major keep (the "sub-path" access road),
     *  stamped cell-by-cell so it never bleeds into the keep's 3×2 footprint. */
    private static void spur(MapBlueprint bp, int[] at, int[] n, int side, int off,
                             int bc, int br, String pathTile) {
        for (int k = 1; k < off - 1; k++) {
            int c = at[0] + n[0] * k * side, r = at[1] + n[1] * k * side;
            for (int dc = 0; dc <= 1; dc++)
                for (int dr = 0; dr <= 1; dr++) {
                    int cc = c + dc, rr = r + dr;
                    if (!MapBlueprint.inBounds(cc, rr) || bp.decor[cc][rr] != null) continue;
                    if (cc >= bc && cc <= bc + 2 && rr >= br && rr <= br + 1) continue;  // footprint
                    // Never overwrite the route endpoints. A spur that lands on the cave cell
                    // used to demote it back to plain PATH, and BlueprintLevel's BFS then had no
                    // destination at all — an unplayable level. Latent until a lane ended near a
                    // major keep; w5_l5 on the 40x22 grid is exactly that case.
                    if (bp.overlay[cc][rr] == MapBlueprint.Overlay.CAVE
                            || bp.overlay[cc][rr] == MapBlueprint.Overlay.SPAWN) continue;
                    bp.terrain[cc][rr] = pathTile;
                    bp.terrainRot[cc][rr] = ORIENTED.contains(pathTile) ? 0 : cellRot(cc, rr);
                    bp.overlay[cc][rr] = MapBlueprint.Overlay.PATH;
                }
        }
    }

    private static void placeDecorNear(MapBlueprint bp, int[] s, String key, Random rng) {
        for (int tries = 0; tries < 30; tries++) {
            int c = s[0] + rng.nextInt(11) - 5, r = s[1] + rng.nextInt(11) - 5;
            if (freeForBuilding(bp, c, r)) { bp.decor[c][r] = key; return; }
        }
    }

    private static boolean freeForBuilding(MapBlueprint bp, int c, int r) {
        return freeForBuilding(bp, c, r, 1);
    }

    /**
     * The 3×2 footprint plus a {@code buf}-cell ring must be in bounds and clear of path, water
     * and other decor.
     *
     * <p>Hostile keeps and homes are placed with {@code buf} 0 so they sit <b>directly against
     * the lane</b>: a settlement the enemy marches out of should crowd the road, and a keep three
     * cells back from it reads as unrelated scenery. Mines and wells keep {@code buf} 1 — they are
     * scattered decoration and want breathing room.
     */
    private static boolean freeForBuilding(MapBlueprint bp, int c, int r, int buf) {
        if (c < 1 || r < 1 || c + 3 > MapBlueprint.COLS - 1 || r + 2 > MapBlueprint.ROWS - 1) return false;
        for (int dc = -buf; dc <= 2 + buf; dc++)
            for (int dr = -buf; dr <= 1 + buf; dr++) {
                int cc = c + dc, rr = r + dr;
                if (!MapBlueprint.inBounds(cc, rr)) return false;
                if (bp.overlay[cc][rr] != MapBlueprint.Overlay.NONE) return false;
                if (bp.decor[cc][rr] != null) return false;
                if (isWater(bp.terrain[cc][rr])) return false;
            }
        return true;
    }

    /** Direction of travel at a route index. */
    private static int[] routeDir(List<int[]> route, int idx) {
        int i = clamp(idx, 1, route.size() - 1);
        int[] a = route.get(i - 1), b = route.get(i);
        int dc = Integer.signum(b[0] - a[0]), dr = Integer.signum(b[1] - a[1]);
        return (dc == 0 && dr == 0) ? new int[] {1, 0} : new int[] {dc, dr};
    }

    /** Tree clusters hugging the inner elbow of every turn — prime build ground once felled. */
    private static void placeObstacleElbows(MapBlueprint bp, int w, int[][] pts, Random rng) {
        String[] trees = TREES[w];
        for (int i = 1; i < pts.length - 1; i++) {
            int[] a = pts[i - 1], b = pts[i], c2 = pts[i + 1];
            int inC = Integer.signum((a[0] - b[0]) + (c2[0] - b[0]));   // toward the elbow's inside
            int inR = Integer.signum((a[1] - b[1]) + (c2[1] - b[1]));
            for (int k = 0; k < 5; k++) {
                int oc = b[0] + inC * (2 + rng.nextInt(3)) + rng.nextInt(3) - 1;
                int or = b[1] + inR * (2 + rng.nextInt(3)) + rng.nextInt(3) - 1;
                placeTree(bp, oc, or, trees[rng.nextInt(trees.length)]);
            }
        }
    }

    /**
     * Dense woodland for the forested worlds: 4–5 large, mostly homogeneous tree masses (one
     * species per mass — oaks read as an oak forest, pines as a pine forest) covering much of the
     * open ground. Trees skip the lane/water/buildings, so the woods part naturally around the
     * road — and every trunk is clearable build ground.
     */
    private static void paintForests(MapBlueprint bp, int w, Random rng) {
        String[] trees = TREES[w];
        int masses = 4 + rng.nextInt(2);
        for (int m = 0; m < masses; m++) {
            int cc = 3 + rng.nextInt(MapBlueprint.COLS - 6);
            int cr = 3 + rng.nextInt(MapBlueprint.ROWS - 6);
            int rad = 5 + rng.nextInt(3);
            String species = w == 1 ? "obstacle_tree_pine" : trees[rng.nextInt(2)];  // mountains: pines
            for (int c = cc - rad; c <= cc + rad; c++)
                for (int r = cr - rad; r <= cr + rad; r++) {
                    int d = Math.abs(c - cc) + Math.abs(r - cr);
                    if (d > rad + rng.nextInt(3) - 1) continue;
                    if (rng.nextInt(10) < 2) continue;                       // small clearings
                    String tree = rng.nextInt(10) < 8 ? species : trees[rng.nextInt(trees.length)];
                    placeTree(bp, c, r, tree);
                }
        }
    }

    /** Extra scattered trees within 2–5 cells of the lane (buildable once cut, CT-style). */
    private static void scatterObstacles(MapBlueprint bp, int w, List<int[]> route, Random rng) {
        String[] trees = TREES[w];
        for (int i = 0; i < 26; i++) {
            int[] at = route.get(rng.nextInt(route.size()));
            int oc = at[0] + rng.nextInt(11) - 5, or = at[1] + rng.nextInt(11) - 5;
            placeTree(bp, oc, or, trees[rng.nextInt(trees.length)]);
        }
    }

    private static void placeTree(MapBlueprint bp, int c, int r, String tree) {
        if (c < 1 || r < 1 || c >= MapBlueprint.COLS - 1 || r >= MapBlueprint.ROWS - 1) return;
        if (bp.overlay[c][r] != MapBlueprint.Overlay.NONE) return;
        if (bp.decor[c][r] != null || isWater(bp.terrain[c][r])) return;
        for (int dc = -1; dc <= 1; dc++)                        // keep clear of building fronts
            for (int dr = -1; dr <= 1; dr++)
                if (MapBlueprint.inBounds(c + dc, r + dr) && bp.decor[c + dc][r + dr] != null
                        && bp.decor[c + dc][r + dr].startsWith("bld_")) return;
        bp.decor[c][r] = tree;
    }

    public static boolean isWater(String tileKey) {
        return tileKey != null && (tileKey.contains("water") || tileKey.contains("brook")
                || tileKey.contains("canal") || tileKey.contains("river") || tileKey.contains("oasis"));
    }

    private static int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }
}
