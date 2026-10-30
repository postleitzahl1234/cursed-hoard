package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Sandstorm Shaman. Periodically raises a storm that makes every ally in radius untargetable
 * for its duration — the wave's version of the Mirage Dancer's personal phase.
 */
public class SandstormCover implements UnitBehavior {
    public final float radius;
    public final float duration;

    public SandstormCover(float radius, float duration) {
        this.radius = radius;
        this.duration = duration;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float active = h.bGet("storm.active", 0f);
        if (active > 0f) {
            h.bSet("storm.active", active - dt);
            float r2 = radius * radius;
            for (Hero other : w.heroes) {
                if (!other.isAlive() || other.pos.dst2(h.pos) > r2) continue;
                other.cloaked = true;                     // per-frame; Hero.update clears it
            }
            h.triggerAbility();
            return;
        }
        if (h.bCooldown("storm.cd", duration * 4f, dt)) h.bSet("storm.active", duration);
    }
}
