package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Golden Prince / Gem Shade — the specialists of D-09. Carrying is already handled by the Hero,
 * so this behaviour supplies the two things the spec attaches to a *specialist* carrier: the
 * grab is faster than a normal unit's, and the carry penalty is lighter.
 */
public class GemCarrier implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        if (h.state == Hero.State.AT_CAVE) h.caveTimer -= dt * 0.8f;   // grabs quicker
        if (h.carrying != null) h.speedMultiplier *= 1.25f;             // and runs better with it
    }

    @Override
    public void onGemGrab(Hero h, World w) {
        h.triggerAbility();
    }
}
