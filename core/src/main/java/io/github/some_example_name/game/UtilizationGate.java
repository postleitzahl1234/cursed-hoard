package io.github.some_example_name.game;

import java.util.HashSet;
import java.util.Set;

public final class UtilizationGate {
    public UtilizationReport check(AssetCatalog catalog, Set<String> deliveredKeys) {
        UtilizationReport report = new UtilizationReport();
        Set<String> consumed = new HashSet<>();
        for (AssetSpec spec : catalog.allSpecs()) {
            consumed.add(spec.key);
            if (deliveredKeys != null && !deliveredKeys.contains(spec.key)) {
                report.missing(spec.key);
            }
        }
        if (deliveredKeys != null) {
            for (String key : deliveredKeys) {
                if (!consumed.contains(key)) {
                    report.orphan(key);
                }
            }
        }
        return report;
    }
}
