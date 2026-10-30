package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Renegade Knight / Lord Commander / Doom Knight / the King. Periodically raises a guard that
 * cuts incoming damage for a while.
 *
 * <p>Timing lives on the Hero (see {@link Hero#behaviorState}) because the behaviour object is
 * shared by every unit of the type.
 */
public class ShieldMode implements UnitBehavior {
    public final float duration;
    public final float cooldown;
    public final float damageReductionMultiplier;

    public ShieldMode(float duration, float cooldown, float damageReductionMultiplier) {
        this.duration = duration;
        this.cooldown = cooldown;
        this.damageReductionMultiplier = damageReductionMultiplier;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        float active = h.bGet("shieldMode.active", 0f);
        if (active > 0f) {
            h.bSet("shieldMode.active", active - dt);
            h.damageTakenMultiplier *= damageReductionMultiplier;
            h.triggerAbility();
            return;
        }
        if (h.bCooldown("shieldMode.cd", cooldown, dt)) {
            h.bSet("shieldMode.active", duration);
        }
    }
}
