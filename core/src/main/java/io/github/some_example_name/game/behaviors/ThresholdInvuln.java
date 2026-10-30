package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Knight Lieutenant / Templar. Once, when HP first drops below the threshold, becomes briefly
 * invulnerable.
 *
 * <p>The original stub carried a {@code private boolean triggered} field. That would have been
 * shared by every Knight Lieutenant in the game — the first one to be wounded would have burned
 * the flag for all of them. The "have I fired" mark now lives on the Hero.
 */
public class ThresholdInvuln implements UnitBehavior {
    public final float hpThreshold;
    public final float duration;

    public ThresholdInvuln(float hpThreshold, float duration) {
        this.hpThreshold = hpThreshold;
        this.duration = duration;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        if (h.bGet("thresholdInvuln.spent", 0f) > 0f) return;
        if (h.hp > h.maxHp * hpThreshold) return;
        h.bSet("thresholdInvuln.spent", 1f);
        h.invulnTimer = Math.max(h.invulnTimer, duration);
        h.triggerAbility();
    }
}
