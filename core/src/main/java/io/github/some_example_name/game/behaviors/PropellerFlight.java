package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Clockwork Sentinel. A machine that flies under its own rotor rather than riding the water
 * lanes — it holds a steady cruise and is unbothered by anything that would fear a living thing,
 * but the rotor makes it fragile to lightning (D-17 flags it lightningVuln).
 */
public class PropellerFlight implements UnitBehavior {
    @Override
    public void onSpawn(Hero h, World w) {
        if (w == null) return;
        h.movementStrategy = new AirFollower(w.airRouteProvider.route(w.map));
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        h.statusController.clearStatus(StatusType.FEAR);
        h.speedMultiplier *= 1.05f;
    }
}
