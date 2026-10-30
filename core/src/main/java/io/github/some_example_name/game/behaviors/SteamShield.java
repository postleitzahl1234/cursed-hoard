package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Royal Engineer / Siege Wagon. Vents steam that shields the machine and everything hiding
 * behind it — the same effect as an ally shield but centred on a vehicle, and it also briefly
 * blinds nearby towers rather than only mitigating.
 */
public class SteamShield implements UnitBehavior {
    public final float radius;
    public final float duration;

    public SteamShield(float radius, float duration) {
        this.radius = radius;
        this.duration = duration;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float active = h.bGet("steam.active", 0f);
        if (active > 0f) {
            h.bSet("steam.active", active - dt);
            float r2 = radius * radius;
            h.damageTakenMultiplier *= 0.5f;
            for (Hero other : w.heroes) {
                if (!other.isAlive() || other.pos.dst2(h.pos) > r2) continue;
                other.damageTakenMultiplier *= 0.7f;
            }
            h.triggerAbility();
            return;
        }
        if (h.bCooldown("steam.cd", duration * 3f, dt)) h.bSet("steam.active", duration);
    }
}
