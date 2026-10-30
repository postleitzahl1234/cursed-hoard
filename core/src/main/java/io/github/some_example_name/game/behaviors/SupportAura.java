package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Banner Sergeant. Speeds up nearby allies and makes them fearless while the banner stands.
 *
 * <p>Auras write into {@link Hero#speedMultiplier}. {@link World#update(float)} first calls
 * {@link Hero#beginFrame()} for the whole roster, then updates every hero so aura contributions
 * accumulate independently of spawn order. Rebuilding the value each frame makes the buff vanish
 * as soon as the sergeant dies, with no bookkeeping to unwind.
 */
public class SupportAura implements UnitBehavior {
    public final float radius;
    public final float speedBuff;

    public SupportAura(float radius, float speedBuff) {
        this.radius = radius;
        this.speedBuff = speedBuff;
    }

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        float r2 = radius * radius;
        boolean touched = false;
        for (Hero other : w.heroes) {
            if (!other.isAlive() || other.pos.dst2(h.pos) > r2) continue;
            other.speedMultiplier *= (1f + speedBuff);
            touched = true;
        }
        // the ability clip plays on a slow pulse so the ring reads as a repeating rally
        if (touched && h.bCooldown("supportAura.pulse", 2.5f, dt)) h.triggerAbility();
    }
}
