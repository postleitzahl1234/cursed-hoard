package io.github.some_example_name.game;

/**
 * Strategy interface for enemy locomotion (D-15).
 * Enables swapping between ground-based and water-air path following.
 */
public interface MovementStrategy {
    void advance(Hero h, float dt);
}
