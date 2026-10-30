package io.github.some_example_name.assets;

import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.files.FileHandle;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.Pixmap;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.g2d.TextureRegion;
import com.badlogic.gdx.utils.Disposable;
import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import java.util.HashMap;
import java.util.Map;

public final class PixelArtAtlas implements Disposable, SpriteSource {
    public static final class Sprite {
        public final String key;
        public final String anchor;
        public final float fps;
        public final boolean loop;
        public final TextureRegion[] frames;

        Sprite(String key, String anchor, float fps, boolean loop, TextureRegion[] frames) {
            this.key = key;
            this.anchor = anchor;
            this.fps = fps;
            this.loop = loop;
            this.frames = frames;
        }

        public TextureRegion frame(float stateTime) {
            if (frames.length == 0) return null;
            int idx = (int) (stateTime * fps);
            if (loop) {
                idx = idx % frames.length;
            } else {
                idx = Math.min(frames.length - 1, idx);
            }
            return frames[idx];
        }
    }

    private final Map<String, Color> palette = new HashMap<>();
    private final Map<String, Sprite> sprites = new HashMap<>();
    private final Map<String, char[][]> mapGrids = new HashMap<>();   // raw role grids for map_* sprites

    public PixelArtAtlas(String path) {
        FileHandle file = Gdx.files.internal(path);
        JsonValue root = new JsonReader().parse(file);
        JsonValue pal = root.get("palette");
        for (JsonValue entry = pal.child; entry != null; entry = entry.next) {
            palette.put(entry.name, Color.valueOf(entry.asString().substring(1)));
        }
        JsonValue spriteRoot = root.get("sprites");
        for (JsonValue spriteJson = spriteRoot.child; spriteJson != null; spriteJson = spriteJson.next) {
            Sprite sprite = parseSprite(spriteJson.name, spriteJson);
            if (sprite.frames.length > 0) {
                sprites.put(sprite.key, sprite);
            }
        }
    }

    public int size() {
        return sprites.size();
    }

    public boolean has(String key) {
        return sprites.containsKey(key);
    }

    public java.util.Set<String> keySet() {
        return sprites.keySet();
    }

    /** First sprite key starting with {@code prefix}, or null. Deterministic (keys sorted). */
    public String firstWithPrefix(String prefix) {
        String best = null;
        for (String key : sprites.keySet()) {
            if (key.startsWith(prefix) && (best == null || key.compareTo(best) < 0)) {
                best = key;
            }
        }
        return best;
    }

    /**
     * Best sprite key under {@code prefix} by token overlap with {@code wantTokens}, skipping any
     * key containing one of {@code excludeTokens}. Used to bridge enum names to authored sprite keys.
     */
    public String bestMatch(String prefix, String[] wantTokens, String[] excludeTokens) {
        String best = null;
        int bestScore = -1;
        for (String key : sprites.keySet()) {
            if (!key.startsWith(prefix)) continue;
            boolean excluded = false;
            for (String ex : excludeTokens) {
                if (key.contains(ex)) { excluded = true; break; }
            }
            if (excluded) continue;
            int score = 0;
            for (String t : wantTokens) {
                if (t.length() > 0 && key.contains(t)) score++;
            }
            if (score > bestScore || (score == bestScore && best != null && key.compareTo(best) < 0)) {
                bestScore = score;
                best = key;
            }
        }
        return best;
    }

    public Sprite get(String key) {
        return sprites.get(key);
    }

    public void draw(SpriteBatch batch, String key, float x, float y, float width, float height, float stateTime) {
        Sprite sprite = get(key);
        if (sprite == null) return;
        TextureRegion region = sprite.frame(stateTime);
        if (region == null) return;
        batch.draw(region, x, y, width, height);
    }

    public void drawCentered(SpriteBatch batch, String key, float centerX, float centerY, float width, float height, float stateTime) {
        draw(batch, key, centerX - width / 2f, centerY - height / 2f, width, height, stateTime);
    }

    /**
     * Draw only the vertical band {@code [from,to]} of a sprite (0 = bottom, 1 = top) into the
     * matching band of the destination rect. Lets callers split a tree into trunk + canopy and
     * draw all trunks before all canopies, so overlapping treetops never sit behind a trunk.
     */
    public void drawVBand(SpriteBatch batch, String key, float x, float y, float w, float h, float from, float to) {
        Sprite sprite = get(key);
        if (sprite == null) return;
        TextureRegion fr = sprite.frame(0f);
        if (fr == null) return;
        int rw = fr.getRegionWidth(), rh = fr.getRegionHeight();
        int ry0 = Math.round(fr.getRegionY() + rh * (1f - to));     // region rows count from the top
        int rhBand = Math.max(1, Math.round(rh * (to - from)));
        TextureRegion band = new TextureRegion(fr.getTexture(), fr.getRegionX(), ry0, rw, rhBand);
        batch.draw(band, x, y + h * from, w, h * (to - from));
    }

    /** Draw an explicit frame (e.g. one of the 8 turret facings), centred. */
    public void drawFrame(SpriteBatch batch, String key, int frameIndex, float centerX, float centerY,
                          float width, float height) {
        drawFrame(batch, key, frameIndex, false, centerX, centerY, width, height);
    }

    /**
     * Draw one frame, optionally mirrored horizontally.
     *
     * <p>This is what lets D-23's "author five facings, mirror the other three" actually pay off:
     * E/NE/SE are drawn as authored, and W/NW/SW are the same regions flipped. Mirrored regions
     * are built once and cached — flipping the shared region in place would corrupt every other
     * draw of the same sprite in the frame.
     */
    public void drawFrame(SpriteBatch batch, String key, int frameIndex, boolean flipX,
                          float centerX, float centerY, float width, float height) {
        Sprite sprite = get(key);
        if (sprite == null || sprite.frames.length == 0) return;
        int idx = Math.floorMod(frameIndex, sprite.frames.length);
        TextureRegion region = flipX ? mirrored(key, sprite, idx) : sprite.frames[idx];
        batch.draw(region, centerX - width / 2f, centerY - height / 2f, width, height);
    }

    private final Map<String, TextureRegion[]> mirrorCache = new HashMap<>();

    private TextureRegion mirrored(String key, Sprite sprite, int idx) {
        TextureRegion[] set = mirrorCache.get(key);
        if (set == null) {
            set = new TextureRegion[sprite.frames.length];
            for (int i = 0; i < sprite.frames.length; i++) {
                TextureRegion copy = new TextureRegion(sprite.frames[i]);
                copy.flip(true, false);
                set[i] = copy;
            }
            mirrorCache.put(key, set);
        }
        return set[idx];
    }

    /** Draw a sprite rotated clockwise about its centre by {@code rotationDeg} (0/90/180/270…). */
    public void drawRotated(SpriteBatch batch, String key, float x, float y, float width, float height, float rotationDeg) {
        Sprite sprite = get(key);
        if (sprite == null) return;
        TextureRegion region = sprite.frame(0f);
        if (region == null) return;
        batch.draw(region, x, y, width / 2f, height / 2f, width, height, 1f, 1f, rotationDeg);
    }

    /**
     * Draw a sprite as a true 9-slice: the corners keep their authored pixel size (crisp at any box
     * size) while only the edges and centre stretch. Source border is auto-derived (≈⅓ of the
     * smaller side, capped) so it works for any chrome sprite. Falls back to a plain stretch.
     */
    public void drawNine(SpriteBatch batch, String key, float x, float y, float w, float h) {
        Sprite sprite = get(key);
        if (sprite == null) return;
        TextureRegion fr = sprite.frame(0f);
        if (fr == null) return;
        Texture tex = fr.getTexture();
        int rx = fr.getRegionX(), ry = fr.getRegionY();
        int rw = fr.getRegionWidth(), rh = fr.getRegionHeight();
        int bs = Math.max(1, Math.min(Math.min(rw, rh) / 3, 12));     // source border (px)
        float bd = Math.min(bs, Math.min(w, h) / 2f - 1f);            // dest border (1:1, crisp)
        if (bd < 1f) { draw(batch, key, x, y, w, h, 0f); return; }
        int mw = rw - 2 * bs, mh = rh - 2 * bs;                        // source middle
        float dxL = x, dxM = x + bd, dxR = x + w - bd;
        float dyB = y, dyM = y + bd, dyT = y + h - bd;                 // y-up: top row highest
        float dwM = w - 2 * bd, dhM = h - 2 * bd;
        // top row (source top rows → dest top)
        batch.draw(tex, dxL, dyT, bd, bd, rx, ry, bs, bs, false, false);
        batch.draw(tex, dxM, dyT, dwM, bd, rx + bs, ry, mw, bs, false, false);
        batch.draw(tex, dxR, dyT, bd, bd, rx + rw - bs, ry, bs, bs, false, false);
        // middle row
        batch.draw(tex, dxL, dyM, bd, dhM, rx, ry + bs, bs, mh, false, false);
        batch.draw(tex, dxM, dyM, dwM, dhM, rx + bs, ry + bs, mw, mh, false, false);
        batch.draw(tex, dxR, dyM, bd, dhM, rx + rw - bs, ry + bs, bs, mh, false, false);
        // bottom row
        batch.draw(tex, dxL, dyB, bd, bd, rx, ry + rh - bs, bs, bs, false, false);
        batch.draw(tex, dxM, dyB, dwM, bd, rx + bs, ry + rh - bs, mw, bs, false, false);
        batch.draw(tex, dxR, dyB, bd, bd, rx + rw - bs, ry + rh - bs, bs, bs, false, false);
    }

    /** The authored role grid (rows[0] = top) for a map sprite, or null. Used by the map importer. */
    public char[][] mapGrid(String key) {
        return mapGrids.get(key);
    }

    private Sprite parseSprite(String key, JsonValue json) {
        String anchor = json.getString("anchor", "center");
        float fps = json.getFloat("fps", 1f);
        boolean loop = json.getBoolean("loop", true);
        JsonValue framesJson = json.get("frames");
        if (key.startsWith("map_") && framesJson != null && framesJson.child != null) {
            mapGrids.put(key, gridOf(framesJson.child));   // first frame's character grid
        }
        TextureRegion[] frames = new TextureRegion[framesJson == null ? 0 : framesJson.size];
        int i = 0;
        if (framesJson != null) {
            for (JsonValue frameJson = framesJson.child; frameJson != null; frameJson = frameJson.next) {
                try {
                    frames[i] = renderFrame(frameJson, json.get("legend"));
                } catch (Exception e) {
                    System.err.println("Error parsing sprite: " + key + " frame " + i);
                    throw e;
                }
                i++;
            }
        }
        return new Sprite(key, anchor, fps, loop, frames);
    }

    private TextureRegion renderFrame(JsonValue rowsJson, JsonValue legendJson) {
        int height = rowsJson.size;
        int width = 0;
        for (JsonValue row = rowsJson.child; row != null; row = row.next) {
            width = Math.max(width, getRowString(row).length());
        }
        Pixmap pixmap = new Pixmap(Math.max(1, width), Math.max(1, height), Pixmap.Format.RGBA8888);
        pixmap.setBlending(Pixmap.Blending.None);
        pixmap.setColor(0f, 0f, 0f, 0f);
        pixmap.fill();
        int y = 0;
        for (JsonValue row = rowsJson.child; row != null; row = row.next) {
            String line = getRowString(row);
            for (int x = 0; x < line.length(); x++) {
                char ch = line.charAt(x);
                if (ch == '`' || ch == ' ') continue;
                Color color = colorFor(ch, legendJson);
                if (color != null) {
                    pixmap.setColor(color);
                    pixmap.drawPixel(x, y);
                }
            }
            y++;
        }
        Texture texture = new Texture(pixmap);
        texture.setFilter(Texture.TextureFilter.Nearest, Texture.TextureFilter.Nearest);
        pixmap.dispose();
        return new TextureRegion(texture);
    }

    /** Convert a frame's rows (the first frame's JsonValue) into a char grid; rows[0] = top. */
    private char[][] gridOf(JsonValue rowsJson) {
        int h = rowsJson.size;
        char[][] grid = new char[h][];
        int y = 0;
        for (JsonValue row = rowsJson.child; row != null; row = row.next) {
            grid[y++] = getRowString(row).toCharArray();
        }
        return grid;
    }

    private String getRowString(JsonValue row) {
        if (row.isString()) {
            return row.asString();
        }
        if (row.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonValue cell = row.child; cell != null; cell = cell.next) {
                sb.append(cell.asString());
            }
            return sb.toString();
        }
        return "";
    }

    private Color colorFor(char ch, JsonValue legendJson) {
        if (legendJson == null) {
            return palette.get(String.valueOf(ch));
        }
        JsonValue mapped = legendJson.get(String.valueOf(ch));
        if (mapped == null || mapped.isNull()) {
            return null;
        }
        return palette.get(mapped.asString());
    }

    @Override
    public void dispose() {
        for (Sprite sprite : sprites.values()) {
            for (TextureRegion frame : sprite.frames) {
                frame.getTexture().dispose();
            }
        }
        sprites.clear();
    }
}
