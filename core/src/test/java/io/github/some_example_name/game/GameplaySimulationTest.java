package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import com.badlogic.gdx.math.Vector2;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * End-to-end headless proof that the finished game loop works on the authored maps: a defended
 * level is winnable (towers on the lane kill the WavePlan schedule and the gems survive), an
 * undefended level is lost (heroes walk the authored route, reach the cave, steal every gem and
 * escape), and kills pay out gold. No GL — pure simulation at a fixed timestep.
 */
class GameplaySimulationTest {

    private World freshWorld() {
        return freshWorld(0, 0);
    }

    private World freshWorld(int worldIndex, int levelIndex) {
        BlueprintLevel lvl = BlueprintLevel.fromText(LevelMaps.build(worldIndex, levelIndex).toText());
        World world = new World(lvl.map, AssetCatalog.createDefault());
        world.buildings.add(new Building(BuildingType.GEM_CAVE, lvl.cave.x, lvl.cave.y));
        return world;
    }

    /** Run until the current wave is spawned out and the field is clear (or the cap trips). */
    private void runWave(World world, float cap) {
        float t = 0f;
        while (t < cap && (!world.waveSpawner.isDone() || !world.heroes.isEmpty())) {
            world.update(0.05f);
            world.heroes.removeIf(h -> !h.isAlive());
            t += 0.05f;
        }
    }

    @Test
    void defendedFirstLevelIsWinnable() {
        World world = freshWorld();
        List<Vector2> path = world.map.groundPath();
        for (int i = 1; i <= 8; i++) {                       // a modest mid-tier defence line
            Vector2 p = path.get(i * (path.size() - 1) / 9);
            world.buildTower(TowerType.CROSSBOW_NEST, p.x + 40f, p.y + 40f);
            world.buildTower(TowerType.FROST_CRYPT_I, p.x - 40f, p.y - 40f);
        }
        int startGold = world.gold;
        for (int w = 0; w < WavePlan.waveCount(0); w++) {
            world.waveSpawner.start(WavePlan.wave(0, 0, w));
            runWave(world, 240f);
            assertTrue(world.waveSpawner.isDone(), "wave " + w + " never finished spawning");
        }
        long survivingGems = world.gems.stream().filter(g -> g.state != Gem.State.LOST).count();
        assertTrue(survivingGems >= 1, "defended level must keep at least one gem");
        assertTrue(world.gold > startGold, "kills must pay gold (got " + world.gold + ")");
        assertTrue(world.heroes.isEmpty(), "field must be clear after the last wave");
    }

    @Test
    void undefendedLevelIsLost() {
        World world = freshWorld();
        for (int w = 0; w < WavePlan.waveCount(0) && world.gems.stream()
                .anyMatch(g -> g.state != Gem.State.LOST); w++) {
            world.waveSpawner.start(WavePlan.wave(0, 0, w));
            runWave(world, 300f);
        }
        assertTrue(world.gems.stream().allMatch(g -> g.state == Gem.State.LOST),
                "with no towers the heroes must carry off every gem");
    }

    @Test
    void lobTowersSplashAndLightningChains() {
        World world = freshWorld();
        Vector2 mid = world.map.groundPath().get(world.map.groundPath().size() / 2);
        // three heroes standing in a clump on the lane
        for (int i = 0; i < 3; i++) {
            Hero h = world.spawnHero(HeroType.PEASANT);
            h.pos.set(mid);
        }
        Tower bombard = new Tower(TowerType.BOMBARD, mid.x + 30f, mid.y + 30f);
        world.towers.add(bombard);
        world.update(0.05f);   // one tick: the bombard fires once
        long hurt = world.heroes.stream().filter(h -> h.hp < h.maxHp).count();
        assertTrue(hurt >= 3, "a lob tower must splash the whole clump, hurt=" + hurt);

        World world2 = freshWorld();
        for (int i = 0; i < 3; i++) world2.spawnHero(HeroType.PEASANT).pos.set(mid);
        world2.towers.add(new Tower(TowerType.LIGHTNING_CRYPT_I, mid.x + 30f, mid.y + 30f));
        world2.update(0.05f);
        long zapped = world2.heroes.stream().filter(h -> h.hp < h.maxHp).count();
        assertTrue(zapped >= 3, "lightning must fork to nearby heroes, zapped=" + zapped);
    }

    @Test
    void towersOnTheLaneActuallyFire() {
        World world = freshWorld();
        Vector2 mid = world.map.groundPath().get(world.map.groundPath().size() / 2);
        Tower tower = world.buildTower(TowerType.ORC_WATCHPOST, mid.x + 40f, mid.y + 40f);
        world.waveSpawner.start(new Wave().add(HeroType.PEASANT, 3, 0.4f));
        boolean fired = false;
        for (int i = 0; i < 4000 && !fired; i++) {
            float before = tower.cooldown;
            world.update(0.05f);
            fired = tower.cooldown > before + 0.01f;
        }
        assertTrue(fired, "a lane-side tower must acquire targets on the authored route");
    }

    @Test
    void introductoryDesertAndGardenSchedulesDoNotLoseTheWholeHoard() {
        for (int worldIndex : new int[] {2, 3}) {
            World world = freshWorld(worldIndex, 0);
            List<Vector2> path = world.map.groundPath();
            int built = 0;
            TowerType[] rotation = {TowerType.ORC_WATCHPOST, TowerType.CRYPT,
                    TowerType.IMP_BRAZIER, TowerType.GOBLIN_WORKSHOP};
            for (int i = 3; i < path.size() - 3 && built < 12; i += 4) {
                Vector2 p = path.get(i);
                for (int[] off : new int[][] {{0, -64}, {0, 64}, {-64, 0}, {64, 0}}) {
                    float x = p.x + off[0], y = p.y + off[1];
                    MapTile tile = world.map.tileAt((int) (x / GameMap.TILE_SIZE),
                            (int) (y / GameMap.TILE_SIZE));
                    if (tile != null && tile.role == TileRole.BASE) {
                        world.buildTower(rotation[built % rotation.length], x, y);
                        built++;
                        break;
                    }
                }
            }
            assertEquals(12, built, "fixture must build the reference defence");
            for (int wave = 0; wave < WavePlan.waveCount(0); wave++) {
                world.waveSpawner.start(WavePlan.wave(worldIndex, 0, wave));
                runWave(world, 300f);
            }
            long retained = world.gems.stream().filter(g -> g.state != Gem.State.LOST).count();
            assertTrue(retained >= 1, "w" + (worldIndex + 1) + "_l1 lost the whole hoard");
        }
    }
}
