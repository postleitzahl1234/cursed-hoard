package io.github.some_example_name.game;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public final class AssetCatalog {
    private final Map<String, AssetSpec> specs = new LinkedHashMap<>();

    public AssetCatalog register(AssetSpec spec) {
        specs.put(spec.key, spec);
        return this;
    }

    public AssetSpec resolve(String key, AssetRole fallbackRole, int width, int height) {
        AssetSpec spec = specs.get(key);
        if (spec != null) {
            return spec;
        }
        return new AssetSpec(key, fallbackRole, width, height, width / 2f, height / 2f, 1);
    }

    public boolean contains(String key) {
        return specs.containsKey(key);
    }

    public Collection<AssetSpec> allSpecs() {
        return Collections.unmodifiableCollection(specs.values());
    }

    public static AssetCatalog createDefault() {
        AssetCatalog catalog = new AssetCatalog();
        for (TowerType type : TowerType.values()) {
            catalog.register(AssetSpec.towerBase(type.baseAssetKey));
            catalog.register(AssetSpec.projectile(type.projectileAssetKey));
            // Every tower carries an aim part now, not just the Orc/Goblin gun towers — what
            // differs per faction is which part turns (barrel / rune-lantern / idol head).
            // Five authored facings; W/NW/SW are E/NE/SE mirrored at draw time (D-23).
            for (String facing : Turret.AUTHORED_FACINGS) {
                catalog.register(AssetSpec.turret(type.turretAssetKey + "_aim_" + facing));
            }
        }
        for (HeroType type : HeroType.values()) {
            catalog.register(new AssetSpec("hero_" + type.name().toLowerCase(), AssetRole.HERO, 64, 64, 32f, 16f, 4));
        }
        for (GemType type : GemType.values()) {
            catalog.register(new AssetSpec("gem_" + type.name().toLowerCase(), AssetRole.GEM, 64, 64, 32f, 16f, 4));
        }
        for (TerrainType type : TerrainType.values()) {
            catalog.register(new AssetSpec("terrain_" + type.name().toLowerCase(), AssetRole.TERRAIN, 64, 64, 32f, 32f, 1));
        }
        for (EnchantType type : EnchantType.values()) {
            catalog.register(new AssetSpec(type.assetKey, AssetRole.ENCHANT, 48, 48, 24f, 24f, 1));
            catalog.register(new AssetSpec("fx_" + type.name().toLowerCase(), AssetRole.ABILITY_FX, 192, 192, 96f, 96f, 6));
        }
        for (BuildingType type : BuildingType.values()) {
            int frames = type.capturable ? 5 : 1;
            catalog.register(new AssetSpec("building_" + type.name().toLowerCase(), AssetRole.BUILDING, 192, 192, 96f, 48f, frames));
        }
        return catalog;
    }
}
