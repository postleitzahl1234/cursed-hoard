package io.github.some_example_name.game;

public final class GroundFollower implements MovementStrategy {
    @Override
    public void advance(Hero h, float dt) {
        int dir = (h.state == Hero.State.GOING_OUT || h.statusController.getFearDuration() > 0f) ? -1 : 1;
        h.walkAlongPath(dt, dir);
    }
}
