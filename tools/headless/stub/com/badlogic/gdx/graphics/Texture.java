package com.badlogic.gdx.graphics;

import com.badlogic.gdx.files.FileHandle;

/** Headless stand-in for libGDX Texture — no GL context here, so it holds nothing real. */
public class Texture {
    public enum TextureFilter { Nearest, Linear }

    public Texture(Pixmap pixmap) {}
    public Texture(FileHandle file) {}

    public void setFilter(TextureFilter minFilter, TextureFilter magFilter) {}
    public void dispose() {}
}
