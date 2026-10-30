package io.github.some_example_name.game;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Writes the 25 authored {@link LevelMaps} blueprints to {@code assets/maps/*.map} (the editor's
 * export format). Pure Java — run with the compiled core classes on the classpath:
 * {@code java -cp core/build/classes/java/main io.github.some_example_name.game.MapExporter assets}
 */
public final class MapExporter {
    private MapExporter() {}

    public static void main(String[] args) throws IOException {
        Path root = Paths.get(args.length > 0 ? args[0] : "assets");
        Path dir = root.resolve("maps");
        Files.createDirectories(dir);
        for (int w = 0; w < LevelMaps.WORLDS; w++) {
            for (int l = 0; l < LevelMaps.LEVELS; l++) {
                MapBlueprint bp = LevelMaps.build(w, l);
                Path file = root.resolve(LevelMaps.fileName(w, l));
                Files.write(file, bp.toText().getBytes(StandardCharsets.UTF_8));
                System.out.println("wrote " + file);
            }
        }
        System.out.println("EXPORTED 25 maps");
    }
}
