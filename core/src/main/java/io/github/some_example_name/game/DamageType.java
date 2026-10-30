package io.github.some_example_name.game;

/**
 * The damage types supported by the redesigned game engine (D-11).
 * Note: HOLY has been cut. MAGIC is a resistance category, not a direct player damage source,
 * but exists in the damage type registry for completion.
 */
public enum DamageType {
    PHYSICAL,
    MAGIC,
    FIRE,
    FROST,
    LIGHTNING,
    CURSE
}
