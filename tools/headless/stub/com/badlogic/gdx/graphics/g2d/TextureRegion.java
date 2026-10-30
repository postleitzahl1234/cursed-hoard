package com.badlogic.gdx.graphics.g2d;

import com.badlogic.gdx.graphics.Texture;

/** Headless stand-in for libGDX TextureRegion — tracks a sub-rect of a Texture, no GL sampling. */
public class TextureRegion {
    private Texture texture;
    private int regionX, regionY, regionWidth, regionHeight;

    public TextureRegion() {}

    public TextureRegion(Texture texture) { this.texture = texture; }

    public TextureRegion(Texture texture, int x, int y, int width, int height) {
        this.texture = texture;
        this.regionX = x;
        this.regionY = y;
        this.regionWidth = width;
        this.regionHeight = height;
    }

    public TextureRegion(TextureRegion region) {
        this.texture = region.texture;
        this.regionX = region.regionX;
        this.regionY = region.regionY;
        this.regionWidth = region.regionWidth;
        this.regionHeight = region.regionHeight;
    }

    public Texture getTexture() { return texture; }
    public int getRegionX() { return regionX; }
    public int getRegionY() { return regionY; }
    public int getRegionWidth() { return regionWidth; }
    public int getRegionHeight() { return regionHeight; }
    public void flip(boolean x, boolean y) {}
}
