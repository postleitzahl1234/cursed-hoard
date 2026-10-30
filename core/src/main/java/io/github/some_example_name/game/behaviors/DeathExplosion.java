package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/** Rebel Sapper. Detonates his powder kegs on death, damaging everything nearby — including
 *  the player's units? No: this is an enemy, so it hurts nothing on the board. It exists to
 *  make his corpse dangerous to LINGER near, which it does by re-triggering his own death FX and
 *  briefly disabling towers in blast range (they are stunned by the concussion, never destroyed
 *  — D-05a: towers have no HP). */
public class DeathExplosion implements UnitBehavior {
    public final float radius;

    public DeathExplosion(float radius) {
        this.radius = radius;
    }

    @Override
    public void onDeath(Hero h, World w) {
        if (w == null) return;
        float r2 = radius * radius;
        for (Tower tower : w.towers) {
            if (tower.pos.dst2(h.pos) <= r2) tower.applyDisable(1.6f);
        }
    }
}
