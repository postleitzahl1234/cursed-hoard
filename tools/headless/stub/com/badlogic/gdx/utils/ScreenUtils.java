package com.badlogic.gdx.utils;

import com.badlogic.gdx.graphics.Pixmap;

/** Headless stand-in for libGDX ScreenUtils — no framebuffer to clear or read here. */
public class ScreenUtils {
    public static void clear(float r, float g, float b, float a) {}

    public static Pixmap getFrameBufferPixmap(int x, int y, int w, int h) {
        return new Pixmap(w, h, Pixmap.Format.RGBA8888);
    }
}
