package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Paladin. Immune to every movement-impairing status.
 *
 * <p>D-30(a) made FREEZE its own StatusType rather than a SLOW magnitude, so both have to be
 * cleared here — clearing only SLOW would leave a Paladin freezable, which the roster says he
 * is not (D-17: "immune to all slow" → SLOW + FREEZE immune).
 */
public class SlowImmunity implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        h.statusController.clearStatus(StatusType.SLOW);
        h.statusController.clearStatus(StatusType.FREEZE);
    }
}
