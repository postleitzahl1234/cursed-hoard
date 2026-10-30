package io.github.some_example_name.game;

/**
 * Value object representing a status effect application request (D-17).
 */
public final class StatusApplication {
    public final StatusType type;
    public final float magnitude; // E.g., slow percentage, DoT damage amount
    public final float duration;  // Seconds

    public StatusApplication(StatusType type, float magnitude, float duration) {
        this.type = type;
        this.magnitude = magnitude;
        this.duration = duration;
    }
}
