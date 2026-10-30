package com.badlogic.gdx.graphics.g2d;

import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.math.Matrix4;
import com.badlogic.gdx.utils.Disposable;

/**
 * Headless stand-in for libGDX SpriteBatch. Only the draw/setColor/setBlendFunction overloads the
 * render layer actually calls are implemented (grepped from CursedHoardGame, MapBuilderScreen,
 * PixelArtAtlas, PixelFont) — no real batching or GL calls happen here.
 */
public class SpriteBatch implements Disposable {
    public void begin() {}
    public void end() {}

    private final Color color = new Color(1f, 1f, 1f, 1f);
    public Color getColor() { return color; }
    public void setColor(Color color) {}
    public void setColor(float r, float g, float b, float a) {}
    public void setProjectionMatrix(Matrix4 projection) {}
    public void setBlendFunction(int srcFunc, int dstFunc) {}

    public void draw(Texture texture, float x, float y, float width, float height) {}

    public void draw(Texture texture, float x, float y, float width, float height,
                      int srcX, int srcY, int srcWidth, int srcHeight, boolean flipX, boolean flipY) {}

    public void draw(TextureRegion region, float x, float y, float width, float height) {}

    public void draw(TextureRegion region, float x, float y, float originX, float originY,
                      float width, float height, float scaleX, float scaleY, float rotation) {}

    @Override
    public void dispose() {}
}
