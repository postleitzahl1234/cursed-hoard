package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

/**
 * Bridges the editor/authoring format to the running game: converts a {@link MapBlueprint} into a
 * {@link GameMap} (tile roles + hero route), the hostile-building spawn list and decorative
 * pieces, while keeping the blueprint itself for exact-sprite terrain rendering (tile key +
 * rotation per cell — the game draws what the editor drew).
 *
 * <p>Coordinates: blueprint rows are top-origin, the game world is y-up; {@code gameY = ROWS-1-r}.
 * The hero route is a BFS shortest walk over PATH cells from SPAWN to CAVE, shifted onto the
 * centreline of the 2-wide lane so heroes march down the middle.</p>
 */
public final class BlueprintLevel {
    public final MapBlueprint blueprint;
    public final GameMap map;
    public final List<float[]> buildings = new ArrayList<>();      // {typeOrdinal, x, y}
    public final List<Object[]> decorPieces = new ArrayList<>();   // {spriteKey, x, y} (mines/wells)
    public final Vector2 spawn = new Vector2();
    public final Vector2 cave = new Vector2();

    private BlueprintLevel(MapBlueprint bp) {
        this.blueprint = bp;
        this.map = new GameMap();
        int R = MapBlueprint.ROWS;

        for (int c = 0; c < MapBlueprint.COLS; c++) {
            for (int r = 0; r < R; r++) {
                int y = R - 1 - r;
                String t = bp.terrain[c][r];
                String d = bp.decor[c][r];
                TileRole role;
                if (bp.overlay[c][r] == MapBlueprint.Overlay.PATH
                        || bp.overlay[c][r] == MapBlueprint.Overlay.SPAWN
                        || bp.overlay[c][r] == MapBlueprint.Overlay.CAVE) role = TileRole.PATH;
                else if (LevelMaps.isWater(t)) role = TileRole.SPECIAL;
                else if (d != null && d.startsWith("obstacle_")) role = TileRole.OBSTACLE;
                else role = TileRole.BASE;
                map.setTile(c, y, new MapTile(terrainType(t), role));

                if (d != null && d.startsWith("bld_")) {
                    float bx = (c + 1.5f) * GameMap.TILE_SIZE;              // 3×2 footprint centre
                    float by = (R - 1.5f - r) * GameMap.TILE_SIZE;
                    BuildingType bt = buildingType(d);
                    if (bt != null) buildings.add(new float[] {bt.ordinal(), bx, by});
                    else decorPieces.add(new Object[] {d, bx, by});         // gold mine / mana well
                }
            }
        }

        List<int[]> route = traceRoute(bp);
        List<Vector2> path = new ArrayList<>();
        for (int i = 0; i < route.size(); i++) {
            int[] cell = route.get(i);
            float x = cell[0] * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f;
            float y = (R - 1 - cell[1]) * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f;
            // shift onto the 2-wide lane centre: nudge halfway toward the perpendicular partner
            int[] d = stepDir(route, i);
            int pc = cell[0] - d[1], pr = cell[1] + d[0];
            int qc = cell[0] + d[1], qr = cell[1] - d[0];
            if (isLane(bp, pc, pr) && !isLane(bp, qc, qr)) {
                x += (pc - cell[0]) * GameMap.TILE_SIZE / 2f;
                y += (cell[1] - pr) * GameMap.TILE_SIZE / 2f;
            } else if (isLane(bp, qc, qr) && !isLane(bp, pc, pr)) {
                x += (qc - cell[0]) * GameMap.TILE_SIZE / 2f;
                y += (cell[1] - qr) * GameMap.TILE_SIZE / 2f;
            }
            path.add(new Vector2(x, y));
        }
        if (!path.isEmpty()) {
            spawn.set(path.get(0));
            cave.set(path.get(path.size() - 1));
            map.setCustomPath(path);
            map.cavePosition.set(cave);
        }
    }

    /** Load a level from blueprint text (the .map export format). */
    public static BlueprintLevel fromText(String text) {
        return new BlueprintLevel(MapBlueprint.parse(text));
    }

    public static BlueprintLevel fromBlueprint(MapBlueprint bp) {
        return new BlueprintLevel(bp);
    }

    /** Ordered PATH-cell walk from SPAWN to CAVE (BFS shortest; the authored lane has no forks
     *  other than dead-end building spurs, which BFS naturally ignores). */
    public static List<int[]> traceRoute(MapBlueprint bp) {
        int[] start = find(bp, MapBlueprint.Overlay.SPAWN), end = find(bp, MapBlueprint.Overlay.CAVE);
        List<int[]> out = new ArrayList<>();
        if (start == null || end == null) return out;
        int C = MapBlueprint.COLS, R = MapBlueprint.ROWS;
        int[][] prev = new int[C][R];
        for (int[] row : prev) java.util.Arrays.fill(row, -1);
        ArrayDeque<int[]> q = new ArrayDeque<>();
        q.add(start);
        prev[start[0]][start[1]] = start[0] * R + start[1];
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            if (cur[0] == end[0] && cur[1] == end[1]) break;
            for (int[] d : dirs) {
                int nc = cur[0] + d[0], nr = cur[1] + d[1];
                if (!MapBlueprint.inBounds(nc, nr) || prev[nc][nr] != -1 || !isLane(bp, nc, nr)) continue;
                prev[nc][nr] = cur[0] * R + cur[1];
                q.add(new int[] {nc, nr});
            }
        }
        if (prev[end[0]][end[1]] == -1) return out;
        int c = end[0], r = end[1];
        while (true) {
            out.add(0, new int[] {c, r});
            int p = prev[c][r];
            int pc = p / R, pr = p % R;
            if (pc == c && pr == r) break;
            c = pc;
            r = pr;
        }
        return out;
    }

    private static boolean isLane(MapBlueprint bp, int c, int r) {
        if (!MapBlueprint.inBounds(c, r)) return false;
        MapBlueprint.Overlay o = bp.overlay[c][r];
        return o == MapBlueprint.Overlay.PATH || o == MapBlueprint.Overlay.SPAWN
                || o == MapBlueprint.Overlay.CAVE;
    }

    private static int[] stepDir(List<int[]> route, int i) {
        int[] a = route.get(Math.max(0, i - 1)), b = route.get(Math.min(route.size() - 1, i + 1));
        int dc = Integer.signum(b[0] - a[0]), dr = Integer.signum(b[1] - a[1]);
        if (dc == 0 && dr == 0) return new int[] {1, 0};
        return new int[] {dc, dr};
    }

    private static int[] find(MapBlueprint bp, MapBlueprint.Overlay o) {
        for (int c = 0; c < MapBlueprint.COLS; c++)
            for (int r = 0; r < MapBlueprint.ROWS; r++)
                if (bp.overlay[c][r] == o) return new int[] {c, r};
        return null;
    }

    /** Blueprint sprite key for a game-space tile (y-up), for exact terrain rendering. */
    public String tileKey(int x, int gameY) {
        return blueprint.terrain[x][MapBlueprint.ROWS - 1 - gameY];
    }

    public int tileRot(int x, int gameY) {
        return blueprint.terrainRot[x][MapBlueprint.ROWS - 1 - gameY];
    }

    /** Obstacle decor key at a game-space tile, or null. */
    public String obstacleKey(int x, int gameY) {
        String d = blueprint.decor[x][MapBlueprint.ROWS - 1 - gameY];
        return d != null && d.startsWith("obstacle_") ? d : null;
    }

    // ── key → enum mappings ───────────────────────────────────────────────────

    private static TerrainType terrainType(String key) {
        if (key == null) return TerrainType.GRASS_BASE;
        if (LevelMaps.isWater(key)) {
            if (key.contains("mountain")) return TerrainType.FROZEN_RIVER;
            if (key.contains("sand") || key.contains("oasis")) return TerrainType.OASIS_WATER;
            if (key.contains("garden") || key.contains("canal")) return TerrainType.GARDEN_CANAL;
            if (key.contains("shadow") || key.contains("cursed")) return TerrainType.CURSED_WATERWAY;
            return TerrainType.FROZEN_RIVER;      // grass brook / jungle river: water-role stand-in
        }
        boolean path = key.contains("path") || key.contains("paver");
        if (key.contains("mountain")) return path ? TerrainType.MOUNTAIN_PATH : TerrainType.MOUNTAIN_BASE;
        if (key.contains("sand") || key.contains("dune")) return path ? TerrainType.SAND_PATH : TerrainType.SAND_BASE;
        if (key.contains("garden")) return path ? TerrainType.GARDEN_PATH : TerrainType.GARDEN_BASE;
        if (key.contains("shadow")) return path ? TerrainType.SHADOW_PATH : TerrainType.SHADOW_BASE;
        return path ? TerrainType.GRASS_PATH : TerrainType.GRASS_BASE;
    }

    private static BuildingType buildingType(String key) {
        switch (key) {
            case "bld_grass_village": return BuildingType.VILLAGE;
            case "bld_grass_castle": return BuildingType.CASTLE;
            case "bld_mountain_tavern": return BuildingType.TAVERN;
            case "bld_mountain_citadel": return BuildingType.HOLY_CITADEL;
            case "bld_sand_palm_spring": return BuildingType.PALM_SPRING;
            case "bld_sand_stronghold": return BuildingType.DESERT_STRONGHOLD;
            case "bld_garden_power_station": return BuildingType.KINGS_POWER_STATION;
            case "bld_garden_laboratory": return BuildingType.KINGS_LABORATORY;
            case "bld_shadow_pool": return BuildingType.SHADOW_POOL;
            case "bld_shadow_cursed_portal": return BuildingType.CURSED_PORTAL;
            case "bld_gem_cave": return BuildingType.GEM_CAVE;
            default: return null;                  // decorative (gold mine / mana well)
        }
    }
}
