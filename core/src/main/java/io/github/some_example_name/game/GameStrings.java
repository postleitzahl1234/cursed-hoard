package io.github.some_example_name.game;

import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/** Single English string table. UI code addresses copy by stable keys, ready for later locales. */
public final class GameStrings {
    private static final Map<String, String> EN;

    static {
        Map<String, String> s = new HashMap<>();
        put(s, "app.title", "Cursed Hoard");
        put(s, "menu.subtitle", "STEAL THE KINGDOM. GUARD THE HOARD.");
        put(s, "menu.edition", "THE RELIQUARY EDITION");
        put(s, "menu.play", "PLAY CAMPAIGN");
        put(s, "menu.almanac", "ALMANAC");
        put(s, "menu.skills", "SKILL TREE");
        put(s, "menu.settings", "SETTINGS");
        put(s, "menu.quit", "QUIT");
        put(s, "common.back", "BACK");
        put(s, "common.reset", "RESET");
        put(s, "world.choose", "CHOOSE A WORLD");
        put(s, "world.realms", "FIVE CURSED REALMS");
        put(s, "world.locked", "  [LOCKED]");
        put(s, "level.preview", "Preview - L%d");
        put(s, "level.short", "L%d");
        put(s, "tutorial.title", "FIRST RAID");
        put(s, "tutorial.continue", "Click to continue");
        put(s, "tutorial.0", "Protect the five gems. Fell a tree to open tower ground.");
        put(s, "tutorial.1", "Cleared ground can hold towers. Every tower needs a 2x2 footprint.");
        put(s, "tutorial.2", "Damage types matter: match physical, frost, fire and curse to enemy resistance.");
        put(s, "tutorial.3", "A thief has a gem. Kill the carrier and the dropped gem will return to the cave.");
        put(s, "tutorial.4", "Only two enchants are equipped. Arm a slot, then cast it on the battlefield.");
        put(s, "hud.maps_only", "Maps-only asset mode: maps, obstacles, buildings");
        put(s, "hud.dev", "DEV");
        put(s, "hud.cast", "Cast %s - click the battlefield");
        put(s, "hud.build_hint", "Fell trees for ground - towers take 2x2");
        put(s, "hud.build", "Build: %s");
        put(s, "hud.early_bonus", "+%d");
        put(s, "hud.speed", "2X");
        put(s, "tower.max", "MAX TIER");
        put(s, "tower.stats", "T%d  DPS %.0f  CROWD %.0f  RNG %d");
        put(s, "tower.tier", "T%d");
        put(s, "almanac.tower_heading", "%s  -  Tier %d");
        put(s, "almanac.damage_range", "Hit %d   DPS %.0f   Range %d");
        put(s, "almanac.crowd_dps", "Crowd potential %.0f DPS");
        put(s, "almanac.cost", "Cost %d");
        put(s, "almanac.sell", "Sell %d");
        put(s, "almanac.health_speed", "Health %d   Speed %s");
        put(s, "almanac.reward", "Reward %d");
        put(s, "almanac.resistance", "Phys %s  Crypt %s");
        put(s, "skill.progress", "%s  (%d/5)");
        put(s, "result.victory", "VICTORY");
        put(s, "result.defeat", "DEFEAT");
        put(s, "result.gems", "%d of %d gems held");
        put(s, "result.points", "+%d skill points");
        put(s, "result.lost", "The heroes carried off every gem");
        put(s, "result.continue", "CONTINUE");
        put(s, "result.retreat", "RETREAT");
        put(s, "almanac.equippable", "equippable enchant");
        put(s, "almanac.area", "ability area-effect");
        put(s, "almanac.equip_slot", "EQUIP SLOT %d");
        put(s, "almanac.equipped_slot", "SLOT %d EQUIPPED");
        put(s, "settings.map_builder", "MAP BUILDER");
        put(s, "settings.reset_progress", "RESET PROGRESS");
        put(s, "settings.world_map", "WORLD MAP: STYLE %d");
        put(s, "settings.maps_only", "MAPS ONLY: %s");
        put(s, "settings.dev", "DEV MODE: %s");
        put(s, "settings.speed", "2X SPEED: %s");
        put(s, "skill.heading", "%s TREE");
        put(s, "settings.controls", "CONTROLS");
        put(s, "settings.control_click", "Click: build tower / select tower / cast armed enchant");
        put(s, "settings.control_keys", "1-4 faction   Space send wave   P pause   X 2x speed");
        put(s, "settings.control_spells", "M meteor   F fear   Esc cancel or back");
        put(s, "settings.control_speed", "2x button: TAP toggles, HOLD runs only while pressed");
        put(s, "settings.modes", "Maps only: static preview.  Dev: all unlocked.");
        put(s, "settings.theme", "Theme: dark (locked) - audio controls at right");
        put(s, "audio.title", "AUDIO");
        put(s, "audio.mute", "MUTE");
        put(s, "audio.unmute", "UNMUTE");
        put(s, "audio.row", "%s  %d%%");
        put(s, "audio.master", "MASTER");
        put(s, "audio.music", "MUSIC");
        put(s, "audio.sfx", "SFX");
        put(s, "builder.brush", "Brush: %s%s");
        put(s, "builder.single_cell", "Single-cell brush — click the map to apply.");
        put(s, "common.scroll", "scroll");
        put(s, "state.on", "ON");
        put(s, "state.off", "OFF");
        put(s, "state.tap", "TAP");
        put(s, "state.hold", "HOLD");

        String[] worlds = {"Great Grasslands", "Holy Mountains", "Sea of Sand", "Royal Gardens", "Shadow Realm"};
        String[] tabs = {"TROOPS", "TOWERS", "EFFECTS"};
        String[] factions = {"ORC", "CRYPT", "DEMON", "GOBLIN"};
        for (int i = 0; i < worlds.length; i++) put(s, "world." + i, worlds[i]);
        for (int i = 0; i < tabs.length; i++) put(s, "almanac.tab." + i, tabs[i]);
        for (int i = 0; i < factions.length; i++) put(s, "skill.faction." + i, factions[i]);

        String[][] names = {
            {"Coin Hoard", "Timber Tithe", "Sharp Axes", "Champion Bane", "Cheap Carpenters",
             "Brutal Crits", "Armor Breaker", "Bigger Payloads", "Regrowth", "Lasting Tribute"},
            {"Mana Reserves", "Potion Cache", "Deep Well", "Withering Fear", "Terror Mastery",
             "Death's Toll", "Haunted Caves", "Frozen Coffers", "Killing Cold", "Freeze Mastery"},
            {"Brimstone Tax", "Gem Drift", "Lava Pool", "Meteor Mastery", "Kill Frenzy",
             "Hellish Discounts", "Wildfire", "Burst of Cinders", "Tar Pit", "Searing Weakness"},
            {"Payroll", "Lean Workshops", "Lasting Shred", "Drone Swarm", "Scrap Drops",
             "Shrapnel Casing", "Jury-Rig", "Minefield", "Ward Mastery", "Overcharge Mastery"}
        };
        String[][] desc = {
            {"Start each level with extra gold", "Felling trees pays more gold", "Physical damage up",
             "Bonus damage to champions", "Towers cost less to build", "Chance of critical hits",
             "Shots shred enemy armor", "Bigger splash radius", "Felled trees pay again over time",
             "Cursed Tribute lasts longer"},
            {"Start with extra mana", "Mana regenerates faster", "Gems are dropped closer",
             "Feared enemies flee farther", "Fear costs less mana", "Kills leech bonus mana",
             "Lightning forks to one more foe", "Crypt upgrades cost less", "Frost slows harder",
             "Freeze lasts longer"},
            {"Kills pay bonus gold", "Dropped gems return faster", "Meteor hits a wider area",
             "Meteor costs less mana", "Burning enemies move slower", "Demon upgrades cost less",
             "Burn spreads on death", "Beams ramp up damage", "Auras reach farther",
             "Curse weakens resistances"},
            {"Waves pay a completion bonus", "Goblin upgrades cost less", "Drills shred armor longer",
             "Drones fly and strike faster", "Enemies drop scrap gold", "Bombs splash wider",
             "Towers recover from stuns fast", "Physical crits vs mechanicals", "Gem Ward costs less",
             "Overcharge refreshes faster"}
        };
        for (int f = 0; f < names.length; f++) for (int i = 0; i < names[f].length; i++) {
            put(s, "skill." + f + "." + i + ".name", names[f][i]);
            put(s, "skill." + f + "." + i + ".desc", desc[f][i]);
        }
        EN = Collections.unmodifiableMap(s);
    }

    private GameStrings() {}
    private static void put(Map<String, String> map, String key, String value) { map.put(key, value); }

    public static String get(String key, Object... args) {
        String value = EN.get(key);
        if (value == null) throw new IllegalArgumentException("unknown string key: " + key);
        return args.length == 0 ? value : String.format(Locale.ROOT, value, args);
    }

    public static String world(int index) { return get("world." + index); }
    public static String almanacTab(int index) { return get("almanac.tab." + index); }
    public static String skillName(int faction, int skill) { return get("skill." + faction + "." + skill + ".name"); }
    public static String skillDescription(int faction, int skill) { return get("skill." + faction + "." + skill + ".desc"); }
    public static String skillFaction(int faction) { return get("skill.faction." + faction); }
}
