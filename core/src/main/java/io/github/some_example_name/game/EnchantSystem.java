package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;

public final class EnchantSystem {
    public boolean cast(World world, EnchantType type, Vector2 point, Hero heroTarget, Tower towerTarget) {
        if ((type == EnchantType.METEOR || type == EnchantType.FEAR || type == EnchantType.FREEZE)
                && point == null) return false;
        if (type == EnchantType.GEM_WARD && (heroTarget == null || heroTarget.carrying == null)) return false;
        if (type == EnchantType.DARK_OVERCHARGE && towerTarget == null) return false;
        int manaCost = world.skills.enchantCost(type);
        if (world.mana < manaCost) {
            return false;
        }
        world.mana -= manaCost;
        switch (type) {
            case METEOR:
                applyPointDamage(world, point, 84f * world.skills.meteorRadiusMultiplier(),
                        new DamagePacket(140f, DamageType.FIRE));
                return true;
            case FEAR:
                applyPointStatus(world, point, 96f, new StatusApplication(StatusType.FEAR, 0f,
                        2.4f * world.skills.fearDurationMultiplier()));
                return true;
            case FREEZE:
                applyPointStatus(world, point, 84f, new StatusApplication(StatusType.FREEZE, 1f,
                        1.1f + world.skills.freezeDurationBonus()));
                return true;
            case GEM_WARD:
                return castGemWard(heroTarget);
            case CURSED_TRIBUTE:
                world.startTribute(8f + world.skills.tributeDurationBonus());
                return true;
            case DARK_OVERCHARGE:
                towerTarget.disabledTimer = 0f;
                towerTarget.cooldown = Math.min(towerTarget.cooldown, 0.1f);
                towerTarget.overchargeTimer = 4f;
                return true;
            default:
                return false;
        }
    }

    private void applyPointDamage(World world, Vector2 point, float radius, DamagePacket packet) {
        if (point == null) {
            return;
        }
        float radius2 = radius * radius;
        for (Hero hero : world.heroes) {
            if (hero.isAlive() && hero.pos.dst2(point) <= radius2) {
                hero.damage(new DamagePacket(packet.amount, packet.type, packet.riders, packet.execute));
            }
        }
    }

    private void applyPointStatus(World world, Vector2 point, float radius, StatusApplication status) {
        if (point == null) {
            return;
        }
        float radius2 = radius * radius;
        for (Hero hero : world.heroes) {
            if (hero.isAlive() && hero.pos.dst2(point) <= radius2) {
                hero.applyStatus(status);
            }
        }
    }

    private boolean castGemWard(Hero hero) {
        if (hero == null || hero.carrying == null) {
            return false;
        }
        Gem gem = hero.carrying;
        hero.carrying = null;
        gem.carrier = null;
        gem.state = Gem.State.DROPPED;
        gem.pickupBlockTimer = 3f;
        gem.pos.set(hero.pos);
        return true;
    }
}
