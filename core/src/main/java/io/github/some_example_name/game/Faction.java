package io.github.some_example_name.game;

import com.badlogic.gdx.graphics.Color;

/**
 * Rebuilt Faction enum for cursed_treasure_v2 (D-01 / D-16 / D-24).
 * Retains only Orc, Crypt, Demon, and Goblin. Accents remapped.
 */
public enum Faction {
    ORC("Orc", new Color(0.36f, 0.54f, 0.23f, 1f), DamageType.PHYSICAL),       // anchor MS3 war-green
    CRYPT("Crypt", new Color(0.63f, 0.88f, 1.0f, 1f), DamageType.FROST),       // anchor IC3 ice-blue
    DEMON("Demon", new Color(1.0f, 0.25f, 0.14f, 1f), DamageType.FIRE),        // anchor EM3 lava-red
    GOBLIN("Goblin", new Color(0.85f, 0.66f, 0.28f, 1f), DamageType.PHYSICAL);  // anchor BR4 brass

    public final String displayName;
    public final Color accentColor;
    public final DamageType primaryDamageType;

    Faction(String displayName, Color accentColor, DamageType primaryDamageType) {
        this.displayName = displayName;
        this.accentColor = accentColor;
        this.primaryDamageType = primaryDamageType;
    }
}
