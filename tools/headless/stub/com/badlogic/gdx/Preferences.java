package com.badlogic.gdx;

/** Headless stand-in for libGDX Preferences — in-memory no-op (nothing is actually persisted). */
public class Preferences {
    public int getInteger(String key, int defValue) { return defValue; }
    public int getInteger(String key) { return 0; }
    public boolean getBoolean(String key, boolean defValue) { return defValue; }
    public boolean getBoolean(String key) { return false; }
    public Preferences putInteger(String key, int val) { return this; }
    public Preferences putBoolean(String key, boolean val) { return this; }
    public float getFloat(String key, float defValue) { return defValue; }
    public float getFloat(String key) { return 0f; }
    public Preferences putFloat(String key, float val) { return this; }
    public void remove(String key) {}
    public void clear() {}
    public void flush() {}
}
