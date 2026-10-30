package com.badlogic.gdx;

/** Headless stand-in for libGDX Input — polling stubs plus the Keys constants the game reads. */
public class Input {
    /** Nested key-code constants (subset actually referenced by CursedHoardGame). */
    public static class Keys {
        public static final int ESCAPE = 1, SPACE = 2, F = 3, M = 4, P = 5, X = 6, Z = 7, Y = 8, R = 9,
                NUM_1 = 10, NUM_2 = 11, NUM_3 = 12, NUM_4 = 13,
                CONTROL_LEFT = 14, CONTROL_RIGHT = 15, SHIFT_LEFT = 16, SHIFT_RIGHT = 17;
    }

    public void setInputProcessor(InputProcessor processor) {}
    public boolean isKeyJustPressed(int key) { return false; }
    public boolean isKeyPressed(int key) { return false; }
    public boolean isTouched() { return false; }
    public boolean justTouched() { return false; }
    public int getX() { return 0; }
    public int getY() { return 0; }
}
