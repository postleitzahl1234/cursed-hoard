package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;

public final class Building {
    public static final int DESTROY_HITS = 5;
    public final BuildingType type;
    public final Vector2 pos = new Vector2();
    public int captureStage;
    public boolean active = true;
    public float radius = 128f;

    public Building(BuildingType type, float x, float y) {
        this.type = type;
        this.pos.set(x, y);
    }

    public boolean captureStep() {
        if (!type.capturable) {
            return false;
        }
        captureStage = Math.min(DESTROY_HITS, captureStage + 1);
        if (captureStage >= DESTROY_HITS) {
            active = false;
        }
        return !active;
    }

    /** Pristine plus four authored damage frames; the fifth strike finishes the ruin. */
    public int damageFrame() {
        return Math.min(DESTROY_HITS - 1, captureStage);
    }

    public void update(World world, float dt) {
        if (!active || !type.enemyBuffStructure) {
            return;
        }
        float radius2 = radius * radius;
        for (Hero hero : world.heroes) {
            if (hero.isAlive() && hero.pos.dst2(pos) <= radius2) {
                hero.applyStatus(new StatusApplication(StatusType.CURSE, 0f, 0.25f));
            }
        }
    }
}
