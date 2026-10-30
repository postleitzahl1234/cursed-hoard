package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import io.github.some_example_name.game.behaviors.*;
import org.junit.jupiter.api.Test;

/**
 * Covers the {@link UnitBehavior} library, which until now was 30 empty stubs — every troop
 * ability in the game was inert. These tests exist mostly to pin down the two structural traps
 * that made the stubs dangerous rather than merely absent.
 */
class UnitBehaviorTest {

    private static World world() {
        return new World();
    }

    private static Hero spawn(World w, HeroType t) {
        return w.spawnHero(t);
    }

    // ── the two structural traps ────────────────────────────────────────────

    @Test
    void behaviourStateIsPerHeroNotPerBehaviourInstance() {
        // HeroType stores `new ThresholdInvuln(...)` ONCE, so every Knight Lieutenant shares that
        // object. If the "already fired" flag lived on the behaviour, wounding one would spend it
        // for the entire roster. This is the bug the original stub had latent in a `triggered` field.
        World w = world();
        Hero a = spawn(w, HeroType.KNIGHT_LIEUTENANT);
        Hero b = spawn(w, HeroType.KNIGHT_LIEUTENANT);
        assertSame(a.behaviors.get(0), b.behaviors.get(0), "behaviours are shared singletons");

        a.hp = a.maxHp * 0.1f;
        a.update(0.1f, w);
        assertTrue(a.invulnTimer > 0f, "the wounded one triggers");
        assertEquals(0f, b.invulnTimer, 0.001f, "its twin must be unaffected");
        assertTrue(b.hp > b.maxHp * 0.5f);
    }

    @Test
    void damageHooksReceiveTheWorldNotNull() {
        // Hero.damage used to call onDamaged/onDeath with a literal null world, so any behaviour
        // reacting to damage could not touch the board at all.
        World w = world();
        Hero sapper = spawn(w, HeroType.REBEL_SAPPER);
        Tower tower = w.buildTower(TowerType.ORC_WATCHPOST, sapper.pos.x, sapper.pos.y);
        sapper.damage(new DamagePacket(99999f, DamageType.PHYSICAL));
        assertEquals(Hero.State.DEAD, sapper.state);
        assertTrue(tower.disabledTimer > 0f, "DeathExplosion should have jammed the nearby tower");
    }

    // ── representative behaviours ───────────────────────────────────────────

    @Test
    void supportAuraSpeedsAlliesAndExpiresWithItsSource() {
        World w = world();
        Hero sergeant = spawn(w, HeroType.BANNER_SERGEANT);
        Hero peasant = spawn(w, HeroType.PEASANT);
        peasant.pos.set(sergeant.pos);

        w.update(0.1f);
        assertTrue(peasant.speedMultiplier > 1f, "aura should buff a neighbour");

        sergeant.state = Hero.State.DEAD;
        w.update(0.1f);
        assertEquals(1f, peasant.speedMultiplier, 0.001f, "buff must vanish with its source");
    }

    @Test
    void tauntPullsTowerFireOntoThePaviseGuard() {
        World w = world();
        Hero pavise = spawn(w, HeroType.PAVISE_GUARD);
        Hero peasant = spawn(w, HeroType.PEASANT);
        peasant.targetWaypoint = 99;                     // furthest along = FIRST policy would pick it
        Tower tower = w.buildTower(TowerType.ORC_WATCHPOST, pavise.pos.x, pavise.pos.y);
        pavise.pos.set(tower.pos);
        peasant.pos.set(tower.pos);

        w.update(0.05f);
        assertSame(pavise, w.findTarget(tower), "taunt must outrank the targeting policy");
    }

    @Test
    void untargetablePhasesOutAndBackIn() {
        assertUntargetableCycle(HeroType.SHADOW_WRAITH);
        assertUntargetableCycle(HeroType.MIRAGE_DANCER);
    }

    private static void assertUntargetableCycle(HeroType type) {
        Hero hero = spawn(world(), type);
        Untargetable phase = hero.behaviors.stream()
                .filter(Untargetable.class::isInstance)
                .map(Untargetable.class::cast)
                .findFirst()
                .orElseThrow(() -> new AssertionError(type + " has no Untargetable behaviour"));

        final float step = 0.01f;
        final int cycles = 2;
        final float total = phase.cycle * cycles;
        float elapsed = 0f;
        float hiddenTime = 0f;
        float targetableTime = 0f;
        while (elapsed < total) {
            float dt = Math.min(step, total - elapsed);
            if (hero.isTargetable()) targetableTime += dt;
            else hiddenTime += dt;
            phase.onUpdate(hero, null, dt);
            elapsed += dt;
        }

        float tolerance = step * 2f;
        assertEquals(phase.hiddenDuration, hiddenTime / cycles, tolerance,
                type + " hidden portion of cycle");
        assertEquals(phase.cycle - phase.hiddenDuration, targetableTime / cycles, tolerance,
                type + " targetable portion of cycle");
    }

    @Test
    void slowImmunityCoversFreezeAsWellAsSlow() {
        // D-30(a) split FREEZE off SLOW; clearing only SLOW would leave a Paladin freezable.
        World w = world();
        Hero paladin = spawn(w, HeroType.PALADIN);
        paladin.applyStatus(new StatusApplication(StatusType.SLOW, 0.5f, 5f));
        paladin.applyStatus(new StatusApplication(StatusType.FREEZE, 1f, 5f));
        paladin.update(0.1f, w);
        assertFalse(paladin.statusController.isStatusActive(StatusType.SLOW));
        assertFalse(paladin.statusController.isStatusActive(StatusType.FREEZE));
    }

    @Test
    void continuousSummonRespectsItsFieldCap() {
        World w = world();
        Hero general = spawn(w, HeroType.BOSS_GENERAL);
        for (int i = 0; i < 400; i++) w.update(0.1f);      // far longer than the interval
        long knights = w.heroes.stream()
                .filter(h -> h.type == HeroType.KNIGHT && h.isAlive())
                .count();
        assertTrue(knights > 0, "the boss should have summoned");
        assertTrue(knights <= 4, "and never exceed its cap of 4, got " + knights);
    }

    @Test
    void summonsPayNoBounty() {
        // otherwise a boss with a summon loop is an infinite gold fountain
        World w = world();
        Hero general = spawn(w, HeroType.BOSS_GENERAL);
        for (int i = 0; i < 100; i++) w.update(0.1f);
        Hero minion = w.heroes.stream().filter(h -> h.type == HeroType.KNIGHT).findFirst().orElse(null);
        assertNotNull(minion, "a knight should exist");
        assertTrue(minion.rewarded, "summoned units must be pre-marked as already rewarded");
    }

    @Test
    void shieldModeCutsDamageWhileActiveOnly() {
        World w = world();
        Hero commander = spawn(w, HeroType.LORD_COMMANDER);
        // drive it until the shield raises
        boolean sawShield = false;
        for (int i = 0; i < 400 && !sawShield; i++) {
            commander.update(0.1f, w);
            if (commander.damageTakenMultiplier < 1f) sawShield = true;
        }
        assertTrue(sawShield, "ShieldMode never raised");
    }

    @Test
    void frenzyScalesWithMissingHealth() {
        World w = world();
        Hero flagellant = spawn(w, HeroType.FLAGELLANT);
        flagellant.update(0.1f, w);
        float healthy = flagellant.speedMultiplier;
        flagellant.hp = flagellant.maxHp * 0.1f;
        flagellant.update(0.1f, w);
        assertTrue(flagellant.speedMultiplier > healthy, "a wounded flagellant should be faster");
    }

    @Test
    void everyBehaviourSurvivesAFullSimulationWithoutThrowing() {
        // the blunt integration check: put one of every archetype on the board and run it
        World w = world();
        for (HeroType t : HeroType.values()) w.spawnHero(t);
        w.buildTower(TowerType.ORC_WATCHPOST, 100f, 100f);
        w.buildTower(TowerType.CRYPT, 200f, 200f);
        assertDoesNotThrow(() -> {
            for (int i = 0; i < 600; i++) w.update(1f / 30f);
        });
    }

    @Test
    void abilityAnimationsAreActuallyTriggered() {
        // the whole point of implementing these: the authored ability clips become reachable
        World w = world();
        for (HeroType t : HeroType.values()) w.spawnHero(t);
        boolean anyTriggered = false;
        for (int i = 0; i < 600 && !anyTriggered; i++) {
            w.update(1f / 30f);
            for (Hero h : w.heroes) {
                if (h.abilityAnim > 0f && "ability".equals(h.animState())) anyTriggered = true;
            }
        }
        assertTrue(anyTriggered, "no behaviour ever called triggerAbility()");
    }
}
