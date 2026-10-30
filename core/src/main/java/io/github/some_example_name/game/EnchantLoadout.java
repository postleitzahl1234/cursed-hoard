package io.github.some_example_name.game;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/** The two enchants equipped for direct use during a level (D-13). */
public final class EnchantLoadout {
    public static final int SLOT_COUNT = 2;

    private final EnchantType[] slots = {EnchantType.METEOR, EnchantType.FEAR};

    public EnchantType get(int slot) {
        checkSlot(slot);
        return slots[slot];
    }

    /** Equip an unlocked enchant. An enchant may occupy only one slot at a time. */
    public void equip(int slot, EnchantType type) {
        checkSlot(slot);
        if (type == null) throw new IllegalArgumentException("type must not be null");
        for (int i = 0; i < slots.length; i++) {
            if (i != slot && slots[i] == type) {
                EnchantType displaced = slots[slot];
                slots[slot] = type;
                slots[i] = displaced;
                return;
            }
        }
        slots[slot] = type;
    }

    public List<EnchantType> equipped() {
        return Collections.unmodifiableList(Arrays.asList(slots.clone()));
    }

    private static void checkSlot(int slot) {
        if (slot < 0 || slot >= SLOT_COUNT) {
            throw new IndexOutOfBoundsException("enchant slot " + slot);
        }
    }
}
