package com.badlogic.gdx;

/** Headless stand-in for the libGDX Graphics surface Gdx.graphics exposes. */
public class Graphics {
    public float getDeltaTime() { return 0f; }
    public int getBackBufferWidth() { return 1280; }
    public int getBackBufferHeight() { return 720; }
    public long getFrameId() { return 0L; }
}
