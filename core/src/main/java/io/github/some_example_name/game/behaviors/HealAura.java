package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** War Cleric. Heals nearby allies on an interval — never above their max. */
public class HealAura implements UnitBehavior {
    public final float radius;
    public final int healAmount;

    public HealAura(float radius, int healAmount) {
        this.radius = radius;
        this.healAmount = healAmount;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        if (!h.bCooldown("healAura", 1.5f, dt)) return;
        float r2 = radius * radius;
        boolean healed = false;
        for (Hero other : w.heroes) {
            if (!other.isAlive() || other.hp >= other.maxHp) continue;
            if (other.pos.dst2(h.pos) > r2) continue;
            other.hp = Math.min(other.maxHp, other.hp + healAmount);
            healed = true;
        }
        if (healed) h.triggerAbility();
    }
}
