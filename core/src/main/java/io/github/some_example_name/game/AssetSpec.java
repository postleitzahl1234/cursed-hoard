package io.github.some_example_name.game;

public final class AssetSpec {
    public final String key;
    public final AssetRole role;
    public final int width;
    public final int height;
    public final float anchorX;
    public final float anchorY;
    public final int frames;

    public AssetSpec(String key, AssetRole role, int width, int height, float anchorX, float anchorY, int frames) {
        if (key == null || key.trim().isEmpty()) {
            throw new IllegalArgumentException("Asset key must be present.");
        }
        this.key = key;
        this.role = role;
        this.width = width;
        this.height = height;
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        this.frames = Math.max(1, frames);
    }

    public static AssetSpec towerBase(String key) {
        return new AssetSpec(key, AssetRole.TOWER_BASE, 64, 128, 32f, 32f, 4);
    }

    /**
     * One authored facing of a tower's aim part (D-23). Two frames — at rest and firing — because
     * facing is now carried by the sprite key, not by the frame index, so the frames are free for
     * the attack animation again.
     */
    public static AssetSpec turret(String key) {
        return new AssetSpec(key, AssetRole.TOWER_TURRET, 64, 96, 32f, 32f, 2);
    }

    public static AssetSpec projectile(String key) {
        return new AssetSpec(key, AssetRole.PROJECTILE, 64, 64, 32f, 32f, 2);
    }
}
