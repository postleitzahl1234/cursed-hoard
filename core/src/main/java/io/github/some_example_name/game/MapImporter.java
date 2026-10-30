package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

/**
 * Turns an authored campaign-map role grid (the 64×60 {@code map_*} sprite, every cell a real
 * terrain role — see {@code assets/data/maps.js}) into a playable {@link GameMap}: per-cell terrain
 * + role, a traced spawn→cave ground path, the gem-cave position and the hostile-building cluster
 * centroids. Pure (no GL/Gdx) so it is unit-tested headlessly. The image's top row maps to the top
 * of the y-up playfield (vertical flip).
 */
public final class MapImporter {
    public final GameMap map;
    public final Vector2 cave;                       // world coords (gem cave), or null
    public final List<Vector2> buildingCenters;      // world coords of hostile-building clusters
    public final boolean ok;                         // false → caller should fall back to procedural

    private MapImporter(GameMap map, Vector2 cave, List<Vector2> buildings, boolean ok) {
        this.map = map;
        this.cave = cave;
        this.buildingCenters = buildings;
        this.ok = ok;
    }

    private static final String SPAWN = "S@", CAVE = "XK$%", BUILDING = "Hh+",
            WATER = "897", TREE = "061BD", PATH = "bfjnvrP";

    private enum Role { BASE, PATH, WATER, TREE, BUILDING, SPAWN, CAVE }

    public static MapImporter from(char[][] grid, int worldIndex) {
        int W = GameMap.WIDTH, H = GameMap.HEIGHT, TS = GameMap.TILE_SIZE;
        if (grid == null || grid.length < H || grid[0].length < W) {
            return new MapImporter(null, null, new ArrayList<>(), false);
        }
        int gh = grid.length, gw = grid[0].length;

        Role[][] role = new Role[W][H];
        GameMap map = new GameMap();
        TerrainType base = terrain(worldIndex, 0), path = terrain(worldIndex, 1), water = terrain(worldIndex, 2);

        for (int gx = 0; gx < W; gx++) {
            for (int gy = 0; gy < H; gy++) {
                // image rows for this y-up cell (row 0 = top of image = top of field)
                int ry0 = (H - 1 - gy) * gh / H, ry1 = (H - gy) * gh / H;
                int cx0 = gx * gw / W, cx1 = (gx + 1) * gw / W;
                Role r = classify(grid, ry0, ry1, cx0, cx1);
                role[gx][gy] = r;
                switch (r) {
                    case PATH: map.setTile(gx, gy, new MapTile(path, TileRole.PATH)); break;
                    case WATER: map.setTile(gx, gy, new MapTile(water, TileRole.SPECIAL)); break;
                    case TREE: map.setTile(gx, gy, new MapTile(base, TileRole.OBSTACLE)); break;
                    default: map.setTile(gx, gy, new MapTile(base, TileRole.BASE)); break;
                }
            }
        }

        List<Vector2> buildings = clusterCentroids(role, W, H, Role.BUILDING, TS);
        // Trace on the FULL-RES authored grid (continuous there) so a thin path is never lost to the
        // 2×2 downsample, then map to world coords.
        List<Vector2> waypoints = tracePath(grid, gw, gh);

        boolean ok = waypoints.size() >= 2;
        Vector2 caveCenter = ok ? new Vector2(waypoints.get(waypoints.size() - 1)) : null;
        if (ok) {
            map.setCustomPath(waypoints);
            map.cavePosition.set(caveCenter);
        }
        return new MapImporter(map, caveCenter, buildings, ok);
    }

    private static Role classify(char[][] grid, int ry0, int ry1, int cx0, int cx1) {
        int spawn = 0, cave = 0, building = 0, water = 0, tree = 0, pathC = 0, total = 0;
        for (int r = ry0; r < ry1; r++) {
            char[] row = grid[r];
            for (int c = cx0; c < cx1 && c < row.length; c++) {
                char ch = row[c];
                total++;
                if (CAVE.indexOf(ch) >= 0) cave++;
                else if (SPAWN.indexOf(ch) >= 0) spawn++;
                else if (PATH.indexOf(ch) >= 0) pathC++;
                else if (BUILDING.indexOf(ch) >= 0) building++;
                else if (WATER.indexOf(ch) >= 0) water++;
                else if (TREE.indexOf(ch) >= 0) tree++;
            }
        }
        if (cave > 0) return Role.CAVE;
        if (spawn > 0) return Role.SPAWN;
        if (pathC > 0) return Role.PATH;
        if (building > 0) return Role.BUILDING;
        if (water * 2 >= Math.max(1, total)) return Role.WATER;
        // Only a DENSE tree block is a fellable obstacle; sparse canopy over textured ground stays
        // open, buildable BASE (the bulk of the field is rock you can build on, CT-style).
        if (tree * 4 >= total * 3) return Role.TREE;
        return Role.BASE;
    }

    /** Per-cell traversal cost; the authored lane is a dithered mix, so weight path cheap, base more,
     *  obstacles/water expensive (passable only at bridges). */
    private static int cost(char ch) {
        if (PATH.indexOf(ch) >= 0 || SPAWN.indexOf(ch) >= 0 || CAVE.indexOf(ch) >= 0) return 1;
        if (WATER.indexOf(ch) >= 0) return 40;
        if (TREE.indexOf(ch) >= 0) return 16;
        if (BUILDING.indexOf(ch) >= 0) return 24;
        return 6;   // open ground / detail — passable, so the route bridges dither gaps in the lane
    }

    /**
     * Weighted Dijkstra over the authored full-res grid from every spawn to the cave: the route hugs
     * the cheap path cells and bridges the dithered gaps over open ground, avoiding water/buildings.
     * Returned as world-space waypoints (y-flipped image-top→field-top, thinned to ~every other cell).
     */
    private static List<Vector2> tracePath(char[][] grid, int gw, int gh) {
        float worldW = GameMap.WIDTH * GameMap.TILE_SIZE, worldH = GameMap.HEIGHT * GameMap.TILE_SIZE;
        List<int[]> sources = new ArrayList<>();
        float caveX = 0, caveY = 0;
        int caveN = 0;
        for (int r = 0; r < gh; r++) {
            char[] row = grid[r];
            for (int c = 0; c < gw && c < row.length; c++) {
                char ch = row[c];
                if (SPAWN.indexOf(ch) >= 0) sources.add(new int[] {c, r});
                if (CAVE.indexOf(ch) >= 0) { caveX += c; caveY += r; caveN++; }
            }
        }
        if (caveN == 0 || sources.isEmpty()) return new ArrayList<>();
        int tx = Math.round(caveX / caveN), ty = Math.round(caveY / caveN);

        int n = gw * gh;
        int[] dist = new int[n];
        int[] prev = new int[n];
        java.util.Arrays.fill(dist, Integer.MAX_VALUE);
        java.util.Arrays.fill(prev, -1);
        java.util.PriorityQueue<int[]> pq = new java.util.PriorityQueue<>((a, b) -> a[0] - b[0]);
        for (int[] s : sources) {
            int idx = s[1] * gw + s[0];
            int cc = cost(grid[s[1]][s[0]]);
            if (cc < dist[idx]) { dist[idx] = cc; pq.add(new int[] {cc, s[0], s[1]}); }
        }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
        int targetIdx = ty * gw + tx;
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int c = cur[1], r = cur[2], idx = r * gw + c;
            if (cur[0] > dist[idx]) continue;
            if (idx == targetIdx) break;
            for (int[] d : dirs) {
                int nc = c + d[0], nr = r + d[1];
                if (nc < 0 || nr < 0 || nc >= gw || nr >= gh || nc >= grid[nr].length) continue;
                int nd = dist[idx] + cost(grid[nr][nc]);
                int nidx = nr * gw + nc;
                if (nd < dist[nidx]) { dist[nidx] = nd; prev[nidx] = idx; pq.add(new int[] {nd, nc, nr}); }
            }
        }
        if (dist[targetIdx] == Integer.MAX_VALUE) return new ArrayList<>();

        List<int[]> cells = new ArrayList<>();
        for (int idx = targetIdx; idx != -1; idx = prev[idx]) cells.add(new int[] {idx % gw, idx / gw});
        java.util.Collections.reverse(cells);
        List<Vector2> pts = new ArrayList<>();
        for (int i = 0; i < cells.size(); i++) {
            if (i != 0 && i != cells.size() - 1 && (i % 2) != 0) continue;     // thin the polyline
            int[] c = cells.get(i);
            float wx = (c[0] + 0.5f) / gw * worldW;
            float wy = (gh - 1 - c[1] + 0.5f) / gh * worldH;                   // image-top → field-top
            pts.add(new Vector2(wx, wy));
        }
        return pts;
    }

    /** Flood-fill connected cells of a role into clusters; one world-space centroid per cluster. */
    private static List<Vector2> clusterCentroids(Role[][] role, int W, int H, Role want, int TS) {
        List<Vector2> out = new ArrayList<>();
        boolean[][] seen = new boolean[W][H];
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}, {1, 1}, {1, -1}, {-1, 1}, {-1, -1}};
        for (int x = 0; x < W; x++) {
            for (int y = 0; y < H; y++) {
                if (role[x][y] != want || seen[x][y]) continue;
                ArrayDeque<int[]> q = new ArrayDeque<>();
                q.add(new int[] {x, y});
                seen[x][y] = true;
                float sx = 0, sy = 0;
                int n = 0;
                while (!q.isEmpty()) {
                    int[] c = q.poll();
                    sx += c[0]; sy += c[1]; n++;
                    for (int[] d : dirs) {
                        int nx = c[0] + d[0], ny = c[1] + d[1];
                        if (nx < 0 || ny < 0 || nx >= W || ny >= H || seen[nx][ny] || role[nx][ny] != want) continue;
                        seen[nx][ny] = true;
                        q.add(new int[] {nx, ny});
                    }
                }
                if (n >= 2) out.add(new Vector2(sx / n * TS + TS / 2f, sy / n * TS + TS / 2f));
            }
        }
        return out;
    }

    private static TerrainType terrain(int world, int kind) {
        // kind: 0 base · 1 path · 2 water/special
        switch (world) {
            case 1: return new TerrainType[] {TerrainType.MOUNTAIN_BASE, TerrainType.MOUNTAIN_PATH, TerrainType.FROZEN_RIVER}[kind];
            case 2: return new TerrainType[] {TerrainType.SAND_BASE, TerrainType.SAND_PATH, TerrainType.OASIS_WATER}[kind];
            case 3: return new TerrainType[] {TerrainType.GARDEN_BASE, TerrainType.GARDEN_PATH, TerrainType.GARDEN_CANAL}[kind];
            case 4: return new TerrainType[] {TerrainType.SHADOW_BASE, TerrainType.SHADOW_PATH, TerrainType.CURSED_WATERWAY}[kind];
            default: return new TerrainType[] {TerrainType.GRASS_BASE, TerrainType.GRASS_PATH, TerrainType.FROZEN_RIVER}[kind];
        }
    }
}
