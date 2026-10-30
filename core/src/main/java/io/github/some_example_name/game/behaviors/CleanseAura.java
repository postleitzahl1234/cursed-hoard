package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Inquisitor / High Priest. Strips the player's control statuses off nearby allies.
 *
 * <p>Cleanses SLOW, FREEZE, FEAR and STUN — the things that stop an advance — but deliberately
 * NOT BURN or CURSE, so Demon and Crypt damage still lands through a cleanser.
 */
public class CleanseAura implements UnitBehavior {
    public final float radius;
    public final float interval;

    public CleanseAura(float radius, float interval) {
        this.radius = radius;
        this.interval = interval;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (!h.bCooldown("cleanse", interval, dt)) return;
        float r2 = radius * radius;
        boolean cleansed = false;
        for (Hero other : w.heroes) {
            if (!other.isAlive() || other.pos.dst2(h.pos) > r2) continue;
            for (StatusType t : new StatusType[] {StatusType.SLOW, StatusType.FREEZE,
                                                  StatusType.FEAR, StatusType.STUN}) {
                if (other.statusController.isStatusActive(t)) {
                    other.statusController.clearStatus(t);
                    cleansed = true;
                }
            }
        }
        if (cleansed) h.triggerAbility();
    }
}
