package io.github.some_example_name.game;

/**
 * Per-world hostile settlement composition. Each world contributes only its own biome's buildings
 * (a minor home + a major keep), and every level shows at least one keep with the
 * minor:keep ratio shifting toward keeps in later levels (L1 = 5:1 … L5 = 1:5). Pure data so it
 * can be unit-tested without a GL context.
 */
public final class HostileBuildings {
    private HostileBuildings() {}

    /** The minor home building for a world (0 grasslands … 4 shadow), biome-matched. */
    public static BuildingType minor(int worldIndex) {
        switch (worldIndex) {
            case 1: return BuildingType.TAVERN;
            case 2: return BuildingType.PALM_SPRING;
            case 3: return BuildingType.KINGS_POWER_STATION;
            case 4: return BuildingType.SHADOW_POOL;
            default: return BuildingType.VILLAGE;
        }
    }

    /** The major keep for a world, biome-matched. */
    public static BuildingType major(int worldIndex) {
        switch (worldIndex) {
            case 1: return BuildingType.HOLY_CITADEL;
            case 2: return BuildingType.DESERT_STRONGHOLD;
            case 3: return BuildingType.KINGS_LABORATORY;
            case 4: return BuildingType.CURSED_PORTAL;
            default: return BuildingType.CASTLE;
        }
    }

    /** Number of major keeps at this level (1 at L1 → 5 at L5). */
    public static int majorCount(int levelIndex) {
        return 1 + levelIndex;
    }

    /** Number of minor homes at this level (5 at L1 → 1 at L5). */
    public static int minorCount(int levelIndex) {
        return Math.max(1, 5 - levelIndex);
    }

    public static boolean isKeep(BuildingType t) {
        return t == BuildingType.CASTLE || t == BuildingType.HOLY_CITADEL
                || t == BuildingType.DESERT_STRONGHOLD || t == BuildingType.KINGS_LABORATORY
                || t == BuildingType.CURSED_PORTAL;
    }
}
