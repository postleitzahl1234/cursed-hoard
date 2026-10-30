package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/** The editor's export format must round-trip losslessly so saved maps reload exactly. */
class MapBlueprintTest {
    @Test
    void textRoundTripsAllThreeLayers() {
        MapBlueprint a = new MapBlueprint();
        a.name = "test_map";
        a.fill("tile_sand_base");
        int waterC = MapBlueprint.COLS / 12, waterR = MapBlueprint.ROWS / 5;
        int rotatedC = MapBlueprint.COLS / 4, rotatedR = MapBlueprint.ROWS / 2 - 1;
        int baseRotC = rotatedC + 1;
        int pathC = MapBlueprint.COLS / 8, pathR = MapBlueprint.ROWS / 3 - 1;
        int spawnC = MapBlueprint.COLS - 1, spawnR = MapBlueprint.ROWS - 1;
        int caveC = MapBlueprint.COLS - 2, caveR = MapBlueprint.ROWS - 2;
        int treeC = MapBlueprint.COLS / 5, treeR = MapBlueprint.ROWS / 3;
        int buildingC = MapBlueprint.COLS / 3, buildingR = MapBlueprint.ROWS / 2 + 1;

        a.terrain[waterC][waterR] = "tile_sand_oasis_water";
        a.terrain[rotatedC][rotatedR] = "tile_grass_flowers";
        a.terrainRot[rotatedC][rotatedR] = 2;           // 180°
        a.terrainRot[baseRotC][rotatedR] = 3;           // 270° (terrain unchanged from base)
        a.overlay[pathC][pathR] = MapBlueprint.Overlay.PATH;
        a.overlay[spawnC][spawnR] = MapBlueprint.Overlay.SPAWN;
        a.overlay[caveC][caveR] = MapBlueprint.Overlay.CAVE;
        a.decor[treeC][treeR] = "obstacle_tree_palm";
        a.decor[buildingC][buildingR] = "bld_grass_village";

        MapBlueprint b = MapBlueprint.parse(a.toText());

        assertEquals("test_map", b.name);
        assertEquals("tile_sand_base", b.baseTile);
        for (int c = 0; c < MapBlueprint.COLS; c++)
            for (int r = 0; r < MapBlueprint.ROWS; r++) {
                assertEquals(a.terrain[c][r], b.terrain[c][r], "terrain " + c + "," + r);
                assertEquals(a.terrainRot[c][r], b.terrainRot[c][r], "rot " + c + "," + r);
                assertEquals(a.overlay[c][r], b.overlay[c][r], "overlay " + c + "," + r);
                assertEquals(a.decor[c][r], b.decor[c][r], "decor " + c + "," + r);
            }
    }

    @Test
    void copyIsDeepAndIndependent() {
        MapBlueprint a = new MapBlueprint();
        int c = MapBlueprint.COLS / 2, r = MapBlueprint.ROWS / 2;
        a.terrain[c][r] = "tile_shadow_base";
        MapBlueprint b = a.copy();
        b.terrain[c][r] = "tile_grass_base";
        assertEquals("tile_shadow_base", a.terrain[c][r]);
    }
}
