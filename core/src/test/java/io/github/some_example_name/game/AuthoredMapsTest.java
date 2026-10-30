package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * Design contract for the 25 authored campaign maps ({@link LevelMaps}): every level must have a
 * connected spawn→cave lane that is at least 2 tiles wide everywhere, stays off the map border, is
 * unique across the campaign, carries water areas, hostile structures close to the lane (or on a
 * sub-path spur), clearable obstacle clusters, and only sprite keys that exist in the atlas. Also
 * pins the exported {@code assets/maps/*.map} files to the in-code authoring so they never drift.
 */
class AuthoredMapsTest {
    private static Set<String> atlasKeys;

    @org.junit.jupiter.api.BeforeAll
    static void loadAtlas() throws IOException {
        Path p = findUp("assets/generated/sprites.json");
        assertNotNull(p, "sprites.json must be generated before tests");
        JsonValue sprites = new JsonReader().parse(Files.readString(p)).get("sprites");
        atlasKeys = new HashSet<>();
        for (JsonValue s = sprites.child; s != null; s = s.next) atlasKeys.add(s.name);
    }

    private static Path findUp(String rel) {
        Path d = Paths.get("").toAbsolutePath();
        for (int i = 0; i < 7 && d != null; i++, d = d.getParent()) {
            Path c = d.resolve(rel);
            if (Files.exists(c)) return c;
        }
        return null;
    }

    @Test
    void allMapsHaveConnectedWideBorderFreeUniqueLanes() {
        List<Set<Integer>> laneSets = new ArrayList<>();
        for (int w = 0; w < LevelMaps.WORLDS; w++) {
            for (int l = 0; l < LevelMaps.LEVELS; l++) {
                String id = "w" + (w + 1) + "_l" + (l + 1);
                MapBlueprint bp = LevelMaps.build(w, l);

                List<int[]> route = BlueprintLevel.traceRoute(bp);
                assertTrue(route.size() >= 50, id + " route too short: " + route.size());

                int[] spawn = null;
                for (int c = 0; c < MapBlueprint.COLS && spawn == null; c++)
                    for (int r = 0; r < MapBlueprint.ROWS && spawn == null; r++)
                        if (bp.overlay[c][r] == MapBlueprint.Overlay.SPAWN) spawn = new int[] {c, r};
                assertNotNull(spawn, id + " has no spawn");
                // the entrance must sit at the very map border (heroes march in from off-map)
                assertTrue(spawn[0] == 0 || spawn[1] == 0 || spawn[0] >= MapBlueprint.COLS - 2
                        || spawn[1] >= MapBlueprint.ROWS - 2, id + " spawn not at the border: "
                        + spawn[0] + "," + spawn[1]);

                Set<Integer> lane = new HashSet<>();
                for (int c = 0; c < MapBlueprint.COLS; c++)
                    for (int r = 0; r < MapBlueprint.ROWS; r++)
                        if (isLane(bp, c, r)) {
                            lane.add(c * 100 + r);
                            boolean border = c == 0 || r == 0 || c == MapBlueprint.COLS - 1
                                    || r == MapBlueprint.ROWS - 1;
                            boolean nearSpawn = Math.abs(c - spawn[0]) + Math.abs(r - spawn[1]) <= 4;
                            assertTrue(!border || nearSpawn,
                                    id + " lane touches border away from spawn at " + c + "," + r);
                            assertTrue(partOf2x2Lane(bp, c, r),
                                    id + " lane narrower than 2 at " + c + "," + r);
                        }
                for (Set<Integer> prev : laneSets)
                    assertNotEquals(prev, lane, id + " duplicates another level's lane layout");
                laneSets.add(lane);
            }
        }
    }

    @Test
    void allMapsCarryWaterObstaclesAndHostileStructuresNearTheLane() {
        for (int w = 0; w < LevelMaps.WORLDS; w++) {
            for (int l = 0; l < LevelMaps.LEVELS; l++) {
                String id = "w" + (w + 1) + "_l" + (l + 1);
                MapBlueprint bp = LevelMaps.build(w, l);
                int water = 0, trees = 0, minors = 0, majors = 0;
                List<int[]> blds = new ArrayList<>();
                for (int c = 0; c < MapBlueprint.COLS; c++)
                    for (int r = 0; r < MapBlueprint.ROWS; r++) {
                        if (LevelMaps.isWater(bp.terrain[c][r])) {
                            water++;
                            assertFalse(isLane(bp, c, r), id + " water on the lane at " + c + "," + r);
                        }
                        String d = bp.decor[c][r];
                        if (d == null) continue;
                        assertTrue(atlasKeys.contains(d), id + " unknown decor sprite " + d);
                        assertTrue(atlasKeys.contains(bp.terrain[c][r]),
                                id + " unknown terrain sprite " + bp.terrain[c][r]);
                        if (d.startsWith("obstacle_")) {
                            trees++;
                            assertFalse(isLane(bp, c, r), id + " obstacle on the lane");
                        } else if (d.startsWith("bld_") && !d.contains("mine") && !d.contains("well")) {
                            assertEquals(MapBlueprint.Overlay.NONE, bp.overlay[c][r],
                                    id + " building stamped onto the lane at " + c + "," + r);
                            blds.add(new int[] {c, r});
                            if (d.contains("castle") || d.contains("citadel") || d.contains("stronghold")
                                    || d.contains("laboratory") || d.contains("portal")) majors++;
                            else minors++;
                        }
                    }
                assertTrue(water >= 5, id + " too little water: " + water);
                // grasslands + mountains are forest worlds: dense homogeneous tree masses
                int minTrees = w <= 1 ? 70 : 12;
                assertTrue(trees >= minTrees, id + " too few obstacles: " + trees + " < " + minTrees);
                if (w == 3) {   // royal gardens: at least one canal crosses the whole map
                    boolean crosses = false;
                    for (int r = 0; r < MapBlueprint.ROWS && !crosses; r++) {
                        int inRow = 0;
                        for (int c = 0; c < MapBlueprint.COLS; c++)
                            if (LevelMaps.isWater(bp.terrain[c][r])) inRow++;
                        crosses = inRow >= MapBlueprint.COLS - 8;
                    }
                    for (int c = 0; c < MapBlueprint.COLS && !crosses; c++) {
                        int inCol = 0;
                        for (int r = 0; r < MapBlueprint.ROWS; r++)
                            if (LevelMaps.isWater(bp.terrain[c][r])) inCol++;
                        crosses = inCol >= MapBlueprint.ROWS - 8;
                    }
                    assertTrue(crosses, id + " no canal crosses the map");
                }
                assertTrue(majors >= 1, id + " needs at least one major keep");
                assertTrue(minors >= 1, id + " needs at least one minor home");
                assertTrue(minors + majors >= 4, id + " hostile settlement too small: " + (minors + majors));
                for (int[] b : blds)
                    assertTrue(distToLane(bp, b[0] + 1, b[1]) <= 7,
                            id + " building at " + b[0] + "," + b[1] + " too far from the lane");
            }
        }
    }

    @Test
    void exportedMapFilesMatchTheAuthoredBlueprints() throws IOException {
        Path assets = findUp("assets/generated/sprites.json").getParent().getParent();
        for (int w = 0; w < LevelMaps.WORLDS; w++)
            for (int l = 0; l < LevelMaps.LEVELS; l++) {
                Path f = assets.resolve(LevelMaps.fileName(w, l));
                assertTrue(Files.exists(f), f + " missing - run MapExporter");
                String disk = Files.readString(f).replace("\r\n", "\n");
                assertEquals(LevelMaps.build(w, l).toText(), disk,
                        f + " drifted from LevelMaps - re-run MapExporter");
            }
    }

    @Test
    void blueprintLevelsProduceGameReadyWorlds() {
        for (int w = 0; w < LevelMaps.WORLDS; w++)
            for (int l = 0; l < LevelMaps.LEVELS; l++) {
                String id = "w" + (w + 1) + "_l" + (l + 1);
                BlueprintLevel lvl = BlueprintLevel.fromText(LevelMaps.build(w, l).toText());
                assertTrue(lvl.map.groundPath().size() >= 8, id + " ground path too short");
                assertTrue(lvl.buildings.size() >= 4, id + " lost buildings in conversion");
                assertFalse(lvl.spawn.epsilonEquals(lvl.cave, 1f), id + " spawn equals cave");
                assertEquals(lvl.cave.x, lvl.map.cavePosition.x, 0.01f, id + " cave mismatch");
                int obstacles = 0;
                for (int x = 0; x < GameMap.WIDTH; x++)
                    for (int y = 0; y < GameMap.HEIGHT; y++)
                        if (lvl.map.tileAt(x, y).role == TileRole.OBSTACLE) obstacles++;
                assertTrue(obstacles >= 12, id + " obstacles lost in conversion: " + obstacles);
            }
    }

    private static boolean isLane(MapBlueprint bp, int c, int r) {
        MapBlueprint.Overlay o = bp.overlay[c][r];
        return o == MapBlueprint.Overlay.PATH || o == MapBlueprint.Overlay.SPAWN
                || o == MapBlueprint.Overlay.CAVE;
    }

    /** Width-2 check: the cell must be part of at least one full 2×2 block of lane cells. */
    private static boolean partOf2x2Lane(MapBlueprint bp, int c, int r) {
        for (int dc = -1; dc <= 0; dc++)
            for (int dr = -1; dr <= 0; dr++) {
                boolean full = true;
                for (int ic = 0; ic <= 1 && full; ic++)
                    for (int ir = 0; ir <= 1 && full; ir++) {
                        int cc = c + dc + ic, rr = r + dr + ir;
                        if (!MapBlueprint.inBounds(cc, rr) || !isLane(bp, cc, rr)) full = false;
                    }
                if (full) return true;
            }
        return false;
    }

    private static int distToLane(MapBlueprint bp, int c, int r) {
        int best = Integer.MAX_VALUE;
        for (int cc = 0; cc < MapBlueprint.COLS; cc++)
            for (int rr = 0; rr < MapBlueprint.ROWS; rr++)
                if (isLane(bp, cc, rr)) best = Math.min(best, Math.abs(cc - c) + Math.abs(rr - r));
        return best;
    }
}
