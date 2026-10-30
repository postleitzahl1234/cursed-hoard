package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Bard. Stops dead on an interval to play, and while playing hastens everyone around him.
 * Halting is the cost: the buff is strong, but the bard makes no progress while it lasts.
 */
public class StationaryPerformer implements UnitBehavior {
    public final float singInterval;
    public final float singDuration;

    public StationaryPerformer(float singInterval, float singDuration) {
        this.singInterval = singInterval;
        this.singDuration = singDuration;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float active = h.bGet("sing.active", 0f);
        if (active > 0f) {
            h.bSet("sing.active", active - dt);
            h.speedMultiplier = 0f;                        // rooted while performing
            for (Hero other : w.heroes) {
                if (other == h || !other.isAlive()) continue;
                if (other.pos.dst2(h.pos) > 112f * 112f) continue;
                other.speedMultiplier *= 1.3f;
            }
            h.triggerAbility();
            return;
        }
        if (h.bCooldown("sing.cd", singInterval, dt)) h.bSet("sing.active", singDuration);
    }
}
