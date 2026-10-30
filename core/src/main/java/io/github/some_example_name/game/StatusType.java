package io.github.some_example_name.game;

/**
 * Status types supported by the redesigned game engine (D-17).
 */
public enum StatusType {
    FEAR,
    SLOW,
    FREEZE, // Hard-slow / stop
    STUN,   // Stuns towers or enemies
    BURN,   // Damage over time (DoT)
    CURSE   // Decreases resistances / increases damage taken
}
