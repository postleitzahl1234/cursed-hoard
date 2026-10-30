package com.badlogic.gdx.files;

import java.io.File;

/** Headless stand-in for libGDX FileHandle. No real I/O — enough surface to type-check callers. */
public class FileHandle {
    private final String path;

    public FileHandle(String path) { this.path = path; }

    public boolean exists() { return false; }
    public FileHandle[] list(String suffix) { return new FileHandle[0]; }
    public long lastModified() { return 0L; }
    public String readString() { return ""; }
    public String readString(String charset) { return ""; }
    public void writeString(String s, boolean append) {}
    public String name() { return path; }
    public File file() { return new File(path); }
}
