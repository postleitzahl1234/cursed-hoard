package io.github.some_example_name.game;

public final class WaveEntry {
    public final HeroType type;
    public final int count;
    public final float interval;

    public WaveEntry(HeroType type, int count, float interval) {
        this.type = type;
        this.count = count;
        this.interval = interval;
    }
}
