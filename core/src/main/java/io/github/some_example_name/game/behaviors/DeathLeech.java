package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** Soul Eater. Every nearby ally death feeds him — he heals from it and speeds up briefly. */
public class DeathLeech implements UnitBehavior {
    public final float radius;

    public DeathLeech(float radius) {
        this.radius = radius;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float fed = h.bGet("leech.fed", 0f);
        if (fed > 0f) { h.bSet("leech.fed", fed - dt); h.speedMultiplier *= 1.35f; }

        // count corpses in range that have not yet been consumed
        float r2 = radius * radius;
        for (Hero corpse : w.heroes) {
            if (corpse == h || corpse.state != Hero.State.DEAD) continue;
            if (corpse.bGet("leech.consumed", 0f) > 0f) continue;
            if (corpse.pos.dst2(h.pos) > r2) continue;
            corpse.bSet("leech.consumed", 1f);
            h.hp = Math.min(h.maxHp, h.hp + corpse.maxHp * 0.25f);
            h.bSet("leech.fed", 2.5f);
            h.triggerAbility();
        }
    }
}
