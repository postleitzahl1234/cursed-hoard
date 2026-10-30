package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Headless integration gate for the live authored-map pipeline. Every campaign file named by
 * {@link LevelMaps} must parse into the same {@link BlueprintLevel}/{@link GameMap} used at
 * runtime, with one gem cave and a connected route from its spawn.
 */
class MapImporterTest {
    private static Path findUp(String rel) {
        Path d = Paths.get("").toAbsolutePath();
        for (int i = 0; i < 7 && d != null; i++, d = d.getParent()) {
            Path candidate = d.resolve(rel);
            if (Files.exists(candidate)) return candidate;
        }
        return null;
    }

    @Test
    void everyAuthoredMapParsesThroughTheLivePipelineWithAConnectedPath() throws IOException {
        Path assetsDir = findUp("assets");
        assertNotNull(assetsDir, "assets must be available to tests");
        Path mapsDir = assetsDir.resolve("maps");

        long authoredMapCount;
        try (Stream<Path> files = Files.list(mapsDir)) {
            authoredMapCount = files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".map"))
                    .count();
        }
        int expectedMapCount = LevelMaps.WORLDS * LevelMaps.LEVELS;
        assertEquals(25, expectedMapCount, "campaign geometry changed; update this coverage gate deliberately");
        assertEquals(expectedMapCount, authoredMapCount, "expected exactly the 25 campaign map files");

        int covered = 0;
        for (int world = 0; world < LevelMaps.WORLDS; world++) {
            for (int levelIndex = 0; levelIndex < LevelMaps.LEVELS; levelIndex++) {
                String fileName = LevelMaps.fileName(world, levelIndex);
                Path file = assetsDir.resolve(fileName);
                assertTrue(Files.isRegularFile(file), fileName + " is missing");

                MapBlueprint blueprint = MapBlueprint.parse(Files.readString(file));
                assertEquals(1, markerCount(blueprint, MapBlueprint.Overlay.SPAWN),
                        fileName + " must have exactly one spawn");
                assertEquals(1, markerCount(blueprint, MapBlueprint.Overlay.CAVE),
                        fileName + " must have exactly one gem cave");

                List<int[]> route = BlueprintLevel.traceRoute(blueprint);
                assertTrue(route.size() >= 4,
                        fileName + " has no connected spawn-to-cave path of at least four cells");

                BlueprintLevel liveLevel = BlueprintLevel.fromBlueprint(blueprint);
                assertTrue(liveLevel.map.groundPath().size() >= 4,
                        fileName + " produced a runtime path shorter than four points");
                assertEquals(liveLevel.cave, liveLevel.map.cavePosition,
                        fileName + " cave/path-end mismatch");
                covered++;
            }
        }
        assertEquals(25, covered, "expected all 25 campaign maps to be exercised");
    }

    private static int markerCount(MapBlueprint blueprint, MapBlueprint.Overlay marker) {
        int count = 0;
        for (int c = 0; c < MapBlueprint.COLS; c++)
            for (int r = 0; r < MapBlueprint.ROWS; r++)
                if (blueprint.overlay[c][r] == marker) count++;
        return count;
    }
}
