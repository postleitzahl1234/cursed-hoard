package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Monk → Templar (D-04c). A one-way archetype swap once the unit is far enough along the path.
 *
 * <p>The engine has no in-place type change, so the swap is done honestly: spawn the new
 * archetype at the same point on the route with proportional HP, and retire the old body
 * without paying a bounty — it did not die, it became something else.
 */
public class PathProgressTransform implements UnitBehavior {
    public final float progressThreshold;
    public final String transformToTypeName;

    public PathProgressTransform(float progressThreshold, String transformToTypeName) {
        this.progressThreshold = progressThreshold;
        this.transformToTypeName = transformToTypeName;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive() || h.waypoints.isEmpty()) return;
        if (h.bGet("transform.done", 0f) > 0f) return;
        float progress = h.targetWaypoint / (float) Math.max(1, h.waypoints.size() - 1);
        if (progress < progressThreshold) return;

        HeroType into = SummonSupport.byName(transformToTypeName);
        if (into == null) return;
        h.bSet("transform.done", 1f);
        h.triggerAbility();

        Hero grown = SummonSupport.spawnAt(w, into, h);
        if (grown != null) {
            grown.targetWaypoint = h.targetWaypoint;
            grown.state = h.state;
            grown.hp = grown.maxHp * Math.max(0.35f, h.hp / Math.max(1f, h.maxHp));
        }
        h.rewarded = true;                 // becoming a Templar is not a kill
        h.state = Hero.State.DEAD;
        h.deathAnim = 0.4f;
    }
}
