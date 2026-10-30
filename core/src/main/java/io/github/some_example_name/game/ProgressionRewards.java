package io.github.some_example_name.game;

/** Campaign reward rules kept independent from rendering and Preferences. */
public final class ProgressionRewards {
    private ProgressionRewards() {}

    /** D-14: one point for clearing the map, plus one point for each earned star. */
    public static int skillPointsForStars(int stars) {
        return 1 + Math.max(0, Math.min(3, stars));
    }
}
