package io.github.some_example_name.game;

import com.badlogic.gdx.math.Vector2;

public final class Tower {
    /** Crypt towers bank up to this many orbiting charges while no enemy is near. */
    public static final int MAX_CHARGES = 3;

    public final TowerType type;
    public final Vector2 pos = new Vector2();
    public final Turret turret;
    public TargetingPolicy targetingPolicy = TargetingPolicy.FIRST;
    public float cooldown;
    public float disabledTimer;
    public int charges;                 // crypt: banked shots orbiting the spire
    private float chargeTimer;
    public boolean altBarrel;           // demon T6 double mortar: alternate left/right launch
    public Hero beamTarget;             // demon beam line: the hero currently being burned
    public float overchargeTimer;
    private float beamRampTimer;
    private int shotsFired;

    public Tower(TowerType type, float x, float y) {
        this.type = type;
        this.pos.set(x, y);
        // Every tower that can pick a target gets an aim part — not just the Orc/Goblin gun
        // towers. D-23 only ever ruled on *what* turns (a barrel would be wrong on a Crypt
        // spire); it never said the other factions shouldn't face their target. Crypt swings a
        // rune-lantern, Demon turns its idol's head. Aura towers have no target, so they ship no
        // aim sprites and the renderer simply finds nothing to draw.
        this.turret = new Turret(32f, type.hasTurret ? 72f : 84f);
    }

    private boolean isBeam() {
        return type.pattern == AttackPattern.BEAM;
    }

    /** Demon nova line: a permanent fiery damage aura instead of discrete shots. */
    public boolean isAura() {
        return type.faction == Faction.DEMON && type.pattern == AttackPattern.NOVA;
    }

    private boolean isCryptCharger() {
        return type.faction == Faction.CRYPT && !isAura();
    }

    public void update(World world, float dt) {
        turret.update(dt);
        if (disabledTimer > 0f) {
            disabledTimer -= dt * world.skills.stunRecoveryMultiplier();
            beamTarget = null;
            return;
        }
        if (overchargeTimer > 0f) overchargeTimer -= dt;
        cooldown -= dt * (overchargeTimer > 0f ? world.skills.overchargeSpeedMultiplier() : 1f);
        Hero target = world.findTarget(this);
        // Crypt spires bank charges only between engagements. Accruing a banked charge alongside
        // the live-target cooldown used to produce two shots per cycle and made the displayed
        // sustained rate false; the stored volley is an opening burst, not a second reload lane.
        if (isCryptCharger() && target == null && charges < MAX_CHARGES) {
            chargeTimer += dt;
            if (chargeTimer >= type.fireInterval * 1.7f) {
                charges++;
                chargeTimer = 0f;
            }
        }
        beamTarget = isBeam() ? target : null;
        if (target == null) {
            beamRampTimer = 0f;
            return;
        }
        if (turret != null) {
            turret.aimAt(pos, target.pos);
        }
        if (isBeam()) {
            beamRampTimer += dt;
            float ramp = 1f + Math.min(1f, beamRampTimer * world.skills.beamRampPerSecond());
            target.damage(packetFor(world, target, 1.1f * dt * ramp));
            return;
        }
        if (isAura()) {
            // permanent fire aura: everything in range burns, no reload at all
            float range = effectiveRange(world.skills);
            float r2 = range * range;
            for (Hero hero : new java.util.ArrayList<>(world.heroes)) {
                if (hero.isAlive() && hero.pos.dst2(pos) <= r2) {
                    hero.damage(packetFor(world, hero, 0.55f * dt));
                }
            }
            return;
        }
        if (isCryptCharger()) {
            if (cooldown <= 0f) {
                if (charges > 0) {
                    fire(world, target);
                    charges--;
                    cooldown = 0.18f;                      // banked charges dump in rapid succession
                } else {
                    fire(world, target);
                    cooldown = type.fireInterval * 1.7f;   // dry spire: the long reload
                }
            }
            return;
        }
        if (cooldown <= 0f) {
            fire(world, target);
            altBarrel = !altBarrel;
            cooldown = type.pattern == AttackPattern.BOMBER
                    ? type.fireInterval * 1.9f             // bomber runs take longer to rearm
                    : type.fireInterval;
        }
    }

    public boolean isInRange(Hero hero) {
        return hero != null && hero.isAlive() && pos.dst2(hero.pos) <= type.range * type.range;
    }

    public boolean isInRange(Hero hero, SkillTreeBonus skills) {
        float range = effectiveRange(skills);
        return hero != null && hero.isAlive() && pos.dst2(hero.pos) <= range * range;
    }

    public float effectiveRange(SkillTreeBonus skills) {
        return type.faction == Faction.DEMON && isAura()
                ? type.range * skills.demonAuraRangeMultiplier() : type.range;
    }

    public void applyDisable(float duration) {
        disabledTimer = Math.max(disabledTimer, duration);
    }

    private void fire(World world, Hero target) {
        turret.onFire();                              // play the aim part's recoil/flash frame
        if (type.pattern == AttackPattern.DRONE || type.pattern == AttackPattern.BOMBER) {
            world.spawnDrone(this, target);
            return;
        }
        if (type.splashRadius > 0f) {
            // LOB / NOVA: area damage around the strike point
            float splash = type.splashRadius;
            if (type.faction == Faction.ORC) splash *= world.skills.orcSplashMultiplier();
            if (type.pattern == AttackPattern.BOMBER) splash *= world.skills.bombSplashMultiplier();
            float r2 = splash * splash;
            for (Hero hero : new java.util.ArrayList<>(world.heroes)) {
                if (hero.isAlive() && hero.pos.dst2(target.pos) <= r2) {
                    hero.damage(packetFor(world, hero, 1f));
                }
            }
            return;
        }
        if (type.pattern == AttackPattern.CHAIN) {
            // lightning forks: primary target plus the two nearest other heroes around it
            target.damage(packetFor(world, target, 1f));
            world.heroes.stream()
                    .filter(h -> h != target && h.isAlive() && h.pos.dst2(target.pos) <= 96f * 96f)
                    .sorted(java.util.Comparator.comparingDouble(h -> h.pos.dst2(target.pos)))
                    .limit(2 + world.skills.extraChainTargets())
                    .forEach(h -> h.damage(packetFor(world, h, 1f)));
            return;
        }
        target.damage(packetFor(world, target, 1f));
    }

    /** A fresh packet per victim (riders and execute flags are consumed on resolve). */
    public DamagePacket packetFor(World world, Hero victim, float scale) {
        float amount = type.damage * scale;
        if (type.damageType == DamageType.PHYSICAL) amount *= world.skills.physicalDamageMultiplier();
        if (victim != null && victim.type.champion) amount *= world.skills.championDamageMultiplier();
        float crit = world.skills.generalCritChance();
        if (victim != null && victim.type.mechanical) crit += world.skills.mechanicalCritChance();
        if (crit > 0f && Math.floorMod(++shotsFired * 37, 100) < Math.round(crit * 100f)) amount *= 2f;
        DamagePacket packet = new DamagePacket(amount, type.damageType);
        if (type.damageType == DamageType.FROST) {
            packet.riders.add(new StatusApplication(StatusType.SLOW,
                    0.25f + world.skills.frostSlowBonus(), 2.0f));
        } else if (type.damageType == DamageType.FIRE) {
            packet.riders.add(new StatusApplication(StatusType.BURN, Math.max(1f, type.tier), 2.5f));
            if (world.skills.curseWeakening() > 0f)
                packet.riders.add(new StatusApplication(StatusType.CURSE, world.skills.curseWeakening(), 2.5f));
        } else if (type.damageType == DamageType.CURSE) {
            packet.riders.add(new StatusApplication(StatusType.FEAR, 0.0f,
                    0.8f * world.skills.fearDurationMultiplier()));
        }
        if (type.faction == Faction.ORC && world.skills.armorShred() > 0f)
            packet.riders.add(new StatusApplication(StatusType.CURSE, world.skills.armorShred(), 2.5f));
        if ((type == TowerType.AUGER_CANNON || type == TowerType.DOOM_DRILLER)
                && world.skills.drillShredDurationBonus() > 0f)
            packet.riders.add(new StatusApplication(StatusType.CURSE, 0.16f,
                    2f + world.skills.drillShredDurationBonus()));
        return packet;
    }
}
