package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * The one-time burst half of D-10's phased summoning: when HP first crosses the threshold, drop
 * a batch at once. The burst seeds the cap that {@link ContinuousSummon} then backfills.
 */
public class ThresholdSummon implements UnitBehavior {
    public final String minionTypeName;
    public final float hpThreshold;
    public final int burstCount;

    public ThresholdSummon(String minionTypeName, float hpThreshold, int burstCount) {
        this.minionTypeName = minionTypeName;
        this.hpThreshold = hpThreshold;
        this.burstCount = burstCount;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (h.bGet("thresholdSummon.spent", 0f) > 0f) return;
        if (h.hp > h.maxHp * hpThreshold) return;
        h.bSet("thresholdSummon.spent", 1f);
        HeroType minion = SummonSupport.byName(minionTypeName);
        if (minion == null) return;
        for (int i = 0; i < burstCount; i++) SummonSupport.spawnAt(w, minion, h);
        h.triggerAbility();
    }
}
