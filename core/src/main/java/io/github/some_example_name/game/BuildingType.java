package io.github.some_example_name.game;

public enum BuildingType {
    VILLAGE(true, false),
    CASTLE(true, false),
    TAVERN(true, false),
    HOLY_CITADEL(true, false),
    PALM_SPRING(true, false),
    DESERT_STRONGHOLD(true, false),
    KINGS_LABORATORY(true, false),
    KINGS_POWER_STATION(true, true),
    SHADOW_POOL(true, false),
    CURSED_PORTAL(false, false),
    GEM_CAVE(false, false);

    public final boolean capturable;
    public final boolean enemyBuffStructure;

    BuildingType(boolean capturable, boolean enemyBuffStructure) {
        this.capturable = capturable;
        this.enemyBuffStructure = enemyBuffStructure;
    }
}
