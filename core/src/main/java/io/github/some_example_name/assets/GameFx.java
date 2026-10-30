package io.github.some_example_name.assets;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.math.Vector2;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Purely cosmetic transient visuals layered over the playfield: travelling tower projectiles
 * ({@code proj_*}), impact + death particles ({@code particle_*}), status/ability/enchant bursts
 * ({@code fx_*}/{@code enchant_*}). Lives in the render layer so the headless sim/tests stay
 * untouched; the {@code CursedHoardGame} observer feeds it on tower-fire / death / cast events.
 * All coordinates are world-space; the renderer supplies the world→screen transform.
 */
public final class GameFx {
    /*
     * A restrained shanshui palette.  SpriteBatch tinting lets the authored silhouettes remain
     * readable while pulling transient effects away from the uniform, luminous arcade look.
     * The colours are traditional-painting cues rather than literal material simulations:
     * lampblack, indigo/azurite, malachite, cinnabar and weathered gold.
     */
    private static final Color LAMPBLACK = new Color(0.27f, 0.28f, 0.25f, 1f);
    private static final Color AZURITE = new Color(0.43f, 0.59f, 0.62f, 1f);
    private static final Color MALACHITE = new Color(0.49f, 0.63f, 0.47f, 1f);
    private static final Color CINNABAR = new Color(0.73f, 0.33f, 0.24f, 1f);
    private static final Color OLD_GOLD = new Color(0.72f, 0.61f, 0.36f, 1f);
    private static final Color PAPER_WASH = new Color(0.76f, 0.76f, 0.68f, 1f);

    private static final class Visual {
        String key;
        String impactKey;          // spawned when a projectile arrives (null for bursts)
        float x, y, tx, ty;        // current + target (world space)
        float age, life;
        float size;
        boolean projectile;
        float anim;                // animation clock seed
        float arc;                 // parabolic peak height (mortar lobs), 0 = straight
        float impactFrac = 1f;     // fraction of flight where the impact lands (piercing < 1)
        float impactX, impactY;
        boolean impacted;
        float brushSeed;          // stable per-mark irregularity; avoids flickering between frames
    }

    public interface Projector {
        Vector2 toScreen(float worldX, float worldY);
    }

    private final List<Visual> visuals = new ArrayList<>();
    private final Vector2 tmp = new Vector2();

    public void projectile(String key, float fromX, float fromY, float toX, float toY,
                           float size, String impactKey) {
        if (key == null) return;
        Visual v = new Visual();
        v.key = key;
        v.impactKey = impactKey;
        v.x = fromX; v.y = fromY; v.tx = toX; v.ty = toY;
        v.impactX = toX; v.impactY = toY;
        v.size = size;
        v.brushSeed = brushSeed(key, fromX, fromY, toX, toY);
        v.projectile = true;
        v.life = Math.max(0.12f, fromDist(fromX, fromY, toX, toY) / 520f);
        visuals.add(v);
    }

    /** A slow parabolic mortar shell arcing to the strike point. */
    public void lob(String key, float fromX, float fromY, float toX, float toY,
                    float size, String impactKey) {
        if (key == null) return;
        Visual v = new Visual();
        v.key = key;
        v.impactKey = impactKey;
        v.x = fromX; v.y = fromY; v.tx = toX; v.ty = toY;
        v.impactX = toX; v.impactY = toY;
        v.size = size;
        v.brushSeed = brushSeed(key, fromX, fromY, toX, toY);
        v.projectile = true;
        float d = fromDist(fromX, fromY, toX, toY);
        v.life = Math.max(0.45f, d / 240f);            // heavy shells travel slowly
        v.arc = 40f + d * 0.35f;                       // high parabolic curve
        visuals.add(v);
    }

    /** A piercing bolt that strikes the target mid-flight and glides on for a while. */
    public void pierce(String key, float fromX, float fromY, float toX, float toY,
                       float overshoot, float size, String impactKey) {
        if (key == null) return;
        Visual v = new Visual();
        v.key = key;
        v.impactKey = impactKey;
        float d = Math.max(1f, fromDist(fromX, fromY, toX, toY));
        float ex = toX + (toX - fromX) / d * overshoot;
        float ey = toY + (toY - fromY) / d * overshoot;
        v.x = fromX; v.y = fromY; v.tx = ex; v.ty = ey;
        v.impactX = toX; v.impactY = toY;
        v.impactFrac = d / (d + overshoot);
        v.size = size;
        v.brushSeed = brushSeed(key, fromX, fromY, toX, toY);
        v.projectile = true;
        v.life = Math.max(0.2f, (d + overshoot) / 480f);
        visuals.add(v);
    }

    public void burst(String key, float x, float y, float size, float life) {
        if (key == null) return;
        Visual v = new Visual();
        v.key = key;
        v.x = x; v.y = y;
        v.size = size;
        v.life = life;
        v.anim = (float) Math.random() * 0.3f;
        v.brushSeed = brushSeed(key, x, y, size, life);
        visuals.add(v);
    }

    private float fromDist(float ax, float ay, float bx, float by) {
        float dx = bx - ax, dy = by - ay;
        return (float) Math.sqrt(dx * dx + dy * dy);
    }

    private float brushSeed(String key, float a, float b, float c, float d) {
        int h = key.hashCode();
        h = 31 * h + Float.floatToIntBits(a);
        h = 31 * h + Float.floatToIntBits(b);
        h = 31 * h + Float.floatToIntBits(c);
        h = 31 * h + Float.floatToIntBits(d);
        return (h & 0xffff) / 65535f;
    }

    public void update(float dt) {
        for (int i = visuals.size() - 1; i >= 0; i--) {
            Visual v = visuals.get(i);
            v.age += dt;
            if (v.projectile && !v.impacted && v.impactKey != null
                    && v.age >= v.life * v.impactFrac) {
                v.impacted = true;
                burst(v.impactKey, v.impactX, v.impactY, v.size * 1.4f, 0.35f);
            }
            if (v.age >= v.life) {
                visuals.remove(i);
            }
        }
    }

    public void render(SpriteBatch batch, PixelArtAtlas atlas, Projector proj) {
        Color previous = new Color(batch.getColor());
        for (Visual v : visuals) {
            float px, py;
            if (v.projectile) {
                float t = Math.min(1f, v.age / v.life);
                px = v.x + (v.tx - v.x) * t;
                py = v.y + (v.ty - v.y) * t + (float) Math.sin(Math.PI * t) * v.arc;
            } else {
                px = v.x;
                py = v.y;
            }
            Vector2 s = proj.toScreen(px, py);
            float progress = Math.min(1f, v.age / Math.max(0.001f, v.life));
            if (v.projectile) {
                drawProjectile(batch, atlas, proj, v, s.x, s.y, progress);
            } else {
                drawBurst(batch, atlas, v, s.x, s.y, progress);
            }
        }
        batch.setColor(previous);
    }

    /** Layer a broken, translucent ink trace behind the still-crisp projectile head. */
    private void drawProjectile(SpriteBatch batch, PixelArtAtlas atlas, Projector proj, Visual v,
                                float sx, float sy, float progress) {
        Color pigment = pigmentFor(v.key);
        float fade = edgeFade(progress);
        float t0 = Math.max(0f, progress - 0.055f - v.brushSeed * 0.018f);
        float t1 = Math.max(0f, progress - 0.11f - v.brushSeed * 0.025f);
        Vector2 wash0 = projectileScreenPosition(proj, v, t0);
        float wash0x = wash0.x;
        float wash0y = wash0.y;
        Vector2 wash1 = projectileScreenPosition(proj, v, t1);

        // Unequal marks and small cross-grain offsets suggest a loaded brush losing moisture.
        setTint(batch, LAMPBLACK, 0.10f * fade);
        atlas.drawCentered(batch, v.key, wash1.x - 1.2f + v.brushSeed * 2.4f, wash1.y,
                v.size * 0.58f, v.size * 0.38f, v.anim + v.age);
        setTint(batch, pigment, 0.28f * fade);
        atlas.drawCentered(batch, v.key, wash0x, wash0y + (v.brushSeed - 0.5f) * 2f,
                v.size * 0.78f, v.size * 0.62f, v.anim + v.age);
        setTint(batch, pigment, 0.96f * fade);
        atlas.drawCentered(batch, v.key, sx, sy, v.size * 1.02f, v.size * 0.96f,
                v.anim + v.age);
    }

    /** Spread an uneven under-wash beneath the authored burst instead of a perfect digital stamp. */
    private void drawBurst(SpriteBatch batch, PixelArtAtlas atlas, Visual v,
                           float sx, float sy, float progress) {
        Color pigment = pigmentFor(v.key);
        float fade = edgeFade(progress);
        float open = 0.88f + progress * 0.24f;
        float grain = v.brushSeed - 0.5f;

        setTint(batch, LAMPBLACK, 0.11f * fade * (1f - progress * 0.4f));
        atlas.drawCentered(batch, v.key, sx + grain * 5f, sy - 1.5f,
                v.size * (open + 0.22f), v.size * (open * 0.68f), v.anim + v.age * 0.72f);
        setTint(batch, pigment, 0.30f * fade);
        atlas.drawCentered(batch, v.key, sx - grain * 3f, sy + grain * 2f,
                v.size * (open * 0.84f), v.size * (open * 1.07f), v.anim + v.age * 0.9f);
        setTint(batch, pigment, 0.91f * fade);
        atlas.drawCentered(batch, v.key, sx, sy, v.size * open, v.size * open,
                v.anim + v.age);
    }

    private Vector2 projectileScreenPosition(Projector proj, Visual v, float t) {
        float x = v.x + (v.tx - v.x) * t;
        float y = v.y + (v.ty - v.y) * t + (float) Math.sin(Math.PI * t) * v.arc;
        return proj.toScreen(x, y);
    }

    /** Fast arrival, gently absorbed trailing edge: readable action with ink-on-paper decay. */
    private float edgeFade(float progress) {
        if (progress < 0.08f) return progress / 0.08f;
        if (progress > 0.72f) return Math.max(0f, (1f - progress) / 0.28f);
        return 1f;
    }

    private Color pigmentFor(String key) {
        String k = key.toLowerCase(Locale.ROOT);
        if (k.contains("fire") || k.contains("burn") || k.contains("blood")
                || k.contains("meteor") || k.contains("explosion") || k.contains("ember")
                || k.contains("flame") || k.contains("lava") || k.contains("nova")
                || k.contains("doomray")) return CINNABAR;
        if (k.contains("freeze") || k.contains("frost") || k.contains("steam")
                || k.contains("shield") || k.contains("reflect")) return AZURITE;
        if (k.contains("heal") || k.contains("support") || k.contains("rally")
                || k.contains("resurrect") || k.contains("cleanse")) return MALACHITE;
        if (k.contains("gold") || k.contains("gem") || k.contains("spark")
                || k.contains("lightning") || k.contains("banner")) return OLD_GOLD;
        if (k.contains("smoke") || k.contains("sand") || k.contains("arrow")
                || k.contains("bone")) return PAPER_WASH;
        return LAMPBLACK;
    }

    private void setTint(SpriteBatch batch, Color color, float alpha) {
        batch.setColor(color.r, color.g, color.b, alpha);
    }

    public void clear() {
        visuals.clear();
    }

    public int size() {
        return visuals.size();
    }
}
