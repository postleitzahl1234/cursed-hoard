package io.github.some_example_name.assets;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.utils.Disposable;

/**
 * The two interactive overworld maps (map1 / map2) and their five per-world fragment overlays.
 * Each fragment PNG carries one biome region in its true position on the 1536×1024 frame with the
 * rest transparent/white, so the fragment doubles as (a) a hover/selection highlight and (b) an
 * alpha hit-mask for click routing. World order: 0 grasslands · 1 mountains · 2 sand · 3 gardens ·
 * 4 shadow (matches {@code selectedWorldIndex}).
 */
public final class WorldMap implements Disposable {
    public static final int MAP_W = 1536, MAP_H = 1024;
    public static final int STYLES = 2, WORLDS = 5;
    private static final String[] SLUG = {"grasslands", "mountains", "sand", "gardens", "shadow"};

    private final Texture[] mapTex = new Texture[STYLES];
    private final Texture[][] fragTex = new Texture[STYLES][WORLDS];
    private final Pixmap[][] fragMask = new Pixmap[STYLES][WORLDS];
    private boolean loaded;

    public void load() {
        for (int s = 0; s < STYLES; s++) {
            mapTex[s] = tex("maps/map" + (s + 1) + ".png");
            for (int w = 0; w < WORLDS; w++) {
                String path = "maps/worlds/map" + (s + 1) + "-" + SLUG[w] + ".png";
                fragTex[s][w] = tex(path);
                fragMask[s][w] = new Pixmap(Gdx.files.internal(path));
            }
        }
        loaded = true;
    }

    private Texture tex(String path) {
        Texture t = new Texture(Gdx.files.internal(path));
        t.setFilter(Texture.TextureFilter.Linear, Texture.TextureFilter.Linear);
        return t;
    }

    public boolean isLoaded() {
        return loaded;
    }

    public Texture map(int style) {
        return mapTex[clampStyle(style)];
    }

    public Texture fragment(int style, int world) {
        return fragTex[clampStyle(style)][clampWorld(world)];
    }

    /**
     * The world whose region covers map-pixel ({@code px},{@code py}) — top-left origin — or -1.
     * A pixel belongs to a region when its fragment sample is sufficiently opaque and not the
     * white/transparent backdrop (handles both alpha-cut and white-matte exports).
     */
    public int worldAt(int style, int px, int py) {
        style = clampStyle(style);
        if (px < 0 || py < 0 || px >= MAP_W || py >= MAP_H) return -1;
        for (int w = 0; w < WORLDS; w++) {
            if (isRegionPixel(fragMask[style][w].getPixel(px, py))) return w;
        }
        return -1;
    }

    /**
     * Whether an RGBA8888 sample belongs to a fragment's biome region: sufficiently opaque and not
     * the white/transparent backdrop. Pure (GL-free) so the hit logic is unit-testable.
     */
    public static boolean isRegionPixel(int rgba) {
        int a = rgba & 0xff;
        int r = (rgba >>> 24) & 0xff, g = (rgba >>> 16) & 0xff, b = (rgba >>> 8) & 0xff;
        boolean nearWhite = r > 238 && g > 238 && b > 238;
        return a > 40 && !nearWhite;
    }

    private int clampStyle(int s) {
        return Math.max(0, Math.min(STYLES - 1, s));
    }

    private int clampWorld(int w) {
        return Math.max(0, Math.min(WORLDS - 1, w));
    }

    @Override
    public void dispose() {
        for (int s = 0; s < STYLES; s++) {
            if (mapTex[s] != null) mapTex[s].dispose();
            for (int w = 0; w < WORLDS; w++) {
                if (fragTex[s][w] != null) fragTex[s][w].dispose();
                if (fragMask[s][w] != null) fragMask[s][w].dispose();
            }
        }
    }
}
