package io.github.some_example_name.game;

/**
 * Qualitative resistance bands mapped to damage multipliers (D-11 / D-17).
 * bandToMultiplier() defines the actual damage scaling factor.
 */
public enum ResistBand {
    NONE(1.0f),
    LIGHT(0.88f),
    MED(0.74f),
    HIGH(0.58f),
    HEAVY(0.42f),
    FORT(0.28f);

    private final float multiplier;

    ResistBand(float multiplier) {
        this.multiplier = multiplier;
    }

    public float getMultiplier() {
        return multiplier;
    }

    public static float bandToMultiplier(ResistBand band) {
        if (band == null) {
            return 1.0f;
        }
        return band.getMultiplier();
    }
}
