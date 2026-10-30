package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import com.badlogic.gdx.math.Vector2;
import org.junit.jupiter.api.Test;

/**
 * Covers the 8-way aiming model (D-23) — the facing↔art mapping, the mirror rule, the
 * anti-flicker hysteresis, and the separation of facing from the attack animation.
 *
 * <p>The last one is the point of the rewrite: the previous implementation fed {@code facing}
 * into the sprite's <em>frame index</em>, so a tower could either turn or animate, never both.
 */
class TurretAimingTest {

    private static Turret aimedAt(float degrees) {
        Turret t = new Turret(32f, 72f);
        Vector2 origin = new Vector2(0f, 0f);
        double r = Math.toRadians(degrees);
        // aim twice: hysteresis deliberately refuses to jump on a single ambiguous reading
        Vector2 target = new Vector2((float) Math.cos(r) * 500f, (float) Math.sin(r) * 500f);
        t.aimAt(origin, target);
        t.aimAt(origin, target);
        return t;
    }

    @Test
    void everyCompassDirectionResolvesToAnAuthoredFacing() {
        String[] expectArt = {"e", "ne", "n", "ne", "e", "se", "s", "se"};
        boolean[] expectFlip = {false, false, false, true, true, true, false, false};
        for (int i = 0; i < 8; i++) {
            Turret t = aimedAt(i * 45f);
            assertEquals(i, t.facing, "facing index for " + (i * 45) + "deg");
            assertEquals(expectArt[i], t.art(), "authored art for " + (i * 45) + "deg");
            assertEquals(expectFlip[i], t.flip(), "mirror flag for " + (i * 45) + "deg");
        }
    }

    @Test
    void onlyFiveFacingsAreEverRequestedFromTheAtlas() {
        java.util.Set<String> requested = new java.util.HashSet<>();
        for (int deg = 0; deg < 360; deg += 5) {
            requested.add(aimedAt(deg).art());
        }
        assertEquals(java.util.Set.of("e", "ne", "n", "se", "s"), requested,
                "art must never ask for a facing the artist did not author");
        assertEquals(5, Turret.AUTHORED_FACINGS.length);
    }

    @Test
    void hysteresisStopsTheTurretFlickeringOnASectorBoundary() {
        Turret t = new Turret(32f, 72f);
        Vector2 origin = new Vector2(0f, 0f);
        // a target creeping up to the E/NE boundary must NOT switch...
        for (float deg : new float[] {0f, 10f, 20f, 25f, 28f}) {
            t.aimAt(origin, polar(deg));
            assertEquals(0, t.facing, "should still face E at " + deg + "deg");
        }
        // ...until it is clearly inside the next sector
        t.aimAt(origin, polar(32f));
        assertEquals(1, t.facing, "should commit to NE once clear of the boundary");
        // and coming back it holds NE well past the nominal 22.5deg line
        t.aimAt(origin, polar(20f));
        assertEquals(1, t.facing, "should not snap straight back — that is the flicker");
    }

    private static Vector2 polar(float deg) {
        double r = Math.toRadians(deg);
        return new Vector2((float) Math.cos(r) * 500f, (float) Math.sin(r) * 500f);
    }

    @Test
    void facingAndFireAnimationAreIndependent() {
        Turret t = aimedAt(135f);                     // NW — a mirrored facing
        assertEquals(0, t.frame(), "at rest");
        t.onFire();
        assertEquals(1, t.frame(), "firing frame");
        assertEquals("ne", t.art(), "firing must not disturb the facing");
        assertTrue(t.flip());
        t.update(0.5f);
        assertEquals(0, t.frame(), "animation returns to rest");
        assertEquals("ne", t.art(), "and the facing is still held");
    }

    @Test
    void withoutATargetTheTurretHoldsItsLastFacing() {
        Turret t = aimedAt(180f);
        assertEquals(4, t.facing);
        t.aimAt(new Vector2(0f, 0f), null);
        assertEquals(4, t.facing, "a tower between waves should not snap back to east");
    }

    @Test
    void everyTowerHasAnAimPartIncludingCryptAndDemon() {
        // D-23 exempted Crypt/Demon from a *turret*; it never exempted them from facing their
        // target. What turns differs per faction (barrel / rune-lantern / idol head) but the
        // engine seam is the same for all 48.
        for (TowerType type : TowerType.values()) {
            Tower tower = new Tower(type, 100f, 100f);
            assertNotNull(tower.turret, type + " has no aim part");
        }
    }
}
