package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class Wave {
    private final List<WaveEntry> entries = new ArrayList<>();

    public Wave add(HeroType type, int count, float interval) {
        entries.add(new WaveEntry(type, count, interval));
        return this;
    }

    public List<WaveEntry> entries() {
        return Collections.unmodifiableList(entries);
    }
}
