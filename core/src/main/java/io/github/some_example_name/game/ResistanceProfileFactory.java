package io.github.some_example_name.game;

import java.util.EnumMap;
import java.util.EnumSet;

/**
 * Factory to derive ResistanceProfiles from HeroType semantic flags (D-17 / TROOPS.md).
 * Ensures qualitative design specs map cleanly to runtime matrices with minimal boilerplate.
 */
public final class ResistanceProfileFactory {

    public static ResistanceProfile derive(HeroType type) {
        ResistanceProfile profile = new ResistanceProfile();

        // 1. Assign base bands
        profile.physBand = type.physBand;
        profile.cryptBand = type.cryptBand;

        // 2. Apply conventions based on keyword flags (TROOPS.md §1)
        if (type.fearless) {
            profile.statusImmunities.add(StatusType.FEAR);
        }

        if (type.slowImmune) {
            profile.statusImmunities.add(StatusType.SLOW);
            profile.statusImmunities.add(StatusType.FREEZE);
        }

        if (type.fireImmune) {
            profile.overrides.put(DamageType.FIRE, ElementResponse.IMMUNE);
            profile.statusImmunities.add(StatusType.BURN);
        }

        if (type.mechanical) {
            profile.statusImmunities.add(StatusType.BURN);
            if (type.lightningVuln) {
                profile.overrides.put(DamageType.LIGHTNING, ElementResponse.VULN);
            }
        }

        // 3. Apply role conventions
        if (type.boss) {
            profile.statusImmunities.add(StatusType.FEAR);
            profile.statusImmunities.add(StatusType.STUN);
            profile.executeImmune = true;
        } else if (type.champion) {
            profile.executeImmune = true;
            // Note: STUN-resist is handled dynamically in StatusController, not as immunity
        }

        // 4. Specific unit exceptions (deviations)
        if (type.name().equals("IMP_SWARM")) {
            // Imp Swarm is demonic, has FIRE-resist but not immune (D-17)
            profile.overrides.put(DamageType.FIRE, ElementResponse.RESIST);
        }

        return profile;
    }
}
