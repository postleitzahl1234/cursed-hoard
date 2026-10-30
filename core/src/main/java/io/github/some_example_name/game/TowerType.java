package io.github.some_example_name.game;

public enum TowerType {
    ORC_WATCHPOST(Faction.ORC, 1, DamageType.PHYSICAL, AttackPattern.BOLT, true, "short_bolt"),
    BOLT_THROWER(Faction.ORC, 2, DamageType.PHYSICAL, AttackPattern.BOLT, true, "iron_bolt"),
    CROSSBOW_NEST(Faction.ORC, 3, DamageType.PHYSICAL, AttackPattern.BOLT, true, "rapid_bolt"),
    BALLISTA(Faction.ORC, 4, DamageType.PHYSICAL, AttackPattern.BOLT, true, "ballista_spear"),
    BOMBARD(Faction.ORC, 3, DamageType.PHYSICAL, AttackPattern.LOB, true, "arcing_bomb"),
    CATAPULT(Faction.ORC, 4, DamageType.PHYSICAL, AttackPattern.LOB, true, "boulder"),
    HARPOON_CANNON(Faction.ORC, 5, DamageType.PHYSICAL, AttackPattern.BOLT, true, "barbed_harpoon"),
    DREAD_HARPOON(Faction.ORC, 6, DamageType.PHYSICAL, AttackPattern.BOLT, true, "chained_dread_harpoon"),
    SCATTERGUN_RIG(Faction.ORC, 5, DamageType.PHYSICAL, AttackPattern.NOVA, true, "pellet_spray"),
    WAR_RIG(Faction.ORC, 6, DamageType.PHYSICAL, AttackPattern.NOVA, true, "triple_barrel_spray"),
    SIEGE_MORTAR(Faction.ORC, 5, DamageType.PHYSICAL, AttackPattern.LOB, true, "mortar_shell"),
    DOOMSDAY_CANNON(Faction.ORC, 6, DamageType.PHYSICAL, AttackPattern.LOB, true, "doomsday_shell"),

    CRYPT(Faction.CRYPT, 1, DamageType.FROST, AttackPattern.BOLT, false, "descending_ice_charge"),
    CRYPT_II(Faction.CRYPT, 2, DamageType.FROST, AttackPattern.BOLT, false, "ice_charge"),
    FROST_CRYPT_I(Faction.CRYPT, 3, DamageType.FROST, AttackPattern.BOLT, false, "frost_charge"),
    FROST_CRYPT_II(Faction.CRYPT, 4, DamageType.FROST, AttackPattern.BOLT, false, "heavy_frost_charge"),
    FEAR_CRYPT_I(Faction.CRYPT, 3, DamageType.CURSE, AttackPattern.BOLT, false, "spectral_charge"),
    FEAR_CRYPT_II(Faction.CRYPT, 4, DamageType.CURSE, AttackPattern.NOVA, false, "wraith_charge"),
    COLLEGE_OF_FROST_I(Faction.CRYPT, 5, DamageType.FROST, AttackPattern.NOVA, false, "orbiting_frost_volley"),
    COLLEGE_OF_FROST_II(Faction.CRYPT, 6, DamageType.FROST, AttackPattern.NOVA, false, "orbiting_frost_volley_plus"),
    LIGHTNING_CRYPT_I(Faction.CRYPT, 5, DamageType.LIGHTNING, AttackPattern.CHAIN, false, "forking_bolt"),
    LIGHTNING_CRYPT_II(Faction.CRYPT, 6, DamageType.LIGHTNING, AttackPattern.CHAIN, false, "forking_bolt_plus"),
    TERROR_CRYPT_I(Faction.CRYPT, 5, DamageType.CURSE, AttackPattern.NOVA, false, "terror_wave"),
    TERROR_CRYPT_II(Faction.CRYPT, 6, DamageType.CURSE, AttackPattern.NOVA, false, "terror_wave_plus"),

    IMP_BRAZIER(Faction.DEMON, 1, DamageType.FIRE, AttackPattern.BOLT, false, "ember_puff"),
    HELLFORGE(Faction.DEMON, 2, DamageType.FIRE, AttackPattern.BOLT, false, "flame_burst"),
    HELLBEAM(Faction.DEMON, 3, DamageType.FIRE, AttackPattern.BEAM, false, "focused_flame_beam"),
    SEARING_LANCE(Faction.DEMON, 4, DamageType.FIRE, AttackPattern.BEAM, false, "lance_beam"),
    HELLFIRE_PYRE(Faction.DEMON, 3, DamageType.FIRE, AttackPattern.NOVA, false, "flame_nova"),
    PYROCLASM_ALTAR(Faction.DEMON, 4, DamageType.FIRE, AttackPattern.NOVA, false, "wide_flame_nova"),
    ABYSSAL_RAY(Faction.DEMON, 5, DamageType.FIRE, AttackPattern.BEAM, false, "piercing_ray"),
    DOOMRAY(Faction.DEMON, 6, DamageType.FIRE, AttackPattern.BEAM, false, "piercing_ray_plus"),
    BRIMSTONE_BATTERY(Faction.DEMON, 5, DamageType.FIRE, AttackPattern.LOB, false, "firebomb_ground_patch"),
    MAGMA_MORTAR(Faction.DEMON, 6, DamageType.FIRE, AttackPattern.LOB, false, "lava_splash_ground_patch"),
    LAKE_OF_FIRE(Faction.DEMON, 5, DamageType.FIRE, AttackPattern.NOVA, false, "continuous_burn_field"),
    INFERNAL_CALDERA(Faction.DEMON, 6, DamageType.FIRE, AttackPattern.NOVA, false, "continuous_burn_field_plus"),

    GOBLIN_WORKSHOP(Faction.GOBLIN, 1, DamageType.PHYSICAL, AttackPattern.BOLT, true, "spanner_bolt"),
    TINKER_TOWER(Faction.GOBLIN, 2, DamageType.PHYSICAL, AttackPattern.BOLT, true, "goblin_bolt"),
    DRONE_BAY(Faction.GOBLIN, 3, DamageType.PHYSICAL, AttackPattern.DRONE, false, "drone_bolt"),
    DRONE_SWARM(Faction.GOBLIN, 4, DamageType.PHYSICAL, AttackPattern.DRONE, false, "drone_bolt_plus"),
    GATLING_TURRET(Faction.GOBLIN, 3, DamageType.PHYSICAL, AttackPattern.BOLT, true, "gatling_round"),
    SPIKE_CANNON(Faction.GOBLIN, 4, DamageType.PHYSICAL, AttackPattern.LOB, true, "spike_shell"),
    DRONE_FOUNDRY(Faction.GOBLIN, 5, DamageType.PHYSICAL, AttackPattern.DRONE, false, "swarm_drone_bolts"),
    SKY_CARRIER(Faction.GOBLIN, 6, DamageType.PHYSICAL, AttackPattern.DRONE, false, "swarm_drone_bolts_plus"),
    BOMBER_DRONE(Faction.GOBLIN, 5, DamageType.PHYSICAL, AttackPattern.BOMBER, false, "dropped_bombs"),
    CARPET_BOMBER(Faction.GOBLIN, 6, DamageType.PHYSICAL, AttackPattern.BOMBER, false, "bomb_string"),
    AUGER_CANNON(Faction.GOBLIN, 5, DamageType.PHYSICAL, AttackPattern.BOLT, true, "drill_round"),
    DOOM_DRILLER(Faction.GOBLIN, 6, DamageType.PHYSICAL, AttackPattern.BOLT, true, "drill_round_plus");

    public final Faction faction;
    public final int tier;
    public final DamageType damageType;
    public final AttackPattern pattern;
    public final boolean hasTurret;
    public final String projectileAssetKey;
    public final String baseAssetKey;
    public final String turretAssetKey;
    public final float range;
    public final float fireInterval;
    public final float damage;
    public final float splashRadius;
    public final int cost;

    TowerType(Faction faction, int tier, DamageType damageType, AttackPattern pattern, boolean hasTurret, String projectileKey) {
        this.faction = faction;
        this.tier = tier;
        this.damageType = damageType;
        this.pattern = pattern;
        this.hasTurret = hasTurret;
        this.projectileAssetKey = "projectile_" + projectileKey;
        this.baseAssetKey = "tower_" + name().toLowerCase();
        this.turretAssetKey = "turret_" + name().toLowerCase();
        TowerBalance.Stats stats = TowerBalance.stats(name(), faction, tier, damageType, pattern);
        this.range = stats.range;
        this.fireInterval = stats.interval;
        this.damage = stats.damage;
        this.splashRadius = stats.splash;
        this.cost = stats.cost;
    }

    public float attacksPerSecond() {
        if (pattern == AttackPattern.BEAM
                || (faction == Faction.DEMON && pattern == AttackPattern.NOVA)) return 0f;
        float cycle = fireInterval;
        if (faction == Faction.CRYPT) cycle *= 1.7f;
        if (pattern == AttackPattern.BOMBER) cycle *= 1.9f;
        return 1f / cycle;
    }

    /**
     * Runtime-aware single-target DPS before resistance and skills.
     * Continuous attacks, Crypt's dry charge cycle, finite drone sorties and the expected
     * three-bomb contact window are represented instead of pretending every type is a bolt.
     */
    public float sustainedSingleTargetDps() {
        if (pattern == AttackPattern.BEAM) return damage * 1.10f;
        if (faction == Faction.DEMON && pattern == AttackPattern.NOVA) return damage * 0.55f;
        if (pattern == AttackPattern.DRONE) return damage / fireInterval * 0.75f;
        if (pattern == AttackPattern.BOMBER) {
            float bombScale = this == CARPET_BOMBER ? 0.34f : 0.40f;
            return damage / fireInterval * (3f * bombScale) / 1.9f;
        }
        float cycle = fireInterval * (faction == Faction.CRYPT ? 1.7f : 1f);
        return damage / cycle;
    }

    /** Maximum crowd throughput when the attack's normal secondary targets are available. */
    public float crowdDpsPotential() {
        float single = sustainedSingleTargetDps();
        if (pattern == AttackPattern.CHAIN || pattern == AttackPattern.LOB
                || pattern == AttackPattern.NOVA) return single * 3f;
        if (pattern == AttackPattern.DRONE) {
            if (this == DRONE_SWARM) return single * 2f;
            if (this == DRONE_FOUNDRY) return single * 3f;
            if (this == SKY_CARRIER) return single * 4f;
        }
        if (pattern == AttackPattern.BOMBER) return single * 2f;
        return single;
    }

    /** Upgrade tree: child → parent (branching exactly as the tier lattice was designed). */
    private static final java.util.EnumMap<TowerType, TowerType> PARENT = new java.util.EnumMap<>(TowerType.class);

    static {
        // Orc: bolt line and lob line, splitting again at T5
        PARENT.put(BOLT_THROWER, ORC_WATCHPOST);
        PARENT.put(CROSSBOW_NEST, BOLT_THROWER);
        PARENT.put(BOMBARD, BOLT_THROWER);
        PARENT.put(BALLISTA, CROSSBOW_NEST);
        PARENT.put(CATAPULT, BOMBARD);
        PARENT.put(HARPOON_CANNON, BALLISTA);
        PARENT.put(SCATTERGUN_RIG, BALLISTA);
        PARENT.put(SIEGE_MORTAR, CATAPULT);
        PARENT.put(DREAD_HARPOON, HARPOON_CANNON);
        PARENT.put(WAR_RIG, SCATTERGUN_RIG);
        PARENT.put(DOOMSDAY_CANNON, SIEGE_MORTAR);
        // Crypt: frost line and fear line
        PARENT.put(CRYPT_II, CRYPT);
        PARENT.put(FROST_CRYPT_I, CRYPT_II);
        PARENT.put(FEAR_CRYPT_I, CRYPT_II);
        PARENT.put(FROST_CRYPT_II, FROST_CRYPT_I);
        PARENT.put(FEAR_CRYPT_II, FEAR_CRYPT_I);
        PARENT.put(COLLEGE_OF_FROST_I, FROST_CRYPT_II);
        PARENT.put(LIGHTNING_CRYPT_I, FROST_CRYPT_II);
        PARENT.put(TERROR_CRYPT_I, FEAR_CRYPT_II);
        PARENT.put(COLLEGE_OF_FROST_II, COLLEGE_OF_FROST_I);
        PARENT.put(LIGHTNING_CRYPT_II, LIGHTNING_CRYPT_I);
        PARENT.put(TERROR_CRYPT_II, TERROR_CRYPT_I);
        // Demon: beam line and nova line
        PARENT.put(HELLFORGE, IMP_BRAZIER);
        PARENT.put(HELLBEAM, HELLFORGE);
        PARENT.put(HELLFIRE_PYRE, HELLFORGE);
        PARENT.put(SEARING_LANCE, HELLBEAM);
        PARENT.put(PYROCLASM_ALTAR, HELLFIRE_PYRE);
        PARENT.put(ABYSSAL_RAY, SEARING_LANCE);
        PARENT.put(BRIMSTONE_BATTERY, SEARING_LANCE);
        PARENT.put(LAKE_OF_FIRE, PYROCLASM_ALTAR);
        PARENT.put(DOOMRAY, ABYSSAL_RAY);
        PARENT.put(MAGMA_MORTAR, BRIMSTONE_BATTERY);
        PARENT.put(INFERNAL_CALDERA, LAKE_OF_FIRE);
        // Goblin: drone line and gun line
        PARENT.put(TINKER_TOWER, GOBLIN_WORKSHOP);
        PARENT.put(DRONE_BAY, TINKER_TOWER);
        PARENT.put(GATLING_TURRET, TINKER_TOWER);
        PARENT.put(DRONE_SWARM, DRONE_BAY);
        PARENT.put(SPIKE_CANNON, GATLING_TURRET);
        PARENT.put(DRONE_FOUNDRY, DRONE_SWARM);
        PARENT.put(BOMBER_DRONE, DRONE_SWARM);
        PARENT.put(AUGER_CANNON, SPIKE_CANNON);
        PARENT.put(SKY_CARRIER, DRONE_FOUNDRY);
        PARENT.put(CARPET_BOMBER, BOMBER_DRONE);
        PARENT.put(DOOM_DRILLER, AUGER_CANNON);
    }

    /** The tower this one upgrades from, or null for a T1 root. */
    public TowerType parent() {
        return PARENT.get(this);
    }

    /** All direct upgrades available from this tower (0–2 branches). */
    public java.util.List<TowerType> upgrades() {
        java.util.List<TowerType> out = new java.util.ArrayList<>(2);
        for (java.util.Map.Entry<TowerType, TowerType> e : PARENT.entrySet())
            if (e.getValue() == this) out.add(e.getKey());
        return out;
    }

    /** Cost to upgrade into this tower (the tier-price difference). */
    public int upgradeCost() {
        TowerType p = parent();
        return p == null ? cost : Math.max(30, cost - p.cost);
    }

    /** Sell refund: 65% of everything invested down the upgrade chain. */
    public int sellValue() {
        int invested = 0;
        for (TowerType t = this; t != null; t = t.parent()) invested += t.upgradeCost();
        return Math.round(invested * 0.65f);
    }
}
