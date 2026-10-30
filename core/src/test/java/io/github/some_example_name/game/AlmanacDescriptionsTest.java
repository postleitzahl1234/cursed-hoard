package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;

import org.junit.jupiter.api.Test;

class AlmanacDescriptionsTest {
    private static final int MAX_FLAVOR = 64;
    private static final int MAX_ABILITY = 72;

    @Test
    void everyHeroHasCompactCopy() {
        for (HeroType type : HeroType.values()) assertCompact(AlmanacDescriptions.hero(type), type.name());
    }

    @Test
    void everyTowerHasCompactCopy() {
        for (TowerType type : TowerType.values()) assertCompact(AlmanacDescriptions.tower(type), type.name());
    }

    @Test
    void authoredEffectsHaveUniqueKeysAndCompactCopy() {
        assertEquals(37, AlmanacDescriptions.effectKeys().size());
        assertEquals(37, new HashSet<>(AlmanacDescriptions.effectKeys()).size());
        for (String key : AlmanacDescriptions.effectKeys()) assertCompact(AlmanacDescriptions.effect(key), key);
        for (EnchantType enchant : EnchantType.values()) {
            assertTrue(AlmanacDescriptions.effectKeys().contains(enchant.assetKey));
        }
    }

    @Test
    void unknownAndNullContentUseSafeFallbacks() {
        assertCompact(AlmanacDescriptions.hero(null), "null hero");
        assertCompact(AlmanacDescriptions.tower(null), "null tower");
        assertCompact(AlmanacDescriptions.effect(null), "null effect");
        assertCompact(AlmanacDescriptions.effect("fx_future_mischief"), "unknown effect");
    }

    private static void assertCompact(AlmanacDescriptions.Entry entry, String source) {
        assertNotNull(entry, source);
        assertNotNull(entry.flavor, source);
        assertNotNull(entry.ability, source);
        assertFalse(entry.flavor.trim().isEmpty(), source);
        assertFalse(entry.ability.trim().isEmpty(), source);
        assertTrue(entry.flavor.length() <= MAX_FLAVOR, source + " flavor: " + entry.flavor);
        assertTrue(entry.ability.length() <= MAX_ABILITY, source + " ability: " + entry.ability);
    }
}
