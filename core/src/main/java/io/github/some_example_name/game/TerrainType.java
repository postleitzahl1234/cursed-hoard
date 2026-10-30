package io.github.some_example_name.game;

public enum TerrainType {
    GRASS_BASE(false),
    GRASS_PATH(false),
    GRASS_OAK(false),
    MOUNTAIN_BASE(false),
    MOUNTAIN_PATH(false),
    MOUNTAIN_PINE(false),
    FROZEN_RIVER(true),
    SAND_BASE(false),
    SAND_PATH(false),
    OASIS_WATER(true),
    GARDEN_BASE(false),
    GARDEN_PATH(false),
    GARDEN_CANAL(true),
    SHADOW_BASE(false),
    SHADOW_PATH(false),
    CURSED_WATERWAY(true);

    public final boolean airTraversable;

    TerrainType(boolean airTraversable) {
        this.airTraversable = airTraversable;
    }
}
