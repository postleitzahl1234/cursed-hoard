package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/** End-to-end checks on the headless sim: waves, status stacking, slow, and tower combat. */
class GameSystemsTest {
    @Test
    void freshWorldHasTheLockedFiveGemHoard() {
        assertEquals(5, World.GEM_COUNT);
        assertEquals(World.GEM_COUNT, new World().gems.size());
    }

    @Test
    void waveSpawnerCountsWavesAndCompletes() {
        World world = new World();
        assertEquals(0, world.waveSpawner.waveIndex());
        world.waveSpawner.start(new Wave().add(HeroType.PEASANT, 3, 0.2f));
        assertEquals(1, world.waveSpawner.waveIndex());
        assertFalse(world.waveSpawner.isDone());

        world.update(0.05f);                       // first spawn fires immediately
        assertFalse(world.heroes.isEmpty(), "wave should spawn a hero");

        for (int i = 0; i < 200 && !world.waveSpawner.isDone(); i++) world.update(0.1f);
        assertTrue(world.waveSpawner.isDone(), "wave should drain");

        world.waveSpawner.start(new Wave().add(HeroType.GUARD, 1, 0.1f));
        assertEquals(2, world.waveSpawner.waveIndex(), "second wave increments the counter");
    }

    @Test
    void freezeIsADistinctStatusFromStunAndSlow() {
        Hero hero = new Hero(HeroType.PEASANT, new GameMap().groundPath());
        hero.applyStatus(new StatusApplication(StatusType.FREEZE, 1f, 3f));
        assertTrue(hero.statusController.isStatusActive(StatusType.FREEZE));
        assertFalse(hero.statusController.isStatusActive(StatusType.STUN));
    }

    @Test
    void slowReducesMovementMultiplier() {
        Hero hero = new Hero(HeroType.PEASANT, new GameMap().groundPath());
        assertEquals(1f, hero.statusController.getSlowMultiplier(), 0.001f);
        hero.applyStatus(new StatusApplication(StatusType.SLOW, 0.5f, 3f));
        assertTrue(hero.statusController.getSlowMultiplier() < 1f, "slow should cut speed");
    }

    @Test
    void towerDamagesEnemyInRange() {
        World world = new World();
        Hero peasant = world.spawnHero(HeroType.PEASANT);
        Tower tower = world.buildTower(TowerType.ORC_WATCHPOST, peasant.pos.x, peasant.pos.y);
        tower.cooldown = 0f;
        float before = peasant.hp;
        world.update(0.16f);
        assertTrue(peasant.hp < before, "tower in range should deal damage");
    }

    @Test
    void fireImmuneEnemyShrugsOffFireAndBurn() {
        Hero ash = new Hero(HeroType.ASH_WALKER, new GameMap().groundPath());
        ash.damage(new DamagePacket(80f, DamageType.FIRE));
        assertEquals(ash.maxHp, ash.hp, 0.001f);
        ash.applyStatus(new StatusApplication(StatusType.BURN, 8f, 4f));
        assertFalse(ash.statusController.isStatusActive(StatusType.BURN));
    }

    @Test
    void starRatingDistinguishesUntouchedReturnedAndLostGems() {
        World world = new World();
        assertEquals(3, world.starRating());

        world.gemEverTouched = true;
        assertEquals(2, world.starRating(), "a returned gem still prevents a flawless clear");

        world.gems.get(0).state = Gem.State.LOST;
        assertEquals(1, world.starRating());
        for (Gem gem : world.gems) gem.state = Gem.State.LOST;
        assertEquals(0, world.starRating());
    }
}
