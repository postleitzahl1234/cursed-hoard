package io.github.some_example_name.game;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/** Seeds authored tables from the procedural fallback without changing campaign balance. */
public final class WaveTableExporter {
    private WaveTableExporter() {}

    public static void main(String[] args) throws Exception {
        Path root = args.length == 0 ? Paths.get("assets", "waves") : Paths.get(args[0]);
        Files.createDirectories(root);
        for (int world = 0; world < LevelMaps.WORLDS; world++) {
            for (int level = 0; level < LevelMaps.LEVELS; level++) {
                List<Wave> waves = new ArrayList<>();
                for (int wave = 0; wave < WavePlan.waveCount(level); wave++) {
                    waves.add(WavePlan.proceduralWave(world, level, wave));
                }
                Path file = root.resolve("w" + (world + 1) + "_l" + (level + 1) + ".waves");
                Files.writeString(file, WaveTable.format(waves), StandardCharsets.UTF_8);
            }
        }
    }
}
