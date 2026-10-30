package io.github.some_example_name.game;

/**
 * Elemental overrides that stack on top of base bands (D-11 / D-17).
 */
public enum ElementResponse {
    NORMAL,
    RESIST,   // Double mitigation or flat reduction factor
    IMMUNE,   // 0% damage taken
    VULN      // Amplified damage taken
}
