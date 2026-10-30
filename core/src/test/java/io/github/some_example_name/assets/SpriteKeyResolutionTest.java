package io.github.some_example_name.assets;

import static org.junit.jupiter.api.Assertions.*;

import com.badlogic.gdx.utils.JsonReader;
import com.badlogic.gdx.utils.JsonValue;
import io.github.some_example_name.game.BuildingType;
import io.github.some_example_name.game.GemType;
import io.github.some_example_name.game.HeroType;
import io.github.some_example_name.game.TowerType;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Verifies the enum→atlas key bridge against the *real* delivered sprite set, headlessly: the
 * 577-key list is parsed straight from assets/generated/sprites.json (no GL), wrapped in a fake
 * {@link SpriteSource}, and every resolver must land on a key that actually exists.
 */
class SpriteKeyResolutionTest {
    private static Set<String> KEYS;
    private static SpriteKeys keys;

    @BeforeAll
    static void load() throws IOException {
        Path p = findUp("assets/generated/sprites.json");
        assertNotNull(p, "sprites.json must be generated before tests");
        JsonValue root = new JsonReader().parse(Files.readString(p));
        KEYS = new HashSet<>();
        for (JsonValue s = root.get("sprites").child; s != null; s = s.next) KEYS.add(s.name);
        assertTrue(KEYS.size() >= 500, "expected the full delivered atlas, got " + KEYS.size());
        SpriteSource src = new SpriteSource() {
            public boolean has(String k) { return KEYS.contains(k); }
            public Set<String> keySet() { return KEYS; }
        };
        keys = new SpriteKeys(src);
    }

    private static Path findUp(String rel) {
        Path d = Paths.get("").toAbsolutePath();
        for (int i = 0; i < 7 && d != null; i++, d = d.getParent()) {
            Path c = d.resolve(rel);
            if (Files.exists(c)) return c;
        }
        return null;
    }

    @Test
    void everyTowerResolvesToARealNonBaseSprite() {
        for (TowerType t : TowerType.values()) {
            String k = keys.tower(t);
            assertTrue(KEYS.contains(k), t + " → missing " + k);
            assertFalse(k.endsWith("_base"), t + " resolved to a bare structure card");
        }
    }

    @Test
    void projectilesAreBijectiveAcrossAll48Towers() {
        Set<String> used = new HashSet<>();
        for (TowerType t : TowerType.values()) {
            String k = keys.projectile(t);
            assertTrue(KEYS.contains(k), t + " → missing projectile " + k);
            assertTrue(used.add(k), "duplicate projectile assignment: " + k);
        }
        assertEquals(TowerType.values().length, used.size());
    }

    @Test
    void everyTroopResolvesIncludingBossAliases() {
        for (HeroType h : HeroType.values()) {
            assertTrue(KEYS.contains(keys.troop(h, "idle")), h + " → missing troop sprite");
            assertFalse(keys.troopStates(h).isEmpty(), h + " has no animation states");
        }
        assertEquals("troop_king_idle", keys.troop(HeroType.BOSS_THE_KING, "idle"));
        assertEquals("troop_shadow_king_idle", keys.troop(HeroType.BOSS_DEMON_SHADOW_KING, "idle"));
        assertEquals("troop_general_idle", keys.troop(HeroType.BOSS_GENERAL, "idle"));
    }

    @Test
    void all25MapsAndNodesResolve() {
        for (int w = 0; w < 5; w++) {
            for (int l = 0; l < 5; l++) {
                assertTrue(KEYS.contains(keys.map(w, l)), "map " + w + "/" + l);
                assertTrue(KEYS.contains(keys.node(w, l)), "node " + w + "/" + l);
            }
        }
    }

    @Test
    void gemsBuildingsTowerBasesResolve() {
        for (GemType g : GemType.values()) {
            assertTrue(KEYS.contains(keys.gem(g, false)), "gem idle " + g);
            assertTrue(KEYS.contains(keys.gem(g, true)), "gem carried " + g);
            assertTrue(KEYS.contains(keys.gemPickup(g)), "gem pickup " + g);
        }
        for (BuildingType b : BuildingType.values()) {
            assertTrue(KEYS.contains(keys.building(b)), "building " + b);
        }
        // turret towers expose a bare structure card
        assertTrue(KEYS.contains(keys.towerBase(TowerType.ORC_WATCHPOST)));
        assertTrue(keys.towerBase(TowerType.ORC_WATCHPOST).endsWith("_base"));
    }

    @Test
    void droneTowersExposeFlyingUnitSprites() {
        TowerType[] droneTypes = {TowerType.DRONE_BAY, TowerType.DRONE_SWARM,
                TowerType.DRONE_FOUNDRY, TowerType.SKY_CARRIER,
                TowerType.BOMBER_DRONE, TowerType.CARPET_BOMBER};
        java.util.Set<String> flying = new java.util.HashSet<>();
        java.util.Set<String> attacking = new java.util.HashSet<>();
        for (TowerType type : droneTypes) {
            String fly = keys.droneUnit(type, false);
            String atk = keys.droneUnit(type, true);
            assertTrue(KEYS.contains(fly), "drone unit " + fly);
            assertTrue(KEYS.contains(atk), "drone attack " + atk);
            assertTrue(flying.add(fly), "shared flight sprite for " + type);
            assertTrue(attacking.add(atk), "shared attack sprite for " + type);
            assertNotEquals(fly, atk, "attack frame must differ for " + type);
        }
    }
}
