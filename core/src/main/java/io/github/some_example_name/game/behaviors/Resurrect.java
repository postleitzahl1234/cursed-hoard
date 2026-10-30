package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Void Priest. Brings a nearby corpse back at reduced HP, up to a personal cap.
 *
 * <p>Per D-10 the revives count toward the priest's own cap, so a single priest cannot rebuild
 * a whole wave. Revived units come back at half HP and cannot themselves be re-revived.
 */
public class Resurrect implements UnitBehavior {
    public final float interval;
    public final int maxRevives;

    public Resurrect(float interval, int maxRevives) {
        this.interval = interval;
        this.maxRevives = maxRevives;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (h.bGet("resurrect.used", 0f) >= maxRevives) return;
        if (!h.bCooldown("resurrect", interval, dt)) return;
        for (Hero corpse : w.heroes) {
            if (corpse == h || corpse.state != Hero.State.DEAD) continue;
            if (corpse.bGet("resurrect.wasRevived", 0f) > 0f) continue;
            if (corpse.pos.dst2(h.pos) > 96f * 96f) continue;
            corpse.state = Hero.State.GOING_IN;
            corpse.hp = corpse.maxHp * 0.5f;
            corpse.deathAnim = 0f;
            corpse.rewarded = true;                 // no second bounty for the same unit
            corpse.bSet("resurrect.wasRevived", 1f);
            h.bSet("resurrect.used", h.bGet("resurrect.used", 0f) + 1f);
            h.triggerAbility();
            return;
        }
    }
}
