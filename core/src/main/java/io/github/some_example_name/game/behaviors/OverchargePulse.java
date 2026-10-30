package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** The King. A periodic pulse that jams every tower in a wide ring around him (D-05a: disabled,
 *  not destroyed) and hastens his own guard. */
public class OverchargePulse implements UnitBehavior {
    public final float interval;

    public OverchargePulse(float interval) {
        this.interval = interval;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (!h.bCooldown("overcharge", interval, dt)) return;
        for (Tower tower : w.towers) {
            if (tower.pos.dst2(h.pos) <= 150f * 150f) tower.applyDisable(2.2f);
        }
        for (Hero ally : w.heroes) {
            if (ally.isAlive() && ally.pos.dst2(h.pos) <= 120f * 120f) ally.speedMultiplier *= 1.4f;
        }
        h.triggerAbility();
    }
}
