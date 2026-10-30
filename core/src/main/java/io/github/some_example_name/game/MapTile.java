package io.github.some_example_name.game;

public final class MapTile {
    public final TerrainType terrainType;
    public final TileRole role;

    public MapTile(TerrainType terrainType, TileRole role) {
        this.terrainType = terrainType;
        this.role = role;
    }

    public boolean isAirTraversable() {
        return terrainType.airTraversable;
    }
}
