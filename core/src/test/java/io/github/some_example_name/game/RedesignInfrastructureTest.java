package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class RedesignInfrastructureTest {
    @Test
    void towerRosterHasFortyEightRowsAndExpectedTurretSplit() {
        assertEquals(48, TowerType.values().length);
        int turretCount = 0;
        for (TowerType type : TowerType.values()) {
            if (type.hasTurret) {
                turretCount++;
            }
        }
        assertEquals(18, turretCount);
    }

    @Test
    void fireImmuneTroopIgnoresFireDamageAndBurn() {
        Hero ashWalker = new Hero(HeroType.ASH_WALKER, new GameMap().groundPath());
        ashWalker.damage(new DamagePacket(100f, DamageType.FIRE));
        assertEquals(ashWalker.maxHp, ashWalker.hp, 0.001f);
        ashWalker.applyStatus(new StatusApplication(StatusType.BURN, 10f, 5f));
        assertFalse(ashWalker.statusController.isStatusActive(StatusType.BURN));
    }

    @Test
    void towerCanAcquireAndDamageEnemyThroughWorld() {
        World world = new World();
        Hero peasant = world.spawnHero(HeroType.PEASANT);
        Tower tower = world.buildTower(TowerType.ORC_WATCHPOST, peasant.pos.x, peasant.pos.y);
        tower.cooldown = 0f;
        world.update(0.16f);
        assertTrue(peasant.hp < peasant.maxHp);
    }

    @Test
    void gemWardDropsCarriedGemAndBlocksImmediatePickup() {
        World world = new World();
        Hero prince = world.spawnHero(HeroType.GOLDEN_PRINCE);
        Gem gem = world.takeAvailableGem();
        prince.carrying = gem;
        gem.carrier = prince;
        gem.state = Gem.State.CARRIED;

        assertTrue(new EnchantSystem().cast(world, EnchantType.GEM_WARD, null, prince, null));
        assertNull(prince.carrying);
        assertEquals(Gem.State.DROPPED, gem.state);
        assertTrue(gem.pickupBlockTimer > 0f);
    }

    @Test
    void targetedEnchantDoesNotSpendManaWithoutAValidTarget() {
        World world = new World();
        int mana = world.mana;
        assertFalse(new EnchantSystem().cast(world, EnchantType.GEM_WARD, null, null, null));
        assertEquals(mana, world.mana);
        assertFalse(new EnchantSystem().cast(world, EnchantType.DARK_OVERCHARGE, null, null, null));
        assertEquals(mana, world.mana);
    }

    @Test
    void utilizationGateDetectsOrphansAndMissingAssets() {
        AssetCatalog catalog = new AssetCatalog().register(AssetSpec.towerBase("tower_expected"));
        Set<String> delivered = new HashSet<>();
        delivered.add("orphan");
        UtilizationReport report = new UtilizationGate().check(catalog, delivered);
        assertEquals(1, report.missingConsumedAssets().size());
        assertEquals(1, report.orphanAssets().size());
    }

    @Test
    void tileResolverBuildsNeighborBitmask() {
        GameMap map = new GameMap();
        map.setTile(1, 1, new MapTile(TerrainType.GRASS_PATH, TileRole.PATH));
        map.setTile(1, 2, new MapTile(TerrainType.GRASS_PATH, TileRole.PATH));
        map.setTile(2, 1, new MapTile(TerrainType.GRASS_PATH, TileRole.PATH));
        assertEquals(3, TileResolver.mask(map, 1, 1, TileResolver.Layer.PATH));
    }

    @Test
    void waterPathfinderUsesConnectedWaterLane() {
        GameMap map = new GameMap();
        for (int x = 0; x < GameMap.WIDTH; x++) {
            map.setTile(x, 3, new MapTile(TerrainType.OASIS_WATER, TileRole.SPECIAL));
        }
        assertEquals(GameMap.WIDTH, new WaterPathfinder().route(map).size());
    }
}
