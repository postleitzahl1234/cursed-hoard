package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.List;

public final class AirFollower implements MovementStrategy {
    private final List<Vector2> route = new ArrayList<>();
    private int targetIndex = 1;

    public AirFollower(List<Vector2> route) {
        if (route != null) {
            for (Vector2 point : route) {
                this.route.add(new Vector2(point));
            }
        }
    }

    @Override
    public void advance(Hero h, float dt) {
        if (route.size() < 2 || h.carrying != null) {
            h.movementStrategy = new GroundFollower();
            h.walkAlongPath(dt, h.state == Hero.State.GOING_OUT ? -1 : 1);
            return;
        }
        Vector2 target = route.get(Math.min(targetIndex, route.size() - 1));
        Vector2 delta = target.cpy().sub(h.pos);
        float dist = delta.len();
        float step = h.type.speed * h.statusController.getSlowMultiplier() * dt;
        if (dist <= step) {
            h.pos.set(target);
            targetIndex++;
            if (targetIndex >= route.size()) {
                h.state = Hero.State.AT_CAVE;
                h.caveTimer = 0.6f;
            }
        } else if (dist > 0f) {
            h.pos.mulAdd(delta.scl(1f / dist), step);
        }
    }
}
