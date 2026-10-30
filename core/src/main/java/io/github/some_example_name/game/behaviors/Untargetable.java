package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Shadow Wraith / Mirage Dancer. Phases out on a cycle: for {@code hiddenDuration} out of every
 * {@code cycle} seconds, towers cannot pick it at all.
 *
 * <p>{@link UnitBehavior#isTargetable} is consulted by {@code World.findTarget}, so this makes
 * the unit genuinely unselectable rather than merely evasive.
 */
public class Untargetable implements UnitBehavior {
    public final float hiddenDuration;
    public final float cycle;

    public Untargetable(float hiddenDuration, float cycle) {
        this.hiddenDuration = hiddenDuration;
        this.cycle = cycle;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        float t = h.bGet("phase.t", 0f) + dt;
        if (t >= cycle) t -= cycle;
        h.bSet("phase.t", t);
        if (t < hiddenDuration) h.triggerAbility();
    }

    @Override
    public boolean isTargetable(Hero h) {
        return h.bGet("phase.t", 0f) >= hiddenDuration;
    }
}
