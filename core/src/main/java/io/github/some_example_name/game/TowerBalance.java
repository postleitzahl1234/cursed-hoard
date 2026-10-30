package io.github.some_example_name.game;

/**
 * Central source of truth for tower combat and economy tuning.
 *
 * <p>The targets are deliberately expressed as tier curves, then priced for each attack's
 * utility.  A bolt is the reference single-target weapon.  Area, chain and persistent drone
 * attacks surrender paper damage for the extra targets/control they provide.  This keeps the
 * upgrade tree readable and prevents a crowd-control branch from also being the best boss
 * killer.</p>
 */
final class TowerBalance {
    private TowerBalance() {}

    // Total gold invested at each tier.  Adjacent differences are the upgrade prices.
    private static final int[] COST = {0, 65, 105, 160, 235, 335, 455};

    // Reference sustained DPS for a zero-utility bolt before faction identity is applied.
    private static final float[] DPS = {0f, 28f, 50f, 86f, 135f, 205f, 295f};
    private static final float[] RANGE = {0f, 142f, 154f, 166f, 178f, 190f, 202f};
    private static final float[] INTERVAL = {0f, 1.12f, 1.02f, 0.92f, 0.83f, 0.75f, 0.68f};

    static Stats stats(String id, Faction faction, int tier, DamageType type, AttackPattern pattern) {
        float range = RANGE[tier] * factionRange(faction);
        float interval = INTERVAL[tier] * cadence(pattern, faction) * damageTypeCadence(type);
        float targetDps = DPS[tier] * factionPower(faction) * damageTypePower(type);
        float damage;

        // Beam and aura damage is applied continuously by Tower rather than once per interval.
        if (pattern == AttackPattern.BEAM) {
            damage = targetDps * 0.92f / 1.10f;
        } else if (faction == Faction.DEMON && pattern == AttackPattern.NOVA) {
            damage = targetDps * 0.82f / 0.55f;
        } else {
            damage = targetDps * interval * utilityDamageShare(id, pattern);
        }

        float splash = 0f;
        if (pattern == AttackPattern.LOB || pattern == AttackPattern.NOVA
                || pattern == AttackPattern.BOMBER) {
            float base = 43f + tier * 6f;
            splash = base * (pattern == AttackPattern.NOVA ? 1.18f
                    : pattern == AttackPattern.BOMBER ? 1.08f : 1f);
        }
        return new Stats(range, interval, Math.max(1f, Math.round(damage)), splash, COST[tier]);
    }

    private static float factionPower(Faction faction) {
        switch (faction) {
            case ORC: return 1.10f;       // hard hits, especially against unarmored targets
            case CRYPT: return 1.50f;     // pays back the 1.7x charge cycle; still control-first
            case DEMON: return 1.06f;     // burn/beam pressure, constrained by shorter reach
            case GOBLIN: return 1.02f;    // mobility and cadence provide the utility premium
            default: return 1f;
        }
    }

    private static float factionRange(Faction faction) {
        switch (faction) {
            case CRYPT: return 1.08f;
            case DEMON: return 0.94f;
            case GOBLIN: return 1.03f;
            default: return 1f;
        }
    }

    private static float damageTypePower(DamageType type) {
        switch (type) {
            case FROST: return 0.96f;      // slow creates additional contact time
            case CURSE: return 0.92f;      // fear and weakening are defensive value
            case LIGHTNING: return 0.94f;  // the chain pattern applies its own crowd premium
            case FIRE: return 1.02f;
            default: return 1f;
        }
    }

    private static float damageTypeCadence(DamageType type) {
        switch (type) {
            case FROST: return 0.98f;
            case CURSE: return 1.10f;
            case LIGHTNING: return 0.90f;
            default: return 1f;
        }
    }

    private static float cadence(AttackPattern pattern, Faction faction) {
        float result;
        switch (pattern) {
            case LOB: result = 1.34f; break;
            case BEAM: result = 0.72f; break; // cosmetic firing cadence; beam damage is continuous
            case NOVA: result = 1.15f; break;
            case CHAIN: result = 1.08f; break;
            case DRONE: result = 0.78f; break;
            case BOMBER: result = 1.12f; break;
            default: result = 1f;
        }
        if (faction == Faction.GOBLIN && pattern == AttackPattern.BOLT) result *= 0.72f;
        return result;
    }

    private static float utilityDamageShare(String id, AttackPattern pattern) {
        switch (pattern) {
            case LOB: return 0.80f;
            case NOVA: return 0.70f;
            case CHAIN: return 0.62f;
            case DRONE:
                // More advanced carriers hit more simultaneous targets, so their per-hit budget
                // falls. Tier power still raises primary DPS; coverage supplies the rest.
                if ("DRONE_SWARM".equals(id)) return 0.35f;
                if ("DRONE_FOUNDRY".equals(id)) return 0.29f;
                if ("SKY_CARRIER".equals(id)) return 0.25f;
                return 0.50f;
            case BOMBER: return 0.42f;
            default: return 1f;
        }
    }

    static final class Stats {
        final float range;
        final float interval;
        final float damage;
        final float splash;
        final int cost;

        Stats(float range, float interval, float damage, float splash, int cost) {
            this.range = range;
            this.interval = interval;
            this.damage = damage;
            this.splash = splash;
            this.cost = cost;
        }
    }
}
