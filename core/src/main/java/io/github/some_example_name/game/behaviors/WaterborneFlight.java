package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Seraph / Giant Vulture / Royal Falconer / Imp Swarm (D-15). Flight follows a water route, and
 * grabbing a gem forces a landing: the strategy swaps to the ground follower and the unit walks
 * out slow and targetable.
 */
public class WaterborneFlight implements UnitBehavior {
    @Override
    public void onSpawn(Hero h, World w) {
        if (w == null) return;
        h.movementStrategy = new AirFollower(w.airRouteProvider.route(w.map));
    }

    @Override
    public void onGemGrab(Hero h, World w) {
        h.movementStrategy = new GroundFollower();       // D-09: flyers land while carrying
        h.snapToWaypoint(h.targetWaypoint);
        h.triggerAbility();
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        if (h.carrying != null) h.speedMultiplier *= 0.65f;   // laden and grounded
    }
}
