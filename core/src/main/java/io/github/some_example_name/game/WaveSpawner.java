package io.github.some_example_name.game;

public final class WaveSpawner {
    private Wave wave;
    private int entryIndex;
    private int spawnedInEntry;
    private float timer;
    private int waveIndex;

    public void start(Wave wave) {
        this.wave = wave;
        this.entryIndex = 0;
        this.spawnedInEntry = 0;
        this.timer = 0f;
        this.waveIndex++;
    }

    public int waveIndex() {
        return waveIndex;
    }

    public void update(World world, float dt) {
        if (wave == null || entryIndex >= wave.entries().size()) {
            return;
        }
        timer -= dt;
        WaveEntry entry = wave.entries().get(entryIndex);
        if (timer <= 0f) {
            world.spawnHero(entry.type);
            spawnedInEntry++;
            timer = entry.interval;
            if (spawnedInEntry >= entry.count) {
                entryIndex++;
                spawnedInEntry = 0;
            }
        }
    }

    public boolean isDone() {
        return wave == null || entryIndex >= wave.entries().size();
    }
}
