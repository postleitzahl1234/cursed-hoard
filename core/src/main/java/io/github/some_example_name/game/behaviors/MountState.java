package io.github.some_example_name.game.behaviors;

import io.github.some_example_name.game.*;

/**
 * Golden Prince / Royal Prince (D-09). Mounted while unburdened, dismounted the moment a gem is
 * grabbed — and dismounting costs the armour the mount was carrying.
 */
public class MountState implements UnitBehavior {
    @Override
    public void onUpdate(Hero h, World w, float dt) {
        if (!h.isAlive()) return;
        boolean mounted = h.carrying == null;
        h.bSet("mount.mounted", mounted ? 1f : 0f);
        if (mounted) h.speedMultiplier *= 1.3f;          // the horse
        else h.damageTakenMultiplier *= 1.35f;           // on foot and exposed
    }

    @Override
    public void onGemGrab(Hero h, World w) {
        h.triggerAbility();                              // the dismount itself
    }
}
