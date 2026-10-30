package com.badlogic.gdx.graphics;

/** Headless stand-in for libGDX GL20 — just the constants CursedHoardGame references, plus glEnable. */
public class GL20 {
    public static final int GL_BLEND = 0x0BE2;
    public static final int GL_SRC_ALPHA = 0x0302;
    public static final int GL_ONE = 1;
    public static final int GL_ONE_MINUS_SRC_ALPHA = 0x0303;

    public void glEnable(int cap) {}
}
