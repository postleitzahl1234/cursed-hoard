package com.badlogic.gdx;

import com.badlogic.gdx.files.FileHandle;

/** Headless stand-in for the libGDX Files surface Gdx.files exposes. */
public class Files {
    public FileHandle internal(String path) { return new FileHandle(path); }
    public FileHandle local(String path) { return new FileHandle(path); }
    public FileHandle absolute(String path) { return new FileHandle(path); }
}
