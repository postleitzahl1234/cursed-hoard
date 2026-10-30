package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class GameStringsTest {
    @Test
    void englishLookupSupportsStableKeysAndTemplates() {
        assertEquals("PLAY CAMPAIGN", GameStrings.get("menu.play"));
        assertEquals("3 of 5 gems held", GameStrings.get("result.gems", 3, 5));
        assertEquals("T3  DPS 42  CROWD 84  RNG 150",
                GameStrings.get("tower.stats", 3, 42f, 84f, 150));
        assertEquals("Crowd potential 84 DPS", GameStrings.get("almanac.crowd_dps", 84f));
        assertFalse(GameStrings.skillName(3, 9).isEmpty());
        assertThrows(IllegalArgumentException.class, () -> GameStrings.get("missing.key"));
    }
}
