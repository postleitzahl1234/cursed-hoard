package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Demon Shadow King (D-10). Crossing each HP threshold reconfigures the fight: a one-time burst,
 * a speed change, and a fresh maintained summon type — one cap per phase, never stacking.
 */
public class MultiPhase implements UnitBehavior {
    private static final float[] THRESHOLDS = {0.75f, 0.5f, 0.25f};
    private static final String[] PHASE_MINION = {"CURSED_SOLDIER", "HELLHOUND", "SHADOW_WRAITH"};

    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (w == null || !h.isAlive()) return;
        int phase = (int) h.bGet("multiPhase.phase", 0f);
        if (phase < THRESHOLDS.length && h.hp <= h.maxHp * THRESHOLDS[phase]) {
            h.bSet("multiPhase.phase", phase + 1f);
            HeroType minion = SummonSupport.byName(PHASE_MINION[phase]);
            if (minion != null) {
                for (int i = 0; i < 2 + phase; i++) SummonSupport.spawnAt(w, minion, h);
            }
            h.invulnTimer = Math.max(h.invulnTimer, 0.8f);   // the phase-change flinch
            h.triggerAbility();
            return;
        }
        // between thresholds he keeps a trickle of the current phase's minion alive
        if (phase == 0) return;
        HeroType minion = SummonSupport.byName(PHASE_MINION[phase - 1]);
        if (minion == null) return;
        if (!h.bCooldown("multiPhase.trickle", 7f - phase, dt)) return;
        if (SummonSupport.countAlive(w, minion) >= 2 + phase) return;
        SummonSupport.spawnAt(w, minion, h);
        h.triggerAbility();
    }
}
