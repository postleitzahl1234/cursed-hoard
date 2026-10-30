package com.badlogic.gdx.backends.lwjgl3;

/** Headless stand-in for libGDX Lwjgl3ApplicationConfiguration — desktop window/display setup. */
public class Lwjgl3ApplicationConfiguration {
    public static class DisplayMode {
    }

    public void setTitle(String title) {}
    public void setWindowedMode(int width, int height) {}
    public void setFullscreenMode(DisplayMode mode) {}
    public void useVsync(boolean vsync) {}
    public void setForegroundFPS(int fps) {}

    public static DisplayMode getDisplayMode() { return new DisplayMode(); }
}
