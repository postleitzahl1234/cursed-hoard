package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class LevelWavesTest {
    private static final int[] TROOP_START = {0, 10, 20, 32, 43, 53};

    @Test
    void allTwentyFiveTablesParseAndUseOnlyTheirWorldRoster() {
        int covered = 0;
        for (int world = 0; world < LevelMaps.WORLDS; world++) {
            for (int level = 0; level < LevelMaps.LEVELS; level++) {
                WaveTable table = LevelWaves.load(world, level).orElse(null);
                assertNotNull(table, "missing " + LevelWaves.fileName(world, level));
                assertEquals(WavePlan.waveCount(level), table.waveCount());
                assertTrue(table.waveCount() > 0);
                for (int wave = 0; wave < table.waveCount(); wave++) {
                    assertFalse(table.wave(wave).entries().isEmpty());
                    for (WaveEntry entry : table.wave(wave).entries()) {
                        int ordinal = entry.type.ordinal();
                        assertTrue(ordinal >= TROOP_START[world] && ordinal < TROOP_START[world + 1],
                                LevelWaves.fileName(world, level) + " has off-world " + entry.type);
                    }
                }
                covered++;
            }
        }
        assertEquals(25, covered);
    }

    @Test
    void unbalancedTablesRemainIdenticalToTheProceduralFallback() {
        for (int world = 0; world < 5; world++) {
            for (int level = 0; level < 5; level++) {
                if (level == 0 && (world == 2 || world == 3)) continue; // deliberate L1 balance edits
                for (int wave = 0; wave < WavePlan.waveCount(level); wave++) {
                    Wave authored = WavePlan.wave(world, level, wave);
                    Wave fallback = WavePlan.proceduralWave(world, level, wave);
                    assertEquals(fallback.entries().size(), authored.entries().size());
                    for (int i = 0; i < authored.entries().size(); i++) {
                        WaveEntry a = authored.entries().get(i), b = fallback.entries().get(i);
                        assertEquals(b.type, a.type);
                        assertEquals(b.count, a.count);
                        assertEquals(b.interval, a.interval, 0.00001f);
                    }
                }
            }
        }
    }

    @Test
    void optionalScalarTunesCountAndPacingTogether() {
        WaveTable table = WaveTable.parse("version 1\nwaves 1\nwave 1 scalar 1.5\nPEASANT 4 0.9\nend\n");
        WaveEntry entry = table.wave(0).entries().get(0);
        assertEquals(6, entry.count);
        assertEquals(0.6f, entry.interval, 0.00001f);
    }

    @Test
    void introductoryDesertAndGardenAvoidTheOldEliteHpCliff() {
        assertWaveTypes(LevelWaves.load(2, 0).orElseThrow().wave(4),
                HeroType.SANDSTORM_SHAMAN, HeroType.GIANT_VULTURE);
        assertWaveTypes(LevelWaves.load(3, 0).orElseThrow().wave(4),
                HeroType.ROYAL_FALCONER, HeroType.KINGSGUARD);
        assertTrue(rawHp(LevelWaves.load(2, 0).orElseThrow().wave(4)) <= 5_000);
        assertTrue(rawHp(LevelWaves.load(3, 0).orElseThrow().wave(4)) <= 6_000);
    }

    private static int rawHp(Wave wave) {
        int total = 0;
        for (WaveEntry entry : wave.entries()) total += entry.count * entry.type.maxHp;
        return total;
    }

    private static void assertWaveTypes(Wave wave, HeroType... types) {
        assertEquals(types.length, wave.entries().size());
        for (int i = 0; i < types.length; i++) assertEquals(types[i], wave.entries().get(i).type);
    }
}
