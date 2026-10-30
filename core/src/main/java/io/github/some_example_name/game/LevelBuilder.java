package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Builds a playable level on top of authored (or placeholder) <b>terrain only</b>: the engine draws
 * the meandering hero path, scatters tree obstacles and places the enemy buildings — none of that is
 * baked into the terrain art. Deterministic per (world,level) via a seed, and pure (no GL) so it is
 * unit-tested headlessly.
 *
 * <p>Path contract (design): a single lane that is <b>≥3 tiles wide</b>, <b>at least as long as a
 * map border</b>, made of <b>random natural turns/curves</b>, and <b>never touching the map
 * borders</b>. The cave sits just inside one border; the spawn just inside the opposite side.
 */
public final class LevelBuilder {
    public final GameMap map;
    public final List<Vector2> path;            // centerline hero waypoints (world coords)
    public final List<Vector2> buildingCenters; // enemy building cluster centres (world coords)
    public final Vector2 cave;                  // gem cave (world coords)
    public final Vector2 spawn;                 // hero spawn (world coords)

    /**
     * Keep cave/spawn/lane this far off every border. Vertically this is not merely cosmetic:
     * it must be at least {@code CursedHoardGame.SAFE_ROW_LO}, because the HUD floats over the
     * outer rows and a lane that walks under the build tray cannot be played. With a 22-row
     * field, INSET 3 yields rows 3…18, which sits inside the safe rect 3…19.
     */
    private static final int INSET = 3;
    private static final float HALF_WIDTH = 1.5f; // → a 3-tile-wide lane

    private LevelBuilder(GameMap map, List<Vector2> path, List<Vector2> buildings, Vector2 cave, Vector2 spawn) {
        this.map = map;
        this.path = path;
        this.buildingCenters = buildings;
        this.cave = cave;
        this.spawn = spawn;
    }

    public static LevelBuilder generate(long seed, int worldIndex) {
        Random rng = new Random(seed);
        int W = GameMap.WIDTH, H = GameMap.HEIGHT, TS = GameMap.TILE_SIZE;
        GameMap map = new GameMap();
        TerrainType base = terrain(worldIndex, false);
        TerrainType pathT = terrain(worldIndex, true);
        for (int x = 0; x < W; x++)
            for (int y = 0; y < H; y++)
                map.setTile(x, y, new MapTile(base, TileRole.BASE));

        // cave just inside a random border; spawn just inside the opposite side (both off the edge)
        int side = rng.nextInt(4);
        Vector2 caveCell = borderCell(side, rng, W, H);
        Vector2 spawnCell = borderCell((side + 2) % 4, rng, W, H);

        // a meandering ≥-border-length centreline that stays in the interior
        List<Vector2> centre = meander(spawnCell, caveCell, rng, W, H);

        stampLane(map, centre, pathT);

        // obstacles: tree clusters on open ground, away from the lane and the spawn settlement
        scatterObstacles(map, rng, worldIndex, spawnCell);

        // enemy buildings: a small settlement beside the spawn, off the lane
        List<Vector2> buildings = placeBuildings(map, rng, spawnCell, W, H, TS);

        // hero waypoints + cave/spawn world positions
        List<Vector2> path = new ArrayList<>();
        for (Vector2 c : centre) path.add(new Vector2(c.x * TS + TS / 2f, c.y * TS + TS / 2f));
        map.setCustomPath(path);
        Vector2 caveW = new Vector2(caveCell.x * TS + TS / 2f, caveCell.y * TS + TS / 2f);
        map.cavePosition.set(caveW);
        Vector2 spawnW = path.isEmpty() ? new Vector2() : new Vector2(path.get(0));
        return new LevelBuilder(map, path, buildings, caveW, spawnW);
    }

    // ── path ────────────────────────────────────────────────────────────────

    private static Vector2 borderCell(int side, Random rng, int W, int H) {
        switch (side) {
            case 0: return new Vector2(INSET, INSET + rng.nextInt(H - 2 * INSET));               // left
            case 1: return new Vector2(W - 1 - INSET, INSET + rng.nextInt(H - 2 * INSET));       // right
            case 2: return new Vector2(INSET + rng.nextInt(W - 2 * INSET), INSET);               // bottom
            default: return new Vector2(INSET + rng.nextInt(W - 2 * INSET), H - 1 - INSET);      // top
        }
    }

    /**
     * Random-walk toward the goal with angular noise, routed through a couple of random interior
     * "via" points so the lane is long and twisty; clamped to the interior so it never touches a
     * border. Re-rolls noise until the lane is at least a border long.
     */
    private static List<Vector2> meander(Vector2 spawn, Vector2 cave, Random rng, int W, int H) {
        float minLen = Math.max(W, H);                 // ≥ a map border
        List<Vector2> best = null;
        for (int attempt = 0; attempt < 8; attempt++) {
            List<Vector2> ctrl = new ArrayList<>();
            ctrl.add(spawn);
            int vias = 2 + rng.nextInt(2);
            for (int i = 0; i < vias; i++)
                ctrl.add(new Vector2(INSET + rng.nextInt(W - 2 * INSET), INSET + rng.nextInt(H - 2 * INSET)));
            ctrl.add(cave);

            List<Vector2> pts = new ArrayList<>();
            pts.add(new Vector2(spawn));
            float lo = INSET + HALF_WIDTH, hiX = W - 1 - INSET - HALF_WIDTH, hiY = H - 1 - INSET - HALF_WIDTH;
            for (int c = 1; c < ctrl.size(); c++) {
                Vector2 target = ctrl.get(c);
                Vector2 pos = new Vector2(pts.get(pts.size() - 1));
                float heading = (float) Math.atan2(target.y - pos.y, target.x - pos.x);
                int guard = 0;
                while (pos.dst(target) > 1.5f && guard++ < 400) {
                    float goal = (float) Math.atan2(target.y - pos.y, target.x - pos.x);
                    heading = lerpAngle(heading, goal, 0.2f) + (rng.nextFloat() - 0.5f) * 1.1f;
                    pos.add((float) Math.cos(heading) * 1.3f, (float) Math.sin(heading) * 1.3f);
                    pos.x = clamp(pos.x, lo, hiX);
                    pos.y = clamp(pos.y, lo, hiY);
                    pts.add(new Vector2(pos));
                }
            }
            pts.add(new Vector2(cave));
            float len = polylineLength(pts);
            if (len >= minLen && (best == null || len > polylineLength(best))) best = pts;
            if (best != null && polylineLength(best) >= minLen * 1.3f) break;
        }
        return best != null ? best : straightFallback(spawn, cave);
    }

    private static List<Vector2> straightFallback(Vector2 a, Vector2 b) {
        List<Vector2> p = new ArrayList<>();
        p.add(new Vector2(a)); p.add(new Vector2(b));
        return p;
    }

    /** Paint a ≥5-wide lane around the centreline (PATH role) by stamping discs along each segment. */
    private static void stampLane(GameMap map, List<Vector2> centre, TerrainType pathT) {
        for (int i = 0; i < centre.size() - 1; i++) {
            Vector2 a = centre.get(i), b = centre.get(i + 1);
            int steps = (int) (a.dst(b) * 2) + 1;
            for (int s = 0; s <= steps; s++) {
                float t = s / (float) steps;
                float px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
                stampDisc(map, px, py, HALF_WIDTH, pathT);
            }
        }
    }

    private static void stampDisc(GameMap map, float cx, float cy, float r, TerrainType pathT) {
        int x0 = (int) Math.floor(cx - r), x1 = (int) Math.ceil(cx + r);
        int y0 = (int) Math.floor(cy - r), y1 = (int) Math.ceil(cy + r);
        for (int x = x0; x <= x1; x++)
            for (int y = y0; y <= y1; y++) {
                if (x < 0 || y < 0 || x >= GameMap.WIDTH || y >= GameMap.HEIGHT) continue;
                if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r)
                    map.setTile(x, y, new MapTile(pathT, TileRole.PATH));
            }
    }

    // ── obstacles & buildings ─────────────────────────────────────────────────

    private static void scatterObstacles(GameMap map, Random rng, int worldIndex, Vector2 spawnCell) {
        TerrainType base = terrain(worldIndex, false);
        for (int x = 1; x < GameMap.WIDTH - 1; x++) {
            for (int y = 1; y < GameMap.HEIGHT - 1; y++) {
                if (map.tileAt(x, y).role != TileRole.BASE) continue;
                if (Math.abs(x - spawnCell.x) < 4 && Math.abs(y - spawnCell.y) < 4) continue;  // keep settlement clear
                if (adjacentToPath(map, x, y)) continue;                                       // keep the lane open
                // clustered noise: a coarse cell either seeds a copse or stays open
                boolean copse = ((x / 3) * 31 + (y / 3) * 17 + worldIndex) % 5 == 0;
                if (copse && rng.nextFloat() < 0.55f)
                    map.setTile(x, y, new MapTile(base, TileRole.OBSTACLE));
            }
        }
    }

    private static boolean adjacentToPath(GameMap map, int x, int y) {
        for (int dx = -1; dx <= 1; dx++)
            for (int dy = -1; dy <= 1; dy++) {
                MapTile t = map.tileAt(x + dx, y + dy);
                if (t != null && t.role == TileRole.PATH) return true;
            }
        return false;
    }

    private static List<Vector2> placeBuildings(GameMap map, Random rng, Vector2 spawnCell, int W, int H, int TS) {
        List<Vector2> centers = new ArrayList<>();
        int[][] offsets = {{-2, -2}, {2, -2}, {0, 3}, {-3, 1}, {3, 1}};
        for (int[] o : offsets) {
            int bx = (int) clamp(spawnCell.x + o[0], INSET, W - 1 - INSET);
            int by = (int) clamp(spawnCell.y + o[1], INSET, H - 1 - INSET);
            if (map.tileAt(bx, by).role != TileRole.PATH) {
                map.setTile(bx, by, new MapTile(map.tileAt(bx, by).terrainType, TileRole.BASE));
                centers.add(new Vector2(bx * TS + TS / 2f, by * TS + TS / 2f));
            }
        }
        return centers;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static float clamp(float v, float lo, float hi) { return Math.max(lo, Math.min(hi, v)); }

    private static float lerpAngle(float a, float b, float t) {
        float d = ((b - a + (float) Math.PI * 3) % (float) (2 * Math.PI)) - (float) Math.PI;
        return a + d * t;
    }

    private static float polylineLength(List<Vector2> p) {
        float len = 0;
        for (int i = 0; i < p.size() - 1; i++) len += p.get(i).dst(p.get(i + 1));
        return len;
    }

    private static TerrainType terrain(int world, boolean path) {
        switch (world) {
            case 1: return path ? TerrainType.MOUNTAIN_PATH : TerrainType.MOUNTAIN_BASE;
            case 2: return path ? TerrainType.SAND_PATH : TerrainType.SAND_BASE;
            case 3: return path ? TerrainType.GARDEN_PATH : TerrainType.GARDEN_BASE;
            case 4: return path ? TerrainType.SHADOW_PATH : TerrainType.SHADOW_BASE;
            default: return path ? TerrainType.GRASS_PATH : TerrainType.GRASS_BASE;
        }
    }
}
