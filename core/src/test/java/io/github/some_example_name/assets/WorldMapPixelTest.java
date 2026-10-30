package io.github.some_example_name.assets;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/** The GL-free region hit-test that routes overworld-map clicks to the correct world. */
class WorldMapPixelTest {
    @Test
    void backdropPixelsAreNotRegions() {
        assertFalse(WorldMap.isRegionPixel(0x00000000), "fully transparent");
        assertFalse(WorldMap.isRegionPixel(0xFFFFFFFF), "opaque white matte");
        assertFalse(WorldMap.isRegionPixel(0x3A5C2E10), "too faint (alpha 16)");
        assertFalse(WorldMap.isRegionPixel(0xF2F2F2FF), "near-white opaque");
    }

    @Test
    void opaqueBiomePixelsAreRegions() {
        assertTrue(WorldMap.isRegionPixel(0x3A5C2EFF), "opaque green");
        assertTrue(WorldMap.isRegionPixel(0x884422C0), "opaque brown, alpha 192");
        assertTrue(WorldMap.isRegionPixel(0x5C2E8BFF), "opaque shadow purple");
    }
}
