package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import io.github.some_example_name.assets.SpriteKeys;
import io.github.some_example_name.assets.SpriteSource;
import java.util.Collections;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * Guards the user-flagged invariant: a world only ever fields its OWN biome's hostile buildings
 * (no world-1 castle in a world-3 level), and the minor:keep ratio shifts toward keeps as levels
 * climb while every level keeps at least one of each.
 */
class HostileBuildingsTest {
    private static final String[] BIOME_TOKEN = {"grass", "mountain", "sand", "garden", "shadow"};

    private SpriteKeys spriteKeys() {
        SpriteSource empty = new SpriteSource() {
            public boolean has(String k) { return false; }
            public Set<String> keySet() { return Collections.emptySet(); }
        };
        return new SpriteKeys(empty);
    }

    @Test
    void everyWorldsBuildingsMatchItsOwnBiome() {
        SpriteKeys keys = spriteKeys();
        for (int w = 0; w < 5; w++) {
            String token = BIOME_TOKEN[w];
            String minor = keys.building(HostileBuildings.minor(w));
            String major = keys.building(HostileBuildings.major(w));
            assertTrue(minor.contains(token), "world " + w + " minor " + minor + " not " + token);
            assertTrue(major.contains(token), "world " + w + " major " + major + " not " + token);
        }
    }

    @Test
    void noBuildingTypeIsSharedAcrossWorlds() {
        for (int a = 0; a < 5; a++) {
            for (int b = 0; b < 5; b++) {
                if (a == b) continue;
                assertNotEquals(HostileBuildings.minor(a), HostileBuildings.minor(b));
                assertNotEquals(HostileBuildings.major(a), HostileBuildings.major(b));
                assertNotEquals(HostileBuildings.minor(a), HostileBuildings.major(b));
            }
        }
    }

    @Test
    void ratioShiftsTowardKeepsButKeepsBothEveryLevel() {
        assertEquals(5, HostileBuildings.minorCount(0));
        assertEquals(1, HostileBuildings.majorCount(0));
        assertEquals(1, HostileBuildings.minorCount(4));
        assertEquals(5, HostileBuildings.majorCount(4));
        for (int level = 0; level < 5; level++) {
            assertTrue(HostileBuildings.minorCount(level) >= 1, "minor present at L" + level);
            assertTrue(HostileBuildings.majorCount(level) >= 1, "keep present at L" + level);
            // majors strictly increase, minors strictly decrease
            if (level > 0) {
                assertTrue(HostileBuildings.majorCount(level) > HostileBuildings.majorCount(level - 1));
                assertTrue(HostileBuildings.minorCount(level) <= HostileBuildings.minorCount(level - 1));
            }
        }
    }

    @Test
    void keepsClassifyAsKeepsAndMinorsDoNot() {
        for (int w = 0; w < 5; w++) {
            assertTrue(HostileBuildings.isKeep(HostileBuildings.major(w)), "major " + w);
            assertFalse(HostileBuildings.isKeep(HostileBuildings.minor(w)), "minor " + w);
        }
    }

    @Test
    void capturableBuildingUsesFiveVisibleDamageSteps() {
        Building building = new Building(BuildingType.VILLAGE, 0, 0);
        assertEquals(0, building.damageFrame());
        for (int hit = 1; hit < Building.DESTROY_HITS; hit++) {
            assertFalse(building.captureStep());
            assertTrue(building.active);
            assertEquals(hit, building.damageFrame());
        }
        assertTrue(building.captureStep());
        assertFalse(building.active);
        assertEquals(4, building.damageFrame());
    }
}
