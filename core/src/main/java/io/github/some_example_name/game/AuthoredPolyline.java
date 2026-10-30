package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class AuthoredPolyline implements AirRouteProvider {
    private final List<Vector2> points = new ArrayList<>();

    public AuthoredPolyline(List<Vector2> points) {
        if (points != null) {
            for (Vector2 point : points) {
                this.points.add(new Vector2(point));
            }
        }
    }

    @Override
    public List<Vector2> route(GameMap map) {
        return Collections.unmodifiableList(points);
    }
}
