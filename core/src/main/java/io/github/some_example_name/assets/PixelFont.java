package io.github.some_example_name.assets;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.utils.Disposable;
import java.util.HashMap;
import java.util.Map;

/**
 * A self-contained 5×7 ink font baked into a texture atlas at load time — no external font asset.
 * Uppercase + digits + the symbols the UI uses; lowercase renders as uppercase. Glyph geometry
 * stays on the game's crisp integer grid, while deterministic alpha variation gives every mark the
 * slightly dry, pooled density of a small brush on xuan paper.
 */
public final class PixelFont implements Disposable {
    public static final int GW = 5, GH = 7, ADV = 6;   // glyph w/h, advance (incl. 1px gap)
    private final Map<Character, TextureRegion> glyphs = new HashMap<>();
    private Texture texture;

    public PixelFont() {
        bake();
    }

    /** Pixel width of a string at the given integer scale. */
    public float width(String s, int scale) {
        return (s == null ? 0 : s.length()) * ADV * scale;
    }

    public float height(int scale) {
        return GH * scale;
    }

    /**
     * Draw {@code s} with its top-left at ({@code x},{@code yTop}) (y-up; text grows downward, like
     * the old BitmapFont convention) at integer {@code scale}, tinted {@code color}.
     */
    public float draw(SpriteBatch batch, String s, float x, float yTop, int scale, Color color) {
        if (s == null || s.isEmpty()) return 0f;
        float gx = Math.round(x);
        float gy = Math.round(yTop) - GH * scale;
        batch.setColor(color);
        for (int i = 0; i < s.length(); i++) {
            TextureRegion r = glyphs.get(glyphKey(s.charAt(i)));
            if (r != null) batch.draw(r, gx, gy, GW * scale, GH * scale);
            gx += ADV * scale;
        }
        batch.setColor(Color.WHITE);
        return gx - Math.round(x);
    }

    /** Draw with a 1-pixel dark drop shadow for legibility on busy backgrounds. */
    public float drawShadowed(SpriteBatch batch, String s, float x, float yTop, int scale, Color color) {
        draw(batch, s, x + scale, yTop - scale, scale, SHADOW);
        return draw(batch, s, x, yTop, scale, color);
    }

    private static final Color SHADOW = Color.valueOf("000000cc");

    private char glyphKey(char c) {
        char up = Character.toUpperCase(c);
        return glyphs.containsKey(up) ? up : (glyphs.containsKey(c) ? c : ' ');
    }

    private void bake() {
        Map<Character, String[]> g = glyphData();
        int cols = 16;
        int rows = (g.size() + cols - 1) / cols;
        int cellW = GW + 1, cellH = GH + 1;
        Pixmap pm = new Pixmap(cols * cellW, rows * cellH, Pixmap.Format.RGBA8888);
        pm.setColor(0, 0, 0, 0);
        pm.fill();
        int idx = 0;
        for (Map.Entry<Character, String[]> e : g.entrySet()) {
            int cx = (idx % cols) * cellW, cy = (idx / cols) * cellH;
            String[] rowsData = e.getValue();
            for (int yy = 0; yy < GH; yy++) {
                String line = yy < rowsData.length ? rowsData[yy] : "";
                for (int xx = 0; xx < GW && xx < line.length(); xx++) {
                    if (line.charAt(xx) == '#') {
                        pm.setColor(1f, 1f, 1f, brushAlpha(e.getKey(), xx, yy));
                        pm.drawPixel(cx + xx, cy + yy);
                    }
                }
            }
            idx++;
        }
        texture = new Texture(pm);
        texture.setFilter(Texture.TextureFilter.Nearest, Texture.TextureFilter.Nearest);
        pm.dispose();
        idx = 0;
        for (Character ch : g.keySet()) {
            int cx = (idx % cols) * cellW, cy = (idx / cols) * cellH;
            glyphs.put(ch, new TextureRegion(texture, cx, cy, GW, GH));
            idx++;
        }
    }

    @Override
    public void dispose() {
        if (texture != null) texture.dispose();
    }

    private static String[] r(String... rows) {
        return rows;
    }

    /** Stable ink-density variation: no runtime randomness and no loss of glyph geometry. */
    private static float brushAlpha(char glyph, int x, int y) {
        int grain = Math.floorMod(glyph * 31 + x * 17 + y * 13, 11);
        if (grain == 0) return 0.68f;      // dry bristle catching the paper tooth
        if (grain <= 3) return 0.84f;      // lighter edge of a brush mark
        return 1f;                         // pooled lampblack core
    }

    private Map<Character, String[]> glyphData() {
        Map<Character, String[]> m = new java.util.LinkedHashMap<>();
        m.put(' ', r("     ", "     ", "     ", "     ", "     ", "     ", "     "));
        m.put('A', r(".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"));
        m.put('B', r("####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."));
        m.put('C', r(".####", "#....", "#....", "#....", "#....", "#....", ".####"));
        m.put('D', r("####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."));
        m.put('E', r("#####", "#....", "#....", "####.", "#....", "#....", "#####"));
        m.put('F', r("#####", "#....", "#....", "####.", "#....", "#....", "#...."));
        m.put('G', r(".####", "#....", "#....", "#.###", "#...#", "#...#", ".####"));
        m.put('H', r("#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"));
        m.put('I', r(".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."));
        m.put('J', r("..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."));
        m.put('K', r("#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"));
        m.put('L', r("#....", "#....", "#....", "#....", "#....", "#....", "#####"));
        m.put('M', r("#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"));
        m.put('N', r("#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#", "#...#"));
        m.put('O', r(".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."));
        m.put('P', r("####.", "#...#", "#...#", "####.", "#....", "#....", "#...."));
        m.put('Q', r(".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"));
        m.put('R', r("####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"));
        m.put('S', r(".####", "#....", "#....", ".###.", "....#", "....#", "####."));
        m.put('T', r("#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."));
        m.put('U', r("#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."));
        m.put('V', r("#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."));
        m.put('W', r("#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"));
        m.put('X', r("#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"));
        m.put('Y', r("#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."));
        m.put('Z', r("#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"));
        m.put('0', r(".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."));
        m.put('1', r("..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."));
        m.put('2', r(".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"));
        m.put('3', r("#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."));
        m.put('4', r("...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."));
        m.put('5', r("#####", "#....", "####.", "....#", "....#", "#...#", ".###."));
        m.put('6', r("..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."));
        m.put('7', r("#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."));
        m.put('8', r(".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."));
        m.put('9', r(".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."));
        m.put('.', r(".....", ".....", ".....", ".....", ".....", ".##..", ".##.."));
        m.put(',', r(".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."));
        m.put(':', r(".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."));
        m.put('-', r(".....", ".....", ".....", "#####", ".....", ".....", "....."));
        m.put('+', r(".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."));
        m.put('/', r("....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."));
        m.put('(', r("..##.", ".#...", "#....", "#....", "#....", ".#...", "..##."));
        m.put(')', r(".##..", "...#.", "....#", "....#", "....#", "...#.", ".##.."));
        m.put('[', r(".###.", ".#...", ".#...", ".#...", ".#...", ".#...", ".###."));
        m.put(']', r(".###.", "...#.", "...#.", "...#.", "...#.", "...#.", ".###."));
        m.put('%', r("##..#", "##.#.", "..#..", ".#...", "#.##.", "#..##", "....."));
        m.put('!', r("..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."));
        m.put('?', r(".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."));
        m.put('>', r(".....", ".#...", "..#..", "...#.", "..#..", ".#...", "....."));
        m.put('<', r(".....", "...#.", "..#..", ".#...", "..#..", "...#.", "....."));
        m.put('=', r(".....", ".....", "#####", ".....", "#####", ".....", "....."));
        m.put('*', r(".....", "#.#.#", ".###.", "#####", ".###.", "#.#.#", "....."));
        m.put('\'', r("..#..", "..#..", ".#...", ".....", ".....", ".....", "....."));
        return m;
    }
}
