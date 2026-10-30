package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ProgressionRewardsTest {
    @Test
    void awardsOneForTheMapPlusOnePerStar() {
        assertEquals(2, ProgressionRewards.skillPointsForStars(1));
        assertEquals(3, ProgressionRewards.skillPointsForStars(2));
        assertEquals(4, ProgressionRewards.skillPointsForStars(3));
    }
}
