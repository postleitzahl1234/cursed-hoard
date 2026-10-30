package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** Court Conjurer. Throws the shield onto ALLIES rather than himself. */
public class AllyShield implements UnitBehavior {
    public final float radius;
    public final float duration;

    public AllyShield(float radius, float duration) {
        this.radius = radius;
        this.duration = duration;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float active = h.bGet("allyShield.active", 0f);
        if (active > 0f) {
            h.bSet("allyShield.active", active - dt);
            float r2 = radius * radius;
            for (Hero other : w.heroes) {
                if (other == h || !other.isAlive() || other.pos.dst2(h.pos) > r2) continue;
                other.damageTakenMultiplier *= 0.45f;
            }
            h.triggerAbility();
            return;
        }
        if (h.bCooldown("allyShield.cd", duration * 2.5f, dt)) h.bSet("allyShield.active", duration);
    }
}
