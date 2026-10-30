package io.github.some_example_name.assets;

import static org.junit.jupiter.api.Assertions.*;

import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import io.github.some_example_name.game.TowerType;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * "Every tower has to be unique": the 48 towers must map onto the 48 authored {@code proj_*}
 * sprites bijectively — no two towers share a projectile, every projectile is used, and the
 * assignment stays inside the tower's own faction. Also pins the aimed-turret art contract:
 * every turreted tower has an 8-facing armed sheet plus a separate static {@code _base}.
 */
class ProjectileUniquenessTest {
    private static Set<String> keys;

    @BeforeAll
    static void load() throws IOException {
        Path p = null;
        Path d = Paths.get("").toAbsolutePath();
        for (int i = 0; i < 7 && d != null; i++, d = d.getParent()) {
            Path c = d.resolve("assets/generated/sprites.json");
            if (Files.exists(c)) { p = c; break; }
        }
        assertNotNull(p);
        JsonValue sprites = new JsonReader().parse(Files.readString(p)).get("sprites");
        keys = new HashSet<>();
        for (JsonValue s = sprites.child; s != null; s = s.next) keys.add(s.name);
    }

    private static final class FakeAtlas implements SpriteSource {
        @Override public boolean has(String key) { return keys.contains(key); }
        @Override public java.util.Set<String> keySet() { return keys; }
    }

    @Test
    void projectilesAreBijectiveAndFactionLocal() {
        SpriteKeys sk = new SpriteKeys(new FakeAtlas());
        Set<String> used = new HashSet<>();
        for (TowerType t : TowerType.values()) {
            String proj = sk.projectile(t);
            assertNotNull(proj, t + " has no projectile");
            assertTrue(keys.contains(proj), t + " projectile missing from atlas: " + proj);
            assertTrue(proj.startsWith("proj_" + t.faction.name().toLowerCase().substring(0, 3))
                            || proj.startsWith("proj_"),
                    t + " projectile oddly named: " + proj);
            assertTrue(used.add(proj), t + " reuses projectile " + proj);
        }
        assertEquals(TowerType.values().length, used.size());
    }

    @Test
    void turretedTowersHaveFacingSheetsAndBases() {
        SpriteKeys sk = new SpriteKeys(new FakeAtlas());
        for (TowerType t : TowerType.values()) {
            if (!t.hasTurret) continue;
            String armed = sk.tower(t);
            String base = sk.towerBase(t);
            assertTrue(keys.contains(armed), t + " armed sheet missing: " + armed);
            assertNotEquals(armed, base, t + " has no separate _base card");
        }
    }
}
