package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class SkillTreeBonusTest {
    @Test
    void everySkillRankIsRepresentedByTheProfile() {
        SkillTreeBonus base = SkillTreeBonus.empty();
        for (int index = 0; index < 40; index++) {
            int[] ranks = new int[40];
            ranks[index] = 1;
            SkillTreeBonus one = SkillTreeBonus.fromRanks(ranks);
            assertEquals(1, one.rank(index / 10, index % 10));
            assertFalse(java.util.Arrays.equals(base.ranks(), one.ranks()));
        }
    }

    @Test
    void discountsAndStartingResourcesUseTheCorrectFactionPage() {
        int[] ranks = new int[40];
        ranks[0] = 2; ranks[10] = 3; ranks[14] = 2; ranks[23] = 2; ranks[38] = 2;
        SkillTreeBonus bonus = SkillTreeBonus.fromRanks(ranks);
        assertEquals(100, bonus.startGoldBonus());
        assertEquals(75, bonus.startManaBonus());
        assertEquals(EnchantType.FEAR.manaCost - 10, bonus.enchantCost(EnchantType.FEAR));
        assertEquals(EnchantType.METEOR.manaCost - 14, bonus.enchantCost(EnchantType.METEOR));
        assertEquals(EnchantType.GEM_WARD.manaCost - 10, bonus.enchantCost(EnchantType.GEM_WARD));
    }
}
