package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.Hero;
import io.github.some_example_name.game.HeroType;
import io.github.some_example_name.game.World;

/**
 * Shared plumbing for every behaviour that puts a new unit on the board (D-10).
 *
 * <p>Deliberately not a {@code UnitBehavior} — it holds no state and belongs to nobody. It exists
 * because four behaviours (continuous summon, threshold burst, multi-phase, path transform) all
 * need the same three things, and because summoning has two traps worth solving once:
 *
 * <ol>
 *   <li><b>Summons must not pay a bounty.</b> A boss that spawns infinite minions would be an
 *       infinite gold fountain. Summoned units are marked {@code rewarded} on arrival.</li>
 *   <li><b>Summons appear where the summoner is</b>, not at the spawn point. {@code spawnHero}
 *       puts a unit at waypoint 0; a summon has to be pulled forward to the boss.</li>
 * </ol>
 */
public final class SummonSupport {
    private SummonSupport() {}

    /** Resolve a HeroType from the name a behaviour was configured with; null if unknown. */
    public static HeroType byName(String name) {
        if (name == null) return null;
        try {
            return HeroType.valueOf(name);
        } catch (IllegalArgumentException e) {
            return null;                      // a typo in a roster string must not crash a wave
        }
    }

    /** How many of this archetype are currently alive — the field cap of D-10. */
    public static int countAlive(World w, HeroType type) {
        int n = 0;
        for (Hero h : w.heroes) {
            if (h.type == type && h.isAlive()) n++;
        }
        return n;
    }

    /**
     * Spawn {@code type} at the summoner's position and progress along the path.
     *
     * @return the new hero, or null if the world refused it.
     */
    public static Hero spawnAt(World w, HeroType type, Hero summoner) {
        if (w == null || type == null) return null;
        Hero minion = w.spawnHero(type);
        if (minion == null) return null;
        minion.rewarded = true;               // no bounty for summoned units (see class doc)
        if (summoner != null) {
            minion.snapToWaypoint(summoner.targetWaypoint);
            minion.pos.set(summoner.pos.x, summoner.pos.y);
            minion.state = summoner.state == Hero.State.GOING_OUT
                    ? Hero.State.GOING_IN     // summons always advance, even if the boss is fleeing
                    : summoner.state;
        }
        return minion;
    }
}
