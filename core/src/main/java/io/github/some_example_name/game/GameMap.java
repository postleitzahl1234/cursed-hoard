package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class GameMap {
    /**
     * 40×22 cells of 32 px = 1280×704 — the window's full width and its height less an 8 px
     * letterbox, so the map renders at exactly 1:1 (REVIEW.md §4).
     *
     * <p>The old 32×30 field was taller than it was wide and had to be squeezed to 0.60× to fit
     * a 16:9 window, which destroyed the pixel grid every asset here is authored on. Landscape
     * also suits the game: lanes run left→right, so width is where the interesting decisions are
     * and the extra 8 columns are real play space, while the 8 rows lost were mostly margin.
     */
    public static final int WIDTH = 40;
    public static final int HEIGHT = 22;
    public static final int TILE_SIZE = 32;

    /** Centre row — the default lane, and the vertical anchor for generated paths. */
    public static final int MID_ROW = HEIGHT / 2;      // 11

    private final MapTile[][] tiles = new MapTile[WIDTH][HEIGHT];
    private final List<Vector2> groundPath = new ArrayList<>();
    public final Vector2 cavePosition =
            new Vector2((WIDTH - 1) * TILE_SIZE, MID_ROW * TILE_SIZE);

    public GameMap() {
        for (int x = 0; x < WIDTH; x++) {
            for (int y = 0; y < HEIGHT; y++) {
                tiles[x][y] = new MapTile(TerrainType.GRASS_BASE, TileRole.BASE);
            }
        }
        resetPathToDefault();
    }

    public void resetPathToDefault() {
        groundPath.clear();
        for (int x = 0; x < WIDTH; x++) {
            groundPath.add(new Vector2(x * TILE_SIZE + TILE_SIZE / 2f, MID_ROW * TILE_SIZE + TILE_SIZE / 2f));
        }
        cavePosition.set(groundPath.get(groundPath.size() - 1));
    }

    public void setCustomPath(List<Vector2> newPath) {
        groundPath.clear();
        groundPath.addAll(newPath);
        if (!groundPath.isEmpty()) {
            cavePosition.set(groundPath.get(groundPath.size() - 1));
        }
    }

    public MapTile tileAt(int x, int y) {
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
            return null;
        }
        return tiles[x][y];
    }

    public void setTile(int x, int y, MapTile tile) {
        if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) {
            throw new IndexOutOfBoundsException("Tile outside map: " + x + "," + y);
        }
        tiles[x][y] = tile;
    }

    public List<Vector2> groundPath() {
        return Collections.unmodifiableList(groundPath);
    }
}
