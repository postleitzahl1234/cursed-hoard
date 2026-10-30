package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Pavise Guard. Forces towers to shoot him instead of what is behind him.
 *
 * <p>The redirect is implemented in {@code World.targetComparator}: taunting heroes sort ahead
 * of everyone else, whatever targeting policy the player has set on the tower. This behaviour
 * just raises the flag, which {@code Hero.update} clears every frame.
 */
public class Taunt implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        h.taunting = true;
        if (h.bCooldown("taunt.shout", 3.5f, dt)) h.triggerAbility();
    }
}
