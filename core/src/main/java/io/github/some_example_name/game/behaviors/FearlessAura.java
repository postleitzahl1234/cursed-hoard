package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** Royal Standard Bearer. Nearby allies cannot be feared while the standard is up. */
public class FearlessAura implements UnitBehavior {
    public final float radius;

    public FearlessAura(float radius) {
        this.radius = radius;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float r2 = radius * radius;
        for (Hero other : w.heroes) {
            if (!other.isAlive() || other.pos.dst2(h.pos) > r2) continue;
            other.statusController.clearStatus(StatusType.FEAR);
        }
        if (h.bCooldown("fearless.pulse", 3f, dt)) h.triggerAbility();
    }
}
