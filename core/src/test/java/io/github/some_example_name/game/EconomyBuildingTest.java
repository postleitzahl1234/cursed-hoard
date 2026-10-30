package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class EconomyBuildingTest {
    @Test
    void authoredMineAndWellPayTheirResourceOnSchedule() {
        EconomyBuilding mine = new EconomyBuilding("bld_gold_mine_t2", 10, 20);
        EconomyBuilding well = new EconomyBuilding("bld_mana_well_t3", 30, 40);
        assertEquals(EconomyBuilding.Kind.GOLD, mine.kind);
        assertEquals(EconomyBuilding.Kind.MANA, well.kind);
        assertEquals(0, mine.update(3.9f));
        assertEquals(mine.payout(), mine.update(0.1f));
        assertEquals(well.payout() * 2, well.update(8f));
    }

    @Test
    void rejectsUnrelatedDecor() {
        assertThrows(IllegalArgumentException.class,
                () -> new EconomyBuilding("obstacle_tree_oak", 0, 0));
    }
}
