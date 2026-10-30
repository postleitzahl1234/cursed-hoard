package io.github.some_example_name.game;

import java.util.EnumMap;
import java.util.EnumSet;

/**
 * Stores the static resistance profile for a HeroType (D-11 / D-17).
 */
public final class ResistanceProfile {
    public ResistBand physBand;                          // Physical armor band
    public ResistBand cryptBand;                         // D-17 "magic-resist" vs FROST, LIGHTNING, CURSE
    public final EnumMap<DamageType, ElementResponse> overrides; // E.g., FIRE-immune, FROST-vuln
    public final EnumSet<StatusType> statusImmunities;
    public boolean executeImmune;

    public ResistanceProfile() {
        this.physBand = ResistBand.NONE;
        this.cryptBand = ResistBand.NONE;
        this.overrides = new EnumMap<>(DamageType.class);
        this.statusImmunities = EnumSet.noneOf(StatusType.class);
        this.executeImmune = false;
    }

    public ResistanceProfile(ResistBand physBand, ResistBand cryptBand,
                             EnumMap<DamageType, ElementResponse> overrides,
                             EnumSet<StatusType> statusImmunities, boolean executeImmune) {
        this.physBand = physBand != null ? physBand : ResistBand.NONE;
        this.cryptBand = cryptBand != null ? cryptBand : ResistBand.NONE;
        this.overrides = overrides != null ? new EnumMap<>(overrides) : new EnumMap<>(DamageType.class);
        this.statusImmunities = statusImmunities != null ? EnumSet.copyOf(statusImmunities) : EnumSet.noneOf(StatusType.class);
        this.executeImmune = executeImmune;
    }
}
