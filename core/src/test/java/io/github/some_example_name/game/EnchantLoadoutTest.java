package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class EnchantLoadoutTest {
    @Test
    void exposesExactlyTwoEquippedEnchantsAndCanSwapThem() {
        EnchantLoadout loadout = new EnchantLoadout();
        assertEquals(EnchantLoadout.SLOT_COUNT, loadout.equipped().size());

        EnchantType first = loadout.get(0);
        EnchantType second = loadout.get(1);
        loadout.equip(0, second);

        assertEquals(second, loadout.get(0));
        assertEquals(first, loadout.get(1));
        assertThrows(UnsupportedOperationException.class,
                () -> loadout.equipped().set(0, EnchantType.FREEZE));
    }
}
