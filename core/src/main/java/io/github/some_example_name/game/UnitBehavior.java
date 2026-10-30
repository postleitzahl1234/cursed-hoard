package io.github.some_example_name.game;

/**
 * Strategy/Component interface for custom troop behaviors (D-09 / D-10 / D-17).
 * Allows modular implementation of dynamic features like mount/dismount, shield aura,
 * resurrect, etc. without modifying the core Hero class.
 */
public interface UnitBehavior {
    default void onSpawn(Hero h, World w) {}
    default void onUpdate(Hero h, World w, float dt) {}
    default void onDamaged(Hero h, World w, DamagePacket p) {}
    default void onDeath(Hero h, World w) {}
    default void onGemGrab(Hero h, World w) {}
    default void onGemDrop(Hero h, World w) {}
    default boolean isTargetable(Hero h) {
        return true;
    }
}
