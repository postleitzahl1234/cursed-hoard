package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * Balance contract for the campaign difficulty curve: every level has a full wave schedule drawn
 * from its own world's roster, pressure grows within a world, and every fifth level ends on that
 * world's boss. Guards the "same five waves for every level" placeholder from ever returning.
 */
class WavePlanTest {
    private static final int[] TROOP_START = {0, 10, 20, 32, 43, 53};

    @Test
    void everyLevelHasAFullWorldLocalSchedule() {
        for (int w = 0; w < 5; w++) {
            for (int l = 0; l < 5; l++) {
                int n = WavePlan.waveCount(l);
                assertEquals(5 + l, n, "wave count w" + w + " l" + l);
                for (int i = 0; i < n; i++) {
                    Wave wave = WavePlan.wave(w, l, i);
                    assertFalse(wave.entries().isEmpty(), "empty wave w" + w + " l" + l + " #" + i);
                    for (WaveEntry e : wave.entries()) {
                        int o = e.type.ordinal();
                        assertTrue(o >= TROOP_START[w] && o < TROOP_START[w + 1],
                                "w" + w + " l" + l + " #" + i + " uses off-world troop " + e.type);
                        assertTrue(e.count >= 1 && e.interval > 0f);
                    }
                }
            }
        }
    }

    @Test
    void bossClosesEveryFifthLevelAndOnlyThat() {
        for (int w = 0; w < 5; w++) {
            for (int l = 0; l < 5; l++) {
                int n = WavePlan.waveCount(l);
                boolean sawBoss = false;
                for (int i = 0; i < n; i++)
                    for (WaveEntry e : WavePlan.wave(w, l, i).entries())
                        if (e.type.boss) {
                            sawBoss = true;
                            assertEquals(n - 1, i, "boss must close the level, w" + w + " l" + l);
                        }
                assertEquals(l == 4, sawBoss, "boss presence wrong at w" + w + " l" + l);
            }
        }
    }

    @Test
    void pressureGrowsThroughEachWorld() {
        for (int w = 0; w < 5; w++) {
            long prev = -1;
            for (int l = 0; l < 5; l++) {
                long hp = 0;
                for (int i = 0; i < WavePlan.waveCount(l); i++)
                    for (WaveEntry e : WavePlan.wave(w, l, i).entries())
                        hp += (long) e.count * e.type.maxHp;
                assertTrue(hp > prev, "total wave HP must grow: w" + w + " l" + l + " " + hp + " <= " + prev);
                prev = hp;
            }
        }
    }

    @Test
    void startingGoldAndIntermissionTightenOverTheCampaign() {
        assertTrue(WavePlan.startingGold(0, 0) > WavePlan.startingGold(4, 4));
        assertTrue(WavePlan.intermission(0) > WavePlan.intermission(4));
        assertTrue(WavePlan.startingGold(4, 4) >= 400, "late maps must still afford an opening");
    }

    @Test
    void representativeProceduralWavesStayStable() {
        assertWave(WavePlan.wave(0, 0, 0),
                new ExpectedEntry(HeroType.PEASANT, 5, 0.9f));
        assertWave(WavePlan.wave(2, 2, 3),
                new ExpectedEntry(HeroType.DUNE_NOMAD, 17, 0.55f),
                new ExpectedEntry(HeroType.SANDSTORM_SHAMAN, 8, 0.8f),
                new ExpectedEntry(HeroType.DUNE_BEHEMOTH, 3, 1.3f));
        assertWave(WavePlan.wave(4, 4, 8),
                new ExpectedEntry(HeroType.GEM_SHADE, 33, 0.35f),
                new ExpectedEntry(HeroType.SOUL_EATER, 16, 0.6f),
                new ExpectedEntry(HeroType.SOUL_EATER, 5, 1.3f),
                new ExpectedEntry(HeroType.DOOM_KNIGHT, 3, 1.7f),
                new ExpectedEntry(HeroType.BOSS_DEMON_SHADOW_KING, 1, 2.5f));
    }

    @Test
    void difficultyRefactorPreservesEveryPrimaryCountAndInterval() {
        for (int w = 0; w < 5; w++) {
            for (int l = 0; l < 5; l++) {
                for (int i = 0; i < WavePlan.waveCount(l); i++) {
                    WaveEntry primary = WavePlan.wave(w, l, i).entries().get(0);
                    int expectedCount = 5 + l * 2 + i * 2 + (w >= 2 ? w : 0);
                    float expectedInterval = Math.max(0.35f,
                            0.9f - 0.07f * i - 0.05f * l - 0.02f * w);
                    String id = "w" + w + " l" + l + " #" + i;
                    assertEquals(expectedCount, primary.count, "count " + id);
                    assertEquals(Float.floatToIntBits(expectedInterval),
                            Float.floatToIntBits(primary.interval), "interval bits " + id);
                }
            }
        }
    }

    @Test
    void openingGarrisonsStayEasyAndExcludeSpecialUnits() {
        for (int world = 0; world < 5; world++) {
            Set<HeroType> opening = new HashSet<>();
            for (boolean elite : new boolean[]{false, true}) {
                for (int dispatch = 0; dispatch < 70; dispatch++) {
                    HeroType troop = WavePlan.garrison(world, 0, 0, dispatch, elite);
                    opening.add(troop);
                    assertWorldLocal(world, troop);
                    assertFalse(troop.boss, troop + " must not be an opening boss");
                    assertFalse(troop.champion, troop + " must not be an opening champion");
                    assertFalse(troop.mountedCarrier, troop + " must not be an opening prince");
                }
            }
            assertTrue(opening.size() <= 2, "opening roster must remain bounded in world " + world);
        }
    }

    @Test
    void bossesNeverJoinGarrisonsAtAnyProgression() {
        for (int world = 0; world < 5; world++) {
            for (int level = 0; level < 5; level++) {
                for (int wave = 0; wave < WavePlan.waveCount(level); wave++) {
                    for (int dispatch = 0; dispatch < 40; dispatch++) {
                        assertFalse(WavePlan.garrison(world, level, wave, dispatch, true).boss,
                                "boss garrison at w" + world + " l" + level + " wave" + wave);
                    }
                }
            }
        }
    }

    @Test
    void championsAndPrincesRespectLateEliteUnlocks() {
        for (int world = 0; world < 5; world++) {
            for (int dispatch = 0; dispatch < 70; dispatch++) {
                HeroType earlyKeep = WavePlan.garrison(world, 1, 3, dispatch, true);
                assertFalse(earlyKeep.champion || earlyKeep.mountedCarrier,
                        "special unit unlocked before level three: " + earlyKeep);

                HeroType lateHome = WavePlan.garrison(world, 4, 8, dispatch, false);
                assertFalse(lateHome.champion || lateHome.mountedCarrier,
                        "minor homes must only send ordinary troops: " + lateHome);

                HeroType preFinalPrince = WavePlan.garrison(world, 4, 6, dispatch, true);
                assertFalse(preFinalPrince.mountedCarrier,
                        "prince unlocked before the final two waves: " + preFinalPrince);
            }
        }

        assertTrue(WavePlan.garrison(0, 2, 3, 4, true).champion,
                "late keep cadence should admit world-one champion");
        assertTrue(WavePlan.garrison(0, 4, 7, 6, true).mountedCarrier,
                "final-map cadence should admit world-one prince");
    }

    @Test
    void progressionSelectionIsDeterministicVariedAndWorldLocal() {
        for (int world = 0; world < 5; world++) {
            Set<HeroType> seen = new HashSet<>();
            for (int dispatch = 0; dispatch < 24; dispatch++) {
                HeroType first = WavePlan.garrison(world, 3, 5, dispatch, false);
                HeroType repeated = WavePlan.garrison(world, 3, 5, dispatch, false);
                assertEquals(first, repeated);
                assertWorldLocal(world, first);
                seen.add(first);
            }
            assertTrue(seen.size() >= 3, "late ordinary roster should vary in world " + world);
        }
    }

    @Test
    void legacyAndOutOfRangeCallsUseSafeClampedProgression() {
        for (int world = 0; world < 5; world++) {
            assertEquals(WavePlan.garrison(world, 0, 0, 0, false),
                    WavePlan.garrison(world, false));
            assertEquals(WavePlan.garrison(world, 0, 0, 0, true),
                    WavePlan.garrison(world, true));
        }
        assertEquals(WavePlan.garrison(0, 0, 0, 0, false),
                WavePlan.garrison(-50, -20, -30, -40, false));
        assertEquals(WavePlan.garrison(4, 4, 8, 9, true),
                WavePlan.garrison(50, 20, 30, 9, true));
    }

    private static void assertWave(Wave actual, ExpectedEntry... expected) {
        assertEquals(expected.length, actual.entries().size());
        for (int i = 0; i < expected.length; i++) {
            WaveEntry entry = actual.entries().get(i);
            assertEquals(expected[i].type, entry.type, "type at entry " + i);
            assertEquals(expected[i].count, entry.count, "count at entry " + i);
            assertEquals(expected[i].interval, entry.interval, 0.000001f, "interval at entry " + i);
        }
    }

    private static void assertWorldLocal(int world, HeroType troop) {
        int ordinal = troop.ordinal();
        assertTrue(ordinal >= TROOP_START[world] && ordinal < TROOP_START[world + 1],
                "world " + world + " received off-world garrison " + troop);
    }

    private static final class ExpectedEntry {
        final HeroType type;
        final int count;
        final float interval;

        ExpectedEntry(HeroType type, int count, float interval) {
            this.type = type;
            this.count = count;
            this.interval = interval;
        }
    }
}
