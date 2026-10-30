package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Chief Rebel. Rolling suppression: towers he walks past are periodically jammed.
 *
 * <p>This is the one enemy effect that touches towers directly, and it respects D-05a — towers
 * are disabled, never damaged or destroyed.
 */
public class TowerSuppressionField implements UnitBehavior {
    private static final float RADIUS = 110f;

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (!h.bCooldown("suppress", 4f, dt)) return;
        float r2 = RADIUS * RADIUS;
        boolean hit = false;
        for (Tower tower : w.towers) {
            if (tower.pos.dst2(h.pos) > r2) continue;
            tower.applyDisable(1.8f);
            hit = true;
        }
        if (hit) h.triggerAbility();
    }
}
