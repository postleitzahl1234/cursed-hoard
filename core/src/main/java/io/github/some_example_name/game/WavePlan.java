package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * The campaign's difficulty curve: deterministic per-level wave schedules built from each world's
 * own troop roster (TROOPS.md ordinal blocks). Standard curve — world 1 is a forgiving on-ramp,
 * every later world ramps counts, pacing and champion pressure; the fifth level of every world
 * ends on that world's boss. Pure data (no GL) so balance is unit-testable.
 */
public final class WavePlan {
    private WavePlan() {}

    /** HeroType ordinal blocks per world (W1..W5 + end sentinel), matching TROOPS.md. */
    private static final int[] TROOP_START = {0, 10, 20, 32, 43, 53};

    /** Number of waves in a level: 5 on the first map of a world up to 9 on the boss map. */
    public static int waveCount(int levelIndex) {
        return 5 + clamp(levelIndex, 0, 4);
    }

    /**
     * Shared count-equivalent pressure for one procedural wave. One point adds two enemies to the
     * primary strand and shortens its spawn interval. Worlds three through five retain their
     * existing extra count pressure here; pacing still has its separate smooth per-world ramp.
     * Keeping this as an explicit function gives balance work one deliberate lever without
     * coupling it to roster selection.
     */
    public static float difficultyScalar(int worldIndex, int levelIndex, int waveIndex) {
        int w = clamp(worldIndex, 0, 4);
        int l = clamp(levelIndex, 0, 4);
        int i = clamp(waveIndex, 0, waveCount(l) - 1);
        return l + i + worldCountPressure(w) / 2f;
    }

    /** Build wave {@code waveIndex} (0-based) of a level. */
    public static Wave wave(int worldIndex, int levelIndex, int waveIndex) {
        java.util.Optional<WaveTable> authored = LevelWaves.load(worldIndex, levelIndex);
        if (authored.isPresent() && waveIndex >= 0 && waveIndex < authored.get().waveCount()) {
            return authored.get().wave(waveIndex);
        }
        return proceduralWave(worldIndex, levelIndex, waveIndex);
    }

    /** Formula fallback used when a table is absent, and by the one-time table exporter. */
    public static Wave proceduralWave(int worldIndex, int levelIndex, int waveIndex) {
        int w = clamp(worldIndex, 0, 4), l = clamp(levelIndex, 0, 4);
        int n = waveCount(l), i = clamp(waveIndex, 0, n - 1);
        List<HeroType> basics = new ArrayList<>(), champs = new ArrayList<>();
        HeroType boss = null;
        for (int o = TROOP_START[w]; o < TROOP_START[w + 1]; o++) {
            HeroType t = HeroType.values()[o];
            if (t.boss) boss = t;
            else if (t.champion) champs.add(t);
            else basics.add(t);
        }
        basics.sort(Comparator.comparingInt(t -> t.maxHp));

        float k = n <= 1 ? 1f : i / (float) (n - 1);          // 0..1 ramp within the level
        Wave wv = new Wave();
        int primary = clamp(Math.round(k * (basics.size() - 1) * 0.75f), 0, basics.size() - 1);
        float difficulty = difficultyScalar(w, l, i);
        int worldPressure = worldCountPressure(w);
        // Preserve the established curve while routing both count and pacing through the shared
        // scalar. Pacing uses its wave-pressure portion because level and world have their own
        // established coefficients; the subtraction is exact for the integer/half-point scalar.
        int count = 5 + Math.round(2f * difficulty);
        float wavePressure = difficulty - l - worldPressure / 2f;
        float interval = Math.max(0.35f,
                0.9f - 0.07f * wavePressure - 0.05f * l - 0.02f * w);
        wv.add(basics.get(primary), count, interval);
        if (i >= 1) {                                          // a second, lighter strand
            int secondary = clamp(primary + 1 + (i % 2), 0, basics.size() - 1);
            wv.add(basics.get(secondary), Math.max(2, count / 2), interval + 0.25f);
        }
        if (k >= 0.4f && l >= 1) {                             // heavier mid-roster support strand
            int heavy = clamp(basics.size() - 2 + (i % 2), 0, basics.size() - 1);
            wv.add(basics.get(heavy), 1 + l / 2 + w / 2, 1.3f);
        }
        boolean lastWave = i == n - 1;
        if (!champs.isEmpty() && ((lastWave && l >= 1) || (l >= 2 && i == n - 3))) {
            wv.add(champs.get(i % champs.size()), 1 + (l + w) / 3, 1.7f);   // champion pressure
        }
        if (lastWave && l == 4 && boss != null) {
            wv.add(boss, 1, 2.5f);                             // the world's boss closes L5
        }
        return wv;
    }

    /**
     * Opening-wave fallback retained for callers that do not yet track garrison progression.
     * Keeps are stronger than minor buildings, but both remain inside the safe opening roster.
     */
    public static HeroType garrison(int worldIndex, boolean elite) {
        return garrison(worldIndex, 0, 0, 0, elite);
    }

    /**
     * Select a deterministic hostile-building reinforcement.
     *
     * <p>The roster opens gradually so a settlement cannot inject a prince, champion, or boss
     * into the first fight. Ordinary troops unlock with campaign and in-level progress. Keeps
     * draw from the stronger half of the currently unlocked pool, while homes use the full pool.
     * Every dispatch index rotates the result deterministically, giving multiple buildings varied
     * reinforcements without making balance tests depend on random state.</p>
     *
     * <p>Bosses are campaign set pieces and are never eligible. Champions require an elite keep,
     * level three or later, wave four or later, and occur at most once per five dispatches. Mounted
     * gem carriers (the prince units) are stricter still: final level, final two waves, elite keep,
     * and at most once per seven dispatches.</p>
     *
     * @param worldIndex campaign world, clamped to 0..4
     * @param levelIndex level inside the world, clamped to 0..4
     * @param waveIndex zero-based wave currently in play, clamped to that level's schedule
     * @param dispatchIndex monotonically increasing garrison spawn count; negative values clamp to 0
     * @param elite whether the source is a major keep rather than a minor home
     */
    public static HeroType garrison(int worldIndex, int levelIndex, int waveIndex,
                                    int dispatchIndex, boolean elite) {
        int w = clamp(worldIndex, 0, 4);
        int l = clamp(levelIndex, 0, 4);
        int wave = clamp(waveIndex, 0, waveCount(l) - 1);
        int dispatch = Math.max(0, dispatchIndex);
        List<HeroType> ordinary = new ArrayList<>();
        List<HeroType> champions = new ArrayList<>();
        List<HeroType> carriers = new ArrayList<>();
        for (int o = TROOP_START[w]; o < TROOP_START[w + 1]; o++) {
            HeroType t = HeroType.values()[o];
            if (t.boss) continue;
            if (t.mountedCarrier) carriers.add(t);
            else if (t.champion) champions.add(t);
            else ordinary.add(t);
        }
        Comparator<HeroType> byThreat = Comparator.comparingInt(WavePlan::garrisonThreat)
                .thenComparingInt(Enum::ordinal);
        ordinary.sort(byThreat);
        champions.sort(byThreat);
        carriers.sort(byThreat);

        if (elite && l == 4 && wave >= waveCount(l) - 2 && !carriers.isEmpty()
                && dispatch % 7 == 6) {
            return carriers.get(selectionIndex(w, l, wave, dispatch, carriers.size(), true));
        }
        if (elite && l >= 2 && wave >= 3 && !champions.isEmpty() && dispatch % 5 == 4) {
            return champions.get(selectionIndex(w, l, wave, dispatch, champions.size(), true));
        }

        int progression = l * 2 + wave;
        int unlocked = clamp(2 + progression / 2, 1, ordinary.size());
        int first = elite ? unlocked / 2 : 0;
        int available = unlocked - first;
        int selected = first + selectionIndex(w, l, wave, dispatch, available, elite);
        return ordinary.get(selected);
    }

    /** Seconds between waves (the intermission countdown before the next wave auto-starts). */
    public static float intermission(int levelIndex) {
        return 14f - clamp(levelIndex, 0, 4);                  // later maps give less breathing room
    }

    /** Starting gold: eight roots on the on-ramp and seven on the campaign finale. */
    public static int startingGold(int worldIndex, int levelIndex) {
        int w = clamp(worldIndex, 0, 4), l = clamp(levelIndex, 0, 4);
        return 560 - w * 15 - l * 10;
    }

    private static int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private static int worldCountPressure(int worldIndex) {
        return worldIndex >= 2 ? worldIndex : 0;
    }

    private static int garrisonThreat(HeroType type) {
        return type.maxHp + Math.round(type.speed * 2f);
    }

    private static int selectionIndex(int world, int level, int wave, int dispatch,
                                      int size, boolean elite) {
        int mixed = dispatch * 31 + wave * 17 + level * 11 + world * 7 + (elite ? 3 : 0);
        return Math.floorMod(mixed, size);
    }
}
