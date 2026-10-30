package com.badlogic.gdx.graphics;

import com.badlogic.gdx.math.Matrix4;

/** Headless stand-in for libGDX OrthographicCamera — just the combined matrix FitViewport/SpriteBatch need. */
public class OrthographicCamera {
    public Matrix4 combined = new Matrix4();
    public float viewportWidth, viewportHeight;

    public void update() {}
}
