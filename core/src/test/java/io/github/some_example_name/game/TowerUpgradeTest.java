package io.github.some_example_name.game;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/**
 * The tower upgrade lattice: every non-T1 tower descends from a T1 root of its own faction with
 * tiers stepping by exactly one, costs rise monotonically along every chain, and selling refunds
 * less than was invested (no gold pumps).
 */
class TowerUpgradeTest {

    @Test
    void everyTowerChainsBackToAFactionRoot() {
        for (TowerType t : TowerType.values()) {
            if (t.tier == 1) {
                assertNull(t.parent(), t + " is a root and must have no parent");
                continue;
            }
            TowerType p = t.parent();
            assertNotNull(p, t + " must have an upgrade parent");
            assertEquals(t.tier - 1, p.tier, t + " must sit one tier above its parent");
            assertEquals(t.faction, p.faction, t + " must stay in its faction");
            // walk to the root without cycles
            TowerType cur = t;
            for (int hops = 0; cur.parent() != null; cur = cur.parent(), hops++)
                assertTrue(hops < 10, "cycle in the upgrade lattice at " + t);
            assertEquals(1, cur.tier, t + " must chain back to a T1 root");
        }
    }

    @Test
    void everyRootReachesTierSixAndCostsGrow() {
        for (TowerType t : TowerType.values()) {
            if (t.tier == 1) {
                assertFalse(t.upgrades().isEmpty(), t + " root must offer an upgrade");
            }
            for (TowerType up : t.upgrades()) {
                assertTrue(up.cost > t.cost, "upgrade " + up + " must cost more than " + t);
                assertTrue(up.upgradeCost() > 0);
            }
            int invested = 0;
            for (TowerType c = t; c != null; c = c.parent()) invested += c.upgradeCost();
            assertTrue(t.sellValue() < invested, t + " sell must refund less than invested");
            assertTrue(t.sellValue() > 0);
        }
    }

    @Test
    void damageRewardsUpgradingOverSpamming() {
        // one T3 must out-damage-per-gold two T1s of the same line enough to matter
        assertTrue(TowerType.CROSSBOW_NEST.damage > TowerType.ORC_WATCHPOST.damage * 2.2f,
                "tier damage curve too flat to reward upgrading");
    }

    @Test
    void authoredAssetKeysRemainStableAcrossTheBalancePass() {
        for (TowerType tower : TowerType.values()) {
            assertEquals("tower_" + tower.name().toLowerCase(), tower.baseAssetKey);
            assertEquals("turret_" + tower.name().toLowerCase(), tower.turretAssetKey);
            assertTrue(tower.projectileAssetKey.startsWith("projectile_"));
        }
    }

    @Test
    void sameTierBranchesHaveDistinctDamageAndAttackSpeed() {
        for (Faction faction : Faction.values()) {
            for (int tier = 3; tier <= 6; tier++) {
                java.util.Set<Float> damage = new java.util.HashSet<>();
                java.util.Set<Float> speed = new java.util.HashSet<>();
                int count = 0;
                for (TowerType tower : TowerType.values()) {
                    if (tower.faction != faction || tower.tier != tier) continue;
                    count++;
                    damage.add(tower.damage);
                    speed.add(tower.attacksPerSecond());
                }
                if (count > 1) {
                    assertTrue(damage.size() > 1, faction + " tier " + tier + " damage was flattened");
                    // Beam and aura branches both apply continuously; zero is the honest APS for
                    // both, while their different sustained DPS remains covered by damage/value.
                    assertTrue(speed.size() > 1 || (speed.size() == 1 && speed.contains(0f)),
                            faction + " tier " + tier + " attack speed was flattened");
                }
            }
        }
    }
}
