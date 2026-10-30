package com.badlogic.gdx;

/** Headless stand-in for libGDX ApplicationAdapter — no-op default lifecycle methods. */
public class ApplicationAdapter {
    public void create() {}
    public void resize(int width, int height) {}
    public void render() {}
    public void pause() {}
    public void resume() {}
    public void dispose() {}
}
