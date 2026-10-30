package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.List;

/**
 * Value object encapsulating details of a combat hit (D-11 / D-17).
 */
public final class DamagePacket {
    public float amount;
    public DamageType type;
    public List<StatusApplication> riders;
    public boolean execute; // True if this damage is a %-max-HP execute (D-14)

    public DamagePacket(float amount, DamageType type) {
        this.amount = amount;
        this.type = type;
        this.riders = new ArrayList<>();
        this.execute = false;
    }

    public DamagePacket(float amount, DamageType type, List<StatusApplication> riders, boolean execute) {
        this.amount = amount;
        this.type = type;
        this.riders = riders != null ? riders : new ArrayList<>();
        this.execute = execute;
    }
}
