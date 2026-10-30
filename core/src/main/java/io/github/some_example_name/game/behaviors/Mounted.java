package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** Dune / Abyssal Behemoth and the Giant Vulture: a large mount that is hard to stop but
 *  turns slowly — it resists stun and fear outright, and pays for it in acceleration. */
public class Mounted implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        h.statusController.clearStatus(StatusType.STUN);
        h.statusController.clearStatus(StatusType.FEAR);
        h.speedMultiplier *= 0.92f;
    }
}
