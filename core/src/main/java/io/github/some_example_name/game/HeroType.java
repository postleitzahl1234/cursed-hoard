package io.github.some_example_name.game;

import io.github.some_example_name.game.behaviors.*;

/**
 * Rebuilt HeroType enum for cursed_treasure_v2 (D-04 / D-17 / TROOPS.md).
 * Declares all 53 enemy archetypes across the 5 campaign worlds.
 * Semantic flags are read by ResistanceProfileFactory to derive defensive values.
 */
public enum HeroType {
    // --- WORLD 1: Great Grasslands ---
    PEASANT("Peasant", 90, 65f, 15, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    GUARD("Guard", 120, 60f, 18, ResistBand.LIGHT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    OUTRIDER("Outrider", 180, 112f, 25, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    KNIGHT("Knight", 240, 52f, 35, ResistBand.HEAVY, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    PALADIN("Paladin", 270, 58f, 45, ResistBand.HEAVY, ResistBand.HIGH,
            true, true, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new SlowImmunity()}),
    BANNER_SERGEANT("Banner Sergeant", 160, 70f, 30, ResistBand.LIGHT, ResistBand.NONE,
            true, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new SupportAura(96f, 0.2f)}),
    PAVISE_GUARD("Pavise Guard", 350, 48f, 40, ResistBand.FORT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new Taunt()}),
    KNIGHT_LIEUTENANT("Knight Lieutenant", 780, 58f, 130, ResistBand.HIGH, ResistBand.NONE,
            true, false, false, false, false, false, false, true, false, false, 0,
            new UnitBehavior[]{new ThresholdInvuln(0.5f, 2.0f)}),
    GOLDEN_PRINCE("Golden Prince", 600, 120f, 150, ResistBand.FORT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, true, false, 0,
            new UnitBehavior[]{new MountState(), new GemCarrier()}),
    BOSS_GENERAL("General", 4500, 38f, 900, ResistBand.HEAVY, ResistBand.NONE,
            true, false, false, false, false, false, true, false, false, false, 0,
            new UnitBehavior[]{new ContinuousSummon("KNIGHT", 6f, 4), new ThresholdSummon("KNIGHT_LIEUTENANT", 0.5f, 4)}),

    // --- WORLD 2: Holy Mountains ---
    ACOLYTE("Acolyte", 110, 65f, 18, ResistBand.NONE, ResistBand.LIGHT,
            false, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{}),
    FLAGELLANT("Flagellant", 150, 80f, 20, ResistBand.NONE, ResistBand.NONE,
            true, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{new Frenzy()}),
    BARD("Bard", 200, 80f, 28, ResistBand.NONE, ResistBand.LIGHT,
            false, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{new StationaryPerformer(5f, 3f)}),
    TEMPLE_GUARD("Temple Guard", 380, 50f, 40, ResistBand.HEAVY, ResistBand.HEAVY,
            false, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{}),
    WAR_CLERIC("War Cleric", 220, 65f, 35, ResistBand.NONE, ResistBand.MED,
            false, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{new HealAura(96f, 15)}),
    INQUISITOR("Inquisitor", 320, 70f, 45, ResistBand.NONE, ResistBand.HIGH,
            false, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{new CleanseAura(96f, 4f)}),
    MONK("Monk", 180, 100f, 32, ResistBand.LIGHT, ResistBand.MED,
            false, false, false, false, false, true, false, false, false, false, 0,
            new UnitBehavior[]{new PathProgressTransform(0.8f, "TEMPLAR")}),
    TEMPLAR("Templar", 780, 58f, 130, ResistBand.HIGH, ResistBand.HIGH,
            true, false, false, false, false, true, false, true, false, false, 0,
            new UnitBehavior[]{new ThresholdInvuln(0.99f, 1.5f)}), // Invuln + reflect
    SERAPH("Seraph", 420, 82f, 80, ResistBand.NONE, ResistBand.HEAVY,
            false, false, false, false, false, true, false, false, false, true, 0,
            new UnitBehavior[]{new WaterborneFlight()}),
    BOSS_HIGH_PRIEST("High Priest", 6500, 40f, 1100, ResistBand.MED, ResistBand.FORT,
            true, false, false, false, false, true, true, false, false, false, 0,
            new UnitBehavior[]{new CleanseAura(128f, 6f), new ContinuousSummon("TEMPLAR", 12f, 2)}),

    // --- WORLD 3: Sea of Sand ---
    SAND_RAIDER("Sand Raider", 100, 95f, 18, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    DUNE_NOMAD("Dune Nomad", 140, 75f, 20, ResistBand.LIGHT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    ASH_WALKER("Ash Walker", 160, 85f, 28, ResistBand.NONE, ResistBand.MED,
            false, false, true, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    MIRAGE_DANCER("Mirage Dancer", 125, 145f, 30, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new Untargetable(3f, 4f)}),
    SANDSTORM_SHAMAN("Sandstorm Shaman", 220, 66f, 44, ResistBand.NONE, ResistBand.HIGH,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new SandstormCover(96f, 2f)}),
    DUNE_BEHEMOTH("Dune Behemoth", 950, 40f, 90, ResistBand.HEAVY, ResistBand.MED,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new Mounted()}),
    REBEL_SAPPER("Rebel Sapper", 130, 80f, 25, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new DeathExplosion(96f)}),
    GLASS_SENTINEL("Glass Sentinel", 320, 62f, 60, ResistBand.NONE, ResistBand.HIGH,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new DamageToHeal(2f, 6f)}),
    GIANT_VULTURE("Giant Vulture", 240, 110f, 50, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, true, 0,
            new UnitBehavior[]{new WaterborneFlight(), new Mounted()}),
    CAMEL_CARAVAN("Camel Caravan", 500, 50f, 75, ResistBand.LIGHT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new GroupCohesion()}),
    RENEGADE_KNIGHT("Renegade Knight", 820, 55f, 140, ResistBand.HIGH, ResistBand.MED,
            true, false, false, false, false, false, false, true, false, false, 0,
            new UnitBehavior[]{new ShieldMode(3f, 8f, 0.3f)}),
    BOSS_CHIEF_REBEL("Chief Rebel", 6000, 42f, 1100, ResistBand.HIGH, ResistBand.NONE,
            true, false, false, false, false, false, true, false, false, false, 0,
            new UnitBehavior[]{new ContinuousSummon("SAND_RAIDER", 4f, 6), new GoldSteal(10f), new TowerSuppressionField()}),

    // --- WORLD 4: Royal Gardens ---
    HOUSEHOLD_GUARD("Household Guard", 180, 70f, 25, ResistBand.MED, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    KINGSGUARD("Kingsguard", 280, 55f, 38, ResistBand.HEAVY, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    ROYAL_ENGINEER("Royal Engineer", 190, 72f, 30, ResistBand.LIGHT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new SteamShield(80f, 3f)}),
    COURT_CONJURER("Court Conjurer", 170, 70f, 42, ResistBand.NONE, ResistBand.HEAVY,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new AllyShield(96f, 4f)}),
    CLOCKWORK_SENTINEL("Clockwork Sentinel", 550, 75f, 85, ResistBand.HIGH, ResistBand.MED,
            true, false, false, true, true, false, false, false, false, true, 0,
            new UnitBehavior[]{new PropellerFlight()}),
    ROYAL_STANDARD_BEARER("Royal Standard Bearer", 200, 65f, 40, ResistBand.MED, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new FearlessAura(96f)}),
    ROYAL_FALCONER("Royal Falconer", 220, 85f, 45, ResistBand.NONE, ResistBand.LIGHT,
            false, false, false, false, false, false, false, false, false, true, 0,
            new UnitBehavior[]{new WaterborneFlight()}),
    ROYAL_PRINCE("Royal Prince", 750, 110f, 160, ResistBand.FORT, ResistBand.NONE,
            false, false, false, false, false, false, false, false, true, false, 0,
            new UnitBehavior[]{new MountState(), new GemCarrier()}),
    SIEGE_WAGON("Siege Wagon", 1200, 36f, 150, ResistBand.FORT, ResistBand.NONE,
            false, false, false, true, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new SteamShield(120f, 4f)}),
    LORD_COMMANDER("Lord Commander", 950, 52f, 150, ResistBand.HIGH, ResistBand.NONE,
            true, false, false, false, false, false, false, true, false, false, 0,
            new UnitBehavior[]{new ShieldMode(4f, 7f, 0.25f)}),
    BOSS_THE_KING("The King", 8000, 32f, 1500, ResistBand.HEAVY, ResistBand.NONE,
            true, false, false, false, false, false, true, false, false, false, 0,
            new UnitBehavior[]{new ContinuousSummon("KINGSGUARD", 8f, 3), new OverchargePulse(15f), new ShieldMode(4f, 12f, 0.2f)}),

    // --- WORLD 5: Shadow Realm ---
    SHADOW_WRAITH("Shadow Wraith", 150, 115f, 32, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new Untargetable(2f, 3f)}),
    CURSED_SOLDIER("Cursed Soldier", 190, 70f, 28, ResistBand.MED, ResistBand.LIGHT,
            true, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    IMP_SWARM("Imp Swarm", 120, 120f, 30, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, true, 0,
            new UnitBehavior[]{new WaterborneFlight()}),
    HELLHOUND("Hellhound", 185, 130f, 35, ResistBand.NONE, ResistBand.NONE,
            true, false, true, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{}),
    VOID_PRIEST("Void Priest", 240, 60f, 50, ResistBand.NONE, ResistBand.HEAVY,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new Resurrect(6f, 2)}),
    ABYSSAL_BEHEMOTH("Abyssal Behemoth", 1400, 42f, 180, ResistBand.HEAVY, ResistBand.HIGH,
            true, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new Mounted()}),
    SOUL_EATER("Soul Eater", 360, 68f, 70, ResistBand.NONE, ResistBand.MED,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new DeathLeech(96f)}),
    GEM_SHADE("Gem Shade", 280, 100f, 85, ResistBand.NONE, ResistBand.NONE,
            false, false, false, false, false, false, false, false, false, false, 0,
            new UnitBehavior[]{new BlinkToGem()}),
    DOOM_KNIGHT("Doom Knight", 1100, 54f, 180, ResistBand.HEAVY, ResistBand.HIGH,
            true, false, false, false, false, false, false, true, false, false, 0,
            new UnitBehavior[]{new ShieldMode(4f, 8f, 0.2f)}),
    BOSS_DEMON_SHADOW_KING("Demon Shadow King", 10000, 35f, 2000, ResistBand.HEAVY, ResistBand.HEAVY,
            true, false, false, false, false, false, true, false, false, false, 0,
            new UnitBehavior[]{new MultiPhase()});

    public final String name;
    public final int maxHp;
    public final float speed;
    public final int goldReward;
    public final ResistBand physBand;
    public final ResistBand cryptBand;

    // Semantic keyword flags (TROOPS.md)
    public final boolean fearless;
    public final boolean slowImmune;
    public final boolean fireImmune;
    public final boolean mechanical;
    public final boolean lightningVuln;
    public final boolean clergy;
    public final boolean boss;
    public final boolean champion;
    public final boolean mountedCarrier;
    public final boolean flying;
    public final int extraLives;

    public final UnitBehavior[] behaviors;

    HeroType(String name, int maxHp, float speed, int goldReward, ResistBand physBand, ResistBand cryptBand,
             boolean fearless, boolean slowImmune, boolean fireImmune, boolean mechanical, boolean lightningVuln,
             boolean clergy, boolean boss, boolean champion, boolean mountedCarrier, boolean flying, int extraLives,
             UnitBehavior[] behaviors) {
        this.name = name;
        this.maxHp = maxHp;
        this.speed = speed;
        this.goldReward = goldReward;
        this.physBand = physBand;
        this.cryptBand = cryptBand;
        this.fearless = fearless;
        this.slowImmune = slowImmune;
        this.fireImmune = fireImmune;
        this.mechanical = mechanical;
        this.lightningVuln = lightningVuln;
        this.clergy = clergy;
        this.boss = boss;
        this.champion = champion;
        this.mountedCarrier = mountedCarrier;
        this.flying = flying;
        this.extraLives = extraLives;
        this.behaviors = behaviors;
    }
}
