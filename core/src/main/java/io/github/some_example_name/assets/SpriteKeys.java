package io.github.some_example_name.assets;

import io.github.some_example_name.game.BuildingType;
import io.github.some_example_name.game.Faction;
import io.github.some_example_name.game.GemType;
import io.github.some_example_name.game.HeroType;
import io.github.some_example_name.game.StatusType;
import io.github.some_example_name.game.TerrainType;
import io.github.some_example_name.game.TowerType;
import java.util.HashMap;
import java.util.Map;

/**
 * Bridges the gameplay enums to the authored sprite keys in the atlas (Game_assets_v2 naming).
 * The authoring scheme differs from the enum names (e.g. {@code ORC_WATCHPOST} → {@code orc_t1_watchpost},
 * {@code BOSS_GENERAL} → {@code troop_general}, map nodes keyed by descriptive title), so every lookup
 * here resolves against the live atlas and caches the result. Results are deterministic.
 */
public final class SpriteKeys {
    private final SpriteSource atlas;
    private final Map<String, String> cache = new HashMap<>();

    public SpriteKeys(SpriteSource atlas) {
        this.atlas = atlas;
    }

    /** First key (lexicographically) starting with {@code prefix}, or null. */
    private String firstWithPrefix(String prefix) {
        String best = null;
        for (String key : atlas.keySet()) {
            if (key.startsWith(prefix) && (best == null || key.compareTo(best) < 0)) best = key;
        }
        return best;
    }

    /** Best key under {@code prefix} by token overlap with {@code want}, skipping {@code exclude}. */
    private String bestMatch(String prefix, String[] want, String[] exclude) {
        String best = null;
        int bestScore = -1;
        for (String key : atlas.keySet()) {
            if (!key.startsWith(prefix)) continue;
            boolean skip = false;
            for (String ex : exclude) if (key.contains(ex)) { skip = true; break; }
            if (skip) continue;
            int score = 0;
            for (String t : want) if (t.length() > 0 && key.contains(t)) score++;
            if (score > bestScore || (score == bestScore && best != null && key.compareTo(best) < 0)) {
                bestScore = score;
                best = key;
            }
        }
        return best;
    }

    private String factionWord(Faction f) {
        switch (f) {
            case ORC: return "orc";
            case GOBLIN: return "goblin";
            case CRYPT: return "crypt";
            case DEMON: return "demon";
            default: return f.name().toLowerCase();
        }
    }

    /** The standing tower sprite (turret towers: full rig; Crypt/Demon: static weapon). */
    public String tower(TowerType type) {
        return cache.computeIfAbsent("tower:" + type.name(), k -> {
            String fw = factionWord(type.faction);
            String prefix = fw + "_t" + type.tier + "_";
            String stem = type.name().toLowerCase();
            if (stem.startsWith(fw + "_")) stem = stem.substring(fw.length() + 1);
            // Exact candidates first (handles the 45 regular cases + CRYPT_II).
            String[] candidates = {prefix + stem, prefix + type.name().toLowerCase()};
            for (String c : candidates) {
                if (atlas.has(c)) return c;
            }
            // Fuzzy: best token overlap within this faction+tier, never the bare _base/_unit cards.
            String fuzzy = bestMatch(prefix, stem.split("_"),
                    new String[] {"_base", "_unit"});
            return fuzzy != null ? fuzzy : prefix + stem;
        });
    }

    /** The bare structure card for a tower (turret towers only; else the full sprite). */
    public String towerBase(TowerType type) {
        String base = tower(type) + "_base";
        return atlas.has(base) ? base : tower(type);
    }

    /**
     * The aim part for a tower at an 8-way facing — the sub-sprite that turns toward the target
     * (D-23). {@code facingArt} is one of the five authored suffixes (e/ne/n/se/s) supplied by
     * {@link io.github.some_example_name.game.Turret#art()}; the caller mirrors it for W/NW/SW.
     *
     * <p>Returns {@code null} when the tower ships no aim art — an aura tower with no target, or
     * a tier that has not been re-authored yet. Callers fall back to the legacy single-sprite
     * path, so the rebuild can land tower by tower without breaking the running game.
     */
    public String towerAim(TowerType type, String facingArt) {
        String cacheKey = "aim:" + type.name() + ":" + facingArt;
        String key = cache.get(cacheKey);
        if (key == null) {
            // Resolve the tower key before mutating the aim cache. Calling tower(type) from a
            // HashMap.computeIfAbsent callback recursively modified the same map and crashed the
            // first live GAME render with ConcurrentModificationException.
            String towerKey = tower(type);
            String candidate = towerKey + "_aim_" + facingArt;
            if (atlas.has(candidate)) key = candidate;
            else {
                String east = towerKey + "_aim_e";       // partial sets still aim, just coarsely
                key = atlas.has(east) ? east : "";
            }
            cache.put(cacheKey, key);
        }
        return key.isEmpty() ? null : key;
    }

    /** True when this tower has been re-authored with the 5-facing aim set. */
    public boolean hasAimSet(TowerType type) {
        return towerAim(type, "e") != null;
    }

    /** The flying drone/bomber unit launched by a Goblin platform tower. */
    public String droneUnit(TowerType type, boolean attacking) {
        String base = tower(type);
        if (attacking && atlas.has(base + "_unit_attack")) return base + "_unit_attack";
        if (atlas.has(base + "_unit")) return base + "_unit";
        return base;
    }

    private String troopStem(HeroType type) {
        String stem = type.name().toLowerCase();
        if (stem.startsWith("boss_")) stem = stem.substring(5);
        if (stem.equals("the_king")) return "king";
        if (stem.equals("demon_shadow_king")) return "shadow_king";
        return stem;
    }

    /** Resolve {@code troop_<stem>_<state>}, falling back across states then to idle. */
    public String troop(HeroType type, String preferredState) {
        String base = "troop_" + troopStem(type);
        String[] order = {preferredState, "walk", "idle", "fly", "ability", "death"};
        for (String s : order) {
            if (s != null && atlas.has(base + "_" + s)) return base + "_" + s;
        }
        return base + "_idle";
    }

    private static final String[] TROOP_STATES = {"idle", "walk", "fly", "ability", "carry", "death"};

    /** Every authored animation state for a troop (idle/walk/fly/ability/carry/death) that exists. */
    public java.util.List<String> troopStates(HeroType type) {
        String base = "troop_" + troopStem(type);
        java.util.List<String> out = new java.util.ArrayList<>();
        for (String s : TROOP_STATES) {
            if (atlas.has(base + "_" + s)) out.add(base + "_" + s);
        }
        if (out.isEmpty()) out.add(base + "_idle");
        return out;
    }

    public String gemPickup(GemType type) {
        return "gem_" + gemTone(type) + "_pickup";
    }

    /** The top-down campaign map sprite for world (0-based) / level (0-based). */
    public String map(int worldIndex, int levelIndex) {
        return cache.computeIfAbsent("map:" + worldIndex + ":" + levelIndex,
                k -> firstWithPrefix("map_w" + (worldIndex + 1) + "_l" + (levelIndex + 1) + "_"));
    }

    private static final String[] WORLD_SLUG =
            {"grasslands", "mountains", "sand", "gardens", "shadow"};

    /** The level-select node sprite for world (0-based) / level (0-based). */
    public String node(int worldIndex, int levelIndex) {
        String slug = WORLD_SLUG[Math.max(0, Math.min(WORLD_SLUG.length - 1, worldIndex))];
        return "node_" + slug + "_l" + (levelIndex + 1);
    }

    public String building(BuildingType type) {
        return cache.computeIfAbsent("bld:" + type.name(), k -> {
            switch (type) {
                case GEM_CAVE: return "bld_gem_cave";
                case VILLAGE: return "bld_grass_village";
                case CASTLE: return "bld_grass_castle";
                case TAVERN: return "bld_mountain_tavern";
                case HOLY_CITADEL: return "bld_mountain_citadel";
                case PALM_SPRING: return "bld_sand_palm_spring";
                case DESERT_STRONGHOLD: return "bld_sand_stronghold";
                case KINGS_LABORATORY: return "bld_garden_laboratory";
                case KINGS_POWER_STATION: return "bld_garden_power_station";
                case CURSED_PORTAL: return "bld_shadow_cursed_portal";
                case SHADOW_POOL: return "bld_shadow_pool";
                default: return "bld_gem_cave";
            }
        });
    }

    private Map<TowerType, String> projByTower;

    /**
     * The travelling projectile sprite for a tower. There are exactly 48 towers and 48 authored
     * projectiles, so we assign them <b>bijectively</b>: within each faction, towers (enum order)
     * greedily claim their best token-matching unused projectile. Every projectile gets used, and
     * each tower keeps a semantically close bolt.
     */
    public String projectile(TowerType type) {
        if (projByTower == null) buildProjectileMap();
        return projByTower.getOrDefault(type, firstWithPrefix("proj_" + factionWord(type.faction) + "_"));
    }

    private void buildProjectileMap() {
        projByTower = new HashMap<>();
        java.util.Set<String> claimed = new java.util.HashSet<>();
        for (TowerType type : TowerType.values()) {
            String fw = factionWord(type.faction);
            String stem = type.projectileAssetKey;
            if (stem.startsWith("projectile_")) stem = stem.substring("projectile_".length());
            String[] tokens = stem.split("_");
            String best = null;
            int bestScore = -1;
            for (String key : atlas.keySet()) {
                if (!key.startsWith("proj_" + fw + "_") || claimed.contains(key)) continue;
                int score = 0;
                for (String t : tokens) if (t.length() > 0 && key.contains(t)) score++;
                if (key.endsWith("_ii") && type.tier >= 6) score++;          // upgraded look for top tier
                if (score > bestScore || (score == bestScore && best != null && key.compareTo(best) < 0)) {
                    bestScore = score;
                    best = key;
                }
            }
            if (best == null) best = firstWithPrefix("proj_" + fw + "_");
            if (best != null) { projByTower.put(type, best); claimed.add(best); }
        }
    }

    // --- terrain ------------------------------------------------------------

    public String terrainTile(TerrainType t) {
        switch (t) {
            case GRASS_BASE: case GRASS_OAK: return "tile_grass_base";
            case GRASS_PATH: return "tile_grass_path";
            case MOUNTAIN_BASE: case MOUNTAIN_PINE: return "tile_mountain_base";
            case MOUNTAIN_PATH: return "tile_mountain_path";
            case FROZEN_RIVER: return "tile_mountain_frozen_river";
            case SAND_BASE: return "tile_sand_base";
            case SAND_PATH: return "tile_sand_path";
            case OASIS_WATER: return "tile_sand_oasis_water";
            case GARDEN_BASE: return "tile_garden_lawn";
            case GARDEN_PATH: return "tile_garden_path";
            case GARDEN_CANAL: return "tile_garden_canal";
            case SHADOW_BASE: return "tile_shadow_base";
            case SHADOW_PATH: return "tile_shadow_path";
            case CURSED_WATERWAY: return "tile_shadow_cursed_water";
            default: return "tile_grass_base";
        }
    }

    /**
     * Decoration tiles scattered on non-path base cells, per world (0-based).
     *
     * <p>The hand-authored {@code *_to_*} transition tiles that used to appear in these lists
     * are gone. Scattering a transition tile at random over open ground was the pre-D-19 way of
     * faking variety, and it put half-a-road and half-a-riverbank in the middle of fields.
     * Transitions are now generated by {@link io.github.some_example_name.game.TileResolver}
     * from the actual tile roles, so these lists hold only things that are genuinely decorative.
     */
    public static final String[][] DECOR_TILES = {
        // grasslands also hosts the lush jungle variants (green reads naturally here)
        {"tile_grass_clover", "tile_grass_fern", "tile_grass_flowers", "tile_grass_tall",
         "tile_grass_base_alt", "tile_jungle_base", "tile_jungle_mud"},
        {"tile_mountain_base_alt", "tile_mountain_ice", "tile_mountain_glacier",
         "tile_mountain_drift"},
        // sand keeps only warm desert tones — no green clashers
        {"tile_sand_base_alt", "tile_orange_dune_base", "tile_orange_dune_ridge",
         "tile_orange_dune_rock", "tile_orange_dune_base_alt"},
        {"tile_garden_flowerbed", "tile_garden_hedge", "tile_garden_parterre",
         "tile_garden_gearworks"},
        {"tile_shadow_base_alt", "tile_shadow_ash", "tile_shadow_hexwood"},
    };

    /** Obstacle tree/bush sprites per world (0-based). */
    public static final String[][] OBSTACLE_TREES = {
        {"obstacle_tree_oak", "obstacle_tree_birch", "obstacle_bush_bramble"},
        {"obstacle_tree_pine", "obstacle_tree_willow"},
        {"obstacle_tree_palm", "obstacle_tree_jungle_giant"},
        {"obstacle_tree_blossom", "obstacle_tree_willow"},
        {"obstacle_tree_hexwood", "obstacle_tree_ashwood"},
    };

    // --- effects ------------------------------------------------------------

    /** Overlay FX for an active status, or null if it has no visual. */
    public String statusFx(StatusType s) {
        switch (s) {
            case BURN: return "fx_burn";
            case FREEZE: return "fx_freeze";
            case STUN: return "fx_stun_overlay";
            case FEAR: return "fx_darkness_cloud";
            case SLOW: return "fx_freeze";
            case CURSE: return "fx_death_leech";
            default: return null;
        }
    }

    /** Status icon (HUD/almanac). */
    public String statusIcon(StatusType s) {
        switch (s) {
            case BURN: return "icon_burning";
            case FREEZE: return "icon_freeze";
            case STUN: return "icon_stunned";
            case FEAR: return "icon_feared";
            case SLOW: return "icon_slowed";
            case CURSE: return "icon_cursed";
            default: return "icon_curse";
        }
    }

    public String damageIcon(io.github.some_example_name.game.DamageType d) {
        switch (d) {
            case PHYSICAL: return "icon_physical";
            case FIRE: return "icon_fire";
            case FROST: return "icon_frost";
            case LIGHTNING: return "icon_lightning";
            case CURSE: return "icon_curse";
            default: return "icon_magic";
        }
    }

    private String gemTone(GemType type) {
        switch (type) {
            case EMERALD: return "emerald";
            case SAPPHIRE: return "sapphire";
            case YELLOW_TOPAZ: return "topaz";
            case AMETHYST: return "amethyst";
            case RUBY:
            default: return "ruby";
        }
    }

    public String gem(GemType type, boolean carried) {
        return "gem_" + gemTone(type) + (carried ? "_carried" : "_idle");
    }
}
