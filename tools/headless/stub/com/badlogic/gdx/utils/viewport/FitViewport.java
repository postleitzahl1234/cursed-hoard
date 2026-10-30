package com.badlogic.gdx.utils.viewport;

import com.badlogic.gdx.graphics.OrthographicCamera;
import com.badlogic.gdx.math.Vector2;

/** Headless stand-in for libGDX FitViewport — unproject is the identity (no real screen to map from). */
public class FitViewport {
    public FitViewport(float worldWidth, float worldHeight, OrthographicCamera camera) {}

    public void update(int screenWidth, int screenHeight, boolean centerCamera) {}
    public void apply() {}

    public Vector2 unproject(Vector2 screenCoords) { return screenCoords; }
}
