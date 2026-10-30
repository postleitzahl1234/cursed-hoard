package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Boss summoning (D-10). Maintains a field cap of one minion type: spawns on an interval, and
 * only up to {@code maxAlive} of that type at once, so the cap refills as summons die.
 */
public class ContinuousSummon implements UnitBehavior {
    public final String minionTypeName;
    public final float interval;
    public final int maxAlive;

    public ContinuousSummon(String minionTypeName, float interval, int maxAlive) {
        this.minionTypeName = minionTypeName;
        this.interval = interval;
        this.maxAlive = maxAlive;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (!h.bCooldown("summon", interval, dt)) return;
        HeroType minion = SummonSupport.byName(minionTypeName);
        if (minion == null) return;
        if (SummonSupport.countAlive(w, minion) >= maxAlive) return;
        SummonSupport.spawnAt(w, minion, h);
        h.triggerAbility();
    }
}
