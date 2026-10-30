package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Glass Sentinel. For a window after being struck, incoming damage HEALS it instead of hurting
 * it — the player has to stop shooting, which is the point.
 */
public class DamageToHeal implements UnitBehavior {
    public final float activeDuration;
    public final float cooldown;

    public DamageToHeal(float activeDuration, float cooldown) {
        this.activeDuration = activeDuration;
        this.cooldown = cooldown;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        float active = h.bGet("d2h.active", 0f);
        if (active > 0f) {
            h.bSet("d2h.active", active - dt);
            h.damageTakenMultiplier = 0f;                       // nothing gets through
            h.hp = Math.min(h.maxHp, h.hp + h.lastDamageTaken * 0.5f + 6f * dt);
            h.triggerAbility();
            return;
        }
        if (h.bCooldown("d2h.cd", cooldown, dt)) h.bSet("d2h.active", activeDuration);
    }
}
