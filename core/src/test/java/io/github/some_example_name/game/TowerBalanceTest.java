package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import com.badlogic.gdx.math.Vector2;
import java.util.EnumMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** Quantitative guardrails for the complete 48-tower balance matrix. */
class TowerBalanceTest {

    @Test
    void completeRosterHasTwelveTowersPerFactionAndEveryTier() {
        assertEquals(48, TowerType.values().length);
        Map<Faction, Integer> factionCount = new EnumMap<>(Faction.class);
        for (TowerType tower : TowerType.values()) {
            factionCount.merge(tower.faction, 1, Integer::sum);
            assertTrue(tower.tier >= 1 && tower.tier <= 6);
            assertTrue(tower.damage > 0f && tower.fireInterval > 0f && tower.range > 0f);
        }
        for (Faction faction : Faction.values()) {
            assertEquals(12, factionCount.getOrDefault(faction, 0));
            for (int tier = 1; tier <= 6; tier++) {
                int wanted = tier;
                assertTrue(java.util.Arrays.stream(TowerType.values())
                        .anyMatch(t -> t.faction == faction && t.tier == wanted));
            }
        }
    }

    @Test
    void valueCurveRewardsEveryUpgradeWithoutCreatingABestBranch() {
        for (TowerType tower : TowerType.values()) {
            float value = utilityNormalizedDps(tower);
            float efficiency = value / tower.cost;
            assertTrue(efficiency >= 0.35f && efficiency <= 0.82f,
                    tower + " escaped the DPS-per-cost band: " + efficiency);
            if (tower.parent() != null) {
                float parent = utilityNormalizedDps(tower.parent());
                assertTrue(value >= parent * 1.25f,
                        tower + " upgrade has insufficient power growth over " + tower.parent());
                assertTrue(efficiency >= utilityNormalizedDps(tower.parent())
                                / tower.parent().cost * 0.96f,
                        tower + " loses too much value-per-gold when upgraded");
            }
        }

        for (Faction faction : Faction.values()) {
            for (int tier = 3; tier <= 6; tier++) {
                float min = Float.MAX_VALUE, max = 0f;
                for (TowerType tower : TowerType.values()) {
                    if (tower.faction != faction || tower.tier != tier) continue;
                    float value = utilityNormalizedDps(tower);
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                }
                assertTrue(max / min <= 1.10f,
                        faction + " tier " + tier + " has a dominant branch: " + max / min);
            }
        }
    }

    @Test
    void earlyTowersAreMateriallyStrongAndFactionRangesRemainDistinct() {
        for (TowerType root : new TowerType[] {TowerType.ORC_WATCHPOST, TowerType.CRYPT,
                TowerType.IMP_BRAZIER, TowerType.GOBLIN_WORKSHOP}) {
            assertTrue(root.damage / root.fireInterval >= 28f,
                    root + " must clear the stronger opening-DPS floor");
            assertTrue(root.range >= 130f, root + " opening range is too restrictive");
        }
        assertTrue(TowerType.CRYPT.range > TowerType.ORC_WATCHPOST.range);
        assertTrue(TowerType.IMP_BRAZIER.range < TowerType.ORC_WATCHPOST.range);
        assertTrue(TowerType.GOBLIN_WORKSHOP.attacksPerSecond()
                > TowerType.ORC_WATCHPOST.attacksPerSecond());
    }

    @Test
    void reportedRatesMatchRuntimeCyclesAndDroneGrowthIsBounded() {
        assertEquals(1f / (TowerType.CRYPT.fireInterval * 1.7f),
                TowerType.CRYPT.attacksPerSecond(), 0.0001f);
        assertEquals(1f / (TowerType.BOMBER_DRONE.fireInterval * 1.9f),
                TowerType.BOMBER_DRONE.attacksPerSecond(), 0.0001f);
        assertEquals(0f, TowerType.HELLBEAM.attacksPerSecond());
        assertEquals(0f, TowerType.HELLFIRE_PYRE.attacksPerSecond());
        assertTrue(TowerType.HELLBEAM.sustainedSingleTargetDps() > 0f);
        assertTrue(TowerType.HELLFIRE_PYRE.sustainedSingleTargetDps() > 0f);

        TowerType[] line = {TowerType.DRONE_BAY, TowerType.DRONE_SWARM,
                TowerType.DRONE_FOUNDRY, TowerType.SKY_CARRIER};
        for (int i = 1; i < line.length; i++) {
            float growth = line[i].sustainedSingleTargetDps()
                    / line[i - 1].sustainedSingleTargetDps();
            assertTrue(growth >= 1.05f && growth <= 1.40f,
                    line[i] + " drone primary-DPS growth is nonlinear: " + growth);
        }
        for (TowerType drone : line) {
            assertTrue(drone.crowdDpsPotential() / drone.cost <= 0.55f,
                    drone + " crowd budget dominates its price band");
        }
    }

    @Test
    void fixedDurationRuntimeSamplesTrackTheirPublishedFamilyBudgets() {
        TowerType[] families = {TowerType.BALLISTA, TowerType.CATAPULT,
                TowerType.LIGHTNING_CRYPT_I, TowerType.TERROR_CRYPT_I,
                TowerType.ABYSSAL_RAY, TowerType.LAKE_OF_FIRE, TowerType.DRONE_FOUNDRY};
        for (TowerType type : families) {
            float actual = stationaryCrowdDamage(type, 10f);
            float published = type.crowdDpsPotential() * 10f;
            float ratio = actual / published;
            assertTrue(ratio >= 0.45f && ratio <= 1.60f,
                    type + " runtime/published budget drifted: " + ratio);
        }
        assertTrue(movingLaneDamage(TowerType.BOMBER_DRONE, 10f) > 0f,
                "bomber fixture must connect during a real moving sortie");
        assertTrue(movingLaneDamage(TowerType.CARPET_BOMBER, 10f) > 0f,
                "carpet bomber fixture must connect during a real moving sortie");
    }

    @Test
    void economyAffordsOpeningsAndRefundsCannotCreateGold() {
        assertEquals(8, WavePlan.startingGold(0, 0) / TowerType.ORC_WATCHPOST.cost);
        assertEquals(7, WavePlan.startingGold(4, 4) / TowerType.ORC_WATCHPOST.cost);
        for (int world = 0; world < 5; world++) {
            for (int level = 0; level < 5; level++) {
                int gold = WavePlan.startingGold(world, level);
                assertTrue(gold / TowerType.ORC_WATCHPOST.cost >= 6,
                        "every map must afford at least six roots");
                assertTrue(gold >= TowerType.BALLISTA.cost,
                        "every map must afford one focused T4 opening");
            }
        }
        for (TowerType tower : TowerType.values()) {
            float refund = tower.sellValue() / (float) tower.cost;
            assertTrue(refund >= 0.62f && refund <= 0.68f,
                    tower + " refund escaped the intended switching penalty: " + refund);
        }
    }

    @Test
    void everyTowerCanDamageARealEnemyAndDronesCompleteFiniteSorties() {
        for (TowerType type : TowerType.values()) {
            World world = new World();
            Hero hero = world.spawnHero(HeroType.BOSS_GENERAL);
            Tower tower = world.buildTower(type, hero.pos.x + 10f, hero.pos.y + 10f);
            float initial = hero.hp;
            for (int i = 0; i < 240 && hero.hp == initial; i++) world.update(0.05f);
            assertTrue(hero.hp < initial, type + " never dealt damage");
        }

        World world = new World();
        Hero target = world.spawnHero(HeroType.BOSS_GENERAL);
        target.pos.set(300f, 300f);
        DroneActor drone = new DroneActor(new Tower(TowerType.DRONE_SWARM, 300f, 300f), target);
        for (int i = 0; i < 400 && drone.state != DroneActor.State.DONE; i++)
            drone.update(world, 0.05f);
        assertEquals(DroneActor.State.DONE, drone.state,
                "a drone must return instead of scaling without bound for the whole wave");
    }

    @Test
    void representativeFourFactionOpeningClearsTheFirstCampaignSchedule() {
        BlueprintLevel level = BlueprintLevel.fromText(LevelMaps.build(0, 0).toText());
        World world = new World(level.map, AssetCatalog.createDefault());
        TowerType[] loadout = {TowerType.BOLT_THROWER, TowerType.CRYPT_II,
                TowerType.HELLFORGE, TowerType.TINKER_TOWER};
        int spend = 0;
        java.util.List<Vector2> path = world.map.groundPath();
        for (int i = 0; i < loadout.length; i++) {
            Vector2 p = path.get((i + 1) * (path.size() - 1) / (loadout.length + 1));
            world.buildTower(loadout[i], p.x + (i % 2 == 0 ? 48f : -48f), p.y + 48f);
            spend += loadout[i].cost;
        }
        assertTrue(spend <= WavePlan.startingGold(0, 0), "reference opening exceeds its budget");

        for (int wave = 0; wave < WavePlan.waveCount(0); wave++) {
            world.waveSpawner.start(WavePlan.wave(0, 0, wave));
            assertTrue(runWave(world, 240f), "reference opening timed out on wave " + wave);
            assertTrue(world.heroes.isEmpty(), "reference opening leaked wave " + wave);
        }
    }

    @Test
    void budgetedMixedDefencesRemainViableAcrossTheCampaignCurve() {
        for (int[] campaign : new int[][] {{0, 0}, {2, 2}, {4, 4}}) {
            int worldIndex = campaign[0], levelIndex = campaign[1];
            BlueprintLevel level = BlueprintLevel.fromText(
                    LevelMaps.build(worldIndex, levelIndex).toText());
            World world = new World(level.map, AssetCatalog.createDefault());
            world.gold = WavePlan.startingGold(worldIndex, levelIndex);
            TowerType[] loadout = {TowerType.BOLT_THROWER, TowerType.CRYPT_II,
                    TowerType.HELLFORGE, TowerType.TINKER_TOWER};
            java.util.List<Vector2> path = world.map.groundPath();
            for (int i = 0; i < loadout.length; i++) {
                Vector2 p = path.get((i + 1) * (path.size() - 1) / (loadout.length + 1));
                world.buildTower(loadout[i], p.x + (i % 2 == 0 ? 44f : -44f), p.y + 44f);
                world.gold -= loadout[i].cost;
            }
            assertTrue(world.gold >= 0, "fixture exceeded starting gold");

            for (int wave = 0; wave < WavePlan.waveCount(levelIndex); wave++) {
                upgradeMixedLoadoutFromIncome(world);
                world.waveSpawner.start(WavePlan.wave(worldIndex, levelIndex, wave));
                assertTrue(runWave(world, 300f), "budget defence timed out on w"
                        + (worldIndex + 1) + "_l" + (levelIndex + 1) + " wave " + wave);
            }
            long retained = world.gems.stream().filter(g -> g.state != Gem.State.LOST).count();
            assertTrue(retained >= 1, "budget defence lost every gem on w" + (worldIndex + 1)
                    + "_l" + (levelIndex + 1));
        }
    }

    private void upgradeMixedLoadoutFromIncome(World world) {
        TowerType[][] lines = {
                {TowerType.BOLT_THROWER, TowerType.CROSSBOW_NEST, TowerType.BALLISTA,
                        TowerType.HARPOON_CANNON, TowerType.DREAD_HARPOON},
                {TowerType.CRYPT_II, TowerType.FROST_CRYPT_I, TowerType.FROST_CRYPT_II,
                        TowerType.LIGHTNING_CRYPT_I, TowerType.LIGHTNING_CRYPT_II},
                {TowerType.HELLFORGE, TowerType.HELLBEAM, TowerType.SEARING_LANCE,
                        TowerType.ABYSSAL_RAY, TowerType.DOOMRAY},
                {TowerType.TINKER_TOWER, TowerType.GATLING_TURRET, TowerType.SPIKE_CANNON,
                        TowerType.AUGER_CANNON, TowerType.DOOM_DRILLER}
        };
        boolean bought;
        do {
            bought = false;
            for (int i = 0; i < world.towers.size(); i++) {
                Tower current = world.towers.get(i);
                int step = java.util.Arrays.asList(lines[i]).indexOf(current.type);
                if (step < 0 || step + 1 >= lines[i].length) continue;
                TowerType next = lines[i][step + 1];
                if (world.gold < next.upgradeCost()) continue;
                world.gold -= next.upgradeCost();
                world.towers.set(i, new Tower(next, current.pos.x, current.pos.y));
                bought = true;
            }
        } while (bought);
    }

    /** Removes pattern premiums and returns comparable, sustained single-target budget. */
    private float utilityNormalizedDps(TowerType tower) {
        float dps;
        if (tower.pattern == AttackPattern.BEAM) {
            dps = tower.damage * 1.10f / 0.92f;
        } else if (tower.faction == Faction.DEMON && tower.pattern == AttackPattern.NOVA) {
            dps = tower.damage * 0.55f / 0.82f;
        } else {
            dps = tower.damage / tower.fireInterval;
            switch (tower.pattern) {
                case LOB: dps /= 0.80f; break;
                case NOVA: dps /= 0.70f; break;
                case CHAIN: dps /= 0.62f; break;
                case DRONE: dps /= droneDamageShare(tower); break;
                case BOMBER: dps /= 0.42f; break;
                default: break;
            }
            if (tower.faction == Faction.CRYPT) dps /= 1.70f;
        }
        return dps;
    }

    private float droneDamageShare(TowerType tower) {
        if (tower == TowerType.DRONE_SWARM) return 0.35f;
        if (tower == TowerType.DRONE_FOUNDRY) return 0.29f;
        if (tower == TowerType.SKY_CARRIER) return 0.25f;
        return 0.50f;
    }

    private float stationaryCrowdDamage(TowerType type, float seconds) {
        World world = new World();
        float initial = 0f;
        for (int i = 0; i < 4; i++) {
            Hero hero = world.spawnHero(HeroType.PEASANT);
            hero.pos.set(320f + i * 3f, 320f + i * 2f);
            hero.maxHp = hero.hp = 1_000_000f;
            initial += hero.hp;
        }
        Tower tower = world.buildTower(type, 330f, 330f);
        for (float elapsed = 0f; elapsed < seconds; elapsed += 0.05f) {
            tower.update(world, 0.05f);
            for (DroneActor drone : new java.util.ArrayList<>(world.drones))
                drone.update(world, 0.05f);
            world.drones.removeIf(drone -> drone.state == DroneActor.State.DONE);
        }
        float remaining = 0f;
        for (Hero hero : world.heroes) remaining += hero.hp;
        return initial - remaining;
    }

    private float movingLaneDamage(TowerType type, float seconds) {
        World world = new World();
        Hero hero = world.spawnHero(HeroType.PEASANT);
        hero.maxHp = hero.hp = 1_000_000f;
        Tower tower = world.buildTower(type, hero.pos.x + 12f, hero.pos.y + 12f);
        float initial = hero.hp;
        for (float elapsed = 0f; elapsed < seconds && hero.isAlive(); elapsed += 0.05f)
            world.update(0.05f);
        return initial - hero.hp;
    }

    private boolean runWave(World world, float cap) {
        float elapsed = 0f;
        while (elapsed < cap && (!world.waveSpawner.isDone() || !world.heroes.isEmpty())) {
            world.update(0.05f);
            world.heroes.removeIf(hero -> !hero.isAlive());
            elapsed += 0.05f;
        }
        return world.waveSpawner.isDone() && world.heroes.isEmpty();
    }
}
