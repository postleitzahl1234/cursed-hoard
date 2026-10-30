package io.github.some_example_name.game;

import java.util.Arrays;

/** Immutable interpretation of the four ten-skill faction pages. */
public final class SkillTreeBonus {
    private static final int FACTIONS = 4;
    private static final int SKILLS = 10;
    private final int[] ranks;

    private SkillTreeBonus(int[] ranks) { this.ranks = ranks; }

    public static SkillTreeBonus empty() { return new SkillTreeBonus(new int[FACTIONS * SKILLS]); }

    public static SkillTreeBonus fromRanks(int[] source) {
        int[] ranks = new int[FACTIONS * SKILLS];
        if (source != null) for (int i = 0; i < Math.min(source.length, ranks.length); i++)
            ranks[i] = Math.max(0, Math.min(5, source[i]));
        return new SkillTreeBonus(ranks);
    }

    public int rank(int faction, int skill) {
        if (faction < 0 || faction >= FACTIONS || skill < 0 || skill >= SKILLS) return 0;
        return ranks[faction * SKILLS + skill];
    }

    public int[] ranks() { return Arrays.copyOf(ranks, ranks.length); }

    public int startGoldBonus() { return rank(0, 0) * 50; }
    public int treeGoldBonus() { return rank(0, 1) * 5; }
    public float physicalDamageMultiplier() { return 1f + rank(0, 2) * 0.05f; }
    public float championDamageMultiplier() { return 1f + rank(0, 3) * 0.08f; }
    public float buildCostMultiplier() { return 1f - rank(0, 4) * 0.04f; }
    public float generalCritChance() { return rank(0, 5) * 0.03f; }
    public float armorShred() { return rank(0, 6) * 0.04f; }
    public float orcSplashMultiplier() { return 1f + rank(0, 7) * 0.08f; }
    public float treeRegrowthSeconds() { return rank(0, 8) == 0 ? 0f : 50f - rank(0, 8) * 5f; }
    public float tributeDurationBonus() { return rank(0, 9) * 1.5f; }

    public int startManaBonus() { return rank(1, 0) * 25; }
    public float manaPerSecond() { return rank(1, 1) * 0.5f; }
    public int gemDropAdvance() { return rank(1, 2); }
    public float fearDurationMultiplier() { return 1f + rank(1, 3) * 0.10f; }
    public int fearCostReduction() { return rank(1, 4) * 5; }
    public int manaOnKillBonus() { return rank(1, 5); }
    public int extraChainTargets() {
        int rank = rank(1, 6);
        return rank == 0 ? 0 : (rank + 1) / 2;
    }
    public float cryptUpgradeMultiplier() { return 1f - rank(1, 7) * 0.05f; }
    public float frostSlowBonus() { return rank(1, 8) * 0.04f; }
    public float freezeDurationBonus() { return rank(1, 9) * 0.18f; }

    public int killGoldBonus() { return rank(2, 0) * 2; }
    public float gemReturnSpeedMultiplier() { return 1f + rank(2, 1) * 0.12f; }
    public float meteorRadiusMultiplier() { return 1f + rank(2, 2) * 0.10f; }
    public int meteorCostReduction() { return rank(2, 3) * 7; }
    public float burningSlow() { return rank(2, 4) * 0.04f; }
    public float demonUpgradeMultiplier() { return 1f - rank(2, 5) * 0.05f; }
    public float burnSpreadChance() { return rank(2, 6) * 0.12f; }
    public float beamRampPerSecond() { return rank(2, 7) * 0.04f; }
    public float demonAuraRangeMultiplier() { return 1f + rank(2, 8) * 0.08f; }
    public float curseWeakening() { return rank(2, 9) * 0.04f; }

    public int waveGoldBonus() { return rank(3, 0) * 12; }
    public float goblinUpgradeMultiplier() { return 1f - rank(3, 1) * 0.05f; }
    public float drillShredDurationBonus() { return rank(3, 2) * 0.5f; }
    public float droneSpeedMultiplier() { return 1f + rank(3, 3) * 0.10f; }
    public int scrapGoldBonus() { return rank(3, 4); }
    public float bombSplashMultiplier() { return 1f + rank(3, 5) * 0.10f; }
    public float stunRecoveryMultiplier() { return 1f + rank(3, 6) * 0.15f; }
    public float mechanicalCritChance() { return rank(3, 7) * 0.06f; }
    public int gemWardCostReduction() { return rank(3, 8) * 5; }
    public float overchargeSpeedMultiplier() { return 1f + rank(3, 9) * 0.15f; }

    public int buildCost(TowerType type) {
        return Math.max(1, Math.round(type.cost * buildCostMultiplier()));
    }

    public int upgradeCost(TowerType type) {
        float faction = type.faction == Faction.CRYPT ? cryptUpgradeMultiplier()
                : type.faction == Faction.DEMON ? demonUpgradeMultiplier()
                : type.faction == Faction.GOBLIN ? goblinUpgradeMultiplier() : 1f;
        return Math.max(1, Math.round(type.upgradeCost() * faction));
    }

    public int enchantCost(EnchantType type) {
        int reduction = type == EnchantType.FEAR ? fearCostReduction()
                : type == EnchantType.METEOR ? meteorCostReduction()
                : type == EnchantType.GEM_WARD ? gemWardCostReduction() : 0;
        return Math.max(0, type.manaCost - reduction);
    }
}
