package io.github.some_example_name.game;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** Locates authored wave tables without depending on libGDX or an OpenGL context. */
public final class LevelWaves {
    private LevelWaves() {}
    private static final ConcurrentHashMap<String, Optional<WaveTable>> CACHE = new ConcurrentHashMap<>();

    public static String fileName(int worldIndex, int levelIndex) {
        return "waves/w" + (worldIndex + 1) + "_l" + (levelIndex + 1) + ".waves";
    }

    public static Optional<WaveTable> load(int worldIndex, int levelIndex) {
        String name = fileName(worldIndex, levelIndex);
        return CACHE.computeIfAbsent(name, LevelWaves::loadNamed);
    }

    private static Optional<WaveTable> loadNamed(String name) {
        try {
            String text = readText(name);
            return text == null ? Optional.empty() : Optional.of(WaveTable.parse(text));
        } catch (IOException | IllegalArgumentException ignored) {
            return Optional.empty();
        }
    }

    private static String readText(String name) throws IOException {
        ClassLoader loader = LevelWaves.class.getClassLoader();
        try (InputStream in = loader.getResourceAsStream(name)) {
            if (in != null) return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
        Path direct = Paths.get(name);
        if (Files.isRegularFile(direct)) return Files.readString(direct, StandardCharsets.UTF_8);
        Path cursor = Paths.get("").toAbsolutePath();
        while (cursor != null) {
            Path path = cursor.resolve("assets").resolve(name);
            if (Files.isRegularFile(path)) return Files.readString(path, StandardCharsets.UTF_8);
            cursor = cursor.getParent();
        }
        return null;
    }
}
