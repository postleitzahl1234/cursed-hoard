package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class WaterPathfinder implements AirRouteProvider {
    @Override
    public List<Vector2> route(GameMap map) {
        boolean[][] seen = new boolean[GameMap.WIDTH][GameMap.HEIGHT];
        int[][] parentX = new int[GameMap.WIDTH][GameMap.HEIGHT];
        int[][] parentY = new int[GameMap.WIDTH][GameMap.HEIGHT];
        for (int x = 0; x < GameMap.WIDTH; x++) {
            for (int y = 0; y < GameMap.HEIGHT; y++) {
                parentX[x][y] = -1;
                parentY[x][y] = -1;
            }
        }

        int sx = 0;
        int sy = findFirstWaterY(map);
        int ex = GameMap.WIDTH - 1;
        int ey = findLastWaterY(map);
        if (sy < 0 || ey < 0) {
            return straightFallback(map);
        }

        ArrayDeque<int[]> queue = new ArrayDeque<>();
        queue.add(new int[]{sx, sy});
        seen[sx][sy] = true;
        int[] dx = {1, -1, 0, 0};
        int[] dy = {0, 0, 1, -1};
        while (!queue.isEmpty()) {
            int[] cur = queue.removeFirst();
            if (cur[0] == ex && cur[1] == ey) {
                return reconstruct(parentX, parentY, ex, ey);
            }
            for (int i = 0; i < 4; i++) {
                int nx = cur[0] + dx[i];
                int ny = cur[1] + dy[i];
                MapTile tile = map.tileAt(nx, ny);
                if (tile != null && tile.isAirTraversable() && !seen[nx][ny]) {
                    seen[nx][ny] = true;
                    parentX[nx][ny] = cur[0];
                    parentY[nx][ny] = cur[1];
                    queue.addLast(new int[]{nx, ny});
                }
            }
        }
        return straightFallback(map);
    }

    private int findFirstWaterY(GameMap map) {
        for (int y = 0; y < GameMap.HEIGHT; y++) {
            MapTile tile = map.tileAt(0, y);
            if (tile != null && tile.isAirTraversable()) return y;
        }
        return -1;
    }

    private int findLastWaterY(GameMap map) {
        for (int y = 0; y < GameMap.HEIGHT; y++) {
            MapTile tile = map.tileAt(GameMap.WIDTH - 1, y);
            if (tile != null && tile.isAirTraversable()) return y;
        }
        return -1;
    }

    private List<Vector2> reconstruct(int[][] parentX, int[][] parentY, int ex, int ey) {
        List<Vector2> points = new ArrayList<>();
        int x = ex;
        int y = ey;
        while (x >= 0 && y >= 0) {
            points.add(new Vector2(x * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f, y * GameMap.TILE_SIZE + GameMap.TILE_SIZE / 2f));
            int px = parentX[x][y];
            int py = parentY[x][y];
            x = px;
            y = py;
        }
        Collections.reverse(points);
        return points;
    }

    private List<Vector2> straightFallback(GameMap map) {
        List<Vector2> path = map.groundPath();
        List<Vector2> fallback = new ArrayList<>();
        fallback.add(new Vector2(path.get(0)));
        fallback.add(new Vector2(map.cavePosition));
        return fallback;
    }
}
