package io.github.some_example_name.game;

import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Compact, layout-safe copy for the Almanac detail panel. */
public final class AlmanacDescriptions {
    public static final class Entry {
        public final String flavor;
        public final String ability;

        private Entry(String flavor, String ability) {
            this.flavor = flavor;
            this.ability = ability;
        }
    }

    private static final Map<HeroType, Entry> HEROES;
    private static final Map<TowerType, Entry> TOWERS;
    private static final Map<String, Entry> EFFECTS;
    private static final List<String> EFFECT_KEYS;

    static {
        EnumMap<HeroType, Entry> heroes = new EnumMap<>(HeroType.class);
        hero(heroes, HeroType.PEASANT, "Pitchfork issued. Confidence pending.", "A plain, lightly defended foot soldier.");
        hero(heroes, HeroType.GUARD, "Has a helmet and intends to use it.", "Light armor softens physical hits.");
        hero(heroes, HeroType.OUTRIDER, "Late for somewhere safer.", "A fast runner with little protection.");
        hero(heroes, HeroType.KNIGHT, "Mostly armor, occasionally opinions.", "Heavy armor resists physical damage.");
        hero(heroes, HeroType.PALADIN, "Polishes armor during ambushes.", "Fearless and immune to slowing effects.");
        hero(heroes, HeroType.BANNER_SERGEANT, "The flag does most of the shouting.", "Nearby allies move faster under its aura.");
        hero(heroes, HeroType.PAVISE_GUARD, "Carries a wall to work.", "Taunts towers and boasts fort armor.");
        hero(heroes, HeroType.KNIGHT_LIEUTENANT, "Promoted beyond reasonable durability.", "Briefly turns invulnerable at half health.");
        hero(heroes, HeroType.GOLDEN_PRINCE, "Born rich; runs richer.", "Steals gems and escapes at high speed.");
        hero(heroes, HeroType.BOSS_GENERAL, "Commands from the safest front line.", "Summons knights, then elite lieutenants.");

        hero(heroes, HeroType.ACOLYTE, "Still reading the sacred fine print.", "Light crypt resistance blocks spectral harm.");
        hero(heroes, HeroType.FLAGELLANT, "Pain is apparently a training plan.", "Frenzies as health falls and cannot fear.");
        hero(heroes, HeroType.BARD, "Weaponized enthusiasm in a hat.", "Stops to perform and empower nearby allies.");
        hero(heroes, HeroType.TEMPLE_GUARD, "The temple kept the receipt.", "Heavy armor resists physical and crypt hits.");
        hero(heroes, HeroType.WAR_CLERIC, "First aid, delivered aggressively.", "Continuously heals nearby allies.");
        hero(heroes, HeroType.INQUISITOR, "Asks questions. Removes debuffs.", "Periodically cleanses nearby allies.");
        hero(heroes, HeroType.MONK, "Walks calmly toward a promotion.", "Transforms into a Templar near the cave.");
        hero(heroes, HeroType.TEMPLAR, "Faith with reinforced plating.", "Briefly becomes invulnerable near the cave.");
        hero(heroes, HeroType.SERAPH, "Ignores roads and most signage.", "Flies over blocked and watery terrain.");
        hero(heroes, HeroType.BOSS_HIGH_PRIEST, "Blessings available in bulk.", "Cleanses allies and summons Templars.");

        hero(heroes, HeroType.SAND_RAIDER, "Sand in every pocket, by choice.", "A quick, unarmored desert raider.");
        hero(heroes, HeroType.DUNE_NOMAD, "Travels light; steals heavy.", "Light armor protects a steady runner.");
        hero(heroes, HeroType.ASH_WALKER, "Fireproof sandals sold separately.", "Resists crypt damage and ignores fire.");
        hero(heroes, HeroType.MIRAGE_DANCER, "Now you see them. Briefly.", "Periodically vanishes from tower targeting.");
        hero(heroes, HeroType.SANDSTORM_SHAMAN, "Brings weather to every meeting.", "Sandstorms cover nearby allies from fire.");
        hero(heroes, HeroType.DUNE_BEHEMOTH, "A subtle approach was considered.", "A slow, mounted wall of health.");
        hero(heroes, HeroType.REBEL_SAPPER, "Safety fuse not included.", "Explodes on death and harms nearby towers.");
        hero(heroes, HeroType.GLASS_SENTINEL, "Fragile is merely a rumor.", "Converts incoming damage into healing bursts.");
        hero(heroes, HeroType.GIANT_VULTURE, "Air mail with worse manners.", "Flies over terrain as a mounted unit.");
        hero(heroes, HeroType.CAMEL_CARAVAN, "Strength in numbers and luggage.", "Moves better while grouped with allies.");
        hero(heroes, HeroType.RENEGADE_KNIGHT, "Honor sold; shield retained.", "Raises a shield for periodic damage reduction.");
        hero(heroes, HeroType.BOSS_CHIEF_REBEL, "Rebellion now has management.", "Summons raiders, steals gold, suppresses towers.");

        hero(heroes, HeroType.HOUSEHOLD_GUARD, "Keeps the silverware strictly guarded.", "Medium armor handles physical attacks.");
        hero(heroes, HeroType.KINGSGUARD, "The crown's moving coat rack.", "Heavy armor slows incoming physical harm.");
        hero(heroes, HeroType.ROYAL_ENGINEER, "Built a shield during lunch.", "Projects a steam shield over nearby allies.");
        hero(heroes, HeroType.COURT_CONJURER, "Makes protection look expensive.", "Grants shields to nearby allies.");
        hero(heroes, HeroType.CLOCKWORK_SENTINEL, "Wound up and deeply judgmental.", "A flying machine vulnerable to lightning.");
        hero(heroes, HeroType.ROYAL_STANDARD_BEARER, "Carries morale on a very long stick.", "Makes nearby allies immune to fear.");
        hero(heroes, HeroType.ROYAL_FALCONER, "The bird handles navigation.", "A swift flyer that bypasses terrain.");
        hero(heroes, HeroType.ROYAL_PRINCE, "Royal privilege has excellent cardio.", "Steals gems, mounts up, and flees quickly.");
        hero(heroes, HeroType.SIEGE_WAGON, "Parallel parking remains undefeated.", "A fortified machine with a steam shield.");
        hero(heroes, HeroType.LORD_COMMANDER, "Issues orders from behind a shield.", "Periodically blocks most incoming damage.");
        hero(heroes, HeroType.BOSS_THE_KING, "Tax season learned to walk.", "Summons guards, shields up, and pulses power.");

        hero(heroes, HeroType.SHADOW_WRAITH, "Present in spirit, absent on paperwork.", "Frequently phases out of tower targeting.");
        hero(heroes, HeroType.CURSED_SOLDIER, "The uniform has seen better centuries.", "Fearless infantry with mixed resistance.");
        hero(heroes, HeroType.IMP_SWARM, "Many tiny problems in formation.", "A fast flying pack that ignores terrain.");
        hero(heroes, HeroType.HELLHOUND, "Fetches only unattended gems.", "Fast, fearless, and immune to fire.");
        hero(heroes, HeroType.VOID_PRIEST, "Practices extremely late medicine.", "Resurrects fallen allies nearby.");
        hero(heroes, HeroType.ABYSSAL_BEHEMOTH, "Needs two seats and a wider road.", "A mounted brute with vast health.");
        hero(heroes, HeroType.SOUL_EATER, "Leaves no crumbs, souls included.", "Leeches health when nearby allies die.");
        hero(heroes, HeroType.GEM_SHADE, "Personal space ends at your treasury.", "Blinks toward loose or carried gems.");
        hero(heroes, HeroType.DOOM_KNIGHT, "Doom arrives at walking pace.", "Heavy defenses plus a periodic shield.");
        hero(heroes, HeroType.BOSS_DEMON_SHADOW_KING, "One title short of a reasonable name.", "Changes tactics and powers across phases.");
        HEROES = Collections.unmodifiableMap(heroes);

        EnumMap<TowerType, Entry> towers = new EnumMap<>(TowerType.class);
        tower(towers, TowerType.ORC_WATCHPOST, "Two planks above minimum code.", "Fires short physical bolts at one target.");
        tower(towers, TowerType.BOLT_THROWER, "Throws bolts. Name approved.", "Launches stronger iron bolts at range.");
        tower(towers, TowerType.CROSSBOW_NEST, "Cozy, if you enjoy splinters.", "Rapidly peppers one enemy with bolts.");
        tower(towers, TowerType.BALLISTA, "Subtlety, stretched on a frame.", "Fires heavy spears over a long range.");
        tower(towers, TowerType.BOMBARD, "Accuracy is a future upgrade.", "Lobs bombs that splash nearby enemies.");
        tower(towers, TowerType.CATAPULT, "Turns geology into diplomacy.", "Hurls boulders with a broad impact.");
        tower(towers, TowerType.HARPOON_CANNON, "Fishing license conspicuously absent.", "Barbed shots pierce tough physical armor.");
        tower(towers, TowerType.DREAD_HARPOON, "Reels in complaints at speed.", "Launches devastating chained harpoons.");
        tower(towers, TowerType.SCATTERGUN_RIG, "Precision through overwhelming quantity.", "Sprays pellets across a close area.");
        tower(towers, TowerType.WAR_RIG, "Three barrels, no indoor voice.", "Unleashes a wide triple-barrel blast.");
        tower(towers, TowerType.SIEGE_MORTAR, "Delivers parcels by crater.", "Drops long-range shells with splash damage.");
        tower(towers, TowerType.DOOMSDAY_CANNON, "For when Tuesday feels too peaceful.", "Lobs enormous shells across a wide area.");

        tower(towers, TowerType.CRYPT, "Cold storage with opinions.", "Drops a frost charge on one enemy.");
        tower(towers, TowerType.CRYPT_II, "Now with improved draftiness.", "Fires stronger frost charges farther.");
        tower(towers, TowerType.FROST_CRYPT_I, "The rent is chillingly low.", "Frost bolts damage and slow one enemy.");
        tower(towers, TowerType.FROST_CRYPT_II, "Warm welcomes strictly forbidden.", "Heavy frost hits harder and slows longer.");
        tower(towers, TowerType.FEAR_CRYPT_I, "Haunted by certified professionals.", "Spectral bolts frighten a single target.");
        tower(towers, TowerType.FEAR_CRYPT_II, "Even the cobwebs look worried.", "A wraith burst fears enemies in an area.");
        tower(towers, TowerType.COLLEGE_OF_FROST_I, "Tuition paid in shivers.", "Orbiting frost volleys strike an area.");
        tower(towers, TowerType.COLLEGE_OF_FROST_II, "Now offering advanced hypothermia.", "Fires larger, stronger orbiting volleys.");
        tower(towers, TowerType.LIGHTNING_CRYPT_I, "The dead discovered electricity.", "Forked lightning chains between enemies.");
        tower(towers, TowerType.LIGHTNING_CRYPT_II, "Grounding remains theoretical.", "Chains stronger lightning through more foes.");
        tower(towers, TowerType.TERROR_CRYPT_I, "Curb appeal: deeply unsettling.", "A terror wave fears nearby enemies.");
        tower(towers, TowerType.TERROR_CRYPT_II, "Open house cancelled indefinitely.", "Unleashes a wider, stronger terror wave.");

        tower(towers, TowerType.IMP_BRAZIER, "Small fire. Smaller supervision.", "Puffs embers at a single enemy.");
        tower(towers, TowerType.HELLFORGE, "Workplace temperature dispute ongoing.", "Fires stronger bursts of flame.");
        tower(towers, TowerType.HELLBEAM, "Stares until something catches fire.", "Channels a focused beam into one target.");
        tower(towers, TowerType.SEARING_LANCE, "A sunbeam with poor intentions.", "Sustains a hotter, longer fire beam.");
        tower(towers, TowerType.HELLFIRE_PYRE, "Neighborhood warmth, aggressively shared.", "Blasts a fire nova around its target.");
        tower(towers, TowerType.PYROCLASM_ALTAR, "Ceremonies end with fewer eyebrows.", "Detonates a wide, powerful flame nova.");
        tower(towers, TowerType.ABYSSAL_RAY, "Points the abyss at trespassers.", "A piercing ray burns through its target.");
        tower(towers, TowerType.DOOMRAY, "Solar safety rating: no.", "Ramps a devastating beam on one enemy.");
        tower(towers, TowerType.BRIMSTONE_BATTERY, "Throws fire and workplace caution.", "Lobs firebombs that leave burning ground.");
        tower(towers, TowerType.MAGMA_MORTAR, "Reloads with a very large spoon.", "Splashes lava and leaves a hot zone.");
        tower(towers, TowerType.LAKE_OF_FIRE, "Water feature plans changed.", "Maintains a continuous burning field.");
        tower(towers, TowerType.INFERNAL_CALDERA, "Soup of the day: trespasser.", "Covers a huge area in lasting fire.");

        tower(towers, TowerType.GOBLIN_WORKSHOP, "Warranty void before construction.", "Fires improvised spanner bolts.");
        tower(towers, TowerType.TINKER_TOWER, "Every screw is nearly intentional.", "Shoots quick physical bolts at one foe.");
        tower(towers, TowerType.DRONE_BAY, "Tiny pilot, enormous confidence.", "Launches one drone for mobile attacks.");
        tower(towers, TowerType.DRONE_SWARM, "Airspace sold by the dozen.", "Deploys faster drones in a busy swarm.");
        tower(towers, TowerType.GATLING_TURRET, "Solves counting with more bullets.", "Rattles rapid rounds into one target.");
        tower(towers, TowerType.SPIKE_CANNON, "Shoots the point, literally.", "Lobs a spiked shell with splash damage.");
        tower(towers, TowerType.DRONE_FOUNDRY, "Assembly line has learned to fly.", "Fields durable drones with swarm bolts.");
        tower(towers, TowerType.SKY_CARRIER, "A hangar refusing to stay grounded.", "Commands an elite long-range drone fleet.");
        tower(towers, TowerType.BOMBER_DRONE, "Flight plan ends with a bang.", "Drops bombs while circling its target.");
        tower(towers, TowerType.CARPET_BOMBER, "Leaves no floor unperforated.", "Drops a string of bombs over a wide area.");
        tower(towers, TowerType.AUGER_CANNON, "Asks armor a very pointed question.", "Drill rounds punch through physical armor.");
        tower(towers, TowerType.DOOM_DRILLER, "Makes holes in future plans.", "Fires brutal drills that shred defenses.");
        TOWERS = Collections.unmodifiableMap(towers);

        LinkedHashMap<String, Entry> effects = new LinkedHashMap<>();
        effect(effects, "enchant_meteor", "Sky delivery. Signature not required.", "Calls down fire damage in a wide area.");
        effect(effects, "enchant_fear", "Suddenly, elsewhere seems excellent.", "Forces nearby enemies back along the road.");
        effect(effects, "enchant_freeze", "Time to reconsider, very slowly.", "Freezes enemies inside the target area.");
        effect(effects, "enchant_gem_ward", "Hands off the shiny rocks.", "Marks a thief to guard and recover a gem.");
        effect(effects, "enchant_cursed_tribute", "Accounting, but ominous.", "Makes enemy deaths pay extra gold.");
        effect(effects, "enchant_dark_overcharge", "More power. Fewer safety forms.", "Briefly boosts one tower's attack speed.");
        effect(effects, "fx_support_aura", "Confidence now available by radius.", "Nearby allies gain movement speed.");
        effect(effects, "fx_ally_shield", "A bubble with excellent timing.", "Absorbs damage for a protected ally.");
        effect(effects, "fx_summon_cast", "Reinforcements hate quiet entrances.", "Creates allied units beside the caster.");
        effect(effects, "fx_heal_glow", "Sparkles indicate medical competence.", "Restores health to nearby allies.");
        effect(effects, "fx_burn", "Hotter than the warning label.", "Deals fire damage over time.");
        effect(effects, "fx_freeze", "Motion privileges temporarily revoked.", "Stops movement and action briefly.");
        effect(effects, "fx_stun_overlay", "Thoughts buffering. Please wait.", "Disables a unit or tower for a moment.");
        effect(effects, "fx_banner_pulse", "Morale, now visibly contagious.", "A banner sends a buff through nearby allies.");
        effect(effects, "fx_taunt_pulse", "A tactical insult, loudly delivered.", "Forces towers to target the taunting unit.");
        effect(effects, "fx_rally", "Everyone suddenly remembers the plan.", "Temporarily strengthens nearby allies.");
        effect(effects, "fx_reflect_flash", "Return to sender, point first.", "Reflects a portion of incoming damage.");
        effect(effects, "fx_blood_frenzy", "Anger has found another gear.", "Raises speed as the unit loses health.");
        effect(effects, "fx_sing_notes", "Catchy, loud, mechanically useful.", "A performance empowers nearby allies.");
        effect(effects, "fx_cleanse_flash", "Debuffs removed while you blinked.", "Clears harmful status effects from allies.");
        effect(effects, "fx_ascension_pillar", "Promotion arrives from above.", "Transforms a unit into a stronger form.");
        effect(effects, "fx_vanish", "No target here. Probably.", "Makes a unit briefly untargetable.");
        effect(effects, "fx_phase_flicker", "Reality missed a frame.", "Phases a unit out of danger briefly.");
        effect(effects, "fx_sandstorm", "Visibility has left the battlefield.", "Covers allies and reduces fire damage.");
        effect(effects, "fx_death_blast", "Final words: a loud bang.", "Explodes on death and damages nearby towers.");
        effect(effects, "fx_absorb_heal", "Damage goes in; health comes out.", "Converts incoming damage into healing.");
        effect(effects, "fx_mutual_heal", "Teamwork with actual health benefits.", "Linked allies restore one another's health.");
        effect(effects, "fx_steam_shield", "Pressure responsibly weaponized.", "Steam blocks damage around protected allies.");
        effect(effects, "fx_shield_bubble", "Personal space, now reinforced.", "A barrier absorbs incoming damage.");
        effect(effects, "fx_resurrect", "Death paperwork returned incomplete.", "Returns a fallen ally to the road.");
        effect(effects, "fx_death_leech", "Someone else's loss, your gain.", "Heals when a nearby ally dies.");
        effect(effects, "fx_blink_gem", "Why walk when treasure is loose?", "Teleports a unit closer to a gem.");
        effect(effects, "fx_gold_steal", "The budget has developed legs.", "Removes gold from the player's hoard.");
        effect(effects, "fx_darkness_cloud", "The lights filed for leave.", "Obscures an area and weakens its towers.");
        effect(effects, "fx_orbiting_charge", "Danger taking the scenic route.", "Charges circle before striking enemies.");
        effect(effects, "fx_ground_fire", "Floor status: regrettably lava.", "Burns enemies standing in the area.");
        effect(effects, "fx_ember_shimmer", "Tiny sparks, serious consequences.", "Signals lingering fire damage or power.");
        EFFECTS = Collections.unmodifiableMap(effects);
        EFFECT_KEYS = Collections.unmodifiableList(Arrays.asList(effects.keySet().toArray(new String[0])));
    }

    private AlmanacDescriptions() {}

    public static Entry hero(HeroType type) {
        if (type == null) return fallback("Unknown unit", "No unit data available.");
        Entry entry = HEROES.get(type);
        return entry != null ? entry : fallback(pretty(type.name()), "Moves toward the hoard.");
    }

    public static Entry tower(TowerType type) {
        if (type == null) return fallback("Unknown tower", "No tower data available.");
        Entry entry = TOWERS.get(type);
        return entry != null ? entry : fallback(pretty(type.name()), "Attacks enemies inside its range.");
    }

    public static Entry effect(String key) {
        if (key == null || key.trim().isEmpty()) return fallback("Mysterious sparkle.", "Effect details unavailable.");
        Entry entry = EFFECTS.get(key);
        return entry != null ? entry : fallback(pretty(key), "A battlefield effect with secret paperwork.");
    }

    /** Stable display order matching the authored Almanac effect grid. */
    public static List<String> effectKeys() {
        return EFFECT_KEYS;
    }

    private static void hero(Map<HeroType, Entry> map, HeroType key, String flavor, String ability) {
        map.put(key, new Entry(flavor, ability));
    }

    private static void tower(Map<TowerType, Entry> map, TowerType key, String flavor, String ability) {
        map.put(key, new Entry(flavor, ability));
    }

    private static void effect(Map<String, Entry> map, String key, String flavor, String ability) {
        map.put(key, new Entry(flavor, ability));
    }

    private static Entry fallback(String subject, String ability) {
        return new Entry(subject + " has yet to submit a biography.", ability);
    }

    private static String pretty(String key) {
        String clean = key.toLowerCase(Locale.ROOT).replace("enchant_", "").replace("fx_", "").replace('_', ' ');
        return Character.toUpperCase(clean.charAt(0)) + clean.substring(1);
    }
}
