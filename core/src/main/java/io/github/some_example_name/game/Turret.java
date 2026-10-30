package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;

/**
 * The part of a tower that turns to face its target (D-23, extended to all four factions).
 *
 * <p><b>What this replaces.</b> The previous implementation exposed only an {@code int facing}
 * and the renderer fed it straight into {@code PixelArtAtlas.drawFrame} as a <em>frame index</em>
 * — i.e. the sprite's frame array doubled as the facing table. That made facing and the attack
 * animation mutually exclusive, which quietly broke D-06 ("every tower tier ships its own attack
 * animation"), and it left no way to honour D-23's "author 5 facings and mirror the other three".
 *
 * <p><b>The model now.</b> Facing is a direction, not a frame. Art is authored for five facings —
 * E, NE, N, SE, S — under the keys {@code <tower>_aim_<facing>}, each carrying its own animation
 * frames. The remaining three (W, NW, SW) are those same sprites drawn mirrored, so eight
 * directions cost five sprite sets.
 *
 * <p><b>Which part turns</b> is a faction decision, not an engine one — the engine just asks for
 * {@code _aim_<facing>} and draws whatever the art supplies. Orc and Goblin gun towers put a whole
 * turret there; Crypt hangs a rune-lantern that swings toward the target while the spire stays
 * put; Demon turns the shrine idol's head and leans its brazier plume downrange. Aura towers have
 * no target and simply ship no aim sprites.
 */
public final class Turret {
    /** The five facings art is authored for. W, NW and SW are these, mirrored (D-23). */
    public static final String[] AUTHORED_FACINGS = {"e", "ne", "n", "se", "s"};

    /** Authored facing art per 8-way index. Index 0 = E, counting counter-clockwise. */
    private static final String[] ART = {"e", "ne", "n", "ne", "e", "se", "s", "se"};
    /** Whether that index is drawn mirrored horizontally. */
    private static final boolean[] FLIP = {false, false, false, true, true, true, false, false};

    /**
     * Extra degrees a target must travel past a sector boundary before the turret commits to the
     * next facing. Without it, an enemy walking exactly along a 22.5° boundary makes the turret
     * flicker between two sprites every frame, which is far more distracting than a facing that
     * lags by a few degrees.
     */
    private static final float HYSTERESIS_DEG = 7f;

    public final Vector2 pivot = new Vector2();
    /** 0 = E, 1 = NE, 2 = N, 3 = NW, 4 = W, 5 = SW, 6 = S, 7 = SE. */
    public int facing;
    public float aimAngleDeg;
    /** Counts down while the fire animation plays; drives the aim sprite's frame. */
    public float fireAnim;

    public Turret(float pivotX, float pivotY) {
        pivot.set(pivotX, pivotY);
    }

    public void aimAt(Vector2 origin, Vector2 target) {
        if (target == null) {
            return;                                   // no target: hold the last facing
        }
        aimAngleDeg = target.cpy().sub(origin).angleDeg();
        int want = Math.round(aimAngleDeg / 45f) & 7;
        if (want == facing) {
            return;
        }
        // Only commit once the target is clearly inside the new sector (see HYSTERESIS_DEG).
        float centre = facing * 45f;
        float delta = Math.abs(((aimAngleDeg - centre + 540f) % 360f) - 180f);
        if (delta > 22.5f + HYSTERESIS_DEG) {
            facing = want;
        }
    }

    /** Advance the fire animation clock. */
    public void update(float dt) {
        if (fireAnim > 0f) {
            fireAnim = Math.max(0f, fireAnim - dt);
        }
    }

    /** Called when the tower actually shoots, so the aim part plays its recoil/flash frame. */
    public void onFire() {
        fireAnim = 0.16f;
    }

    /** The authored facing suffix for the current direction: one of e, ne, n, se, s. */
    public String art() {
        return ART[facing & 7];
    }

    /** True when the authored sprite must be mirrored horizontally to give this direction. */
    public boolean flip() {
        return FLIP[facing & 7];
    }

    /** Frame index into the aim sprite: 0 = at rest, 1 = firing. */
    public int frame() {
        return fireAnim > 0f ? 1 : 0;
    }
}
