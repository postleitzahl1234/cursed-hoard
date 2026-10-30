package io.github.some_example_name.assets;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import java.util.List;

/**
 * Coherent HUD/menu chrome drawn from shanshuihua-inspired {@code ui_*} sprites, with true
 * 9-slice borders and a compact bitmap font so every box and label remains crisp over ink wash.
 * One instance is shared by every screen. The caller owns {@code batch.begin()/end()}.
 */
public final class UiChrome {
    private final PixelArtAtlas atlas;
    private final SpriteBatch batch;
    private final PixelFont font;
    private final Color accent = new Color(UiTheme.GOLD);

    public float mouseX, mouseY;     // logical coords, y-up
    public boolean pressed;          // pointer currently down

    // contrast-tuned palette: xuan-paper text, dim secondary ink, cinnabar for headings
    public static final Color INK = new Color(UiTheme.INK);
    public static final Color INK_DIM = new Color(UiTheme.INK_MUTED);
    public static final Color GOLD = new Color(UiTheme.GOLD);

    public static final int BODY = 2, TITLE = 3, SMALL = 2;

    // shared spacing grid (logical px) so every screen aligns to the same rhythm
    public static final float PAD = 20f;     // content inset from a panel/box border
    public static final float TEXT_PAD_X = 12f;
    public static final float TEXT_PAD_Y = 8f;

    /**
     * The one icon size. Icons are authored at 24×24 (assets/data/icons.js), and the HUD used to
     * draw them at NINE different sizes — 12, 14, 16, 22, 24, 26, 30, 36, 40 — so every icon on
     * screen was a resample. The layout now follows the art: use {@link #ICON} everywhere, and
     * {@link #PIP} for the status markers that ride on a unit. PIP is exactly ICON/2, which is
     * the one reduction that stays crisp on a pixel grid.
     */
    public static final float ICON = 24f;
    public static final float PIP = 12f;
    public static final float GAP = 14f;     // gap between sibling controls
    public static final float ROW = 48f;     // standard list/skill row height
    public static final float LINE = 28f;    // body text line advance

    public UiChrome(PixelArtAtlas atlas, SpriteBatch batch, PixelFont font) {
        this.atlas = atlas;
        this.batch = batch;
        this.font = font;
    }

    public void setPointer(float x, float y, boolean down) {
        this.mouseX = x;
        this.mouseY = y;
        this.pressed = down;
    }

    /** One restrained contextual hue: cinnabar in neutral screens, mineral color in campaign screens. */
    public void setAccent(Color color) {
        accent.set(color == null ? UiTheme.GOLD : color);
    }

    public Color accent() {
        return accent;
    }

    public boolean hovered(float x, float y, float w, float h) {
        return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
    }

    public void panel(float x, float y, float w, float h) {
        shadow("ui_panel", x, y, w, h);
        atlas.drawNine(batch, "ui_panel", x, y, w, h);
        if (atlas.has("ui_panel_gold")) {
            batch.setColor(accent.r, accent.g, accent.b, 0.10f);
            atlas.drawNine(batch, "ui_panel_gold", x, y, w, h);
            batch.setColor(Color.WHITE);
        }
    }

    public void panelGold(float x, float y, float w, float h) {
        String key = atlas.has("ui_panel_gold") ? "ui_panel_gold" : "ui_panel";
        shadow(key, x, y, w, h);
        batch.setColor(accent);
        atlas.drawNine(batch, key, x, y, w, h);
        batch.setColor(Color.WHITE);
    }

    public void tooltip(float x, float y, float w, float h) {
        String key = atlas.has("ui_tooltip") ? "ui_tooltip" : "ui_panel";
        shadow(key, x, y, w, h);
        atlas.drawNine(batch, key, x, y, w, h);
    }

    /** Title banner with centred copy. */
    public void banner(String title, float cx, float topY, float w) {
        float h = 58f;
        String key = atlas.has("ui_banner_plate") ? "ui_banner_plate" : "ui_panel";
        shadow(key, cx - w / 2f, topY - h, w, h);
        atlas.drawNine(batch, key, cx - w / 2f, topY - h, w, h);
        textCenteredInBox(title, cx - w / 2f, topY - h, w, h, accent, TITLE, 1);
    }

    /** An ink-panel button. Returns true while hovered (caller does the click hit-test). */
    public boolean button(float x, float y, float w, float h, String label) {
        boolean hov = hovered(x, y, w, h);
        String key = !atlas.has("ui_button_idle") ? null
                : (hov && pressed) ? "ui_button_press" : hov ? "ui_button_hover" : "ui_button_idle";
        if (key != null) {
            shadow(key, x, y, w, h);
            atlas.drawNine(batch, key, x, y, w, h);
            if (hov) {
                batch.setColor(accent.r, accent.g, accent.b, pressed ? 0.28f : 0.16f);
                atlas.drawNine(batch, key, x, y, w, h);
                batch.setColor(Color.WHITE);
            }
        }
        if (label != null) textCenteredInBox(label, x, y, w, h, hov ? accent : INK, BODY, 1);
        return hov;
    }

    /** Primary action: brighter rim and larger value contrast than ordinary navigation. */
    public boolean buttonPrimary(float x, float y, float w, float h, String label) {
        boolean hov = hovered(x, y, w, h);
        panelGold(x, y, w, h);
        if (hov) {
            batch.setColor(1f, 1f, 1f, pressed ? 0.12f : 0.22f);
            atlas.drawNine(batch, atlas.has("ui_button_hover") ? "ui_button_hover" : "ui_panel", x, y, w, h);
            batch.setColor(Color.WHITE);
        }
        textCenteredInBox(label, x, y, w, h, INK, TITLE, 1);
        return hov;
    }

    private void shadow(String key, float x, float y, float w, float h) {
        batch.setColor(0f, 0f, 0f, 0.58f);
        atlas.drawNine(batch, key, x + 5f, y - 5f, w, h);
        batch.setColor(Color.WHITE);
    }

    /** Small chip button (close / confirm), keyed by {@code ui_chip_*}. */
    public boolean chip(String which, float x, float y, float size) {
        boolean hov = hovered(x, y, size, size);
        String k = "ui_chip_" + which;
        if (atlas.has(k)) atlas.draw(batch, k, x, y, size, size, 0f);
        return hov;
    }

    public void capsule(float x, float y, float w, float h, String iconKey, String value) {
        atlas.drawNine(batch, atlas.has("ui_resource_capsule") ? "ui_resource_capsule" : "ui_panel", x, y, w, h);
        float pad = h * 0.2f;
        float ic = h - 2 * pad;
        if (iconKey != null && atlas.has(iconKey)) atlas.draw(batch, iconKey, x + pad, y + pad, ic, ic, 0f);
        float textX = x + pad + ic + 8f;
        textLeftInBox(value, textX, y, x + w - textX, h, INK, BODY, 1);
    }

    /** Health/mana bar: empty plate underneath, fill clipped by fraction. */
    public void bar(float x, float y, float w, float h, float frac, boolean mana) {
        frac = Math.max(0f, Math.min(1f, frac));
        String empty = mana ? "ui_bar_mana_empty" : "ui_bar_health_empty";
        String drain = mana ? "ui_bar_mana_drain" : "ui_bar_health_drain";
        String fill = mana ? "ui_bar_mana" : "ui_bar_health";
        if (atlas.has(empty)) atlas.draw(batch, empty, x, y, w, h, 0f);
        float drainFrac = Math.min(1f, frac + 0.06f);
        if (drainFrac > 0f && atlas.has(drain)) atlas.draw(batch, drain, x, y, w * drainFrac, h, 0f);
        if (frac > 0f && atlas.has(fill)) atlas.draw(batch, fill, x, y, w * frac, h, 0f);
    }

    /** Upcoming-wave track sprite sized to the nearest authored box count (7/9/11/13/15). */
    public void waveTrack(float x, float y, float w, float h, int waves) {
        int[] boxes = {7, 9, 11, 13, 15};
        int best = 7;
        for (int b : boxes) if (Math.abs(b - waves) <= Math.abs(best - waves)) best = b;
        String k = "ui_wave_track_" + best;
        if (atlas.has(k)) atlas.draw(batch, k, x, y, w, h, 0f);
    }

    public void icon(String key, float x, float y, float size) {
        if (key != null && atlas.has(key)) atlas.draw(batch, key, x, y, size, size, 0f);
    }

    // ── text ─────────────────────────────────────────────────────────────

    /** Left-aligned text at body scale; {@code y} is the top of the text (BitmapFont convention). */
    private void text(String s, float x, float y, Color color) {
        font.drawShadowed(batch, s, x, y, BODY, color);
    }

    private void text(String s, float x, float y, Color color, int scale) {
        font.drawShadowed(batch, s, x, y, scale, color);
    }

    /** Legacy 5-arg form: {@code centered} flips between centred and left-aligned at body scale. */
    private void text(String s, float x, float y, Color color, boolean centered) {
        if (centered) textCentered(s, x, y, color, BODY);
        else font.drawShadowed(batch, s, x, y, BODY, color);
    }

    private void textCentered(String s, float cx, float y, Color color, int scale) {
        font.drawShadowed(batch, s, cx - font.width(s, scale) / 2f, y, scale, color);
    }

    public void textBounded(String s, float x, float y, float maxWidth, Color color,
                            int preferredScale, int minimumScale) {
        int scale = UiTextLayout.fitScale(s, maxWidth, Float.MAX_VALUE, preferredScale, minimumScale);
        if (scale <= 0) return;
        font.drawShadowed(batch, UiTextLayout.ellipsize(s, maxWidth, scale), x, y, scale, color);
    }

    public void textCenteredBounded(String s, float cx, float y, float maxWidth, Color color,
                                    int preferredScale, int minimumScale) {
        int scale = UiTextLayout.fitScale(s, maxWidth, Float.MAX_VALUE, preferredScale, minimumScale);
        if (scale <= 0) return;
        String fitted = UiTextLayout.ellipsize(s, maxWidth, scale);
        font.drawShadowed(batch, fitted,
                cx - UiTextLayout.renderedWidth(fitted, scale) / 2f, y, scale, color);
    }

    /** Draws a centered single-line label inside a rectangle with guaranteed four-sided padding. */
    public void textCenteredInBox(String s, float x, float y, float w, float h, Color color,
                                  int preferredScale, int minimumScale) {
        float innerW = Math.max(0f, w - 2f * TEXT_PAD_X);
        float innerH = Math.max(0f, h - 2f * TEXT_PAD_Y);
        int scale = UiTextLayout.fitScale(s, innerW, innerH, preferredScale, minimumScale);
        if (scale <= 0) return;
        String fitted = UiTextLayout.ellipsize(s, innerW, scale);
        float top = UiTextLayout.centeredTop(y, h, scale);
        float left = UiTextLayout.centeredLeft(x, w, fitted, scale);
        font.drawShadowed(batch, fitted, left, top, scale, color);
    }

    /** Draws a left-aligned single-line label inside a rectangle with guaranteed four-sided padding. */
    public void textLeftInBox(String s, float x, float y, float w, float h, Color color,
                              int preferredScale, int minimumScale) {
        float innerW = Math.max(0f, w - 2f * TEXT_PAD_X);
        float innerH = Math.max(0f, h - 2f * TEXT_PAD_Y);
        int scale = UiTextLayout.fitScale(s, innerW, innerH, preferredScale, minimumScale);
        if (scale <= 0) return;
        String fitted = UiTextLayout.ellipsize(s, innerW, scale);
        float top = UiTextLayout.centeredTop(y, h, scale);
        font.drawShadowed(batch, fitted, x + TEXT_PAD_X, top, scale, color);
    }

    /** Wraps copy inside a rectangle, retaining padding and ellipsizing any omitted final line. */
    public void textWrappedInBox(String s, float x, float y, float w, float h, Color color, int scale) {
        float innerW = Math.max(0f, w - 2f * TEXT_PAD_X);
        float innerH = Math.max(0f, h - 2f * TEXT_PAD_Y);
        int lineAdvance = Math.max((int) UiTextLayout.renderedHeight(scale), (int) LINE);
        int maxLines = Math.max(0, (int) (innerH / lineAdvance));
        List<String> lines = UiTextLayout.wrap(s, innerW, scale, maxLines);
        float top = y + h - TEXT_PAD_Y;
        for (int i = 0; i < lines.size(); i++)
            font.drawShadowed(batch, lines.get(i), x + TEXT_PAD_X, top - i * lineAdvance, scale, color);
    }

    /** Word-wraps into a fixed rectangle and drops excess lines instead of drawing over siblings. */
    public void textWrapped(String s, float x, float topY, float maxWidth, float maxHeight,
                            Color color, int scale) {
        if (s == null || s.isEmpty()) return;
        int maxLines = Math.max(1, (int) (maxHeight / LINE));
        List<String> lines = UiTextLayout.wrap(s, maxWidth, scale, maxLines);
        for (int i = 0; i < lines.size(); i++) text(lines.get(i), x, topY - i * LINE, color, scale);
    }

    /** Number of lines the same wrapping rules will consume, capped for a fixed detail panel. */
    public int wrappedLineCount(String s, float maxWidth, int scale, int maxLines) {
        if (s == null || s.isEmpty()) return 0;
        return UiTextLayout.wrap(s, maxWidth, scale, maxLines).size();
    }

    public float textWidth(String s) {
        return font.width(s, BODY);
    }
}
