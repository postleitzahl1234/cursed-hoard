package io.github.some_example_name.assets;

import com.badlogic.gdx.graphics.Color;

/**
 * Shanshuihua visual tokens: ink, xuan paper and restrained mineral pigments.
 *
 * <p>The public names are kept stable because the rendering code uses {@code GOLD} as its
 * semantic "important accent" token. In this edition that accent is cinnabar rather than metal.
 */
public final class UiTheme {
    private UiTheme() {}

    /** Composition target: dominant ink, supporting paper/material, rare mineral accent. */
    public static final float DOMINANT_SHARE = 0.60f;
    public static final float SECONDARY_SHARE = 0.30f;
    public static final float ACCENT_SHARE = 0.10f;

    public static final Color VOID = rgb("1F1B16");          // concentrated lampblack
    public static final Color SURFACE = rgb("342E26");       // ink-soaked warm paper
    public static final Color SURFACE_RAISED = rgb("55493A");
    public static final Color INK = rgb("F3E5C8");           // illuminated xuan paper
    public static final Color INK_MUTED = rgb("B7AA91");
    public static final Color GOLD = rgb("D25A3C");          // cinnabar seal red
    public static final Color TEAL = rgb("5D8B76");          // muted jade mineral pigment

    private static final Color[] WORLD_ACCENTS = {
        rgb("6F8F5E"), // grasslands — moss and malachite
        rgb("7899A3"), // mountains — azurite mist
        rgb("C09258"), // sand — ochre wash
        rgb("B76868"), // gardens — faded blossom/cinnabar
        rgb("80678E")  // shadow — dusk mineral violet
    };

    public static Color worldAccent(int worldIndex) {
        return WORLD_ACCENTS[Math.max(0, Math.min(WORLD_ACCENTS.length - 1, worldIndex))];
    }

    /** WCAG relative-luminance contrast ratio, useful for regression tests and palette reviews. */
    public static float contrast(Color a, Color b) {
        float l1 = luminance(a), l2 = luminance(b);
        return (Math.max(l1, l2) + 0.05f) / (Math.min(l1, l2) + 0.05f);
    }

    private static float luminance(Color c) {
        return 0.2126f * linear(c.r) + 0.7152f * linear(c.g) + 0.0722f * linear(c.b);
    }

    private static float linear(float value) {
        return value <= 0.04045f ? value / 12.92f
                : (float) Math.pow((value + 0.055f) / 1.055f, 2.4f);
    }

    private static Color rgb(String hex) {
        return Color.valueOf(hex + "FF");
    }
}
