package com.badlogic.gdx.utils;

/**
 * Headless stand-in for libGDX JsonValue. Real JsonValue is a linked-list/tree node with public
 * child/next/name/size fields for traversal and typed accessors with defaults; this mirrors that
 * shape (grepped from PixelArtAtlas, the only caller) but never actually parses anything.
 */
public class JsonValue {
    public JsonValue child;
    public JsonValue next;
    public String name;
    public int size;

    public JsonValue get(String name) { return null; }
    public String asString() { return ""; }
    public float asFloat() { return 0f; }
    public int asInt() { return 0; }
    public boolean asBoolean() { return false; }
    public String getString(String name, String defaultValue) { return defaultValue; }
    public float getFloat(String name, float defaultValue) { return defaultValue; }
    public int getInt(String name, int defaultValue) { return defaultValue; }
    public boolean getBoolean(String name, boolean defaultValue) { return defaultValue; }
    public boolean isNull() { return false; }
    public boolean isString() { return false; }
    public boolean isArray() { return false; }
}
