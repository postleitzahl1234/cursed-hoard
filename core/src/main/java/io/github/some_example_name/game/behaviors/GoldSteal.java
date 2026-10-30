package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** Chief Rebel. Skims the player's gold on an interval — pure economic pressure. */
public class GoldSteal implements UnitBehavior {
    public final float interval;

    public GoldSteal(float interval) {
        this.interval = interval;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (!h.bCooldown("goldSteal", interval, dt)) return;
        int take = Math.min(w.gold, 25);
        if (take <= 0) return;
        w.gold -= take;
        h.triggerAbility();
    }
}
