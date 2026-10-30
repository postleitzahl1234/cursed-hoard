package com.badlogic.gdx.graphics;

/** Headless stand-in for libGDX Color — same API surface the game and render packages use. */
public class Color {
    public float r, g, b, a;
    public static final Color WHITE = new Color(1, 1, 1, 1);

    public Color() {}
    public Color(float r, float g, float b, float a) { this.r = r; this.g = g; this.b = b; this.a = a; }
    public Color(Color c) { this(c.r, c.g, c.b, c.a); }
    public Color set(Color c) { r = c.r; g = c.g; b = c.b; a = c.a; return this; }
    public Color cpy() { return new Color(r, g, b, a); }

    /** Parses a hex string ("rrggbb" or "rrggbbaa"), same as libGDX Color.valueOf. */
    public static Color valueOf(String hex) {
        String h = hex.startsWith("#") ? hex.substring(1) : hex;
        float r = Integer.parseInt(h.substring(0, 2), 16) / 255f;
        float g = Integer.parseInt(h.substring(2, 4), 16) / 255f;
        float b = Integer.parseInt(h.substring(4, 6), 16) / 255f;
        float a = h.length() >= 8 ? Integer.parseInt(h.substring(6, 8), 16) / 255f : 1f;
        return new Color(r, g, b, a);
    }
}
