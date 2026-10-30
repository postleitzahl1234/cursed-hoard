package io.github.some_example_name.game;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class UtilizationReport {
    private final List<String> missingConsumedAssets = new ArrayList<>();
    private final List<String> orphanAssets = new ArrayList<>();

    public void missing(String key) {
        missingConsumedAssets.add(key);
    }

    public void orphan(String key) {
        orphanAssets.add(key);
    }

    public List<String> missingConsumedAssets() {
        return Collections.unmodifiableList(missingConsumedAssets);
    }

    public List<String> orphanAssets() {
        return Collections.unmodifiableList(orphanAssets);
    }

    public boolean isClean() {
        return missingConsumedAssets.isEmpty() && orphanAssets.isEmpty();
    }
}
