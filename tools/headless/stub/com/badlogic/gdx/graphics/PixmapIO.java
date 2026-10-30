package com.badlogic.gdx.graphics;

import com.badlogic.gdx.files.FileHandle;

/** Headless stand-in for libGDX PixmapIO — screenshot writer, no-op here. */
public class PixmapIO {
    public static void writePNG(FileHandle file, Pixmap pixmap) {}
}
