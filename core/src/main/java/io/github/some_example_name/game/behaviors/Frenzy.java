package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Flagellant. The more wounded he is, the faster and more dangerous he gets — the only unit that
 * gets better as you shoot it.
 */
public class Frenzy implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        float missing = 1f - (h.hp / Math.max(1f, h.maxHp));
        if (missing <= 0.1f) return;
        h.speedMultiplier *= 1f + missing * 0.9f;         // up to +90% at death's door
        h.damageTakenMultiplier *= 1f - missing * 0.25f;  // and harder to finish
        if (h.bCooldown("frenzy.pulse", 1.8f, dt)) h.triggerAbility();
    }
}
