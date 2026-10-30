package com.badlogic.gdx.graphics;

import com.badlogic.gdx.files.FileHandle;

/** Headless stand-in for libGDX Pixmap — CPU-side pixel buffer, GL-free here. */
public class Pixmap {
    public enum Format { RGBA8888, RGB888, Alpha }
    public enum Blending { None, SourceOver }

    public Pixmap(int width, int height, Format format) {}
    public Pixmap(FileHandle file) {}

    public void setBlending(Blending b) {}
    public void setColor(Color c) {}
    public void setColor(float r, float g, float b, float a) {}
    public void fill() {}
    public void drawPixel(int x, int y) {}
    public void drawPixel(int x, int y, int color) {}
    public Format getFormat() { return Format.RGBA8888; }
    public int getPixel(int x, int y) { return 0; }
    public void dispose() {}
}
