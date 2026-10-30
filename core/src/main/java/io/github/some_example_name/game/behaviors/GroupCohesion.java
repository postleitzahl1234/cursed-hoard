package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Camel Caravan. Slows down when it gets ahead of the pack and speeds up when it falls behind,
 * so a caravan arrives together instead of strung out.
 */
public class GroupCohesion implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        int ahead = 0, behind = 0;
        for (Hero other : w.heroes) {
            if (other == h || !other.isAlive()) continue;
            if (other.targetWaypoint > h.targetWaypoint) ahead++;
            else if (other.targetWaypoint < h.targetWaypoint) behind++;
        }
        if (behind > ahead + 2) h.speedMultiplier *= 0.7f;        // wait for the tail
        else if (ahead > behind + 2) h.speedMultiplier *= 1.3f;   // catch the head up
    }
}
