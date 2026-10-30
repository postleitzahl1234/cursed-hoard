package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.List;

public interface AirRouteProvider {
    List<Vector2> route(GameMap map);
}
