package com.badlogic.gdx.utils;

import com.badlogic.gdx.files.FileHandle;

/** Headless stand-in for libGDX JsonReader — returns an empty JsonValue tree, never really parses. */
public class JsonReader {
    public JsonValue parse(FileHandle file) { return new JsonValue(); }
    public JsonValue parse(String json) { return new JsonValue(); }
}
