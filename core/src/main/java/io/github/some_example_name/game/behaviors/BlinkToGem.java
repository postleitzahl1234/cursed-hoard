package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Gem Shade (D-09). Blinks straight toward the cave rather than walking the lane — and once it
 * has a gem, blinks back out the same way.
 */
public class BlinkToGem implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive() || h.waypoints.isEmpty()) return;
        if (!h.bCooldown("blink", 3.2f, dt)) return;
        int jump = 3;
        int target = h.state == Hero.State.GOING_OUT
                ? Math.max(0, h.targetWaypoint - jump)
                : Math.min(h.waypoints.size() - 1, h.targetWaypoint + jump);
        if (target == h.targetWaypoint) return;
        h.snapToWaypoint(target);
        h.triggerAbility();
    }
}
